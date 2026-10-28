// Generative, lightly animated SVG illustrations for research topics.
// art(topic, seed) -> SVG markup (viewBox 0 0 400 240).
(function () {
  const PAL = {
    green:  ["#0e8a7e", "#35b9a5", "#d9f3ee", "#ecfaf6"],
    access: ["#0b5cad", "#3b8be0", "#dbe9f9", "#eef5fd"],
    data:   ["#5a3fb8", "#8f74e6", "#e6e0fb", "#f3f0fe"],
    nlp:    ["#c2410c", "#ee7a45", "#fde3d6", "#fff3ec"],
    sports: ["#4d7c0f", "#84b53a", "#e5f2d3", "#f4faea"],
    health: ["#be185d", "#e85b97", "#fbdbe8", "#fef0f6"],
    vision: ["#0369a1", "#38a9dc", "#d7eefa", "#eef8fd"],
    sys:    ["#334155", "#64748b", "#e2e8f0", "#f5f7fa"],
    geo:    ["#15803d", "#c07a12", "#dff1e3", "#f3faf4"],
    ml:     ["#7c3aed", "#0b5cad", "#e9e2fd", "#f5f2ff"],
    manu:   ["#003399", "#b07a2a", "#e6ebf7", "#faf6ee"]
  };

  function rng(seed) {
    let s = (seed * 9301 + 49297) % 233280 || 1;
    return () => (s = (s * 16807) % 2147483647) / 2147483647;
  }

  let uid = 0;

  const motifs = {
    manu(p, r) {
      // manuscript leaves whose verse lines write themselves in, linked by poems in transit
      const pages = [[22, 24, -6], [150, 76, 3], [276, 18, -3]];
      const links = [[0, 1], [1, 2], [0, 2]];
      const centre = (i) => [pages[i][0] + 46, pages[i][1] + 67];
      let edges = "";
      links.forEach(([a, b], k) => {
        const [x1, y1] = centre(a), [x2, y2] = centre(b);
        const mx = (x1 + x2) / 2, my = Math.min(y1, y2) - 34 + k * 40;
        const d = `M${x1} ${y1} Q${mx} ${my} ${x2} ${y2}`;
        edges += `<path d="${d}" fill="none" stroke="${p[1]}" stroke-width="2" stroke-dasharray="5 6" opacity=".7">
          <animate attributeName="stroke-dashoffset" values="0;-44" dur="${2 + k * .5}s" repeatCount="indefinite"/></path>
          <circle r="4.5" fill="${p[0]}"><animateMotion dur="${3.2 + k * .7}s" begin="${k * .9}s" repeatCount="indefinite" path="${d}"/></circle>`;
      });
      const leaves = pages.map(([x, y, rot], i) => {
        let lines = "";
        for (let l = 0; l < 6; l++) {
          const w = 34 + r() * 22;
          lines += `<rect x="12" y="${22 + l * 13}" width="${w}" height="3" rx="1.5" fill="${l % 3 ? p[0] : p[1]}" opacity="${l % 3 ? .45 : .75}">
            <animate attributeName="width" values="0;${w.toFixed(0)};${w.toFixed(0)}" keyTimes="0;.45;1" dur="${5 + i}s" begin="${i * .6 + l * .25}s" repeatCount="indefinite"/></rect>`;
        }
        return `<g transform="translate(${x} ${y}) rotate(${rot} 46 67) scale(1.2)">
          <rect width="76" height="112" rx="4" fill="#fffdf8" stroke="${p[2]}" stroke-width="2"/>
          <rect x="8" y="8" width="60" height="96" rx="2" fill="none" stroke="${p[1]}" stroke-opacity=".25"/>
          <text x="12" y="17" font-family="Georgia,serif" font-size="11" font-style="italic" fill="${p[1]}">${["Sonnet", "Elegy", "Song"][i]}</text>
          ${lines}</g>`;
      }).join("");
      return edges + leaves;
    },
    green(p, r) {
      // energy gauge + leaf + rising/falling bars
      let bars = "";
      for (let i = 0; i < 9; i++) {
        const h = 30 + r() * 80;
        bars += `<rect x="${30 + i * 20}" y="${210 - h}" width="12" height="${h}" rx="3" fill="${p[1]}" opacity="${0.35 + i * 0.06}">
          <animate attributeName="height" values="${h};${h * 0.55};${h}" dur="${3 + r() * 2}s" repeatCount="indefinite"/>
          <animate attributeName="y" values="${210 - h};${210 - h * 0.55};${210 - h}" dur="${3 + r() * 2}s" repeatCount="indefinite"/></rect>`;
      }
      return `${bars}
        <g transform="translate(290 120)">
          <circle r="62" fill="#fff" stroke="${p[2]}" stroke-width="10"/>
          <path d="M-46 0 A46 46 0 0 1 46 0" fill="none" stroke="${p[0]}" stroke-width="8" stroke-linecap="round" stroke-dasharray="145" stroke-dashoffset="60">
            <animate attributeName="stroke-dashoffset" values="120;30;120" dur="5s" repeatCount="indefinite"/></path>
          <line x1="0" y1="0" x2="0" y2="-38" stroke="${p[0]}" stroke-width="4" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" values="-70;40;-70" dur="5s" repeatCount="indefinite"/></line>
          <circle r="6" fill="${p[0]}"/>
          <path d="M-10 28 C -10 12, 10 8, 18 10 C 16 24, 6 34, -10 28 Z" fill="${p[1]}"/>
        </g>`;
    },
    access(p, r) {
      return `
        <g transform="translate(200 120)">
          ${[0, 1, 2].map((i) => `<circle r="40" fill="none" stroke="${p[1]}" stroke-width="2" opacity=".6">
            <animate attributeName="r" values="40;110" dur="3.6s" begin="${i * 1.2}s" repeatCount="indefinite"/>
            <animate attributeName="opacity" values=".6;0" dur="3.6s" begin="${i * 1.2}s" repeatCount="indefinite"/></circle>`).join("")}
          <circle r="46" fill="${p[0]}"/>
          <circle cy="-24" r="7" fill="#fff"/>
          <path d="M-24 -12 L24 -12 M0 -12 L0 10 M0 10 L-12 32 M0 10 L12 32" stroke="#fff" stroke-width="6" stroke-linecap="round" fill="none"/>
        </g>
        <g fill="#fff" stroke="${p[2]}" stroke-width="2">
          <rect x="24" y="30" width="96" height="60" rx="8"/><rect x="280" y="150" width="96" height="60" rx="8"/>
        </g>
        <g fill="${p[1]}" opacity=".7">
          <rect x="36" y="44" width="56" height="7" rx="3"/><rect x="36" y="58" width="72" height="7" rx="3"/><rect x="36" y="72" width="40" height="7" rx="3"/>
          <rect x="292" y="164" width="60" height="7" rx="3"/><rect x="292" y="178" width="72" height="7" rx="3"/>
        </g>
        <path d="M100 68 l8 8 l16 -18" stroke="${p[0]}" stroke-width="4" fill="none" stroke-linecap="round" stroke-dasharray="40" stroke-dashoffset="40">
          <animate attributeName="stroke-dashoffset" values="40;0;0;40" dur="4s" repeatCount="indefinite"/></path>`;
    },
    data(p, r) {
      const n = [];
      for (let i = 0; i < 7; i++) {
        const a = (i / 7) * Math.PI * 2;
        n.push([200 + Math.cos(a) * 120, 120 + Math.sin(a) * 78]);
      }
      const links = n.map(([x, y], i) => `<line x1="200" y1="120" x2="${x}" y2="${y}" stroke="${p[1]}" stroke-width="2" stroke-dasharray="4 6">
        <animate attributeName="stroke-dashoffset" values="0;-40" dur="${1.5 + r()}s" repeatCount="indefinite"/></line>`).join("");
      const ring = n.map(([x, y], i) => { const [x2, y2] = n[(i + 1) % n.length]; return `<line x1="${x}" y1="${y}" x2="${x2}" y2="${y2}" stroke="${p[2]}" stroke-width="2"/>`; }).join("");
      const nodes = n.map(([x, y], i) => `<g transform="translate(${x} ${y})"><rect x="-17" y="-13" width="34" height="26" rx="6" fill="#fff" stroke="${p[1]}" stroke-width="2"/>
        <rect x="-9" y="-5" width="18" height="3" rx="1.5" fill="${p[1]}"/><rect x="-9" y="2" width="12" height="3" rx="1.5" fill="${p[2]}"/></g>`).join("");
      return `${ring}${links}${nodes}
        <circle cx="200" cy="120" r="26" fill="${p[0]}"><animate attributeName="r" values="24;29;24" dur="3s" repeatCount="indefinite"/></circle>
        <path d="M190 120 l7 7 l13 -14" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    },
    nlp(p, r) {
      const glyphs = ["ا", "ب", "ع", "ق", "س", "ن", "م", "ک", "A", "ٹ"];
      let lines = "";
      for (let i = 0; i < 5; i++) {
        const w = 110 + r() * 140;
        lines += `<rect x="${370 - w}" y="${38 + i * 34}" width="${w}" height="12" rx="6" fill="${i % 2 ? p[2] : p[1]}" opacity="${i % 2 ? 1 : .55}">
          <animate attributeName="width" values="0;${w};${w}" keyTimes="0;.4;1" dur="${4 + i * .3}s" repeatCount="indefinite"/>
          <animate attributeName="x" values="370;${370 - w};${370 - w}" keyTimes="0;.4;1" dur="${4 + i * .3}s" repeatCount="indefinite"/></rect>`;
      }
      let g = "";
      for (let i = 0; i < 6; i++) {
        g += `<text x="${36 + (i % 3) * 40}" y="${80 + Math.floor(i / 3) * 70}" font-size="38" font-family="serif" fill="${p[0]}" opacity=".85">${glyphs[Math.floor(r() * glyphs.length)]}
          <animate attributeName="opacity" values=".2;.9;.2" dur="${2.5 + r() * 2}s" repeatCount="indefinite"/></text>`;
      }
      return g + lines;
    },
    sports(p, r) {
      let pts = [];
      for (let i = 0; i <= 10; i++) pts.push([30 + i * 34, 190 - (i * 9 + r() * 50)]);
      const d = "M" + pts.map((q) => q.map((v) => v.toFixed(0)).join(" ")).join(" L");
      return `
        <ellipse cx="200" cy="130" rx="180" ry="95" fill="none" stroke="${p[2]}" stroke-width="3"/>
        <rect x="186" y="80" width="28" height="100" rx="4" fill="${p[2]}"/>
        <path d="${d}" fill="none" stroke="${p[0]}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="600" stroke-dashoffset="600">
          <animate attributeName="stroke-dashoffset" values="600;0;0" keyTimes="0;.6;1" dur="5s" repeatCount="indefinite"/></path>
        ${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="4" fill="#fff" stroke="${p[0]}" stroke-width="2"/>`).join("")}
        <circle r="10" fill="#b91c1c"><animateMotion dur="5s" repeatCount="indefinite" path="${d}"/></circle>`;
    },
    health(p, r) {
      const d = "M0 120 L80 120 L95 120 L105 80 L118 170 L132 60 L146 140 L156 120 L240 120 L255 120 L265 85 L278 165 L292 70 L306 135 L316 120 L400 120";
      return `
        ${[60, 100, 140, 180].map((y) => `<line x1="0" y1="${y}" x2="400" y2="${y}" stroke="${p[2]}" stroke-width="1"/>`).join("")}
        <path d="${d}" fill="none" stroke="${p[0]}" stroke-width="4" stroke-linejoin="round" stroke-dasharray="900" stroke-dashoffset="900">
          <animate attributeName="stroke-dashoffset" values="900;0" dur="3.2s" repeatCount="indefinite"/></path>
        <g transform="translate(340 46)"><path d="M0 8 C -14 -8, -30 8, 0 30 C 30 8, 14 -8, 0 8 Z" fill="${p[1]}">
          <animateTransform attributeName="transform" type="scale" values="1;1.15;1" dur="1.1s" repeatCount="indefinite"/></path></g>`;
    },
    vision(p, r) {
      let cells = "";
      for (let y = 0; y < 6; y++) for (let x = 0; x < 10; x++) {
        cells += `<rect x="${40 + x * 32}" y="${30 + y * 32}" width="28" height="28" rx="4" fill="${p[1]}" opacity="${(0.1 + r() * 0.5).toFixed(2)}"/>`;
      }
      return `${cells}
        <rect x="40" y="30" width="60" height="188" fill="${p[0]}" opacity=".18" rx="6">
          <animate attributeName="x" values="40;300;40" dur="6s" repeatCount="indefinite"/></rect>`;
    },
    sys(p, r) {
      let lanes = "";
      for (let i = 0; i < 4; i++) {
        const y = 50 + i * 44;
        lanes += `<line x1="40" y1="${y}" x2="360" y2="${y}" stroke="${p[2]}" stroke-width="2"/>
          <circle r="7" cy="${y}" fill="${i === 2 ? "#dc2626" : p[0]}"><animate attributeName="cx" values="40;360" dur="${2 + r() * 2}s" repeatCount="indefinite"/></circle>`;
      }
      const msgs = [[120, 0, 1], [200, 1, 3], [270, 3, 2], [320, 0, 2]].map(([x, a, b]) =>
        `<line x1="${x}" y1="${50 + a * 44}" x2="${x + 20}" y2="${50 + b * 44}" stroke="${p[1]}" stroke-width="2" stroke-dasharray="4 4" marker-end="url(#ah)"/>`).join("");
      return `<defs><marker id="ah" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8 z" fill="${p[1]}"/></marker></defs>
        ${lanes}${msgs}
        <g font-family="ui-monospace,monospace" font-size="12" fill="${p[1]}">${[0, 1, 2, 3].map((i) => `<text x="10" y="${54 + i * 44}">P${i}</text>`).join("")}</g>`;
    },
    geo(p, r) {
      let trees = "";
      for (let i = 0; i < 12; i++) {
        const x = 20 + i * 32 + r() * 10, s = 0.7 + r() * 0.6;
        trees += `<g transform="translate(${x} ${200}) scale(${s})"><path d="M0 -60 L18 -18 L8 -18 L22 0 L-22 0 L-8 -18 L-18 -18 Z" fill="${i % 3 ? p[0] : "#22a35a"}"/><rect x="-3" y="0" width="6" height="10" fill="#7c5a2b"/></g>`;
      }
      return `<rect x="0" y="200" width="400" height="40" fill="${p[2]}"/>${trees}
        <g><animateTransform attributeName="transform" type="translate" values="0 0;300 0;0 0" dur="10s" repeatCount="indefinite"/>
          <g transform="translate(40 40)"><rect x="-10" y="-7" width="20" height="14" rx="3" fill="${p[1]}"/><rect x="-34" y="-4" width="20" height="8" fill="#5b8def"/><rect x="14" y="-4" width="20" height="8" fill="#5b8def"/>
          <path d="M-6 7 L-40 150 L40 150 L6 7 Z" fill="${p[1]}" opacity=".12"/></g></g>`;
    },
    ml(p, r) {
      const layers = [3, 5, 5, 2];
      const pos = layers.map((n, li) => Array.from({ length: n }, (_, i) => [70 + li * 88, 120 + (i - (n - 1) / 2) * 38]));
      let edges = "";
      for (let l = 0; l < pos.length - 1; l++) pos[l].forEach(([x1, y1]) => pos[l + 1].forEach(([x2, y2]) => {
        edges += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${p[1]}" stroke-opacity=".25" stroke-width="1.5"/>`;
      }));
      const nodes = pos.flat().map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="10" fill="#fff" stroke="${p[0]}" stroke-width="3">
        <animate attributeName="fill" values="#fff;${p[1]};#fff" dur="2.4s" begin="${(x - 70) / 88 * .4}s" repeatCount="indefinite"/></circle>`).join("");
      return edges + nodes;
    }
  };

  window.art = function (topic, seed = 1) {
    const p = PAL[topic] || PAL.ml;
    const r = rng(seed);
    const id = "g" + (++uid);
    let dots = "";
    for (let i = 0; i < 18; i++) dots += `<circle cx="${(r() * 400).toFixed(0)}" cy="${(r() * 240).toFixed(0)}" r="${(1 + r() * 2).toFixed(1)}" fill="${p[1]}" opacity=".25"/>`;
    return `<svg viewBox="0 0 400 240" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${p[3]}"/><stop offset="1" stop-color="${p[2]}"/></linearGradient></defs>
      <rect width="400" height="240" fill="url(#${id})"/>${dots}${(motifs[topic] || motifs.ml)(p, r)}</svg>`;
  };

  // Map a publication title to a topic.
  window.topicOf = function (p) {
    const t = (p.title + " " + p.venue).toLowerCase();
    const rules = [
      ["green", /energy|power consumption|green/],
      ["access", /accessib|universal design|whitelist|cognitive/],
      ["data", /data spaces|data sharing|browsing histories|imputation/],
      ["geo", /forest|agricultur|sentinel/],
      ["sports", /cricket|player/],
      ["vision", /ocr|facial|counterfeit|manuscript/],
      ["health", /medical|electromyograph|balance|nanobody|antigen/],
      ["nlp", /urdu|language|sentiment|summari|verbalizer|cybercrime|text|legal/],
      ["sys", /mpi|mapreduce|parallel|tcam|sensor network|java/]
    ];
    const hit = rules.find(([, re]) => re.test(t));
    return hit ? hit[0] : "ml";
  };
})();
