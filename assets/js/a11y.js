// Accessibility preferences: text size, spacing, motion, contrast, theme.
(function () {
  const root = document.documentElement;
  const KEYS = ["theme", "contrast", "motion", "spacing", "size"];
  const store = (k) => { try { return localStorage.getItem("sa:" + k); } catch (e) { return null; } };
  const save = (k, v) => { try { localStorage.setItem("sa:" + k, v); } catch (e) {} };
  const sysMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  const prefs = {
    theme: (v) => root.setAttribute("data-theme", v ? "dark" : "light"),
    contrast: (v) => root.setAttribute("data-contrast", v ? "high" : "normal"),
    motion: (v) => root.setAttribute("data-motion", v ? "reduced" : "normal"),
    spacing: (v) => root.setAttribute("data-spacing", v ? "wide" : "normal")
  };
  function applyPref(k, v) {
    prefs[k](v);
    document.querySelectorAll(`[data-pref="${k}"]`).forEach((s) => s.setAttribute("aria-checked", String(v)));
  }
  function setSize(s) {
    root.style.setProperty("--fs", s);
    document.querySelectorAll("[data-size]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.size === String(s))));
  }

  applyPref("theme", store("theme") === "1");
  applyPref("contrast", store("contrast") === "1");
  applyPref("motion", store("motion") !== null ? store("motion") === "1" : sysMotion);
  applyPref("spacing", store("spacing") === "1");
  setSize(store("size") || "1");

  document.querySelectorAll("[data-pref]").forEach((s) => s.addEventListener("click", () => {
    const k = s.dataset.pref, v = s.getAttribute("aria-checked") !== "true";
    applyPref(k, v);
    save(k, v ? "1" : "0");
  }));
  document.querySelectorAll("[data-size]").forEach((b) => b.addEventListener("click", () => {
    setSize(b.dataset.size);
    save("size", b.dataset.size);
  }));
  document.getElementById("a11y-reset").addEventListener("click", () => {
    KEYS.forEach((k) => { try { localStorage.removeItem("sa:" + k); } catch (e) {} });
    applyPref("theme", false); applyPref("contrast", false); applyPref("motion", sysMotion); applyPref("spacing", false); setSize("1");
  });

  // panel open / close
  const panel = document.getElementById("a11y"), fab = document.getElementById("a11y-open");
  const open = () => {
    panel.hidden = false;
    fab.setAttribute("aria-expanded", "true");
    panel.querySelector("button").focus();
  };
  const close = (refocus = true) => {
    panel.hidden = true;
    fab.setAttribute("aria-expanded", "false");
    if (refocus) fab.focus();
  };
  fab.addEventListener("click", () => (panel.hidden ? open() : close()));
  document.getElementById("a11y-close").addEventListener("click", () => close());
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) close(); });
  document.addEventListener("click", (e) => {
    if (!panel.hidden && !panel.contains(e.target) && !fab.contains(e.target)) close(false);
  });

  // ticker pause (WCAG 2.2.2)
  const tp = document.getElementById("ticker-pause"), ticker = document.querySelector(".ticker");
  tp.addEventListener("click", () => {
    const paused = tp.getAttribute("aria-pressed") !== "true";
    tp.setAttribute("aria-pressed", String(paused));
    tp.setAttribute("aria-label", paused ? "Play updates ticker" : "Pause updates ticker");
    tp.innerHTML = `<i class="fa-solid fa-${paused ? "play" : "pause"}"></i>`;
    ticker.classList.toggle("paused", paused);
  });
})();
