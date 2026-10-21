(function () {
  "use strict";
  // Mobile nav
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.querySelector(".main-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) nav.classList.remove("open");
    });
  }
  // Footer year
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
  // Copy email
  document.querySelectorAll("[data-copy]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var text = btn.getAttribute("data-copy");
      var done = function () {
        var old = btn.textContent;
        btn.textContent = "Copied: " + text;
        setTimeout(function () { btn.textContent = old; }, 2200);
      };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done, done);
      } else { done(); }
    });
  });
  // Domain filter + search (home)
  var search = document.getElementById("domain-search");
  var cards = Array.prototype.slice.call(document.querySelectorAll(".domain-card"));
  var chips = Array.prototype.slice.call(document.querySelectorAll("[data-cluster-filter]"));
  var count = document.getElementById("result-count");
  var activeCluster = "all";
  function applyFilter() {
    var q = search ? search.value.trim().toLowerCase() : "";
    var shown = 0;
    cards.forEach(function (card) {
      var hay = (card.getAttribute("data-search") || "").toLowerCase();
      var cl = card.getAttribute("data-cluster") || "";
      var ok = (activeCluster === "all" || cl === activeCluster) && (!q || hay.indexOf(q) !== -1);
      card.classList.toggle("hidden-card", !ok);
      if (ok) shown++;
    });
    document.querySelectorAll(".cluster").forEach(function (sec) {
      var any = sec.querySelector(".domain-card:not(.hidden-card)");
      sec.style.display = any ? "" : "none";
    });
    if (count) count.textContent = shown + " of " + cards.length + " domains shown";
  }
  if (cards.length) {
    if (search) search.addEventListener("input", applyFilter);
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        activeCluster = chip.getAttribute("data-cluster-filter");
        chips.forEach(function (c) { c.setAttribute("aria-pressed", c === chip ? "true" : "false"); });
        applyFilter();
      });
    });
    applyFilter();
  }
  // Tools table filter
  var toolSearch = document.getElementById("tool-search");
  var toolRows = Array.prototype.slice.call(document.querySelectorAll("#tools-table tbody tr"));
  var toolCount = document.getElementById("tool-count");
  if (toolSearch && toolRows.length) {
    toolSearch.addEventListener("input", function () {
      var q = toolSearch.value.trim().toLowerCase();
      var shown = 0;
      toolRows.forEach(function (r) {
        var ok = !q || r.textContent.toLowerCase().indexOf(q) !== -1;
        r.style.display = ok ? "" : "none";
        if (ok) shown++;
      });
      if (toolCount) toolCount.textContent = shown + " tools shown";
    });
  }

  // ---------- motion & engagement layer ----------
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion || !("IntersectionObserver" in window)) document.documentElement.classList.add("no-anim");

  // Scroll progress + back-to-top
  var progress = document.getElementById("scroll-progress");
  var toTop = document.getElementById("to-top");
  function onScroll() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    var y = window.scrollY || 0;
    if (progress) progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    if (toTop) toTop.classList.toggle("show", y > 600);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" }); });

  // Reveal on scroll (staggered within each parent)
  var revealEls = [];
  if (!reduceMotion && "IntersectionObserver" in window) {
    revealEls = Array.prototype.slice.call(document.querySelectorAll(
      ".sec-head,.card,.domain-card,.stat,.timeline li,.evidence-item,.steps li,.cluster>h3,.case-meta p,.note-box,.trust-box"));
    var seenParent = new Map();
    revealEls.forEach(function (el) {
      el.classList.add("reveal");
      var p = el.parentElement;
      var idx = seenParent.get(p) || 0;
      seenParent.set(p, idx + 1);
      el.style.transitionDelay = Math.min(idx * 70, 350) + "ms";
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
    // Safety net: never leave in-viewport content hidden if observer delivery lags.
    var revealCheck = function () {
      revealEls.forEach(function (el) {
        if (el.classList.contains("in")) return;
        var r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) el.classList.add("in");
      });
    };
    window.addEventListener("scroll", revealCheck, { passive: true });
    setTimeout(revealCheck, 900);
    setTimeout(revealCheck, 2500);
  }

  // Animated counters
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function runCounter(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    var suffix = el.getAttribute("data-suffix") || "";
    if (reduceMotion) { el.textContent = target + suffix; return; }
    var start = null, dur = 1300;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (counters.length && "IntersectionObserver" in window && !reduceMotion) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { runCounter(en.target); cio.unobserve(en.target); } });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { el.textContent = "0" + (el.getAttribute("data-suffix") || ""); cio.observe(el); });
  }

  // Skill bars grow when visible
  var fills = Array.prototype.slice.call(document.querySelectorAll(".sbar .fill"));
  if (fills.length && "IntersectionObserver" in window && !reduceMotion) {
    fills.forEach(function (f) { f.dataset.w = f.style.width; f.style.width = "0%"; });
    var fio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.style.width = en.target.dataset.w; fio.unobserve(en.target); } });
    }, { threshold: 0.35 });
    fills.forEach(function (f) { fio.observe(f); });
  }

  // Typed rotating roles
  var typed = document.getElementById("typed-role");
  if (typed && !reduceMotion) {
    var roles = (typed.getAttribute("data-roles") || "").split("|").filter(Boolean);
    if (roles.length > 1) {
      var ri = 0, ci = roles[0].length, deleting = false;
      typed.textContent = roles[0];
      (function tick() {
        var word = roles[ri];
        if (!deleting) {
          ci++;
          typed.textContent = word.slice(0, ci);
          if (ci >= word.length) { deleting = true; return setTimeout(tick, 1900); }
          return setTimeout(tick, 55);
        }
        ci--;
        typed.textContent = word.slice(0, Math.max(ci, 0));
        if (ci <= 0) { deleting = false; ri = (ri + 1) % roles.length; return setTimeout(tick, 320); }
        return setTimeout(tick, 28);
      })();
    }
  }

  // Hero: mouse spotlight vars + particle network canvas
  var hero = document.querySelector(".hero");
  if (hero && !reduceMotion) {
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect();
      hero.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100) + "%");
      hero.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100) + "%");
    });
  }
  var canvas = document.getElementById("hero-canvas");
  if (canvas && hero && !reduceMotion) {
    var ctx = canvas.getContext("2d");
    var W = 0, H = 0, pts = [], raf = null, mouse = { x: -9999, y: -9999 };
    function resize() {
      var r = hero.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      W = r.width; H = r.height;
      canvas.width = W * dpr; canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var n = Math.max(28, Math.min(90, Math.round(W * H / 16000)));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45, r: 1 + Math.random() * 1.8 });
    }
    function frame() {
      ctx.clearRect(0, 0, W, H);
      var i, j, p, q, dx, dy, d;
      for (i = 0; i < pts.length; i++) {
        p = pts[i];
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        dx = p.x - mouse.x; dy = p.y - mouse.y; d = Math.sqrt(dx * dx + dy * dy);
        if (d < 130 && d > 0.01) { p.x += dx / d * .55; p.y += dy / d * .55; }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832);
        ctx.fillStyle = "rgba(143,208,194,.75)"; ctx.fill();
      }
      for (i = 0; i < pts.length; i++) for (j = i + 1; j < pts.length; j++) {
        p = pts[i]; q = pts[j]; dx = p.x - q.x; dy = p.y - q.y; d = dx * dx + dy * dy;
        if (d < 15000) {
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = "rgba(98,168,173," + (0.22 * (1 - d / 15000)).toFixed(3) + ")";
          ctx.lineWidth = 1; ctx.stroke();
        }
      }
      raf = requestAnimationFrame(frame);
    }
    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    });
    hero.addEventListener("pointerleave", function () { mouse.x = -9999; mouse.y = -9999; });
    resize(); window.addEventListener("resize", resize);
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting && !raf) raf = requestAnimationFrame(frame);
          if (!en.isIntersecting && raf) { cancelAnimationFrame(raf); raf = null; }
        });
      }).observe(hero);
    } else { raf = requestAnimationFrame(frame); }
  }

  // 3D tilt on domain cards (fine pointers only)
  if (!reduceMotion && window.matchMedia && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".domain-card").forEach(function (card) {
      card.addEventListener("pointermove", function (e) {
        card.style.transition = "transform .12s ease,border-color .2s ease,box-shadow .25s ease";
        card.style.transitionDelay = "0ms";
        var r = card.getBoundingClientRect();
        var rx = ((e.clientY - r.top) / r.height - .5) * -7;
        var ry = ((e.clientX - r.left) / r.width - .5) * 9;
        card.style.transform = "perspective(850px) rotateX(" + rx.toFixed(2) + "deg) rotateY(" + ry.toFixed(2) + "deg) translateY(-3px)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transition = "transform .35s ease";
        card.style.transform = "";
        setTimeout(function () { card.style.transition = ""; card.style.transitionDelay = ""; }, 380);
      });
    });
  }
})();
