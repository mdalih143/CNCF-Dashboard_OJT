// API smoke tests: npm test
const assert=require('assert'),server=require('./server'),data=require('./data/projects.json').projects;
server.listen(0,async()=>{const b='http://localhost:'+server.address().port,g=async p=>(await fetch(b+p)).json();
 try{
  assert.strictEqual((await g('/api/health')).status,'ok');
  const s=await g('/api/stats');assert.strictEqual(s.projects,data.length);
  assert.strictEqual(s.stars,data.reduce((t,p)=>t+p.stars,0));
  assert.strictEqual(s.contributors,data.reduce((t,p)=>t+p.contributors,0));
  assert.strictEqual(s.releases,data.reduce((t,p)=>t+p.releases,0));
  assert.strictEqual(Object.values(s.maturity).reduce((a,c)=>a+c),data.length);
  const q=await g('/api/projects?q=kube&maturity=Incubating&sort=stars');assert(q.length&&q.every(p=>/kube/i.test(p.name)&&p.maturity==='Incubating'));
  assert(q.every((p,i)=>!i||q[i-1].stars>=p.stars));
  assert.strictEqual((await g('/api/projects/Helm')).name,'Helm');
  assert.strictEqual((await fetch(b+'/api/projects/nope')).status,404);
  assert.strictEqual((await fetch(b+'/')).status,200);assert.strictEqual((await fetch(b+'/vendor/chart.umd.js')).status,200);
  console.log('All tests passed ('+data.length+' projects)');process.exit(0)}catch(e){console.error('FAILED:',e.message);process.exit(1)}});
