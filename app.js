/* ===== 【JavaScript】波ログの動き =====
   ① 選択肢  ② 便利な道具  ③ ログインとデータ保存（Supabase）  ④ 写真・動画
   ⑤ 記録フォーム  ⑥ 画面を描く  ⑦ うねりの絵  ⑧ AIコーチ（Gemini／Claude）
   ⑨ 設定画面  ⑩ 起動                                                        */
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
const fmtH = m => { const h = Math.floor(m / 60), r = m % 60; return h ? `${h}時間${r ? r + '分' : ''}` : `${r}分`; };
const DOW = '日月火水木金土';
const store = { get: k => { try { return localStorage.getItem(k) || ''; } catch (e) { return ''; } },
  set: (k, v) => { try { v ? localStorage.setItem(k, v) : localStorage.removeItem(k); } catch (e) {} } };
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
      toast(e.message === 'too_large' ? '動画は50MBまでです。短く切ってください' : 'アップロードできませんでした（' + (e.message || 'エラー') + '）');
    }
    drawFormMedia();
  }
}
async function dropMedia(list) { const paths = list.map(m => m.path).filter(p => p && !p.startsWith('up')); if (paths.length) await sb.storage.from(BUCKET).remove(paths).catch(() => {}); }
function thumbHtml(m, removable) {
  if (m.kind === 'up') return `<div class="thumb up">送信中…</div>`;
  const u = esc(urlCache[m.path] || '');
  const inner = m.kind === 'video' ? `<video src="${u}#t=0.1" muted playsinline preload="metadata"></video><span class="play">▶</span>` : `<img src="${u}" alt="" loading="lazy">`;
  return `<button type="button" class="thumb" data-view="${esc(m.path)}" data-kind="${m.kind}" aria-label="拡大">${inner}${removable ? `<span class="x" data-rm="${esc(m.path)}" role="button" aria-label="外す">×</span>` : ''}</button>`;
}
function drawFormMedia() {
  $('formMedia').innerHTML = formMedia.map(m => thumbHtml(m, true)).join('') +
    `<label class="addm">＋<br>写真・動画<input type="file" id="fileIn" accept="image/*,video/*" multiple></label>`;
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
  const k = el.dataset.chips, lv = LEVEL[k], arr = lv || OPT[k];
  el.innerHTML = arr.map((t, i) => `<label><input type="radio" name="${k}" value="${lv ? i + 1 : esc(t)}"><span>${esc(t)}</span></label>`).join('');
});
document.querySelectorAll('[data-multi]').forEach(el => {
  const k = el.dataset.multi;
  el.innerHTML = OPT[k].map(t => `<label><input type="checkbox" name="${k}" value="${esc(t)}"><span>${esc(t)}</span></label>`).join('');
});
document.querySelectorAll('[data-step-for]').forEach(el => {
  const k = el.dataset.stepFor;
  el.innerHTML = `<button type="button" data-step="-1" data-k="${k}" aria-label="1減らす">−</button><input type="number" name="${k}" min="0" max="200" inputmode="numeric"><button type="button" data-step="1" data-k="${k}" aria-label="1増やす">＋</button>`;
});
$('themePresets').innerHTML = PRESET_THEMES.map(t => `<button type="button" data-theme="${esc(t)}">${esc(t)}</button>`).join('');
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
  $('saveBtn').textContent = rec ? '変更を保存' : '保存だけ'; $('saveCoach').hidden = !!rec;
  $('saveBtn').classList.toggle('pri', !!rec);
  if (draft && !rec) toast('書きかけの記録を戻しました');
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
  if (formMedia.some(m => m.kind === 'up')) { toast('写真・動画の送信が終わるまでお待ちください'); return; }
  const old = editing ? items.find(x => x.id === editing) : null;
  const rec = { ...readForm(), id: editing || undefined, updated: Date.now() };
  if (old?.advice) rec.advice = old.advice;
  for (const k of ['seedId', 'dateNote']) if (old?.[k]) rec[k] = old[k];
  if (!rec.date || !rec.spot) { toast('日付とポイントは必須です'); return; }
  const withCoach = e.submitter?.dataset.coach === '1';
  const btns = [$('saveBtn'), $('saveCoach')]; btns.forEach(b => b.disabled = true);
  try {
    const saved = await saveRec(rec);
    if (old) dropMedia(origMedia.filter(o => !formMedia.some(m => m.path === o.path)));
    else store.set(DRAFT, '');
    closeForm(true); render();
    if (withCoach) { openAdv.add(saved.id); goTo(saved.id); askCoach(saved.id); }
    else toast(old ? '変更を保存しました' : '記録しました。おつかれさま！');
  } catch (err) { toast('保存できませんでした（' + (err.message || 'エラー') + '）。下書きは残っています'); }
  btns.forEach(b => b.disabled = false);
});

function toast(msg, undo) {
  $('toastMsg').textContent = msg; $('undo').hidden = !undo; $('toast').classList.add('on');
  clearTimeout(toastT); toastT = setTimeout(() => { $('toast').classList.remove('on'); if (undo && lastDeleted) { dropMedia(lastDeleted.media || []); lastDeleted = null; } }, undo ? 7000 : 2800);
}
$('undo').addEventListener('click', async () => {
  const r = lastDeleted; lastDeleted = null; $('toast').classList.remove('on');
  if (r) { const { id, ...rest } = r; await saveRec(rest).catch(() => toast('戻せませんでした')); render(); }
});

/* ⑥ 画面を描く ― データ(items)から毎回作り直す。これがアプリの心臓部 */
const sorted = () => [...items].sort((a, b) => (b.date + (b.start || '')).localeCompare(a.date + (a.start || '')));
const uniq = a => [...new Set(a.filter(Boolean))];
const md = s => { const [, m, d] = s.split('-'); return `${+m}/${+d}`; };

function render() {
  const all = sorted();
  const ym = today().slice(0, 7);
  const mins = all.reduce((s, x) => s + (x.mins || 0), 0), rides = all.reduce((s, x) => s + (x.rides || 0), 0);
  $('stats').innerHTML = [[all.filter(x => x.date.startsWith(ym)).length + '回', '今月のセッション'], [all.length + '回', 'これまでの記録'],
    [rides + '本', '立って滑れた'], [mins ? fmtH(mins) : '—', '海にいた時間']]
    .map(([b, s]) => `<div class="stat"><b>${b}</b><span>${s}</span></div>`).join('');
  const hw = all.find(x => x.next);
  $('homework').innerHTML = hw && hw === all[0] ? `<div class="hw"><small>前回の宿題（${md(hw.date)} ${esc(hw.spot)}）</small><b>${esc(hw.next)}</b></div>` : '';
  $('spotList').innerHTML = uniq([...all.map(x => x.spot), ...PRESET_SPOTS]).map(s => `<option value="${esc(s)}">`).join('');
  $('boardList').innerHTML = uniq(all.map(x => x.board)).map(s => `<option value="${esc(s)}">`).join('');
  $('themeList').innerHTML = uniq([...all.map(x => x.theme), ...PRESET_THEMES]).map(s => `<option value="${esc(s)}">`).join('');

  const q = $('q').value.trim().toLowerCase();
  const shown = q ? all.filter(x => JSON.stringify(x).toLowerCase().includes(q)) : all;
  $('list').innerHTML = shown.length ? shown.map(logHtml).join('')
    : q ? `<div class="empty"><b>見つかりませんでした</b>別のことばで検索してみてください</div>`
      : `<div class="empty"><b>まだ記録がありません</b>上のボタンから記録するか、設定の「これまでの記録を取り込む」をどうぞ</div>`;

  const sk = all.filter(x => x.newSkill);
  $('skills').innerHTML = sk.length ? `<ul class="skills">${sk.map(x => `<li><time>${md(x.date)}</time><span>${esc(x.newSkill)}</span></li>`).join('')}</ul>`
    : `<div class="empty">「新しくできるようになったこと」を書くと、ここに積み上がります</div>`;

  const th = {}; for (const x of [...all].reverse()) if (x.theme) (th[x.theme] ??= []).push(x);
  const tl = Object.entries(th).sort((a, b) => b[1].at(-1).date.localeCompare(a[1].at(-1).date)).slice(0, 8);
  $('growthBox').innerHTML = tl.length ? tl.map(([k, l]) => { const last = l.at(-1); return `<button type="button" class="tm" data-q="${esc(k)}"><b>${esc(k)}</b><span class="num">${l.length}回${last.ach ? ' · ' + LEVEL.ach[last.ach - 1] : ''}</span>
    <span class="dots" aria-hidden="true">${l.slice(-12).map(x => `<i style="height:${x.ach ? x.ach / 5 * 100 : 10}%;opacity:${x.ach ? 1 : .25}"></i>`).join('')}</span></button>`; }).join('')
    : `<div class="empty">練習テーマを書くと、テーマごとの達成度の伸びが並びます</div>`;

  const by = {}; for (const x of all) { const o = (by[x.spot] ??= { n: 0, r: 0, rn: 0 }); o.n++; if (x.rate) { o.r += x.rate; o.rn++; } }
  const sp = Object.entries(by).sort((a, b) => b[1].n - a[1].n).slice(0, 8), max = sp[0]?.[1].n || 1;
  $('spots').innerHTML = sp.length ? sp.map(([k, o]) => `<div class="spot"><span>${esc(k)}</span><span class="barx"><i style="width:${o.n / max * 100}%"></i></span><span class="num">${o.n}回${o.rn ? ' · ★' + (o.r / o.rn).toFixed(1) : ''}</span></div>`).join('')
    : `<div class="empty">よく行くポイントがここに並びます</div>`;
  drawWave();
}
function logHtml(x) {
  const d = new Date(x.date + 'T00:00');
  const time = x.start ? x.start + (x.end ? '–' + x.end : '') : (x.timeOfDay || '');
  const swell = [x.swellDir ? x.swellDir + 'うねり' : '', x.period ? x.period + '秒' : ''].filter(Boolean).join(' ');
  const wind = [x.wind, x.windStr && x.windStr !== '無風' ? '風' + x.windStr : x.windStr].filter(Boolean).join(' ');
  const meta = [x.mins ? fmtH(x.mins) : '', x.weather, swell, wind, x.tide, x.board, x.stance].filter(Boolean).map(esc).join(' · ');
  const counts = [x.takeoffs != null && x.takeoffs !== 0 ? `挑戦${x.takeoffs}` : '', x.caught ? `キャッチ${x.caught}` : '', x.rides ? `立って${x.rides}本` : ''].filter(Boolean).join(' / ');
  const wt = x.waveType ? `<span class="pill ${x.waveType === 'A中心' ? 'a' : x.waveType === 'B中心' ? 'b' : ''}">${esc(x.waveType)}</span>` : '';
  const L = (label, v) => v ? `<p class="line"><small>${label}</small>${esc(v)}</p>` : '';
  const del = confirmId === x.id;
  return `<article class="log" id="log-${esc(x.id)}"><div class="when"><b>${d.getMonth() + 1}/${d.getDate()}</b><span>(${DOW[d.getDay()]}) ${esc(time)}</span></div>
  <div><h3>${esc(x.spot)}${x.size ? `<span class="pill">${esc(x.size)}</span>` : ''}${wt}</h3>
  ${x.dateNote ? `<p class="note">※ ${esc(x.dateNote)}</p>` : ''}
  ${meta ? `<p class="meta">${meta}</p>` : ''}
  ${counts ? `<p class="meta">${esc(counts)}${x.paddle ? ' · パドル：' + LEVEL.paddle[x.paddle - 1] : ''}</p>` : ''}
  ${x.theme ? `<p class="line"><small>テーマ</small>${esc(x.theme)}${x.ach ? `<span class="tag">${LEVEL.ach[x.ach - 1]}</span>` : ''}</p>` : ''}
  ${L('いちばん長い波', x.longest)}${x.falls?.length ? L('失敗の原因', x.falls.join('、')) : ''}
  ${L('できた！', x.newSkill)}${L('成長', x.growth)}${L('次回の宿題', x.next)}
  ${x.memo ? `<p class="memo">${esc(x.memo)}</p>` : ''}
  ${x.body ? `<p class="body">体：${esc(x.body)}</p>` : ''}
  ${L('英語メモ', x.english)}${L('予報', x.forecast)}
  ${x.media?.length ? `<div class="media" style="margin-top:8px">${x.media.map(m => thumbHtml(m, false)).join('')}</div>` : ''}
  ${coachHtml(x)}
  <div class="foot2">${x.rate ? `<span class="st" aria-label="満足度${x.rate}">${'★'.repeat(x.rate)}${'☆'.repeat(5 - x.rate)}</span>` : '<span></span>'}
  <span><button class="mini" data-edit="${esc(x.id)}">編集</button> <button class="mini${del ? ' warn' : ''}" data-del="${esc(x.id)}">${del ? '本当に削除' : '削除'}</button></span></div>
  </div></article>`;
}
$('q').addEventListener('input', render);
$('growthBox').addEventListener('click', e => { const b = e.target.closest('[data-q]'); if (b) { $('q').value = b.dataset.q; render(); $('h-log').scrollIntoView({ behavior: 'smooth' }); } });
$('list').addEventListener('toggle', e => { const d = e.target; if (d.dataset?.adv) d.open ? openAdv.add(d.dataset.adv) : openAdv.delete(d.dataset.adv); }, true);
$('list').addEventListener('click', async e => {
  if (e.target.closest('[data-view]')) return openViewer(e);
  const t = e.target.closest('button'); if (!t) return;
  const ds = t.dataset;
  if (ds.coach) { openAdv.add(ds.coach); askCoach(ds.coach); return; }
  if (ds.claude) { copyForClaude(ds.claude); return; }
  if (ds.savepaste) { savePasted(ds.savepaste); return; }
  if (ds.hw) { setHomework(ds.hw, ds.v); return; }
  if (ds.edit) { const r = items.find(x => x.id === ds.edit); if (r) openForm(r); return; }
  if (ds.del) {
    const id = ds.del;
    if (confirmId !== id) { confirmId = id; render(); setTimeout(() => { if (confirmId === id) { confirmId = null; render(); } }, 4000); return; }
    confirmId = null; const r = items.find(x => x.id === id);
    try { await deleteRec(id); lastDeleted = r; render(); toast('削除しました', true); } catch (err) { toast('削除できませんでした'); }
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
  $('figcap').textContent = real ? `最近${data.length}回の「立って滑れた本数」` : '記録するとここにうねりが描かれます';
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

/* ⑧ AIコーチ ― 記録とプロフィールを「指示書（prompt）」にまとめて、Gemini（自動）か Claude（コピペ）に渡す
   ここの文章を書き換えると、コーチの性格や答え方が変わります                                   */
const brief = r => {
  const o = { 日付: r.date + (r.dateNote ? `（${r.dateNote}）` : ''), 時間: r.start ? `${r.start}〜${r.end || ''}` : r.timeOfDay, ポイント: r.spot, ボード: r.board, スタンス: r.stance,
    天気: r.weather, 波のサイズ体感: r.size, うねり: r.swellDir, 周期秒: r.period, 風: [r.wind, r.windStr].filter(Boolean).join(' '), 潮: r.tide, 予報メモ: r.forecast,
    テーマ: r.theme, 達成度: r.ach ? `${r.ach}/5（${LEVEL.ach[r.ach - 1]}）` : '', テイクオフ挑戦: r.takeoffs, キャッチ: r.caught, 立って滑れた: r.rides,
    波の種類: r.waveType, パドルの感覚: r.paddle ? LEVEL.paddle[r.paddle - 1] : '', いちばん長い波: r.longest, 失敗の原因: (r.falls || []).join('、'),
    できるようになったこと: r.newSkill, 成長: r.growth, 次回の宿題: r.next, 気づき: r.memo, 体: r.body, 英語メモ: r.english, 満足度: r.rate ? r.rate + '/5' : '' };
  for (const k in o) if (o[k] === '' || o[k] == null || o[k] === 0 && k !== '立って滑れた') delete o[k];
  return o;
};
function buildPrompt(x, forChat) {
  const key = r => r.date + (r.start || '');
  const past = sorted().filter(r => r.id !== x.id && key(r) <= key(x));
  const same = x.theme ? past.filter(r => r.theme === x.theme).slice(0, 5) : [];
  const other = past.filter(r => !same.includes(r)).slice(0, 4);
  const prev = past[0];
  const p = profile, P = (k, v) => v ? `- ${k}: ${v.replace(/\n/g, ' ／ ')}\n` : '';
  const out = forChat
    ? `次の形で、日本語で、読みやすく答えてください：
【何が起きたか】1〜2文
【考えられる原因】箇条書き2〜3個
【次に試す具体的な行動】2〜3個（体のどこを・いつ・どうする）
【次回の宿題の候補】3つ（各20文字前後）
（写真があれば）【写真から】2〜3文`
    : `次のJSONだけを返してください:
{"happened":"何が起きたか（1〜2文）","causes":["考えられる原因",...2〜3個],"actions":[{"title":"短い見出し","detail":"体のどこを・いつ・どうするか（2〜3文）"},...2〜3個],"homework":["次回の宿題の候補（20文字前後）",...3個],"photo":"写真がなければ空文字","safety":"必要なときだけ一言。なければ空文字"}`;
  return `あなたは経験豊富で、励まし上手なサーフィンコーチです。初心者の生徒がつけたサーフィン日誌の「今日のセッション」について、日本語でアドバイスしてください。

ルール:
- ふり返りは「何が起きたか」「考えられる原因」「次に試す具体的な行動」の3つをはっきり分ける。
- 今日のテーマ・達成度・本数・失敗の原因・メモを最も重視し、波・風・潮・ボードの条件も考えに入れる。
- 同じテーマの過去の記録があれば、伸びている／止まっているに具体的に触れる。前回の宿題があれば、それができたかにも触れる。
- 生徒の練習目標（優先順）に沿って、次にやることを絞る。
- 日誌に書かれていないこと（波の高さ・本数・時間など）を推測で事実のように書かない。予報メモは実際の波とは限らない。
- すでにできたことと、これからの目標を区別する。
- 体の痛み・擦れの記録があれば、予防のひとことを添える。強い痛みが続くなら専門家に相談するよう勧める。
- 写真が添付されている場合だけ、姿勢・目線・重心・足の位置について書く。写真から確かに言えないことは断定しない。
- トーンは前向きに、でも具体的に。

${out}

生徒のプロフィール:
${P('レベル', p.level)}${P('よく行く場所', p.spots)}${P('スタンス', p.stance)}${P('ボード', p.board)}${P('波の区別', p.waveAB)}${P('できるようになったこと', p.canDo)}${P('今の課題', p.issues)}${P('練習目標（優先順）', p.goals)}
今日のセッション:
${JSON.stringify(brief(x))}

前回のセッション（前回の宿題の確認用）:
${prev ? JSON.stringify(brief(prev)) : 'なし'}

同じテーマ「${x.theme || '（テーマなし）'}」の過去の記録（新しい順）:
${same.length ? same.map(r => JSON.stringify(brief(r))).join('\n') : 'なし'}

最近のほかのセッション（参考）:
${other.length ? other.map(r => JSON.stringify(brief(r))).join('\n') : 'なし'}`;
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
  if (!names[0]) throw new Error('使えるモデルが見つかりません');
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
    for (const m of others) {
      try { return await gemini(m, key, parts); }
      catch (e3) { if (!isBusy(e3) && e3.status !== 404) throw e3; }
    }
    throw e; // 全部だめなら最初のエラーを出す
  }
}
const toB64 = blob => new Promise((ok, ng) => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.onerror = ng; r.readAsDataURL(blob); });
const parseJson = t => { const s = t.replace(/^```(?:json)?\s*|\s*```$/g, ''); try { return JSON.parse(s); } catch (e) { const m = s.match(/\{[\s\S]*\}/); return m ? JSON.parse(m[0]) : null; } };

async function askCoach(id) {
  const x = items.find(r => r.id === id); if (!x || coachBusy[id]) return;
  if (!store.get('namilog-gkey')) { coachErr[id] = 'GeminiのAPIキーが未設定です。⚙︎設定から入れるか、「Claudeで聞く」を使ってください'; render(); return; }
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
    coachErr[id] = e.status === 429 || /quota|exhausted/i.test(m) ? '無料枠の回数制限に当たりました。少し時間をおくか、「Claudeで聞く」を使ってください'
      : e.status === 400 && /key/i.test(m) || e.status === 403 ? 'APIキーが正しくないようです。⚙︎設定を確認してください'
      : m === 'blocked' ? 'この内容にはアドバイスが返りませんでした' : 'うまく受け取れませんでした（' + m.slice(0, 80) + '）';
  }
  delete coachBusy[id]; render();
}
/* Claude（コピペ）で聞く ― 指示書をコピー → Claudeアプリに貼る → 答えをここに貼って保存 */
async function copyForClaude(id) {
  const x = items.find(r => r.id === id); if (!x) return;
  const imgs = (x.media || []).filter(m => m.kind === 'image').length;
  const text = buildPrompt(x, true) + (imgs ? `\n\n（写真が${imgs}枚あります。このあと貼り付けます）` : '');
  try { await navigator.clipboard.writeText(text); toast('コピーしました。Claudeに貼り付けてください'); }
  catch (e) { toast('コピーできませんでした'); }
  pasteOpen = id; render();
}
async function savePasted(id) {
  const ta = document.getElementById('paste-' + id); const text = ta?.value.trim(); if (!text) return;
  try { await saveRec({ ...items.find(r => r.id === id), advice: { source: 'claude', text, at: Date.now() } }); pasteOpen = null; openAdv.add(id); render(); toast('アドバイスを保存しました'); }
  catch (e) { toast('保存できませんでした'); }
}
async function setHomework(id, text) {
  const r = items.find(x => x.id === id); if (!r) return;
  try { await saveRec({ ...r, next: r.next === text ? '' : text }); render(); toast(r.next === text ? '宿題を外しました' : '次回の宿題にしました'); } catch (e) { toast('保存できませんでした'); }
}
function coachHtml(x) {
  const a = x.advice, busy = coachBusy[x.id], err = coachErr[x.id];
  let h = '';
  if (a) {
    const d = new Date(a.at);
    const body = a.source === 'claude' ? `<p class="free">${esc(a.text)}</p>` : `
      ${a.happened ? `<h4>何が起きたか</h4><p>${esc(a.happened)}</p>` : ''}
      ${a.causes?.length ? `<h4>考えられる原因</h4><ul>${a.causes.map(c => `<li>${esc(c)}</li>`).join('')}</ul>` : ''}
      ${a.actions?.length ? `<h4>次に試すこと</h4><ol>${a.actions.map(p => `<li><b>${esc(p.title)}</b>${esc(p.detail)}</li>`).join('')}</ol>` : ''}
      ${a.photo ? `<h4>写真から</h4><p>${esc(a.photo)}</p>` : ''}
      ${a.safety ? `<p class="body">${esc(a.safety)}</p>` : ''}
      ${a.homework?.length ? `<h4>タップで次回の宿題にする</h4><div class="hwc">${a.homework.map(t => `<button type="button" class="${x.next === t ? 'on' : ''}" data-hw="${esc(x.id)}" data-v="${esc(t)}">${x.next === t ? '✓ ' : ''}${esc(t)}</button>`).join('')}</div>` : ''}`;
    h += `<details class="coach" data-adv="${esc(x.id)}" ${openAdv.has(x.id) ? 'open' : ''}><summary>コーチのアドバイス</summary><div class="cb">${body}
      <small class="note">${d.getMonth() + 1}/${d.getDate()} · ${a.source === 'claude' ? 'Claude' : 'Gemini'}${a.photos ? ` · 写真${a.photos}枚を参考` : ''} · 記録からの一般的なアドバイスです</small></div></details>`;
  }
  if (busy) h += `<p class="thinking"><i></i>コーチが考え中…（10〜30秒）</p>`;
  else h += `<div class="asks"><button type="button" class="ask" data-coach="${esc(x.id)}">${a ? 'もう一度聞く' : 'コーチに聞く'}</button><button type="button" class="ask" data-claude="${esc(x.id)}">Claudeで聞く</button></div>`;
  if (err) h += `<p class="err">${esc(err)}</p>`;
  if (pasteOpen === x.id) h += `<div class="paste"><p>① 指示書をコピーしました → <a href="https://claude.ai/new" target="_blank" rel="noopener">Claudeを開く</a>（写真は手で添付）<br>② 返ってきた答えを下に貼って保存</p>
    <textarea id="paste-${esc(x.id)}" placeholder="Claudeの答えをここに貼り付け"></textarea><button type="button" class="btn pri" data-savepaste="${esc(x.id)}">アドバイスとして保存</button></div>`;
  return h;
}

/* ⑨ 設定画面 */
const PF = ['level', 'spots', 'stance', 'board', 'waveAB', 'canDo', 'issues', 'goals', 'gear', 'why'];
function openSettings() {
  $('gKey').value = store.get('namilog-gkey'); $('gModel').value = store.get('namilog-gmodel') || DEFAULT_MODEL; $('gMsg').textContent = '';
  const f = $('profileForm'); for (const k of PF) f[k].value = profile[k] || '';
  $('whoami').textContent = user ? `ログイン中：${user.email}` : '';
  $('settings').hidden = false; document.body.style.overflow = 'hidden';
}
$('openSettings').addEventListener('click', openSettings);
$('closeSettings').addEventListener('click', () => { $('settings').hidden = true; document.body.style.overflow = ''; });
$('gSave').addEventListener('click', async () => {
  store.set('namilog-gkey', $('gKey').value.trim()); store.set('namilog-gmodel', $('gModel').value.trim() || DEFAULT_MODEL);
  if (!$('gKey').value.trim()) { $('gMsg').textContent = 'キーを消しました'; return; }
  $('gMsg').textContent = 'テスト中…';
  try { const t = await askGemini([{ text: '{"ok":true} というJSONだけを返してください' }]); $('gMsg').textContent = '✓ つながりました（モデル：' + store.get('namilog-gmodel') + '）'; $('gModel').value = store.get('namilog-gmodel'); }
  catch (e) { $('gMsg').textContent = '✗ つながりませんでした：' + (e.message || '').slice(0, 120); }
});
$('profileForm').addEventListener('submit', async e => {
  e.preventDefault(); const f = e.target, p = { ...profile };
  for (const k of PF) p[k] = f[k].value.trim();
  try { await saveProfile(p); toast('プロフィールを保存しました'); } catch (err) { toast('保存できませんでした'); }
});
$('importSeed').addEventListener('click', async () => {
  const S = window.NAMILOG_SEED; if (!S) return;
  const have = new Set(items.map(x => x.seedId).filter(Boolean));
  const todo = S.sessions.filter(s => !have.has(s.seedId));
  try {
    if (!Object.keys(profile).length) await saveProfile(S.profile);
    for (const s of todo) await saveRec({ ...s, updated: Date.now() });
    render(); openSettings();
    toast(todo.length ? `${todo.length}回分を取り込みました` : 'もう取り込み済みです');
  } catch (e) { toast('取り込めませんでした（' + (e.message || '') + '）'); }
});
$('copyCsv').addEventListener('click', async () => {
  const cols = [['日付', 'date'], ['入水', 'start'], ['終了', 'end'], ['時間帯', 'timeOfDay'], ['ポイント', 'spot'], ['ボード', 'board'], ['スタンス', 'stance'], ['天気', 'weather'], ['サイズ', 'size'], ['うねり', 'swellDir'], ['周期', 'period'], ['風', 'wind'], ['風の強さ', 'windStr'], ['潮', 'tide'], ['予報', 'forecast'],
    ['テーマ', 'theme'], ['達成度', 'ach'], ['挑戦', 'takeoffs'], ['キャッチ', 'caught'], ['立てた', 'rides'], ['波の種類', 'waveType'], ['パドル', 'paddle'], ['いちばん長い波', 'longest'], ['失敗の原因', 'falls'],
    ['できた', 'newSkill'], ['成長', 'growth'], ['次回の宿題', 'next'], ['気づき', 'memo'], ['体', 'body'], ['英語', 'english'], ['満足度', 'rate']];
  const c = v => '"' + String(Array.isArray(v) ? v.join('、') : v ?? '').replace(/"/g, '""') + '"';
  const csv = [cols.map(x => x[0]).join(','), ...sorted().map(r => cols.map(([, k]) => c(r[k])).join(','))].join('\n');
  try { await navigator.clipboard.writeText(csv); toast('CSVをコピーしました'); } catch (e) { toast('コピーできませんでした'); }
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
  try { await loadAll(); setStatus('クラウドに保存中・iPhoneでもPCでも同じ記録'); }
  catch (e) { setStatus('記録を読み込めませんでした（' + (e.message || e.code || '') + '）', true); }
  render();
}
async function auth(signup) {
  const f = $('loginForm'), email = f.email.value.trim(), password = f.password.value;
  if (!email || password.length < 6) { $('loginMsg').textContent = 'メールと6文字以上のパスワードを入れてください'; return; }
  $('loginMsg').textContent = signup ? 'アカウントを作成中…' : 'ログイン中…';
  const { data, error } = signup ? await sb.auth.signUp({ email, password }) : await sb.auth.signInWithPassword({ email, password });
  if (error) { $('loginMsg').textContent = '✗ ' + (error.message.includes('Invalid login') ? 'メールかパスワードが違います' : error.message); return; }
  if (signup && !data.session) { $('loginMsg').textContent = '確認メールを送りました。メールのリンクを開いてから、ここでログインしてください'; return; }
  location.reload();
}
$('loginForm').addEventListener('submit', e => { e.preventDefault(); auth(false); });
$('signupBtn').addEventListener('click', () => auth(true));
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && user) loadAll().then(render).catch(() => {}); });

if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
start();
}
