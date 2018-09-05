import base64
import json
from collections import namedtuple

import redis
from flask import Flask, request, jsonify
from werkzeug.exceptions import BadRequest, Forbidden


app = Flask(__name__)
rc = redis.StrictRedis()
Guest = namedtuple('Guest', 'count name')


@app.route('/guest-count', methods=['GET', 'POST'])
def get_count():
    guest_name, invite = get_basic(request.headers.get('Authorization'))
    success, guest = retrieve_guest(guest_name, invite)
    if not success:
        raise Forbidden()

    if request.method == 'GET':
        return jsonify(guest_count=guest.count)

    if request.method == 'POST':
        update = request.get_json()
        print(update)
        u_guest = guest._replace(count=update['count'])
        rc.hset(guest_name.lower(), invite, json.dumps(u_guest._asdict()))
        return jsonify(guest_count=u_guest.count)


def get_basic(auth_header):
    if not auth_header:
        raise BadRequest('missing Authorization header')
    return decode_auth(auth_header)


def retrieve_guest(name, invite):
    raw = rc.hget(name.lower(), invite)
    print(raw)
    if not raw:
        return False, None
    return True, Guest(**json.loads(raw.decode('utf-8')))


def pipeline(*funcs):
    def _pl(x):
        for func in funcs:
            x = func(x)
        return x
    return _pl


decode_auth = pipeline(
    lambda s: s.split(' ').pop().encode('ascii'),
    base64.decodebytes,
    lambda b: b.decode('utf-8'),
    lambda s: s.split(':'),
    tuple,
)