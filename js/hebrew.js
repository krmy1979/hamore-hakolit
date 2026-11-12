/* עברית: הקראת שברים ומספרים, ועיצוב תצוגה של שברים */
(function (G) {
  const masc = ['אפס','אחד','שניים','שלושה','ארבעה','חמישה','שישה','שבעה','שמונה','תשעה','עשרה','אחד עשר','שנים עשר'];
  const fem  = ['אפס','אחת','שתיים','שלוש','ארבע','חמש','שש','שבע','שמונה','תשע','עשר','אחת עשרה','שתים עשרה'];
  const DEN = {2:['חצי','חצאים','m'],3:['שליש','שלישים','m'],4:['רבע','רבעים','m'],5:['חמישית','חמישיות','f'],
    6:['שישית','שישיות','f'],7:['שביעית','שביעיות','f'],8:['שמינית','שמיניות','f'],9:['תשיעית','תשיעיות','f'],
    10:['עשירית','עשיריות','f'],12:['חלק שנים עשר','חלקי שנים עשר','m']};

  function frac(n, d) {
    n = +n; d = +d;
    if (d === 1) return String(n);
    const e = DEN[d];
    if (!e) return n + ' חלקי ' + d;
    if (n === 0) return 'אפס';
    if (n === 1) return e[0];
    let w;
    if (n === 2) w = e[2] === 'm' ? 'שני' : 'שתי';
    else w = (e[2] === 'm' ? masc : fem)[n] || String(n);
    return w + ' ' + e[1];
  }
  function wholes(w) {
    w = +w;
    if (w === 1) return 'שלם אחד';
    if (w === 2) return 'שני שלמים';
    return (masc[w] || w) + ' שלמים';
  }
  function mixed(w, n, d) { return +n === 0 ? String(w) : wholes(w) + ' ו' + frac(n, d); }

  /* טקסט תצוגה ← טקסט להקראה */
  function speakable(s) {
    return String(s)
      .replace(/\[\[|\]\]/g, ' ')
      .replace(/(\d+)\s*ו[־-]\s*(\d+)\/(\d+)/g, (m, w, n, d) => ' ' + mixed(w, n, d) + ' ')
      .replace(/(\d+)\/(\d+)/g, (m, n, d) => ' ' + frac(n, d) + ' ')
      .replace(/×/g, ' כפול ').replace(/÷/g, ' חלקי ')
      .replace(/\s\+\s/g, ' ועוד ').replace(/\s[−-]\s/g, ' פחות ')
      .replace(/=\s*⬜/g, ' שווה כמה? ').replace(/=\s*\?/g, ' שווה כמה? ')
      .replace(/\s=\s/g, ' שווה ').replace(/\s>\s/g, ' גדול מ ').replace(/\s<\s/g, ' קטן מ ')
      .replace(/⬜/g, ' משהו ').replace(/₪/g, ' שקלים ').replace(/%/g, ' אחוז ')
      .replace(/[🍕⭐🎉👑🦉✨💪🔥]/gu, '')
      .replace(/\s+/g, ' ').trim();
  }

  function esc(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
  function fracHTML(n, d) { return `<span class="fr"><span class="fn">${n}</span><span class="fd">${d}</span></span>`; }
  function fmtMath(s) {
    return esc(s)
      .replace(/(\d+)\s*ו[־-]\s*(\d+)\/(\d+)/g, (m, w, n, d) => `<span class="mx">${w}</span>${fracHTML(n, d)}`)
      .replace(/(\d+)\/(\d+)/g, (m, n, d) => fracHTML(n, d))
      .replace(/⬜/g, '<span class="blank">?</span>');
  }
  /* [[...]] = ביטוי מתמטי משמאל לימין */
  function fmt(s) {
    return String(s).split(/(\[\[.*?\]\])/).map(p =>
      p.startsWith('[[') ? `<span class="math" dir="ltr">${fmtMath(p.slice(2, -2))}</span>` : fmtMath(p)
    ).join('');
  }

  G.HE = { frac, mixed, wholes, speakable, fmt, esc, masc, fem };
})(typeof window !== 'undefined' ? window : globalThis);
