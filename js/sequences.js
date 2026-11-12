/* סדרות – 4 יחידות */
(function (G) {
  const { rnd, pick } = G.U;
  const D = G.D;
  const lab = (a, b) => (b - a >= 0 ? '+' + (b - a) : '−' + (a - b));
  const labs = seq => seq.slice(0, -1).map((v, i) => (v == null || seq[i + 1] == null ? null : lab(v, seq[i + 1])));

  /* שאלת "מה חסר" גנרית על סדרה */
  function seqQ(seq, blank, opts = {}) {
    const items = seq.map((v, i) => (i === blank ? null : v));
    const answer = seq[blank];
    const shownLabels = opts.labels || labs(seq);
    const hintLabels = shownLabels.map((l, i) => (i === blank || i + 1 === blank ? null : l));
    const said = items.map(v => (v === null ? 'משהו' : v)).join(', ');
    return {
      type: 'num', answer, text: blank === seq.length - 1 ? 'מה המספר הבא בסדרה?' : 'איזה מספר חסר בסדרה?',
      say: (blank === seq.length - 1 ? 'מה המספר הבא בסדרה? ' : 'איזה מספר חסר בסדרה? ') + said,
      viz: D.seq(items, null), hintViz: D.seq(items, hintLabels), solveViz: D.seq(seq, shownLabels),
      hint: opts.hint || 'בואי נמצא את הקפיצה: מכמה לכמה עוברים כל פעם?',
      diagnose: opts.diagnose, solve: opts.solve || [`החוק: ${opts.rule}.`, `המספר החסר הוא ${answer}.`],
    };
  }

  const units = [];

  /* ---------- 1. קפיצה קבועה ---------- */
  units.push({
    id: 's1', topic: 'sequences', icon: '🦘', title: 'הקפיצה הקבועה', sub: 'מוסיפים ומורידים',
    lesson: [
      { say: 'בסדרה, כל מספר נוצר מהמספר שלפניו לפי חוק. אנחנו הבלשים שמגלים את החוק.', viz: () => D.seq([3, 7, 11, 15, null], null) },
      { say: 'בודקים את הקפיצה: מ־3 ל־7 קפצנו 4.', viz: () => D.seq([3, 7, 11, 15, null], ['+4', null, null, null]) },
      { say: 'גם מ־7 ל־11, וגם מ־11 ל־15, קפיצה של 4. החוק: מוסיפים 4.', viz: () => D.seq([3, 7, 11, 15, null], ['+4', '+4', '+4', null]) },
      { say: 'אז המספר הבא: 15 ועוד 4, זה 19.', viz: () => D.seq([3, 7, 11, 15, 19], ['+4', '+4', '+4', '+4']) },
      { say: 'זה עובד גם בירידה: 50, 45, 40, 35. החוק: מורידים 5.', viz: () => D.seq([50, 45, 40, 35, null], ['−5', '−5', '−5', null]) },
      { say: 'ואם חסר מספר באמצע? מוצאים את הקפיצה משני מספרים צמודים, וממלאים את החור.', viz: () => D.seq([5, null, 13, 17], [null, null, '+4']) },
    ],
    gen(level) {
      if (level === 1) {
        const a = rnd(1, 20), d = rnd(2, 5), seq = Array.from({ length: 5 }, (_, i) => a + i * d);
        return seqQ(seq, 4, { rule: `מוסיפים ${d} כל פעם`,
          diagnose: v => (v === seq[3] - d ? { err: 'direction', msg: 'המספרים עולים – אז מוסיפים, לא מורידים.' } : Math.abs(v - seq[4]) <= 2 ? { err: 'wrongJump', msg: 'כמעט! בדקי שוב את גודל הקפיצה.' } : null) });
      }
      if (level === 2) {
        if (Math.random() < 0.5) {
          const d = rnd(3, 10), a = rnd(40, 100), seq = Array.from({ length: 5 }, (_, i) => a - i * d);
          return seqQ(seq, 4, { rule: `מורידים ${d} כל פעם`,
            diagnose: v => (v === seq[3] + d ? { err: 'direction', msg: 'המספרים יורדים! אז מורידים, לא מוסיפים.' } : null) });
        }
        const a = rnd(2, 40), d = rnd(3, 10), seq = Array.from({ length: 5 }, (_, i) => a + i * d), b = rnd(1, 3);
        return seqQ(seq, b, { rule: `מוסיפים ${d} כל פעם`, hint: 'מצאי שני מספרים צמודים בלי חור ביניהם, ובדקי מה הקפיצה.' });
      }
      const d = pick([12, 15, 25, 50, 11, 9]), a = rnd(100, 400), down = Math.random() < 0.4;
      const seq = Array.from({ length: 5 }, (_, i) => (down ? a + 200 - i * d : a + i * d));
      const blank = pick([0, 1, 2, 3, 4]);
      return seqQ(seq, blank, { rule: down ? `מורידים ${d} כל פעם` : `מוסיפים ${d} כל פעם`,
        hint: blank === 0 ? 'חסר המספר הראשון! הולכים אחורה – עושים את הקפיצה ההפוכה.' : undefined,
        diagnose: v => (blank === 0 && v - seq[0] === 2 * (seq[1] - seq[0]) ? { err: 'direction', msg: 'כדי ללכת אחורה עושים את הקפיצה ההפוכה.' } : null) });
    },
  });

  /* ---------- 2. כפל וחילוק ---------- */
  units.push({
    id: 's2', topic: 'sequences', icon: '🚀', title: 'גדלות מהר', sub: 'כפל וחילוק',
    lesson: [
      { say: 'יש סדרות שבהן המספרים גדלים מהר מאוד: 2, 4, 8, 16.', viz: () => D.seq([2, 4, 8, 16, null], null) },
      { say: 'הקפיצות לא שוות: פלוס 2, פלוס 4, פלוס 8. אז זה לא חיבור של אותו מספר.', viz: () => D.seq([2, 4, 8, 16, null], ['+2', '+4', '+8', null]) },
      { say: 'בודקים כפל: 2 כפול 2 זה 4. 4 כפול 2 זה 8. החוק: כופלים ב־2!', viz: () => D.seq([2, 4, 8, 16, null], ['×2', '×2', '×2', null]) },
      { say: 'המספר הבא: 16 כפול 2, זה 32.', viz: () => D.seq([2, 4, 8, 16, 32], ['×2', '×2', '×2', '×2']) },
      { say: 'ובכיוון ההפוך: 81, 27, 9. כל פעם מחלקים ב־3.', viz: () => D.seq([81, 27, 9, null], ['÷3', '÷3', null]) },
      { say: 'שאלת הבלש: אם המספרים גדלים או קטנים מהר מאוד, כנראה שזה כפל או חילוק.', viz: () => D.seq([81, 27, 9, 3], ['÷3', '÷3', '÷3']) },
    ],
    gen(level) {
      const mk = (start, m, len, div) => Array.from({ length: len }, (_, i) => (div ? start / Math.pow(m, i) : start * Math.pow(m, i)));
      const diag = seq => v => {
        const L = seq.length - 1, prev = seq[L - 1], prev2 = seq[L - 2];
        if (v === prev + (prev - prev2)) return { err: 'notMult', msg: 'שימי לב שהקפיצות לא שוות! המספרים משתנים מהר – אולי כופלים או מחלקים?' };
        return null;
      };
      let seq, m, div;
      if (level === 1) {
        if (Math.random() < 0.6) { m = 2; seq = mk(rnd(1, 5), 2, 5); } else { m = 10; seq = mk(rnd(1, 4), 10, 4); }
      } else if (level === 2) {
        if (Math.random() < 0.5) { m = 3; seq = mk(rnd(1, 3), 3, 5); } else { m = 2; div = true; seq = mk(pick([3, 5, 6, 7]) * 16, 2, 5, true); }
      } else {
        const t = pick(['div3', 'x5', 'mid']);
        if (t === 'div3') { m = 3; div = true; seq = mk(pick([1, 2, 4]) * 81, 3, 5, true); }
        else if (t === 'x5') { m = 5; seq = mk(rnd(1, 3), 5, 4); }
        else { m = pick([2, 3]); seq = mk(rnd(2, 4), m, 5); return seqQ(seq, 2, { rule: `כופלים ב־${m}`, labels: seq.slice(0, -1).map(() => '×' + m), hint: 'בדקי: האם מוסיפים אותו מספר? אם לא – אולי כופלים?' }); }
      }
      return seqQ(seq, seq.length - 1, { rule: div ? `מחלקים ב־${m}` : `כופלים ב־${m}`, labels: seq.slice(0, -1).map(() => (div ? '÷' : '×') + m),
        hint: 'הקפיצות לא שוות. נסי לבדוק: כמה פעמים המספר הקטן נכנס בגדול?', diagnose: diag(seq) });
    },
  });

  /* ---------- 3. קפיצות משתנות ---------- */
  units.push({
    id: 's3', topic: 'sequences', icon: '🔍', title: 'קפיצות משתנות', sub: 'חוק בתוך חוק',
    lesson: [
      { say: 'לפעמים הקפיצות עצמן משתנות: 1, 3, 6, 10, 15.', viz: () => D.seq([1, 3, 6, 10, 15, null], null) },
      { say: 'כותבים את הקפיצות: פלוס 2, פלוס 3, פלוס 4, פלוס 5. הקפיצה גדלה כל פעם ב־1!', viz: () => D.seq([1, 3, 6, 10, 15, null], ['+2', '+3', '+4', '+5', null]) },
      { say: 'אז הקפיצה הבאה היא פלוס 6. המספר הבא: 15 ועוד 6, זה 21.', viz: () => D.seq([1, 3, 6, 10, 15, 21], ['+2', '+3', '+4', '+5', '+6']) },
      { say: 'יש גם סדרות שמתחלפות: 2, 5, 4, 7, 6. פלוס 3, ואז מינוס 1, ושוב פלוס 3, מינוס 1.', viz: () => D.seq([2, 5, 4, 7, 6, null], ['+3', '−1', '+3', '−1', null]) },
      { say: 'וסדרה מפורסמת: כל מספר הוא הסכום של שני המספרים שלפניו. 1, 1, 2, 3, 5, 8.', viz: () => D.seq([1, 1, 2, 3, 5, 8, null], null) },
      { say: 'הטיפ: כשהקפיצות לא שוות, כותבים אותן בשורה, ומחפשים חוק בקפיצות עצמן.', viz: () => D.seq([1, 3, 6, 10, 15, null], ['+2', '+3', '+4', '+5', null]) },
    ],
    gen(level) {
      const sameJump = seq => v => {
        const L = seq.length - 1;
        return v === seq[L - 1] + (seq[L - 1] - seq[L - 2]) ? { err: 'sameJump', msg: 'הקפיצות משתנות! כתבי את הקפיצות בשורה, ובדקי מה קורה להן.' } : null;
      };
      if (level === 1) {
        const a = rnd(1, 10), j = rnd(1, 3); const seq = [a];
        for (let i = 0; i < 5; i++) seq.push(seq[i] + j + i);
        return seqQ(seq, 5, { rule: 'הקפיצה גדלה ב־1 כל פעם', diagnose: sameJump(seq), hint: 'הקפיצות לא שוות. כתבי אותן – מה קורה להן?' });
      }
      if (level === 2) {
        if (Math.random() < 0.5) {
          const a = rnd(2, 10), up = rnd(3, 6), dn = rnd(1, up - 1), seq = [a];
          for (let i = 0; i < 6; i++) seq.push(seq[i] + (i % 2 === 0 ? up : -dn));
          return seqQ(seq, 6, { rule: `פלוס ${up}, מינוס ${dn}, לסירוגין`, hint: 'יש כאן שתי קפיצות שמתחלפות. מה הן?',
            diagnose: v => (v === seq[5] - dn ? { err: 'sameJump', msg: 'החוק מתחלף: אחרי מינוס בא פלוס.' } : null) });
        }
        const a = rnd(1, 6), seq = [a];
        for (let i = 0; i < 5; i++) seq.push(seq[i] + 2 * (i + 1));
        return seqQ(seq, 5, { rule: 'הקפיצה גדלה ב־2 כל פעם', diagnose: sameJump(seq) });
      }
      const t = pick(['squares', 'fib', 'double']);
      if (t === 'squares') {
        const s0 = rnd(1, 3), seq = Array.from({ length: 5 }, (_, i) => (s0 + i) * (s0 + i));
        return seqQ(seq, 4, { rule: `כל מספר הוא מספר כפול עצמו: ${s0} כפול ${s0}, ${s0 + 1} כפול ${s0 + 1}`,
          hint: 'כתבי את הקפיצות – הן גדלות ב־2 כל פעם. או נסי: איזה מספר כפול עצמו נותן כל איבר?', diagnose: sameJump(seq) });
      }
      if (t === 'fib') {
        const seq = [rnd(1, 3), rnd(1, 4)];
        for (let i = 2; i < 7; i++) seq.push(seq[i - 1] + seq[i - 2]);
        return seqQ(seq, 6, { rule: 'כל מספר הוא הסכום של שני המספרים שלפניו', hint: 'נסי לחבר שני מספרים צמודים. מה יוצא?', diagnose: sameJump(seq) });
      }
      const a = rnd(1, 10), seq = [a];
      for (let i = 0; i < 5; i++) seq.push(seq[i] + Math.pow(2, i));
      return seqQ(seq, 5, { rule: 'הקפיצה מוכפלת ב־2 כל פעם: 1, 2, 4, 8, 16', hint: 'כתבי את הקפיצות. מה קורה להן?', diagnose: sameJump(seq) });
    },
  });

  /* ---------- 4. המקום ה־N ---------- */
  units.push({
    id: 's4', topic: 'sequences', icon: '🪜', title: 'המקום מספר N', sub: 'בלי לכתוב הכל',
    lesson: [
      { say: 'איך מוצאים את המספר במקום מספר 10, בלי לכתוב את כל הסדרה? למשל: 4, 8, 12.', viz: () => D.seq([4, 8, 12, null], ['+4', '+4', null]) },
      { say: 'מהמקום הראשון למקום מספר 10 עושים רק 9 קפיצות. כמו במדרגות: מהמדרגה הראשונה לשלישית עולים רק 2 מדרגות.', viz: () => D.stairs(5) },
      { say: 'אז: מתחילים מ־4, ועוד 9 קפיצות של 4. 9 כפול 4 זה 36. ועוד 4, זה 40.', viz: () => D.seq([4, 8, 12, null], ['+4', '+4', null]) },
      { say: 'האם 100 נמצא בסדרה 3, 7, 11? מורידים את ההתחלה: 100 פחות 3 זה 97. האם 97 מתחלק ב־4? לא. אז 100 לא בסדרה.', viz: () => D.seq([3, 7, 11, 15], ['+4', '+4', '+4']) },
      { say: 'ובעיית הגפרורים: ריבוע אחד צריך 4 גפרורים, וכל ריבוע נוסף מוסיף 3. זו בדיוק סדרה עם קפיצה של 3!', viz: () => D.matches(3) },
    ],
    gen(level) {
      const nth = (a, d, n) => a + (n - 1) * d;
      const off = (a, d, n) => v => (v === a + n * d ? { err: 'offByOne', msg: `ספרת קפיצה אחת יותר מדי. מהמקום הראשון למקום מספר ${n} יש רק ${n - 1} קפיצות.` } : null);
      if (level === 1 || (level === 2 && Math.random() < 0.6)) {
        const a = rnd(1, 10), d = level === 1 ? rnd(2, 5) : rnd(3, 10), n = level === 1 ? rnd(5, 8) : rnd(10, 20);
        const items = [a, a + d, a + 2 * d];
        return { type: 'num', answer: nth(a, d, n), text: `איזה מספר נמצא במקום מספר ${n} בסדרה?`,
          say: `בסדרה ${items.join(', ')}, איזה מספר נמצא במקום מספר ${n}?`,
          viz: D.seq([...items, null], null), hintViz: D.stairs(Math.min(n, 6)),
          hint: `כמה קפיצות יש מהמקום הראשון עד מקום מספר ${n}? ומה גודל כל קפיצה?`, diagnose: off(a, d, n),
          solve: [`הקפיצה היא ${d}. מהמקום הראשון למקום ${n} יש ${n - 1} קפיצות.`, `${n - 1} כפול ${d} זה ${(n - 1) * d}.`, `ועוד ${a} שבהתחלה: ${nth(a, d, n)}.`] };
      }
      if (level === 2) {
        const k = rnd(5, 10);
        return { type: 'num', answer: 4 + (k - 1) * 3, text: `ריבוע אחד מגפרורים = 4 גפרורים. 2 ריבועים צמודים = 7. 3 ריבועים = 10. כמה גפרורים צריך ל־${k} ריבועים צמודים?`,
          viz: D.matches(3), hint: 'כל ריבוע נוסף מוסיף 3 גפרורים. כמה ריבועים נוספים יש אחרי הראשון?', diagnose: off(4, 3, k),
          solve: [`הריבוע הראשון: 4 גפרורים.`, `עוד ${k - 1} ריבועים, כל אחד 3: ${k - 1} כפול 3 זה ${(k - 1) * 3}.`, `ביחד: ${4 + (k - 1) * 3}.`] };
      }
      const a = rnd(1, 9), d = rnd(3, 9);
      if (Math.random() < 0.5) {
        const inSeq = Math.random() < 0.5;
        let X = nth(a, d, rnd(8, 16)); if (!inSeq) X += rnd(1, d - 1);
        return { type: 'choice', answer: inSeq ? 'yes' : 'no', text: `האם המספר ${X} נמצא בסדרה?`,
          say: `האם המספר ${X} נמצא בסדרה ${a}, ${a + d}, ${a + 2 * d}?`,
          viz: D.seq([a, a + d, a + 2 * d, null], ['+' + d, '+' + d, null]),
          choices: [{ label: 'כן', value: 'yes', err: 'member' }, { label: 'לא', value: 'no', err: 'member' }],
          hints: { member: `מורידים את המספר הראשון: ${X} פחות ${a}. האם מה שנשאר מתחלק ב־${d}?` },
          solve: [`${X} פחות ${a} זה ${X - a}.`, (X - a) % d === 0 ? `${X - a} מתחלק ב־${d}, אז כן, ${X} בסדרה.` : `${X - a} לא מתחלק ב־${d}, אז ${X} לא בסדרה.`] };
      }
      const n = rnd(8, 15), X = nth(a, d, n);
      return { type: 'num', answer: n, text: `באיזה מקום בסדרה נמצא המספר ${X}?`, say: `בסדרה ${a}, ${a + d}, ${a + 2 * d}, באיזה מקום נמצא המספר ${X}?`,
        viz: D.seq([a, a + d, a + 2 * d, null], ['+' + d, '+' + d, null]),
        diagnose: v => (v === n - 1 ? { err: 'offByOne', msg: 'מצאת את מספר הקפיצות. אבל המקום הוא אחד יותר – כי מתחילים ממקום מספר 1.' } : null),
        hint: `כמה קפיצות של ${d} צריך כדי להגיע מ־${a} ל־${X}?`,
        solve: [`${X} פחות ${a} זה ${X - a}.`, `${X - a} חלקי ${d} זה ${n - 1} קפיצות.`, `אז המקום הוא ${n - 1} ועוד 1: מקום מספר ${n}.`] };
    },
  });

  G.SEQUENCES = units;
})(typeof window !== 'undefined' ? window : globalThis);
