/* כלים משותפים */
(function (G) {
  const U = {};
  U.rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  U.pick = arr => arr[Math.floor(Math.random() * arr.length)];
  U.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  U.gcd = (a, b) => (b ? U.gcd(b, a % b) : Math.abs(a));
  U.cmp = (a, b, c, d) => Math.sign(a * d - c * b); /* a/b מול c/d */
  U.sym = s => (s > 0 ? '>' : s < 0 ? '<' : '=');
  /* בחירה עם הגנה מכפילויות */
  U.choices = (correctLabel, wrongs) => {
    const out = [{ label: correctLabel, value: 'ok' }];
    for (const w of wrongs) if (w && !out.some(o => o.label === w.label)) out.push({ label: w.label, value: 'x' + out.length, err: w.err });
    return U.shuffle(out.slice(0, 4));
  };
  G.U = U;
})(typeof window !== 'undefined' ? window : globalThis);
