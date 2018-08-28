import base64
import json

import redis
from flask import Flask, request, jsonify

app = Flask(__name__)
rc = redis.StrictRedis()


@app.route('/guest-count', methods=['GET', 'POST'])
def get_count():
    try:
        usr, passwd = get_basic(request.headers.get('Authorization').lower())
        if request.method == 'GET':
            guest = json.loads(rc.hget(usr, passwd))
            return jsonify(guest_count=guest.count)
    except Exception as e:
        pass


def get_basic(auth_header):
    if not auth_header[:13] == 'authorization':
        raise Exception(400)
    return pipe(
        auth_header,
        lambda s: s.split(' ').pop(),
        base64.decodebytes,
        lambda b: b.decode('utf-8'),
        lambda s: s.split(':'),
    )


def pipe(data, *funcs):
    for func in funcs:
        data = func(data)
    return data