(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const NEWS = window.NEWS || [];
  const paintArt = (root) => $$("[data-art]", root).forEach((el) => {
    if (!el.firstChild) el.innerHTML = window.art(el.dataset.art, +el.dataset.seed || 1);
  });
  const PUBS = window.PUBS || [];

  // ---------- ticker ----------
  const track = $("#ticker-track");
  if (track && NEWS.length) {
    const tag = { conf: "Conference", jour: "Journal", mile: "Milestone", talk: "Talk", serv: "Service" };
    const items = NEWS.map((n) =>
      `<span class="ticker-item"><span class="tag">${tag[n.kind]} · ${n.when}</span>${esc(n.title)}</span>`).join("");
    track.innerHTML = items + items; // duplicated for a seamless loop
    track.parentElement.closest(".ticker").style.setProperty("--ticker-duration", NEWS.length * 9 + "s");
  }

  // ---------- news cards ----------
  const newsList = $("#news-list");
  if (newsList) {
    const badge = { conf: ["b-conf", "Conference"], jour: ["b-jour", "Journal"], mile: ["b-mile", "Milestone"], talk: ["b-talk", "Talk"], serv: ["b-serv", "Service"] };
    newsList.innerHTML = NEWS.slice(0, 6).map((n) => `
      <article class="card news reveal k-${n.kind}">
        <div class="when"><span class="badge ${badge[n.kind][0]}">${badge[n.kind][1]}</span>${n.when}</div>
        <h3>${esc(n.title)}</h3>
      </article>`).join("");
    if (NEWS.length > 6) {
      newsList.insertAdjacentHTML("afterend", `<div class="more-wrap"><button class="btn btn-ghost" id="more-news" type="button">Show all ${NEWS.length} updates <i class="fa-solid fa-chevron-down"></i></button></div>`);
      $("#more-news").addEventListener("click", (e) => {
        newsList.insertAdjacentHTML("beforeend", NEWS.slice(6).map((n) => `
          <article class="card news in k-${n.kind}">
            <div class="when"><span class="badge ${badge[n.kind][0]}">${badge[n.kind][1]}</span>${n.when}</div>
            <h3>${esc(n.title)}</h3>
          </article>`).join(""));
        e.currentTarget.parentElement.remove();
      });
    }
  }

  // ---------- stats ----------
  const counts = {
    all: PUBS.length,
    peer: PUBS.filter((p) => ["journal", "conference", "chapter"].includes(p.type)).length
  };
  ["journal", "conference", "chapter", "review", "thesis"].forEach((t) => (counts[t] = PUBS.filter((p) => p.type === t).length));
  $$("[data-count]").forEach((el) => {
    const k = el.dataset.count;
    if (counts[k] !== undefined) el.dataset.target = counts[k];
  });

  const animateNum = (el) => {
    const target = +el.dataset.target || 0;
    const suffix = el.dataset.suffix || "";
    const t0 = performance.now();
    const step = (t) => {
      const p = Math.min(1, (t - t0) / 1100);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // ---------- publications ----------
  const list = $("#pub-list");
  const search = $("#pub-search");
  let filter = "all";
  let area = "all";

  // research areas (first-level filter)
  const AREAS = [
    ["green", "Green web", "fa-solid fa-leaf"],
    ["access", "Accessibility", "fa-solid fa-universal-access"],
    ["data", "Data spaces & datasets", "fa-solid fa-diagram-project"],
    ["nlp", "Language & NLP", "fa-solid fa-language"],
    ["geo", "Earth observation", "fa-solid fa-satellite"],
    ["health", "Health & bio", "fa-solid fa-heart-pulse"],
    ["vision", "Vision & OCR", "fa-solid fa-eye"],
    ["sports", "Sports analytics", "fa-solid fa-baseball-bat-ball"],
    ["sys", "Systems & verification", "fa-solid fa-microchip"],
    ["ml", "Applied ML", "fa-solid fa-brain"]
  ];
  PUBS.forEach((p) => (p.area = topicOf(p)));
  const areaBox = $("#pub-areas");
  if (areaBox) {
    const chip = (k, label, icon, n) => `
      <button class="area a-${k}${k === "all" ? " active" : ""}" data-area="${k}" type="button" aria-pressed="${k === "all"}">
        <span class="area-ic"><i class="${icon}"></i></span><span class="area-txt">${label}</span><span class="area-n">${n}</span>
      </button>`;
    areaBox.innerHTML = chip("all", "All areas", "fa-solid fa-layer-group", PUBS.length) +
      AREAS.map(([k, label, icon]) => [k, label, icon, PUBS.filter((p) => p.area === k).length])
        .filter((a) => a[3]).sort((a, b) => b[3] - a[3]).map((a) => chip(...a)).join("");
    areaBox.addEventListener("click", (e) => {
      const b = e.target.closest(".area");
      if (!b) return;
      area = b.dataset.area;
      $$(".area", areaBox).forEach((x) => { x.classList.toggle("active", x === b); x.setAttribute("aria-pressed", x === b); });
      renderPubs();
    });
  }

  $$(".tab[data-filter]").forEach((t) => t.insertAdjacentHTML("beforeend", ` <span class="count"></span>`));
  const updateTabCounts = () => $$(".tab[data-filter]").forEach((t) => {
    const k = t.dataset.filter;
    const n = PUBS.filter((p) => (area === "all" || p.area === area) && (k === "all" || p.type === k)).length;
    $(".count", t).textContent = n;
    t.classList.toggle("empty-tab", !n);
  });

  const typeLabel = { journal: ["Journal", "b-jour"], conference: ["Conference", "b-conf"], chapter: ["Book chapter", "b-talk"], review: ["Under review", "b-serv"], thesis: ["Thesis", "b-mile"] };
  const meRe = /(Muhammad Sohaib Ayub|M\. S\. Ayub)/g;

  function renderPubs() {
    updateTabCounts();
    const q = (search.value || "").trim().toLowerCase();
    const rows = PUBS.filter((p) =>
      (area === "all" || p.area === area) &&
      (filter === "all" || p.type === filter) &&
      (!q || (p.title + " " + p.authors + " " + p.venue + " " + p.year).toLowerCase().includes(q)));

    if (!rows.length) {
      list.innerHTML = `<div class="card empty">No publications match these filters${q ? ` and “${esc(q)}”` : ""}.</div>`;
      return;
    }
    const years = [...new Set(rows.map((p) => p.year))].sort((a, b) => b - a);
    list.innerHTML = years.map((y) => `
      <div class="pub-year">
        <div class="yr">${y}</div>
        <div class="pub-items">
          ${rows.filter((p) => p.year === y).map((p) => {
            const title = p.url ? `<a href="${p.url}" target="_blank" rel="noopener">${esc(p.title)}</a>` : esc(p.title);
            const links = [
              p.url ? `<a class="pill" href="${p.url}" target="_blank" rel="noopener"><i class="fa-solid fa-arrow-up-right-from-square"></i>Link</a>` : "",
              p.pdf ? `<a class="pill" href="${encodeURI(p.pdf)}" target="_blank" rel="noopener"><i class="fa-regular fa-file-pdf"></i>PDF</a>` : "",
              `<button class="pill cite" data-i="${PUBS.indexOf(p)}" type="button"><i class="fa-solid fa-quote-right"></i>Cite</button>`
            ].join("");
            const [lbl, cls] = typeLabel[p.type];
            const rank = p.rank ? `<span class="rank" title="${p.rank.startsWith("Q") ? "JCR quartile" : "CORE conference rank"}">${p.rank}</span>` : "";
            return `
            <article class="card pub spot t-${p.type}${p.featured ? " featured" : ""}">
              <div class="thumb" data-art="${topicOf(p)}" data-seed="${PUBS.indexOf(p) + 3}"></div>
              <div class="pub-body">
              <h3>${title} ${rank}</h3>
              <div class="authors">${esc(p.authors).replace(meRe, "<b>$1</b>")}</div>
              <div class="meta">
                <span class="type-chip ${cls}">${lbl}</span>
                <span class="venue">${esc(p.venue)}</span>
                ${links ? `<span class="links">${links}</span>` : ""}
              </div>
              </div>
            </article>`;
          }).join("")}
        </div>
      </div>`).join("");
    paintArt(list);
  }

  function bibtex(p) {
    const first = p.authors.split(",")[0].trim().split(" ").pop().toLowerCase();
    const word = p.title.split(/\W+/).find((w) => w.length > 3).toLowerCase();
    const kind = { journal: "article", conference: "inproceedings", chapter: "incollection", thesis: "phdthesis", review: "misc" }[p.type];
    const field = { journal: "journal", conference: "booktitle", chapter: "booktitle", thesis: "school", review: "note" }[p.type];
    return `@${kind}{${first}${p.year}${word},
  title = {${p.title}},
  author = {${p.authors.split(",").map((a) => a.trim()).join(" and ")}},
  ${field} = {${p.venue}},
  year = {${p.year}}
}`;
  }

  const toast = $("#toast");
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast.t);
    showToast.t = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  if (list) {
    list.addEventListener("click", async (e) => {
      const btn = e.target.closest(".cite");
      if (!btn) return;
      const text = bibtex(PUBS[+btn.dataset.i]);
      try { await navigator.clipboard.writeText(text); showToast("BibTeX copied to clipboard"); }
      catch { window.prompt("Copy BibTeX:", text); }
    });
    $$(".tab[data-filter]").forEach((t) => t.addEventListener("click", () => {
      $$(".tab[data-filter]").forEach((x) => x.classList.toggle("active", x === t));
      filter = t.dataset.filter;
      renderPubs();
    }));
    search.addEventListener("input", renderPubs);
    renderPubs();
  }

  // ---------- workshop deadlines ----------
  $$(".ws-due[data-deadline]").forEach((el) => {
    const days = Math.ceil((new Date(el.dataset.deadline + "T23:59:59-12:00") - Date.now()) / 864e5);
    el.innerHTML = days > 0
      ? `<span class="pulse"></span><b>${days}</b> days to submit · ${esc(el.dataset.label.replace("Papers due ", ""))}`
      : `<i class="fa-regular fa-calendar-check"></i> ${esc(el.dataset.label.replace("Papers due", "Submissions closed"))}`;
  });

  // ---------- hero network graphic ----------
  const svg = $("#hero-net");
  if (svg) {
    let seed = 7;
    const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const W = 1200, H = 640, pts = [];
    for (let i = 0; i < 46; i++) pts.push([rnd() * W, rnd() * H, 1.5 + rnd() * 2.5]);
    let lines = "";
    pts.forEach((a, i) => pts.slice(i + 1).forEach((b) => {
      const d = Math.hypot(a[0] - b[0], a[1] - b[1]);
      if (d < 170) lines += `<line x1="${a[0] | 0}" y1="${a[1] | 0}" x2="${b[0] | 0}" y2="${b[1] | 0}" stroke-opacity="${(1 - d / 170) * 0.5}"/>`;
    }));
    const dots = pts.map((p) => `<circle cx="${p[0] | 0}" cy="${p[1] | 0}" r="${p[2].toFixed(1)}"/>`).join("");
    svg.innerHTML = `<g stroke="#8fb3dc" stroke-width="1">${lines}</g><g fill="#7aa6d6">${dots}</g>`;
  }

  // ---------- nav ----------
  const menuBtn = $(".menu-btn"), links = $(".nav-links");
  menuBtn.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  $$(".nav-links a").forEach((a) => a.addEventListener("click", () => links.classList.remove("open")));

  const sections = $$("main section[id]");
  const navMap = Object.fromEntries($$(".nav-links a[href^='#']").map((a) => [a.getAttribute("href").slice(1), a]));
  const toTop = $(".to-top");
  const onScroll = () => {
    const y = window.scrollY + 140;
    let cur = null;
    sections.forEach((s) => { if (s.offsetTop <= y) cur = s.id; });
    Object.entries(navMap).forEach(([id, a]) => a.classList.toggle("active", id === cur));
    toTop.classList.toggle("show", window.scrollY > 700);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  paintArt(document);

  // ---------- scroll progress ----------
  const bar = $("#progress-bar");
  const onProgress = () => {
    const h = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${h > 0 ? scrollY / h : 0})`;
  };
  addEventListener("scroll", onProgress, { passive: true });
  onProgress();

  // ---------- spotlight cards ----------
  document.addEventListener("pointermove", (e) => {
    const c = e.target.closest && e.target.closest(".spot");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  });

  // ---------- command palette ----------
  const pal = $("#palette"), palQ = $("#palette-q"), palR = $("#palette-results");
  const index = [
    ...$$("main section[id]").map((s) => ({ icon: "fa-solid fa-hashtag", label: $("h2", s) ? $("h2", s).textContent : s.id, hint: "Section", href: "#" + s.id })),
    ...PUBS.map((p) => ({ icon: "fa-regular fa-file-lines", label: p.title, hint: p.venue + " · " + p.year, href: p.url || (p.pdf && encodeURI(p.pdf)) || "#publications", pub: p.title })),
    ...$$(".courses li").map((li) => ({ icon: "fa-solid fa-chalkboard", label: li.textContent.replace(/\s+/g, " ").trim(), hint: "Teaching", href: "#teaching" })),
    { icon: "fa-regular fa-file-pdf", label: "Download CV", hint: "PDF", href: "data/Sohaib_Ayub_CV.pdf" },
    { icon: "fa-regular fa-envelope", label: "Email Sohaib", hint: "Contact", href: "mailto:muhammadsohaib.ayub@universityofgalway.ie" },
    ...$$(".profiles a").map((a) => ({ icon: "fa-solid fa-arrow-up-right-from-square", label: a.title, hint: "Profile", href: a.href }))
  ];
  let sel = 0, shown = [];
  const drawPalette = () => {
    const q = palQ.value.trim().toLowerCase();
    const words = q.split(/\s+/).filter(Boolean);
    shown = index.filter((it) => words.every((w) => (it.label + " " + it.hint).toLowerCase().includes(w))).slice(0, 9);
    sel = Math.min(sel, Math.max(0, shown.length - 1));
    palR.innerHTML = shown.length ? shown.map((it, i) => `
      <li role="option" aria-selected="${i === sel}" class="${i === sel ? "sel" : ""}" data-i="${i}">
        <i class="${it.icon}"></i><span><b>${esc(it.label)}</b><small>${esc(it.hint)}</small></span><kbd>↵</kbd></li>`).join("")
      : `<li class="none">Nothing found for “${esc(q)}”</li>`;
  };
  const go = (it) => {
    if (!it) return;
    closePalette();
    if (it.pub && it.href === "#publications") {
      search.value = it.pub; renderPubs();
      location.hash = "publications";
    } else if (it.href.startsWith("#")) location.hash = it.href.slice(1);
    else window.open(it.href, it.href.startsWith("mailto:") ? "_self" : "_blank", "noopener");
  };
  const openPalette = () => { pal.hidden = false; palQ.value = ""; sel = 0; drawPalette(); palQ.focus(); document.body.style.overflow = "hidden"; };
  const closePalette = () => { pal.hidden = true; document.body.style.overflow = ""; };
  $("#open-palette").addEventListener("click", openPalette);
  pal.addEventListener("click", (e) => {
    if (e.target === pal) return closePalette();
    const li = e.target.closest("li[data-i]");
    if (li) go(shown[+li.dataset.i]);
  });
  palQ.addEventListener("input", () => { sel = 0; drawPalette(); });
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); pal.hidden ? openPalette() : closePalette(); return; }
    if (e.key === "/" && pal.hidden && !/input|textarea/i.test(document.activeElement.tagName)) { e.preventDefault(); openPalette(); return; }
    if (pal.hidden) return;
    if (e.key === "Escape") closePalette();
    else if (e.key === "ArrowDown") { sel = (sel + 1) % shown.length; drawPalette(); e.preventDefault(); }
    else if (e.key === "ArrowUp") { sel = (sel - 1 + shown.length) % shown.length; drawPalette(); e.preventDefault(); }
    else if (e.key === "Enter") go(shown[sel]);
  });

  // ---------- reveal on scroll ----------
  const io = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    $$("[data-target]", e.target).forEach(animateNum);
    if (e.target.dataset.target) animateNum(e.target);
    io.unobserve(e.target);
  }), { threshold: 0.12 });
  $$(".reveal, .stats-grid").forEach((el) => io.observe(el));

  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
