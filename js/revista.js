
/* ===== The Pole Position: revista de noticias del paddock antes de cada temporada ===== */
(function () {
  const CW = { f1: 100, fe: 75, f2: 60, f3: 50, f4: 40 }, CG = { f1: 100, fe: 85, f2: 80, f3: 75, f4: 75 }, ORD = ["f1", "fe", "f2", "f3", "f4"];
  const TAG = { champ: "Campeonato", con: "Constructores", circ: "Calendario", xfer: "Fichaje", up: "Ascenso", ret: "Retiro", renew: "Renovación", prev: "Previa", back: "Regreso", deb: "Debut", stat: "Números", perf: "Balance", duel: "Duelo", tech: "Técnica", prom: "Promesa", hist: "Historia", fan: "Afición", eg: "Edición especial" };
  const esc = (t) => String(t).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const shuf = (a) => a.map((x) => [Math.random(), x]).sort((p, q) => p[0] - q[0]).map((x) => x[1]);
  const f4n = (id) => { const q = (typeof F4D !== "undefined" && F4D.find((x) => x.id === id)) || (typeof F4 !== "undefined" && F4.cur); return q ? q.n.replace(/^F4 /, "Fórmula 4 ") : "Fórmula 4"; };
  const lab = (k, id) => (k === "f4" ? f4n(id) : SERIES[k] ? SERIES[k].n : k);
  const col = (k) => (SERIES[k] ? SERIES[k].col : "#e10600");
  /* Rotación de variantes: no repite un texto hasta haber usado todos los demás (se recuerda en la partida) */
  const V = (id, arr) => {
    const u = (S._mgU = S._mgU || {}), p = u[id] || [], c = arr.map((_, i) => i).filter((i) => !p.includes(i)), i = pick(c.length ? c : arr.map((_, i) => i));
    u[id] = [i, ...p].slice(0, Math.max(1, arr.length - 1));
    return arr[i];
  };
  const fmtP = (p) => (p == null ? "" : p < 0.1 ? p.toFixed(3) : p < 1 ? p.toFixed(2) : p.toFixed(1));
  const EXTRA = {
    champ: ["En el paddock ya se habla de la defensa del título y de quién podrá arrebatárselo el próximo año.", "La temporada que viene promete: los rivales llegan con ganas de revancha.", "Los números de la temporada pasada ya son historia; ahora toca empezar de cero.", "El título pesa, pero en pretemporada todos vuelven a la casilla de salida."],
    con: ["Los equipos ya trabajan en el desarrollo del próximo auto para defender o arrebatar el título.", "En las fábricas no hay descanso: la próxima batalla se juega desde el invierno.", "El campeonato de constructores premia a todo el equipo, desde el muro hasta el último mecánico."],
    circ: ["Los equipos preparan paquetes específicos para esta cita, que suele marcar el pulso del campeonato.", "Los pilotos la tienen marcada en rojo desde el primer día de pretemporada.", "Cada vuelta de reconocimiento se estudia con lupa en el simulador."],
    xfer: ["Los directores de equipo confían en que el cambio rinda frutos desde las primeras carreras.", "El movimiento sacude el mercado y deja a más de un equipo mirando con atención.", "Adaptarse al nuevo auto será la clave de las primeras rondas."],
    up: ["Subir de categoría es el sueño de todo piloto joven, pero el nivel exigirá adaptarse rápido.", "Los ojos del paddock estarán puestos en cómo se desenvuelve en su nueva casa.", "El salto trae más velocidad, más presión y menos margen de error."],
    ret: ["El paddock despide a una figura que deja huella en la categoría.", "Su asiento ya tiene reemplazo, y la parrilla cambia de cara.", "Se va dejando un recuerdo difícil de igualar."],
    renew: ["El equipo apuesta por la continuidad y por una alineación que ya conoce el auto.", "Las dos partes se muestran satisfechas y miran con optimismo el próximo campeonato.", "La estabilidad suele ser el mejor aliado en un reglamento que no perdona."],
    prev: ["Será el equipo a batir según los pronósticos, aunque la pista siempre tiene la última palabra.", "Los rivales, por su parte, prometen dar pelea desde la primera ronda."],
    back: ["Su experiencia puede ser una pieza clave en una parrilla cada vez más joven."],
    deb: ["Llega sin presión, pero con ganas de dar la sorpresa desde el primer fin de semana."],
    stat: ["Los números no mienten, aunque la pista siempre tiene la última palabra."],
    perf: ["El próximo objetivo ya está en el horizonte y el equipo lo sabe."],
    duel: ["La pista dirá quién tiene la última palabra."],
  };
  /* Circuitos adicionales: una nota por circuito en la categoría cuyo calendario lo incluye */
  const CIRCS = [
    [/Gran Bretaña|Silverstone/, "Silverstone", ["Silverstone, el antiguo aeródromo donde nació el campeonato mundial de F1, recibe a {k} en la ronda {r} de {N}.", "La ronda {r} de {N} de {k} llega a Silverstone: curvas rápidas, público enorme y un clima que cambia en minutos."]],
    [/Bélgica|Spa/, "Spa", ["Spa-Francorchamps, con su mítica Eau Rouge, es la ronda {r} de {N} de {k}: un circuito largo donde el clima también corre.", "En Bélgica, la ronda {r} de {N} de {k} se corre en Spa, uno de los trazados más queridos por los pilotos."]],
    [/Italia|Monza/, "Monza", ["Monza, el templo de la velocidad, es la ronda {r} de {N} de {k}: rectas larguísimas y frenadas al límite.", "La ronda {r} de {N} de {k} se disputa en Monza, donde el rebufo vale tanto como el auto."]],
    [/Japón|Suzuka/, "Suzuka", ["Suzuka, el único circuito en forma de ocho del calendario, aparece en la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} en Suzuka exige ritmo y precisión en sus curvas en S."]],
    [/São Paulo|Interlagos/, "Interlagos", ["Interlagos, de sentido antihorario y clima caprichoso, es la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} llega a São Paulo, un circuito corto, bacheado y lleno de pasión."]],
    [/Singapur/, "Singapur", ["Singapur, una carrera nocturna entre muros y bajo humedad extrema, es la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} se corre de noche en Marina Bay, donde el calor castiga a pilotos y autos."]],
    [/Las Vegas/, "Las Vegas", ["Las Vegas, con su carrera nocturna junto a la Strip, es la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} promete espectáculo entre luces y rectas larguísimas en Las Vegas."]],
    [/Países Bajos|Zandvoort/, "Zandvoort", ["Zandvoort, con sus curvas peraltadas junto a las dunas, es la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} llega a los Países Bajos, un trazado angosto donde adelantar es un arte."]],
    [/Estados Unidos|Austin/, "Austin", ["Austin, con su curva 1 cuesta arriba, es la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} se corre en el Circuit of The Americas, un trazado que mezcla tramos de varios circuitos clásicos."]],
    [/Canadá|Montreal/, "Montreal", ["Montreal, con su célebre Muro de los Campeones, es la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} llega a Montreal, donde la frenada final y el muro castigan cualquier error."]],
    [/Abu Dhabi|Yas/, "Abu Dhabi", ["Abu Dhabi, con su cierre al atardecer, es la última parada de {k}: la ronda {r} de {N}.", "La ronda {r} de {N} de {k} se corre en Yas Marina, entre el crepúsculo y las luces."]],
    [/Miami/, "Miami", ["Miami, con un trazado alrededor de un estadio, es la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} llega a Miami, una cita con mucho show dentro y fuera de pista."]],
    [/Barcelona/, "Barcelona", ["Barcelona-Catalunya, banco de pruebas habitual de los equipos, es la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} se corre en Montmeló, un circuito que los equipos conocen de memoria."]],
    [/Bakú|Azerbaiyán/, "Bakú", ["Bakú, con su recta larguísima y su tramo estrecho junto a las murallas, es la ronda {r} de {N} de {k}.", "La ronda {r} de {N} de {k} llega a Bakú, donde la carrera se decide entre el rebufo y los muros."]],
  ];

  const where = (R0, n) => { for (const k in R0) for (const t in R0[k]) if (R0[k][t].includes(n)) return [k, t]; return null; };
  const AG = (n, k) => { try { return ageOf(n, k); } catch (e) { return null; } };
  const LVL = { f4: 1, f3: 2, f2: 3, fe: 4, f1: 5 };
  const rkT = (r) => (r === 1 ? "campeón" : r <= 3 ? "P" + r + ", en el podio final" : "P" + r);
  const MAJOR = ["up", "xfer", "deb", "con", "perf", "eg"];

  function stories() {
    const out = [], R0 = typeof RO !== "undefined" && RO ? RO : {}, me = S.name || "El piloto";
    const add = (k, kind, h, b, s, mine) => out.push({ k, kind, h, b, mine: !!mine, s: (CW[k] || 40) * (s || 1) + Math.random() * 5 });
    const addG = (k, kind, h, b, w) => out.push({ k, kind, h, b, mine: false, s: (CG[k] || 75) * (w || 0.6) + Math.random() * 8 });
    const cham = (S.cham || []).slice(-1)[0], prevC = (S.cham || []).slice(-2, -1)[0];
    const cats = ORD.filter((k) => SERIES[k] && R0[k]);
    const flat = (k) => { const o = []; for (const t in R0[k] || {}) (R0[k][t] || []).forEach((n) => n && o.push([n, t])); return o; };

    /* Campeones de la temporada anterior */
    if (cham) ORD.forEach((k) => {
      const c = cham[k]; if (!c || !SERIES[k]) return;
      const mine = c.d === S.name, w = mine ? null : where(R0, c.d), L = lab(k, cham.f4i);
      const tail = mine ? V("c.tm", [" El paddock ya especula con su próximo paso.", " Ahora todos quieren saber cómo lo celebrará."])
        : w ? (w[0] === k && w[1] ? ` El campeón correrá la próxima temporada con ${w[1]}.` : ` Su próximo destino: ${lab(w[0])}, con ${w[1]}.`)
        : " No volverá a la categoría el próximo año.";
      add(k, "champ", mine ? `${c.d} se corona campeón de ${L}` : V("c.h", [`${c.d}, campeón de ${L}`, `${c.d} se queda con el título en ${L}`, `Reinado de ${c.d} en ${L}`, `${c.d} es el nuevo rey de ${L}`, `Corona para ${c.d}: ${L} ya tiene campeón`, `${c.d} cierra el año de la mejor forma: campeón de ${L}`]),
        k === "f1" ? `${c.d} se llevó el campeonato de pilotos de ${L}.${tail}` : `${c.d} se llevó el campeonato de pilotos de ${L} y ${c.t} festejó el de constructores.${tail}`, mine ? 2.2 : 1.7, mine);
      if (k === "f1" && c.t) add(k, "con", V("c.con", [`${c.t}, campeón de constructores de ${L}`, `${c.t} se queda con el título de constructores`, `El campeonato de constructores es para ${c.t}`]), `${c.t} cerró la temporada como campeón del campeonato de constructores de ${L}, el que premia el trabajo conjunto de todo el equipo.`, 1.2);
      /* Rachas de títulos y cambios de era */
      const hs = (S.cham || []).map((z) => z && z[k] && z[k].d);
      let n = 0; for (let i = hs.length - 1; i >= 0 && hs[i] === c.d; i--) n++;
      if (n >= 2 && !mine) addG(k, "stat", V("c.st", [`${c.d} ya suma ${n} títulos seguidos en ${L}`, `Dinastía: ${c.d} encadena ${n} campeonatos en ${L}`, `${c.d} no suelta el trono de ${L}`]), `${c.d} llegó a ${n} campeonatos consecutivos en ${L}. ${V("c.st2", ["El resto de la parrilla busca la forma de frenarlo.", "Cada temporada que pasa, su leyenda crece.", "Los rivales ya miran sus datos para encontrar una grieta."])}`, 1.1);
      else if (prevC && prevC[k] && prevC[k].d !== c.d && !mine) addG(k, "hist", V("c.ne", [`Cambio de era en ${L}: ${c.d} destrona a ${prevC[k].d}`, `${c.d} le quita la corona a ${prevC[k].d}`]), `${prevC[k].d} había sido campeón de ${L} el año anterior, pero ${c.d} se quedó con el título esta vez.`, 0.9);
    });

    /* Calendario: Mónaco e Imola llevan foto, así que solo se mencionan si de verdad están en el calendario de la categoría */
    const CIRC = {};
    [["mc", /Mónaco|Monaco/], ["im", /Imola/]].forEach(([id, re]) => {
      const ks = ORD.filter((k) => typeof CAL !== "undefined" && CAL[k] && SERIES[k] && CAL[k].some((c) => re.test(c[0] + " " + c[1])));
      CIRC[id] = ks.includes(S.series) ? S.series : ks[0];
    });
    ORD.forEach((k) => {
      const C = typeof CAL !== "undefined" && CAL[k], X = SERIES[k]; if (!C || !X) return;
      const at = (re) => C.map((c, i) => (re.test(c[0] + " " + c[1]) ? i + 1 : 0)).filter(Boolean), N = C.length;
      const mc = CIRC.mc === k ? at(/Mónaco|Monaco/) : [], im = CIRC.im === k ? at(/Imola/) : [];
      if (mc.length) add(k, "circ", mc.length > 1 ? `Mónaco recibe dos citas en el calendario de ${lab(k)}` : V("m.h", [`Mónaco, la cita más glamorosa del calendario de ${lab(k)}`, `Mónaco, el circuito donde se gana en la clasificación (${lab(k)})`]),
        `${mc.length > 1 ? `Las rondas ${mc.join(" y ")} de ${N}` : `La ronda ${mc[0]} de ${N}`} de ${lab(k)} se corre en el Circuit de Monaco: un trazado urbano estrecho, sin margen de error, donde la clasificación pesa más que en cualquier otro circuito.`, 0.6);
      if (im.length) add(k, "circ", V("i.h", [`Imola, una de las ${N} paradas de la ${lab(k)}`, `Imola vuelve al calendario de ${lab(k)}`]),
        `La ronda ${im[0]} de ${N} de la ${lab(k)} se disputa en el Autodromo Enzo e Dino Ferrari, un circuito histórico de Emilia-Romagna, rápido y técnico, donde los jóvenes miden su ritmo.`, 0.9);
    });
    /* Otros circuitos: hasta tres notas por edición, repartidas entre categorías */
    shuf(CIRCS).slice(0, 5).map(([re, id, tx]) => {
      const ks = cats.filter((k) => typeof CAL !== "undefined" && CAL[k] && CAL[k].some((c) => re.test(c[0] + " " + c[1])));
      if (!ks.length) return null;
      const k = ks.includes(S.series) && Math.random() < 0.6 ? S.series : pick(ks), C = CAL[k], r = C.findIndex((c) => re.test(c[0] + " " + c[1])) + 1;
      return [k, id, V("ci." + id, tx).replace("{k}", lab(k)).replace("{r}", r).replace("{N}", C.length)];
    }).filter(Boolean).slice(0, 3).forEach(([k, id, b]) => addG(k, "circ", V("ci.h", [`${id}: una cita para tomar nota en ${lab(k)}`, `Previa: ${id} y sus secretos`, `${id}, una de las rondas clave de ${lab(k)}`]), b, 0.55));
    /* Inicio y cierre de temporada */
    shuf(cats).slice(0, 2).forEach((k) => {
      const C = CAL[k]; if (!C || C.length < 3) return;
      addG(k, "circ", V("cal.h", [`${lab(k)} arranca en ${C[0][1].split(" · ")[0]} y cierra en ${C[C.length - 1][1].split(" · ")[0]}`, `${C.length} citas en ${lab(k)}: así será el calendario`, `Calendario ${lab(k)}: ${C.length} rondas para decidirlo todo`]),
        `La temporada de ${lab(k)} tendrá ${C.length} rondas. ${V("cal.b", ["Se abre en " + C[0][1] + " y baja la bandera final en " + C[C.length - 1][1] + ".", "El primer fin de semana será en " + C[0][1] + " y la definición llegará en " + C[C.length - 1][1] + ".", "Todo empieza en " + C[0][1] + " y puede terminar de cualquier manera en " + C[C.length - 1][1] + "."])}`, 0.6);
    });

    /* Mercado: movimientos generados por turnover */
    const seen = new Set(), cnt = {}, rets = {};
    (S.news || []).forEach(([k, text]) => {
      if (!SERIES[k]) return;
      cnt[k] = (cnt[k] || 0) + 1;
      let m, tail = "", x = "", team = "";
      if ((m = text.match(/^(.+?) \((.+?) de (.+?)\) sube a (.+?) y ficha por (.+?)\.(.*)$/))) {
        x = m[1]; team = m[5]; tail = m[6]; seen.add(x);
        const how = m[2] === "campeón" ? `como campeón de ${m[3]}` : `en la posición ${m[2].replace("P", "")} de ${m[3]}`;
        add(k, "up", V("up.h", [`${x} da el salto a ${m[4]} con ${team}`, `${x} sube a ${m[4]}: ficha por ${team}`, `Ascenso para ${x}: ${team} lo espera en ${m[4]}`, `${team} suma a ${x}, que llega desde ${m[3]}`]), `Tras terminar ${how}, ${x} se gana un asiento en ${m[4]}. ${V("up.b", ["Lo recibe " + team + ".", "Será parte de " + team + " en la próxima temporada.", team + " le abre las puertas."])}`, 1.5);
      } else if ((m = text.match(/^(.+?) \((.+?)\) deja (.+?) y ficha por (.+?)\.(.*)$/))) {
        x = m[1]; team = m[4]; tail = m[5]; seen.add(x);
        add(k, "xfer", V("xf.h", [`${x} deja ${m[3]} y ficha por ${team}`, `Bombazo: ${x} es nuevo piloto de ${team}`, `${team} se queda con ${x}`, `${x} cambia de aires: ${team} es su nuevo hogar`, `Sorpresa en el mercado: ${x} se une a ${team}`]), `${x}, que cerró la temporada ${m[2] === "campeón" ? "como campeón" : "en " + m[2]}, cambia de equipo: sale de ${m[3]} y se une a ${team}.`, 1.3);
      } else if ((m = text.match(/^(.+?) (vuelve a|regresa a|debuta en) (.+?)\.(.*)$/))) {
        x = m[1]; team = m[3]; tail = m[4]; seen.add(x);
        const deb = m[2] === "debuta en";
        add(k, deb ? "deb" : "back", deb ? V("db.h", [`${x} debuta con ${team}`, `Nueva cara: ${x} llega a ${lab(k)}`, `${team} presenta a su novedad: ${x}`, `Estreno en ${lab(k)} para ${x}`]) : V("bk.h", [`${x} ${m[2]} ${team}`, `Vuelta a casa: ${x} ${m[2]} ${lab(k)}`, `${x} reaparece en la parrilla de ${lab(k)}`]), deb ? `Nuevo nombre en la parrilla: ${x} llega a ${lab(k)} de la mano de ${team}.` : `${x} ${m[2]} ${lab(k)} y se suma a ${team}.`, deb ? 0.7 : 0.9);
      }
      if ((m = tail.match(/ (.+?) (se retira|sale de la categoría) \((\d+) años(, campeón)?\)\./))) {
        const big = k === "f1" || k === "fe", ch = !!m[4]; rets[k] = (rets[k] || 0) + 1;
        add(k, "ret", big ? V("rt.h", [`${m[1]} se retira a los ${m[3]} años`, `Adiós a ${m[1]}: cuelga el casco a los ${m[3]}`, `${m[1]} dice basta tras ${m[3]} años de vida`]) : V("rs.h", [`${m[1]} deja ${lab(k)}`, `${m[1]} se despide de ${lab(k)}`, `Fin de etapa para ${m[1]} en ${lab(k)}`]), `${m[1]} (${m[3]} años${ch ? ", campeón" : ""}) pone fin a su etapa en ${lab(k)}.${x ? ` Su lugar lo ocupa ${x} en ${team}.` : ""}`, ch ? 1.9 : 1);
      } else if ((m = tail.match(/ (.+?) deja el equipo/))) {
        add(k, "xfer", V("dq.h", [`${m[1]} deja el equipo`, `${m[1]} se despide de su escudería`, `Cambio en el garaje: se va ${m[1]}`]), `${m[1]} no seguirá en su escudería actual. ${x ? `${x} ocupa su asiento en ${team}.` : ""}`, 0.8);
      }
    });
    Object.keys(cnt).forEach((k) => { if (cnt[k] >= 3 && Math.random() < 0.7) addG(k, "stat", V("mk.h", [`Mercado agitado: ${cnt[k]} movimientos en ${lab(k)}`, `${lab(k)} cambia de cara: ${cnt[k]} novedades en la parrilla`]), `${cnt[k]} pilotos cambiaron de equipo, llegaron o se despidieron en ${lab(k)} antes de esta temporada${rets[k] ? `, ${rets[k]} de ellos por retiro` : ""}. ${V("mk.b", ["La parrilla se renueva.", "Los equipos ajustan sus alineaciones.", "Habrá que seguir las caras nuevas."])}`, 0.8); });

    /* Renovaciones y previas (siempre hay material) */
    ORD.forEach((k) => {
      const X = SERIES[k], R1 = R0[k]; if (!X || !R1) return;
      const T = X.teams.slice().sort((a, b) => b[1] - a[1]);
      let n = 0;
      for (const [tn] of T.slice(0, 4)) {
        if (n >= 1 || (k === S.series && tn === S.team)) continue;
        const d = (R1[tn] || []).find((z) => z && !seen.has(z) && !(cham && Object.values(cham).some((c) => c && c.d === z)));
        if (d) { add(k, "renew", V("rn.h", [`${d} renueva con ${tn}`, `${tn} confía en ${d} para seguir`, `Continuidad en ${tn}: ${d} se queda`]), `${tn} confirma la continuidad de ${d} para la próxima temporada de ${lab(k)}.`, 0.7); n++; }
      }
      const top = T.find(([tn]) => !(k === S.series && tn === S.team)); if (!top) return;
      const ln = [...new Set((R1[top[0]] || []).filter(Boolean))];
      if (ln.length) add(k, "prev", V("pv.h", [`${top[0]}, el equipo a seguir en ${lab(k)}`, `${top[0]} llega con ventaja a ${lab(k)}`, `Previa de ${lab(k)}: todos miran a ${top[0]}`]), `Con ${ln.slice(0, 2).join(" y ")} al volante, ${top[0]} llega como referencia de la parrilla de ${lab(k)}.`, 0.5);
    });

    /* Notas de datos y color de cada categoría */
    const ageS = {};
    cats.forEach((k) => { const a = flat(k).map(([n, t]) => [n, t, AG(n, k)]).filter((z) => z[2] != null); if (a.length) ageS[k] = a; });
    shuf(Object.keys(ageS)).slice(0, 2).forEach((k) => {
      const a = ageS[k].slice().sort((p, q) => p[2] - q[2]), y = a[0], o = a[a.length - 1], av = Math.round((a.reduce((s, z) => s + z[2], 0) / a.length) * 10) / 10;
      addG(k, "stat", V("ag.y", [`${y[0]}, con ${y[2]} años, el más joven de ${lab(k)}`, `La juventud al poder: ${y[0]} (${y[2]}) abre paso en ${lab(k)}`]), `${y[0]} corre con ${y[1]} y, con ${y[2]} años, es el piloto más joven de la parrilla de ${lab(k)}. ${V("ag.yb", ["Todos le seguirán la pista.", "Tendrá que demostrar que está a la altura.", "Su desarrollo será una de las historias del año."])}`, 0.9);
      if (o[0] !== y[0]) addG(k, "stat", V("ag.o", [`${o[0]}, el veterano de ${lab(k)} con ${o[2]} años`, `Experiencia de sobra: ${o[0]} sigue en ${lab(k)}`]), `Con ${o[2]} años, ${o[0]} es el piloto de más edad de la parrilla de ${lab(k)}, que tiene un promedio de ${av} años. ${V("ag.ob", ["La experiencia pesa en los fines de semana difíciles.", "Su veteranía será clave en el desarrollo del equipo."])}`, 0.8);
    });
    shuf(cats).slice(0, 2).forEach((k) => {
      const T = SERIES[k].teams.slice().sort((a, b) => b[1] - a[1]), t = T[0], w = T[T.length - 1];
      addG(k, "tech", V("te.h", [`${t[0]} llega con el mejor auto de ${lab(k)}`, `${t[0]}, la referencia técnica de ${lab(k)}`, `Salto técnico: ${t[0]} marca el paso en ${lab(k)}`]), `Según los datos de pretemporada, ${t[0]} dispone del mejor paquete de ${lab(k)}. En el otro extremo, ${w[0]} parte con el auto más limitado y tendrá que compensarlo en pista.`, 0.8);
    });
    shuf(cats).slice(0, 2).forEach((k) => {
      const T = SERIES[k].teams.slice().sort((a, b) => b[1] - a[1]).slice(0, 5), t = pick(T), ln = [...new Set((R0[k][t[0]] || []).filter(Boolean))];
      if (ln.length >= 2) addG(k, "duel", V("du.h", [`${ln[0]} y ${ln[1]}, la dupla de ${t[0]}`, `${t[0]} apuesta por ${ln[0]} y ${ln[1]}`, `Dos pilotos, un solo auto: ${ln[0]} y ${ln[1]} en ${t[0]}`]), `${t[0]} alineará a ${ln[0]} y ${ln[1]} en ${lab(k)}. ${V("du.b", ["La convivencia interna será una de las claves del año.", "El primero que gane el duelo interno tendrá ventaja en el campeonato.", "Los dos saben que el compañero es el primer rival a vencer."])}`, 0.75);
    });
    ["f4", "f3"].forEach((k) => {
      const a = (ageS[k] || []).filter((z) => z[2] <= (k === "f4" ? 16 : 17)).sort((p, q) => p[2] - q[2])[0];
      if (a && Math.random() < 0.7) addG(k, "prom", V("pr.h", [`${a[0]}, la promesa de ${a[1]}`, `Jóvenes talentos: ${a[0]} (${a[2]}) llega con ganas`, `${a[0]}, ${a[2]} años y mucho que mostrar`]), `Con apenas ${a[2]} años, ${a[0]} defiende los colores de ${a[1]} en ${lab(k)}. ${V("pr.b", ["Los ojeadores ya tienen su nombre anotado.", "Si madura rápido, puede ser un nombre grande del futuro.", "Las academias miran su evolución con atención."])}`, 0.9);
    });
    {
      const k = pick(cats), f = flat(k);
      if (f.length) { const d = pick(f); addG(k, "fan", V("fa.h", [`Encuesta del paddock: ${d[0]} es el favorito de la afición`, `${d[0]} se gana el cariño del público en ${lab(k)}`, `Los aficionados eligen: ${d[0]}, el más querido de ${lab(k)}`]), `Una consulta entre aficionados de ${lab(k)} colocó a ${d[0]}, de ${d[1]}, como el piloto más querido de la parrilla. ${V("fa.b", ["Su carisma dentro y fuera de pista no pasa desapercibido.", "Las redes del equipo ya lo celebran.", "El apoyo de la tribuna será un empujón extra."])}`, 0.6); }
    }
    {
      const k = pick(["f1", "fe", "f2", "f3", "f4"]);
      const TX = {
        f1: ["Los nuevos reglamentos de motor y aerodinámica activa siguen marcando el desarrollo: quien los entienda primero tendrá ventaja.", "Los equipos grandes llegan con paquetes de actualización agresivos, mientras los pequeños confían en la fiabilidad."],
        fe: ["La Fórmula E vuelve a apostar por la gestión de energía y el Attack Mode: los números de la batería pesan tanto como la velocidad.", "Con carreras urbanas, rebufos y baterías al límite, cada vuelta es un cálculo."],
        f2: ["La F2 mantiene su receta: autos idénticos y una exigente carrera de neumáticos, ideal para mostrar quién merece el salto a la F1.", "Con chasis único, la diferencia la hacen el piloto y la estrategia."],
        f3: ["La F3 sigue siendo la gran vidriera de la nueva generación: autos iguales y carreras muy parejas.", "Con la parrilla tan apretada, un décimo en clasificación puede valer varias posiciones."],
        f4: ["La F4 es la puerta de entrada: monoplazas con halo, chasis monomarca y pilotos que arrancan desde los 15 años.", "Nada define tanto a un piloto joven como su primera temporada en F4: cada error enseña."],
      };
      addG(k, "tech", V("tx.h." + k, [`${lab(k)}: lo que hay que saber antes de arrancar`, `Guía de pretemporada de ${lab(k)}`, `${lab(k)}, bajo la lupa`]), pick(TX[k]), 0.6);
    }

    /* Tu historia: fichajes, ascensos, hitos y rivalidades (no solo los títulos) */
    mineStories(add, me);

    out.forEach((s) => { const e = EXTRA[s.kind]; s.x = e ? pick(e) : ""; if (fits(s).length) s.s += 12; });
    /* Variedad: no repetir el tipo de nota de la portada anterior y limitar cuántas hay de cada tipo */
    const lastK = (S._mgLast || []).slice(0, 3);
    out.forEach((s) => { if (!s.mine && lastK.includes(s.kind) && s.kind !== "champ") s.s *= 0.82; });
    out.sort((a, b) => b.s - a.s);
    const kc = {}; out.forEach((s) => { kc[s.kind] = (kc[s.kind] || 0) + 1; if (!s.mine && kc[s.kind] > (s.kind === "champ" ? 6 : 3)) s.s -= 70; });
    out.sort((a, b) => b.s - a.s);
    const cc = {}; out.forEach((s) => { cc[s.k] = (cc[s.k] || 0) + 1; if (!s.mine && cc[s.k] > 5) s.s -= 60; });
    out.sort((a, b) => b.s - a.s);
    /* Portada: siempre los campeones (el de la categoría más alta; el tuyo solo si sos campeón). Sin campeones (primera edición), a veces una nota importante tuya. */
    const ci = out.findIndex((s) => s.kind === "champ");
    if (ci > 0) out.unshift(out.splice(ci, 1)[0]);
    else if (ci < 0) { const big = out.filter((s) => s.mine && MAJOR.includes(s.kind))[0]; if (big && Math.random() < 0.5) { out.splice(out.indexOf(big), 1); out.unshift(big); } }
    /* Tus notas: máximo 2 entre las 7 primeras, pero siempre al menos una dentro de las 12 principales */
    let mc = 0;
    if (out.length > 9) {
      const top = out.slice(0, 7), rest = out.slice(7), keep = top.filter((s) => !(s.mine && ++mc > 2)), bump = top.filter((s) => !keep.includes(s));
      while (keep.length < 7 && rest.length) { const j = rest.findIndex((s) => !s.mine); keep.push(...rest.splice(j < 0 ? 0 : j, 1)); }
      rest.splice(2, 0, ...bump);
      out.splice(0, out.length, ...keep, ...rest);
    }
    if (out.length > 12 && !out.slice(0, 12).some((s) => s.mine)) { const j = out.findIndex((s) => s.mine); if (j > 11) out.splice(8, 0, out.splice(j, 1)[0]); }
    return out;
  }

  function mineStories(add, me) {
    const H = S.hist || [], L = H[H.length - 1], k = S.series, tm = S.team, X = lab(k), age = S.age, fa = S.fromFa;
    if (!k || !tm) return;
    if (!L) {
      if (fa && !S._mgEg) return;
      add(k, "deb", V("me.db", [`${me} debuta en ${X} con ${tm}`, `Nueva cara en la parrilla: ${me} arranca su carrera en ${X}`, `${me}, a los ${age} años, empieza su camino en ${X}`, `Estreno de ${me} en ${X}: ${tm} le da la oportunidad`]), `${me} se sube al auto de ${tm} para disputar su primera temporada en ${X}. ${V("me.dbb", ["Llega con ganas de dar la sorpresa.", "Todos los ojos estarán puestos en sus primeras carreras.", "El paddock quiere ver de qué es capaz."])}`, 1.5, true);
    } else {
      const same = L.s === k, up = LVL[k] > LVL[L.s], team = L.t !== tm;
      if (!same && up) add(k, "up", V("me.up", [`${me} da el salto a ${X} con ${tm}`, `Ascenso para ${me}: ${tm} lo espera en ${X}`, `${me} sube de categoría y ficha por ${tm}`, `${me} cumple un sueño: llega a ${X}`]), `Tras cerrar ${rkT(L.rank)} en ${lab(L.s, L.f4)} con ${L.t}, ${me} se gana un lugar en ${X} y se une a ${tm}. ${V("me.upb", ["El nivel será más alto, pero llega con confianza.", "Ahora comienza una etapa distinta, con más presión.", "El paddock espera ver si el salto le sienta bien."])}`, 1.6, true);
      else if (!same) add(k, "xfer", V("me.cat", [`${me} cambia de rumbo: ahora corre en ${X}`, `Giro inesperado: ${me} se pasa a ${X} con ${tm}`, `${me} se une a ${tm} y abre otra etapa en ${X}`]), `Después de ${rkT(L.rank)} en ${lab(L.s, L.f4)} con ${L.t}, ${me} cambia de categoría y correrá en ${X} con ${tm}. ${V("me.catb", ["Será un desafío nuevo.", "Un cambio de aire que puede reactivar su carrera."])}`, 1.5, true);
      else if (team) add(k, "xfer", V("me.tm", [`${me} deja ${L.t} y ficha por ${tm}`, `Bombazo: ${me} es nuevo piloto de ${tm}`, `${tm} se queda con ${me}`, `${me} cambia de equipo en ${X}`]), `${me}, que terminó ${rkT(L.rank)} en ${X} con ${L.t}, cambia de escudería y se une a ${tm}. ${V("me.tmb", ["Los equipos miraban de cerca su rendimiento.", "El mercado se mueve alrededor de su nombre.", "Tendrá que adaptarse rápido al nuevo auto."])}`, 1.5, true);
      else add(k, "renew", V("me.rn", [`${me} renueva con ${tm}`, `${tm} confía en ${me} para seguir`, `Continuidad para ${me} en ${tm}`]), `${tm} mantiene a ${me} para la próxima temporada de ${X}, tras cerrar ${rkT(L.rank)} el año pasado. ${V("me.rnb", ["Las dos partes están conformes.", "Conoce el auto y el equipo conoce su forma de trabajar."])}`, 1, true);
      if (L.rank > 1 && L.rank <= 3) add(L.s, "perf", V("me.pf", [`${me} cierra ${L.rank === 2 ? "segundo" : "tercero"} en ${lab(L.s, L.f4)}`, `Podio final para ${me} en ${lab(L.s, L.f4)}`, `${me}, a un paso del título en ${lab(L.s, L.f4)}`]), `${me} terminó P${L.rank} del campeonato de ${lab(L.s, L.f4)} con ${L.t}, con ${L.pts} puntos. ${V("me.pfb", ["El título quedó cerca, y la revancha está en marcha.", "Una temporada muy sólida que lo ubica entre los grandes.", "Su regularidad fue la clave."])}`, 0.9, true);
      if (L.cr === 1) add(L.s, "con", V("me.cn", [`${L.t} gana el título de constructores con ${me}`, `${me} y ${L.t}: campeones de constructores`]), `${L.t} se quedó con el campeonato de constructores de ${lab(L.s, L.f4)} y ${me} fue parte del logro.`, 1, true);
    }
    /* Hitos de carrera */
    const mm = (S._mgM = S._mgM || { w: 0, p: 0, l: 0 });
    [[S.wins || 0, "w", [1, 5, 10, 25, 50, 100], "victorias"], [S.pods || 0, "p", [1, 10, 25, 50, 100], "podios"], [S.poles || 0, "l", [1, 5, 10, 25], "poles"]].forEach(([v, key, ths, nm]) => {
      const t = ths.filter((x) => v >= x && mm[key] < x).pop(); mm[key] = v;
      if (t) add(k, "perf", V("me.ml", [`${me} alcanza ${t === 1 ? "su primera" : "las " + t} ${nm === "victorias" ? (t === 1 ? "victoria" : "victorias") : nm === "podios" ? (t === 1 ? "podio" : "podios") : t === 1 ? "pole" : "poles"} en su carrera`, `Un hito para ${me}: ${t} ${nm}`]), `${me} llega a ${t} ${nm} en su carrera, un número que ya lo sitúa entre los nombres que se recuerdan. ${V("me.mlb", ["Y todavía quiere más.", "El próximo objetivo ya está marcado.", "El equipo lo celebra."])}`, 1.1, true);
    });
    if (S.rival && Math.random() < 0.75) add(k, "duel", V("me.rv", [`${me} contra ${S.rival}: una rivalidad que crece`, `${S.rival} y ${me}, cara a cara otra vez`, `Rivalidad en ${X}: ${me} y ${S.rival}`]), `Las peleas en pista entre ${me} y ${S.rival} se repiten carrera tras carrera. ${V("me.rvb", ["El paddock ya lo llama el duelo del año.", "Ninguno de los dos piensa dar un paso atrás.", "La próxima temporada promete más chispas."])}`, 0.8, true);
  }

  /* ===== Portadas especiales: una piloto de la F1 Academy que logra fichar por F4, F3, F2 o F1 ===== */
  const EG = {
    f4: { c: "#2e9d57", kick: "De la F1 Academy a la F4", h: (n) => V("eg.f4h", [`${n} abre un nuevo camino: de la Academy a la F4`, `${n} da el primer paso fuera de la Academy: ya es piloto de F4`]), q: "Nadie me regaló nada. Ahora empieza lo que de verdad quería hacer.", lay: "a" },
    f3: { c: "#ff5a00", kick: "Un salto poco habitual", h: (n) => V("eg.f3h", [`${n} sorprende: de la F1 Academy directo a la Fórmula 3`, `Salto poco común: ${n} llega a la F3 desde la Academy`]), q: "Dicen que es casi imposible. Pues aquí estoy.", lay: "b" },
    f2: { c: "#2f7cf6", kick: "Casi imposible", h: (n) => V("eg.f2h", [`Casi imposible: ${n} llega a la Fórmula 2 desde la F1 Academy`, `${n} firma lo impensado: Fórmula 2 tras la Academy`]), q: "Cada puerta que me cerraron me enseñó a empujar la siguiente.", lay: "c" },
    f1: { c: "#e10600", kick: "Histórico", h: (n) => V("eg.f1h", [`HISTÓRICO: ${n} llega a la Fórmula 1 desde la F1 Academy`, `${n} lo logra: de la F1 Academy a la Fórmula 1`]), q: "Cuando empecé en la Academy, la F1 era un sueño lejano. Hoy es mi lugar de trabajo.", lay: "d" },
  };
  function egCover() {
    const f = S.fromFa; if (!f || S._mgEg || (S.hist || []).length) return "";
    const k = S.series, E = EG[k]; if (!E) return "";
    S._mgEg = 1;
    const me = S.name || "La piloto", n = f.n || 1, ps = fmtP(f.p);
    const who = f.champ ? `Campeona de la F1 Academy, ${me}` : me;
    const b1 = V("eg.b1", [
      `${who} dio el paso que muy pocas consiguen: tras ${n} ${n > 1 ? "temporadas" : "temporada"} en la F1 Academy, ${lab(k)} le abre sus puertas con ${S.team}.`,
      `${who} dejó atrás la F1 Academy después de ${n} ${n > 1 ? "temporadas" : "temporada"} y se une a ${S.team} en ${lab(k)}.`,
    ]) + (!f.champ && f.best ? ` Su mejor resultado en la Academy fue P${f.best}.` : "");
    const b2 = ps ? `Sus chances reales de llegar hasta acá eran de ${ps}%. ${V("eg.b2", ["Contra las estadísticas, lo hizo.", "El pronóstico no la detuvo.", "Los números decían que no."])}` : "";
    const b3 = S.sl ? `Además, suma ${S.sl} puntos para la Superlicencia de F1.` : "";
    const tl = `<div class="mgtl"><span>F1 Academy · ${n} ${n > 1 ? "temporadas" : "temporada"}</span><i>→</i><span style="background:${E.c};color:#fff">${esc(lab(k))} · ${esc(S.team)}</span></div>`;
    const quote = `<aside class="mgq">“${esc(E.q)}”<small>— ${esc(me)}</small></aside>`;
    const stat = ps ? `<div class="mgbig"><b>${esc(ps)}%</b><small>de chances de llegar a ${esc(lab(k))} desde la Academy</small></div>` : "";
    const tag = `<div class="mgt" style="--c:${E.c}"><span>Edición especial</span> ${esc(E.kick)}</div>`;
    const body = `<p>${esc(b1)} ${esc(b2)} ${esc(b3)}</p>`;
    const hd = `<h3>${esc(E.h(me))}</h3>`;
    const lay = {
      a: `${tag}${hd}<div class="mgeg-g">${body}${quote}</div>${tl}`,
      b: `${tag}${hd}<div class="mgeg-g">${stat || quote}${body}</div>${tl}`,
      c: `<div class="mgflash">ÚLTIMA HORA</div>${tag}${hd}${body}<div class="mgeg-g">${quote}${stat}</div>${tl}`,
      d: `<div class="mgflash">EDICIÓN ESPECIAL · HISTÓRICO</div>${hd}${body}<div class="mgeg-g">${stat}${quote}</div>${tl}`,
    }[E.lay];
    return `<article class="mgs cv mgeg ${E.lay}" data-k="${k}" style="--c:${E.c}">${lay}</article>`;
  }

  /* ===== Edición de despedida: se muestra al retirarte ===== */
  function retHtml(role) {
    const H = S.hist || []; if (!H.length) return "";
    const me = S.name || "El piloto", t = S.titles || {}, T = (t.f1 || 0) + (t.f2 || 0) + (t.f3 || 0) + (t.fe || 0) + (t.f4 || 0) + (t.fa || 0);
    const last = H[H.length - 1], first = H[0], yrs = Math.max(1, H.length);
    const cats = [...new Set(H.map((h) => lab(h.s, h.f4)))];
    const RL = { dir: "se queda en el muro: será director de equipo", com: "se pasa al micrófono como comentarista", own: "cumple otro sueño: comprar su propio equipo", "": "se despide sin más planes" };
    const h = T >= 3 ? V("rt.h3", [`Adiós a una leyenda: ${me} se retira con ${T} títulos`, `${me} cuelga el casco tras ${T} campeonatos`]) : T >= 1 ? V("rt.h2", [`${me} se retira como campeón`, `Fin de una era: ${me} dice adiós con el título en la vitrina`]) : S.wins > 0 ? V("rt.h1", [`${me} cuelga el casco tras ${S.wins} ${S.wins === 1 ? "victoria" : "victorias"}`, `${me} se despide de la pista`]) : V("rt.h0", [`${me} se despide de la pista`, `Fin del camino para ${me}`, `${me} pone punto final a su carrera`]);
    const b = `${me} se retira a los ${S.age} años después de ${yrs} ${yrs > 1 ? "temporadas" : "temporada"} y de pasar por ${cats.join(", ")}. ${T ? `Se va con ${T} ${T > 1 ? "títulos" : "título"}, ` : "Se va con "}${S.wins || 0} ${S.wins === 1 ? "victoria" : "victorias"} y ${S.pods || 0} ${S.pods === 1 ? "podio" : "podios"}. Su última temporada la cerró con ${last.t} en ${lab(last.s, last.f4)}, en la posición ${last.rank}. Tras colgar el casco, ${RL[role || ""] || RL[""]}.`;
    const rows = H.map((r) => `<tr><td>${r.y - 1}</td><td>${esc(lab(r.s, r.f4))}</td><td>${esc(r.t)}</td><td>${r.rank}</td></tr>`).join("");
    return `<div class="mg">${mast("Edición de despedida")}<article class="mgs cv mgeg d" data-k="${S.series}" style="--c:${col(S.series)}"><div class="mgflash">EDICIÓN DE DESPEDIDA</div><h3>${esc(h)}</h3><p>${esc(b)}</p><div class="mgeg-g" style="grid-template-columns:repeat(3,1fr)"><div class="mgbig"><b>${S.wins || 0}</b><small>victorias</small></div><div class="mgbig"><b>${S.pods || 0}</b><small>podios</small></div><div class="mgbig"><b>${T}</b><small>títulos</small></div></div></article><table class="mgtb"><tr><th>Año</th><th>Categoría</th><th>Equipo</th><th>Pos</th></tr>${rows}</table><button class="go" onclick="__mgEnd()" style="margin-top:16px">Ver mi legado →</button></div>`;
  }

  /* Imágenes de img/revista/: cada una declara categorías (k), tipos de noticia (kinds) y, si aplica, una palabra que debe aparecer en el texto (team / kw).
     Así la foto siempre coincide con lo que dice la nota. Máximo MAXI (3) imágenes por revista y 2 por categoría para no saturarla. */
  const ALLK = ["champ", "xfer", "up", "deb", "back", "prev", "renew", "ret"], MAXI = 3;
  const MI = [
    { u: "img/revista/1.jpg", k: ["f4"], kinds: ALLK, c: "Fórmula 4 en acción" },
    { u: "img/revista/2.jpg", k: ["f1"], kinds: ["xfer", "up", "deb", "back", "prev", "renew"], team: "Mercedes", pos: "50% 60%", c: "Mercedes en pista" },
    { u: "img/revista/3.jpg", k: ["f4"], kinds: ["circ"], kw: "Imola", c: "Imola, vista desde el aire" },
    { u: "img/revista/4.jpg", k: ["f1", "f2", "f3", "fe"], kinds: ["circ"], kw: "Mónaco", c: "Las tribunas de Montecarlo" },
    { u: "img/revista/5.jpg", k: ["f1"], kinds: ["champ"], fit: 1, c: "El trofeo del campeonato de pilotos" },
    { u: "img/revista/6.jpg", k: ["f1"], kinds: ["con"], fit: 1, c: "El trofeo del campeonato de constructores" },
  ];
  const txt = (s) => s.h + " " + s.b;
  const fits = (s) => MI.filter((m) => m.k.includes(s.k) && m.kinds.includes(s.kind) && (!m.team || txt(s).includes(m.team)) && (!m.kw || txt(s).includes(m.kw)));
  let USED = new Set(), IMG = new Map();
  const pickImg = (s) => {
    const c = fits(s).filter((m) => !USED.has(m.u)), sp = c.filter((m) => m.team || m.kw || m.fit), pl = sp.length ? sp : c;
    return pl.length ? pick(pl) : null;
  };
  /* Reparte las fotos entre las notas principales, de mayor a menor importancia: primero una por categoría (para que no sea todo F1) y luego completa hasta MAXI (máx. 2 por categoría) */
  const assign = (L) => {
    USED = new Set(); IMG = new Map(); const per = {};
    [1, 2].forEach((cap) => {
      for (const s of L) {
        if (IMG.size >= MAXI) return; if (IMG.has(s) || (per[s.k] || 0) >= cap) continue;
        const m = pickImg(s); if (!m) continue;
        USED.add(m.u); IMG.set(s, m); per[s.k] = (per[s.k] || 0) + 1;
      }
    });
  };
  const fig = (m) => `<figure class="mgfg"><img class="mgi${m.fit ? " ct" : ""}" src="${m.u}" alt="${esc(m.c)}" loading="lazy" data-f="${m.u.split("/").pop()}" data-i="0" ${m.pos ? `style="object-position:${m.pos}"` : ""} onerror="mgE(this)"><figcaption>${esc(m.c)}</figcaption></figure>`;
  /* Si las fotos no están en img/revista/, prueba otras carpetas comunes; si no aparece en ninguna, quita la foto sin romper la revista */
  window.mgE = (i) => { const F = ["img/revista/", "img/", "images/", "revista/", ""], n = +i.dataset.i + 1; if (n < F.length) { i.dataset.i = n; i.src = F[n] + i.dataset.f; } else if (i.parentNode) i.parentNode.remove(); };
  const tag = (s) => `<div class="mgt" style="--c:${col(s.k)}"><span>${TAG[s.kind]}</span> ${esc(lab(s.k, s.kind === "champ" ? ((S.cham || []).slice(-1)[0] || {}).f4i : undefined))}</div>`;
  const art = (s, cls) => `<article class="mgs ${cls || ""}" data-k="${s.k}">${IMG.get(s) ? fig(IMG.get(s)) : ""}${tag(s)}<h3>${esc(s.h)}</h3><p>${esc(s.b)}${cls === "cv" ? " " + esc(s.x) : ""}</p></article>`;
  const mast = (sub) => `<div class="mgm"><div class="mgr"><span>Nº ${S.season || 1}</span><span>Temporada ${S.year || ""}</span><span>El magazine del paddock</span></div><h1>The Pole Position</h1><div class="mgr b"><span>Noticias · Fichajes · Campeonatos</span><span>${esc(sub)}</span></div></div>`;

  function html() {
    const L = stories(); if (!L.length) return "";
    const eg = egCover(), cv = L[0], rest = eg ? L.filter((s) => !(s.mine && (s.kind === "deb" || s.kind === "up"))) : L.slice(1);
    const sec = (eg ? rest.slice(0, 2) : rest.slice(0, 2)), grid = (eg ? rest.slice(2, 11) : rest.slice(2, 11)), tick = (eg ? rest.slice(11, 19) : rest.slice(11, 19));
    assign([...(eg ? [] : [cv]), ...sec, ...grid]);
    S._mgLast = [eg ? "eg" : cv.kind, ...sec.map((s) => s.kind)];
    const cham = (S.cham || []).slice(-1)[0];
    const strip = cham ? ORD.filter((k) => cham[k] && SERIES[k]).map((k) => `<div style="--c:${col(k)}"><small>Campeón ${esc(lab(k, cham.f4i))}</small><b>${esc(cham[k].d)}</b></div>`).join("") : "";
    const chips = ["all", ...ORD].map((k) => `<button class="mgc" onclick="mgF('${k}',this)" ${k === "all" ? 'style="background:#14141a;color:#f4efe6"' : ""}>${k === "all" ? "Todas" : esc(SERIES[k] ? SERIES[k].n : k)}</button>`).join("");
    return `<div class="mg">
${mast(eg ? "Edición especial" : "Edición de pretemporada")}
${strip ? `<div class="mgcs">${strip}</div>` : ""}
<div class="mgf">${chips}</div>
${eg || art(cv, "cv")}
<div class="mgg2">${sec.map((s) => art(s)).join("")}</div>
${grid.length ? `<div class="mgg3">${grid.map((s) => art(s)).join("")}</div>` : ""}
${tick.length ? `<div class="mgk"><b>Última hora</b>${tick.map((s) => `<span data-k="${s.k}">${esc(s.h)}</span>`).join("")}</div>` : ""}
<button class="go" onclick="__mgGo()" style="margin-top:16px">Empezar la temporada →</button></div>`;
  }

  const st = document.createElement("style");
  st.textContent = `.mg{background:#f4efe6;color:#14141a;border-radius:6px;padding:18px 16px 16px;box-shadow:0 8px 30px #0006;font-family:Georgia,"Times New Roman",serif}
.mg *{box-sizing:border-box}
.mgm{text-align:center;border-top:4px solid #14141a;border-bottom:1px solid #14141a;padding:6px 0 4px;margin-bottom:12px}
.mgm h1{font:800 clamp(28px,7.2vw,54px)/1 Formula1,"Barlow Condensed",Impact,sans-serif;text-transform:uppercase;letter-spacing:.02em;margin:6px 0;color:#14141a}
.mgr{display:flex;justify-content:space-between;gap:8px;font:600 10px Inter,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;border-bottom:1px solid #14141a;padding-bottom:4px}
.mgr.b{border:0;border-top:1px solid #14141a;padding:4px 0 0}
.mgcs{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:6px;margin-bottom:10px}
.mgcs div{border-left:4px solid var(--c);background:#ebe5d8;padding:5px 8px}.mgcs small{display:block;font:700 9px Inter,Arial,sans-serif;letter-spacing:.1em;text-transform:uppercase;color:#555}.mgcs b{font:700 14px Formula1,Impact,sans-serif}
.mgf{display:flex;gap:6px;overflow-x:auto;margin:6px 0 12px;scrollbar-width:none}.mgf::-webkit-scrollbar{display:none}
.mgc{flex:none;border:1px solid #14141a;background:transparent;color:#14141a;border-radius:99px;padding:5px 12px;font:700 11px Inter,Arial,sans-serif;cursor:pointer}
.mgt{font:700 10px Inter,Arial,sans-serif;letter-spacing:.14em;text-transform:uppercase;color:#14141a;margin-bottom:4px;display:flex;gap:8px;align-items:center}.mgt span{background:var(--c);color:#fff;padding:2px 7px;border-radius:2px;text-shadow:0 1px 2px #0008}
.mgfg{margin:0 0 8px}.mgfg figcaption{font:italic 11px Georgia,serif;color:#6b665a;margin-top:3px}.mgi.ct{object-fit:contain;background:#0e0e12}
.mgi{width:100%;aspect-ratio:16/9;object-fit:cover;display:block;margin:0 0 8px;border-radius:2px;background:#d9d2c3}.mgs.cv .mgi{aspect-ratio:21/9;max-height:320px}.mgs.cv .mgfg{margin-bottom:10px}
.mgs h3{font:800 20px/1.12 Formula1,"Barlow Condensed",Impact,sans-serif;margin:2px 0 6px;color:#14141a;text-transform:none}
.mgs p{font-size:14.5px;line-height:1.5;margin:0;color:#2a2a30}
.mgs.cv{border-bottom:3px double #14141a;padding-bottom:14px;margin-bottom:14px}
.mgs.cv h3{font-size:clamp(28px,6.5vw,46px);line-height:1.02}
.mgs.cv p{font-size:16px;column-gap:24px}@media(min-width:700px){.mgs.cv p{column-count:2}}
.mgs.cv p:first-line{font-variant:small-caps;letter-spacing:.05em;font-weight:700}
.mgg2,.mgg3{display:grid;gap:16px;margin-bottom:14px}.mgg2{grid-template-columns:1fr}.mgg3{grid-template-columns:1fr}
@media(min-width:700px){.mgg2{grid-template-columns:1fr 1fr}.mgg3{grid-template-columns:repeat(3,1fr)}.mgg2 .mgs+.mgs{border-left:1px solid #bdb6a6;padding-left:16px}}
.mgg2 .mgs,.mgg3 .mgs{border-top:3px solid var(--c,#14141a);padding-top:8px}
.mgg3 .mgs h3{font-size:16px}.mgg3 .mgs p{font-size:13.5px}
.mgk{display:flex;flex-wrap:wrap;gap:6px 18px;background:#14141a;color:#f4efe6;padding:8px 12px;font:600 12px Inter,Arial,sans-serif;border-radius:3px}.mgk b{color:#ff4a43;text-transform:uppercase;letter-spacing:.12em}
.mgeg{position:relative;padding:14px 14px 16px!important;border:2px solid var(--c);background:#fffaf0}
.mgeg.cv p{column-count:1!important}
.mgeg-g{display:grid;gap:14px;margin:12px 0}@media(min-width:700px){.mgeg-g{grid-template-columns:1fr 1fr;align-items:center}}
.mgq{border-left:5px solid var(--c);padding:6px 12px;font:italic 18px/1.35 Georgia,serif;color:#14141a}.mgq small{display:block;font:700 11px Inter,Arial,sans-serif;font-style:normal;letter-spacing:.1em;text-transform:uppercase;margin-top:6px;color:#555}
.mgbig{text-align:center;background:var(--c);color:#fff;padding:14px 10px;border-radius:3px}.mgbig b{display:block;font:800 clamp(34px,8vw,56px)/1 Formula1,Impact,sans-serif}.mgbig small{display:block;font:600 11px Inter,Arial,sans-serif;letter-spacing:.06em;text-transform:uppercase;margin-top:4px}
.mgtl{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font:700 11px Inter,Arial,sans-serif;text-transform:uppercase;letter-spacing:.08em}.mgtl span{background:#14141a;color:#f4efe6;padding:5px 10px;border-radius:3px}.mgtl i{font-style:normal;font-size:16px}
.mgflash{display:inline-block;background:var(--c);color:#fff;font:800 11px Inter,Arial,sans-serif;letter-spacing:.2em;padding:4px 10px;margin-bottom:8px;border-radius:2px}
.mgeg.b{border-style:dashed;border-width:3px}
.mgeg.c{background:#14141a;color:#f4efe6}.mgeg.c h3,.mgeg.c p,.mgeg.c .mgq,.mgeg.c .mgt{color:#f4efe6}.mgeg.c .mgq small{color:#bbb}
.mgeg.d{background:#0e0e12;border:4px double #d4af37;color:#f4efe6}.mgeg.d h3{color:#d4af37;text-transform:uppercase;letter-spacing:.01em}.mgeg.d p,.mgeg.d .mgq{color:#f4efe6}.mgeg.d .mgq{border-left-color:#d4af37}.mgeg.d .mgq small{color:#bbb}.mgeg.d .mgbig{background:#d4af37;color:#14141a}.mgeg.d .mgflash{background:#d4af37;color:#14141a}.mgeg.d .mgtl span{background:#f4efe6;color:#14141a}
.mg .mgtb{width:100%;border-collapse:collapse;font:13px Inter,Arial,sans-serif;margin-top:10px;background:transparent}.mg .mgtb tr,.mg .mgtb td{background:transparent!important;color:#14141a!important}.mg .mgtb th{background:#e6dfd0!important}.mgtb th,.mgtb td{border-bottom:1px solid #bdb6a6;padding:6px 8px;text-align:left}.mgtb th{font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:#555}`;
  document.head.appendChild(st);

  window.mgF = (k, b) => {
    document.querySelectorAll(".mgc").forEach((x) => { x.style.background = "transparent"; x.style.color = "#14141a"; });
    b.style.background = "#14141a"; b.style.color = "#f4efe6";
    document.querySelectorAll(".mg [data-k]").forEach((e) => (e.style.display = k === "all" || e.dataset.k === k ? "" : "none"));
  };
  const _p = window.preseason;
  window.preseason = function () {
    try {
      if (S && S.series && S._mg !== S.season && typeof RO !== "undefined") {
        S._mg = S.season;
        const h = html();
        if (h) { window.__mgGo = () => _p.call(window); R_(h); window.scrollTo(0, 0); return; }
      }
    } catch (e) { console.warn("Revista", e); }
    return _p.apply(this, arguments);
  };
  /* Al retirarte sale una edición de despedida antes de tu legado */
  const _e = window.end;
  window.end = function (r) {
    try {
      if (S && S.series && !S._mgRet) {
        S._mgRet = 1;
        const h = retHtml(r);
        if (h) { const a = arguments, self = this; window.__mgEnd = () => _e.apply(self, a); R_(h); window.scrollTo(0, 0); return; }
      }
    } catch (e) { console.warn("Revista", e); }
    return _e.apply(this, arguments);
  };
})();

