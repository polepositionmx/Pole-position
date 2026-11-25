/* ===== Contratos personalizados (v1.38) =====
   Cada equipo tiene su propio estilo de contrato, y la oferta cambia según tu historia
   (títulos, victorias, últimos resultados, edad, años en el equipo) y cómo te fue
   con los objetivos del último año. */
(function () {
  const hs = (s) => {
      let h = 2166136261;
      for (const c of String(s)) {
        h ^= c.charCodeAt(0);
        h = Math.imul(h, 16777619);
      }
      return h >>> 0;
    },
    clp = (v, a, b) => Math.max(a, Math.min(b, v)),
    PROF = [
      { k: "std", sal: 1, bn: 1, wb: 1, sig: 1, dy: 0, pat: 3,
        n: ["Tradicional", "Tradicional", "Traditional"],
        d: ["Condiciones equilibradas.", "Condições equilibradas.", "Balanced terms."] },
      { k: "seg", sal: 1.25, bn: 0.7, wb: 0.65, sig: 0.8, dy: 0, pat: 3,
        n: ["Sueldo seguro", "Salário seguro", "Safe salary"],
        d: ["Sueldo base alto, bonus bajos.", "Salário base alto, bônus baixos.", "High base salary, low bonuses."] },
      { k: "inc", sal: 0.72, bn: 1.6, wb: 1.8, sig: 0.7, dy: 0, pat: 3,
        n: ["Pago por rendimiento", "Pagamento por desempenho", "Pay for performance"],
        d: ["Sueldo base bajo, bonus por podio y victoria muy altos.", "Salário base baixo, bônus por pódio e vitória muito altos.", "Low base salary, very high podium and win bonuses."] },
      { k: "sig", sal: 0.95, bn: 0.9, wb: 0.85, sig: 2.2, dy: 0, pat: 3,
        n: ["Prima generosa", "Luvas generosas", "Generous signing bonus"],
        d: ["Prima de firma alta, resto discreto.", "Luvas altas, o resto discreto.", "High signing bonus, the rest modest."] },
      { k: "lar", sal: 0.9, bn: 1, wb: 1, sig: 1, dy: 1, pat: 3,
        n: ["Proyecto a largo plazo", "Projeto de longo prazo", "Long-term project"],
        d: ["Quiere atarte más años, con sueldo algo menor.", "Quer te prender por mais anos, com salário um pouco menor.", "Wants to tie you down for longer, with slightly lower pay."] },
      { k: "aus", sal: 0.8, bn: 0.85, wb: 0.8, sig: 0.4, dy: 0, pat: 2,
        n: ["Austero", "Austero", "Frugal"],
        d: ["Presupuesto ajustado y poco margen para negociar.", "Orçamento apertado e pouca margem para negociar.", "Tight budget and little room to negotiate."] },
    ],
    L3 = (a) => tcT(a[0], a[1], a[2]),
    sumTitles = () => {
      const T = S.titles || {};
      return (T.f1 || 0) + (T.f2 || 0) + (T.f3 || 0) + (T.fe || 0) + (T.f4 || 0);
    };

  function ctProfile(name, se, tier) {
    let i = hs(name + "|" + se) % PROF.length;
    if (PROF[i].k === "aus" && tier > 0.6) i = 0;
    if (PROF[i].k === "seg" && tier < 0.25) i = 0;
    return PROF[i];
  }

  function ctBudgetF(name, se) {
    try {
      const L = SERIES[se].teams,
        t = L.find((x) => x[0] === name),
        avg = L.reduce((a, x) => a + (x[2] || 0), 0) / L.length;
      if (!t || !avg || !t[2]) return 1;
      return clp(Math.pow(t[2] / avg, 0.35), 0.8, 1.25);
    } catch (e) {
      return 1;
    }
  }

  /* Factores que dependen de ti y de la temporada (sin azar). renew = el equipo te renueva. */
  function ctMult(name, se, tier, renew) {
    const P = ctProfile(name, se, tier),
      why = [],
      h = S.hist || [],
      rs = [h[h.length - 1], h[h.length - 2]]
        .filter(Boolean)
        .map((x) => 1 - (x.rank - 1) / Math.max(1, (SERIES[x.s].field || 10) - 1)),
      form = rs.length ? rs.reduce((a, b) => a + b, 0) / rs.length : 0.5,
      formF = 0.85 + form * 0.35,
      tt = sumTitles(),
      titleF = 1 + Math.min(0.5, tt * 0.12),
      careerF = 1 + Math.min(0.2, (S.wins || 0) * 0.004 + (S.pods || 0) * 0.0012),
      o = typeof rep_ === "object" && rep_ && rep_.ob ? rep_.ob : null,
      mk = 0.92 + ((hs(S.season + "|" + se + "|mk") % 1000) / 1000) * 0.2,
      bf = ctBudgetF(name, se),
      age = S.age || 25;
    let perfF = 1,
      n = null,
      yrs = 0;
    if (o) {
      n = (o.okPos ? 1 : 0) + (o.okW ? 1 : 0) + (o.okP ? 1 : 0);
      perfF = renew
        ? clp(1 + o.perf * 0.35, 0.75, 1.35) + [-0.18, -0.07, 0.03, 0.1][n]
        : clp(1 + o.perf * 0.15, 0.9, 1.15);
    }
    if (renew) {
      for (let i = h.length - 1; i >= 0 && h[i].t === name; i--) yrs++;
      yrs = Math.min(4, yrs);
    }
    const ageF = age <= 20 ? 0.9 : age <= 24 ? 0.97 : age >= 34 ? 1.05 : 1,
      sal = clp(P.sal * formF * titleF * careerF * perfF * ageF * bf * mk * (1 + yrs * 0.025), 0.5, 2.2),
      bon = clp(1 + (perfF - 1) * 0.5 + (formF - 1) * 0.5, 0.7, 1.4),
      sigX = 0.35 * yrs + (tt > 0 ? 0.8 : 0) + (renew && n === 3 ? 0.8 : 0) + (form > 0.75 ? 0.5 : 0);
    why.push([0, tcT("Estilo del equipo: ", "Estilo da equipe: ", "Team style: ") + L3(P.n) + ". " + L3(P.d)]);
    if (renew && o) {
      const t3 = [
        ["no cumpliste ningún objetivo: te bajan la oferta.", "você não cumpriu nenhuma meta: reduzem a oferta.", "you met none of the objectives: they cut the offer."],
        ["cumpliste solo 1 de 3 objetivos: oferta recortada.", "você cumpriu só 1 de 3 metas: oferta reduzida.", "you met only 1 of 3 objectives: reduced offer."],
        ["cumpliste 2 de 3 objetivos: condiciones normales.", "você cumpriu 2 de 3 metas: condições normais.", "you met 2 of 3 objectives: normal terms."],
        ["cumpliste los 3 objetivos: te mejoran la oferta.", "você cumpriu as 3 metas: melhoram a oferta.", "you met all 3 objectives: they improve the offer."],
      ][n];
      why.push([n >= 2 ? 1 : -1, tcT("Último año: ", "Último ano: ", "Last year: ") + L3(t3)]);
    } else if (o && o.perf > 0.25) {
      why.push([1, tcT("Rindes por encima de lo esperado en tu equipo actual.", "Você rende acima do esperado na sua equipe atual.", "You are outperforming expectations at your current team.")]);
    } else if (o && o.perf < -0.25) {
      why.push([-1, tcT("Tu último año quedó por debajo de lo esperado.", "Seu último ano ficou abaixo do esperado.", "Your last year fell short of expectations.")]);
    }
    if (tt > 0)
      why.push([1, tt > 1
        ? tcT(`Tus ${tt} títulos suben tu valor.`, `Seus ${tt} títulos aumentam seu valor.`, `Your ${tt} titles raise your value.`)
        : tcT("Tu título sube tu valor.", "Seu título aumenta seu valor.", "Your title raises your value.")]);
    if (form > 0.7) why.push([1, tcT("Tus últimos resultados son muy buenos.", "Seus últimos resultados são muito bons.", "Your recent results are very good.")]);
    else if (form < 0.3) why.push([-1, tcT("Tus últimos resultados fueron flojos.", "Seus últimos resultados foram fracos.", "Your recent results were weak.")]);
    if (yrs >= 2) why.push([1, tcT(`${yrs} años en el equipo: premio a la lealtad.`, `${yrs} anos na equipe: prêmio pela lealdade.`, `${yrs} years with the team: loyalty reward.`)]);
    if (age <= 20) why.push([0, tcT("Eres muy joven: te ofrecen menos sueldo y más años.", "Você é muito jovem: oferecem menos salário e mais anos.", "You are very young: lower pay and a longer deal.")]);
    if (age >= 34) why.push([0, tcT("Por tu edad prefieren contratos cortos.", "Pela sua idade preferem contratos curtos.", "Because of your age they prefer short deals.")]);
    if (mk > 1.07) why.push([1, tcT("El mercado de pilotos está caliente este año.", "O mercado de pilotos está aquecido este ano.", "The driver market is hot this year.")]);
    else if (mk < 0.97) why.push([-1, tcT("El mercado de pilotos está frío este año.", "O mercado de pilotos está frio este ano.", "The driver market is cold this year.")]);
    if (bf > 1.1) why.push([1, tcT("El equipo tiene presupuesto holgado.", "A equipe tem orçamento folgado.", "The team has a comfortable budget.")]);
    else if (bf < 0.92) why.push([-1, tcT("El equipo tiene el presupuesto justo.", "A equipe tem o orçamento apertado.", "The team has a tight budget.")]);
    return { P, sal, bn: P.bn * bon, wb: P.wb * bon, sig: P.sig, sigX, dy: P.dy, why, n, tt, form, yrs };
  }

  window.ctWhy = function () {
    if (!NC || !NC.why || !NC.why.length) return "";
    return `<div class="pn"><b>${tcT("Cómo armó el equipo tu oferta", "Como a equipe montou sua oferta", "How the team built your offer")}</b><ul style="margin:6px 0 0;padding-left:18px">${NC.why
      .map(([s, t]) => `<li style="margin:3px 0"><span style="color:${s > 0 ? "#128a4a" : s < 0 ? "#d3302f" : "inherit"}">${s > 0 ? "▲" : s < 0 ? "▼" : "•"}</span> ${t}</li>`)
      .join("")}</ul></div>`;
  };

  /* Etiqueta breve en la lista de ofertas */
  window.ctLabel = function (o) {
    try {
      const X = SERIES[o.se],
        L = X.teams,
        i = L.findIndex((t) => t[0] === o.n),
        tier = i < 0 ? 0.3 : 1 - i / Math.max(1, L.length - 1),
        P = ctProfile(o.n, o.se, tier),
        ob = typeof rep_ === "object" && rep_ && rep_.ob ? rep_.ob : null;
      let extra = "";
      if (o.tag === "Renovar contrato" && ob) {
        const n = (ob.okPos ? 1 : 0) + (ob.okW ? 1 : 0) + (ob.okP ? 1 : 0);
        extra = n >= 3 ? tcT(" ▲ mejoran tu sueldo", " ▲ melhoram seu salário", " ▲ pay raise") : n <= 1 ? tcT(" ▼ recortan tu sueldo", " ▼ cortam seu salário", " ▼ pay cut") : "";
      }
      return ` · ${tcT("Contrato", "Contrato", "Contract")}: ${L3(P.n)}${extra}`;
    } catch (e) {
      return "";
    }
  };

  /* Contrato principal: se personaliza una vez creado el contrato base */
  const _mk = mkContract;
  mkContract = function () {
    _mk();
    try {
      if (!NC || NC.pay || NC.pat === 0) return; // pagas por el asiento o condiciones ya pactadas en entrevista
      const se = S.series,
        L = SERIES[se].teams,
        i = Math.max(0, L.findIndex((t) => t[0] === S.team)),
        tier = 1 - i / Math.max(1, L.length - 1),
        o = typeof rep_ === "object" && rep_ && rep_.ob ? rep_.ob : null,
        renew = !!(o && o.t === S.team && o.s === se),
        M = ctMult(S.team, se, tier, renew),
        r = () => 0.92 + Math.random() * 0.16;
      NC.sal = Math.max(1, Math.round(NC.sal * M.sal * r()));
      NC.bn = Math.max(1, Math.round(NC.bn * M.bn * r()));
      NC.wb = Math.max(1, Math.round(NC.wb * M.wb * r()));
      NC.sig = Math.max(0, Math.round((NC.sig + NC.u * M.sigX) * M.sig * r()));
      const [lo, hi] = durR(),
        age = S.age || 25;
      NC.y = clp(NC.y + M.dy + (age <= 20 ? 1 : 0) - (age >= 34 ? 1 : 0), lo, hi);
      NC.pat = Math.min(NC.pat, M.P.pat);
      if (renew && M.n === 0) NC.pat = Math.min(NC.pat, 2);
      if (M.tt >= 2 && S.rep >= 70 && NC.y >= 2 && Math.random() < 0.4) {
        NC.cl = 1;
        M.why.push([1, tcT("Tus títulos te consiguen una cláusula de salida ya incluida.", "Seus títulos garantem uma cláusula de saída já incluída.", "Your titles earn you an exit clause already included.")]);
      }
      NC.why = M.why;
    } catch (e) {
      if (window.console) console.warn("contratos:", e);
    }
  };

  /* Ofertas de «Buscar equipos por mi cuenta»: mismas reglas sobre las condiciones base */
  if (typeof sxMk === "function") {
    const _sx = sxMk;
    sxMk = function (T) {
      T = _sx(T);
      try {
        if (!T.base || !T.n) return T;
        const o = typeof rep_ === "object" && rep_ && rep_.ob ? rep_.ob : null,
          M = ctMult(T.n, T.se, T.tier, !!(o && o.t === T.n && o.s === T.se));
        T.base.sal = Math.max(1, Math.round(T.base.sal * M.sal));
        T.base.bn = Math.max(1, Math.round(T.base.bn * M.bn));
        T.base.wb = Math.max(1, Math.round(T.base.wb * M.wb));
      } catch (e) {}
      return T;
    };
  }
})();
