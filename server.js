// Zero-dependency Node.js server: static files + JSON API. Run: npm start
const http=require('http'),fs=require('fs'),path=require('path');
const START=Date.now(), PUB=path.join(__dirname,'public');
const MIME={'.html':'text/html','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml'};
const load=()=>JSON.parse(fs.readFileSync(path.join(__dirname,'data','projects.json'),'utf8')); // re-read each call so data edits apply without restart
const json=(res,code,o)=>{res.writeHead(code,{'Content-Type':'application/json'});res.end(JSON.stringify(o))};
const count=(a,k)=>a.reduce((m,p)=>(m[p[k]]=(m[p[k]]||0)+1,m),{});
const sum=(a,k)=>a.reduce((t,p)=>t+p[k],0);
// Adoption score (0-100): weighted, max-normalised blend of stars (50%), contributors (30%), releases (20%).
function withScore(a){const mx=k=>Math.max(1,...a.map(p=>p[k]));const[s,c,r]=['stars','contributors','releases'].map(mx);
  return a.map(p=>({...p,adoption:+(100*(.5*p.stars/s+.3*p.contributors/c+.2*p.releases/r)).toFixed(1)}))}
function list(q){const{projects}=load();let a=withScore(projects);const t=(q.get('q')||'').toLowerCase();
  if(t)a=a.filter(p=>p.name.toLowerCase().includes(t));
  if(q.get('category'))a=a.filter(p=>p.category===q.get('category'));
  if(q.get('maturity'))a=a.filter(p=>p.maturity===q.get('maturity'));
  const k=['stars','contributors','releases','name','adoption'].includes(q.get('sort'))?q.get('sort'):'stars';
  const d=q.get('order')==='asc'?1:-1;
  return a.sort((x,y)=>k==='name'?d*-1*x.name.localeCompare(y.name):d*(x[k]-y[k]));}
function route(req,res){
  const u=new URL(req.url,'http://x'),p=u.pathname;
  if(p==='/api/health'){const m=process.memoryUsage();return json(res,200,{status:'ok',uptimeSec:Math.round((Date.now()-START)/1e3),memoryMB:+(m.rss/1048576).toFixed(1),node:process.version,platform:process.platform,time:new Date().toISOString()})}
  if(p==='/api/meta'){const d=load();return json(res,200,{...d.meta,count:d.projects.length,categories:[...new Set(d.projects.map(x=>x.category))].sort(),maturities:['Graduated','Incubating','Sandbox'],fileModified:fs.statSync(path.join(__dirname,'data','projects.json')).mtime.toISOString()})}
  if(p==='/api/projects')return json(res,200,list(u.searchParams));
  if(p.startsWith('/api/projects/')){const n=decodeURIComponent(p.slice(14)).toLowerCase();const f=list(new URLSearchParams()).find(x=>x.name.toLowerCase()===n);return f?json(res,200,f):json(res,404,{error:'Project not found'})}
  if(p==='/api/stats'){const a=withScore(load().projects);return json(res,200,{projects:a.length,stars:sum(a,'stars'),contributors:sum(a,'contributors'),releases:sum(a,'releases'),maturity:count(a,'maturity'),categories:count(a,'category')})}
  if(p.startsWith('/api/'))return json(res,404,{error:'Unknown endpoint'});
  const f=path.normalize(path.join(PUB,p==='/'?'index.html':p));
  if(!f.startsWith(PUB)){res.writeHead(403);return res.end('Forbidden')}
  fs.readFile(f,(e,b)=>{if(e){res.writeHead(404);return res.end('Not found')}res.writeHead(200,{'Content-Type':MIME[path.extname(f)]||'application/octet-stream'});res.end(b)});}
const server=http.createServer((req,res)=>{try{route(req,res)}catch(e){console.error(e);json(res,500,{error:'Internal server error'})}});
if(require.main===module){const P=process.env.PORT||3000;server.listen(P,()=>console.log('CNCF dashboard running at http://localhost:'+P))}
module.exports=server;
