/* שברים – 5 יחידות. כל יחידה: שיעור (צעדים עם קול וציור) + מחולל תרגילים ב־3 רמות.
   סוגי שאלות: choice | num | frac (mode: frac/mixed/any) | paint */
(function (G) {
  const { rnd, pick, shuffle, gcd, cmp, sym, choices } = G.U;
  const D = G.D;
  const F = (n, d) => `${n}/${d}`;
  const MX = (w, n, d) => `${w} ו־${n}/${d}`;

  const units = [];

  /* ---------- 1. מה זה שבר ---------- */
  units.push({
    id: 'f1', topic: 'fractions', icon: '🍕', title: 'מה זה שבר?', sub: 'למעלה ולמטה',
    lesson: [
      { say: 'זאת פיצה שלמה.', viz: () => D.pizza(1, 0) },
      { say: 'עכשיו חותכים אותה ל־4 חלקים שווים.', viz: () => D.pizza(4, 0) },
      { say: 'המספר למטה בשבר אומר לכמה חלקים שווים חתכנו. הוא השם של הפרוסה. כאן זה רבע.', viz: () => D.pizzas([[4, 0, '?/4']]) },
      { say: 'לקחנו 3 פרוסות. המספר למעלה אומר כמה פרוסות לקחנו.', viz: () => D.pizzas([[4, 3, '3/4']]) },
      { say: 'אז זה [[3/4]]. שלושה רבעים. בדיוק כמו שלושה תפוחים.', viz: () => D.pizzas([[4, 3, '3/4']]) },
      { say: 'וזה חשוב: החלקים חייבים להיות שווים! אם הפרוסות בגדלים שונים, זה לא רבע.', viz: () => D.pizzas([[8, 2, '2/8'], [3, 1, '1/3']]) },
    ],
    gen(level) {
      if (level === 1) {
        const d = pick([2, 3, 4, 5, 6, 8]), k = rnd(1, d - 1);
        const wr = [{ label: F(d - k, d), err: 'uncolored' }];
        if (k > 1) wr.push({ label: F(d, k), err: 'swapped' });
        wr.push({ label: F(k, d + 2), err: 'den' }, { label: F(k, d + 1), err: 'den' }, { label: F(k + 1, d + 3), err: 'den' });
        return {
          type: 'choice', text: 'איזה חלק מהפיצה צבוע?', viz: D.pizza(d, k), answer: 'ok', choices: choices(F(k, d), wr),
          hints: {
            uncolored: 'שימי לב, ספרת את הפרוסות הלבנות. אנחנו סופרים את הפרוסות הצבועות.',
            swapped: 'הפוך! המספר למטה הוא כמה פרוסות יש בכל הפיצה. המספר למעלה הוא כמה צבועות.',
            den: 'בואי נספור את כל הפרוסות בפיצה. זה המספר למטה.',
          },
          solve: [`הפיצה חתוכה ל־${d} פרוסות שוות. אז המספר למטה הוא ${d}.`, `צבועות ${k} פרוסות. אז המספר למעלה הוא ${k}.`, `התשובה: [[${F(k, d)}]].`],
        };
      }
      if (level === 2) {
        const d = pick([3, 4, 5, 6, 8]), k = rnd(1, d - 1), shape = pick(['pizza', 'bar']);
        return {
          type: 'paint', shape, n: d, target: k,
          text: `צבעי [[${F(k, d)}]] ${shape === 'pizza' ? 'מהפיצה' : 'מהרצועה'}. לחצי על החלקים.`,
          check(c) {
            if (c === k) return { ok: true };
            if (c === d - k) return { ok: false, err: 'uncolored', msg: `צבעת ${c} חלקים. המספר למעלה הוא ${k} – כמה חלקים לצבוע.` };
            return { ok: false, err: 'count', msg: `המספר למעלה הוא ${k}, אז צריך לצבוע ${k} חלקים. כרגע צבועים ${c}.` };
          },
          solve: [`המספר למטה, ${d}, אומר שיש ${d} חלקים.`, `המספר למעלה, ${k}, אומר לצבוע ${k} חלקים.`],
        };
      }
      const v = pick(['left', 'balls', 'howmany']);
      if (v === 'left') {
        const d = pick([4, 5, 6, 8, 10]), k = rnd(1, d - 1);
        return {
          type: 'frac', mode: 'frac', text: `פיצה חתוכה ל־${d} פרוסות שוות. אכלו ${k} פרוסות. איזה חלק מהפיצה נשאר?`,
          viz: D.pizza(d, d - k), answer: { n: d - k, d },
          diagnose: a => (a.n === k && a.d === d ? { err: 'remaining', msg: 'זה החלק שאכלו! השאלה היא כמה נשאר.' } : null),
          solve: [`בכל הפיצה ${d} פרוסות.`, `אכלו ${k}, אז נשארו ${d} פחות ${k}, כלומר ${d - k}.`, `נשאר [[${F(d - k, d)}]].`],
        };
      }
      if (v === 'balls') {
        const t = rnd(4, 9), r = rnd(1, t - 1);
        return {
          type: 'frac', mode: 'frac', text: `בקופסה ${t} כדורים, ו־${r} מהם אדומים. איזה חלק מהכדורים אדום?`,
          viz: D.balls(t, r), answer: { n: r, d: t },
          diagnose: a => (a.n === t - r && a.d === t ? { err: 'uncolored', msg: 'ספרת את הכחולים. שאלו על האדומים.' } :
            a.n === r && a.d === t - r ? { err: 'den', msg: 'המספר למטה הוא כל הכדורים ביחד, לא רק הכחולים.' } : null),
          solve: [`כל הכדורים: ${t}. זה המספר למטה.`, `אדומים: ${r}. זה המספר למעלה.`, `התשובה: [[${F(r, t)}]].`],
        };
      }
      const d = pick([3, 4, 5, 6, 8, 10]);
      return {
        type: 'num', text: `כמה [[${F(1, d)}]] יש בפיצה שלמה אחת?`, viz: D.pizza(d, 0), answer: d,
        solve: [`פיצה שלמה חתוכה ל־${d} חלקים שווים.`, `אז יש בה ${d} חלקים כאלה: [[${F(d, d)} = 1]].`],
      };
    },
  });

  /* ---------- 2. השוואת שברים ---------- */
  units.push({
    id: 'f2', topic: 'fractions', icon: '⚖️', title: 'מי גדול יותר?', sub: 'השוואת שברים',
    lesson: [
      { say: 'כשהמספר למטה שווה, הפרוסות באותו גודל.', viz: () => D.pizzas([[5, 2, '2/5'], [5, 4, '4/5']]) },
      { say: 'אז מי שלקח יותר פרוסות, לקח יותר. [[4/5]] גדול מ־[[2/5]].', viz: () => D.pizzas([[5, 2, '2/5'], [5, 4, '4/5']]) },
      { say: 'ועכשיו טריק. כשהמספר למעלה שווה, למשל פרוסה אחת: פיצה של 2 חברים מול פיצה של 4 חברים.', viz: () => D.pizzas([[2, 1, '1/2'], [4, 1, '1/4']]) },
      { say: 'יותר חברים על אותה פיצה, פרוסה קטנה יותר! לכן חצי גדול מרבע, למרות ש־4 גדול מ־2.', viz: () => D.pizzas([[2, 1, '1/2'], [4, 1, '1/4']]) },
      { say: 'טריק החצי: חצי של 8 זה 4. אז [[3/8]] קצת פחות מחצי, ו־[[5/9]] קצת יותר מחצי.', viz: () => D.bars([[8, 3, '3/8'], [2, 1, '1/2'], [9, 5, '5/9']]) },
      { say: 'טריק החלק החסר: ל־[[7/8]] חסרה שמינית אחת עד שלם, ול־[[6/7]] חסרה שביעית אחת. שמינית קטנה יותר, אז ל־[[7/8]] חסר פחות. הוא הגדול.', viz: () => D.bars([[8, 7, '7/8'], [7, 6, '6/7']]) },
    ],
    gen(level) {
      let a, b, c, d, kind;
      if (level === 1) {
        kind = 'sameDen'; b = d = rnd(4, 10); a = rnd(1, b - 1); c = rnd(1, b - 1);
        if (Math.random() < 0.15) c = a;
      } else if (level === 2) {
        if (Math.random() < 0.7) {
          kind = 'sameNum'; a = c = rnd(1, 3);
          b = rnd(a + 1, 10); do { d = rnd(a + 1, 10); } while (d === b);
        } else {
          kind = 'equal'; const k = rnd(2, 4), base = pick([[1, 2], [1, 3], [2, 3], [1, 4], [3, 4]]);
          [a, b, c, d] = Math.random() < 0.5 ? [base[0] * k, base[1] * k, base[0], base[1]] : [base[0], base[1], base[0] * k, base[1] * k];
        }
      } else {
        if (Math.random() < 0.5) {
          kind = 'half';
          const b1 = pick([6, 8, 10, 12]), a1 = rnd(1, b1 / 2 - 1);
          const b2 = pick([5, 7, 9, 11]), a2 = rnd(Math.ceil(b2 / 2), b2 - 1);
          [a, b, c, d] = Math.random() < 0.5 ? [a1, b1, a2, b2] : [a2, b2, a1, b1];
        } else {
          kind = 'missing'; const n = rnd(4, 10); let m; do { m = rnd(4, 10); } while (m === n);
          [a, b, c, d] = [n - 1, n, m - 1, m];
        }
      }
      const s = cmp(a, b, c, d), right = sym(s);
      const hintText = {
        sameDen: 'המספר למטה שווה, אז הפרוסות באותו גודל. מי שיש לו יותר פרוסות – גדול יותר.',
        sameNum: 'המספר למעלה שווה. יותר חברים על אותה פיצה – פרוסה קטנה יותר! מספר גדול למטה זה פרוסה קטנה.',
        equal: 'שימי לב: אם חותכים כל פרוסה לעוד חתיכות, כמות הפיצה לא משתנה. בואי נסתכל על הציור.',
        half: 'נסי את טריק החצי: מי מהם פחות מחצי, ומי יותר מחצי?',
        missing: 'נסי את טריק החלק החסר: כמה חסר לכל אחד עד פיצה שלמה? למי שחסר פחות – הוא הגדול.',
      }[kind];
      const solve = {
        sameDen: [`המספר למטה זהה: ${b}. משווים רק את המספר למעלה: ${a} מול ${c}.`],
        sameNum: [`המספר למעלה זהה. המספר למטה גדול יותר אומר פרוסות קטנות יותר.`, `[[${F(1, Math.min(b, d))}]] גדול מ־[[${F(1, Math.max(b, d))}]].`],
        equal: [`שני השברים מראים בדיוק אותה כמות – רק חתוכה אחרת.`],
        half: [`בודקים כל שבר מול חצי. אחד קטן מחצי, והשני גדול מחצי.`],
        missing: [`ל־[[${F(a, b)}]] חסר [[${F(1, b)}]], ול־[[${F(c, d)}]] חסר [[${F(1, d)}]].`, `למי שחסרה פרוסה קטנה יותר – הוא הגדול.`],
      }[kind].concat([`התשובה: [[${F(a, b)} ${right} ${F(c, d)}]].`]);
      return {
        type: 'choice', kind, text: `מה הסימן הנכון? [[${F(a, b)} ⬜ ${F(c, d)}]]`, viz: null,
        say: `מה הסימן הנכון: גדול, קטן, או שווה? ${F(a, b)} מול ${F(c, d)}`,
        hintViz: D.bars([[b, a, F(a, b)], [d, c, F(c, d)]]),
        choices: ['>', '<', '='].map(x => ({ label: x, value: x, err: kind })), answer: right, compare: true,
        hints: { [kind]: hintText }, solve, solveViz: D.bars([[b, a, F(a, b)], [d, c, F(c, d)]]),
      };
    },
  });

  /* ---------- 3. יותר מפיצה אחת ---------- */
  units.push({
    id: 'f3', topic: 'fractions', icon: '🍕🍕', title: 'יותר מפיצה אחת', sub: 'מספרים מעורבים',
    lesson: [
      { say: 'יש לי 7 פרוסות של רבע. כמה פיצות זה?', viz: () => D.pizzas([[4, 4], [4, 3]]) },
      { say: 'כל 4 רבעים בונים פיצה שלמה אחת. בנינו פיצה אחת, ונשארו 3 רבעים.', viz: () => D.pizzas([[4, 4, '1'], [4, 3, '3/4']]) },
      { say: 'אז [[7/4]] זה [[1 ו־3/4]]. קוראים לזה מספר מעורב: שלמים ועוד שבר.', viz: () => D.pizzas([[4, 4, '1'], [4, 3, '3/4']]) },
      { say: 'הדרך המהירה: מחלקים. 7 חלקי 4 זה 1, ונשאר 3. האחד הוא השלמים, ה־3 הן הפרוסות.', viz: () => D.pizzas([[4, 4, '1'], [4, 3, '3/4']]) },
      { say: 'ולהפך: [[2 ו־3/5]]. כל פיצה שלמה היא 5 חמישיות. 2 פיצות זה 10 חמישיות, ועוד 3, זה [[13/5]].', viz: () => D.pizzas([[5, 5], [5, 5], [5, 3]]) },
      { say: 'כלל קל לזכור: כפול ועוד. 2 כפול 5, ועוד 3.', viz: () => D.pizzas([[5, 5], [5, 5], [5, 3]]) },
    ],
    gen(level) {
      if (level === 1) {
        const d = pick([2, 3, 4, 5, 6]), k = rnd(1, 4);
        return {
          type: 'num', text: `כמה פיצות שלמות יש ב־[[${F(k * d, d)}]]?`, answer: k,
          hint: `כל ${d} פרוסות של [[${F(1, d)}]] בונות פיצה שלמה אחת. כמה פעמים ${d} נכנס ב־${k * d}?`,
          hintViz: D.pizzas(Array.from({ length: k }, () => [d, d])),
          solve: [`${k * d} חלקי ${d} זה ${k}.`, `אז יש ${k} פיצות שלמות.`],
        };
      }
      const d = pick([2, 3, 4, 5, 6]), w = rnd(1, 3), r = rnd(1, d - 1), n = w * d + r;
      const pics = () => D.pizzas([...Array.from({ length: w }, () => [d, d]), [d, r]]);
      if (level === 2) {
        return {
          type: 'frac', mode: 'mixed', text: `כתבי כמספר מעורב: [[${F(n, d)}]]`, answer: { n, d },
          hint: `כמה פיצות שלמות אפשר לבנות מ־${n} פרוסות, כשכל פיצה צריכה ${d}? ומה נשאר?`, hintViz: pics(),
          diagnose: a => (a.w !== w ? { err: 'wholeConvert', msg: `כמה פעמים ${d} נכנס ב־${n}? זה מספר הפיצות השלמות.` } : null),
          solve: [`${n} חלקי ${d} זה ${w}, ונשאר ${r}.`, `אז [[${F(n, d)} = ${MX(w, r, d)}]].`], solveViz: pics(),
        };
      }
      if (Math.random() < 0.6) {
        return {
          type: 'frac', mode: 'frac', text: `כתבי כשבר: [[${MX(w, r, d)}]]`, answer: { n, d },
          hint: `כל פיצה שלמה היא ${d} פרוסות. כפול ועוד!`, hintViz: pics(),
          diagnose: a => (a.n === w + r ? { err: 'addWholes', msg: `חיברת את השלמים לפרוסות. כל שלם הוא ${d} פרוסות: ${w} כפול ${d}, ועוד ${r}.` } : null),
          solve: [`${w} פיצות כפול ${d} פרוסות זה ${w * d}.`, `ועוד ${r}: ${w * d} ועוד ${r} זה ${n}.`, `אז [[${MX(w, r, d)} = ${F(n, d)}]].`], solveViz: pics(),
        };
      }
      const delta = pick([-1, 0, 1]), n2 = n + delta, right = sym(Math.sign(n - n2));
      return {
        type: 'choice', compare: true, text: `מה הסימן הנכון? [[${MX(w, r, d)} ⬜ ${F(n2, d)}]]`,
        say: `מה הסימן הנכון: גדול, קטן, או שווה? ${MX(w, r, d)} מול ${F(n2, d)}`,
        choices: ['>', '<', '='].map(x => ({ label: x, value: x, err: 'wholeConvert' })), answer: right,
        hints: { wholeConvert: `נהפוך את המספר המעורב לשבר: ${w} כפול ${d}, ועוד ${r}. ואז משווים.` },
        solve: [`[[${MX(w, r, d)} = ${F(n, d)}]].`, `עכשיו משווים [[${F(n, d)}]] מול [[${F(n2, d)}]]: [[${F(n, d)} ${right} ${F(n2, d)}]].`],
      };
    },
  });

  /* ---------- 4. חיבור וחיסור ---------- */
  const related = [[2, 4], [2, 6], [2, 8], [3, 6], [4, 8], [5, 10], [2, 10]];
  units.push({
    id: 'f4', topic: 'fractions', icon: '➕', title: 'חיבור וחיסור', sub: 'רבע ועוד רבע',
    lesson: [
      { say: 'רבע ועוד רבע זה כמה? שני רבעים! בדיוק כמו תפוח ועוד תפוח, שני תפוחים.', viz: () => D.pizzas([[4, 1, '1/4'], [4, 1, '1/4'], [4, 2, '2/4']]) },
      { say: 'המספר למטה הוא השם של הפרוסה. לא מחברים אותו! מחברים רק את המספרים למעלה. [[1/5 + 2/5 = 3/5]].', viz: () => D.bars([[5, 1, '1/5'], [5, 2, '2/5'], [5, 3, '3/5']]) },
      { say: 'אם נחבר גם למטה, יצא [[3/10]], ואלה פרוסות קטנות יותר. אבל כשמוסיפים פיצה, הפרוסות לא נהיות קטנות!', viz: () => D.bars([[5, 3, '3/5'], [10, 3, '3/10']]) },
      { say: 'ואם השמות שונים, כמו [[1/3 + 1/6]]? מתרגמים לאותה שפה: חותכים כל שליש לשתי פרוסות, ושליש הופך לשתי שישיות.', viz: () => D.bars([[3, 1, '1/3'], [6, 2, '2/6']]) },
      { say: 'עכשיו קל: [[2/6 + 1/6 = 3/6]]. וזה בדיוק חצי.', viz: () => D.bars([[6, 3, '3/6'], [2, 1, '1/2']]) },
      { say: 'חיסור משלם: [[3 − 1/4]]. פורטים פיצה אחת לארבעה רבעים, ולוקחים רבע אחד. נשארו [[2 ו־3/4]].', viz: () => D.pizzas([[4, 4], [4, 4], [4, 3]]) },
      { say: 'וכפל זה חיבור חוזר: [[3 × 2/5]] זה שתי חמישיות, שלוש פעמים. כלומר שש חמישיות.', viz: () => D.bars([[5, 2, '2/5'], [5, 2, '2/5'], [5, 2, '2/5']]) },
    ],
    gen(level) {
      const addDen = (a, b, d, op) => ans => {
        if (op === '+' && ans.d === 2 * d && ans.n === a + b) return { err: 'addDen', msg: 'חיברת גם את המספרים למטה! המספר למטה הוא רק השם של הפרוסה. רבע ועוד רבע זה שני רבעים, לא שמיניות. מחברים רק למעלה.' };
        if (op === '−' && ans.d === 0) return { err: 'addDen', msg: 'חיסרת גם את המספרים למטה. המספר למטה הוא רק השם של הפרוסה – הוא נשאר אותו דבר.' };
        return null;
      };
      if (level === 1) {
        const d = rnd(4, 10);
        if (Math.random() < 0.6) {
          const a = rnd(1, d - 2), b = rnd(1, d - 1 - a);
          return { type: 'frac', mode: 'frac', text: `[[${F(a, d)} + ${F(b, d)} = ⬜]]`, answer: { n: a + b, d }, diagnose: addDen(a, b, d, '+'),
            hint: 'מחברים רק את המספרים למעלה. המספר למטה נשאר.', hintViz: D.bars([[d, a, F(a, d)], [d, b, F(b, d)]]),
            solve: [`המספר למטה נשאר ${d}.`, `למעלה: ${a} ועוד ${b} זה ${a + b}.`, `[[${F(a, d)} + ${F(b, d)} = ${F(a + b, d)}]].`] };
        }
        const a = rnd(2, d - 1), b = rnd(1, a - 1);
        return { type: 'frac', mode: 'frac', text: `[[${F(a, d)} − ${F(b, d)} = ⬜]]`, answer: { n: a - b, d }, diagnose: addDen(a, b, d, '−'),
          hint: 'מחסרים רק את המספרים למעלה. המספר למטה נשאר.', hintViz: D.bar(d, a),
          solve: [`המספר למטה נשאר ${d}.`, `למעלה: ${a} פחות ${b} זה ${a - b}.`, `[[${F(a, d)} − ${F(b, d)} = ${F(a - b, d)}]].`] };
      }
      if (level === 2) {
        const v = pick(['over', 'related', 'related', 'oneMinus', 'times']);
        if (v === 'over') {
          const d = rnd(3, 8), a = rnd(Math.ceil(d / 2), d - 1), b = rnd(d - a + 1, d - 1);
          const s = a + b;
          return { type: 'frac', mode: 'any', text: `[[${F(a, d)} + ${F(b, d)} = ⬜]]`, answer: { n: s, d }, diagnose: addDen(a, b, d, '+'),
            hint: 'מחברים למעלה. אם יוצא יותר פרוסות מפיצה שלמה, אפשר לכתוב כשבר או כמספר מעורב.',
            solve: [`${a} ועוד ${b} זה ${s}: [[${F(s, d)}]].`, `וזה גם [[${MX(Math.floor(s / d), s % d || 0, d)}]].`].filter(x => !/ו־0\//.test(x)) };
        }
        if (v === 'related') {
          const [d1, d2] = pick(related), m = d2 / d1, a = rnd(1, d1 - 1), b = rnd(1, d2 - 1);
          const plus = Math.random() < 0.6 || a * m <= b;
          const n = plus ? a * m + b : a * m - b;
          const op = plus ? '+' : '−';
          return { type: 'frac', mode: 'any', text: `[[${F(a, d1)} ${op} ${F(b, d2)} = ⬜]]`, answer: { n, d: d2 },
            diagnose: ans => (ans.d === d1 + d2 || (ans.d === d2 && ans.n === (plus ? a + b : a - b)) ? { err: 'related', msg: `השמות שונים! קודם מתרגמים: כל [[${F(1, d1)}]] שווה ${m} חלקים של [[${F(1, d2)}]].` } : null),
            hint: `מתרגמים לאותה שפה: [[${F(a, d1)} = ${F(a * m, d2)}]].`, hintViz: D.bars([[d1, a, F(a, d1)], [d2, a * m, F(a * m, d2)]]),
            solve: [`מתרגמים: [[${F(a, d1)} = ${F(a * m, d2)}]].`, `[[${F(a * m, d2)} ${op} ${F(b, d2)} = ${F(n, d2)}]].`] };
        }
        if (v === 'oneMinus') {
          const d = rnd(3, 10), a = rnd(1, d - 1);
          return { type: 'frac', mode: 'any', text: `[[1 − ${F(a, d)} = ⬜]]`, answer: { n: d - a, d },
            hint: `פיצה שלמה אחת היא [[${F(d, d)}]]. עכשיו מורידים ${a} פרוסות.`, hintViz: D.pizza(d, d - a),
            solve: [`[[1 = ${F(d, d)}]].`, `[[${F(d, d)} − ${F(a, d)} = ${F(d - a, d)}]].`] };
        }
        const k = rnd(2, 4), d = rnd(3, 8), a = rnd(1, d - 1);
        return { type: 'frac', mode: 'any', text: `[[${k} × ${F(a, d)} = ⬜]]`, answer: { n: k * a, d },
          diagnose: ans => (ans.d === k * d ? { err: 'timesFrac', msg: `כופלים רק את המספר למעלה! ${k} פעמים ${a} פרוסות. גודל הפרוסה לא משתנה.` } : null),
          hint: `כפל זה חיבור חוזר: [[${F(a, d)}]], ${k} פעמים.`, hintViz: D.bars(Array.from({ length: k }, () => [d, a, F(a, d)])),
          solve: [`${k} פעמים ${a} פרוסות זה ${k * a} פרוסות.`, `[[${k} × ${F(a, d)} = ${F(k * a, d)}]].`] };
      }
      const v = pick(['mixAdd', 'wholeMinus', 'borrow', 'missing']);
      if (v === 'mixAdd') {
        const d = rnd(3, 8), w1 = rnd(1, 3), w2 = rnd(1, 2), r1 = rnd(1, d - 1), r2 = rnd(1, d - 1);
        const tot = (w1 + w2) * d + r1 + r2;
        return { type: 'frac', mode: 'any', text: `[[${MX(w1, r1, d)} + ${MX(w2, r2, d)} = ⬜]]`, answer: { n: tot, d },
          hint: 'מחברים שלמים עם שלמים, ופרוסות עם פרוסות. אם יש יותר פרוסות מפיצה – בונים עוד פיצה.',
          solve: [`שלמים: ${w1} ועוד ${w2} זה ${w1 + w2}.`, `פרוסות: ${r1} ועוד ${r2} זה ${r1 + r2}.`,
            (r1 + r2 >= d ? `${r1 + r2} פרוסות זה פיצה שלמה ועוד ${r1 + r2 - d}.` : 'אין מספיק פרוסות לפיצה נוספת.'),
            (tot % d ? `התשובה: [[${MX(Math.floor(tot / d), tot % d, d)}]].` : `התשובה: ${tot / d}.`)] };
      }
      if (v === 'wholeMinus') {
        const W = rnd(2, 4), d = rnd(3, 8), a = rnd(1, d - 1), n = W * d - a;
        return { type: 'frac', mode: 'any', text: `[[${W} − ${F(a, d)} = ⬜]]`, answer: { n, d },
          diagnose: ans => (ans.w === W && ans.n === d - a ? { err: 'borrow', msg: `כשפורטים פיצה אחת לפרוסות, נשארות פחות פיצות שלמות: ${W - 1}, לא ${W}.` } : null),
          hint: `פורטים פיצה אחת ל־${d} פרוסות. כמה פיצות שלמות נשארו? וכמה פרוסות?`, hintViz: D.pizzas([...Array.from({ length: W - 1 }, () => [d, d]), [d, d - a]]),
          solve: [`פורטים פיצה אחת: [[${W} = ${MX(W - 1, d, d)}]].`, `מורידים ${a} פרוסות: נשארו [[${MX(W - 1, d - a, d)}]].`] };
      }
      if (v === 'borrow') {
        const d = rnd(4, 8), w = rnd(2, 3), r1 = rnd(1, d - 2), r2 = rnd(r1 + 1, d - 1), n = w * d + r1 - r2;
        return { type: 'frac', mode: 'any', text: `[[${MX(w, r1, d)} − ${F(r2, d)} = ⬜]]`, answer: { n, d },
          hint: `אין מספיק פרוסות! פורטים פיצה שלמה אחת לעוד ${d} פרוסות.`,
          solve: [`${r1} פרוסות זה פחות מ־${r2}, אז פורטים פיצה: [[${MX(w, r1, d)} = ${MX(w - 1, r1 + d, d)}]].`, `[[${MX(w - 1, r1 + d, d)} − ${F(r2, d)} = ${MX(w - 1, r1 + d - r2, d)}]].`] };
      }
      const d = rnd(3, 10), a = rnd(1, d - 1);
      return { type: 'frac', mode: 'frac', text: `[[${F(a, d)} + ⬜ = 1]]`, answer: { n: d - a, d },
        hint: `שלם אחד הוא [[${F(d, d)}]]. כמה פרוסות חסרות?`, hintViz: D.pizza(d, a),
        solve: [`[[1 = ${F(d, d)}]].`, `חסרות ${d} פחות ${a}, כלומר ${d - a} פרוסות: [[${F(d - a, d)}]].`] };
    },
  });

  /* ---------- 5. שבר של כמות ---------- */
  units.push({
    id: 'f5', topic: 'fractions', icon: '📦', title: 'שבר של כמות', sub: 'למטה מחלק, למעלה לוקח',
    lesson: [
      { say: 'כמה זה [[3/4]] מ־20? המספר למטה אומר לכמה קופסאות לחלק.', viz: () => D.boxes(20, 4, 0) },
      { say: 'מחלקים 20 ל־4 קופסאות. בכל קופסה 5.', viz: () => D.boxes(20, 4, 0) },
      { say: 'המספר למעלה אומר כמה קופסאות לוקחים: 3 קופסאות. 3 כפול 5 זה 15.', viz: () => D.boxes(20, 4, 3) },
      { say: 'לזכור: למטה מחלק, למעלה לוקח.', viz: () => D.boxes(20, 4, 3) },
      { say: 'והסוג ההפוך: [[1/4]] מהכיתה הם 6 ילדים. אז בקופסה אחת יש 6. יש 4 קופסאות, ו־4 כפול 6 זה 24 ילדים.', viz: () => D.boxes(24, 4, 1) },
    ],
    gen(level) {
      if (level === 1) {
        const d = pick([2, 3, 4, 5, 6, 10]), n = d * rnd(2, 9);
        return { type: 'num', text: `כמה זה [[${F(1, d)}]] מ־${n}?`, answer: n / d,
          hint: `מחלקים ${n} ל־${d} קופסאות שוות. כמה בכל קופסה?`, hintViz: D.boxes(n, d, 0),
          solve: [`${n} חלקי ${d} זה ${n / d}.`] };
      }
      if (level === 2) {
        const d = pick([3, 4, 5, 6, 8, 10]), k = rnd(2, d - 1), per = rnd(2, 8), n = d * per;
        const word = Math.random() < 0.4;
        return { type: 'num',
          text: word ? `לדני היו ${n} ₪. הוא הוציא [[${F(k, d)}]] מהם על משחק. כמה שקלים הוציא?` : `כמה זה [[${F(k, d)}]] מ־${n}?`,
          answer: k * per,
          diagnose: v => (v === per ? { err: 'forgotTake', msg: `זה רק קופסה אחת! המספר למעלה אומר לקחת ${k} קופסאות.` } :
            v === n - k * per ? { err: 'remaining', msg: 'זה מה שנשאר. שאלו כמה לקחו.' } : null),
          hint: 'למטה מחלק, למעלה לוקח.', hintViz: D.boxes(n, d, k),
          solve: [`מחלקים ${n} ל־${d} קופסאות: בכל אחת ${per}.`, `לוקחים ${k} קופסאות: ${k} כפול ${per} זה ${k * per}.`], solveViz: D.boxes(n, d, k) };
      }
      const v = pick(['whole', 'wholeK', 'rest']);
      if (v === 'whole') {
        const d = pick([2, 3, 4, 5, 6]), x = rnd(3, 9);
        return { type: 'num', text: `[[${F(1, d)}]] מהילדים בכיתה הם ${x} ילדים. כמה ילדים בכל הכיתה?`, answer: d * x,
          diagnose: v => (v * d === x || v === Math.round(x / d) ? { err: 'inverse', msg: `השאלה הפוכה! אנחנו כבר יודעים כמה בקופסה אחת: ${x}. כמה בכל ${d} הקופסאות?` } : null),
          hint: `בקופסה אחת יש ${x}. כמה קופסאות יש בסך הכל?`, hintViz: D.boxes(d * x, d, 1),
          solve: [`[[${F(1, d)}]] זה קופסה אחת מתוך ${d}, ובה ${x}.`, `${d} כפול ${x} זה ${d * x}.`] };
      }
      if (v === 'wholeK') {
        const d = pick([3, 4, 5]), k = rnd(2, d - 1), per = rnd(2, 6), x = k * per;
        return { type: 'num', text: `[[${F(k, d)}]] ממספר הם ${x}. מה המספר?`, answer: d * per,
          hint: `${k} קופסאות הן ${x}. אז כמה בקופסה אחת? ואז – כמה ב־${d} קופסאות?`, hintViz: D.boxes(d * per, d, k),
          solve: [`${k} קופסאות הן ${x}, אז בקופסה אחת ${x} חלקי ${k}, כלומר ${per}.`, `${d} קופסאות: ${d} כפול ${per} זה ${d * per}.`] };
      }
      const d = pick([3, 4, 5]), k = rnd(1, d - 1), per = rnd(3, 7), n = d * per;
      return { type: 'num', text: `בכיתה ${n} ילדים, ו־[[${F(k, d)}]] מהם בנות. כמה בנים בכיתה?`, answer: n - k * per,
        diagnose: v => (v === k * per ? { err: 'remaining', msg: 'זה מספר הבנות! שאלו על הבנים.' } : null),
        hint: 'קודם מוצאים כמה בנות, ואז כמה נשאר.', hintViz: D.boxes(n, d, k),
        solve: [`בנות: [[${F(k, d)}]] מ־${n} זה ${k * per}.`, `בנים: ${n} פחות ${k * per} זה ${n - k * per}.`] };
    },
  });

  G.FRACTIONS = units;
})(typeof window !== 'undefined' ? window : globalThis);
