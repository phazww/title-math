(function () {
  const D = window.DRIVERS.slice().sort((a, b) => b.pts - a.pts || b.wins - a.wins);
  const R = window.RACES, P = window.POINTS;
  const LEFT = R.length, MAXG = P[0] * LEFT;
  const by = Object.fromEntries(D.map((d) => [d.code, d]));
  const leader = D[0];
  const SIM_ROWS = D.slice(0, 8);
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const last = (d) => d.name.split(" ").slice(1).join(" ") || d.name;
  const rank = (d) => D.indexOf(d) + 1;
  const ord = (n) => n + (n % 100 >= 11 && n % 100 <= 13 ? "th" : ["th", "st", "nd", "rd"][n % 10] || "th");
  const per = (n) => (n / LEFT).toFixed(1);
  const dot = (d) => `<span class="dot" style="background:${d.color}"></span>`;
  const races = (n) => (n === 1 ? "1 race" : n + " races");
  const maxOf = (d) => d.pts + MAXG;
  const alive = (d) => maxOf(d) >= leader.pts;

  function track(name) {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "title-math/" + name, title: name, event: true }); } catch (e) {}
  }

  // ---------- state in the URL ----------
  let sel = by.VER ? "VER" : D[1].code;
  const sim = {};
  SIM_ROWS.forEach((d) => (sim[d.code] = new Array(LEFT).fill(0)));
  const enc = (v) => (v === 0 ? "-" : v === 10 ? "x" : String(v));
  const dec = (c) => (c === "x" ? 10 : c >= "1" && c <= "9" ? +c : 0);

  function readHash() {
    const h = new URLSearchParams(location.hash.slice(1));
    if (by[h.get("d")]) sel = h.get("d");
    (h.get("s") || "").split("_").forEach((part) => {
      const [code, cells] = part.split(".");
      if (sim[code] && cells) sim[code] = sim[code].map((_, i) => dec(cells[i] || "-"));
    });
  }
  function writeHash() {
    const used = SIM_ROWS.filter((d) => sim[d.code].some(Boolean)).map((d) => d.code + "." + sim[d.code].map(enc).join(""));
    const h = new URLSearchParams();
    h.set("d", sel);
    if (used.length) h.set("s", used.join("_"));
    history.replaceState(null, "", "#" + h.toString());
  }

  // ---------- header ----------
  $("stamp").textContent = `After the ${window.AFTER} · updated ${window.UPDATED}`;
  $("lede").textContent = `${races(LEFT)} to go, ${MAXG} points still on the table. Pick a driver to see the gap, what he has to do, and whether the maths still works.`;
  $("foot-data").textContent = `Standings after the ${window.AFTER}. No sprint weekends remain, so a race is worth ${P[0]} points at most. Updated ${window.UPDATED}.`;

  // ---------- driver picker ----------
  function renderChips() {
    const rest = D.slice(8);
    $("chips").innerHTML =
      D.slice(0, 8).map((d) => `<button class="chip-btn" data-code="${d.code}" aria-pressed="${d.code === sel}">${dot(d)}${esc(last(d))}</button>`).join("") +
      `<select id="more" aria-label="Other drivers"><option value="">Other drivers</option>${rest.map((d) => `<option value="${d.code}"${d.code === sel ? " selected" : ""}>${esc(d.name)}</option>`).join("")}</select>`;
    $("chips").querySelectorAll(".chip-btn").forEach((b) => b.addEventListener("click", () => pick(b.dataset.code)));
    $("more").addEventListener("change", (e) => e.target.value && pick(e.target.value));
  }
  function pick(code) { sel = code; track("pick"); renderChips(); renderCard(); renderSim(); writeHash(); }

  // ---------- "what he needs" card ----------
  function renderCard() {
    const x = by[sel], r = rank(x), mx = maxOf(x);
    const gap = leader.pts - x.pts;
    let tag, verdict, explain = "";

    if (x === leader) {
      const threat = D.slice(1).reduce((a, b) => (maxOf(b) > maxOf(a) ? b : a));
      const need = maxOf(threat) - x.pts + 1;
      tag = `<span class="tag lead">Leader</span>`;
      if (need <= 0) {
        verdict = `${esc(x.name)} is champion. Nobody can reach ${x.pts} points any more.`;
      } else {
        verdict = `${esc(last(x))} needs ${need} more points to be champion no matter what anyone else does.`;
        explain = `That is ${per(need)} per race over ${races(LEFT)}. The number comes from ${esc(threat.name)}, who can still reach ${maxOf(threat)} by winning everything. With ${need - 1} it could end level on points and go to wins.`;
      }
    } else if (mx < leader.pts) {
      tag = `<span class="tag out">Out of the title fight</span>`;
      verdict = `${esc(last(x))} cannot win the title.`;
      explain = `Winning all ${races(LEFT)} would give ${mx} points, and ${esc(leader.name)} already has ${leader.pts}.`;
    } else {
      const leaderNeeds = mx - leader.pts + 1;
      tag = `<span class="tag alive">Alive on paper</span>`;
      verdict = `${esc(last(x))} must outscore ${esc(last(leader))} by ${gap + 1} points over ${races(LEFT)}.`;
      explain = `That is ${per(gap + 1)} points per race. Even if ${esc(last(x))} wins every race and reaches ${mx}, ${esc(last(leader))} is still champion with ${leaderNeeds} more ${leaderNeeds === 1 ? "point" : "points"}, which is ${per(leaderNeeds)} per race.`;
    }

    const ahead = D.slice(Math.max(0, r - 4), r - 1);
    const behind = D.slice(r, r + 2);
    const rivalRow = (d, isAhead) => {
      const g = Math.abs(d.pts - x.pts);
      let note;
      if (isAhead) note = g + 1 > MAXG ? `out of reach` : `to pass him: outscore by ${g + 1}, or ${per(g + 1)} per race`;
      else note = g === 0 ? `level on points` : `can pass ${esc(last(x))} by outscoring him by ${g + 1}`;
      return `<li>${dot(d)}<div><strong>${ord(rank(d))} · ${esc(d.name)}</strong><div class="note">${note}</div></div><span class="gap ${isAhead ? "behind" : "ahead"}">${isAhead ? "−" : "+"}${g}</span></li>`;
    };

    $("card").innerHTML = `
      <div class="who"><span class="bar" style="background:${x.color}"></span><div><div class="name">${esc(x.name)}</div><div class="meta">${esc(x.team)} · ${x.wins} ${x.wins === 1 ? "win" : "wins"} this season</div></div></div>
      <div class="stats">
        <div class="stat"><div class="k">Position</div><div class="v">${ord(r)}</div></div>
        <div class="stat"><div class="k">Points</div><div class="v">${x.pts}</div></div>
        <div class="stat"><div class="k">${x === leader ? "Lead" : "Behind leader"}</div><div class="v">${x === leader ? leader.pts - D[1].pts : gap}</div></div>
        <div class="stat"><div class="k">Max possible</div><div class="v">${mx}</div></div>
      </div>
      <p class="verdict">${tag}${verdict}</p>
      <p class="explain">${explain}</p>
      ${ahead.length || behind.length ? `<h3>The fight around ${esc(last(x))}</h3><ul class="rivals">${ahead.map((d) => rivalRow(d, true)).join("")}${behind.map((d) => rivalRow(d, false)).join("")}</ul>` : ""}`;
    $("headline").textContent = `What does ${last(x)} need?`;
    document.title = `What does ${last(x)} need? Title Math, 2026 F1 season`;
  }

  // ---------- when can the title be decided ----------
  function posFor(maxScore) {
    if (maxScore < P[P.length - 1]) return "outside the points";
    const i = P.findIndex((p) => p <= maxScore);
    return `${ord(i + 1)} or lower`;
  }
  function renderClinch() {
    const next = R[0];
    const base = P[0] * (LEFT - 1); // points still available after the next race
    const rivals = D.slice(1).filter(alive);
    if (!rivals.length) {
      $("clinch-title").textContent = "It is over";
      $("clinch-sub").textContent = `${leader.name} is champion.`;
      $("clinch-table").innerHTML = "";
      return;
    }
    const rows = rivals.map((d) => {
      const lead = leader.pts - d.pts;
      const k = lead - base; // rival stays alive only if he outscores the leader by at least k
      let cond;
      if (k <= -P[0]) cond = `Stays alive whatever happens in ${next.place}`;
      else if (k < 0) cond = `Must not lose more than ${-k} ${-k === 1 ? "point" : "points"} to ${last(leader)}`;
      else if (k === 0) cond = `Must score at least as many points as ${last(leader)}`;
      else cond = `Must outscore ${last(leader)} by ${k} or more`;
      return { d, lead, k, cond, need: base - lead + 1 };
    });
    const possible = rows.every((r) => r.need <= P[0]);
    $("clinch-title").textContent = possible ? `It can be over in ${next.place}` : `It cannot be over in ${next.place}`;
    $("clinch-sub").textContent = possible
      ? `After ${next.place} (${next.date}) there are ${base} points left. ${leader.name} is champion that day if every driver below fails his condition.`
      : `After ${next.place} (${next.date}) there are still ${base} points left, too many for ${last(leader)} to be safe yet.`;
    $("clinch-table").innerHTML =
      `<thead><tr><th>Driver</th><th class="num">Behind</th><th>To stay in the title fight after ${esc(next.place)}</th></tr></thead><tbody>` +
      rows.map((r) => `<tr><td class="drv">${dot(r.d)}${esc(r.d.name)}</td><td class="num">${r.lead}</td><td>${esc(r.cond)}</td></tr>`).join("") + `</tbody>`;
    if (possible) {
      const second = P[1];
      const parts = rows.filter((r) => P[0] - r.need < second).map((r) => `${last(r.d)} finishes ${posFor(P[0] - r.need)}`);
      $("clinch-example").textContent = `Simplest way: ${last(leader)} wins${parts.length ? " and " + parts.join(", ") : ""}.`;
    } else $("clinch-example").textContent = "";
  }

  // ---------- scenario builder ----------
  const gain = (code) => sim[code].reduce((s, v) => s + (v ? P[v - 1] : 0), 0);
  const simWins = (code) => sim[code].filter((v) => v === 1).length;

  function renderSim() {
    const opts = (v) => `<option value="0"${v === 0 ? " selected" : ""}>–</option>` + P.map((_, i) => `<option value="${i + 1}"${v === i + 1 ? " selected" : ""}>P${i + 1}</option>`).join("");
    $("sim-table").innerHTML =
      `<thead><tr><th>Driver</th>${R.map((r) => `<th title="${esc(r.name)}, ${esc(r.date)}">${r.code}</th>`).join("")}<th class="num">Now</th><th class="num">Final</th><th></th></tr></thead><tbody>` +
      SIM_ROWS.map((d) => `<tr class="${d.code === sel ? "sel" : ""}"><td class="drv">${dot(d)}${esc(last(d))}</td>${sim[d.code].map((v, i) => `<td><select data-code="${d.code}" data-race="${i}" aria-label="${esc(d.name)}, ${esc(R[i].name)}">${opts(v)}</select></td>`).join("")}<td class="num">${d.pts}</td><td class="num total" id="tot-${d.code}"></td><td><button class="mini" data-win="${d.code}">wins all</button></td></tr>`).join("") + `</tbody>`;
    $("sim-table").querySelectorAll("select").forEach((s) => s.addEventListener("change", () => {
      sim[s.dataset.code][+s.dataset.race] = +s.value;
      track("sim-change"); updateSim(); writeHash();
    }));
    $("sim-table").querySelectorAll("[data-win]").forEach((b) => b.addEventListener("click", () => {
      const code = b.dataset.win;
      SIM_ROWS.forEach((d) => { if (d.code !== code) sim[d.code] = sim[d.code].map((v) => (v === 1 ? 0 : v)); });
      sim[code] = new Array(LEFT).fill(1);
      track("wins-all"); renderSim(); writeHash();
    }));
    updateSim();
  }

  function updateSim() {
    // flag two drivers given the same finishing position in one race
    let dups = 0;
    const selects = [...$("sim-table").querySelectorAll("select")];
    selects.forEach((s) => s.classList.remove("dup"));
    R.forEach((_, i) => {
      const seen = {};
      SIM_ROWS.forEach((d) => { const v = sim[d.code][i]; if (v) (seen[v] = seen[v] || []).push(d.code); });
      Object.values(seen).filter((a) => a.length > 1).forEach((a) => a.forEach((code) => {
        dups++; selects.find((s) => s.dataset.code === code && +s.dataset.race === i).classList.add("dup");
      }));
    });
    $("sim-msg").textContent = dups ? "Two drivers share a finishing position in the races marked in red." : "";

    SIM_ROWS.forEach((d) => { $("tot-" + d.code).textContent = d.pts + gain(d.code); });
    const proj = D.map((d) => ({ d, pts: d.pts + (sim[d.code] ? gain(d.code) : 0), wins: d.wins + (sim[d.code] ? simWins(d.code) : 0) }))
      .sort((a, b) => b.pts - a.pts || b.wins - a.wins).slice(0, 8);
    const touched = SIM_ROWS.some((d) => sim[d.code].some(Boolean));
    $("proj-table").innerHTML =
      `<thead><tr><th>Pos</th><th>Driver</th><th class="num">Points</th><th class="num">Gained</th><th class="num hide-s">Wins</th></tr></thead><tbody>` +
      proj.map((p, i) => `<tr class="${p.d.code === sel ? "sel" : ""}"><td>${i + 1}</td><td class="drv">${dot(p.d)}${esc(p.d.name)}${i === 0 && touched ? " 🏆" : ""}</td><td class="num total">${p.pts}</td><td class="num delta">${p.pts - p.d.pts ? "+" + (p.pts - p.d.pts) : ""}</td><td class="num hide-s">${p.wins}</td></tr>`).join("") + `</tbody>`;
  }

  $("reset").addEventListener("click", () => { SIM_ROWS.forEach((d) => (sim[d.code] = new Array(LEFT).fill(0))); renderSim(); writeHash(); });
  $("share").addEventListener("click", async () => {
    writeHash(); track("share");
    const btn = $("share"), label = btn.textContent;
    try { await navigator.clipboard.writeText(location.href); btn.textContent = "Link copied"; }
    catch (e) { btn.textContent = "Copy the address bar"; }
    setTimeout(() => (btn.textContent = label), 1800);
  });

  // ---------- who is still alive ----------
  function renderAlive() {
    const n = D.filter(alive).length;
    $("alive-sub").textContent = `${n} of ${D.length} drivers can still reach ${leader.name}'s ${leader.pts} points. Everyone else is mathematically out.`;
    $("alive-table").innerHTML =
      `<thead><tr><th>Pos</th><th>Driver</th><th class="hide-s">Team</th><th class="num">Points</th><th class="num">Max</th><th>Title</th></tr></thead><tbody>` +
      D.map((d, i) => `<tr><td>${i + 1}</td><td class="drv">${dot(d)}${esc(d.name)}</td><td class="hide-s">${esc(d.team)}</td><td class="num">${d.pts}</td><td class="num">${maxOf(d)}</td><td>${d === leader ? "Leader" : alive(d) ? "Alive" : `<span class="out">Out</span>`}</td></tr>`).join("") + `</tbody>`;
  }

  readHash();
  renderChips(); renderCard(); renderClinch(); renderSim(); renderAlive();
  // opening a shared link while the page is already open
  window.addEventListener("hashchange", () => {
    SIM_ROWS.forEach((d) => (sim[d.code] = new Array(LEFT).fill(0)));
    readHash(); renderChips(); renderCard(); renderSim();
  });
})();
