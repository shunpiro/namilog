// ===== 言葉の対応表（英語／日本語）=====
// 画面に出る文字はここにまとめてあります。文言を直したいときは、ここを書き換えるだけでOK。
// 新しい言語を足すとき：en を丸ごとコピーして、名前（例：es）を変えて訳す → LANG_NAMES にも足す。
// {n} のような部分は、アプリが数字や名前を入れる場所です（消さないでください）。
// _opt：選択肢の表示名。データベースには日本語のまま保存し、表示するときだけ置き換えます。

window.NAMILOG_LANG_NAMES = { en: 'English', ja: '日本語' };

window.NAMILOG_I18N = {
  en: {
    app: 'Namilog',
    // ログイン・初期設定
    loginMsg: 'Log in with your email and password', email: 'Email', password: 'Password (6+ characters)',
    login: 'Log in', signup: 'New here? Create an account', loggingIn: 'Logging in…', signingUp: 'Creating your account…',
    needEmailPw: 'Enter your email and a password of 6+ characters', wrongPw: 'Wrong email or password',
    checkMail: 'We sent you a confirmation email. Open the link in it, then log in here.',
    setupTitle: 'Almost there!', setupText: 'Put your Supabase URL and anon key in config.js. See "Step 2" in README.md.',
    // メイン画面
    settings: 'Settings', recordArea: 'Record', loading: 'Loading…', openForm: '+ Log today’s session',
    synced: 'Saved to the cloud · same log on iPhone and PC', loadFail: 'Could not load your log ({e})',
    statMonth: 'Sessions this month', statAll: 'Sessions logged', statRides: 'Rides standing up', statTime: 'Time in the water',
    times: '{n}', rides: '{n}', prevHw: 'Last homework ({d} {s})',
    logTitle: 'Session log', search: 'Search spots, focus, notes', searchAria: 'Search',
    notFound: 'Nothing found', notFoundSub: 'Try a different word',
    noLogs: 'No sessions yet', noLogsSub: 'Log one with the button above, or use "Import your past notes" in Settings',
    skillsTitle: 'Skills unlocked', skillsEmpty: 'Fill in "Something new you could do" and it builds up here',
    growthTitle: 'Progress by focus', growthEmpty: 'Add a practice focus to see how each one improves',
    spotsTitle: 'By spot', spotsEmpty: 'Your favorite spots show up here', spotTimes: '{n}×',
    waveCap: 'Rides standing up, last {n} sessions', waveEmpty: 'Log sessions to draw your swell here',
    // 記録フォーム
    gWhen: 'When & where', date: 'Date', start: 'In', end: 'Out', timeOfDay: 'Time of day (if you don’t know the time)',
    spot: 'Spot', spotPh: 'e.g. Canoes', board: 'Board', boardPh: 'e.g. 10\'0 soft top', stance: 'Stance',
    gCond: 'Conditions', weather: 'Weather', size: 'Wave size (how it felt)', swellDir: 'Swell direction (where it came from)',
    period: 'Period (sec)', periodPh: 'e.g. 12', wind: 'Wind (relative to shore)', windStr: 'Wind strength', tide: 'Tide',
    forecast: 'Forecast notes (separate from what you saw)', forecastPh: 'e.g. South shore 2–3 ft, east wind',
    gTheme: 'Today’s focus', theme: 'Practice focus', themePh: 'e.g. 180° turn while sitting', ach: 'How well it went',
    gWaves: 'Waves', takeoffs: 'Take-off attempts', caught: 'Waves caught', ridesF: 'Rides standing up',
    waveType: 'Wave type (A = unbroken / B = whitewater)', paddle: 'How paddling felt',
    longest: 'Your longest ride', longestPh: 'e.g. Started paddling early and caught it as it grew',
    falls: 'Why you fell or missed (pick any)',
    gReflect: 'Reflection', newSkill: 'Something new you could do', newSkillPh: 'e.g. Turned the board while sitting',
    growth: 'Progress since last time', next: 'Homework for next time (shown at the top next time)', nextPh: 'e.g. Start paddling 3 seconds before the wave arrives',
    memo: 'Notes & feelings', body: 'Aches, pain or rashes', bodyPh: 'e.g. No chest rash (wore a rash guard)',
    english: 'Language notes (surf terms, questions)', englishPh: 'e.g. pearling = nose diving', rate: 'Satisfaction',
    media: 'Photos & videos', mediaHint: 'Photos are resized automatically. Videos up to 50 MB each (keep them short). The coach looks at up to 3 photos.',
    addMedia: '+<br>Photo / video', uploading: 'Uploading…', zoom: 'Enlarge', remove: 'Remove', minus: 'Minus 1', plus: 'Plus 1',
    saveCoach: 'Save + coach', saveOnly: 'Save only', saveChanges: 'Save changes', close: 'Close',
    // 記録まわりのお知らせ
    waitUpload: 'Please wait until your photos/videos finish uploading', needDateSpot: 'Date and spot are required',
    saved: 'Saved. Enjoy the surf life!', changed: 'Changes saved', saveFail: 'Could not save ({e}). Your draft is kept.',
    draftBack: 'Restored your unfinished entry', tooLarge: 'Videos must be 50 MB or less. Please trim it.', upFail: 'Upload failed ({e})',
    deleted: 'Deleted', delFail: 'Could not delete', undo: 'Undo', undoFail: 'Could not restore',
    // 記録カード
    swellOf: '{d} swell', sec: '{n}s', windOf: '{s} wind', tries: '{n} tries', caughtN: '{n} caught', ridesN: '{n} rides',
    paddleOf: 'Paddling: {s}', themeL: 'Focus', longestL: 'Longest ride', fallsL: 'Why I fell', newSkillL: 'Unlocked!',
    growthL: 'Progress', nextL: 'Homework', bodyL: 'Body: {s}', englishL: 'Language notes', forecastL: 'Forecast',
    rateAria: 'Satisfaction {n}', edit: 'Edit', del: 'Delete', delSure: 'Really delete?', listSep: ', ',
    // AIコーチ
    coachAdvice: 'Coach’s advice', show: 'Show', hide: 'Hide', happened: 'What happened', causes: 'Possible causes', actions: 'What to try next',
    fromPhoto: 'From your photos', tapHw: 'Tap to make it next homework', viaChat: 'Your own AI', viaCoach: 'AI coach',
    photosUsed: 'used {n} photo(s)', generalAdvice: 'General advice based on your log',
    thinking: 'The coach is thinking… (10–30 sec)', askCoach: 'Ask the AI coach', askAgain: 'Ask again', askChat: 'Ask your own AI',
    pasteHelp: '① Instructions copied → paste them into the AI you usually use (ChatGPT, Claude, Gemini…). Attach photos yourself.<br>② Paste the answer below and save',
    pastePh: 'Paste the AI’s answer here', saveAdvice: 'Save as advice', adviceSaved: 'Advice saved',
    copied: 'Copied. Paste it into your own AI', copyFail: 'Could not copy',
    hwSet: 'Set as next homework', hwOff: 'Homework removed',
    noKey: 'The AI coach key (Gemini) isn’t set. Add it in ⚙︎ Settings, or use "Ask your own AI".',
    busyAll: 'Too busy right now (tried: {m}). Try again later or use "Ask your own AI".',
    quota: 'Hit the free-tier limit. Try again later or use "Ask your own AI".', badKey: 'The API key looks wrong. Check ⚙︎ Settings.',
    blocked: 'No advice was returned for this content.', recvFail: 'Couldn’t get an answer ({e})', noModel: 'No usable model found',
    // 設定
    langTitle: 'Language / 言語',
    aiTitle: 'AI coach (Gemini, free tier)',
    aiHint: 'Paste an API key made in Google AI Studio. It’s stored only on this device and never published. On the free tier, logs and photos you send may be used by Google to improve its services. Without a key you can still use "Ask your own AI".',
    gKey: 'Gemini API key', gModel: 'Model (usually leave as is — it re-picks automatically if unavailable)', gSave: 'Save & test',
    keyCleared: 'Key removed', testing: 'Testing…', connected: '✓ Connected (model: {m})', notConnected: '✗ Couldn’t connect: {e}',
    pfTitle: 'About my surfing (the coach reads this)', pfSave: 'Save profile', pfSaved: 'Profile saved',
    pf_level: 'Level', pf_spots: 'Usual spots', pf_stance: 'Stance', pf_board: 'Board', pf_waveAB: 'How I tell wave A from B',
    pf_canDo: 'What I can do now', pf_issues: 'Current challenges', pf_goals: 'Practice goals (in priority order)',
    pf_gear: 'Gear / thinking of buying', pf_why: 'What surfing means to me',
    impTitle: 'Import your past notes',
    impHint: 'Paste notes, a diary or messages to yourself from before you used this app. AI splits them into sessions. Anything you didn’t write (wave height, counts…) stays blank.',
    impMemo: 'Notes', impPh: 'e.g. 10/18 Canoes. Stood up 3 times in the whitewater. Paddled too late and the wave left me. Next time start paddling earlier.',
    impAi: 'Convert with AI coach', impCopy: 'Convert with your own AI',
    impPasteHelp: '① Instructions copied → paste them into the AI you usually use (ChatGPT, Claude, Gemini…)<br>② Copy its whole answer (starts with { ) and paste it below, then tap "Load"',
    impLoad: 'Load', impNeedMemo: 'Paste your notes first', impNoKey: 'The AI coach key (Gemini) isn’t set. Add it above, or use "Convert with your own AI".',
    impWorking: 'Converting… (10–30 sec)', impFail: 'Couldn’t convert: {e}', impUnread: 'Couldn’t read the answer',
    impBadPaste: 'Couldn’t read it. Copy the AI’s answer from start to end and paste it.',
    impFound: 'Found {n} session(s){p}. Check them below', impPlusPf: ' + profile', impNone: 'No sessions found. Check your notes.',
    impCheck: 'Tick what to import. You can fix the date and spot here; edit other fields later with "Edit" on each session.',
    impNth: 'Session {n}', impDup: 'Same date & spot already logged', impOther: '(no other fields)',
    impPf: 'Profile (fills only the fields that are empty now)', impSave: 'Save the ticked ones',
    impNothing: 'Nothing is ticked', impMissing: 'Some sessions have no date or spot', impDone: 'Imported {n} session(s){p}',
    dataTitle: 'Data', copyCsv: 'Copy all sessions as CSV', csvCopied: 'CSV copied', logout: 'Log out', loggedInAs: 'Logged in as {e}',
    // 時間の書き方・曜日
    hm: '{h}h {m}m', h: '{h}h', m: '{m} min',
    _dow: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    _themes: ['Turning while sitting', 'Catching waves by paddling', 'Choosing waves (A/B)', 'Pop-up timing', 'Where to lie on the board',
      'Foot position & weight', 'Speed after standing', 'Not pearling', 'Riding sideways'],
    _level: {
      ach: ['Not yet', 'A little', 'Halfway', 'Almost', 'Nailed it!'],
      paddle: ['Exhausting', 'A bit heavy', 'Normal', 'Moving well', 'On fire'],
    },
    _opt: {
      早朝: 'Dawn', 朝: 'Morning', 昼: 'Midday', 午後: 'Afternoon', 夕方: 'Evening',
      レギュラー: 'Regular', グーフィー: 'Goofy',
      晴れ: 'Sunny', 晴れ時々くもり: 'Partly cloudy', くもり: 'Cloudy', 雨: 'Rain',
      ひざ: 'Knee', もも: 'Thigh', 腰: 'Waist', 腹: 'Stomach', 胸: 'Chest', 肩: 'Shoulder', 頭: 'Head', 頭オーバー: 'Overhead',
      北: 'N', 北東: 'NE', 東: 'E', 南東: 'SE', 南: 'S', 南西: 'SW', 西: 'W', 北西: 'NW',
      オフショア: 'Offshore', サイド: 'Cross-shore', オンショア: 'Onshore',
      無風: 'Calm', 弱い: 'Light', ふつう: 'Moderate', 強い: 'Strong',
      干潮: 'Low', 上げ: 'Rising', 満潮: 'High', 下げ: 'Falling',
      A中心: 'Mostly A', B中心: 'Mostly B', AもBも: 'Both A & B',
      波が下を通過: 'Wave passed under me', パーリング: 'Pearled (nose dived)', 立つのが遅れた: 'Popped up too late',
      立った後に減速: 'Lost speed after standing', バランスを崩した: 'Lost balance', 波がすぐ潰れた: 'Wave closed out',
      ワイプアウト: 'Wiped out', 人を避けた: 'Avoided someone',
    },
    // AIへの指示書（記録の項目名）
    _field: {
      date: 'Date', time: 'Time', spot: 'Spot', board: 'Board', stance: 'Stance', weather: 'Weather', size: 'Wave size (felt)',
      swellDir: 'Swell direction', period: 'Period (s)', wind: 'Wind', tide: 'Tide', forecast: 'Forecast notes', theme: 'Focus',
      ach: 'Focus achievement', takeoffs: 'Take-off attempts', caught: 'Waves caught', rides: 'Rides standing up', waveType: 'Wave type',
      paddle: 'Paddling', longest: 'Longest ride', falls: 'Why I fell', newSkill: 'New skill', growth: 'Progress', next: 'Homework',
      memo: 'Notes', body: 'Body', english: 'Language notes', rate: 'Satisfaction', timeOfDay: 'Time of day', windStr: 'Wind strength',
      start: 'In', end: 'Out',
    },
    _prompt: {
      coachIntro: 'You are an experienced, encouraging surf coach. Give advice in English on "today’s session" from a beginner student’s surf log.',
      coachRules: `Rules:
- Clearly separate the reflection into "what happened", "possible causes" and "concrete actions to try next".
- Put the most weight on today’s focus, achievement, counts, reasons for falling and notes; also consider wave, wind, tide and board.
- If there are past sessions with the same focus, say concretely whether it is improving or stuck. If there was homework last time, say whether it was done.
- Narrow down what to do next according to the student’s practice goals (in priority order).
- Do not present things that are not in the log (wave height, counts, times…) as facts. Forecast notes are not necessarily the real waves.
- Distinguish what the student can already do from future goals.
- If pain or rashes are logged, add a short prevention tip. If strong pain continues, recommend seeing a professional.
- Only when photos are attached, comment on posture, gaze, weight and foot position. Do not assert what the photos can’t clearly show.
- Keep the tone positive but specific.
- In "Wave type", A = a clean, unbroken (green) wave; B = broken whitewater.`,
      outChat: `Answer in English, readable, in this form:
[What happened] 1–2 sentences
[Possible causes] 2–3 bullet points
[Concrete actions to try next] 2–3 (which body part, when, how)
[Homework ideas for next time] 3 (about 5–8 words each)
(if photos) [From the photos] 2–3 sentences`,
      outJson: `Return only this JSON, with all text values in English:
{"happened":"what happened (1–2 sentences)","causes":["possible cause",...2–3],"actions":[{"title":"short heading","detail":"which body part, when, how (2–3 sentences)"},...2–3],"homework":["homework idea for next time (5–8 words)",...3],"photo":"empty string if no photos","safety":"one line only when needed, else empty string"}`,
      profile: 'Student profile:', today: 'Today’s session:', prev: 'Previous session (to check last homework):',
      same: 'Past sessions with the same focus "{t}" (newest first):', other: 'Other recent sessions (for reference):',
      none: 'none', noTheme: '(no focus)', photosNote: '(There are {n} photo(s). I will paste them next.)',
      impIntro: `You are the data organizer for the surf log app "Namilog". The [Notes] below are surf records the user wrote before using the app.
Split them into one record per surf session and return only JSON in the [Format] below (no explanation, no code block).`,
      impRules: `[Rules]
- Never guess anything that is not in the notes. Omit unknown fields (do not invent wave height, counts, times).
- Put forecast content in "forecast", not in the real-wave fields (such as size).
- Dates are YYYY-MM-DD. If no year is written, use the closest year on or before today ({today}). If the date is vague, say so in dateNote (e.g. "Around 10/1. Exact date unknown").
- For fields with choices, use one of the listed words exactly. Omit the field if none fits.
- Keep the user’s own wording as much as possible, in the language of the notes. Content not tied to a single session (level, challenges, goals, gear, feelings…) goes into "profile".`,
      impFormat: '[Format] (descriptions of the values; omit unknown fields)', impNotes: '[Notes]',
    },
    _impf: {
      date: 'YYYY-MM-DD', dateNote: 'note about the date', start: 'time in HH:MM', end: 'time out HH:MM', spot: 'spot name', board: 'board',
      period: 'period (seconds)', forecast: 'forecast notes', theme: 'focus / what was practiced', ach: 'achievement of the focus, a number 1–5',
      takeoffs: 'number of take-off attempts', caught: 'number of waves caught', rides: 'number of rides standing up',
      waveTypeNote: '(A = clean unbroken wave, B = broken whitewater)', paddle: 'paddling 1–5 (1 = exhausting, 5 = on fire)',
      longest: 'description of the longest ride', falls: 'reasons for falling; choose from (multiple OK)', newSkill: 'something new they could do',
      growth: 'progress they felt', next: 'homework / what to do next time', memo: 'other notes', body: 'pain or rashes',
      english: 'language notes', rate: 'satisfaction 1–5',
    },
  },

  ja: {
    app: '波ログ',
    loginMsg: 'メールアドレスとパスワードでログイン', email: 'メールアドレス', password: 'パスワード（6文字以上）',
    login: 'ログイン', signup: 'はじめて使う（アカウントを作る）', loggingIn: 'ログイン中…', signingUp: 'アカウントを作成中…',
    needEmailPw: 'メールと6文字以上のパスワードを入れてください', wrongPw: 'メールかパスワードが違います',
    checkMail: '確認メールを送りました。メールのリンクを開いてから、ここでログインしてください',
    setupTitle: 'あと少し！', setupText: 'config.js に Supabase の URL と anon key を入れてください。手順は README.md の「ステップ2」にあります。',
    settings: '設定', recordArea: '記録する', loading: '読み込み中…', openForm: '＋ 今日のセッションを記録',
    synced: 'クラウドに保存中・iPhoneでもPCでも同じ記録', loadFail: '記録を読み込めませんでした（{e}）',
    statMonth: '今月のセッション', statAll: 'これまでの記録', statRides: '立って滑れた', statTime: '海にいた時間',
    times: '{n}回', rides: '{n}本', prevHw: '前回の宿題（{d} {s}）',
    logTitle: 'セッション日誌', search: 'ポイント・テーマ・メモで検索', searchAria: '検索',
    notFound: '見つかりませんでした', notFoundSub: '別のことばで検索してみてください',
    noLogs: 'まだ記録がありません', noLogsSub: '上のボタンから記録するか、設定の「これまでの記録を取り込む」をどうぞ',
    skillsTitle: 'できるようになったこと', skillsEmpty: '「新しくできるようになったこと」を書くと、ここに積み上がります',
    growthTitle: 'テーマ別の上達', growthEmpty: '練習テーマを書くと、テーマごとの達成度の伸びが並びます',
    spotsTitle: 'ポイント別', spotsEmpty: 'よく行くポイントがここに並びます', spotTimes: '{n}回',
    waveCap: '最近{n}回の「立って滑れた本数」', waveEmpty: '記録するとここにうねりが描かれます',
    gWhen: 'いつ・どこで', date: '日付', start: '入水', end: '終了', timeOfDay: '時間帯（時刻がわからないとき）',
    spot: 'ポイント', spotPh: '例：Canoes', board: 'ボード', boardPh: '例：10\'0 ソフト', stance: 'スタンス',
    gCond: 'コンディション', weather: '天気', size: '波のサイズ（体感）', swellDir: 'うねりの向き（どこから来たか）',
    period: '周期（秒）', periodPh: '例：12', wind: '風（岸に対して）', windStr: '風の強さ', tide: '潮',
    forecast: '予報メモ（実際の波とは別に）', forecastPh: '例：南岸 2〜3ft、東の風',
    gTheme: '今日のテーマ', theme: '練習テーマ', themePh: '例：座ったまま180度ターン', ach: 'テーマの達成度',
    gWaves: '乗った波', takeoffs: 'テイクオフに挑戦', caught: '波をキャッチ', ridesF: '立って滑れた',
    waveType: '乗った波の種類（A＝崩れる前／B＝白波）', paddle: 'パドリングの感覚',
    longest: 'いちばん長く乗れた波', longestPh: '例：早めにパドルを始めたら、波が大きくなるところで滑り出せた',
    falls: '落ちた・失敗した原因（いくつでも）',
    gReflect: 'ふり返り', newSkill: '新しくできるようになったこと', newSkillPh: '例：座ったまま向きを変えられた',
    growth: '前回からの成長', next: '次回の宿題（次に記録するとき上に出ます）', nextPh: '例：波が来る3秒前からパドル開始',
    memo: '気づき・気持ち', body: '体の痛み・擦れ', bodyPh: '例：胸の擦れなし（ラッシュガード着用）',
    english: '英語メモ（サーフィン用語・聞きたいこと）', englishPh: '例：pearling＝ノーズが刺さること', rate: '満足度',
    media: '写真・動画', mediaHint: '写真は自動で小さくして保存。動画は1本50MBまで（短めに）。コーチは写真を最大3枚見ます。',
    addMedia: '＋<br>写真・動画', uploading: '送信中…', zoom: '拡大', remove: '外す', minus: '1減らす', plus: '1増やす',
    saveCoach: '保存＋コーチ', saveOnly: '保存だけ', saveChanges: '変更を保存', close: '閉じる',
    waitUpload: '写真・動画の送信が終わるまでお待ちください', needDateSpot: '日付とポイントは必須です',
    saved: '記録しました。良いサーフィンライフを！', changed: '変更を保存しました', saveFail: '保存できませんでした（{e}）。下書きは残っています',
    draftBack: '書きかけの記録を戻しました', tooLarge: '動画は50MBまでです。短く切ってください', upFail: 'アップロードできませんでした（{e}）',
    deleted: '削除しました', delFail: '削除できませんでした', undo: '元に戻す', undoFail: '戻せませんでした',
    swellOf: '{d}うねり', sec: '{n}秒', windOf: '風{s}', tries: '挑戦{n}', caughtN: 'キャッチ{n}', ridesN: '立って{n}本',
    paddleOf: 'パドル：{s}', themeL: 'テーマ', longestL: 'いちばん長い波', fallsL: '失敗の原因', newSkillL: 'できた！',
    growthL: '成長', nextL: '次回の宿題', bodyL: '体：{s}', englishL: '英語メモ', forecastL: '予報',
    rateAria: '満足度{n}', edit: '編集', del: '削除', delSure: '本当に削除', listSep: '、',
    coachAdvice: 'コーチのアドバイス', show: '開く', hide: '閉じる', happened: '何が起きたか', causes: '考えられる原因', actions: '次に試すこと',
    fromPhoto: '写真から', tapHw: 'タップで次回の宿題にする', viaChat: 'いつものAI', viaCoach: 'AIコーチ',
    photosUsed: '写真{n}枚を参考', generalAdvice: '記録からの一般的なアドバイスです',
    thinking: 'コーチが考え中…（10〜30秒）', askCoach: 'AIコーチに聞く', askAgain: 'もう一度聞く', askChat: 'いつものAIに聞く',
    pasteHelp: '① 指示書をコピーしました → ChatGPT・Claude・Geminiなど、いつも使っているAIに貼り付け（写真は手で添付）<br>② 返ってきた答えを下に貼って保存',
    pastePh: 'AIの答えをここに貼り付け', saveAdvice: 'アドバイスとして保存', adviceSaved: 'アドバイスを保存しました',
    copied: 'コピーしました。いつものAIに貼り付けてください', copyFail: 'コピーできませんでした',
    hwSet: '次回の宿題にしました', hwOff: '宿題を外しました',
    noKey: 'AIコーチのキー（Gemini）が未設定です。⚙︎設定から入れるか、「いつものAIに聞く」を使ってください',
    busyAll: '混んでいて使えませんでした（試したモデル：{m}）。少し時間をおくか「いつものAIに聞く」を使ってください',
    quota: '無料枠の回数制限に当たりました。少し時間をおくか、「いつものAIに聞く」を使ってください', badKey: 'APIキーが正しくないようです。⚙︎設定を確認してください',
    blocked: 'この内容にはアドバイスが返りませんでした', recvFail: 'うまく受け取れませんでした（{e}）', noModel: '使えるモデルが見つかりません',
    langTitle: 'Language / 言語',
    aiTitle: 'AIコーチ（Gemini・無料枠）',
    aiHint: 'Google AI Studio で作った API キーを貼ります。キーはこの端末の中にだけ保存され、公開されません。無料枠で送った記録・写真は Google のサービス改善に使われることがあります。キーがなくても「いつものAIに聞く」は使えます。',
    gKey: 'Gemini API キー', gModel: 'モデル（ふつうは変更不要。使えないときは自動で選び直します）', gSave: '保存してテスト',
    keyCleared: 'キーを消しました', testing: 'テスト中…', connected: '✓ つながりました（モデル：{m}）', notConnected: '✗ つながりませんでした：{e}',
    pfTitle: 'わたしのサーフィン（コーチが読みます）', pfSave: 'プロフィールを保存', pfSaved: 'プロフィールを保存しました',
    pf_level: 'レベル', pf_spots: 'よく行く場所', pf_stance: 'スタンス', pf_board: 'ボード', pf_waveAB: '波A・Bの区別',
    pf_canDo: 'できるようになったこと', pf_issues: '今の課題', pf_goals: '練習目標（優先順）',
    pf_gear: '用具・購入検討', pf_why: 'サーフィンへの思い',
    impTitle: 'これまでの記録を取り込む',
    impHint: 'アプリを使う前のメモ・日記・自分宛てのメッセージなどを、そのまま貼り付けてください。AIが1回ずつの記録に分けます。書いていないこと（波の高さ・本数など）は空欄のままです。',
    impMemo: 'メモ', impPh: '例：10/18 Canoes。白波で3本立てた。パドルが遅れて波に置いていかれた。次は早めにパドルを始める',
    impAi: 'AIコーチで変換', impCopy: 'いつものAIで変換',
    impPasteHelp: '① 指示書をコピーしました → ChatGPT・Claude・Geminiなど、いつも使っているAIに貼り付け<br>② 返ってきた答え（{ で始まる文字）を全部コピーして、下に貼って「読み込む」',
    impLoad: '読み込む', impNeedMemo: 'メモを貼り付けてください', impNoKey: 'AIコーチのキー（Gemini）が未設定です。上で設定するか「いつものAIで変換」を使ってください',
    impWorking: '変換中…（10〜30秒）', impFail: '変換できませんでした：{e}', impUnread: '答えを読み取れませんでした',
    impBadPaste: '読み取れませんでした。AIの答えを最初から最後まで全部コピーして貼ってください',
    impFound: '{n}回分{p}が見つかりました。下で確認してください', impPlusPf: '＋プロフィール', impNone: '記録が見つかりませんでした。メモの内容を確認してください',
    impCheck: '取り込むものにチェック。日付とポイントはここで直せます。ほかの項目は、取り込んだあと各記録の「編集」から直せます。',
    impNth: '{n}件目', impDup: '同じ日・場所の記録あり', impOther: '（ほかの項目なし）',
    impPf: 'プロフィール（いま空欄の項目だけ埋めます）', impSave: 'チェックしたものを保存',
    impNothing: 'チェックされたものがありません', impMissing: '日付とポイントが空の記録があります', impDone: '{n}回分{p}を取り込みました',
    dataTitle: 'データ', copyCsv: '全記録をCSVでコピー', csvCopied: 'CSVをコピーしました', logout: 'ログアウト', loggedInAs: 'ログイン中：{e}',
    hm: '{h}時間{m}分', h: '{h}時間', m: '{m}分',
    _dow: ['日', '月', '火', '水', '木', '金', '土'],
    // _themes・_level・_opt がない言語は、app.js にある日本語がそのまま使われます
    _field: {
      date: '日付', time: '時間', spot: 'ポイント', board: 'ボード', stance: 'スタンス', weather: '天気', size: '波のサイズ体感',
      swellDir: 'うねり', period: '周期秒', wind: '風', tide: '潮', forecast: '予報メモ', theme: 'テーマ',
      ach: '達成度', takeoffs: 'テイクオフ挑戦', caught: 'キャッチ', rides: '立って滑れた', waveType: '波の種類',
      paddle: 'パドルの感覚', longest: 'いちばん長い波', falls: '失敗の原因', newSkill: 'できるようになったこと', growth: '成長', next: '次回の宿題',
      memo: '気づき', body: '体', english: '英語メモ', rate: '満足度', timeOfDay: '時間帯', windStr: '風の強さ', start: '入水', end: '終了',
    },
    _prompt: {
      coachIntro: 'あなたは経験豊富で、励まし上手なサーフィンコーチです。初心者の生徒がつけたサーフィン日誌の「今日のセッション」について、日本語でアドバイスしてください。',
      coachRules: `ルール:
- ふり返りは「何が起きたか」「考えられる原因」「次に試す具体的な行動」の3つをはっきり分ける。
- 今日のテーマ・達成度・本数・失敗の原因・メモを最も重視し、波・風・潮・ボードの条件も考えに入れる。
- 同じテーマの過去の記録があれば、伸びている／止まっているに具体的に触れる。前回の宿題があれば、それができたかにも触れる。
- 生徒の練習目標（優先順）に沿って、次にやることを絞る。
- 日誌に書かれていないこと（波の高さ・本数・時間など）を推測で事実のように書かない。予報メモは実際の波とは限らない。
- すでにできたことと、これからの目標を区別する。
- 体の痛み・擦れの記録があれば、予防のひとことを添える。強い痛みが続くなら専門家に相談するよう勧める。
- 写真が添付されている場合だけ、姿勢・目線・重心・足の位置について書く。写真から確かに言えないことは断定しない。
- トーンは前向きに、でも具体的に。`,
      outChat: `次の形で、日本語で、読みやすく答えてください：
【何が起きたか】1〜2文
【考えられる原因】箇条書き2〜3個
【次に試す具体的な行動】2〜3個（体のどこを・いつ・どうする）
【次回の宿題の候補】3つ（各20文字前後）
（写真があれば）【写真から】2〜3文`,
      outJson: `次のJSONだけを返してください:
{"happened":"何が起きたか（1〜2文）","causes":["考えられる原因",...2〜3個],"actions":[{"title":"短い見出し","detail":"体のどこを・いつ・どうするか（2〜3文）"},...2〜3個],"homework":["次回の宿題の候補（20文字前後）",...3個],"photo":"写真がなければ空文字","safety":"必要なときだけ一言。なければ空文字"}`,
      profile: '生徒のプロフィール:', today: '今日のセッション:', prev: '前回のセッション（前回の宿題の確認用）:',
      same: '同じテーマ「{t}」の過去の記録（新しい順）:', other: '最近のほかのセッション（参考）:',
      none: 'なし', noTheme: '（テーマなし）', photosNote: '（写真が{n}枚あります。このあと貼り付けます）',
      impIntro: `あなたはサーフィン記録アプリ「波ログ」のデータ整理係です。下の【メモ】は、ユーザーがアプリを使う前に書いたサーフィンの記録です。
1回の海＝1件の記録に分けて、下の【形式】のJSONだけを返してください（説明文やコードブロックは不要）。`,
      impRules: `【ルール】
- メモに書いていないことは推測で埋めない。分からない項目は出力しない（波の高さ・本数・時間などを作らない）
- 予報の内容は forecast に入れ、実際の波の項目（size など）には入れない
- 日付は YYYY-MM-DD。年が書いていなければ、今日（{today}）以前でいちばん近い年にする。日付があいまいなら dateNote にそのことを書く（例：「10/1頃。正確な日付は不明」）
- 選択肢がある項目は、選択肢の言葉そのままで入れる。当てはまらなければ出力しない
- メモの言い回しはできるだけ残す。1回の海に結びつかない内容（レベル・課題・目標・用具・思いなど）は profile に入れる`,
      impFormat: '【形式】（値の説明。分からない項目は省く）', impNotes: '【メモ】',
    },
    _impf: {
      date: 'YYYY-MM-DD', dateNote: '日付の補足', start: '入水 HH:MM', end: '終了 HH:MM', spot: 'ポイント名', board: 'ボード',
      period: '周期（秒）', forecast: '予報メモ', theme: 'その日のテーマ・練習したこと', ach: 'テーマの達成度 1〜5の数字',
      takeoffs: 'テイクオフに挑戦した回数（数字）', caught: '波をキャッチした回数（数字）', rides: '立って滑れた回数（数字）',
      waveTypeNote: '（A＝崩れる前の滑らかな波、B＝崩れた白波）', paddle: 'パドルの調子 1〜5（1=きつい 5=絶好調）',
      longest: 'いちばん長く乗れた波の様子', falls: '失敗の原因。次から選ぶ（複数可）', newSkill: 'できるようになったこと',
      growth: '成長を感じたこと', next: '次回の宿題・次にやりたいこと', memo: 'その他の気づき', body: '体の痛み・擦れ',
      english: '英語メモ', rate: '満足度 1〜5',
    },
  },
};
