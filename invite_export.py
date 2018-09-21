import csv
import json
import sys

import redis

rc = redis.StrictRedis()

with open(sys.argv[1]) as csvfile:
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
        pipe.execute()
