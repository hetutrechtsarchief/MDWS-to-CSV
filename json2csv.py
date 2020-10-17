#!/usr/bin/env python3
import json,argparse,csv,sys,codecs
    
# sys.stdout = codecs.getwriter('utf-8-sig')(sys.stdout.buffer, 'strict')

argparser = argparse.ArgumentParser(description='JSON to CSV') 
argparser.add_argument('infile', default=sys.stdin, type=argparse.FileType('r', encoding="utf-8"), nargs='?')
argparser.add_argument('outfile', default=sys.stdout, type=argparse.FileType('w', encoding="utf-8"), nargs='?')
args = argparser.parse_args()

data = json.load(args.infile)


# collect all fieldnames found in file to use as header of the csv
headers = {}

for obj in data:
  for key in obj:
    headers[key] = 1  #(headers[key]+1) if key in headers else 1


writer = csv.DictWriter(sys.stdout, fieldnames=headers.keys(), delimiter=';', quoting=csv.QUOTE_ALL, dialect='excel')
writer.writeheader()
# for obj in data:
  # writer.writerow(dict((k, v.encode('utf-8')) for k, v in obj.iteritems()))
writer.writerows(data)
