import base64
import json
from enum import Enum
from collections import namedtuple

import redis
from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest, Forbidden, Unauthorized

Guest = namedtuple('Guest', 'actual invite names max surname')

app = Flask(__name__)
rc = redis.StrictRedis(encoding='utf-8')


class InviteStatus(Enum):
    OKAY = 1
    WRONG_NAME = 2
    WRONG_INVITE = 3


@app.route('/guest-count', methods=['GET', 'POST'])
def guest_count():
    guest_name, invite = get_basic(request.headers.get('Authorization'))
    i_status, guest = retrieve_guest(invite, guest_name)

    if i_status == InviteStatus.WRONG_INVITE:
        raise Unauthorized()

    if i_status == InviteStatus.WRONG_NAME:
        raise Forbidden()

    if request.method == 'GET':
        return jsonify(guest_count=guest.actual)

    if request.method == 'POST':
        update = request.get_json()
        u_guest = guest._replace(actual=(update['count'] if update['count'] < guest.max else
                                         guest.max))
        pipe = rc.pipeline()
        pipe.hset(invite, u_guest.surname, json.dumps(u_guest._asdict()))
        pipe.hset(invite, 'attending', u_guest.actual)
        pipe.execute()
        return jsonify(guest_count=u_guest.actual)


def get_basic(auth_header):
    if not auth_header:
        raise BadRequest('missing Authorization header')
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