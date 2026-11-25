/* Frontend: hash-routed views; every number comes from the JSON API (/api/*). */
const $ = (s) => document.querySelector(s),
  S = { q: '', category: '', maturity: '', sort: 'stars', cmp: [] },
  CH = {};
const MC = { Graduated: '#2dd4bf', Incubating: '#fbbf24', Sandbox: '#a78bfa' },
  PAL = [
    '#2dd4bf',
    '#60a5fa',
    '#fbbf24',
    '#a78bfa',
    '#f472b6',
    '#fb923c',
    '#34d399',
    '#f87171',
    '#38bdf8',
    '#c084fc',
    '#facc15',
    '#4ade80',
    '#e879f9',
    '#22d3ee',
    '#fda4af',
  ];
const n = (v) => v.toLocaleString('en-US'),
  esc = (s) =>
    String(s).replace(
      /[&<>"]/g,
      (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c],
    );
async function api(p) {
  const r = await fetch('/api/' + p);
  if (!r.ok) throw new Error(`API ${r.status} on /api/${p}`);
  return r.json();
}
const qs = () =>
  new URLSearchParams({
    q: S.q,
    category: S.category,
    maturity: S.maturity,
    sort: S.sort,
  }).toString();
const hue = (s) => {
  let h = 0;
  for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
};
const logo = (p, z = 42) =>
  `<span class="logo" style="width:${z}px;height:${z}px;background:hsl(${hue(p.name)} 70% 62%)">${esc(p.name.slice(0, 2))}</span>`;
Chart.defaults.color = '#8fa0c4';
Chart.defaults.borderColor = '#25345a';
Chart.defaults.maintainAspectRatio = false;
function mk(id, type, labels, sets, o = {}) {
  CH[id] && CH[id].destroy();
  const el = document.getElementById(id);
  if (!el) return;
  CH[id] = new Chart(el, {
    type,
    data: { labels, datasets: sets },
    options: {
      indexAxis: o.h ? 'y' : 'x',
      scales: /doughnut/.test(type)
        ? {}
        : {
            y: {
              type: o.log ? 'logarithmic' : 'linear',
              beginAtZero: !o.log,
              grid: { color: '#25345a' },
            },
            x: { grid: { display: false } },
          },
      plugins: {
        legend: { display: sets.length > 1 || /doughnut/.test(type), position: 'bottom' },
        tooltip: {
          callbacks: {
            label: (c) =>
              ` ${c.dataset.label || c.label}: ${n(c.parsed.y ?? c.parsed.x ?? c.parsed)}`,
          },
        },
      },
    },
  });
}
const ds = (label, data, color) => ({ label, data, backgroundColor: color, borderRadius: 4 });
const chartBox = (id, t) =>
  `<div class="box"><h2>${t}</h2><div class="chart"><canvas id="${id}"></canvas></div></div>`;
const err = (e) =>
  `<div class="box err">Could not load data: ${esc(e.message)}. Is the server running? <button onclick="route()">Retry</button></div>`;

function controls(meta, sort = true) {
  return `<div class="bar"><select id="fc" aria-label="Category"><option value="">All categories</option>${meta.categories.map((c) => `<option ${S.category === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
<select id="fm" aria-label="Maturity"><option value="">All maturity levels</option>${meta.maturities.map((c) => `<option ${S.maturity === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
${sort ? `<select id="fs" aria-label="Sort"><option value="stars">Sort: GitHub stars</option><option value="contributors" ${S.sort == 'contributors' ? 'selected' : ''}>Sort: contributors</option><option value="releases" ${S.sort == 'releases' ? 'selected' : ''}>Sort: releases</option></select>` : ''}
<button id="fr">Reset filters</button></div>`;
}
function bind(upd) {
  $('#fc').onchange = (e) => {
    S.category = e.target.value;
    upd();
  };
  $('#fm').onchange = (e) => {
    S.maturity = e.target.value;
    upd();
  };
  if ($('#fs'))
    $('#fs').onchange = (e) => {
      S.sort = e.target.value;
      upd();
    };
  $('#fr').onclick = () => {
    Object.assign(S, { q: '', category: '', maturity: '', sort: 'stars' });
    $('#gs').value = '';
    route();
  };
}

const V = {
  async dashboard() {
    const [s, l] = await Promise.all([api('stats'), api('projects?sort=adoption')]);
    const k = [
      ['CNCF projects', s.projects],
      ['GitHub stars', s.stars],
      ['Contributors', s.contributors],
      ['Releases', s.releases],
    ];
    $('#view').innerHTML =
      `<div class="grid kpis">${k.map(([a, b]) => `<div class="box kpi"><div class="v">${n(b)}</div><div class="l">${a}</div></div>`).join('')}</div><br>
 <div class="grid two">${chartBox('c1', 'Project maturity distribution')}${chartBox('c2', 'Adoption overview: top 10 by adoption score (0–100)')}${chartBox('c3', 'Community engagement: average contributors & releases per project')}${chartBox('c4', 'Development activity: releases, top 10')}</div>
 <p class="note" style="position:static;width:auto">Adoption score = 50% stars + 30% contributors + 20% releases, each normalised to the largest project. The dataset has no time series, so growth is shown as current community size and activity, not historical trend.</p>`;
    mk('c1', 'doughnut', Object.keys(s.maturity), [
      {
        data: Object.values(s.maturity),
        backgroundColor: Object.keys(s.maturity).map((k) => MC[k]),
        borderColor: '#121c32',
      },
    ]);
    const t = l.slice(0, 10);
    mk(
      'c2',
      'bar',
      t.map((p) => p.name),
      [
        ds(
          'Adoption score',
          t.map((p) => p.adoption),
          PAL[0],
        ),
      ],
      { h: 1 },
    );
    const g = ['Graduated', 'Incubating', 'Sandbox'].map((m) => l.filter((p) => p.maturity === m)),
      av = (a, k) => (a.length ? Math.round(a.reduce((x, p) => x + p[k], 0) / a.length) : 0);
    mk(
      'c3',
      'bar',
      ['Graduated', 'Incubating', 'Sandbox'],
      [
        ds(
          'Avg contributors',
          g.map((a) => av(a, 'contributors')),
          PAL[1],
        ),
        ds(
          'Avg releases',
          g.map((a) => av(a, 'releases')),
          PAL[2],
        ),
      ],
    );
    const r = [...l].sort((a, b) => b.releases - a.releases).slice(0, 10);
    mk(
      'c4',
      'bar',
      r.map((p) => p.name),
      [
        ds(
          'Releases',
          r.map((p) => p.releases),
          PAL[3],
        ),
      ],
    );
  },

  async explorer() {
    const m = await api('meta');
    $('#view').innerHTML = controls(m) + '<div id="res"></div>';
    bind(V.exp2);
    V.exp2();
  },
  async exp2() {
    try {
      const l = await api('projects?' + qs());
      $('#res').innerHTML =
        `<p>${l.length} project${l.length == 1 ? '' : 's'}</p>` +
        (l.length
          ? `<div class="grid cards">${l
              .map(
                (
                  p,
                ) => `<div class="card"><div class="row">${logo(p)}<div><b>${esc(p.name)}</b><br><span class="tag ${p.maturity}">${p.maturity}</span></div></div>
 <p>${esc(p.description)}</p><div style="font-size:13px;color:var(--m)">${esc(p.category)}</div><div class="nums"><span><b>${n(p.stars)}</b>stars</span><span><b>${n(p.contributors)}</b>contributors</span><span><b>${n(p.releases)}</b>releases</span></div>
 <div class="acts"><button data-d="${esc(p.name)}">Details</button><button data-c="${esc(p.name)}">${S.cmp.includes(p.name) ? 'Remove from compare' : 'Compare'}</button><a href="${p.repo}" target="_blank" rel="noopener">GitHub</a>${p.website ? `<a href="${p.website}" target="_blank" rel="noopener">Website</a>` : ''}</div></div>`,
              )
              .join('')}</div>`
          : '<div class="empty">No projects match these filters. Try resetting them.</div>');
      document.querySelectorAll('[data-d]').forEach((b) => (b.onclick = () => detail(b.dataset.d)));
      document.querySelectorAll('[data-c]').forEach(
        (b) =>
          (b.onclick = () => {
            toggle(b.dataset.c);
            V.exp2();
          }),
      );
    } catch (e) {
      $('#res').innerHTML = err(e);
    }
  },

  async analytics() {
    const m = await api('meta');
    $('#view').innerHTML = controls(m, false) + '<div id="res"></div>';
    bind(V.an2);
    V.an2();
  },
  async an2() {
    try {
      const l = await api('projects?' + qs());
      if (!l.length) {
        $('#res').innerHTML = '<div class="empty">No projects match these filters.</div>';
        return;
      }
      $('#res').innerHTML =
        `<div class="grid two">${chartBox('a1', 'Maturity distribution')}${chartBox('a2', 'Category distribution')}${chartBox('a3', 'GitHub stars (top 15)')}${chartBox('a4', 'Contributors (top 15)')}${chartBox('a5', 'Adoption overview (score, top 15)')}${chartBox('a6', 'Development activity: releases vs contributors (top 15)')}</div>`;
      const cnt = (k) => l.reduce((a, p) => ((a[p[k]] = (a[p[k]] || 0) + 1), a), {}),
        mt = cnt('maturity'),
        ct = cnt('category'),
        top = (k) => [...l].sort((a, b) => b[k] - a[k]).slice(0, 15),
        nm = (a) => a.map((p) => p.name);
      mk('a1', 'doughnut', Object.keys(mt), [
        {
          data: Object.values(mt),
          backgroundColor: Object.keys(mt).map((k) => MC[k]),
          borderColor: '#121c32',
        },
      ]);
      mk('a2', 'doughnut', Object.keys(ct), [
        {
          data: Object.values(ct),
          backgroundColor: Object.keys(ct).map((_, i) => PAL[i % PAL.length]),
          borderColor: '#121c32',
        },
      ]);
      let t = top('stars');
      mk('a3', 'bar', nm(t), [
        ds(
          'Stars',
          t.map((p) => p.stars),
          PAL[0],
        ),
      ]);
      t = top('contributors');
      mk('a4', 'bar', nm(t), [
        ds(
          'Contributors',
          t.map((p) => p.contributors),
          PAL[1],
        ),
      ]);
      t = top('adoption');
      mk('a5', 'bar', nm(t), [
        ds(
          'Adoption score',
          t.map((p) => p.adoption),
          PAL[2],
        ),
      ]);
      t = top('releases');
      mk('a6', 'bar', nm(t), [
        ds(
          'Releases',
          t.map((p) => p.releases),
          PAL[3],
        ),
        ds(
          'Contributors',
          t.map((p) => p.contributors),
          PAL[4],
        ),
      ]);
    } catch (e) {
      $('#res').innerHTML = err(e);
    }
  },

  async compare() {
    const l = await api('projects?sort=name&order=asc'),
      sel = S.cmp.map((x) => l.find((p) => p.name == x)).filter(Boolean);
    let h = `<div class="bar"><select id="add" aria-label="Add project"><option value="">Add a project…</option>${l
      .filter((p) => !S.cmp.includes(p.name))
      .map((p) => `<option>${esc(p.name)}</option>`)
      .join('')}</select>${S.cmp.length ? '<button id="clr">Clear all</button>' : ''}</div>`;
    if (sel.length < 2)
      h += `<div class="empty">Select at least two projects (up to 4) to compare. ${sel.length} selected.</div>`;
    else {
      const best = (k) => Math.max(...sel.map((p) => p[k])),
        row = (t, f) => `<tr><th>${t}</th>${sel.map((p) => `<td>${f(p)}</td>`).join('')}</tr>`,
        bc = (k) => (p) => `<span class="${p[k] == best(k) ? 'best' : ''}">${n(p[k])}</span>`;
      h += `<div class="box" style="overflow:auto"><table><tr><th></th>${sel.map((p) => `<th>${logo(p, 28)} ${esc(p.name)}</th>`).join('')}</tr>${row('Maturity', (p) => `<span class="tag ${p.maturity}">${p.maturity}</span>`)}${row('Category', (p) => esc(p.category))}${row('GitHub stars', bc('stars'))}${row('Contributors', bc('contributors'))}${row('Releases', bc('releases'))}${row('Adoption score', bc('adoption'))}</table><p class="note" style="position:static;width:auto">Highlighted = highest value in each row.</p></div><br>${chartBox('m1', 'Side-by-side comparison (log scale)')}`;
    }
    $('#view').innerHTML = h;
    $('#add').onchange = (e) => {
      if (e.target.value) toggle(e.target.value);
      V.compare();
    };
    if ($('#clr'))
      $('#clr').onclick = () => {
        S.cmp = [];
        badge();
        V.compare();
      };
    if (sel.length > 1)
      mk(
        'm1',
        'bar',
        sel.map((p) => p.name),
        [
          ds(
            'Stars',
            sel.map((p) => p.stars),
            PAL[0],
          ),
          ds(
            'Contributors',
            sel.map((p) => p.contributors),
            PAL[1],
          ),
          ds(
            'Releases',
            sel.map((p) => p.releases),
            PAL[2],
          ),
        ],
        { log: 1 },
      );
  },

  async monitoring() {
    const rows = [],
      ping = async (p) => {
        const t = performance.now();
        try {
          const r = await fetch('/api/' + p);
          return {
            p,
            ok: r.ok,
            code: r.status,
            ms: Math.round(performance.now() - t),
            j: r.ok ? await r.json() : null,
          };
        } catch (e) {
          return { p, ok: false, code: 'network error', ms: 0 };
        }
      };
    const R = await Promise.all(['health', 'meta', 'stats', 'projects'].map(ping)),
      h = R[0].j,
      m = R[1].j;
    $('#view').innerHTML =
      `<div class="grid two"><div class="box"><h2>Application health <span class="tag ok">Verified live</span></h2>${h ? `<p class="ok"><b>● ${h.status.toUpperCase()}</b></p><table><tr><th>Uptime</th><td>${h.uptimeSec}s</td></tr><tr><th>Server memory (RSS)</th><td>${h.memoryMB} MB</td></tr><tr><th>Node.js</th><td>${h.node} on ${h.platform}</td></tr><tr><th>Server time</th><td>${h.time}</td></tr></table>` : '<p class="err">● Health endpoint unreachable</p>'}</div>
 <div class="box"><h2>API availability <span class="tag ok">Verified live</span></h2><table><tr><th>Endpoint</th><th>Status</th><th>Latency</th></tr>${R.map((r) => `<tr><td>/api/${r.p}</td><td class="${r.ok ? 'ok' : 'err'}">${r.ok ? '● ' + r.code : '● ' + r.code}</td><td>${r.ms} ms</td></tr>`).join('')}</table><p class="note" style="position:static;width:auto">Measured from your browser just now.</p></div>
 <div class="box"><h2>Dataset information <span class="tag warn">Snapshot, not live</span></h2>${m ? `<table><tr><th>Projects</th><td>${m.count}</td></tr><tr><th>Dataset version</th><td>${m.version}</td></tr><tr><th>Snapshot date</th><td>${m.updated}</td></tr><tr><th>File last modified</th><td>${new Date(m.fileModified).toLocaleString()}</td></tr><tr><th>Source</th><td>${esc(m.source)}</td></tr><tr><th>Verified against GitHub</th><td class="warn">No</td></tr></table>` : '<p class="err">Unavailable</p>'}</div>
 <div class="box"><h2>What is real and what is not</h2><p><b class="ok">Verified live:</b> server health, uptime, memory, API status and latency.</p><p><b class="warn">Approximate snapshot:</b> every star, contributor and release count, and the project list itself. Edit <code>scripts/build-data.py</code> and rerun it to update the data.</p></div></div>`;
  },
};

function toggle(name) {
  const i = S.cmp.indexOf(name);
  if (i >= 0) S.cmp.splice(i, 1);
  else if (S.cmp.length < 4) S.cmp.push(name);
  else alert('You can compare up to 4 projects at once.');
  badge();
}
const badge = () => ($('#cc').textContent = S.cmp.length || '');
async function detail(name) {
  try {
    const p = await api('projects/' + encodeURIComponent(name));
    const m = $('#modal');
    m.hidden = false;
    m.innerHTML = `<div class="box" role="dialog" aria-label="${esc(p.name)}"><div class="row">${logo(p, 52)}<div><h1>${esc(p.name)}</h1><span class="tag ${p.maturity}">${p.maturity}</span> ${esc(p.category)}</div></div><p>${esc(p.description)}</p>
 <table><tr><th>GitHub stars</th><td>${n(p.stars)}</td></tr><tr><th>Contributors</th><td>${n(p.contributors)}</td></tr><tr><th>Releases</th><td>${n(p.releases)}</td></tr><tr><th>Adoption score</th><td>${p.adoption}</td></tr></table><br>
 <div class="acts"><a href="${p.repo}" target="_blank" rel="noopener">GitHub repository</a><a href="${p.website}" target="_blank" rel="noopener">Official website</a><button id="x">Close</button></div></div>`;
    $('#x').onclick = () => (m.hidden = true);
    $('#x').focus();
  } catch (e) {
    alert(e.message);
  }
}

const TITLES = {
  dashboard: 'Dashboard',
  explorer: 'Project Explorer',
  analytics: 'Analytics',
  compare: 'Project Comparison',
  monitoring: 'Monitoring & System Info',
};
async function route() {
  const v = location.hash.slice(1) || 'dashboard';
  const k = V[v] ? v : 'dashboard';
  Object.values(CH).forEach((c) => c.destroy());
  $('#title').textContent = TITLES[k];
  document.querySelectorAll('nav a').forEach((a) => a.classList.toggle('on', a.hash == '#' + k));
  $('#side').classList.remove('open');
  try {
    await V[k]();
  } catch (e) {
    $('#view').innerHTML = err(e);
  }
}
$('#gs').oninput = (e) => {
  S.q = e.target.value;
  if (location.hash !== '#explorer') location.hash = '#explorer';
  else V.exp2();
};
$('#menu').onclick = () => $('#side').classList.toggle('open');
$('#modal').onclick = (e) => {
  if (e.target.id == 'modal') e.target.hidden = true;
};
document.onkeydown = (e) => {
  if (e.key == 'Escape') $('#modal').hidden = true;
};
addEventListener('hashchange', route);
route();
