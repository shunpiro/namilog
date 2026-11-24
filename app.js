/* ===== 【JavaScript】波ログの動き =====
   ① 選択肢  ② 便利な道具  ③ ログインとデータ保存（Supabase）  ④ 写真・動画
   ⑤ 記録フォーム  ⑥ 画面を描く  ⑦ うねりの絵  ⑧ AIコーチ（Gemini／いつものAI）
   ⑨ 設定画面（これまでの記録の取り込みもここ）  ⑩ 起動                          */
{

/* ① 選択肢 ― ここを書き換えると選択肢が変わります（いちばん簡単な改造ポイント） */
const OPT = {
  timeOfDay: ['早朝', '朝', '昼', '午後', '夕方'],
  stance: ['レギュラー', 'グーフィー'],
  weather: ['晴れ', '晴れ時々くもり', 'くもり', '雨'],
  size: ['ひざ', 'もも', '腰', '腹', '胸', '肩', '頭', '頭オーバー'],
  swellDir: ['北', '北東', '東', '南東', '南', '南西', '西', '北西'],
  wind: ['オフショア', 'サイド', 'オンショア'],
  windStr: ['無風', '弱い', 'ふつう', '強い'],
  tide: ['干潮', '上げ', '満潮', '下げ'],
  waveType: ['A中心', 'B中心', 'AもBも'],
  falls: ['波が下を通過', 'パーリング', '立つのが遅れた', '立った後に減速', 'バランスを崩した', '波がすぐ潰れた', 'ワイプアウト', '人を避けた'],
};
const LEVEL = { // 1〜5の段階で保存するもの
  ach: ['まだまだ', '少し', '半分', 'ほぼ', 'できた！'],
  paddle: ['きつい', 'やや重い', 'ふつう', 'よく進む', '絶好調'],
  rate: ['★', '★★', '★★★', '★★★★', '★★★★★'],
};
const PRESET_THEMES = ['座ったまま方向転換', 'パドルで波をキャッチ', '波選び（A/B）', 'テイクオフのタイミング', '寝る位置', '立つ位置と体重', '立った後の加速', 'パーリングしない', '横に滑る'];
const PRESET_SPOTS = ['Canoes', "Queen's", 'Populars', 'Publics', 'Ala Moana Bowls', 'Kewalos', 'Diamond Head'];
const DEFAULT_MODEL = 'gemini-3.5-flash';

/* ② 便利な道具 */
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };
const store = { get: k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
  set: (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} } };

/* 言語 ― 画面の文字は i18n.js の対応表から取り出す
   決め方：設定で選んだ言語 → なければ端末の言語 → 対応していなければ英語                */
const I18N = window.NAMILOG_I18N || { en: {} };
const lang = (() => {
  const saved = store.get('namilog-lang'); if (I18N[saved]) return saved;
  const prefs = (navigator.languages?.length ? navigator.languages : [navigator.language || '']).map(l => String(l).slice(0, 2).toLowerCase());
  return prefs.find(l => I18N[l]) || 'en';
})();
const TX = I18N[lang], EN = I18N.en || {};
const fill = (s, v = {}) => String(s).replace(/\{(\w+)\}/g, (m, n) => v[n] ?? m); // {n} を数字などに置き換える
const t = (k, v) => fill(TX[k] ?? EN[k] ?? k, v);                 // 画面の文字
const optL = v => TX._opt?.[v] ?? v;                               // 選択肢の表示名（保存は日本語のまま）
const lvL = (k, n) => (TX._level?.[k] || LEVEL[k])[n - 1];         // 1〜5段階の表示名
const fld = k => TX._field?.[k] ?? EN._field?.[k] ?? k;            // 記録の項目名
const pt = (k, v) => fill(TX._prompt?.[k] ?? EN._prompt?.[k] ?? '', v); // AIへの指示書の文
const DOW = TX._dow || ['日', '月', '火', '水', '木', '金', '土'];
const THEMES = TX._themes || PRESET_THEMES;
const fmtH = m => { const h = Math.floor(m / 60), r = m % 60; return h ? t(r ? 'hm' : 'h', { h, m: r }) : t('m', { m: r }); };
// 画面に最初からある文字を、選んだ言語に入れ替える（data-i18n＝文字、-ph＝入力欄の薄い例文、-aria＝読み上げ用の名前）
function applyI18n() {
  document.documentElement.lang = lang; document.title = t('app');
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-html]').forEach(el => { el.innerHTML = t(el.dataset.i18nHtml); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-aria]').forEach(el => { el.setAttribute('aria-label', t(el.dataset.i18nAria)); });
  // 言語の切り替えボタン（ログイン画面と設定画面）。押したら覚えて、ページを読み込み直す
  const names = window.NAMILOG_LANG_NAMES || {};
  document.querySelectorAll('.langsw').forEach(el => {
    el.innerHTML = Object.keys(I18N).map(c => `<button type="button" data-lang="${c}" class="${c === lang ? 'on' : ''}">${esc(names[c] || c)}</button>`).join('');
  });
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-lang]'); if (!b || b.dataset.lang === lang) return;
  store.set('namilog-lang', b.dataset.lang); location.reload();
});
applyI18n();
const minutesBetween = (a, b) => { if (!a || !b) return null; const [h1, m1] = a.split(':').map(Number), [h2, m2] = b.split(':').map(Number); let d = (h2 * 60 + m2) - (h1 * 60 + m1); if (d < 0) d += 1440; return d; };
function setStatus(t, bad) { $('status').className = 'status' + (bad ? ' bad' : ''); $('status').innerHTML = '<i></i><span>' + esc(t) + '</span>'; }

/* アプリの「状態」 */
let sb = null, user = null, items = [], profile = {}, editing = null, confirmId = null;
let formMedia = [], origMedia = [], urlCache = {}, coachBusy = {}, coachErr = {}, openAdv = new Set(), pasteOpen = null;
let lastDeleted = null, toastT = 0;

/* ③ ログインとデータ保存（Supabase）
   sessions テーブル：1回のセッション = 1行。中身は data（JSON）にまとめて入れる
   profile テーブル：自分のプロフィール 1行                                      */
async function loadAll() {
  const [s, p] = await Promise.all([
    sb.from('sessions').select('id,date,data,updated_at').order('date', { ascending: false }),
    sb.from('profile').select('data').maybeSingle(),
  ]);
  if (s.error) throw s.error;
  items = s.data.map(r => ({ id: r.id, ...r.data, date: r.date }));
  profile = p.data?.data || {};
  await signMedia(items.flatMap(x => x.media || []));
}
async function saveRec(rec) {
  const { id, ...data } = rec;
  const row = { date: rec.date, data, updated_at: new Date().toISOString() };
  if (id) row.id = id;
  const { data: out, error } = await sb.from('sessions').upsert(row).select('id').single();
  if (error) throw error;
  const saved = { ...rec, id: out.id };
  const i = items.findIndex(x => x.id === saved.id);
  if (i >= 0) items[i] = saved; else items.push(saved);
  return saved;
}
async function deleteRec(id) {
  const { error } = await sb.from('sessions').delete().eq('id', id);
  if (error) throw error;
  items = items.filter(x => x.id !== id);
}
async function saveProfile(p) {
  const { error } = await sb.from('profile').upsert({ user_id: user.id, data: p });
  if (error) throw error;
  profile = p;
}

/* ④ 写真・動画 ― Storage の media フォルダに「自分のID/ファイル名」で保存 */
const BUCKET = 'media';
async function signMedia(list) {
  const need = list.map(m => m.path).filter(p => p && !urlCache[p]);
  if (!need.length) return;
  const { data } = await sb.storage.from(BUCKET).createSignedUrls(need, 60 * 60 * 12);
  (data || []).forEach(d => { if (d.signedUrl) urlCache[d.path] = d.signedUrl; });
}
async function shrink(file) { // 写真を長辺1600pxのJPEGに縮める
  try {
    const bmp = await createImageBitmap(file); const k = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas'); c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise(r => c.toBlob(b => r(b), 'image/jpeg', 0.82));
  } catch (e) { return null; }
}
async function addFiles(files) {
  for (const f of files) {
    const tmp = { path: 'up' + Math.random(), kind: 'up' }; formMedia.push(tmp); drawFormMedia();
    try {
      let blob = f, kind = 'image', ext = 'jpg';
      if (f.type.startsWith('image/')) { blob = await shrink(f) || f; }
      else if (f.type.startsWith('video/')) { kind = 'video'; ext = (f.name.split('.').pop() || 'mp4').toLowerCase(); if (f.size > 50 * 1024 * 1024) throw new Error('too_large'); }
      else throw new Error('type');
      const path = `${user.id}/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`;
      const { error } = await sb.storage.from(BUCKET).upload(path, blob, { contentType: blob.type || f.type || 'application/octet-stream' });
      if (error) throw error;
      Object.assign(tmp, { path, kind }); await signMedia([tmp]);
    } catch (e) {
      formMedia = formMedia.filter(x => x !== tmp);
      toast(e.message === 'too_large' ? t('tooLarge') : t('upFail', { e: e.message || 'error' }));
    }
    drawFormMedia();
  }
}
async function dropMedia(list) { const paths = list.map(m => m.path).filter(p => p && !p.startsWith('up')); if (paths.length) await sb.storage.from(BUCKET).remove(paths).catch(() => {}); }
function thumbHtml(m, removable) {
  if (m.kind === 'up') return `<div class="thumb up">${t('uploading')}</div>`;
  const u = esc(urlCache[m.path] || '');
  const inner = m.kind === 'video' ? `<video src="${u}#t=0.1" muted playsinline preload="metadata"></video><span class="play">▶</span>` : `<img src="${u}" alt="" loading="lazy">`;
  return `<button type="button" class="thumb" data-view="${esc(m.path)}" data-kind="${m.kind}" aria-label="${t('zoom')}">${inner}${removable ? `<span class="x" data-rm="${esc(m.path)}" role="button" aria-label="${t('remove')}">×</span>` : ''}</button>`;
}
function drawFormMedia() {
  $('formMedia').innerHTML = formMedia.map(m => thumbHtml(m, true)).join('') +
    `<label class="addm">${t('addMedia')}<input type="file" id="fileIn" accept="image/*,video/*" multiple></label>`;
}
$('formMedia').addEventListener('change', e => { if (e.target.id === 'fileIn' && e.target.files.length) addFiles([...e.target.files]); });
$('formMedia').addEventListener('click', e => {
  const rm = e.target.closest('[data-rm]');
  if (rm) { e.preventDefault(); e.stopPropagation(); formMedia = formMedia.filter(m => m.path !== rm.dataset.rm); drawFormMedia(); saveDraft(); return; }
  openViewer(e);
});
function openViewer(e) {
  const t = e.target.closest('[data-view]'); if (!t) return; e.preventDefault();
  const src = esc(urlCache[t.dataset.view] || '');
  $('lbBody').innerHTML = t.dataset.kind === 'video' ? `<video src="${src}" controls autoplay playsinline></video>` : `<img src="${src}" alt="">`;
  $('lb').classList.add('on');
}
const closeViewer = () => { $('lb').classList.remove('on'); $('lbBody').innerHTML = ''; };
$('lbClose').addEventListener('click', closeViewer);
$('lb').addEventListener('click', e => { if (e.target.id === 'lb') closeViewer(); });

/* ⑤ 記録フォーム ― チップを作り、開く・閉じる・下書き保存・保存する */
const form = $('form');
document.querySelectorAll('[data-chips]').forEach(el => {
  // 保存する値（value）は日本語や数字のまま。見える文字（span）だけ選んだ言語にする
  const k = el.dataset.chips, lv = LEVEL[k], arr = lv || OPT[k];
  el.innerHTML = arr.map((v, i) => `<label><input type="radio" name="${k}" value="${lv ? i + 1 : esc(v)}"><span>${esc(lv ? lvL(k, i + 1) : optL(v))}</span></label>`).join('');
});
document.querySelectorAll('[data-multi]').forEach(el => {
  const k = el.dataset.multi;
  el.innerHTML = OPT[k].map(v => `<label><input type="checkbox" name="${k}" value="${esc(v)}"><span>${esc(optL(v))}</span></label>`).join('');
});
document.querySelectorAll('[data-step-for]').forEach(el => {
  const k = el.dataset.stepFor;
  el.innerHTML = `<button type="button" data-step="-1" data-k="${k}" aria-label="${t('minus')}">−</button><input type="number" name="${k}" min="0" max="200" inputmode="numeric"><button type="button" data-step="1" data-k="${k}" aria-label="${t('plus')}">＋</button>`;
});
$('themePresets').innerHTML = THEMES.map(v => `<button type="button" data-theme="${esc(v)}">${esc(v)}</button>`).join('');
$('themePresets').addEventListener('click', e => { const b = e.target.closest('[data-theme]'); if (b) { form.theme.value = b.dataset.theme; saveDraft(); } });
// ラジオは「もう一度押すと解除」できるようにする（押す前に選ばれていたかを覚えておく）
let wasChecked = null;
form.addEventListener('pointerdown', e => { const r = e.target.closest('.chips label')?.querySelector('input[type=radio]'); wasChecked = r?.checked ? r : null; });
form.addEventListener('click', e => {
  const b = e.target.closest('[data-step]');
  if (b) { const inp = form[b.dataset.k]; inp.value = Math.max(0, (+inp.value || 0) + (+b.dataset.step)); saveDraft(); return; }
  if (e.target.type === 'radio' && e.target === wasChecked) { e.target.checked = false; wasChecked = null; saveDraft(); }
});

const TEXTS = ['date', 'start', 'end', 'spot', 'board', 'forecast', 'theme', 'longest', 'newSkill', 'growth', 'next', 'memo', 'body', 'english'];
const NUMS = ['period', 'takeoffs', 'caught', 'rides'];
const RADIOS = ['timeOfDay', 'stance', 'weather', 'size', 'swellDir', 'wind', 'windStr', 'tide', 'waveType', 'ach', 'paddle', 'rate'];
const LEVELS = ['ach', 'paddle', 'rate'];
function readForm() {
  const rec = {};
  for (const k of TEXTS) { const v = form[k].value.trim(); if (v) rec[k] = v; }
  for (const k of NUMS) { const v = form[k].value; if (v !== '') rec[k] = +v; }
  for (const k of RADIOS) { const r = form.querySelector(`input[name=${k}]:checked`); if (r) rec[k] = LEVELS.includes(k) ? +r.value : r.value; }
  const falls = [...form.querySelectorAll('input[name=falls]:checked')].map(x => x.value); if (falls.length) rec.falls = falls;
  const mins = minutesBetween(rec.start, rec.end); if (mins != null) rec.mins = mins;
  rec.media = formMedia.filter(m => m.kind !== 'up').map(({ path, kind }) => ({ path, kind }));
  return rec;
}
function fillForm(rec) {
  form.reset();
  for (const k of [...TEXTS, ...NUMS]) form[k].value = rec[k] ?? '';
  for (const k of RADIOS) { if (rec[k] == null) continue; const r = form.querySelector(`input[name=${k}][value="${CSS.escape(String(rec[k]))}"]`); if (r) r.checked = true; }
  for (const v of rec.falls || []) { const c = form.querySelector(`input[name=falls][value="${CSS.escape(v)}"]`); if (c) c.checked = true; }
}
const DRAFT = 'namilog-draft';
function saveDraft() { if (form.hidden || editing) return; store.set(DRAFT, JSON.stringify(readForm())); }
form.addEventListener('input', saveDraft); form.addEventListener('change', saveDraft);

function openForm(rec) {
  editing = rec ? rec.id : null;
  const last = sorted()[0];
  let draft = null; if (!rec) { try { draft = JSON.parse(store.get(DRAFT) || 'null'); } catch (e) {} }
  const d = new Date();
  const base = rec || draft || {
    date: today(), start: `${pad(d.getHours())}:${pad(Math.floor(d.getMinutes() / 15) * 15)}`,
    spot: last?.spot || '', board: last?.board || '', stance: last?.stance || (/グーフィー/.test(profile.stance || '') ? 'グーフィー' : 'レギュラー'),
    theme: last?.next || last?.theme || '', takeoffs: 0, caught: 0, rides: 0,
  };
  fillForm(base);
  origMedia = rec?.media ? [...rec.media] : []; formMedia = [...(base.media || [])];
  drawFormMedia();
  form.hidden = false; $('openForm').hidden = true; $('homework').hidden = true;
  $('saveBtn').textContent = rec ? t('saveChanges') : t('saveOnly'); $('saveCoach').hidden = !!rec;
  $('saveBtn').classList.toggle('pri', !!rec);
  if (draft && !rec) toast(t('draftBack'));
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function closeForm(saved) {
  if (!saved && !editing) { /* 下書きは残す（写真も残す） */ }
  if (!saved && editing) dropMedia(formMedia.filter(m => !origMedia.some(o => o.path === m.path)));
  form.hidden = true; editing = null; formMedia = []; origMedia = [];
  $('openForm').hidden = false; $('homework').hidden = false;
}
$('openForm').addEventListener('click', () => openForm(null));
$('cancelBtn').addEventListener('click', () => closeForm(false));

form.addEventListener('submit', async e => {
  e.preventDefault();
  if (formMedia.some(m => m.kind === 'up')) { toast(t('waitUpload')); return; }
  const old = editing ? items.find(x => x.id === editing) : null;
  const rec = { ...readForm(), id: editing || undefined, updated: Date.now() };
  if (old?.advice) rec.advice = old.advice;
  for (const k of ['seedId', 'dateNote']) if (old?.[k]) rec[k] = old[k];
  if (!rec.date || !rec.spot) { toast(t('needDateSpot')); return; }
  const withCoach = e.submitter?.dataset.coach === '1';
  const btns = [$('saveBtn'), $('saveCoach')]; btns.forEach(b => b.disabled = true);
  try {
    const saved = await saveRec(rec);
    console.log('保存できた', saved); // 確認用：保存したデータを開発者ツールのConsoleに出す
    if (old) dropMedia(origMedia.filter(o => !formMedia.some(m => m.path === o.path)));
    else store.set(DRAFT, '');
    closeForm(true); render();
    if (withCoach) { openAdv.add(saved.id); goTo(saved.id); askCoach(saved.id); }
    else toast(old ? t('changed') : t('saved'));
  } catch (err) { toast(t('saveFail', { e: err.message || 'error' })); }
  btns.forEach(b => b.disabled = false);
});

function toast(msg, undo) {
  $('toastMsg').textContent = msg; $('undo').hidden = !undo; $('toast').classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => { $('toast').classList.remove('on'); if (undo && lastDeleted) { dropMedia(lastDeleted.media || []); lastDeleted = null; } }, undo ? 7000 : 2800);
}
$('undo').addEventListener('click', async () => {
  const r = lastDeleted; lastDeleted = null; $('toast').classList.remove('on');
  if (r) { const { id, ...rest } = r; await saveRec(rest).catch(() => toast(t('undoFail'))); render(); }
});

/* ⑥ 画面を描く ― データ(items)から毎回作り直す。これがアプリの心臓部 */
const sorted = () => [...items].sort((a, b) => (b.date + (b.start || '')).localeCompare(a.date + (a.start || '')));
const uniq = a => [...new Set(a.filter(Boolean))];
const md = s => { const [, m, d] = s.split('-'); return `${+m}/${+d}`; };

function render() {
  const all = sorted();
  const ym = today().slice(0, 7);
  const mins = all.reduce((s, x) => s + (x.mins || 0), 0), rides = all.reduce((s, x) => s + (x.rides || 0), 0);
  $('stats').innerHTML = [[t('times', { n: all.filter(x => x.date.startsWith(ym)).length }), t('statMonth')], [t('times', { n: all.length }), t('statAll')],
    [t('rides', { n: rides }), t('statRides')], [mins ? fmtH(mins) : '—', t('statTime')]]
    .map(([b, s]) => `<div class="stat"><b>${b}</b><span>${s}</span></div>`).join('');
  const hw = all.find(x => x.next);
  $('homework').innerHTML = hw && hw === all[0] ? `<div class="hw"><small>${esc(t('prevHw', { d: md(hw.date), s: hw.spot }))}</small><b>${esc(hw.next)}</b></div>` : '';
  $('spotList').innerHTML = uniq([...all.map(x => x.spot), ...PRESET_SPOTS]).map(s => `<option value="${esc(s)}">`).join('');
  $('boardList').innerHTML = uniq(all.map(x => x.board)).map(s => `<option value="${esc(s)}">`).join('');
  $('themeList').innerHTML = uniq([...all.map(x => x.theme), ...THEMES]).map(s => `<option value="${esc(s)}">`).join('');

  const q = $('q').value.trim().toLowerCase();
  const shown = q ? all.filter(x => JSON.stringify(x).toLowerCase().includes(q)) : all;
  $('list').innerHTML = shown.length ? shown.map(logHtml).join('')
    : q ? `<div class="empty"><b>${t('notFound')}</b>${t('notFoundSub')}</div>`
      : `<div class="empty"><b>${t('noLogs')}</b>${t('noLogsSub')}</div>`;

  const sk = all.filter(x => x.newSkill);
  $('skills').innerHTML = sk.length ? `<ul class="skills">${sk.map(x => `<li><time>${md(x.date)}</time><span>${esc(x.newSkill)}</span></li>`).join('')}</ul>`
    : `<div class="empty">${t('skillsEmpty')}</div>`;

  const th = {}; for (const x of [...all].reverse()) if (x.theme) (th[x.theme] ??= []).push(x);
  const tl = Object.entries(th).sort((a, b) => b[1].at(-1).date.localeCompare(a[1].at(-1).date)).slice(0, 8);
  $('growthBox').innerHTML = tl.length ? tl.map(([k, l]) => { const last = l.at(-1); return `<button type="button" class="tm" data-q="${esc(k)}"><b>${esc(k)}</b><span class="num">${t('spotTimes', { n: l.length })}${last.ach ? ' · ' + lvL('ach', last.ach) : ''}</span>
    <span class="dots" aria-hidden="true">${l.slice(-12).map(x => `<i style="height:${x.ach ? x.ach / 5 * 100 : 10}%;opacity:${x.ach ? 1 : .25}"></i>`).join('')}</span></button>`; }).join('')
    : `<div class="empty">${t('growthEmpty')}</div>`;

  const by = {}; for (const x of all) { const o = (by[x.spot] ??= { n: 0, r: 0, rn: 0 }); o.n++; if (x.rate) { o.r += x.rate; o.rn++; } }
  const sp = Object.entries(by).sort((a, b) => b[1].n - a[1].n).slice(0, 8), max = sp[0]?.[1].n || 1;
  $('spots').innerHTML = sp.length ? sp.map(([k, o]) => `<div class="spot"><span>${esc(k)}</span><span class="barx"><i style="width:${o.n / max * 100}%"></i></span><span class="num">${t('spotTimes', { n: o.n })}${o.rn ? ' · ★' + (o.r / o.rn).toFixed(1) : ''}</span></div>`).join('')
    : `<div class="empty">${t('spotsEmpty')}</div>`;
  drawWave();
}
function logHtml(x) {
  const d = new Date(x.date + 'T00:00');
  const time = x.start ? x.start + (x.end ? '–' + x.end : '') : optL(x.timeOfDay || '');
  const swell = [x.swellDir ? t('swellOf', { d: optL(x.swellDir) }) : '', x.period ? t('sec', { n: x.period }) : ''].filter(Boolean).join(' ');
  const wind = [optL(x.wind || ''), x.windStr && x.windStr !== '無風' ? t('windOf', { s: optL(x.windStr) }) : optL(x.windStr || '')].filter(Boolean).join(' ');
  const meta = [x.mins ? fmtH(x.mins) : '', optL(x.weather || ''), swell, wind, optL(x.tide || ''), x.board, optL(x.stance || '')].filter(Boolean).map(esc).join(' · ');
  const counts = [x.takeoffs != null && x.takeoffs !== 0 ? t('tries', { n: x.takeoffs }) : '', x.caught ? t('caughtN', { n: x.caught }) : '', x.rides ? t('ridesN', { n: x.rides }) : ''].filter(Boolean).join(' / ');
  const wt = x.waveType ? `<span class="pill ${x.waveType === 'A中心' ? 'a' : x.waveType === 'B中心' ? 'b' : ''}">${esc(optL(x.waveType))}</span>` : '';
  const L = (label, v) => v ? `<p class="line"><small>${label}</small>${esc(v)}</p>` : '';
  const del = confirmId === x.id;
  return `<article class="log" id="log-${esc(x.id)}"><div class="when"><b>${d.getMonth() + 1}/${d.getDate()}</b><span>(${DOW[d.getDay()]}) ${esc(time)}</span></div>
  <div><h3>${esc(x.spot)}${x.size ? `<span class="pill">${esc(optL(x.size))}</span>` : ''}${wt}</h3>
  ${x.dateNote ? `<p class="note">※ ${esc(x.dateNote)}</p>` : ''}
  ${meta ? `<p class="meta">${meta}</p>` : ''}
  ${counts ? `<p class="meta">${esc(counts)}${x.paddle ? ' · ' + esc(t('paddleOf', { s: lvL('paddle', x.paddle) })) : ''}</p>` : ''}
  ${x.theme ? `<p class="line"><small>${t('themeL')}</small>${esc(x.theme)}${x.ach ? `<span class="tag">${esc(lvL('ach', x.ach))}</span>` : ''}</p>` : ''}
  ${L(t('longestL'), x.longest)}${x.falls?.length ? L(t('fallsL'), x.falls.map(optL).join(t('listSep'))) : ''}
  ${L(t('newSkillL'), x.newSkill)}${L(t('growthL'), x.growth)}${L(t('nextL'), x.next)}
  ${x.memo ? `<p class="memo">${esc(x.memo)}</p>` : ''}
  ${x.body ? `<p class="body">${esc(t('bodyL', { s: x.body }))}</p>` : ''}
  ${L(t('englishL'), x.english)}${L(t('forecastL'), x.forecast)}
  ${x.media?.length ? `<div class="media" style="margin-top:8px">${x.media.map(m => thumbHtml(m, false)).join('')}</div>` : ''}
  ${coachHtml(x)}
  <div class="foot2">${x.rate ? `<span class="st" aria-label="${t('rateAria', { n: x.rate })}">${'★'.repeat(x.rate)}${'☆'.repeat(5 - x.rate)}</span>` : '<span></span>'}
  <span><button class="mini" data-edit="${esc(x.id)}">${t('edit')}</button> <button class="mini${del ? ' warn' : ''}" data-del="${esc(x.id)}">${del ? t('delSure') : t('del')}</button></span></div>
  </div></article>`;
}
$('q').addEventListener('input', () => {
  // ブラウザのパスワード自動入力が、検索欄にメールアドレスを入れてしまうことがある → それなら消す
  if (user && $('q').value.trim().toLowerCase() === (user.email || '').toLowerCase()) $('q').value = '';
  render();
});
$('growthBox').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) { $('q').value = b.dataset.q; render(); $('h-log').scrollIntoView({ behavior: 'smooth' }); } });
$('list').addEventListener('toggle', e => { const d = e.target; if (d.dataset?.adv) d.open ? openAdv.add(d.dataset.adv) : openAdv.delete(d.dataset.adv); }, true);
$('list').addEventListener('click', async e => {
  if (e.target.closest('[data-view]')) return openViewer(e);
  const t = e.target.closest('button'); if (!t) return;
  const ds = t.dataset;
  if (ds.coach) { openAdv.add(ds.coach); askCoach(ds.coach); return; }
  if (ds.chat) { copyForChat(ds.chat); return; }
  if (ds.savepaste) { savePasted(ds.savepaste); return; }
  if (ds.hw) { setHomework(ds.hw, ds.v); return; }
  if (ds.edit) { const r = items.find(x => x.id === ds.edit); if (r) openForm(r); return; }
  if (ds.del) {
    const id = ds.del;
    if (confirmId !== id) { confirmId = id; render(); setTimeout(() => { if (confirmId === id) { confirmId = null; render(); } }, 4000); return; }
    confirmId = null; const r = items.find(x => x.id === id);
    try { await deleteRec(id); lastDeleted = r; render(); toast(t('deleted'), true); } catch (err) { toast(t('delFail')); }
  }
});
function goTo(id) { setTimeout(() => document.getElementById('log-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150); }

/* ⑦ うねりの絵 ― 最近の「立って滑れた本数」を線でつないで、海の断面のように描く */
const svg = $('wave'), fig = $('fig');
function drawWave() {
  const W = fig.clientWidth, H = fig.clientHeight; if (!W) return;
  const recent = sorted().slice(0, 16).reverse();
  const vals = recent.map(x => x.rides ?? x.caught ?? 0);
  const real = vals.filter(v => v > 0).length >= 2;
  const data = real ? vals : [1, 2, 1, 3, 2, 1, 2, 1];
  $('figcap').textContent = real ? t('waveCap', { n: data.length }) : t('waveEmpty');
  const n = data.length, step = W / (n - 1), mx = Math.max(3, ...data), y = v => H - 16 - (v / mx) * (H - 40);
  const pts = data.map((v, i) => [i * step, y(v)]);
  const line = off => { let d = `M${-30 + off},${pts[0][1]} L${pts[0][0] + off},${pts[0][1]}`;
    for (let i = 1; i < n; i++) { const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], m = (x0 + x1) / 2 + off; d += ` C${m},${y0} ${m},${y1} ${x1 + off},${y1}`; }
    return d + ` L${W + 30 + off},${pts[n - 1][1]}`; };
  const d = line(0), area = d + ` L${W + 30},${H} L-30,${H} Z`, back = line(step * .45) + ` L${W + 30 + step * .45},${H} L-30,${H} Z`;
  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = `<defs><linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2fd0c6"/><stop offset="1" stop-color="#0e7f99"/></linearGradient></defs>
  <path d="${back}" fill="#1a6f99" opacity=".45" transform="translate(0,10)"/>
  <path d="${area}" fill="url(#g1)"/><path d="${d}" fill="none" stroke="#d4f1f2" stroke-width="3" stroke-linecap="round"/>
  ${real ? pts.map(([px, py]) => `<circle cx="${px}" cy="${py}" r="3.5" fill="#fff"/>`).join('') : ''}
  <rect x="0" y="${H - 10}" width="${W}" height="10" fill="var(--bg)"/>`;
}
new ResizeObserver(drawWave).observe(fig);

/* ⑧ AIコーチ ― 記録とプロフィールを「指示書（prompt）」にまとめて、Gemini（自動）か いつものAI（コピペ）に渡す
   ここの文章を書き換えると、コーチの性格や答え方が変わります                                   */
// 1回分の記録を「項目名：値」の形にまとめる（項目名・選択肢は選んだ言語で。空の項目は省く）
const brief = r => {
  const o = [['date', r.date + (r.dateNote ? ` (${r.dateNote})` : '')], ['time', r.start ? `${r.start}–${r.end || ''}` : optL(r.timeOfDay || '')],
    ['spot', r.spot], ['board', r.board], ['stance', optL(r.stance || '')], ['weather', optL(r.weather || '')], ['size', optL(r.size || '')],
    ['swellDir', optL(r.swellDir || '')], ['period', r.period], ['wind', [r.wind, r.windStr].filter(Boolean).map(optL).join(' ')], ['tide', optL(r.tide || '')],
    ['forecast', r.forecast], ['theme', r.theme], ['ach', r.ach ? `${r.ach}/5 (${lvL('ach', r.ach)})` : ''], ['takeoffs', r.takeoffs], ['caught', r.caught],
    ['rides', r.rides], ['waveType', optL(r.waveType || '')], ['paddle', r.paddle ? lvL('paddle', r.paddle) : ''], ['longest', r.longest],
    ['falls', (r.falls || []).map(optL).join(t('listSep'))], ['newSkill', r.newSkill], ['growth', r.growth], ['next', r.next], ['memo', r.memo],
    ['body', r.body], ['english', r.english], ['rate', r.rate ? r.rate + '/5' : '']];
  const out = {};
  for (const [k, v] of o) if (!(v === '' || v == null || v === 0 && k !== 'rides')) out[fld(k)] = v;
  return out;
};
function buildPrompt(x, forChat) {
  const key = r => r.date + (r.start || '');
  const past = sorted().filter(r => r.id !== x.id && key(r) <= key(x));
  const same = x.theme ? past.filter(r => r.theme === x.theme).slice(0, 5) : [];
  const other = past.filter(r => !same.includes(r)).slice(0, 4);
  const prev = past[0];
  // 指示書の文章そのものは i18n.js の _prompt にある（言語ごとに、答えてほしい言語で書いてある）
  const p = profile, P = k => p[k] ? `- ${t('pf_' + k)}: ${p[k].replace(/\n/g, ' / ')}\n` : '';
  const J = r => JSON.stringify(brief(r)), none = pt('none');
  return `${pt('coachIntro')}

${pt('coachRules')}

${forChat ? pt('outChat') : pt('outJson')}

${pt('profile')}
${['level', 'spots', 'stance', 'board', 'waveAB', 'canDo', 'issues', 'goals'].map(P).join('')}
${pt('today')}
${J(x)}

${pt('prev')}
${prev ? J(prev) : none}

${pt('same', { t: x.theme || pt('noTheme') })}
${same.length ? same.map(J).join('\n') : none}

${pt('other')}
${other.length ? other.map(J).join('\n') : none}`;
}

/* Gemini（無料枠）に聞く */
async function gemini(model, key, parts) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({ contents: [{ role: 'user', parts }], generationConfig: { responseMimeType: 'application/json' } }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error(j.error?.message || 'HTTP ' + res.status); e.status = res.status; throw e; }
  const text = (j.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
  if (!text) { const e = new Error(j.promptFeedback?.blockReason ? 'blocked' : 'empty'); throw e; }
  return text;
}
// 使えるFlashモデルの一覧を、新しい順に取ってくる（lite=true なら軽い lite 版も後ろに入れる）
async function listFlash(key, lite = false) {
  const res = await fetch('https://generativelanguage.googleapis.com/v1beta/models?pageSize=200', { headers: { 'x-goog-api-key': key } });
  const j = await res.json(); if (!res.ok) throw new Error(j.error?.message || 'models');
  const names = (j.models || []).filter(m => (m.supportedGenerationMethods || []).includes('generateContent')).map(m => m.name.replace('models/', ''))
    .filter(n => /flash/.test(n) && !/(tts|live|image|audio|exp|preview|thinking|embed|transcribe)/.test(n) && (lite || !/lite/.test(n)));
  const ver = n => +(n.match(/(\d+(?:\.\d+)?)/)?.[1] || 0);
  const isLite = n => /lite/.test(n) ? 1 : 0;
  names.sort((a, b) => isLite(a) - isLite(b) || ver(b) - ver(a) || a.length - b.length); // 通常版→lite版、それぞれ新しい順
  return names;
}
async function pickModel(key) { // 使えるFlashモデルを自動で探す（モデル名は時々変わるため）
  const names = await listFlash(key);
  if (!names[0]) throw new Error(t('noModel'));
  return names[0];
}
// 「混んでいる・回数オーバー」のエラーかどうか（503 high demand / 429 / 500）
const isBusy = e => [429, 500, 503].includes(e.status) || /high demand|overloaded|unavailable|exhausted/i.test(e.message || '');
const wait = ms => new Promise(r => setTimeout(r, ms));
async function askGemini(parts) {
  const key = store.get('namilog-gkey'); if (!key) throw new Error('nokey');
  let model = store.get('namilog-gmodel') || DEFAULT_MODEL;
  try { return await gemini(model, key, parts); }
  catch (e) {
    // モデルが見つからない → 使えるモデルを探して、設定ごと差し替える
    if (e.status === 404 || /not found|not supported/i.test(e.message)) {
      model = await pickModel(key); store.set('namilog-gmodel', model);
      return await gemini(model, key, parts);
    }
    if (!isBusy(e)) throw e;
    // 混んでいる → 2秒待って同じモデルでもう1回
    await wait(2000);
    try { return await gemini(model, key, parts); } catch (e2) { if (!isBusy(e2)) throw e2; }
    // まだ混んでいる → 別のflash系（lite版も含む）を順に最大3つ試す。設定のモデルは変えない（一時的な混雑のため）
    const others = (await listFlash(key, true).catch(() => [])).filter(n => n !== model).slice(0, 3);
    const tried = [model];
    for (const m of others) {
      tried.push(m);
      try { return await gemini(m, key, parts); }
      catch (e3) { if (!isBusy(e3) && e3.status !== 404) throw e3; }
    }
    // 全部だめなら、どのモデルを試したかを添えてエラーを出す（原因を調べやすくするため）
    e.busy = true;
    e.message = t('busyAll', { m: tried.join(', ') });
    throw e;
  }
}
const toB64 = blob => new Promise((ok, ng) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = ng; r.readAsDataURL(blob); });
const parseJson = t => { const s = t.replace(/^```(?:json)?\s*|\s*```$/g, ''); try { return JSON.parse(s); } catch (e) { const m = s.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } };

async function askCoach(id) {
  const x = items.find(r => r.id === id); if (!x || coachBusy[id]) return;
  if (!store.get('namilog-gkey')) { coachErr[id] = t('noKey'); render(); return; }
  coachBusy[id] = true; delete coachErr[id]; render();
  try {
    const parts = [{ text: buildPrompt(x, false) }];
    let n = 0;
    for (const m of (x.media || []).filter(m => m.kind === 'image').slice(0, 3)) {
      try { await signMedia([m]); const b = await (await fetch(urlCache[m.path])).blob(); parts.push({ inline_data: { mime_type: b.type || 'image/jpeg', data: await toB64(b) } }); n++; } catch (e) {}
    }
    const out = parseJson(await askGemini(parts));
    if (!out || (!out.happened && !out.actions)) throw new Error('empty');
    const advice = { source: 'gemini', happened: String(out.happened || ''), causes: (out.causes || []).slice(0, 4).map(String),
      actions: (out.actions || []).slice(0, 3).map(a => ({ title: String(a?.title || ''), detail: String(a?.detail || '') })),
      homework: (out.homework || []).slice(0, 3).map(String), photo: n ? String(out.photo || '') : '', safety: String(out.safety || ''), photos: n, at: Date.now() };
    await saveRec({ ...items.find(r => r.id === id), advice });
    openAdv.add(id);
  } catch (e) {
    const m = e.message || '';
    coachErr[id] = e.busy ? m // 混雑で全モデルだめだったとき：試したモデル名入りのメッセージをそのまま出す
      : e.status === 429 || /quota|exhausted/i.test(m) ? t('quota')
      : e.status === 400 && /key/i.test(m) || e.status === 403 ? t('badKey')
      : m === 'blocked' ? t('blocked') : t('recvFail', { e: m.slice(0, 80) });
  }
  delete coachBusy[id]; render();
}
/* いつものAIに聞く（コピペ）― 指示書をコピー → ChatGPT・Claude・Geminiなど自分のAIに貼る → 答えをここに貼って保存
   キーもお金もいらない。使う人それぞれのAIアカウントで答えてもらう                                       */
async function copyForChat(id) {
  const x = items.find(r => r.id === id); if (!x) return;
  const imgs = (x.media || []).filter(m => m.kind === 'image').length;
  const text = buildPrompt(x, true) + (imgs ? '\n\n' + pt('photosNote', { n: imgs }) : '');
  try { await navigator.clipboard.writeText(text); toast(t('copied')); }
  catch (e) { toast(t('copyFail')); }
  pasteOpen = id; render();
}
async function savePasted(id) {
  const ta = document.getElementById('paste-' + id); const text = ta?.value.trim(); if (!text) return;
  try { await saveRec({ ...items.find(r => r.id === id), advice: { source: 'paste', text, at: Date.now() } }); pasteOpen = null; openAdv.add(id); render(); toast(t('adviceSaved')); }
  catch (e) { toast(t('saveFail', { e: e.message || 'error' })); }
}
async function setHomework(id, text) {
  const r = items.find(x => x.id === id); if (!r) return;
  try { await saveRec({ ...r, next: r.next === text ? '' : text }); render(); toast(r.next === text ? t('hwOff') : t('hwSet')); } catch (e) { toast(t('saveFail', { e: e.message || 'error' })); }
}
function coachHtml(x) {
  const a = x.advice, busy = coachBusy[x.id], err = coachErr[x.id];
  let h = '';
  if (a) {
    const d = new Date(a.at);
    const pasted = a.source === 'paste' || a.source === 'claude'; // 'claude' は前の版で保存したもの
    const body = pasted ? `<p class="free">${esc(a.text)}</p>` : `
      ${a.happened ? `<h4>${t('happened')}</h4><p>${esc(a.happened)}</p>` : ''}
      ${a.causes?.length ? `<h4>${t('causes')}</h4><ul>${a.causes.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      ${a.actions?.length ? `<h4>${t('actions')}</h4><ol>${a.actions.map(p => `<li><b>${esc(p.title)}</b>${esc(p.detail)}</li>`).join('')}</ol>` : ''}
      ${a.photo ? `<h4>${t('fromPhoto')}</h4><p>${esc(a.photo)}</p>` : ''}
      ${a.safety ? `<p class="body">${esc(a.safety)}</p>` : ''}
      ${a.homework?.length ? `<h4>${t('tapHw')}</h4><div class="hwc">${a.homework.map(v => `<button type="button" class="${x.next === v ? 'on' : ''}" data-hw="${esc(x.id)}" data-v="${esc(v)}">${x.next === v ? '✓ ' : ''}${esc(v)}</button>`).join('')}</div>` : ''}`;
    h += `<details class="coach" data-adv="${esc(x.id)}" ${openAdv.has(x.id) ? 'open' : ''}><summary data-open="${esc(t('show'))}" data-close="${esc(t('hide'))}">${t('coachAdvice')}</summary><div class="cb">${body}
      <small class="note">${d.getMonth() + 1}/${d.getDate()} · ${pasted ? t('viaChat') : t('viaCoach')}${a.photos ? ' · ' + t('photosUsed', { n: a.photos }) : ''} · ${t('generalAdvice')}</small></div></details>`;
  }
  if (busy) h += `<p class="thinking"><i></i>${t('thinking')}</p>`;
  else h += `<div class="asks"><button type="button" class="ask" data-coach="${esc(x.id)}">${a ? t('askAgain') : t('askCoach')}</button><button type="button" class="ask" data-chat="${esc(x.id)}">${t('askChat')}</button></div>`;
  if (err) h += `<p class="err">${esc(err)}</p>`;
  if (pasteOpen === x.id) h += `<div class="paste"><p>${t('pasteHelp')}</p>
    <textarea id="paste-${esc(x.id)}" placeholder="${esc(t('pastePh'))}"></textarea><button type="button" class="btn pri" data-savepaste="${esc(x.id)}">${t('saveAdvice')}</button></div>`;
  return h;
}

/* ⑨ 設定画面 */
const PF = ['level', 'spots', 'stance', 'board', 'waveAB', 'canDo', 'issues', 'goals', 'gear', 'why'];
function openSettings() {
  $('gKey').value = store.get('namilog-gkey'); $('gModel').value = store.get('namilog-gmodel') || DEFAULT_MODEL; $('gMsg').textContent = '';
  const f = $('profileForm'); for (const k of PF) f[k].value = profile[k] || '';
  $('whoami').textContent = user ? t('loggedInAs', { e: user.email }) : '';
  $('settings').hidden = false; document.body.style.overflow = 'hidden';
}
$('openSettings').addEventListener('click', openSettings);
$('closeSettings').addEventListener('click', () => { $('settings').hidden = true; document.body.style.overflow = ''; });
$('gSave').addEventListener('click', async () => {
  store.set('namilog-gkey', $('gKey').value.trim()); store.set('namilog-gmodel', $('gModel').value.trim() || DEFAULT_MODEL);
  if (!$('gKey').value.trim()) { $('gMsg').textContent = t('keyCleared'); return; }
  $('gMsg').textContent = t('testing');
  try { await askGemini([{ text: 'Return only this JSON: {"ok":true}' }]); $('gMsg').textContent = t('connected', { m: store.get('namilog-gmodel') }); $('gModel').value = store.get('namilog-gmodel'); }
  catch (e) { $('gMsg').textContent = t('notConnected', { e: (e.message || '').slice(0, 120) }); }
});
$('profileForm').addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, p = { ...profile };
  for (const k of PF) p[k] = f[k].value.trim();
  try { await saveProfile(p); toast(t('pfSaved')); } catch (err) { toast(t('saveFail', { e: err.message || 'error' })); }
});
/* これまでの記録を取り込む ― アプリを使う前のメモを貼る → AIが記録の形に分ける → 確認して保存
   AIは「AIコーチ（Gemini）」でも「いつものAI（コピペ）」でもOK。書いていないことは空欄のまま */
let impData = null, impDup = []; // AIが変換した結果（保存前の確認用）と「同じ日・同じ場所の記録がもうあるか」
function importPrompt(memo) {
  const ch = k => OPT[k].map(optL).join(' / ');                 // 選択肢を「A / B / C」の形で並べる（選んだ言語で）
  const d = k => TX._impf?.[k] ?? EN._impf?.[k] ?? '';         // 各項目の説明
  return `${pt('impIntro')}

${pt('impRules', { today: today() })}

${pt('impFormat')}
{"sessions":[{
 "date":"${d('date')}", "dateNote":"${d('dateNote')}", "start":"${d('start')}", "end":"${d('end')}", "timeOfDay":"${ch('timeOfDay')}",
 "spot":"${d('spot')}", "board":"${d('board')}", "stance":"${ch('stance')}", "weather":"${ch('weather')}", "size":"${ch('size')}",
 "swellDir":"${ch('swellDir')}", "period":"${d('period')}", "wind":"${ch('wind')}", "windStr":"${ch('windStr')}", "tide":"${ch('tide')}", "forecast":"${d('forecast')}",
 "theme":"${d('theme')}", "ach":"${d('ach')}", "takeoffs":"${d('takeoffs')}", "caught":"${d('caught')}", "rides":"${d('rides')}",
 "waveType":"${ch('waveType')} ${d('waveTypeNote')}", "paddle":"${d('paddle')}", "longest":"${d('longest')}",
 "falls":["${d('falls')}: ${ch('falls')}"], "newSkill":"${d('newSkill')}", "growth":"${d('growth')}", "next":"${d('next')}",
 "memo":"${d('memo')}", "body":"${d('body')}", "english":"${d('english')}", "rate":"${d('rate')}"
}],
"profile":{${PF.map(k => `"${k}":"${t('pf_' + k)}"`).join(', ')}}}

${pt('impNotes')}
${memo}`;
}
// 英語などの表示名（Waist など）で返ってきた選択肢を、保存用の日本語（腰）に戻す
const OPT_BACK = {};
for (const L of Object.values(I18N)) for (const [ja, label] of Object.entries(L._opt || {})) OPT_BACK[label.toLowerCase()] = ja;
const optBack = v => { const s = v == null ? '' : String(v).trim(); return OPT_BACK[s.toLowerCase()] ?? s; };
// AIの答えを、アプリで使える形に整える（知らない項目や、選択肢にない言葉は捨てる）
function cleanImport(o) {
  const out = { sessions: [], profile: {} };
  const txt = v => v == null ? '' : String(v).trim();
  const hhmm = v => { const m = txt(v).match(/^(\d{1,2}):(\d{2})$/); return m ? pad(m[1]) + ':' + m[2] : ''; };
  for (const s of Array.isArray(o?.sessions) ? o.sessions : []) {
    const r = { date: /^\d{4}-\d{2}-\d{2}$/.test(txt(s.date)) ? txt(s.date) : '' };
    for (const k of ['dateNote', 'spot', 'board', 'period', 'forecast', 'theme', 'longest', 'newSkill', 'growth', 'next', 'memo', 'body', 'english']) if (txt(s[k])) r[k] = txt(s[k]);
    for (const k of ['start', 'end']) if (hhmm(s[k])) r[k] = hhmm(s[k]);
    if (r.start && r.end) r.mins = minutesBetween(r.start, r.end);
    for (const k of ['takeoffs', 'caught', 'rides']) if (txt(s[k]) && Number.isFinite(+s[k])) r[k] = Math.max(0, Math.round(+s[k]));
    for (const k of ['ach', 'paddle', 'rate']) { const n = Math.round(+s[k]); if (n >= 1 && n <= 5) r[k] = n; }
    for (const k of ['timeOfDay', 'stance', 'weather', 'size', 'swellDir', 'wind', 'windStr', 'tide', 'waveType']) { const v = optBack(s[k]); if (OPT[k].includes(v)) r[k] = v; }
    const falls = (Array.isArray(s.falls) ? s.falls : []).map(optBack).filter(v => OPT.falls.includes(v)); if (falls.length) r.falls = falls;
    if (Object.keys(r).length > 1 || r.date) out.sessions.push(r);
  }
  for (const k of PF) if (txt(o?.profile?.[k])) out.profile[k] = txt(o.profile[k]);
  return out;
}
function setImport(o) { // 変換結果を受け取って、確認画面を出す
  impData = cleanImport(o);
  impDup = impData.sessions.map(s => items.some(x => x.date === s.date && x.spot === s.spot));
  const n = impData.sessions.length, pf = Object.keys(impData.profile).length;
  $('impMsg').textContent = n || pf ? t('impFound', { n, p: pf ? t('impPlusPf') : '' }) : t('impNone');
  drawImport();
}
function drawImport() {
  const box = $('impPreview'); if (!impData) { box.innerHTML = ''; return; }
  const { sessions, profile: pf } = impData, pfKeys = PF.filter(k => pf[k]);
  const sum = s => Object.entries(brief(s)).filter(([k]) => k !== fld('date') && k !== fld('spot')).map(([k, v]) => `${k}: ${v}`).join(' / ');
  const row = (s, i) => `<div class="paste">
      <label style="display:flex;gap:8px;align-items:center;font-weight:700"><input type="checkbox" data-impon="${i}" ${impDup[i] ? '' : 'checked'}> ${t('impNth', { n: i + 1 })}${impDup[i] ? `<span class="tag">${t('impDup')}</span>` : ''}</label>
      <label class="f">${t('date')}<input type="date" data-impdate="${i}" value="${esc(s.date)}"></label>
      <label class="f">${t('spot')}<input type="text" data-impspot="${i}" value="${esc(s.spot || '')}"></label>
      ${s.dateNote ? `<p class="note">※ ${esc(s.dateNote)}</p>` : ''}
      <p class="hint">${esc(sum(s).slice(0, 300)) || t('impOther')}</p></div>`;
  box.innerHTML = (sessions.length || pfKeys.length) ? `<div class="gbody">
    <p class="hint">${t('impCheck')}</p>
    ${sessions.map(row).join('')}
    ${pfKeys.length ? `<div class="paste"><label style="display:flex;gap:8px;align-items:center;font-weight:700"><input type="checkbox" id="impPf" checked> ${t('impPf')}</label>
      <p class="hint">${pfKeys.map(k => esc(t('pf_' + k))).join(t('listSep'))}</p></div>` : ''}
    <button class="btn pri" type="button" id="impSave">${t('impSave')}</button></div>` : '';
}
async function saveImport() {
  const box = $('impPreview'), q = s => box.querySelector(s);
  const rows = impData.sessions.map((s, i) => ({ ...s, date: q(`[data-impdate="${i}"]`).value, spot: q(`[data-impspot="${i}"]`).value.trim() }))
    .filter((_, i) => q(`[data-impon="${i}"]`).checked);
  const usePf = q('#impPf')?.checked;
  if (!rows.length && !usePf) { toast(t('impNothing')); return; }
  if (rows.some(r => !r.date || !r.spot)) { toast(t('impMissing')); return; }
  q('#impSave').disabled = true;
  try {
    for (const r of rows) await saveRec({ ...r, updated: Date.now() });
    if (usePf) { const p = { ...profile }; for (const k of PF) if (!p[k] && impData.profile[k]) p[k] = impData.profile[k]; await saveProfile(p); }
    impData = null; $('impText').value = ''; $('impAnswer').value = ''; $('impPaste').hidden = true; $('impMsg').textContent = '';
    drawImport(); render(); openSettings();
    toast(t('impDone', { n: rows.length, p: usePf ? t('impPlusPf') : '' }));
  } catch (e) { toast(t('saveFail', { e: e.message || 'error' })); q('#impSave').disabled = false; }
}
const impMemo = () => { const s = $('impText').value.trim(); if (!s) $('impMsg').textContent = t('impNeedMemo'); return s; };
$('impAi').addEventListener('click', async () => { // AIコーチ（Gemini）で自動変換
  const memo = impMemo(); if (!memo) return;
  if (!store.get('namilog-gkey')) { $('impMsg').textContent = t('impNoKey'); return; }
  const b = $('impAi'); b.disabled = true; $('impMsg').textContent = t('impWorking');
  try { const o = parseJson(await askGemini([{ text: importPrompt(memo) }])); if (!o) throw new Error(t('impUnread')); setImport(o); }
  catch (e) { $('impMsg').textContent = t('impFail', { e: (e.message || '').slice(0, 120) }); }
  b.disabled = false;
});
$('impCopy').addEventListener('click', async () => { // いつものAI（コピペ）で変換
  const memo = impMemo(); if (!memo) return;
  try { await navigator.clipboard.writeText(importPrompt(memo)); toast(t('copied')); } catch (e) { toast(t('copyFail')); }
  $('impPaste').hidden = false; $('impMsg').textContent = '';
});
$('impLoad').addEventListener('click', () => {
  let o = null; try { o = parseJson($('impAnswer').value.trim()); } catch (e) {}
  if (!o) { $('impMsg').textContent = t('impBadPaste'); return; }
  setImport(o);
});
$('impPreview').addEventListener('click', e => { if (e.target.id === 'impSave') saveImport(); });
$('copyCsv').addEventListener('click', async () => {
  // 見出しは選んだ言語。選択肢も表示名にする（数字の項目はそのまま）
  const cols = ['date', 'start', 'end', 'timeOfDay', 'spot', 'board', 'stance', 'weather', 'size', 'swellDir', 'period', 'wind', 'windStr', 'tide', 'forecast',
    'theme', 'ach', 'takeoffs', 'caught', 'rides', 'waveType', 'paddle', 'longest', 'falls', 'newSkill', 'growth', 'next', 'memo', 'body', 'english', 'rate'];
  const c = v => '"' + String(Array.isArray(v) ? v.map(optL).join(t('listSep')) : optL(v ?? '')).replace(/"/g, '""') + '"';
  const csv = [cols.map(fld).join(','), ...sorted().map(r => cols.map(k => c(r[k])).join(','))].join('\n');
  try { await navigator.clipboard.writeText(csv); toast(t('csvCopied')); } catch (e) { toast(t('copyFail')); }
});
$('logout').addEventListener('click', async () => { await sb.auth.signOut(); location.reload(); });

/* ⑩ 起動 ― 設定を確認 → ログイン → データを読み込んで描く */
async function start() {
  const C = window.NAMILOG_CONFIG || {};
  if (!C.SUPABASE_URL || !C.SUPABASE_ANON_KEY || !window.supabase) { $('setupView').hidden = false; return; }
  sb = window.supabase.createClient(C.SUPABASE_URL, C.SUPABASE_ANON_KEY, { auth: { persistSession: true, autoRefreshToken: true } });
  const { data } = await sb.auth.getSession();
  if (!data.session) { $('loginView').hidden = false; return; }
  user = data.session.user;
  $('appView').hidden = false; render();
  try { await loadAll(); setStatus(t('synced')); }
  catch (e) { setStatus(t('loadFail', { e: e.message || e.code || '' }), true); }
  render();
}
async function auth(signup) {
  const f = $('loginForm'), email = f.email.value.trim(), password = f.password.value;
  if (!email || password.length < 6) { $('loginMsg').textContent = t('needEmailPw'); return; }
  $('loginMsg').textContent = signup ? t('signingUp') : t('loggingIn');
  const { data, error } = signup ? await sb.auth.signUp({ email, password }) : await sb.auth.signInWithPassword({ email, password });
  if (error) { $('loginMsg').textContent = '✗ ' + (error.message.includes('Invalid login') ? t('wrongPw') : error.message); return; }
  if (signup && !data.session) { $('loginMsg').textContent = t('checkMail'); return; }
  location.reload();
}
$('loginForm').addEventListener('submit', e => { e.preventDefault(); auth(false); });
$('signupBtn').addEventListener('click', () => auth(true));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && user) loadAll().then(render).catch(() => {}); });

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
start();
}
