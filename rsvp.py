import functools
import hashlib
import json
import os
from enum import Enum
from collections import namedtuple
from textwrap import dedent
from uuid import uuid4

import redis
from flask import Flask, request, jsonify, Response
from werkzeug.exceptions import BadRequest, Forbidden, Unauthorized, HTTPException

Guest = namedtuple('Guest', 'actual invite names max surname')

app = Flask(__name__)
rc = redis.StrictRedis(encoding='utf-8', decode_responses=True)

session2guest = rc.register_script(dedent("""\
    local s = redis.call('get', KEYS[1])
    local x = cjson.decode(s)
    return redis.call('hget', x.invite, x.name)"""))


class InviteStatus(Enum):
    OKAY = 1
    WRONG_NAME = 2
    WRONG_INVITE = 3


def is_admin(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        sesh = request.headers.get('Session-Id')
        if sesh and json.loads(rc.get(sesh))['role'] == 'admin':
            return f(*args, **kwargs)

        if not request.authorization:
            raise Unauthorized()

        if not (hash_secret(request.authorization.password)
                    == rc.hget('users', request.authorization.username)):
            raise Unauthorized()

        return f(*args, **kwargs)
    return decorated


def hash_secret(secret):
    return hashlib.sha256(':'.join([os.environ.get('SHERMSTON_SALT'), secret]).encode('utf-8')).hexdigest()


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
        return get_rsvp(request.authorization)

    if request.method == 'POST':
        return update_rsvp(request.headers, request.get_json())
    
    raise BadRequest("yeah, I can't work with that")


@app.route('/tout-les-s-il-vous-plait', methods=['GET'])
@is_admin
def all_rsvps():
    data = get_all()
    return jsonify(
        session_id=create_and_store_session(request.authorization.username, '', 'admin'),
        responses=data)


def get_all():
    codes = rc.smembers('codes')
    pipe = rc.pipeline()
    for c in codes:
        pipe.hgetall(c)
    data = []
    for g in pipe.execute():
        data.append({
            'attending': int(g['attending']),
            'guests': [Guest(**json.loads(v))._asdict() for k, v in g.items() if not k == 'attending']
        })
    return data


@app.route('/make-it-so', methods=['POST'])
@is_admin
def admin_guest_update():
    body = request.get_json()
    code, guest = retrieve_guest(body['invite'], body['name'])
    set_guest_count(guest, body['count'])
    return jsonify(responses=get_all())


def get_rsvp(authorization):
    guest_name, invite = authorization.username.strip(), authorization.password.strip()
    i_status, guest = retrieve_guest(invite, guest_name)

    if i_status == InviteStatus.WRONG_INVITE:
        raise Unauthorized()

    if i_status == InviteStatus.WRONG_NAME:
        raise Forbidden()

    session_id = create_and_store_session(guest.surname, invite)
    response = jsonify(
        guest_count=guest.actual,
        invite_count=guest.max,
        surname=guest.surname[0].upper() + guest.surname[1:].lower(),
        session_id=session_id)
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


def create_and_store_session(name, code, role='guest'):
    session = uuid4()
    pipe = rc.pipeline()
    pipe.set(session, json.dumps({'name': name, 'invite': code, 'role': role}))
    pipe.expire(session, 3600)
    pipe.execute()
    return session


def guest_from_session_id(session_id):
    return Guest(**(json.loads(session2guest(keys=[session_id]))))


def update_rsvp(headers, body_json):
    response = jsonify(
        guest_count=set_guest_count(
            guest_from_session_id(headers.get('Session-Id')),
            body_json['count']))
    response.headers['Access-Control-Allow-Origin'] = '*'
    return response


def set_guest_count(guest, count):
    u_guest = guest._replace(actual=(count if count < guest.max else
                                     guest.max))
    pipe = rc.pipeline()
    pipe.hset(guest.invite, u_guest.surname, json.dumps(u_guest._asdict()))
    pipe.hset(guest.invite, 'attending', u_guest.actual)
    pipe.execute()
    return u_guest.actual


def retrieve_guest(invite, name):
    raw = rc.hgetall(invite)
    if len(raw) == 0:
        return InviteStatus.WRONG_INVITE, None
    try:
        return (
            InviteStatus.OKAY,
            Guest(**(json.loads(raw[name.lower()])))
        )
    except KeyError:
        return InviteStatus.WRONG_NAME, None
