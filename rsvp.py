import base64
import json
from enum import Enum
from collections import namedtuple
from textwrap import dedent
from uuid import uuid4

import redis
from flask import Flask, request, jsonify, Response
from werkzeug.exceptions import BadRequest, Forbidden, Unauthorized, HTTPException

Guest = namedtuple('Guest', 'actual invite names max surname')

app = Flask(__name__)
rc = redis.StrictRedis(encoding='utf-8')

session2guest = rc.register_script(dedent("""\
    local s = redis.call('get', KEYS[1])
    local x = cjson.decode(s)
    return redis.call('hget', x.invite, x.name)"""))


class InviteStatus(Enum):
    OKAY = 1
    WRONG_NAME = 2
    WRONG_INVITE = 3


@app.errorhandler(Exception)
def handle_error(e):
    code = 500
    if isinstance(e, HTTPException):
        code = e.code
    response = jsonify(error=str(e))
    response.headers['Access-Control-Allow-Origin'] = '*'
    response.status_code = code
    return response


@app.route('/guest-count', methods=['GET', 'POST', 'OPTIONS'])
def guest_count():
    if request.method == 'OPTIONS':
        return Response(headers={
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, Session-Id',
        })

    if request.method == 'GET':
        guest_name, invite = get_basic(request.headers.get('Authorization'))
        i_status, guest = retrieve_guest(invite, guest_name)

        if i_status == InviteStatus.WRONG_INVITE:
            raise Unauthorized()

        if i_status == InviteStatus.WRONG_NAME:
            raise Forbidden()

        session = uuid4()
        pipe = rc.pipeline()
        pipe.set(session, json.dumps({'name': guest_name, 'invite': invite}))
        pipe.expire(session, 3600)
        pipe.execute()
        response = jsonify(
            guest_count=guest.actual,
            invite_count=guest.max,
            surname=guest.surname[0].upper() + guest.surname[1:].lower(),
            session_id=session)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response

    if request.method == 'POST':
        guest = Guest(**(json.loads(session2guest(keys=[request.headers.get('Session-Id')]).decode('utf-8'))))
        update = request.get_json()
        u_guest = guest._replace(actual=(update['count'] if update['count'] < guest.max else
                                         guest.max))
        pipe = rc.pipeline()
        pipe.hset(guest.invite, u_guest.surname, json.dumps(u_guest._asdict()))
        pipe.hset(guest.invite, 'attending', u_guest.actual)
        pipe.execute()
        response = jsonify(guest_count=u_guest.actual)
        response.headers['Access-Control-Allow-Origin'] = '*'
        return response
    
    raise BadRequest("yeah, I can't work with that")


def get_basic(auth_header):
    if not auth_header:
        raise BadRequest('missing Authorization header')
    print(auth_header)
    return decode_auth(auth_header)


def retrieve_guest(invite, name):
    raw = rc.hgetall(invite)
    if len(raw) == 0:
        return InviteStatus.WRONG_INVITE, None
    try:
        return (
            InviteStatus.OKAY,
            Guest(**(json.loads(raw[name.lower().encode('utf-8')].decode('utf-8'))))
        )
    except KeyError:
        return InviteStatus.WRONG_NAME, None


def decode_auth(auth):
    return pipe(
        auth,
        lambda s: s.split(' ').pop().encode('ascii'),
        base64.decodebytes,
        lambda b: b.decode('utf-8'),
        lambda s: s.split(':'),
        tuple,
    )


def pipe(x, *funcs):
    for func in funcs:
        x = func(x)
    return x