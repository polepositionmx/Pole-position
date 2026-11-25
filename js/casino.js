
/* ===== Casino: ruleta, blackjack y póker Texas Hold'em (dinero ficticio del juego) ===== */
(function () {
  const CHIPS = [1, 5, 10, 25, 50, 100], MIN_AGE = 0;
  /* Dificultad del casino (se elige arriba; por defecto sigue la dificultad de tu carrera). Todo se regula desde esta tabla:
     rou: partage = si sale 0 las apuestas simples recuperan la mitad; pleno = pago del número (x a 1).
     bj: pay = pago del blackjack; h17 = el crupier pide con 17 blando; cut = fracción del zapato que queda al barajar; dd911 = solo se dobla con 9, 10 u 11.
     pk: noise = errores de los rivales; agg = agresividad extra; bluff = frecuencia de faroles; fold/raise = cuánto sueltan o suben de más. */
  const DIFS = [
    { n: "Realista", maxb: 50, rival: "expertos", rou: { partage: false, pleno: 35 }, bj: { pay: 1.2, h17: true, cut: 0.25, dd911: true }, pk: { noise: 0.12, agg: 0.15, bluff: 1.8, fold: -0.04, raise: -0.06 } },
  ];
  const dIdx = () => 0;
  const DF = () => DIFS[dIdx()];
  const maxb = () => DF().maxb;
  const q = (s) => document.querySelector(s);
  const rnd = (n) => Math.floor(Math.random() * n);
  const money = (n) => "€" + n + " M";
  const shuf = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  let SLEEP = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- lógica pura: ruleta ---------- */
  const ORD = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
  const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);
  const colOf = (n) => (n === 0 ? "g" : REDS.has(n) ? "r" : "b");
  const MULT = { red: 1, black: 1, even: 1, odd: 1, low: 1, high: 1, d1: 2, d2: 2, d3: 2, c1: 2, c2: 2, c3: 2 };
  function rWin(k, n) {
    if (k[0] === "n") return +k.slice(1) === n;
    if (n === 0) return false;
    switch (k) {
      case "red": return REDS.has(n); case "black": return !REDS.has(n);
      case "even": return n % 2 === 0; case "odd": return n % 2 === 1;
      case "low": return n <= 18; case "high": return n >= 19;
      case "d1": return n <= 12; case "d2": return n > 12 && n <= 24; case "d3": return n > 24;
      case "c1": return n % 3 === 1; case "c2": return n % 3 === 2; case "c3": return n % 3 === 0;
    }
    return false;
  }
  const EVEN = ["red", "black", "even", "odd", "low", "high"];
  const rPay = (B, n, d) => {
    d = d || DF().rou; let w = 0, half = 0;
    for (const k in B) { if (rWin(k, n)) w += B[k] * ((k[0] === "n" ? d.pleno : MULT[k]) + 1); else if (n === 0 && d.partage && EVEN.includes(k)) half += B[k]; }
    return w + Math.floor(half / 2);
  };

  /* ---------- lógica pura: cartas, blackjack y póker ---------- */
  const SU = "♠♥♦♣", RN = (r) => (r <= 10 ? String(r) : "JQKA"[r - 11]);
  const deck = () => { const d = []; for (let s = 0; s < 4; s++) for (let r = 2; r <= 14; r++) d.push({ r, s }); return d; };
  const cardH = (c, cls) => `<div class="cd${c.s === 1 || c.s === 2 ? " rd" : ""} ${cls || ""}"><b>${RN(c.r)}</b><i>${SU[c.s]}</i></div>`;
  const backH = (cls) => `<div class="cd bk ${cls || ""}"></div>`;
  function bjv(h) { let t = 0, a = 0; h.forEach((c) => { if (c.r === 14) { a++; t += 11; } else t += c.r >= 11 ? 10 : c.r; }); while (t > 21 && a) { t -= 10; a--; } return t; }
  const HN = ["Carta alta", "Pareja", "Doble pareja", "Trío", "Escalera", "Color", "Full", "Póker", "Escalera de color"];
  function rank5(c) {
    const rs = c.map((x) => x.r).sort((a, b) => b - a), fl = c.every((x) => x.s === c[0].s), cnt = {};
    rs.forEach((r) => (cnt[r] = (cnt[r] || 0) + 1));
    const g = Object.entries(cnt).map(([r, n]) => [n, +r]).sort((a, b) => b[0] - a[0] || b[1] - a[1]);
    let st = 0;
    if (g.length === 5) { if (rs[0] - rs[4] === 4) st = rs[0]; else if (rs.join() === "14,5,4,3,2") st = 5; }
    if (st && fl) return [8, st];
    if (g[0][0] === 4) return [7, g[0][1], g[1][1]];
    if (g[0][0] === 3 && g[1][0] === 2) return [6, g[0][1], g[1][1]];
    if (fl) return [5, ...rs];
    if (st) return [4, st];
    if (g[0][0] === 3) return [3, g[0][1], g[1][1], g[2][1]];
    if (g[0][0] === 2 && g[1][0] === 2) return [2, g[0][1], g[1][1], g[2][1]];
    if (g[0][0] === 2) return [1, g[0][1], g[1][1], g[2][1], g[3][1]];
    return [0, ...rs];
  }
  const cmp = (a, b) => { for (let i = 0; i < Math.max(a.length, b.length); i++) { const d = (a[i] || 0) - (b[i] || 0); if (d) return d; } return 0; };
  function best(cs) {
    let b = null; const n = cs.length;
    const rec = (st, pk) => {
      if (pk.length === 5) { const r = rank5(pk.map((i) => cs[i])); if (!b || cmp(r, b) > 0) b = r; return; }
      for (let i = st; i < n; i++) { pk.push(i); rec(i + 1, pk); pk.pop(); }
    };
    rec(0, []); return b;
  }
  function sidePots(P) {
    const lv = [...new Set(P.map((p) => p.tot).filter((x) => x > 0))].sort((a, b) => a - b), out = []; let prev = 0;
    for (const L of lv) {
      let amt = 0; P.forEach((p) => (amt += Math.max(0, Math.min(p.tot, L) - prev)));
      const el = P.map((_, i) => i).filter((i) => !P[i].folded && P[i].tot >= L);
      if (amt && el.length) out.push({ amt, el }); else if (amt && out.length) out[out.length - 1].amt += amt;
      prev = L;
    }
    return out;
  }
  function pStrength(p, board) {
    const [a, b] = p.hole.slice().sort((x, y) => y.r - x.r);
    if (!board.length) {
      if (a.r === b.r) return 0.5 + a.r / 28;
      return Math.min(0.95, 0.15 + (a.r / 14) * 0.35 + (b.r / 14) * 0.2 + (a.s === b.s ? 0.06 : 0) + (a.r - b.r <= 1 ? 0.05 : 0));
    }
    const r = best([...p.hole, ...board]), top = Math.max(...board.map((c) => c.r)), mine = (x) => p.hole.some((c) => c.r === x);
    let s = [0.15 + a.r / 140, mine(r[1]) ? (r[1] >= top ? 0.55 : 0.42) : 0.25, 0.68, 0.78, 0.85, 0.88, 0.94, 0.98, 1][r[0]];
    if (board.length < 5) { const fs = {}; [...p.hole, ...board].forEach((c) => (fs[c.s] = (fs[c.s] || 0) + 1)); if (r[0] < 5 && Object.values(fs).some((n) => n >= 4) && p.hole.some((c) => fs[c.s] >= 4)) s += 0.14; }
    return Math.min(s, 1);
  }

  /* ---------- estado del casino ---------- */
  let SESSION = 0, BUSY = false, TAB = "rou";
  const CAS = () => S.cas || (S.cas = { net: 0 });
  const save = () => { try { typeof svWrite === "function" && svWrite(0); } catch (e) {} };
  function pay(d) {
    if (!d) return;
    S.cash = Math.max(0, Math.round(S.cash + d)); SESSION += d; CAS().net = (CAS().net || 0) + d; bal(); save();
  }
  function bal() {
    const e = q("#casbal"); if (!e) return;
    e.innerHTML = `Fondos <b>${money(Math.floor(S.cash))}</b> <small class="${SESSION >= 0 ? "up" : "dn"}">${SESSION >= 0 ? "+" : ""}${SESSION} hoy</small>`;
    const n = q("#casnet"); if (n) { const v = CAS().net || 0; n.textContent = (v > 0 ? "+" : "") + v + " M"; n.className = v >= 0 ? "up" : "dn"; }
  }
  const chipBar = (sel, fn) => `<div class="chps">${CHIPS.filter((c) => c <= maxb()).map((c) => `<button class="chp c${c}${sel === c ? " on" : ""}" onclick="CAS.${fn}(${c})">${c}</button>`).join("")}</div>`;
  const msg = (t, c) => { const e = q("#casm"); if (e) { e.className = "cmsg " + (c || ""); e.innerHTML = t; } };

  /* ---------- ruleta ---------- */
  let RB = {}, RST = [], RLAST = null, RH = [], rot = 0, brot = 0, rchip = 5;
  const rTot = () => Object.values(RB).reduce((a, b) => a + b, 0);
  function wheelSvg() {
    const seg = 360 / 37, x = (r, a) => (100 + r * Math.cos(a)).toFixed(2), y = (r, a) => (100 + r * Math.sin(a)).toFixed(2); let p = "";
    ORD.forEach((n, i) => {
      const a0 = ((i * seg - 90) * Math.PI) / 180, a1 = (((i + 1) * seg - 90) * Math.PI) / 180;
      p += `<path d="M${x(92, a0)} ${y(92, a0)}A92 92 0 0 1 ${x(92, a1)} ${y(92, a1)}L${x(62, a1)} ${y(62, a1)}A62 62 0 0 0 ${x(62, a0)} ${y(62, a0)}Z" fill="${{ g: "#12803d", r: "#c4161c", b: "#15151a" }[colOf(n)]}" stroke="#d4af37" stroke-width=".6"/><text x="100" y="${100 - 74}" transform="rotate(${(i + 0.5) * seg} 100 100)" text-anchor="middle" font-size="8" font-weight="700" fill="#fff">${n}</text>`;
    });
    return `<svg viewBox="0 0 200 200" class="rsv"><circle cx="100" cy="100" r="98" fill="#4a2a10" stroke="#d4af37" stroke-width="2"/><g id="rw" style="transform-origin:100px 100px;transform:rotate(${rot}deg)">${p}<circle cx="100" cy="100" r="58" fill="#1a1a1f" stroke="#d4af37"/><circle cx="100" cy="100" r="20" fill="#d4af37"/><path d="M100 82V118M82 100H118" stroke="#7a5a10" stroke-width="3"/></g><g id="rb" style="transform-origin:100px 100px;transform:rotate(${brot}deg)"><circle id="rbl" cx="100" cy="13" r="4.5" fill="#fff" stroke="#999" style="transition:transform .6s ease-in"/></g><path d="M94 0L106 0L100 10Z" fill="#f5c542"/></svg>`;
  }
  function rBoard() {
    const el = q("#rbd"); if (!el) return;
    const bt = (k, l, c) => `<button class="rc ${c || ""}" onclick="CAS.rbet('${k}')">${l}${RB[k] ? `<em>${RB[k]}</em>` : ""}</button>`;
    const row = (r) => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((i) => { const n = i * 3 + r; return bt("n" + n, n, colOf(n)); }).join("");
    el.innerHTML = `<div class="rn">${bt("n0", 0, "g rz")}<div class="rg">${row(3)}${row(2)}${row(1)}</div></div>
<div class="ro3">${bt("d1", "1ª docena")}${bt("d2", "2ª docena")}${bt("d3", "3ª docena")}</div>
<div class="ro3">${bt("c1", "Columna 1 (2:1)")}${bt("c2", "Columna 2 (2:1)")}${bt("c3", "Columna 3 (2:1)")}</div>
<div class="ro6">${bt("low", "1–18")}${bt("even", "Par")}${bt("red", "Rojo", "r")}${bt("black", "Negro", "b")}${bt("odd", "Impar")}${bt("high", "19–36")}</div>
<div class="rtot">Apuesta total: <b>${money(rTot())}</b></div>`;
    const c = q("#rctl"); if (c) c.querySelector(".go").disabled = BUSY || !rTot();
  }
  function rouView() {
    return `<div class="rwrap">${wheelSvg()}<div id="rres" class="rres">${RH.length ? "" : "Hagan sus apuestas"}</div></div><div class="rhist">${RH.map((n) => `<span class="${colOf(n)}">${n}</span>`).join("")}</div>${chipBar(rchip, "rchip")}<div id="rbd"></div><div id="rctl" class="crow"><button class="go" onclick="CAS.spin()">Girar la ruleta</button><button class="cbtn" onclick="CAS.rundo()">Deshacer</button><button class="cbtn" onclick="CAS.rclr()">Limpiar</button><button class="cbtn" onclick="CAS.rrep()">Repetir</button></div><div id="casm" class="cmsg"></div>`;
  }
  async function spin() {
    if (BUSY) return; const t = rTot();
    if (!t) return msg("Poné al menos una ficha en la mesa.", "dn");
    if (t > S.cash) return msg("No te alcanzan los fondos para esa apuesta.", "dn");
    BUSY = true; lock(); RLAST = { ...RB }; pay(-t);
    const n = rnd(37), i = ORD.indexOf(n), seg = 360 / 37, B = { ...RB };
    RB = {}; RST = []; rBoard(); q("#rres").innerHTML = "…la bola está girando…"; q("#rbl").style.transform = "translateY(0)";
    rot = Math.ceil(rot / 360) * 360 + 360 * 5 - (i + 0.5) * seg; brot = Math.floor(brot / 360) * 360 - 360 * 7;
    const w = q("#rw"), b = q("#rb");
    w.style.transition = "transform 6s cubic-bezier(.15,.55,.15,1)"; b.style.transition = "transform 6s cubic-bezier(.25,.45,.2,1)";
    w.style.transform = `rotate(${rot}deg)`; b.style.transform = `rotate(${brot}deg)`;
    setTimeout(() => { const l = q("#rbl"); if (l) l.style.transform = "translateY(11px)"; }, 4700);
    await SLEEP(6300);
    const won = rPay(B, n), tot = Object.values(B).reduce((a, c) => a + c, 0);
    RH.unshift(n); RH = RH.slice(0, 12);
    if (won) pay(won);
    const name = n === 0 ? "verde" : colOf(n) === "r" ? "rojo" : "negro";
    if (q("#rres")) q("#rres").innerHTML = `<span class="big ${colOf(n)}">${n}</span> ${name}<br>${won > tot ? `<b class="up">Ganaste ${money(won - tot)}</b>` : won ? `<b>Recuperaste ${money(won)}</b>` : `<b class="dn">Perdiste ${money(tot)}</b>`}`;
    BUSY = false; lock(); const h = q(".rhist"); if (h) h.innerHTML = RH.map((x) => `<span class="${colOf(x)}">${x}</span>`).join(""); rBoard();
  }

  /* ---------- blackjack ---------- */
  let BJ = { shoe: [], bet: 5, st: "bet", hist: [], touched: false, last: 0 };
  const bjShuffle = () => { BJ.shoe = []; for (let k = 0; k < 6; k++) BJ.shoe.push(...deck()); shuf(BJ.shoe); };
  const bjDraw = () => { if (BJ.shoe.length < 12) bjShuffle(); return BJ.shoe.pop(); };
  const bjSoft = (h) => { let t = 0, a = 0; h.forEach((c) => { if (c.r === 14) { a++; t += 11; } else t += c.r >= 11 ? 10 : c.r; }); while (t > 21 && a) { t -= 10; a--; } return a > 0; };
  const bjHard = (h) => h.reduce((t, c) => t + (c.r === 14 ? 1 : c.r >= 11 ? 10 : c.r), 0);
  function bjView() {
    return `<div class="bjz"><div class="bjl">Crupier <b id="bjdv"></b></div><div class="hand" id="bjd"></div></div><div class="bjz"><div class="bjl">Tu mano <b id="bjpv"></b></div><div class="hand" id="bjp"></div></div><div id="bjc"></div><div id="casm" class="cmsg"></div>`;
  }
  function bjBetUi() {
    const m = maxb(), cap = Math.min(m, Math.floor(S.cash)); if (BJ.bet > cap) BJ.bet = Math.max(0, cap);
    q("#bjc").innerHTML = `${chipBar(0, "bjchip")}<div class="rtot">Apuesta: <b>${money(BJ.bet)}</b> <small>(máx. ${money(m)})</small></div><div class="crow"><button class="go" ${BJ.bet < 1 ? "disabled" : ""} onclick="CAS.bjdeal()">Repartir</button></div><div class="crow"><button class="cbtn" onclick="CAS.bjundo()">Deshacer</button><button class="cbtn" onclick="CAS.bjclr()">Limpiar</button><button class="cbtn" ${BJ.last ? "" : "disabled"} onclick="CAS.bjrep()">Repetir (${BJ.last || 0})</button><button class="cbtn" onclick="CAS.bjmin()">Mínima</button></div>`;
  }
  const bjAdd = async (z, c, down) => { q(z).insertAdjacentHTML("beforeend", down ? backH("new") : cardH(c, "new")); await SLEEP(380); };
  function bjVals(hideD) {
    q("#bjpv").textContent = bjv(BJ.p);
    q("#bjdv").textContent = hideD ? "" : bjv(BJ.d);
  }
  async function bjDeal() {
    if (BUSY) return; if (BJ.bet > S.cash) { BJ.bet = Math.max(0, Math.floor(S.cash)); }
    if (S.cash < 1) return msg("No tenés fondos para apostar.", "dn");
    if (BJ.bet < 1) return msg("Poné al menos una ficha.", "dn");
    if (BJ.shoe.length < Math.floor(312 * DF().bj.cut)) { bjShuffle(); msg("Se baraja el zapato."); }
    BUSY = true; lock(); pay(-BJ.bet); BJ.cur = BJ.bet; BJ.last = BJ.bet;
    q("#bjd").innerHTML = ""; q("#bjp").innerHTML = ""; msg(""); q("#bjc").innerHTML = "";
    BJ.p = [bjDraw()]; BJ.d = [bjDraw()]; BJ.dh = bjDraw();
    await bjAdd("#bjp", BJ.p[0]); await bjAdd("#bjd", BJ.d[0]); BJ.p.push(bjDraw()); await bjAdd("#bjp", BJ.p[1]); await bjAdd("#bjd", null, true);
    bjVals(true);
    const pb = bjv(BJ.p) === 21, db = bjv([...BJ.d, BJ.dh]) === 21;
    if (pb || db) return bjEnd(true);
    bjActs();
  }
  function bjActs() {
    const f = BJ.p.length === 2 && S.cash >= BJ.cur && (!DF().bj.dd911 || (bjv(BJ.p) === bjHard(BJ.p) && bjHard(BJ.p) >= 9 && bjHard(BJ.p) <= 11));
    q("#bjc").innerHTML = `<div class="crow"><button class="go" onclick="CAS.bjhit()">Pedir carta</button><button class="cbtn" onclick="CAS.bjstand()">Plantarse</button>${f ? `<button class="cbtn" onclick="CAS.bjdouble()">Doblar</button>` : ""}</div>`;
  }
  async function bjHit(dbl) {
    q("#bjc").innerHTML = ""; const c = bjDraw(); BJ.p.push(c); await bjAdd("#bjp", c); bjVals(true);
    const v = bjv(BJ.p);
    if (v > 21) return bjEnd(false); if (v === 21 || dbl) return bjDealer(); bjActs();
  }
  async function bjDouble() { pay(-BJ.cur); BJ.cur *= 2; msg(`Apuesta doblada: ${money(BJ.cur)}`); await bjHit(true); }
  async function bjDealer() {
    q("#bjc").innerHTML = ""; q("#bjd").lastElementChild.outerHTML = cardH(BJ.dh, "flip"); BJ.d.push(BJ.dh); bjVals(false); await SLEEP(600);
    while (bjv(BJ.d) < 17 || (DF().bj.h17 && bjv(BJ.d) === 17 && bjSoft(BJ.d))) { const c = bjDraw(); BJ.d.push(c); await bjAdd("#bjd", c); bjVals(false); }
    bjEnd(false);
  }
  async function bjEnd(initial) {
    const pv = bjv(BJ.p), dc = BJ.d.length === 1 ? [...BJ.d, BJ.dh] : BJ.d, dv = bjv(dc);
    if (BJ.d.length === 1) { q("#bjd").lastElementChild.outerHTML = cardH(BJ.dh, "flip"); BJ.d.push(BJ.dh); bjVals(false); await SLEEP(500); }
    const pbj = initial && pv === 21 && BJ.p.length === 2, dbj = initial && dv === 21;
    let ret = 0, t, c = "";
    if (pbj && dbj) { ret = BJ.cur; t = "Blackjack doble: empate."; }
    else if (pbj) { ret = BJ.cur + Math.floor(BJ.cur * DF().bj.pay); t = `¡Blackjack! Ganaste ${money(ret - BJ.cur)}`; c = "up"; }
    else if (dbj) { t = "El crupier tiene blackjack."; c = "dn"; }
    else if (pv > 21) { t = `Te pasaste de 21. Perdiste ${money(BJ.cur)}`; c = "dn"; }
    else if (dv > 21) { ret = BJ.cur * 2; t = `El crupier se pasa. Ganaste ${money(BJ.cur)}`; c = "up"; }
    else if (pv > dv) { ret = BJ.cur * 2; t = `${pv} contra ${dv}. Ganaste ${money(BJ.cur)}`; c = "up"; }
    else if (pv === dv) { ret = BJ.cur; t = `Empate a ${pv}. Recuperás tu apuesta.`; }
    else { t = `${pv} contra ${dv}. Perdiste ${money(BJ.cur)}`; c = "dn"; }
    pay(ret); msg(t, c); BUSY = false; lock(); bjBetUi();
  }

  /* ---------- póker Texas Hold'em ---------- */
  const NAMES = ["Marco", "Lucía", "Don Ramiro", "Valentina", "El Ruso", "Camila", "Tito", "La Condesa"];
  const TBL = [{ buy: 20, sb: 1, bb: 2 }, { buy: 50, sb: 2, bb: 4 }, { buy: 100, sb: 5, bb: 10 }];
  let G = null;
  const pkNew = (t) => {
    const nm = shuf(NAMES.slice());
    return { t, dead: false, dealer: 2, board: [], pot: 0, cur: 0, minRaise: t.bb, msg: "", showAll: false, fresh: null, wait: null,
      P: [{ n: "Vos", human: 1 }, { n: nm[0], agg: 0.3 + Math.random() * 0.4 }, { n: nm[1], agg: 0.2 + Math.random() * 0.6 }].map((p) => ({ hole: [], bet: 0, tot: 0, folded: false, allin: false, acted: false, last: "", stack: t.buy, ...p })) };
  };
  const pkSleep = (ms) => SLEEP(ms).then(() => { if (G && G.dead) throw "dead"; });
  function pkCommit(p, a) { a = Math.max(0, Math.min(a, p.stack)); p.stack -= a; p.bet += a; p.tot += a; G.pot += a; if (!p.stack) p.allin = true; }
  function pkApply(p, a) {
    const call = Math.min(G.cur - p.bet, p.stack);
    if (a.t === "fold") { p.folded = true; p.last = "Se retira"; return; }
    if (a.t === "call") { pkCommit(p, call); p.acted = true; p.last = call ? (p.allin ? "All-in " + call : "Iguala " + call) : "Pasa"; return; }
    let to = Math.min(a.to, p.bet + p.stack); to = Math.max(to, Math.min(G.cur + G.minRaise, p.bet + p.stack));
    if (to <= G.cur) { pkCommit(p, call); p.acted = true; p.last = "Iguala " + call; return; }
    const inc = to - G.cur; pkCommit(p, to - p.bet); if (inc >= G.minRaise) G.minRaise = inc; G.cur = to;
    G.P.forEach((o) => { if (o !== p) o.acted = false; }); p.acted = true; p.last = (p.allin ? "All-in " : "Sube a ") + to;
  }
  function pkBot(p) {
    const D = DF().pk, call = Math.min(G.cur - p.bet, p.stack), pot = G.pot, s = pStrength(p, G.board) + (Math.random() - 0.5) * D.noise, ag = Math.max(0, Math.min(1, p.agg + D.agg)), odds = call / (pot + call || 1);
    const rz = () => ({ t: "raise", to: G.cur + Math.max(G.minRaise, Math.round(pot * (0.45 + Math.random() * 0.6))) });
    if (!call) return s > 0.62 - ag * 0.15 + D.raise || (Math.random() < (0.06 + ag * 0.1) * D.bluff && s > 0.3) ? rz() : { t: "call" };
    if (call >= p.stack) return s > 0.5 + D.fold ? { t: "call" } : Math.random() < 0.1 * (D.bluff ? 1 : 0.4) ? { t: "call" } : { t: "fold" };
    if (s < odds * 0.95 - 0.04 + D.fold && Math.random() > 0.06) return { t: "fold" };
    if (s > 0.74 - ag * 0.1 + D.raise && Math.random() < 0.45 + ag * 0.3) return rz();
    return { t: "call" };
  }
  function pkHuman(p) {
    return new Promise((res, rej) => { G.wait = { res, rej }; G.turn = p; pkRender(); });
  }
  async function pkRound(first) {
    const P = G.P; let i = first, guard = 0; P.forEach((p) => (p.acted = false));
    while (guard++ < 200) {
      const live = P.filter((p) => !p.folded); if (live.length <= 1) return;
      const can = live.filter((p) => !p.allin); if (!can.length) return;
      if (can.every((p) => p.acted && p.bet === G.cur)) return;
      if (can.length === 1 && can[0].bet >= G.cur) return;
      const p = P[i]; i = (i + 1) % 3; if (p.folded || p.allin) continue;
      let a; if (p.human) a = await pkHuman(p); else { G.turn = p; pkRender(); await pkSleep(750 + rnd(500)); a = pkBot(p); }
      G.turn = null; pkApply(p, a); pkRender(); if (!p.human) await pkSleep(350);
    }
  }
  async function pkHand() {
    const P = G.P, t = G.t; G.deck = shuf(deck()); G.board = []; G.pot = 0; G.showAll = false; G.msg = "";
    P.forEach((p) => { p.hole = []; p.bet = 0; p.tot = 0; p.folded = false; p.allin = false; p.acted = false; p.last = ""; });
    G.dealer = (G.dealer + 1) % 3; const sb = (G.dealer + 1) % 3, bb = (G.dealer + 2) % 3;
    pkCommit(P[sb], t.sb); pkCommit(P[bb], t.bb); G.cur = t.bb; G.minRaise = t.bb; P[sb].last = "Ciega " + P[sb].bet; P[bb].last = "Ciega " + P[bb].bet;
    P.forEach((p) => p.hole.push(G.deck.pop())); P.forEach((p) => p.hole.push(G.deck.pop())); G.fresh = "hole"; pkRender(); await pkSleep(800);
    let first = (bb + 1) % 3;
    for (let ph = 0; ph < 4; ph++) {
      if (ph > 0) { const n = ph === 1 ? 3 : 1; for (let k = 0; k < n; k++) G.board.push(G.deck.pop()); G.fresh = G.board.length - n; P.forEach((p) => { p.bet = 0; p.last = ""; }); G.cur = 0; G.minRaise = t.bb; first = (G.dealer + 1) % 3; pkRender(); await pkSleep(700); }
      await pkRound(first);
      if (P.filter((p) => !p.folded).length <= 1) break;
    }
    pkShow();
  }
  function pkShow() {
    const P = G.P, live = P.filter((p) => !p.folded); let txt = "";
    if (live.length === 1) { live[0].stack += G.pot; txt = `${live[0].human ? "Ganás" : live[0].n + " gana"} el bote de ${money(G.pot)}: todos se retiraron.`; }
    else {
      G.showAll = true; P.forEach((p) => { if (!p.folded) p.rk = best([...p.hole, ...G.board]); });
      const wins = [];
      sidePots(P).forEach((sp) => {
        let bw = [], br = null;
        sp.el.forEach((i) => { const c = br ? cmp(P[i].rk, br) : 1; if (c > 0) { br = P[i].rk; bw = [i]; } else if (c === 0) bw.push(i); });
        const sh = Math.floor(sp.amt / bw.length); bw.forEach((i) => { P[i].stack += sh; wins.push([i, sh]); }); P[bw[0]].stack += sp.amt - sh * bw.length;
      });
      const hn = (p) => (p.rk[0] === 8 && p.rk[1] === 14 ? "Escalera real" : HN[p.rk[0]]);
      const ws = [...new Set(wins.map((w) => w[0]))];
      txt = ws.map((i) => `${P[i].human ? "Ganás" : P[i].n + " gana"} ${money(wins.filter((w) => w[0] === i).reduce((a, w) => a + w[1], 0))} con ${hn(P[i])}`).join(" · ");
      txt += `<br><small>${P.filter((p) => !p.folded).map((p) => `${p.human ? "Vos" : p.n}: ${hn(p)}`).join(" · ")}</small>`;
    }
    G.pot = 0; G.msg = txt;
  }
  async function pkLoop() {
    try {
      while (!G.dead) {
        await pkHand(); pkRender(); G.chips = 0; save();
        const h = G.P[0]; const over = h.stack <= 0;
        G.P.forEach((p) => { if (!p.human && p.stack < G.t.bb * 2) { p.stack = G.t.buy; p.n = NAMES[rnd(NAMES.length)]; } });
        G.between = over ? "over" : "next"; pkRender();
        const act = await new Promise((res, rej) => { G.wait = { res, rej }; });
        G.between = null; if (act === "leave") return pkLeave();
        if (over) return pkLeave();
      }
    } catch (e) { if (e !== "dead") console.warn("Casino", e); }
  }
  function pkLeave() {
    if (!G || G.dead) return; const g = G, h = g.P[0], back = h.stack; h.stack = 0; g.dead = true;
    if (g.wait) { try { g.wait.rej("dead"); } catch (e) {} g.wait = null; }
    pay(back); BUSY = false; lock();
    if (q("#casb") && TAB === "pk") { q("#casb").innerHTML = pkMenu(); bal(); msg(`Te levantaste de la mesa con ${money(back)}.`, back >= g.t.buy ? "up" : "dn"); }
  }
  function pkMenu() {
    return `<p class="cmsg">Texas Hold'em contra dos jugadores de la casa (${DF().rival}). Elegí tu mesa: pagás la entrada con tus fondos y al levantarte cobrás las fichas que te queden.</p><div class="pkt">${TBL.map((t, i) => `<button class="cbtn" ${S.cash < t.buy ? "disabled" : ""} onclick="CAS.pkjoin(${i})"><b>Mesa ${t.sb}/${t.bb}</b><br>Entrada ${money(t.buy)}</button>`).join("")}</div><div id="casm" class="cmsg"></div>`;
  }
  function pkJoin(i) {
    const t = TBL[i]; if (BUSY || S.cash < t.buy) return;
    pay(-t.buy); G = pkNew(t); BUSY = true; lock(); pkRender(); pkLoop();
  }
  function pkRender() {
    const el = q("#casb"); if (!el || !G || G.dead || TAB !== "pk") return;
    const P = G.P, fr = G.fresh, bd = G.board;
    const seat = (p, i) => `<div class="pks${G.turn === p ? " turn" : ""}${p.folded ? " fold" : ""}"><div class="pkn"><b>${p.n}</b>${G.dealer === i ? '<span class="dlr">D</span>' : ""}<span>${money(p.stack)}</span></div><div class="hand">${p.hole.length ? p.hole.map((c) => (p.human || (G.showAll && !p.folded) ? cardH(c, fr === "hole" ? "new" : "") : backH(fr === "hole" ? "new" : ""))).join("") : ""}</div><div class="pkl">${p.last || "&nbsp;"}</div></div>`;
    const me = P[0], hum = G.turn === me && G.wait;
    let ctl = "";
    if (G.between) ctl = `<div class="crow">${G.between === "next" ? `<button class="go" onclick="CAS.pknext()">Siguiente mano</button>` : ""}<button class="cbtn" onclick="CAS.pkleave()">${G.between === "over" ? "Volver al menú" : `Levantarte y cobrar ${money(me.stack)}`}</button></div>`;
    else if (hum) {
      const call = Math.min(G.cur - me.bet, me.stack), mx = me.bet + me.stack, mn = Math.min(G.cur + G.minRaise, mx), pr = G.cur + G.pot + (G.cur - me.bet);
      let rs = [["Mínimo", mn], ["½ bote", Math.max(mn, G.cur + Math.round((G.pot + G.cur - me.bet) / 2))], ["Bote", Math.max(mn, pr)], ["All-in", mx]].map(([l, v]) => [l, Math.min(v, mx)]);
      const seen = new Set(); rs = rs.filter(([l, v]) => v > G.cur && !seen.has(v) && seen.add(v));
      ctl = `<div class="crow"><button class="cbtn" onclick="CAS.pkact('fold')">Retirarse</button><button class="go" onclick="CAS.pkact('call')">${call ? (call >= me.stack ? "All-in " + call : "Igualar " + call) : "Pasar"}</button></div>${call < me.stack ? `<div class="crow">${rs.map(([l, v]) => `<button class="cbtn" onclick="CAS.pkact('raise',${v})">${l}<br><small>subir a ${v}</small></button>`).join("")}</div>` : ""}`;
    } else ctl = `<div class="cmsg">${G.turn ? G.turn.n + " está pensando…" : ""}</div>`;
    el.innerHTML = `<div class="pkb">${P.slice(1).map((p, k) => seat(p, k + 1)).join("")}</div><div class="pkc"><div class="hand">${[0, 1, 2, 3, 4].map((k) => (bd[k] ? cardH(bd[k], typeof fr === "number" && k >= fr ? "new" : "") : '<div class="cd ph"></div>')).join("")}</div><div class="pot">Bote <b>${money(G.pot)}</b> · ciegas ${G.t.sb}/${G.t.bb}</div></div>${seat(me, 0).replace("pks", "pks me")}<div id="casm" class="cmsg ${G.msg ? "" : ""}">${G.msg}</div>${ctl}`;
    G.fresh = null; bal();
  }

  /* ---------- interfaz y navegación ---------- */
  function lock() { const pk = G && !G.dead; document.querySelectorAll("#cas .ctb button, #cas .cdf button").forEach((b) => (b.disabled = BUSY)); const c = q("#cas .cx"); if (c) c.disabled = BUSY && !pk; }
  function show(t) {
    if (BUSY) return;
    TAB = t; document.querySelectorAll("#cas .ctb button").forEach((b) => b.classList.toggle("on", b.dataset.t === t));
    const b = q("#casb"); b.innerHTML = t === "rou" ? rouView() : t === "bj" ? bjView() : pkMenu();
    
    if (t === "rou") rBoard(); if (t === "bj") { BJ.st = "bet"; bjBetUi(); }
    dfUi(); bal();
  }
  function rules(t) {
    const d = DF();
    if (t === "rou") return `Ruleta europea de un solo cero · el pleno paga ${d.rou.pleno} a 1${d.rou.partage ? " · si sale 0, las apuestas simples recuperan la mitad (La Partage)" : ""} · máx. ${money(d.maxb)} por casilla.`;
    if (t === "bj") return `6 mazos · el crupier ${d.bj.h17 ? "pide con 17 blando" : "se planta en 17"} · el blackjack paga ${d.bj.pay === 1.5 ? "3 a 2" : "6 a 5"} · ${d.bj.dd911 ? "solo se dobla con 9, 10 u 11" : "se dobla con cualquier mano inicial"} · máx. ${money(d.maxb)} por mano.`;
    return `Rivales ${d.rival}.`;
  }
  function dfUi() {
    const e = q("#cdf"); if (!e) return;
    e.innerHTML = `<small id="crul">${rules(TAB)}</small>`;
    lock();
  }
  function open() {
    if (!S || typeof S.cash !== "number") return;
    if ((S.age || 0) < MIN_AGE) { alert("Solo pueden entrar los mayores de " + MIN_AGE + " años."); return; }
    if (q("#cas")) q("#cas").remove(); SESSION = 0; BUSY = false; RB = {}; RST = []; G = null;
    const o = document.createElement("div"); o.id = "cas";
    o.innerHTML = `<div class="cw"><div class="chd"><b>🎰 Casino</b><span id="casbal"></span><button class="cx" onclick="CAS.close()">Salir</button></div><div class="cdf" id="cdf"></div><div class="ctb"><button data-t="rou" onclick="CAS.show('rou')">Ruleta</button><button data-t="bj" onclick="CAS.show('bj')">Blackjack</button><button data-t="pk" onclick="CAS.show('pk')">Póker</button></div><div id="casb"></div><p class="cnote">Dinero ficticio del juego. El azar manda: jugá con cabeza.<br>Balance histórico en el casino: <b id="casnet"></b></p></div>`;
    document.body.appendChild(o); document.body.style.overflow = "hidden"; show("rou");
  }
  function close() {
    if (BUSY && !(G && !G.dead)) return;
    if (G && !G.dead) pkLeave();
    const o = q("#cas"); if (o) o.remove(); document.body.style.overflow = "";
    try { hub(); } catch (e) {}
  }
  window.CAS = {
    open, close, show,
    dif: (i) => {
      if (BUSY || (G && !G.dead)) return msg("No se puede cambiar la dificultad en medio de una partida.", "dn");
      CAS().dif = i; save(); if (RB && rTot() > 0) { RB = {}; RST = []; } if (BJ.bet > maxb()) { BJ.bet = maxb(); BJ.hist = [BJ.bet]; } show(TAB);
    },
    rchip: (c) => { rchip = c; document.querySelectorAll("#cas .chp").forEach((b) => b.classList.toggle("on", +b.textContent === c)); },
    rbet: (k) => { if (BUSY) return; if ((RB[k] || 0) + rchip > maxb()) return msg("Máximo " + money(maxb()) + " por casilla.", "dn"); if (rTot() + rchip > S.cash) return msg("No te alcanzan los fondos.", "dn"); RB[k] = (RB[k] || 0) + rchip; RST.push([k, rchip]); msg(""); rBoard(); },
    rundo: () => { if (BUSY) return; const l = RST.pop(); if (l) { RB[l[0]] -= l[1]; if (!RB[l[0]]) delete RB[l[0]]; rBoard(); } },
    rclr: () => { if (!BUSY) { RB = {}; RST = []; rBoard(); } },
    rrep: () => { if (!BUSY && RLAST) { RB = { ...RLAST }; RST = Object.entries(RB).map(([k, v]) => [k, v]); rBoard(); } },
    spin,
    bjchip: (c) => {
      if (BUSY) return;
      if (!BJ.touched) { BJ.bet = 0; BJ.hist = []; BJ.touched = true; }
      const add = Math.min(c, maxb() - BJ.bet, Math.floor(S.cash) - BJ.bet);
      if (add <= 0) { bjBetUi(); return msg(BJ.bet >= maxb() ? "Máximo " + money(maxb()) + " por mano." : "No te alcanzan los fondos.", "dn"); }
      BJ.bet += add; BJ.hist.push(add); msg(""); bjBetUi();
    },
    bjundo: () => { if (BUSY) return; BJ.touched = true; if (BJ.hist.length) BJ.bet -= BJ.hist.pop(); else BJ.bet = 0; bjBetUi(); },
    bjclr: () => { if (BUSY) return; BJ.bet = 0; BJ.hist = []; BJ.touched = true; bjBetUi(); },
    bjrep: () => { if (BUSY || !BJ.last) return; BJ.bet = Math.min(BJ.last, maxb(), Math.floor(S.cash)); BJ.hist = [BJ.bet]; BJ.touched = true; bjBetUi(); },
    bjmin: () => { if (BUSY) return; BJ.bet = 1; BJ.hist = [1]; BJ.touched = true; bjBetUi(); },
    bjdeal: bjDeal, bjhit: () => bjHit(false), bjstand: bjDealer, bjdouble: bjDouble,
    pkjoin: pkJoin,
    pkact: (t, to) => { if (G && G.wait && G.turn && G.turn.human) { const w = G.wait; G.wait = null; w.res({ t, to }); } },
    pknext: () => { if (G && G.wait) { const w = G.wait; G.wait = null; w.res("next"); } },
    pkleave: () => { if (G && G.wait) { const w = G.wait; G.wait = null; w.res("leave"); } },
    _t: { rWin, rPay, rank5, best, cmp, sidePots, bjv, deck, pStrength, ORD, setSleep: (f) => (SLEEP = f),
      pkSim: async (n) => {
        G = pkNew(TBL[1]); G.P[0].human = 0; G.P[0].agg = 0.5; const tot = G.P.reduce((a, p) => a + p.stack, 0); let bad = 0, hands = 0, sd = 0;
        for (let i = 0; i < n; i++) {
          if (G.P.some((p) => p.stack <= 0)) { G.P.forEach((p) => (p.stack = Math.round(tot / 3))); }
          const before = G.P.reduce((a, p) => a + p.stack, 0); await pkHand(); hands++; if (G.showAll) sd++;
          const after = G.P.reduce((a, p) => a + p.stack, 0); if (after !== before || G.P.some((p) => p.stack < 0 || !Number.isInteger(p.stack))) bad++;
        }
        return { bad, hands, sd };
      } },
  };

  /* ---------- estilos ---------- */
  const st = document.createElement("style");
  st.textContent = `#cas{position:fixed;inset:0;z-index:9998;background:rgba(0,0,0,.8);overflow-y:auto;display:flex;justify-content:center;align-items:flex-start;padding:10px}
#cas .cw{width:100%;max-width:560px;background:radial-gradient(120% 90% at 50% 0,#0f6a43,#07351f 70%);border:2px solid #d4af37;border-radius:16px;padding:12px;color:#fff;box-shadow:0 20px 60px #000c}
#cas .chd{display:flex;align-items:center;gap:10px;margin-bottom:8px}#cas .chd b{font-size:20px;color:#f5c542}#cas #casbal{flex:1;text-align:right;font-size:13px}#cas small.up,#cas .up{color:#6dff9c}#cas small.dn,#cas .dn{color:#ff8a85}
#cas button{font:inherit;cursor:pointer}#cas button:disabled{opacity:.45;cursor:default}
#cas .cx,#cas .cbtn{background:#0b2f1e;color:#fff;border:1px solid #d4af3799;border-radius:8px;padding:8px 12px;font-weight:700}
#cas .go{background:linear-gradient(#f5c542,#c99a12);color:#2a1d00;border:0;border-radius:8px;padding:10px 16px;font-weight:800;margin:0}
#cas .ctb{display:flex;gap:6px;margin-bottom:10px}#cas .ctb button{flex:1;background:#0b2f1e;color:#cfe;border:1px solid #d4af3755;border-radius:8px;padding:8px;font-weight:700}#cas .ctb button.on{background:#d4af37;color:#2a1d00}
#cas .crow{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}#cas .crow>*{flex:1;min-width:90px}
#cas .cmsg{min-height:20px;text-align:center;margin:6px 0;font-size:14px}#cas .cnote{font-size:11px;opacity:.65;text-align:center;margin:10px 0 0}
#cas .chps{display:flex;gap:6px;justify-content:center;margin:8px 0}#cas .chp{width:44px;height:44px;border-radius:50%;border:3px dashed #fff;color:#fff;font-weight:800;box-shadow:0 2px 6px #0008}
#cas .chp.c1{background:#6b7280}#cas .chp.c5{background:#c4161c}#cas .chp.c10{background:#1d4ed8}#cas .chp.c25{background:#15803d}#cas .chp.c50{background:#7e22ce}#cas .chp.c100{background:#111}#cas .chp.on{transform:translateY(-4px);box-shadow:0 0 0 3px #f5c542}
#cas .rwrap{display:flex;align-items:center;gap:12px;justify-content:center}#cas .rsv{width:min(52vw,230px)}#cas .rres{flex:1;text-align:center;font-size:15px}#cas .rres .big{display:inline-block;min-width:44px;padding:4px 8px;border-radius:8px;font:800 26px Georgia,serif}
#cas .g{background:#12803d}#cas .r{background:#c4161c}#cas .b{background:#15151a}
#cas .rhist{display:flex;gap:4px;justify-content:center;flex-wrap:wrap;margin:8px 0}#cas .rhist span{min-width:26px;text-align:center;border-radius:5px;padding:2px 4px;font-size:12px;font-weight:700}
#cas .rc{position:relative;background:#0b2f1e;color:#fff;border:1px solid #d4af3788;padding:7px 2px;font-weight:700;font-size:12px;border-radius:4px}#cas .rc.r{background:#c4161c}#cas .rc.b{background:#15151a}#cas .rc.g{background:#12803d}
#cas .rc em{position:absolute;right:1px;top:1px;background:#f5c542;color:#222;font:800 9px sans-serif;border-radius:8px;padding:1px 4px;font-style:normal}
#cas .rn{display:flex;gap:3px;margin-bottom:3px}#cas .rz{width:34px}#cas .rg{flex:1;display:grid;grid-template-columns:repeat(12,1fr);gap:3px}
#cas .ro3,#cas .ro6{display:grid;gap:3px;margin-bottom:3px}#cas .ro3{grid-template-columns:repeat(3,1fr)}#cas .ro6{grid-template-columns:repeat(6,1fr)}
#cas .rtot{text-align:center;margin:6px 0;font-size:14px}
#cas .hand{display:flex;gap:6px;justify-content:center;min-height:68px;flex-wrap:wrap}
#cas .cd{width:46px;height:64px;border-radius:6px;background:#fff;color:#111;display:flex;flex-direction:column;align-items:center;justify-content:center;font:700 17px/1.1 Georgia,serif;box-shadow:0 2px 5px #0007}
#cas .cd.rd{color:#c4161c}#cas .cd i{font-style:normal;font-size:20px}#cas .cd.bk{background:repeating-linear-gradient(45deg,#7a1020,#7a1020 4px,#a01a2c 4px,#a01a2c 8px);border:2px solid #fff}#cas .cd.ph{background:#0b2f1e55;border:1px dashed #d4af3777;box-shadow:none}
#cas .cd.new{animation:cdIn .4s ease-out both}#cas .cd.flip{animation:cdFlip .45s ease-out both}
@keyframes cdIn{from{transform:translate(70px,-60px) rotate(25deg);opacity:0}to{transform:none;opacity:1}}@keyframes cdFlip{from{transform:rotateY(90deg)}to{transform:none}}
#cas .bjz{margin:8px 0}#cas .bjl{font-size:13px;text-align:center;opacity:.9}#cas .bjl b{color:#f5c542;margin-left:6px}
#cas .pkb{display:grid;grid-template-columns:1fr 1fr;gap:8px}#cas .pks{background:#0b2f1e99;border:1px solid #d4af3744;border-radius:10px;padding:6px;text-align:center}#cas .pks.turn{box-shadow:0 0 0 2px #f5c542}#cas .pks.fold{opacity:.45}#cas .pks.me{margin-top:8px}
#cas .pkn{display:flex;gap:6px;justify-content:center;align-items:center;font-size:12px;flex-wrap:wrap}#cas .dlr{background:#f5c542;color:#222;border-radius:50%;width:18px;height:18px;font:800 11px/18px sans-serif}#cas .pkl{font-size:12px;min-height:16px;color:#f5c542}
#cas .cdf{display:flex;gap:6px;align-items:center;flex-wrap:wrap;margin-bottom:8px;font-size:12px}#cas .cdf span{opacity:.8}#cas .cdf button{background:#0b2f1e;color:#cfe;border:1px solid #d4af3755;border-radius:99px;padding:3px 10px;font-weight:700;font-size:12px}#cas .cdf button.on{background:#f5c542;color:#2a1d00}#cas .cdf small{flex-basis:100%;opacity:.7;line-height:1.35}
#cas .pkc{margin:10px 0;text-align:center}#cas .pot{margin-top:6px;font-size:14px}#cas .pkt{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px}
.ccb{display:block;width:100%;margin:12px 0 0;padding:12px 14px;border-radius:12px;border:1px solid #d4af37;background:linear-gradient(135deg,#0f6a43,#07351f);color:#f5c542;font-weight:800;font-size:16px;cursor:pointer;text-align:left}.ccb small{display:block;color:#cfe;font-weight:500;font-size:12px}`;
  document.head.appendChild(st);

  /* ---------- botón de entrada en la pantalla de decisiones ---------- */
  const _hub = window.hub;
  if (typeof _hub === "function") window.hub = function () {
    const r = _hub.apply(this, arguments);
    try {
      const a = q("#app");
      if (a && S && S.series && typeof S.cash === "number" && !q("#ccasbtn")) {
        const b = document.createElement("button"); b.id = "ccasbtn"; b.className = "ccb";
        b.innerHTML = `🎰 Casino<small>Ruleta, blackjack y póker con tus fondos</small>`; b.onclick = open; a.appendChild(b);
      }
    } catch (e) {}
    return r;
  };
})();

