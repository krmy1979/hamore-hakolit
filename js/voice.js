/* הקול: Web Speech API עם קול עברי מובנה (iPhone: כרמית, Windows: אסף/הילה) */
(function (G) {
  const V = { on: true, rate: 0.95, voice: null, hasHebrew: false, supported: false, token: 0, onSubtitle: null };

  V.init = function () {
    V.supported = typeof speechSynthesis !== 'undefined';
    if (!V.supported) return;
    const pick = () => {
      const vs = speechSynthesis.getVoices() || [];
      V.voice = vs.find(v => /^he/i.test(v.lang)) || vs.find(v => /hebrew|carmit|asaf|hila/i.test(v.name)) || null;
      V.hasHebrew = !!V.voice;
    };
    pick();
    try { speechSynthesis.addEventListener('voiceschanged', pick); } catch (e) { speechSynthesis.onvoiceschanged = pick; }
  };

  /* מחזיר Promise שמסתיים כשהמשפט נגמר (עם גיבוי של טיימר) */
  V.speak = function (text) {
    const my = ++V.token;
    if (V.onSubtitle) V.onSubtitle(text);
    return new Promise(res => {
      const est = 900 + String(text).length * 75;
      if (!V.on || !V.supported || !V.hasHebrew) { setTimeout(res, Math.min(est, 7000)); return; }
      try { speechSynthesis.cancel(); } catch (e) {}
      const u = new SpeechSynthesisUtterance(G.HE.speakable(text));
      u.lang = 'he-IL'; u.voice = V.voice; u.rate = V.rate;
      let done = false;
      const fin = () => { if (done) return; done = true; clearTimeout(t); res(my === V.token); };
      u.onend = fin; u.onerror = fin;
      const t = setTimeout(fin, 3000 + String(text).length * 140);
      speechSynthesis.speak(u);
    });
  };

  V.stop = function () { V.token++; try { speechSynthesis.cancel(); } catch (e) {} };

  G.Voice = V;
})(typeof window !== 'undefined' ? window : globalThis);
