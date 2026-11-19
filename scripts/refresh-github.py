"""Fetch a timestamped, public GitHub contribution snapshot. No token required."""
import json,re,urllib.request,datetime
from html.parser import HTMLParser
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
class Calendar(HTMLParser):
 def __init__(self):super().__init__();self.days={};self.tip=None;self.text=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if tag=='td' and a.get('data-date'):self.days[a['id']]={'date':a['data-date'],'level':int(a.get('data-level',0)),'count':0}
  if tag=='tool-tip':self.tip=a.get('for');self.text=[]
 def handle_data(self,s):
  if self.tip:self.text.append(s)
 def handle_endtag(self,tag):
  if tag=='tool-tip' and self.tip:
   if self.tip in self.days:
    m=re.match(r'(\d+) contribution',''.join(self.text).strip());self.days[self.tip]['count']=int(m[1]) if m else 0
   self.tip=None
url='https://github.com/users/ISHANT-AG/contributions'
raw=urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':'Ishant-Portfolio'}),timeout=30).read().decode()
p=Calendar();p.feed(raw);days=sorted(p.days.values(),key=lambda x:x['date'])
if len(days)<300:raise SystemExit('GitHub returned an incomplete calendar; keeping the previous snapshot.')
result={'username':'ISHANT-AG','source':'https://github.com/ISHANT-AG','fetchedAt':datetime.datetime.now(datetime.timezone.utc).isoformat(),'from':days[0]['date'],'to':days[-1]['date'],'total':sum(x['count'] for x in days),'days':days}
(ROOT/'public/github.json').write_text(json.dumps(result,separators=(',',':')))
print(f"Saved {len(days)} actual days, {result['total']} contributions, {result['from']} to {result['to']}.")
