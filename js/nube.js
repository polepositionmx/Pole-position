
/* ===== Cuentas en la nube (Firebase Auth + Firestore) ===== */
(function () {
  const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBghHhmx3T1WDlfBiKbBDj0qesxBbA1tqU",
    authDomain: "pole-position-6cf71.firebaseapp.com",
    projectId: "pole-position-6cf71",
    appId: "1:707495282058:web:45046ba725bd7494bab473",
  };
  const V = "10.12.2", CDN = "https://www.gstatic.com/firebasejs/" + V + "/firebase-";
  const READY = FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey !== "PEGA_AQUI";
  const KEYS = ["pp_tro", "pp_hof", "pp_ownhof"];
  let auth, db, U = null, tm = null, busy = false, skipWipe = false;
  const $$ = (s) => document.querySelector(s);
  const lj = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
  const load = (src) => new Promise((ok, ko) => { const s = document.createElement("script"); s.src = src; s.onload = ok; s.onerror = ko; document.head.appendChild(s); });
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ---- estadísticas de la carrera actual ---- */
  function careerStats() {
    if (typeof S === "undefined" || !S || !S.hist) return null;
    if (!S._cid) S._cid = Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
    const t = S.titles || {};
    return {
      id: S._cid, name: S.name || "—",
      pts: S.hist.reduce((a, h) => a + (+h.pts || 0), 0),
      wins: S.wins || 0, pods: S.pods || 0, poles: S.poles || 0,
      titles: (t.f1 || 0) + (t.f2 || 0) + (t.f3 || 0) + (t.fe || 0) + (t.f4 || 0),
      seasons: S.hist.length, t: Date.now(),
    };
  }

  /* ---- subida ---- */
  async function pushAll() {
    if (!U || busy || localStorage.getItem("pp_priv2") !== "yes") return; busy = true; btn.dataset.s = "1";
    try {
      const u = db.collection("users").doc(U.uid), b = db.batch();
      for (let i = 0; i <= 10; i++) {
        const raw = localStorage.getItem("pp_sv_" + i);
        if (raw) { const o = JSON.parse(raw); b.set(u.collection("saves").doc("s" + i), { t: o.t || 0, l: o.l || "", json: raw }); }
      }
      const meta = {}; KEYS.forEach((k) => (meta[k] = localStorage.getItem(k) || "[]"));
      const c = careerStats();
      if (c) b.set(u.collection("careers").doc(c.id), c);
      b.set(u, { meta, updated: Date.now() }, { merge: true });
      await b.commit();
      if (c) {
        const all = (await u.collection("careers").get()).docs.map((d) => d.data());
        const sum = (k) => all.reduce((a, x) => a + (x[k] || 0), 0);
        const tot = { name: U.displayName || "Piloto", pts: sum("pts"), wins: sum("wins"), pods: sum("pods"), poles: sum("poles"), titles: sum("titles"), seasons: sum("seasons"), careers: all.length, t: Date.now() };
        await u.set({ stats: tot }, { merge: true });
        await db.collection("leaderboard").doc(U.uid).set(tot);
      }
    } catch (e) { console.warn("Sync", e); btn.dataset.s = "e"; } finally { busy = false; if (btn.dataset.s === "1") btn.dataset.s = "0"; }
  }
  const later = () => { clearTimeout(tm); tm = setTimeout(pushAll, 2500); };

  /* ---- descarga (al iniciar sesión) ---- */
  async function pull() {
    const u = db.collection("users").doc(U.uid);
    const [snap, sv] = await Promise.all([u.get(), u.collection("saves").get()]);
    sv.forEach((d) => {
      const i = d.id.slice(1), loc = lj("pp_sv_" + i, null), x = d.data();
      if (!loc || (loc.t || 0) < x.t) localStorage.setItem("pp_sv_" + i, x.json);
    });
    const m = (snap.data() || {}).meta || {};
    KEYS.forEach((k) => {
      const a = lj(k, []), b = JSON.parse(m[k] || "[]");
      if (k === "pp_tro") localStorage.setItem(k, JSON.stringify([...new Set([...a, ...b])]));
      else { const seen = new Set(), z = [...a, ...b].filter((x) => { const s = JSON.stringify(x); return seen.has(s) ? 0 : seen.add(s); }); z.sort((p, q) => q.sc - p.sc); localStorage.setItem(k, JSON.stringify(z.slice(0, 10))); }
    });
    try { TRO = lj("pp_tro", []); } catch (e) {}
    await pushAll();
  }
  function wipeLocal() {
    for (let i = 0; i <= 10; i++) localStorage.removeItem("pp_sv_" + i);
    KEYS.forEach((k) => localStorage.removeItem(k));
    try { TRO = []; } catch (e) {}
  }

  /* ---- enganches al juego (sin modificar su lógica) ---- */
  function hook() {
    const w = (name) => { const f = window[name]; if (typeof f !== "function") return; window[name] = function () { const r = f.apply(this, arguments); later(); return r; }; };
    ["svWrite", "slotDel", "slotImp", "checkTr", "end", "opRec"].forEach(w);
    try { svWrite = window.svWrite; slotDel = window.slotDel; slotImp = window.slotImp; checkTr = window.checkTr; end = window.end; } catch (e) {}
    document.addEventListener("visibilitychange", () => { if (document.hidden) pushAll(); });
  }

  /* ---- interfaz ---- */
  const css = document.createElement("style");
  css.textContent = `#acm{position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:9999;display:flex;align-items:center;justify-content:center;padding:14px}
#acm>div{background:#14161c;color:#eee;border:1px solid #333;border-radius:14px;max-width:420px;width:100%;max-height:90vh;overflow:auto;padding:18px}
#acm input{width:100%;padding:10px;margin:5px 0;border-radius:8px;border:1px solid #444;background:#0d0f13;color:#fff;box-sizing:border-box;font-size:16px}
#acm button{padding:10px 14px;margin:4px 0;border-radius:8px;border:0;cursor:pointer;font-weight:700;width:100%}
#acm .p{background:#e10600;color:#fff}#acm .s{background:#2a2d36;color:#fff}#acm .e{color:#ff7b7b;font-size:13px;min-height:16px}
#acm table{width:100%;font-size:13px;border-collapse:collapse}#acm td,#acm th{padding:4px;text-align:left;border-bottom:1px solid #2a2d36}
#acm .g{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}#acm .g div{background:#1d2028;border-radius:8px;padding:8px;text-align:center}#acm .g b{display:block;font-size:20px}`;
  css.textContent += `
.bar .ut{gap:12px}
.bar .ut>span:first-child{font-weight:800;letter-spacing:.14em;opacity:1;color:#fff;display:flex;align-items:center;gap:8px}
.bar .ut>span:first-child:before{content:"";width:4px;height:14px;border-radius:2px;background:#e10600;box-shadow:0 0 10px #e10600aa}
.bar .ut nav{display:flex;align-items:center;gap:4px;overflow-x:auto;scrollbar-width:none}
.bar .ut nav::-webkit-scrollbar{display:none}
.bar button.nv{white-space:nowrap;background:transparent;border:1px solid transparent;transition:background .15s,border-color .15s,transform .15s}
.bar button.nv:not(.acb):hover{background:#ffffff14;border-color:#ffffff22;transform:translateY(-1px)}
.bar button.nv:not(.acb):before{margin-right:6px;font-size:12px}
.bar nav>.nv:nth-child(2):before{content:"💾"}.bar nav>.nv:nth-child(3):before{content:"❓"}
.bar nav>.nv:nth-child(4):before{content:"📰"}.bar nav>.nv:nth-child(5):before{content:"🏠"}
.bar button.acb{display:flex;align-items:center;gap:8px;padding:3px 14px 3px 3px;margin-right:6px;background:linear-gradient(135deg,#2a2a3d,#1c1c2b);border:1px solid #3a3a52;box-shadow:0 2px 10px #0006}
.bar button.acb:hover{border-color:#e10600;box-shadow:0 0 0 3px #e1060033}
.bar button.acb.out{background:linear-gradient(135deg,#e10600,#a30400);border-color:#ff4a43;padding:6px 14px}
.acb .av{position:relative;width:26px;height:26px;border-radius:50%;flex:none;background:linear-gradient(135deg,#e10600,#7a1fff);color:#fff;font:800 12px Inter,sans-serif;display:flex;align-items:center;justify-content:center;background-size:cover;background-position:center}
.acb .av:after{content:"";position:absolute;right:-2px;bottom:-2px;width:9px;height:9px;border-radius:50%;background:#2ecc71;border:2px solid #1c1c2b}
.acb[data-s="1"] .av:after{background:#f5a623;animation:acp 1s infinite}.acb[data-s="e"] .av:after{background:#ff4a43}
@keyframes acp{50%{opacity:.35}}
.acb .nm{max-width:110px;overflow:hidden;text-overflow:ellipsis}
@media(max-width:560px){.acb .nm{display:none}.bar button.acb{padding:3px}.bar button.acb.out{padding:6px 10px}.bar .ut>span:first-child{display:none}.bar .ut nav{margin-left:0;width:100%}}`;
  document.head.appendChild(css);

  function modal(html) {
    let m = $$("#acm"); if (!m) { m = document.createElement("div"); m.id = "acm"; m.onclick = (e) => e.target === m && m.remove(); document.body.appendChild(m); }
    m.innerHTML = "<div>" + html + '<button class="s" onclick="document.getElementById(\'acm\').remove()">Cerrar</button></div>';
  }
  const err = (e) => { const x = $$("#acerr"); if (x) x.textContent = ({ "auth/invalid-credential": "Correo o contraseña incorrectos.", "auth/email-already-in-use": "Ese correo ya está registrado.", "auth/weak-password": "La contraseña debe tener al menos 6 caracteres.", "auth/invalid-email": "Correo inválido.", "auth/popup-closed-by-user": "" })[e.code] || e.message; };

  function loginView(reg) {
    modal(`<h2 style="margin-top:0">${reg ? "Crear cuenta" : "Iniciar sesión"}</h2>
${reg ? '<input id="acn" placeholder="Nombre de piloto" maxlength="20">' : ""}
<input id="ace" type="email" placeholder="Correo"><input id="acp" type="password" placeholder="Contraseña (mín. 6)">
<div class="e" id="acerr"></div>
<button class="p" id="acgo">${reg ? "Registrarme" : "Entrar"}</button>
<button class="s" id="acgg">Continuar con Google</button>
${reg ? "" : '<button class="s" id="acrs">Olvidé mi contraseña</button>'}
<button class="s" id="acsw">${reg ? "Ya tengo cuenta" : "Crear una cuenta"}</button>`);
    $$("#acsw").onclick = () => loginView(!reg);
    $$("#acgg").onclick = () => auth.signInWithPopup(new firebase.auth.GoogleAuthProvider()).catch(err);
    if (!reg) $$("#acrs").onclick = () => { const e = $$("#ace").value; if (!e) return err({ message: "Escribe tu correo primero." }); auth.sendPasswordResetEmail(e).then(() => ($$("#acerr").textContent = "Te enviamos un correo para restablecerla.")).catch(err); };
    $$("#acgo").onclick = async () => {
      const e = $$("#ace").value.trim(), p = $$("#acp").value;
      try {
        if (reg) { const n = ($$("#acn").value.trim() || "Piloto"); const c = await auth.createUserWithEmailAndPassword(e, p); await c.user.updateProfile({ displayName: n }); await pushAll(); }
        else await auth.signInWithEmailAndPassword(e, p);
      } catch (x) { err(x); }
    };
  }

  async function profileView() {
    modal("<p>Cargando…</p>");
    try {
      await pushAll();
      const d = (await db.collection("users").doc(U.uid).get()).data() || {}, s = d.stats || {};
      const lb = (await db.collection("leaderboard").orderBy("pts", "desc").limit(10).get()).docs.map((x) => ({ id: x.id, ...x.data() }));
      modal(`<h2 style="margin:0">👤 ${esc(U.displayName || "Piloto")}</h2><p style="color:#999;margin:2px 0">${esc(U.email || "")} · ☁️ partidas sincronizadas</p>
<div class="g"><div><b>${s.pts || 0}</b>puntos totales</div><div><b>${s.wins || 0}</b>victorias</div><div><b>${s.pods || 0}</b>podios</div><div><b>${s.poles || 0}</b>poles</div><div><b>${s.titles || 0}</b>títulos</div><div><b>${s.seasons || 0}</b>temporadas</div></div>
<p style="color:#999;font-size:13px">${s.careers || 0} carrera(s) registradas. Las estadísticas se actualizan al guardar y al terminar cada temporada.</p>
<h3>🏆 Ranking global (puntos)</h3><table><tr><th>#</th><th>Piloto</th><th>Pts</th><th>Títulos</th></tr>${lb.map((x, i) => `<tr${x.id === U.uid ? ' style="color:#f5c542"' : ""}><td>${i + 1}</td><td>${esc(x.name)}</td><td>${x.pts}</td><td>${x.titles}</td></tr>`).join("")}</table>
<button class="s" id="acname" style="margin-top:10px">Cambiar nombre de piloto</button><button class="s" id="acout">Cerrar sesión</button><button class="s" id="acdel" style="background:#3a1517;color:#ff9a95">Eliminar mi cuenta y mis datos</button>`);
      $$("#acname").onclick = async () => { const n = prompt("Nuevo nombre:", U.displayName || ""); if (n) { await U.updateProfile({ displayName: n.slice(0, 20) }); setBtn(U); await pushAll(); profileView(); } };
      $$("#acout").onclick = async () => { await pushAll(); await auth.signOut(); };
      $$("#acdel").onclick = async () => {
        if (!confirm("¿Eliminar tu cuenta y todos tus datos en la nube (partidas, estadísticas y ranking)? No se puede deshacer. Las partidas de este dispositivo se conservan.")) return;
        try {
          skipWipe = true; busy = true;
          const u = db.collection("users").doc(U.uid);
          for (const c of ["saves", "careers"]) { const q = await u.collection(c).get(); await Promise.all(q.docs.map((d) => d.ref.delete())); }
          await db.collection("leaderboard").doc(U.uid).delete();
          await u.delete();
          await U.delete();
        } catch (e) { skipWipe = false; busy = false; modal("<p>" + (e.code === "auth/requires-recent-login" ? "Por seguridad, cerrá sesión, volvé a entrar y repetí la eliminación. Tus datos en la nube ya se borraron; falta eliminar la cuenta." : esc(e.message)) + "</p>"); }
      };
    } catch (e) { modal("<p>No se pudo cargar: " + esc(e.message) + "</p>"); }
  }

  const btn = document.createElement("button");
  btn.className = "nv acb out";
  const setBtn = (u) => {
    if (!u) { btn.className = "nv acb out"; btn.textContent = "👤 Iniciar sesión"; return; }
    const n = u.displayName || "Piloto";
    btn.className = "nv acb";
    btn.innerHTML = '<span class="av">' + (u.photoURL ? "" : esc(n[0].toUpperCase())) + '</span><span class="nm">' + esc(n) + "</span>";
    if (u.photoURL) btn.querySelector(".av").style.backgroundImage = "url(" + u.photoURL + ")";
  };
  setBtn(null);
  btn.onclick = () => { if (localStorage.getItem("pp_priv2") !== "yes") { if (window.pvShow) pvShow(); return; } if (!READY) return modal("<h3>Cuenta no configurada</h3><p>Falta pegar la configuración de Firebase al inicio del bloque «Cuentas en la nube».</p>"); U ? profileView() : loginView(false); };
  const nav = document.querySelector("header nav"); (nav || document.body).prepend(btn);

  if (!READY) return;
  (async () => {
    for (const m of ["app", "auth", "firestore"]) await load(CDN + m + "-compat.js");
    firebase.initializeApp(FIREBASE_CONFIG); auth = firebase.auth(); db = firebase.firestore(); hook();
    auth.onAuthStateChanged(async (u) => {
      const was = U; U = u; setBtn(u);
      if (u) { try { await pull(); } catch (e) { console.warn(e); } if ($$("#acm")) profileView(); if (typeof slots === "function" && /Guardar y cargar/.test($$("#app").textContent.slice(0, 40))) slots(); }
      else if (was) { if (!skipWipe) wipeLocal(); location.reload(); }
    });
  })();
})();

