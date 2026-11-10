'use strict';
/* =====================================================================
   Rotina Auditor Fiscal — checklist de estudos (PWA, sem bibliotecas)
   Dados: localStorage, chave "rotina_auditor_v1" (tudo fica no aparelho).
   ===================================================================== */
const KEY = 'rotina_auditor_v1';
const DISCS = ['Língua Portuguesa', 'Direito Constitucional', 'Direito Administrativo', 'Direito Tributário', 'Contabilidade Geral', 'Legislação Tributária'];
const WD = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];
const WD3 = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const FULFILLED = 0.8; // "rotina cumprida" = 80% ou mais do dia
const MSGS = [
  'Um bloco de cada vez. Consistência vence intensidade.',
  'O que você estuda hoje é a aprovação de amanhã.',
  'Pequenos blocos, grandes resultados.',
  'Cada questão corrigida é um erro a menos na prova.',
  'Hoje basta fazer bem o próximo bloco.',
  'Constância supera pressa. Siga o plano.',
  'Revisar é o que transforma estudo em memória.',
  'Imperfeito e consistente vence perfeito e esporádico.',
  'Um dia incompleto não apaga o caminho já feito.',
  'Respeite o sono: ele também faz parte da aprovação.'
];
const PERIODS = {
  desl: { t: 'Deslocamentos', ic: '🎧', sub: 'Aulas em áudio nos trajetos e no almoço' },
  trab: { t: 'Intervalos no trabalho', ic: '💼', sub: '' },
  noite: { t: 'Estudo noturno', ic: '🌙', sub: 'Janela fixa das 20h às 22h' },
  sat: { t: 'Sábado — estudo flexível', ic: '⏱️', sub: '2 horas, sem horário fixo' }
};

const DEFAULT_ACTS = [
  { id: 'd1', p: 'desl', label: 'Deslocamento 1 — aula em áudio', min: 20, audio: true },
  { id: 'd2', p: 'desl', label: 'Deslocamento 2 — aula em áudio', min: 20, audio: true },
  { id: 'd3', p: 'desl', label: 'Deslocamento 3 — aula em áudio', min: 20, audio: true },
  { id: 'd4', p: 'desl', label: 'Deslocamento 4 — aula em áudio', min: 20, audio: true },
  { id: 'd5', p: 'desl', label: 'Intervalo do almoço — aula em áudio', min: 30, audio: true },
  { id: 't1', p: 'trab', label: 'Revisão rápida de conceitos', min: 15, opt: true },
  { id: 't2', p: 'trab', label: 'Flashcards', min: 15, opt: true },
  { id: 't3', p: 'trab', label: 'Resolução de questões curtas', min: 15, opt: true },
  { id: 't4', p: 'trab', label: 'Revisão de legislação', min: 15, opt: true },
  { id: 't5', p: 'trab', label: 'Recuperação ativa (lembrar sem consultar o material)', min: 10, opt: true },
  { id: 't6', p: 'trab', label: 'Registrar dúvidas e assuntos para aprofundar', min: 10, opt: true },
  { id: 'n1', p: 'noite', label: 'Teoria e conteúdo novo', min: 50, start: '20:00', end: '20:50', topic: true },
  { id: 'n2', p: 'noite', label: 'Pausa', min: 10, start: '20:50', end: '21:00', rest: true },
  { id: 'n3', p: 'noite', label: 'Resolução de questões', min: 30, start: '21:00', end: '21:30', topic: true },
  { id: 'n4', p: 'noite', label: 'Correção e registro dos erros', min: 10, start: '21:30', end: '21:40' },
  { id: 'n5', p: 'noite', label: 'Desacelerar e preparar para dormir', min: 20, start: '21:40', end: '22:00', rest: true },
  { id: 's1', p: 'sat', label: 'Revisão dos assuntos da semana', min: 20, timer: true },
  { id: 's2', p: 'sat', label: 'Resolução de questões', min: 60, timer: true },
  { id: 's3', p: 'sat', label: 'Correção e atualização do banco de erros', min: 30, timer: true },
  { id: 's4', p: 'sat', label: 'Planejamento da próxima semana', min: 10, timer: true }
].map(a => Object.assign({ enabled: true, opt: false, start: '', end: '' }, a));

const DEFAULT_TOPICS = {
  'Língua Portuguesa': ['Interpretação de textos', 'Tipologia e gêneros textuais', 'Ortografia e acentuação', 'Classes de palavras', 'Sintaxe da oração', 'Concordância verbal', 'Concordância nominal', 'Regência verbal e nominal', 'Crase', 'Pontuação', 'Coesão e coerência', 'Redação oficial'],
  'Direito Constitucional': ['Princípios fundamentais', 'Direitos e garantias fundamentais', 'Direitos sociais, nacionalidade e direitos políticos', 'Organização do Estado', 'Poder Legislativo', 'Poder Executivo', 'Poder Judiciário', 'Controle de constitucionalidade', 'Sistema Tributário Nacional (CF)', 'Finanças públicas'],
  'Direito Administrativo': ['Princípios da administração', 'Organização administrativa', 'Poderes administrativos', 'Atos administrativos', 'Licitações (Lei 14.133/2021)', 'Contratos administrativos', 'Agentes públicos', 'Responsabilidade civil do Estado', 'Improbidade administrativa', 'Controle da administração'],
  'Direito Tributário': ['Competência tributária', 'Princípios constitucionais tributários', 'Limitações ao poder de tributar', 'Imunidades', 'Espécies tributárias', 'Obrigação tributária', 'Crédito tributário', 'Lançamento', 'Suspensão, extinção e exclusão do crédito', 'Garantias e privilégios do crédito', 'Administração tributária', 'Repartição das receitas tributárias'],
  'Contabilidade Geral': ['Estrutura conceitual', 'Patrimônio, atos e fatos contábeis', 'Balanço patrimonial', 'Demonstração do resultado (DRE)', 'DFC e DMPL', 'Estoques', 'Imobilizado e depreciação', 'Intangível', 'Provisões e contingências', 'Consolidação das demonstrações', 'Operações com mercadorias', 'Análise das demonstrações'],
  'Legislação Tributária': ['CTN — normas gerais', 'Vigência e aplicação da legislação tributária', 'ICMS (LC 87/96)', 'IPVA', 'ITCMD', 'Processo administrativo tributário', 'Execução fiscal (Lei 6.830/80)', 'Código tributário do ente (estado/município)', 'Lei de Responsabilidade Fiscal']
};
// disciplinas previstas para cada dia da semana (1 = segunda ... 5 = sexta). Ajustável em Ajustes.
const DEFAULT_PLAN = {
  1: ['Língua Portuguesa', 'Direito Constitucional'],
  2: ['Direito Administrativo', 'Direito Tributário'],
  3: ['Contabilidade Geral', 'Legislação Tributária'],
  4: ['Direito Tributário', 'Língua Portuguesa'],
  5: ['Contabilidade Geral', 'Direito Constitucional']
};

/* ------------------------------ utilidades ------------------------------ */
const $ = (s, r = document) => r.querySelector(s);
const clone = o => JSON.parse(JSON.stringify(o));
const pad = n => String(n).padStart(2, '0');
const ymd = d => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = s => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d, 12, 0, 0); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return ymd(d); };
const todayStr = () => ymd(new Date());
const mondayOf = s => { const d = parse(s); const g = (d.getDay() + 6) % 7; d.setDate(d.getDate() - g); return ymd(d); };
const fmtBR = s => { const [y, m, d] = s.split('-'); return `${d}/${m}/${y}`; };
const fmtLong = s => { const d = parse(s); return `${d.getDate()} de ${MONTHS[d.getMonth()]} de ${d.getFullYear()}`; };
const fmtMin = m => { m = Math.round(m || 0); return m >= 60 ? `${Math.floor(m / 60)}h${pad(m % 60)}` : `${m} min`; };
const fmtHM = iso => { const d = new Date(iso); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; };
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
const dayType = s => { const g = parse(s).getDay(); return g === 0 ? 'sun' : g === 6 ? 'sat' : 'wk'; };

/* ------------------------------ armazenamento ------------------------------ */
function freshDB() {
  return { v: 1, settings: { theme: 'auto', acts: clone(DEFAULT_ACTS), plan: clone(DEFAULT_PLAN), topics: clone(DEFAULT_TOPICS), work: 'Horário de trabalho: 08h às 13h05 e 14h05 às 17h' }, days: {} };
}
function migrate(d) {
  const f = freshDB();
  d = d && typeof d === 'object' ? d : f;
  d.settings = Object.assign({}, f.settings, d.settings || {});
  d.days = d.days && typeof d.days === 'object' ? d.days : {};
  const have = new Set(d.settings.acts.map(a => a.id));
  DEFAULT_ACTS.forEach(a => { if (!have.has(a.id)) d.settings.acts.push(clone(a)); });
  return d;
}
function load() {
  let raw = null;
  try { raw = localStorage.getItem(KEY); } catch (e) { return freshDB(); }
  if (!raw) return freshDB();
  try { return migrate(JSON.parse(raw)); }
  catch (e) { // dado corrompido: guarda uma cópia antes de qualquer gravação
    try { localStorage.setItem(KEY + '_corrompido_' + Date.now(), raw); } catch (_) {}
    return freshDB();
  }
}
let db = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); }
  catch (e) { toast('Não foi possível salvar neste navegador (armazenamento bloqueado ou cheio). Faça um backup.'); }
}

/* ------------------------------ estado de tela ------------------------------ */
const state = {
  tab: 'today', date: todayStr(), follow: true,
  satDate: null, hMonth: todayStr().slice(0, 7), hSel: null, wMon: mondayOf(todayStr()),
  open: new Set(), installEvt: null
};

/* ------------------------------ modelo do dia ------------------------------ */
const getAct = id => db.settings.acts.find(a => a.id === id);
function dayRec(ds, create) {
  if (!db.days[ds]) { if (!create) return null; db.days[ds] = { acts: {}, extras: [], note: '' }; }
  return db.days[ds];
}
function actRec(ds, id, create) {
  const d = dayRec(ds, create); if (!d) return null;
  if (!d.acts[id]) { if (!create) return null; d.acts[id] = {}; }
  return d.acts[id];
}
function actsFor(ds) {
  const t = dayType(ds); if (t === 'sun') return [];
  const per = t === 'sat' ? ['sat'] : ['desl', 'trab', 'noite'];
  const past = ds < todayStr();
  return db.settings.acts.filter(a => per.includes(a.p)).map(a => ({ a, r: (dayRec(ds) && dayRec(ds).acts[a.id]) || {} }))
    .filter(x => x.a.enabled || x.r.st || x.r.acc || x.r.actual)
    .map(({ a, r }) => Object.assign({}, a, {
      r, label: past && r.label ? r.label : a.label, min: past && r.min != null ? r.min : a.min
    }));
}
function dayStats(ds) {
  if (dayType(ds) === 'sun') return null;
  const items = actsFor(ds), rec = dayRec(ds);
  let done = 0, part = 0, notdone = 0, counted = 0, planned = 0, actual = 0, score = 0, touched = false;
  for (const a of items) {
    const st = a.r.st;
    if (st || a.r.acc || a.r.actual) touched = true;
    if (!a.rest) actual += +a.r.actual || 0;
    const inc = !a.opt || st === 'done' || st === 'partial';
    if (inc) {
      counted++;
      if (!a.rest) planned += a.min;
      if (st === 'done') { done++; score += 1; } else if (st === 'partial') { part++; score += .5; } else notdone++;
    } else if (st === 'skip') notdone++;
  }
  const extraMin = rec ? (rec.extras || []).reduce((s, e) => s + (+e.min || 0), 0) : 0;
  if (rec && (rec.extras || []).length) touched = true;
  return { items, done, part, notdone, counted, planned, actual: actual + extraMin, extraMin, pct: counted ? score / counted : 0, touched };
}
function msgOfDay(ds) {
  const d = parse(ds), start = new Date(d.getFullYear(), 0, 0), n = Math.floor((d - start) / 864e5);
  return MSGS[n % MSGS.length];
}
// sugestão de disciplina/assunto seguindo o planejamento semanal
function suggestFor(ds, a) {
  if (dayType(ds) !== 'wk') return null;
  const plan = db.settings.plan[parse(ds).getDay()] || [];
  if (!plan.length) return null;
  let idx = null;
  if (a.audio) idx = db.settings.acts.filter(x => x.audio).findIndex(x => x.id === a.id);
  else if (a.topic) idx = 0;
  if (idx == null || idx < 0) return null;
  const disc = plan[idx % plan.length];
  const topics = db.settings.topics[disc] || [];
  if (!topics.length) return { disc, topic: '' };
  const cnt = {};
  Object.values(db.days).forEach(d => Object.values(d.acts || {}).forEach(r => {
    if (r.disc === disc && r.topic && (r.st === 'done' || r.st === 'partial')) cnt[r.topic] = (cnt[r.topic] || 0) + 1;
  }));
  let best = topics[0];
  for (const t of topics) if ((cnt[t] || 0) < (cnt[best] || 0)) best = t;
  return { disc, topic: best };
}

/* ------------------------------ ações ------------------------------ */
function nowMs() { return Date.now(); }
function timerMs(r) { return (r.acc || 0) + (r.run ? nowMs() - r.run : 0); }
function stopTimer(r) { if (r.run) { r.acc = (r.acc || 0) + (nowMs() - r.run); r.run = null; } }
function setStatus(ds, id, st) {
  const a = getAct(id), r = actRec(ds, id, true);
  if (r.st === st) { delete r.st; delete r.doneAt; }      // tocar de novo desfaz a marcação
  else {
    r.st = st; r.label = a.label; r.min = a.min;
    if (st === 'done' || st === 'partial') { r.doneAt = new Date().toISOString(); state.open.add(ds + id); } else delete r.doneAt;
    if (r.run) { stopTimer(r); if (r.acc) r.actual = Math.max(1, Math.round(r.acc / 60000)); }
  }
  save(); render();
}
function timerAction(ds, id, what) {
  const a = getAct(id), r = actRec(ds, id, true);
  r.label = a.label; r.min = a.min;
  if (what === 'start') { if (!r.run) r.run = nowMs(); }
  else if (what === 'pause') stopTimer(r);
  else if (what === 'finish') { stopTimer(r); r.st = 'done'; r.doneAt = new Date().toISOString(); state.open.add(ds + id); }
  else if (what === 'reset') { r.run = null; r.acc = 0; }
  if ((what === 'pause' || what === 'finish') && r.acc) r.actual = Math.max(1, Math.round(r.acc / 60000));
  save(); render();
}

/* ------------------------------ renderização ------------------------------ */
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2800);
}
function applyTheme() {
  const t = db.settings.theme, root = document.documentElement;
  if (t === 'dark' || t === 'light') root.setAttribute('data-theme', t); else root.removeAttribute('data-theme');
  const dark = t === 'dark' || (t === 'auto' && window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches);
  const m = document.querySelector('meta[name=theme-color]'); if (m) m.content = dark ? '#0d1a2d' : '#1f3a5f';
}
function render() {
  document.querySelectorAll('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === state.tab));
  const v = $('#view');
  const views = { today: viewToday, sat: viewSat, hist: viewHist, perf: viewPerf, cfg: viewCfg };
  v.innerHTML = views[state.tab]();
  $('#datalists').innerHTML = DISCS.map((d, i) => `<datalist id="dl${i}">${(db.settings.topics[d] || []).map(t => `<option value="${esc(t)}">`).join('')}</datalist>`).join('');
  tickTimers();
}

function progressBlock(ds, st) {
  const pct = Math.round(st.pct * 100);
  return `<div class="hero card">
    <div class="wd" id="hwd">${WD[parse(ds).getDay()]}${ds === todayStr() ? ' · hoje' : ''}</div>
    <div class="dt">${fmtLong(ds)}</div>
    <div class="msg">${esc(msgOfDay(ds))}</div>
    <div class="row between" style="align-items:flex-end;margin-bottom:8px">
      <div><div class="pct" id="pct">${pct}%</div><div class="small" style="opacity:.85">do dia concluído</div></div>
      <div style="text-align:right"><div class="small" style="opacity:.85">Meta diária de estudo</div><b id="goal" style="font-size:1.2rem">${fmtMin(st.planned)}</b></div>
    </div>
    <div class="bar"><i id="bar" style="width:${pct}%"></i></div>
    <div class="stats">
      <div class="stat"><b id="cnt">${st.done}/${st.counted}</b><span>concluídas</span></div>
      <div class="stat"><b id="plan">${fmtMin(st.planned)}</b><span>planejado</span></div>
      <div class="stat"><b id="real">${fmtMin(st.actual)}</b><span>realizado</span></div>
    </div></div>`;
}
function refreshSummary(ds) {
  const st = dayStats(ds); if (!st || !$('#pct')) return;
  const pct = Math.round(st.pct * 100);
  $('#pct').textContent = pct + '%'; $('#bar').style.width = pct + '%';
  $('#cnt').textContent = `${st.done}/${st.counted}`; $('#plan').textContent = fmtMin(st.planned); $('#real').textContent = fmtMin(st.actual);
  $('#goal').textContent = fmtMin(st.planned);
}

function dateBar(ds) {
  return `<div class="datebar">
    <button class="btn sq" data-a="dayPrev" aria-label="Dia anterior">‹</button>
    <input type="date" id="datePick" value="${ds}" aria-label="Escolher data">
    <button class="btn sq" data-a="dayNext" aria-label="Próximo dia">›</button>
    <button class="btn" data-a="dayToday">Hoje</button></div>`;
}

function actHTML(ds, a) {
  const r = a.r, st = r.st || '';
  const open = state.open.has(ds + a.id) || (a.timer && (r.acc || r.run));
  const win = a.start ? `${a.start}–${a.end} · ` : '';
  const isNow = ds === todayStr() && a.start && a.end && nowHM() >= a.start && nowHM() < a.end;
  const sug = !r.disc && !r.topic ? suggestFor(ds, a) : null;
  const di = DISCS.indexOf(r.disc);
  let topic = '';
  if (a.audio || a.topic) {
    topic = `<div class="topic">
      <select data-f="disc" aria-label="Disciplina"><option value="">Disciplina…</option>${DISCS.map(d => `<option ${r.disc === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}</select>
      <input data-f="topic" ${di >= 0 ? `list="dl${di}"` : ''} placeholder="${a.audio ? 'Assunto da aula ouvida' : 'Assunto estudado'}" value="${esc(r.topic || '')}" aria-label="Assunto"></div>
      ${sug ? `<button class="sug" data-a="useSug">💡 Sugestão do plano: <b>${esc(sug.disc)}</b>${sug.topic ? ' — ' + esc(sug.topic) : ''} <u>(usar)</u></button>` : ''}`;
  }
  let timer = '';
  if (a.timer) {
    const run = !!r.run;
    timer = `<div class="timer"><span class="tv" data-tv="${a.id}">${clock(timerMs(r))}</span>
      ${run ? `<button class="btn small" data-a="tPause">⏸ Pausar</button>` : `<button class="btn small primary" data-a="tStart">▶ ${r.acc ? 'Retomar' : 'Iniciar'}</button>`}
      <button class="btn small" data-a="tFinish">⏹ Finalizar</button>
      ${r.acc && !run ? `<button class="btn small" data-a="tReset" aria-label="Zerar cronômetro">↺</button>` : ''}</div>`;
  }
  const det = open ? `<div class="det">
      <div><label>Tempo efetivamente dedicado (min)</label><div class="row"><input type="number" inputmode="numeric" min="0" max="600" data-f="actual" value="${r.actual != null ? r.actual : ''}" placeholder="ex.: ${a.min}"><button class="btn small" data-a="useMin" style="white-space:nowrap">= ${a.min} min</button></div></div>
      <div><label>Observações</label><textarea data-f="note" placeholder="Opcional">${esc(r.note || '')}</textarea></div></div>` : '';
  const icon = st === 'done' ? '✓' : st === 'partial' ? '◐' : st === 'skip' ? '✕' : '✓';
  return `<div class="act st-${st || 'none'} ${isNow ? 'now' : ''}" data-id="${a.id}" data-ds="${ds}">
    <div class="top">
      <button class="chk" data-a="done" aria-label="Marcar como concluída" aria-pressed="${st === 'done'}">${icon}</button>
      <div class="info"><div class="lbl">${esc(a.label)}</div>
        <div class="meta">${win}${a.min} min${a.opt ? ' · opcional' : ''}${a.rest ? ' · descanso' : ''}${isNow ? ' · <b>agora</b>' : ''}</div>
        ${r.doneAt ? `<div class="donetime">${st === 'partial' ? 'Parcial' : 'Concluída'} em ${fmtBR(ymd(new Date(r.doneAt)))} às ${fmtHM(r.doneAt)}${(r.actual != null && r.actual !== '') ? ' · ' + fmtMin(r.actual) + ' dedicados' : ''}</div>` : ''}</div>
    </div>
    ${topic}${timer}
    <div class="btns">
      <button class="pill partial ${st === 'partial' ? 'on' : ''}" data-a="partial">◐ Parcial</button>
      <button class="pill skip ${st === 'skip' ? 'on' : ''}" data-a="skip">✕ Não realizada</button>
      <button class="pill" data-a="more">${open ? 'Ocultar' : 'Tempo e notas'}${(r.note || r.actual != null) && !open ? ' •' : ''}</button>
    </div>${det}</div>`;
}
function nowHM() { const d = new Date(); return `${pad(d.getHours())}:${pad(d.getMinutes())}`; }
function clock(ms) { const s = Math.floor(ms / 1000); return `${pad(Math.floor(s / 3600))}:${pad(Math.floor(s / 60) % 60)}:${pad(s % 60)}`; }

function periodCard(ds, p, extraHTML) {
  const items = actsFor(ds).filter(a => a.p === p);
  if (!items.length) return '';
  const info = PERIODS[p];
  const done = items.filter(a => a.r.st === 'done').length;
  const total = items.length;
  const sub = p === 'trab' ? esc(db.settings.work) + ' — use os intervalos que puder; nenhum é obrigatório.' : p === 'desl' ? `${items.reduce((s, a) => s + a.min, 0)} min no total · escolha disciplina e assunto de cada aula` : info.sub;
  return `<section class="card period"><header><span class="pic" aria-hidden="true">${info.ic}</span>
    <div class="ptitle"><h3>${info.t}</h3><small>${sub}</small></div><span class="pcount">${done}/${total}</span></header>
    ${items.map(a => actHTML(ds, a)).join('')}${extraHTML || ''}</section>`;
}
function extrasCard(ds) {
  const rec = dayRec(ds), ex = rec ? rec.extras || [] : [];
  return `<section class="card"><h3>➕ Atividades fora da rotina</h3>
    <p class="small muted" style="margin:4px 0 8px">Estudou em outro horário ou algo que não estava na lista? Registre aqui — conta no tempo realizado.</p>
    ${ex.map(e => `<div class="extra" data-eid="${e.id}"><div class="grow"><b>${esc(e.label)}</b><div class="small muted">${fmtMin(e.min)}${e.at ? ' · registrado às ' + fmtHM(e.at) : ''}</div></div><button class="btn small" data-a="delExtra" aria-label="Remover">✕</button></div>`).join('')}
    <div class="row" style="margin-top:8px"><input class="fld" id="exLabel" placeholder="O que você estudou?" style="flex:2"><input class="fld" id="exMin" type="number" inputmode="numeric" min="1" placeholder="min" style="flex:1"></div>
    <button class="btn primary" data-a="addExtra" style="width:100%;margin-top:8px">Adicionar</button></section>`;
}
function dayNoteCard(ds) {
  const rec = dayRec(ds);
  return `<section class="card"><h3>📝 Observações do dia</h3><textarea class="fld" data-f="daynote" placeholder="Como foi o dia? Dúvidas, ideias, o que ajustar amanhã…" style="margin-top:8px">${esc(rec ? rec.note || '' : '')}</textarea></section>`;
}
function restCard() {
  return `<section class="card rest"><div class="big">🌿</div><h3 style="font-size:1.2rem;margin-top:6px">Domingo — descanso</h3>
    <p>Domingo reservado para descanso, família e recuperação. Consistência também significa saber descansar.</p>
    <p class="small muted">Nenhuma meta ou cobrança de estudo neste dia.</p></section>`;
}

function viewToday() {
  const ds = state.date, t = dayType(ds);
  let h = dateBar(ds);
  if (ds !== todayStr()) h += `<p class="small"><span class="badge ${ds < todayStr() ? 'warn' : ''}">${ds < todayStr() ? 'Registro de dia anterior — você pode lançar o que fez fora do horário' : 'Dia futuro'}</span></p>`;
  if (t === 'sun') return h + restCard();
  const st = dayStats(ds);
  h += progressBlock(ds, st);
  if (t === 'sat') {
    h += `<p class="small muted" style="margin:0 4px 10px">Sábado: sem horário fixo. Use o cronômetro de cada bloco ou marque manualmente.</p>`;
    h += periodCard(ds, 'sat');
  } else {
    h += periodCard(ds, 'desl') + periodCard(ds, 'trab');
    const late = ds === todayStr() && nowHM() >= '22:00';
    h += periodCard(ds, 'noite', `<div class="bed ${late ? 'late' : ''}">🛏️ ${late ? 'Já passou das 22h — encerre os estudos e vá dormir. O sono consolida o que você aprendeu.' : 'Limite importante: 22h. Não prolongue o estudo depois disso — dormir bem também é estudar.'}</div>`);
  }
  return h + extrasCard(ds) + dayNoteCard(ds);
}
function satOf(ds) { return addDays(mondayOf(ds), 5); }
function viewSat() {
  if (!state.satDate) state.satDate = satOf(todayStr());
  const ds = state.satDate, st = dayStats(ds);
  let h = `<div class="datebar"><button class="btn sq" data-a="satPrev" aria-label="Sábado anterior">‹</button>
    <div class="grow" style="text-align:center;font-weight:700">Sábado, ${fmtBR(ds)}</div>
    <button class="btn sq" data-a="satNext" aria-label="Próximo sábado">›</button><button class="btn" data-a="satToday">Atual</button></div>`;
  h += progressBlock(ds, st);
  h += `<p class="small muted" style="margin:0 4px 10px">Duas horas flexíveis. Inicie, pause e finalize cada bloco quando quiser — o horário não importa.</p>`;
  return h + periodCard(ds, 'sat') + dayNoteCard(ds);
}

/* ---------- histórico ---------- */
function statusIcon(st) { return st === 'done' ? '✅' : st === 'partial' ? '◐' : st === 'skip' ? '✕' : '○'; }
function viewHist() {
  const [y, m] = state.hMonth.split('-').map(Number);
  const first = new Date(y, m - 1, 1, 12), nd = new Date(y, m, 0).getDate(), lead = (first.getDay() + 6) % 7;
  let cells = WD3.slice(1).concat(WD3[0]).map(w => `<div class="h">${w}</div>`).join('');
  for (let i = 0; i < lead; i++) cells += '<button class="blank" disabled></button>';
  for (let d = 1; d <= nd; d++) {
    const ds = `${y}-${pad(m)}-${pad(d)}`, st = dayStats(ds);
    let cls = '', sub = '';
    if (!st) cls = 'sunday'; else if (st.touched) { const p = st.pct; cls = p >= FULFILLED ? 'p3' : p >= .5 ? 'p2' : p > 0 ? 'p1' : 'p0'; sub = `<small>${Math.round(p * 100)}%</small>`; }
    cells += `<button class="${cls} ${ds === todayStr() ? 'today' : ''} ${ds === state.hSel ? 'sel' : ''}" data-a="histDay" data-ds="${ds}" aria-label="${fmtBR(ds)}">${d}${sub}</button>`;
  }
  let h = `<div class="datebar"><button class="btn sq" data-a="monPrev" aria-label="Mês anterior">‹</button>
    <div class="grow" style="text-align:center;font-weight:700;text-transform:capitalize">${MONTHS[m - 1]} de ${y}</div>
    <button class="btn sq" data-a="monNext" aria-label="Próximo mês">›</button></div>
    <div class="card"><div class="cal">${cells}</div>
    <div class="legend"><span><i style="background:var(--accent)"></i>≥80%</span><span><i style="background:var(--accent-soft)"></i>50–79%</span><span><i style="background:var(--warn-soft)"></i>1–49%</span><span><i style="background:var(--info-soft)"></i>só registros</span><span><i style="border:1px dashed var(--rest)"></i>domingo</span></div>
    <p class="small muted" style="margin:10px 0 0">Dias sem cor não têm registro. Atividades não realizadas são só informação — o foco é a evolução, não a cobrança.</p></div>`;
  if (state.hSel) h += histDetail(state.hSel);
  else h += `<p class="muted small" style="text-align:center">Toque em um dia para ver os detalhes.</p>`;
  return h;
}
function histDetail(ds) {
  const st = dayStats(ds), rec = dayRec(ds);
  if (!st) return `<div class="card"><h3>${fmtBR(ds)} — Domingo</h3><p class="muted">Dia de descanso, sem metas de estudo.</p></div>`;
  const items = st.items.filter(a => a.r.st || a.r.actual != null || a.r.note || a.r.acc);
  return `<div class="card"><div class="row between wrap"><h3>${WD[parse(ds).getDay()]}, ${fmtBR(ds)}</h3><button class="btn small primary" data-a="editDay" data-ds="${ds}">Abrir / editar este dia</button></div>
    <div class="kpis" style="margin:12px 0 4px">
      <div class="kpi"><b>${st.touched ? Math.round(st.pct * 100) + '%' : '—'}</b><span>cumprimento da rotina</span></div>
      <div class="kpi"><b>${fmtMin(st.actual)}</b><span>tempo estudado (planejado: ${fmtMin(st.planned)})</span></div>
      <div class="kpi"><b>${st.done}</b><span>concluídas</span></div>
      <div class="kpi"><b>${st.part}</b><span>parciais · ${st.notdone} não realizadas</span></div></div>
    ${items.length ? items.map(a => `<div class="hrow"><span class="s">${statusIcon(a.r.st)}</span><div class="grow"><b>${esc(a.label)}</b>
      <div class="small muted">${a.r.disc ? esc(a.r.disc) + (a.r.topic ? ' · ' + esc(a.r.topic) : '') + ' · ' : ''}${a.r.actual != null && a.r.actual !== '' ? fmtMin(a.r.actual) + ' dedicados' : 'tempo não informado'}${a.r.doneAt ? ' · às ' + fmtHM(a.r.doneAt) : ''}</div>
      ${a.r.note ? `<div class="small">📝 ${esc(a.r.note)}</div>` : ''}</div></div>`).join('') : '<p class="muted">Nenhuma atividade marcada neste dia.</p>'}
    ${rec && (rec.extras || []).length ? `<h3 style="margin-top:12px">Fora da rotina</h3>${rec.extras.map(e => `<div class="hrow"><span class="s">➕</span><div class="grow"><b>${esc(e.label)}</b><div class="small muted">${fmtMin(e.min)}</div></div></div>`).join('')}` : ''}
    ${rec && rec.note ? `<h3 style="margin-top:12px">Observações do dia</h3><p>${esc(rec.note)}</p>` : ''}</div>`;
}

/* ---------- desempenho ---------- */
function weekStats(mon) {
  const days = [0, 1, 2, 3, 4, 5].map(i => { const ds = addDays(mon, i); return { ds, st: dayStats(ds) }; });
  const rec = days.filter(d => d.st && d.st.touched);
  const sum = f => rec.reduce((s, d) => s + f(d.st), 0);
  return {
    days, n: rec.length, actual: sum(s => s.actual), planned: sum(s => s.planned), done: sum(s => s.done),
    avgDone: rec.length ? sum(s => s.done) / rec.length : 0,
    fulfilled: rec.filter(d => d.st.pct >= FULFILLED).length,
    avgPct: rec.length ? sum(s => s.pct) / rec.length : 0
  };
}
function bars(vals, labels, opts) {
  const W = 320, H = 130, pb = 22, pt = 8, n = vals.length, max = Math.max(1, ...vals.flat()), bw = (W - 20) / n;
  let s = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(opts.alt)}">`;
  vals.forEach((v, i) => {
    const arr = Array.isArray(v) ? v : [v], k = arr.length, w = (bw - 8) / k;
    arr.forEach((x, j) => {
      const h = (H - pb - pt) * x / max;
      s += `<rect class="${j === 0 && k > 1 ? 'pl' : 'rl'}" x="${10 + i * bw + 4 + j * w}" y="${H - pb - h}" width="${w - 1}" height="${Math.max(h, x > 0 ? 1.5 : 0)}" rx="3"/>`;
    });
    s += `<text x="${10 + i * bw + bw / 2}" y="${H - 7}" text-anchor="middle">${labels[i]}</text>`;
  });
  return s + `<line x1="10" x2="${W - 10}" y1="${H - pb}" y2="${H - pb}" stroke="var(--line)"/></svg>`;
}
function viewPerf() {
  const mon = state.wMon, w = weekStats(mon), sun = addDays(mon, 6);
  const evo = []; for (let i = 7; i >= 0; i--) { const m = addDays(mon, -7 * i), ws = weekStats(m); evo.push({ m, h: ws.actual / 60, p: ws.avgPct }); }
  return `<div class="datebar"><button class="btn sq" data-a="wkPrev" aria-label="Semana anterior">‹</button>
    <div class="grow" style="text-align:center;font-weight:700">${fmtBR(mon).slice(0, 5)} a ${fmtBR(sun).slice(0, 5)}</div>
    <button class="btn sq" data-a="wkNext" aria-label="Próxima semana">›</button><button class="btn" data-a="wkToday">Atual</button></div>
    <div class="kpis">
      <div class="kpi"><b>${(w.actual / 60).toFixed(1).replace('.', ',')} h</b><span>horas de estudo na semana</span></div>
      <div class="kpi"><b>${w.avgDone.toFixed(1).replace('.', ',')}</b><span>média diária de atividades concluídas</span></div>
      <div class="kpi"><b>${w.fulfilled} de ${w.n}</b><span>dias com rotina cumprida (≥80%)</span></div>
      <div class="kpi"><b>${w.n ? Math.round(w.avgPct * 100) + '%' : '—'}</b><span>cumprimento médio</span></div></div>
    <section class="card"><h3>Planejado × realizado por dia</h3>
      <p class="small muted" style="margin:2px 0 8px"><span style="color:var(--info)">■</span> planejado · <span style="color:var(--accent)">■</span> realizado (em minutos)</p>
      ${bars(w.days.map(d => d.st && d.st.touched ? [d.st.planned, d.st.actual] : [0, 0]), w.days.map(d => WD3[parse(d.ds).getDay()]), { alt: 'Planejado x realizado por dia' })}
      <p class="small muted" style="margin:8px 0 0">Planejado: ${fmtMin(w.planned)} · Realizado: ${fmtMin(w.actual)} (somente dias com registro)</p></section>
    <section class="card"><h3>Evolução semanal (horas)</h3>
      ${bars(evo.map(e => e.h), evo.map(e => fmtBR(e.m).slice(0, 5)), { alt: 'Horas estudadas nas últimas 8 semanas' })}
      <p class="small muted" style="margin:8px 0 0">Cumprimento médio: ${evo.map(e => e.p ? Math.round(e.p * 100) + '%' : '–').join(' · ')}</p></section>
    <p class="small muted" style="text-align:center">Dia não realizado não é falha: é informação para ajustar o plano.</p>`;
}

/* ---------- configurações ---------- */
function viewCfg() {
  const S = db.settings;
  const grp = p => S.acts.filter(a => a.p === p).map(a => `<div class="cfgact" data-cid="${a.id}">
      <div><label class="sm">Descrição</label><input type="text" data-c="label" value="${esc(a.label)}"></div>
      <div class="g2"><div><label class="sm">Minutos</label><input type="number" min="0" data-c="min" value="${a.min}"></div>
        <div><label class="sm">Início</label><input type="time" data-c="start" value="${a.start || ''}"></div>
        <div><label class="sm">Fim</label><input type="time" data-c="end" value="${a.end || ''}"></div></div>
      <div class="row wrap"><label class="switch"><input type="checkbox" data-c="enabled" ${a.enabled ? 'checked' : ''}> Ativa</label>
        <label class="switch"><input type="checkbox" data-c="opt" ${a.opt ? 'checked' : ''}> Opcional (não pesa se ficar em branco)</label></div></div>`).join('');
  const plan = [1, 2, 3, 4, 5].map(d => `<div class="planrow"><b>${WD[d]}</b>${DISCS.map(x => `<label><input type="checkbox" data-plan="${d}" value="${esc(x)}" ${(S.plan[d] || []).includes(x) ? 'checked' : ''}>${esc(x)}</label>`).join('')}</div>`).join('');
  const topics = DISCS.map(d => `<details class="cfg" style="margin:8px 0"><summary style="font-weight:600">${esc(d)}</summary><div class="inner"><textarea class="fld" data-topics="${esc(d)}" rows="8" style="min-height:140px">${esc((S.topics[d] || []).join('\n'))}</textarea></div></details>`).join('');
  const dayCount = Object.keys(db.days).length;
  return `<details class="cfg" open><summary>🎨 Aparência</summary><div class="inner">
      <label class="sm small muted">Tema</label>
      <select class="fld" data-theme-sel><option value="auto" ${S.theme === 'auto' ? 'selected' : ''}>Automático (segue o aparelho)</option><option value="light" ${S.theme === 'light' ? 'selected' : ''}>Claro</option><option value="dark" ${S.theme === 'dark' ? 'selected' : ''}>Escuro</option></select></div></details>
    <details class="cfg"><summary>🎧 Deslocamentos</summary><div class="inner">${grp('desl')}</div></details>
    <details class="cfg"><summary>💼 Intervalos no trabalho</summary><div class="inner">
      <label class="sm small muted">Texto do horário de trabalho</label><input class="fld" data-work value="${esc(S.work)}">${grp('trab')}</div></details>
    <details class="cfg"><summary>🌙 Estudo noturno</summary><div class="inner">${grp('noite')}</div></details>
    <details class="cfg"><summary>⏱️ Sábado</summary><div class="inner">${grp('sat')}</div></details>
    <details class="cfg"><summary>🗓️ Plano semanal de disciplinas</summary><div class="inner"><p class="small muted">Define as sugestões de disciplina/assunto para cada dia útil.</p><div class="plangrid">${plan}</div></div></details>
    <details class="cfg"><summary>📚 Assuntos por disciplina</summary><div class="inner"><p class="small muted">Um assunto por linha, na ordem em que pretende estudar. Lista inicial é genérica — adapte ao seu edital.</p>${topics}</div></details>
    <details class="cfg" open><summary>💾 Dados e backup</summary><div class="inner">
      <p class="small muted">Tudo fica salvo neste aparelho (${dayCount} dia(s) com registro). Faça backup de vez em quando — ele é a sua garantia se trocar de celular ou limpar o navegador.</p>
      <div class="grid" style="display:grid;gap:8px">
        <button class="btn primary" data-a="expJson">⬇️ Exportar backup (JSON)</button>
        <button class="btn" data-a="expCsv">📄 Exportar registros (CSV)</button>
        <label class="btn" style="display:grid;place-items:center">⬆️ Importar backup (substituir tudo)<input type="file" id="impReplace" accept=".json,application/json" hidden></label>
        <label class="btn" style="display:grid;place-items:center">➕ Importar backup (mesclar com o atual)<input type="file" id="impMerge" accept=".json,application/json" hidden></label>
        ${state.installEvt ? '<button class="btn" data-a="install">📲 Instalar na tela inicial</button>' : ''}
        <button class="btn" data-a="resetCfg">↺ Restaurar rotina padrão (mantém o histórico)</button>
        <button class="btn danger" data-a="wipe">🗑️ Apagar todos os registros…</button></div></div></details>
    <p class="small muted" style="text-align:center">Rotina Auditor Fiscal · sem conta, sem internet obrigatória · <span id="swState"></span></p>`;
}

/* ------------------------------ eventos ------------------------------ */
function download(name, text, type) {
  const b = new Blob([text], { type }), a = document.createElement('a');
  a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
}
function exportJson() { download(`backup-rotina-auditor-${todayStr()}.json`, JSON.stringify(db, null, 1), 'application/json'); toast('Backup exportado'); }
function csvCell(v) { v = v == null ? '' : String(v); return /[;"\n\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v; }
function exportCsv() {
  const rows = [['Data', 'Dia da semana', 'Período', 'Atividade', 'Situação', 'Tempo planejado (min)', 'Tempo realizado (min)', 'Concluída em', 'Disciplina', 'Assunto', 'Observações']];
  const sit = { done: 'Concluída', partial: 'Parcial', skip: 'Não realizada' };
  Object.keys(db.days).sort().forEach(ds => {
    const st = dayStats(ds), rec = db.days[ds];
    if (st) st.items.filter(a => a.r.st || a.r.actual != null || a.r.note || a.r.acc).forEach(a =>
      rows.push([fmtBR(ds), WD[parse(ds).getDay()], PERIODS[a.p].t, a.label, sit[a.r.st] || 'Sem marcação', a.min, a.r.actual != null ? a.r.actual : '', a.r.doneAt ? fmtBR(ymd(new Date(a.r.doneAt))) + ' ' + fmtHM(a.r.doneAt) : '', a.r.disc || '', a.r.topic || '', a.r.note || '']));
    (rec.extras || []).forEach(e => rows.push([fmtBR(ds), WD[parse(ds).getDay()], 'Fora da rotina', e.label, 'Concluída', '', e.min, e.at ? fmtBR(ymd(new Date(e.at))) + ' ' + fmtHM(e.at) : '', '', '', '']));
    if (rec.note) rows.push([fmtBR(ds), WD[parse(ds).getDay()], 'Dia', 'Observações do dia', '', '', '', '', '', '', rec.note]);
  });
  download(`registros-rotina-auditor-${todayStr()}.csv`, '﻿' + rows.map(r => r.map(csvCell).join(';')).join('\r\n'), 'text/csv;charset=utf-8');
  toast('CSV exportado (separador ponto e vírgula)');
}
function importFile(file, merge) {
  const fr = new FileReader();
  fr.onload = () => {
    try {
      const d = JSON.parse(fr.result);
      if (!d || typeof d !== 'object' || typeof d.days !== 'object') throw new Error('formato');
      const n = Object.keys(d.days).length;
      if (!confirm(merge ? `Mesclar ${n} dia(s) do arquivo com os dados atuais? (dias iguais serão sobrescritos pelos do arquivo)` : `SUBSTITUIR todos os dados atuais pelos ${n} dia(s) do arquivo? Isso não pode ser desfeito.`)) return;
      if (merge) { Object.assign(db.days, d.days); } else db = migrate(d);
      save(); applyTheme(); render(); toast('Backup importado');
    } catch (e) { toast('Arquivo inválido: não é um backup deste aplicativo.'); }
  };
  fr.readAsText(file);
}
function goDate(ds) { state.date = ds; state.follow = ds === todayStr(); render(); }

document.addEventListener('click', e => {
  const tab = e.target.closest('[data-tab]');
  if (tab) { state.tab = tab.dataset.tab; render(); window.scrollTo(0, 0); return; }
  const b = e.target.closest('[data-a]'); if (!b) return;
  const act = b.dataset.a, box = b.closest('[data-id]');
  const ds = box ? box.dataset.ds : null, id = box ? box.dataset.id : null;
  switch (act) {
    case 'toggleTheme': { const dark = document.documentElement.getAttribute('data-theme') === 'dark' || (!document.documentElement.getAttribute('data-theme') && matchMedia('(prefers-color-scheme: dark)').matches); db.settings.theme = dark ? 'light' : 'dark'; save(); applyTheme(); render(); break; }
    case 'done': case 'partial': case 'skip': setStatus(ds, id, act); break;
    case 'more': { const k = ds + id; state.open.has(k) ? state.open.delete(k) : state.open.add(k); render(); break; }
    case 'useMin': { const r = actRec(ds, id, true), a = getAct(id); r.actual = a.min; r.label = a.label; r.min = a.min; save(); render(); break; }
    case 'useSug': { const a = getAct(id), s = suggestFor(ds, a); if (s) { const r = actRec(ds, id, true); r.disc = s.disc; r.topic = s.topic; r.label = a.label; r.min = a.min; save(); render(); } break; }
    case 'tStart': timerAction(ds, id, 'start'); break;
    case 'tPause': timerAction(ds, id, 'pause'); break;
    case 'tFinish': timerAction(ds, id, 'finish'); break;
    case 'tReset': timerAction(ds, id, 'reset'); break;
    case 'dayPrev': goDate(addDays(state.date, -1)); break;
    case 'dayNext': goDate(addDays(state.date, 1)); break;
    case 'dayToday': goDate(todayStr()); break;
    case 'satPrev': state.satDate = addDays(state.satDate, -7); render(); break;
    case 'satNext': state.satDate = addDays(state.satDate, 7); render(); break;
    case 'satToday': state.satDate = satOf(todayStr()); render(); break;
    case 'monPrev': case 'monNext': { let [y, m] = state.hMonth.split('-').map(Number); m += act === 'monNext' ? 1 : -1; if (m < 1) { m = 12; y--; } if (m > 12) { m = 1; y++; } state.hMonth = `${y}-${pad(m)}`; state.hSel = null; render(); break; }
    case 'histDay': state.hSel = b.dataset.ds; render(); break;
    case 'editDay': state.tab = 'today'; goDate(b.dataset.ds); window.scrollTo(0, 0); break;
    case 'wkPrev': state.wMon = addDays(state.wMon, -7); render(); break;
    case 'wkNext': state.wMon = addDays(state.wMon, 7); render(); break;
    case 'wkToday': state.wMon = mondayOf(todayStr()); render(); break;
    case 'addExtra': {
      const l = $('#exLabel').value.trim(), m = Math.round(+$('#exMin').value);
      if (!l || !(m > 0)) { toast('Informe o que estudou e os minutos.'); break; }
      const d = dayRec(state.date, true); d.extras = d.extras || []; d.extras.push({ id: uid(), label: l, min: m, at: new Date().toISOString() });
      save(); render(); toast('Atividade registrada'); break;
    }
    case 'delExtra': { const d = dayRec(state.date); if (d) { d.extras = d.extras.filter(x => x.id !== b.closest('[data-eid]').dataset.eid); save(); render(); } break; }
    case 'expJson': exportJson(); break;
    case 'expCsv': exportCsv(); break;
    case 'install': if (state.installEvt) { state.installEvt.prompt(); state.installEvt = null; } break;
    case 'resetCfg':
      if (confirm('Restaurar a rotina padrão (atividades, horários, plano e assuntos)? O histórico NÃO será apagado.')) { const f = freshDB(); db.settings.acts = f.settings.acts; db.settings.plan = f.settings.plan; db.settings.topics = f.settings.topics; db.settings.work = f.settings.work; save(); render(); toast('Rotina padrão restaurada'); }
      break;
    case 'wipe': {
      const n = Object.keys(db.days).length;
      if (!n) { toast('Não há registros para apagar.'); break; }
      if (!confirm(`Você vai apagar TODOS os ${n} dia(s) de registro deste aparelho. Considere exportar um backup antes. Continuar?`)) break;
      const t = prompt('Para confirmar, digite APAGAR (em maiúsculas):');
      if (t === 'APAGAR') { db.days = {}; save(); state.hSel = null; render(); toast('Registros apagados'); } else toast('Cancelado — nada foi apagado.');
      break;
    }
  }
});
document.addEventListener('input', e => {
  const t = e.target;
  const box = t.closest('[data-id]');
  if (t.dataset.f && box) {
    const ds = box.dataset.ds, id = box.dataset.id, r = actRec(ds, id, true), a = getAct(id);
    if (t.dataset.f === 'actual') { if (t.value === '') delete r.actual; else r.actual = Math.max(0, Math.round(+t.value)); }
    else if (t.dataset.f === 'note') r.note = t.value;
    else if (t.dataset.f === 'topic') r.topic = t.value;
    r.label = a.label; r.min = a.min; save();
    if (t.dataset.f === 'actual') refreshSummary(ds);
  } else if (t.dataset.f === 'daynote') { const ds = state.tab === 'sat' ? state.satDate : state.date; dayRec(ds, true).note = t.value; save(); }
  else if (t.dataset.c) {
    const a = getAct(t.closest('[data-cid]').dataset.cid), k = t.dataset.c;
    if (t.type === 'checkbox') a[k] = t.checked; else if (k === 'min') a.min = Math.max(0, Math.round(+t.value) || 0); else a[k] = t.value;
    save();
  } else if (t.dataset.work !== undefined) { db.settings.work = t.value; save(); }
  else if (t.dataset.topics) { db.settings.topics[t.dataset.topics] = t.value.split('\n').map(s => s.trim()).filter(Boolean); save(); }
});
document.addEventListener('change', e => {
  const t = e.target;
  if (t.id === 'datePick') { if (t.value) goDate(t.value); return; }
  const box = t.closest('[data-id]');
  if (t.dataset.f === 'disc' && box) { const r = actRec(box.dataset.ds, box.dataset.id, true), a = getAct(box.dataset.id); r.disc = t.value; r.label = a.label; r.min = a.min; save(); render(); }
  else if (t.dataset.plan) {
    const d = +t.dataset.plan, set = new Set(db.settings.plan[d] || []);
    t.checked ? set.add(t.value) : set.delete(t.value);
    db.settings.plan[d] = DISCS.filter(x => set.has(x)); save();
  } else if (t.dataset.themeSel !== undefined) { db.settings.theme = t.value; save(); applyTheme(); }
  else if (t.id === 'impReplace' || t.id === 'impMerge') { if (t.files[0]) importFile(t.files[0], t.id === 'impMerge'); t.value = ''; }
});

/* cronômetros (atualiza a cada segundo sem redesenhar a tela) */
function tickTimers() {
  document.querySelectorAll('[data-tv]').forEach(el => {
    const box = el.closest('[data-id]'); const r = actRec(box.dataset.ds, box.dataset.id, false);
    el.textContent = clock(r ? timerMs(r) : 0);
  });
}
setInterval(tickTimers, 1000);

/* virada de dia: abre o checklist novo sem apagar nada */
function checkDate() {
  if (state.follow && state.date !== todayStr()) { state.date = todayStr(); state.wMon = mondayOf(state.date); state.hMonth = state.date.slice(0, 7); state.satDate = satOf(state.date); render(); }
  const n = $('#netState'); if (n) n.textContent = navigator.onLine ? 'online' : 'offline — tudo funciona normalmente';
}
setInterval(checkDate, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) { checkDate(); if (state.tab === 'today') render(); } });
window.addEventListener('online', checkDate); window.addEventListener('offline', checkDate);
window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); state.installEvt = e; if (state.tab === 'cfg') render(); });

/* ------------------------------ início ------------------------------ */
applyTheme();
render();
checkDate();
try { if (navigator.storage && navigator.storage.persist) navigator.storage.persist(); } catch (e) {}
if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('service-worker.js').then(() => {
    navigator.serviceWorker.ready.then(() => { const s = $('#swState'); if (s) s.textContent = 'pronto para uso offline ✔'; });
  }).catch(() => {}));
}
