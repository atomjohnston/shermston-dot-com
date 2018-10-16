#!/usr/bin/env python

"""invite importer/exporter

Usage:
  invite_export.py import <file>
  invite_export.py export <file>

"""

import csv
import json

import redis
from docopt import docopt

rc = redis.StrictRedis(encoding='utf-8', decode_responses=True)


def import_(fname):
    with open(fname, 'r') as csvfile:
        reader = csv.DictReader(csvfile)
        for row in reader:
            row['names'] = [n.strip() for n in row['names'].split(',')]
            row['actual'] = int(row['actual'])
            row['max'] = int(row['max'])
            print(row)
            pipe = rc.pipeline()
            pipe.hset(row['invite'], row['surname'], json.dumps(row))
            pipe.hset(row['invite'], 'attending', row['actual'])
            pipe.sadd(row['surname'], row['invite'])
            pipe.sadd('codes', row['invite'])
            pipe.execute()


def export(fname):
    with open(fname, 'w', newline='') as csvfile:
        fieldnames = ['invite', 'surname', 'names', 'actual', 'max']
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        codes = rc.smembers('codes')
        for code in codes:
            result = rc.hgetall(code)
            print(result)
            for key in [k for k in iter(result) if not k == 'attending']:
                info = json.loads(result[key])
                info.update({'actual': result['attending'], 'names': '"' + ','.join(info['names']) + '"'})
                print(info)
                writer.writerow(info)


if __name__ == '__main__':
    opts = docopt(__doc__)
    action = (export if opts['export'] else
              import_)
    action(opts['<file>'])
