/* ציורים: פיצות, רצועות, קופסאות, סדרות עם קפיצות, גפרורים. מחזירים מחרוזת SVG. */
(function (G) {
  const D = {};
  const COL = { stroke: '#7a4a2a', crust: '#f4b860' };

  D.svg = (w, h, inner, cls = '') =>
    `<svg viewBox="0 0 ${w} ${h}" class="viz ${cls}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">${inner}</svg>`;

  const isOn = (colored, i) => (typeof colored === 'number' ? i < colored : colored.has(i));

  D.pizzaG = (cx, cy, r, n, colored) => {
    let s = `<circle cx="${cx}" cy="${cy}" r="${r + 7}" fill="${COL.crust}"/>`;
    if (n === 1) {
      return s + `<circle class="slice ${isOn(colored, 0) ? 'on' : ''}" data-i="0" cx="${cx}" cy="${cy}" r="${r}" stroke="${COL.stroke}" stroke-width="2"/>`;
    }
    for (let i = 0; i < n; i++) {
      const a0 = -Math.PI / 2 + (i * 2 * Math.PI) / n, a1 = a0 + (2 * Math.PI) / n;
      const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
      const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
      s += `<path class="slice ${isOn(colored, i) ? 'on' : ''}" data-i="${i}" d="M${cx},${cy} L${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)} Z" stroke="${COL.stroke}" stroke-width="2"/>`;
    }
    return s;
  };
  D.pizza = (n, colored) => D.svg(220, 220, D.pizzaG(110, 110, 92, n, colored));

  /* כמה פיצות בשורה: [[n, colored, label], ...] */
  D.pizzas = list => {
    const w = list.length * 190 + 10;
    let s = '';
    list.forEach((p, i) => {
      const cx = 100 + i * 190;
      s += D.pizzaG(cx, 95, 78, p[0], p[1]);
      if (p[2]) s += `<text x="${cx}" y="210" class="lbl" direction="ltr">${p[2]}</text>`;
    });
    return D.svg(w, 225, s);
  };

  /* רצועה אחת: מתמלאת מימין לשמאל */
  D.barG = (x, y, w, h, n, colored) => {
    let s = '';
    const cw = w / n;
    for (let i = 0; i < n; i++) {
      s += `<rect class="slice ${isOn(colored, i) ? 'on' : ''}" data-i="${i}" x="${(x + w - (i + 1) * cw).toFixed(1)}" y="${y}" width="${cw.toFixed(1)}" height="${h}" stroke="${COL.stroke}" stroke-width="2" rx="4"/>`;
    }
    return s;
  };
  D.bar = (n, colored) => D.svg(420, 90, D.barG(10, 15, 400, 60, n, colored));

  /* כמה רצועות זו מתחת לזו, עם תווית משמאל: [[n, colored, label], ...] */
  D.bars = list => {
    let s = '';
    list.forEach((b, i) => {
      const y = 12 + i * 72;
      s += D.barG(110, y, 380, 52, b[0], b[1]);
      if (b[2]) s += `<text x="52" y="${y + 36}" class="lbl" direction="ltr">${b[2]}</text>`;
    });
    return D.svg(500, list.length * 72 + 14, s);
  };

  /* חלוקה לקופסאות: total פריטים, d קופסאות, take קופסאות מסומנות */
  D.boxes = (total, d, take = 0) => {
    const per = total / d;
    const bw = Math.max(58, Math.min(110, 640 / d - 12));
    const W = d * (bw + 12) + 12, H = bw + 50;
    let s = '';
    for (let i = 0; i < d; i++) {
      const x = 12 + (d - 1 - i) * (bw + 12);
      s += `<rect x="${x}" y="10" width="${bw}" height="${bw}" rx="12" class="box ${i < take ? 'on' : ''}"/>`;
      if (per <= 25 && Number.isInteger(per)) {
        const cols = Math.ceil(Math.sqrt(per));
        const cell = (bw - 14) / cols;
        for (let k = 0; k < per; k++) {
          const cx = x + 7 + cell * (k % cols) + cell / 2, cy = 17 + cell * Math.floor(k / cols) + cell / 2;
          s += `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${Math.min(8, cell / 2.6).toFixed(1)}" class="dot"/>`;
        }
      }
      s += `<text x="${x + bw / 2}" y="${bw + 40}" class="lbl small">${Number.isInteger(per) ? per : '?'}</text>`;
    }
    return D.svg(W, H, s);
  };

  /* סדרה: items (null = חסר), labels = תוויות קפיצה בין איברים (null = מוסתר) */
  D.seq = (items, labels) => {
    const n = items.length;
    const gap = Math.min(118, 660 / n);
    const W = gap * n + 20;
    const r = Math.min(44, gap / 2 - 3);
    let s = `<defs><marker id="ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M1,1 L9,5 L1,9" fill="none" stroke="#e76f51" stroke-width="2"/></marker></defs>`;
    items.forEach((v, i) => {
      const x = 10 + gap * i + gap / 2;
      s += `<circle cx="${x}" cy="118" r="${r}" class="tile ${v === null ? 'blank' : ''}"/>`;
      const fs = String(v).length > 3 ? 24 : 32;
      s += `<text x="${x}" y="129" class="num" style="font-size:${fs}px">${v === null ? '?' : v}</text>`;
      if (i < n - 1 && labels && labels[i] != null) {
        const x2 = x + gap;
        s += `<path d="M${x + 10},${118 - r - 4} Q${x + gap / 2},22 ${x2 - 10},${118 - r - 4}" class="arc" marker-end="url(#ah)"/>`;
        s += `<text x="${x + gap / 2}" y="42" class="jl" direction="ltr">${labels[i]}</text>`;
      }
    });
    return D.svg(W, 170, s);
  };

  /* כדורים: total, red = כמה אדומים */
  D.balls = (total, red) => {
    let s = '';
    const W = total * 56 + 20;
    for (let i = 0; i < total; i++) {
      s += `<circle cx="${W - 38 - i * 56}" cy="40" r="22" class="${i < red ? 'ball-red' : 'ball-blue'}"/>`;
    }
    return D.svg(W, 80, s);
  };

  /* שורת ריבועים מגפרורים */
  D.matches = k => {
    const a = 60, W = k * a + 40;
    let s = '';
    const line = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="match"/><circle cx="${x2}" cy="${y2}" r="4" class="match-head"/>`;
    for (let i = 0; i < k; i++) {
      const x = 20 + i * a;
      s += line(x, 20, x + a, 20) + line(x, 20 + a, x + a, 20 + a);
      if (i === 0) s += line(x, 20 + a, x, 20);
      s += line(x + a, 20 + a, x + a, 20);
    }
    return D.svg(W, a + 40, s);
  };

  /* מדרגות: מהמדרגה הראשונה עד n */
  D.stairs = n => {
    const st = 52, W = n * st + 40, H = n * 34 + 40;
    let s = '';
    for (let i = 0; i < n; i++) {
      const x = 20 + i * st, y = H - 20 - (i + 1) * 34;
      s += `<rect x="${x}" y="${y}" width="${st}" height="${(i + 1) * 34}" class="step"/>`;
      s += `<text x="${x + st / 2}" y="${y + 24}" class="lbl small">${i + 1}</text>`;
    }
    return D.svg(W, H, s);
  };

  G.D = D;
})(typeof window !== 'undefined' ? window : globalThis);
