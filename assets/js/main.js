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
})();
