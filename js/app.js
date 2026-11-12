/* המורה הקולית – מסכים, מנוע תרגול, רמות, מסך הורים */
(function () {
  const { fmt } = window.HE;
  const V = window.Voice;
  const UNITS = [...window.FRACTIONS, ...window.SEQUENCES];
  const TOPICS = [
    { id: 'fractions', title: 'שברים', icon: '🍕' },
    { id: 'sequences', title: 'סדרות', icon: '🦘' },
  ];
  const ROUND = 8;
  const ERR_LABELS = {
    uncolored: 'סופרת את החלק הלא צבוע', swapped: 'מחליפה בין המספר למעלה למספר למטה', den: 'טעות בספירת כל החלקים',
    count: 'צובעת מספר חלקים לא נכון', remaining: 'עונה על החלק שנלקח במקום על מה שנשאר',
    sameDen: 'השוואה כשהמספר למטה שווה', sameNum: 'חושבת שמספר גדול למטה = שבר גדול', equal: 'לא מזהה שברים שווים',
    half: 'השוואה בעזרת חצי', missing: 'טריק החלק החסר', wholeConvert: 'המרה בין שלמים לפרוסות',
    addWholes: 'מחברת שלמים לפרוסות במקום "כפול ועוד"', notMixed: 'לא מוציאה את השלמים במספר מעורב',
    addDen: 'מחברת או מחסרת גם את המספרים למטה', related: 'לא מתרגמת לאותו מכנה', timesFrac: 'כופלת גם את המספר למטה',
    borrow: 'לא פורטת שלם בחיסור', forgotTake: 'מחלקת ושוכחת לכפול במספר למעלה', inverse: 'מתבלבלת בבעיה ההפוכה (מציאת השלם)',
    direction: 'הולכת בכיוון הלא נכון בסדרה', wrongJump: 'טעות בגודל הקפיצה', notMult: 'לא מזהה סדרת כפל/חילוק',
    sameJump: 'לא שמה לב שהקפיצות משתנות', offByOne: 'סופרת קפיצה אחת יותר מדי (מקום N)', member: 'בדיקה אם מספר נמצא בסדרה',
    other: 'טעות אחרת',
  };
  const PRAISE = ['מעולה!', 'בדיוק!', 'כל הכבוד!', 'יפה מאוד!', 'וואו, נכון!', 'אלופה!', 'מצוין!', 'פגיעה בול!'];

  /* ---------- מצב ושמירה ---------- */
  const KEY = 'voicetutor_v1';
  let S;
  function fresh() { return { name: '', stars: 0, units: {}, errors: {}, voiceOn: true, rate: 0.95 }; }
  function load() { try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function U(id) { return (S.units[id] = S.units[id] || { level: 1, hist: [], correct: 0, total: 0, mastered: false, lessonSeen: false }); }

  /* ---------- כלי תצוגה ---------- */
  const $ = (sel, root = document) => root.querySelector(sel);
  const main = () => $('#main');
  function setBubble(text) { const b = $('#bubble'); if (b) { b.innerHTML = fmt(text); b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop'); } }
  V.onSubtitle = setBubble;
  function topbar() {
    $('#stars').textContent = S.stars;
    $('#hello').textContent = S.name ? `היי ${S.name}!` : '';
  }
  function confetti() {
    const box = $('#confetti');
    box.innerHTML = '';
    const colors = ['#ff8fab', '#ffd166', '#06d6a0', '#118ab2', '#ef476f', '#b388ff'];
    for (let i = 0; i < 40; i++) {
      const c = document.createElement('i');
      c.style.left = Math.random() * 100 + '%';
      c.style.background = colors[i % colors.length];
      c.style.animationDelay = Math.random() * 0.5 + 's';
      c.style.transform = `rotate(${Math.random() * 360}deg)`;
      box.appendChild(c);
    }
    setTimeout(() => (box.innerHTML = ''), 2600);
  }
  const say = t => V.speak(t);
  /* כל מסך מקבל מזהה, כדי שהסבר שעוד רץ לא ייגע במסך חדש */
  let SCREEN = 0;
  const newScreen = () => { V.stop(); return ++SCREEN; };

  /* ---------- מסך פתיחה ---------- */
  function welcome() {
    newScreen();
    main().innerHTML = `
      <div class="card center">
        <h1>המורה הקולית</h1>
        <p class="lead">שלום! אני נוגה הינשופה 🦉<br>אני אסביר לך שברים וסדרות – בקול, עם ציורים.</p>
        <label class="field">איך קוראים לך?<input id="nm" maxlength="20" autocomplete="off" placeholder="השם שלך"></label>
        <button class="big primary" id="go">בואי נתחיל! ✨</button>
        <p class="note" id="vnote"></p>
      </div>`;
    voiceNote($('#vnote'));
    $('#go').onclick = () => {
      S.name = $('#nm').value.trim();
      save(); topbar();
      say(`נעים מאוד${S.name ? ' ' + S.name : ''}! בחרי נושא, ונתחיל.`);
      home();
    };
  }
  function voiceNote(el) {
    if (!el) return;
    setTimeout(() => {
      if (!V.supported) el.textContent = 'הדפדפן הזה לא תומך בהקראה. הכתוביות יופיעו בבועה של נוגה.';
      else if (!V.hasHebrew) el.innerHTML = 'לא נמצא קול עברי במכשיר הזה, אז ההסברים יופיעו בכתב. במחשב Windows: הגדרות ← זמן ושפה ← דיבור ← הוספת קולות ← עברית. באייפון הקול העברי מובנה.';
      else el.textContent = '';
    }, 600);
  }

  /* ---------- מסך הבית ---------- */
  function home() {
    newScreen();
    topbar();
    let html = '';
    for (const t of TOPICS) {
      html += `<h2 class="topic">${t.icon} ${t.title}</h2><div class="grid">`;
      for (const u of UNITS.filter(x => x.topic === t.id)) {
        const st = U(u.id);
        const lv = st.mastered ? '<span class="crown">👑 אלופה</span>' : `<span class="lv">רמה ${st.level}</span>`;
        const dots = [1, 2, 3].map(i => `<b class="${i < st.level || st.mastered ? 'f' : i === st.level ? 'c' : ''}"></b>`).join('');
        html += `<button class="unit" data-id="${u.id}"><span class="ic">${u.icon}</span><span class="tt">${u.title}</span><span class="sb">${u.sub}</span><span class="dots">${dots}</span>${lv}</button>`;
      }
      html += '</div>';
    }
    html += `<button class="link" id="parents">מסך הורים</button>`;
    main().innerHTML = html;
    main().querySelectorAll('.unit').forEach(b => (b.onclick = () => unitMenu(UNITS.find(u => u.id === b.dataset.id))));
    $('#parents').onclick = parents;
    setBubble(S.name ? `${S.name}, מה נלמד היום?` : 'מה נלמד היום?');
  }

  /* ---------- תפריט יחידה ---------- */
  function unitMenu(u) {
    newScreen();
    const st = U(u.id);
    main().innerHTML = `
      <div class="card center">
        <div class="bigic">${u.icon}</div>
        <h1>${u.title}</h1>
        <p class="lead">${u.sub} · ${st.mastered ? '👑 שולטת בנושא!' : 'רמה ' + st.level + ' מתוך 3'}</p>
        <div class="row">
          <button class="big ${st.lessonSeen ? '' : 'primary glow'}" id="ls">📺 שיעור</button>
          <button class="big ${st.lessonSeen ? 'primary' : ''}" id="pr">✏️ תרגול</button>
        </div>
        <button class="link" id="bk">→ חזרה</button>
      </div>`;
    $('#ls').onclick = () => lesson(u);
    $('#pr').onclick = () => practice(u);
    $('#bk').onclick = home;
    say(st.lessonSeen ? `${u.title}. רוצה לתרגל, או לשמוע שוב את השיעור?` : `${u.title}. כדאי להתחיל מהשיעור.`);
  }

  /* ---------- נגן שיעור ---------- */
  function lesson(u) {
    const sid = newScreen();
    let i = 0, auto = true, token = 0;
    main().innerHTML = `
      <div class="card">
        <div class="hdr"><button class="link" id="bk">→ חזרה</button><b>📺 ${u.title}</b><span id="pg"></span></div>
        <div class="vizbox" id="vz"></div>
        <div class="sub" id="sb"></div>
        <div class="row ctl">
          <button id="pv">→ הקודם</button>
          <button id="rp" aria-label="שוב">🔁 שוב</button>
          <button id="nx">הבא ←</button>
        </div>
        <div id="end" class="center hidden"><button class="big primary" id="gopr">✏️ עכשיו לתרגל!</button></div>
      </div>`;
    const show = async idx => {
      const my = ++token;
      i = Math.max(0, Math.min(u.lesson.length - 1, idx));
      const step = u.lesson[i];
      $('#vz').innerHTML = step.viz ? step.viz() : '';
      $('#sb').innerHTML = fmt(step.say);
      $('#pg').textContent = `${i + 1}/${u.lesson.length}`;
      const last = i === u.lesson.length - 1;
      $('#end').classList.toggle('hidden', !last);
      await say(step.say);
      if (my !== token || sid !== SCREEN) return;
      if (last) {
        U(u.id).lessonSeen = true; save();
        await say('עכשיו תורך! בואי נתרגל.');
      } else if (auto) setTimeout(() => { if (my === token && sid === SCREEN) show(i + 1); }, 700);
    };
    $('#pv').onclick = () => show(i - 1);
    $('#nx').onclick = () => show(i + 1);
    $('#rp').onclick = () => show(i);
    $('#bk').onclick = () => { token++; unitMenu(u); };
    $('#gopr').onclick = () => { token++; practice(u); };
    show(0);
  }

  /* ---------- תרגול ---------- */
  function practice(u) {
    const st = U(u.id);
    const sess = { n: 0, firstOk: 0, q: null, tries: 0, done: false, streakBad: 0 };

    function frame() {
      main().innerHTML = `
        <div class="card">
          <div class="hdr"><button class="link" id="bk">→ חזרה</button><b>${u.icon} ${u.title}</b>
            <span class="badge">${st.mastered ? '👑' : 'רמה ' + st.level}</span></div>
          <div class="progress">${Array.from({ length: ROUND }, (_, k) => `<i class="${k < sess.n ? 'd' : k === sess.n ? 'c' : ''}"></i>`).join('')}</div>
          <div class="qtext"><button class="spk" id="spk" aria-label="להשמיע שוב">🔊</button><div id="qt"></div></div>
          <div class="vizbox" id="vz"></div>
          <div id="ans"></div>
          <div id="fb" class="fb"></div>
          <div id="sol" class="sol hidden"></div>
          <div class="row"><button class="big primary hidden" id="next">הבא ➜</button></div>
          <div id="tip" class="tip hidden"></div>
        </div>`;
      $('#bk').onclick = () => { V.stop(); unitMenu(u); };
    }

    function ask() {
      sess.sid = newScreen();
      sess.q = u.gen(st.level);
      sess.tries = 0; sess.done = false;
      frame();
      const q = sess.q;
      $('#qt').innerHTML = fmt(q.text);
      $('#vz').innerHTML = q.viz || '';
      $('#spk').onclick = () => say(q.say || q.text);
      renderAnswer(q);
      $('#next').onclick = nextQ;
      if (sess.streakBad >= 2) {
        const t = $('#tip');
        t.classList.remove('hidden');
        t.innerHTML = `רוצה לשמוע שוב את ההסבר? <button class="link" id="relesson">📺 לשיעור</button>`;
        $('#relesson').onclick = () => lesson(u);
      }
      say(q.say || q.text);
    }

    function renderAnswer(q) {
      const box = $('#ans');
      if (q.type === 'choice') {
        box.innerHTML = `<div class="choices ${q.compare ? 'cmp' : ''}">${q.choices.map(c =>
          `<button class="ch" data-v="${c.value}" dir="ltr">${fmt(c.label)}</button>`).join('')}</div>`;
        box.querySelectorAll('.ch').forEach(b => (b.onclick = () => { if (!sess.done) submit(b.dataset.v, b); }));
      } else if (q.type === 'num') {
        box.innerHTML = `<form class="numin" id="f"><input id="v" inputmode="numeric" pattern="[0-9]*" autocomplete="off" enterkeyhint="done"><button class="big primary">בדיקה ✓</button></form>`;
        $('#f').onsubmit = e => { e.preventDefault(); if (!sess.done) submit($('#v').value); };
      } else if (q.type === 'frac') {
        const whole = q.mode !== 'frac' ? `<input class="w" id="w" inputmode="numeric" pattern="[0-9]*" autocomplete="off" placeholder="${q.mode === 'mixed' ? 'שלמים' : ''}">` : '';
        box.innerHTML = `<form class="fracin" id="f"><div class="fx" dir="ltr">${whole}<div class="fbox"><input id="n" inputmode="numeric" pattern="[0-9]*" autocomplete="off"><span class="ln"></span><input id="d" inputmode="numeric" pattern="[0-9]*" autocomplete="off"></div></div>
          ${q.mode === 'any' ? '<p class="note">אפשר לכתוב שבר או מספר מעורב (שלמים בתיבה השמאלית)</p>' : ''}
          <button class="big primary">בדיקה ✓</button></form>`;
        $('#f').onsubmit = e => {
          e.preventDefault(); if (sess.done) return;
          submit({ w: $('#w') ? $('#w').value : '', n: $('#n').value, d: $('#d').value });
        };
      } else if (q.type === 'paint') {
        const svg = q.shape === 'pizza' ? window.D.pizza(q.n, 0) : window.D.bar(q.n, 0);
        $('#vz').innerHTML = svg;
        $('#vz').classList.add('paint');
        $('#vz').querySelectorAll('.slice').forEach(s => (s.onclick = () => { if (!sess.done) s.classList.toggle('on'); }));
        box.innerHTML = `<div class="row"><button class="big primary" id="chk">בדיקה ✓</button></div>`;
        $('#chk').onclick = () => submit($('#vz').querySelectorAll('.slice.on').length);
      }
    }

    function check(q, input) {
      if (q.type === 'choice') {
        if (input === q.answer) return { ok: true };
        const c = q.choices.find(x => String(x.value) === String(input));
        return { ok: false, err: c && c.err };
      }
      if (q.type === 'paint') return q.check(input);
      if (q.type === 'num') {
        if (String(input).trim() === '') return { invalid: 'כתבי מספר בתיבה 🙂' };
        const v = parseInt(input, 10);
        if (v === q.answer) return { ok: true };
        return Object.assign({ ok: false }, (q.diagnose && q.diagnose(v)) || {});
      }
      /* frac */
      const w = parseInt(input.w || '0', 10) || 0;
      const hasN = String(input.n).trim() !== '', hasD = String(input.d).trim() !== '';
      let n = parseInt(input.n, 10), d = parseInt(input.d, 10);
      if (!hasN && !hasD) {
        if (q.mode === 'any' && String(input.w).trim() !== '') { n = 0; d = 1; }
        else return { invalid: 'כתבי את השבר: מספר למעלה ומספר למטה 🙂' };
      } else if (!hasN || !hasD) return { invalid: hasN ? 'חסר המספר למטה 🙂' : 'חסר המספר למעלה 🙂' };
      const ans = { w, n, d };
      if (d === 0) {
        const dg = q.diagnose && q.diagnose(ans);
        return dg ? Object.assign({ ok: false }, dg) : { invalid: 'אי אפשר שהמספר למטה יהיה 0' };
      }
      const equal = (w * d + n) * q.answer.d === q.answer.n * d;
      if (equal && q.mode === 'mixed' && n >= d) return { ok: false, err: 'notMixed', msg: 'נכון שזה שווה! אבל במספר מעורב מוציאים את כל הפיצות השלמות, וצריך שיישארו פחות פרוסות מפיצה שלמה.' };
      if (equal) return { ok: true };
      return Object.assign({ ok: false }, (q.diagnose && q.diagnose(ans)) || {});
    }

    async function submit(input, btn) {
      const q = sess.q, sid = sess.sid;
      const alive = () => sid === SCREEN;
      const res = check(q, input);
      const fb = $('#fb');
      if (res.invalid) { fb.className = 'fb warn'; fb.innerHTML = res.invalid; return; }
      if (res.ok) {
        sess.done = true;
        if (btn) btn.classList.add('right');
        const first = sess.tries === 0;
        S.stars += first ? 2 : 1;
        record(true && first, null);
        topbar();
        let p = PRAISE[Math.floor(Math.random() * PRAISE.length)];
        if (S.name && Math.random() < 0.35) p = p.replace('!', `, ${S.name}!`);
        fb.className = 'fb good'; fb.innerHTML = `${p} ${first ? '⭐⭐' : '⭐'}`;
        if (q.type === 'paint') $('#vz').classList.add('done');
        $('#next').classList.remove('hidden');
        const levelMsg = levelCheck();
        await say(p);
        if (!alive()) return;
        if (levelMsg) { confetti(); fb.innerHTML += `<div class="lvup">${levelMsg}</div>`; await say(levelMsg); }
        return;
      }
      if (btn) { btn.classList.add('wrong'); btn.disabled = true; }
      sess.tries++;
      if (sess.tries === 1) {
        const key = res.err || 'other';
        S.errors[key] = (S.errors[key] || 0) + 1; save();
        const hint = res.msg || (q.hints && res.err && q.hints[res.err]) || q.hint || 'כמעט! בואי ננסה שוב.';
        fb.className = 'fb hint'; fb.innerHTML = '💡 ' + fmt(hint);
        if (q.hintViz) $('#vz').innerHTML = q.hintViz;
        if (q.type === 'num' && $('#v')) { $('#v').value = ''; }
        await say('כמעט! ' + hint);
        return;
      }
      /* פעם שנייה: מראים פתרון */
      sess.done = true;
      record(false);
      fb.className = 'fb hint'; fb.innerHTML = 'בואי נראה יחד איך פותרים:';
      const sol = $('#sol');
      sol.classList.remove('hidden');
      sol.innerHTML = '';
      if (q.solveViz) $('#vz').innerHTML = q.solveViz;
      $('#ans').querySelectorAll('button,input').forEach(x => (x.disabled = true));
      await say('בואי נראה יחד איך פותרים.');
      for (const step of q.solve || []) {
        if (!alive()) return;
        const li = document.createElement('div');
        li.className = 'sstep'; li.innerHTML = fmt(step);
        sol.appendChild(li);
        await say(step);
      }
      if (!alive()) return;
      $('#next').classList.remove('hidden');
    }

    function record(firstOk) {
      st.total++; if (firstOk) st.correct++;
      st.hist.push(!!firstOk); if (st.hist.length > 5) st.hist.shift();
      sess.n++; if (firstOk) sess.firstOk++;
      sess.streakBad = firstOk ? 0 : sess.streakBad + 1;
      save();
    }
    function levelCheck() {
      const good = st.hist.filter(Boolean).length;
      if (st.hist.length >= 5 && good >= 4) {
        st.hist = [];
        if (st.level < 3) { st.level++; save(); return `עלית לרמה ${st.level}! 🎉`; }
        if (!st.mastered) { st.mastered = true; save(); return `את אלופת ${u.title}! 👑`; }
      }
      return null;
    }
    function nextQ() {
      if (sess.n >= ROUND) return summary();
      ask();
    }
    function summary() {
      newScreen();
      const k = sess.firstOk;
      const msg = k >= 7 ? 'סיבוב מדהים!' : k >= 5 ? 'סיבוב טוב מאוד!' : k >= 3 ? 'יופי של התמדה!' : 'כל הכבוד שלא ויתרת!';
      main().innerHTML = `
        <div class="card center">
          <div class="bigic">🏆</div>
          <h1>${msg}</h1>
          <p class="lead">פתרת נכון בניסיון הראשון ${k} מתוך ${ROUND}</p>
          <p class="lead">${st.mastered ? '👑 את שולטת בנושא!' : 'רמה ' + st.level + ' מתוך 3'}</p>
          <div class="row"><button class="big primary" id="again">עוד סיבוב ✏️</button><button class="big" id="hm">🏠 לנושאים</button></div>
        </div>`;
      if (k >= 5) confetti();
      say(`${msg} פתרת נכון ${k} מתוך ${ROUND}.`);
      $('#again').onclick = () => practice(u);
      $('#hm').onclick = home;
    }
    ask();
  }

  /* ---------- מסך הורים ---------- */
  function parents() {
    newScreen();
    const rows = UNITS.map(u => {
      const st = U(u.id);
      const pct = st.total ? Math.round((100 * st.correct) / st.total) + '%' : '—';
      return `<tr><td>${u.icon} ${u.title}</td><td>${st.mastered ? '👑 3' : st.level}</td><td>${st.total}</td><td>${pct}</td><td>${st.lessonSeen ? '✓' : ''}</td></tr>`;
    }).join('');
    const errs = Object.entries(S.errors).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([k, v]) => `<li><b>${v}×</b> ${ERR_LABELS[k] || k}</li>`).join('') || '<li>עדיין אין טעויות לרשום</li>';
    const vstat = !V.supported ? 'הדפדפן לא תומך בהקראה' : V.hasHebrew ? `קול עברי פעיל: ${V.voice.name}` : 'לא נמצא קול עברי במכשיר';
    main().innerHTML = `
      <div class="card">
        <div class="hdr"><button class="link" id="bk">→ חזרה</button><b>מסך הורים</b><span></span></div>
        <h3>התקדמות לפי נושא</h3>
        <table class="tbl"><thead><tr><th>נושא</th><th>רמה</th><th>תרגילים</th><th>נכון בניסיון ראשון</th><th>שיעור</th></tr></thead><tbody>${rows}</tbody></table>
        <h3>הטעויות שחוזרות</h3>
        <ul class="errs">${errs}</ul>
        <p class="note">כל טעות כאן היא "אסימון שעוד לא נפל". אפשר לפתוח את השיעור של אותו נושא ולשמוע אותו יחד איתה.</p>
        <h3>קול</h3>
        <p>${vstat}</p>
        <div class="row left">
          <label class="tog"><input type="checkbox" id="von" ${S.voiceOn ? 'checked' : ''}> הקראה פעילה</label>
          <label>מהירות <input type="range" id="rate" min="0.7" max="1.2" step="0.05" value="${S.rate}"></label>
          <button id="test">🔊 בדיקה</button>
        </div>
        <p class="note" id="vnote"></p>
        <h3>שם</h3>
        <div class="row left"><input id="nm" value="${window.HE.esc(S.name)}" maxlength="20"><button id="svnm">שמירה</button></div>
        <h3>איפוס</h3>
        <button id="reset" class="danger">איפוס כל ההתקדמות</button>
      </div>`;
    voiceNote($('#vnote'));
    $('#bk').onclick = home;
    $('#von').onchange = e => { S.voiceOn = V.on = e.target.checked; save(); };
    $('#rate').oninput = e => { S.rate = V.rate = +e.target.value; save(); };
    $('#test').onclick = () => say('שלושה רבעים ועוד רבע זה ארבעה רבעים, כלומר שלם אחד.');
    $('#svnm').onclick = () => { S.name = $('#nm').value.trim(); save(); topbar(); setBubble('השם נשמר!'); };
    let armed = false;
    $('#reset').onclick = e => {
      if (!armed) { armed = true; e.target.textContent = 'בטוח? לחיצה נוספת תמחק הכל'; return; }
      const name = S.name; S = fresh(); S.name = name; save(); topbar(); home();
    };
    setBubble('מסך הורים');
  }

  /* ---------- הפעלה ---------- */
  load();
  V.init();
  V.on = S.voiceOn; V.rate = S.rate;
  $('#homebtn').onclick = home;
  topbar();
  let seen = false; try { seen = !!localStorage.getItem(KEY); } catch (e) {}
  if (!S.name && !seen) welcome(); else home();
})();
