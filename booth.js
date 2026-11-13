/* Nawab AI booth attract screen: wandering mascots around a static wordmark.
   Query options: ?city=lucknow|varanasi|kanpur|noida  ?count=1..4 (default 1)  ?wordmark=login (sign-in page serif lockup) */
(function () {
  "use strict";

  var params = new URLSearchParams(location.search);
  var CITIES = ["lucknow", "varanasi", "kanpur", "noida"];
  var city = params.get("city");
  if (CITIES.indexOf(city) !== -1) document.documentElement.setAttribute("data-city", city);

  if (params.get("wordmark") === "login") document.documentElement.setAttribute("data-wordmark", "login");

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // The product's own idle moods (NawabMascot.tsx MOODS), minus the ones that
  // need the input-box rim (hang, peek) or carry their own translate (stroll).
  var MOODS = [
    { name: "wave",   hold: 3800 },
    { name: "bow",    hold: 3600 },
    { name: "twirl",  hold: 4600 },
    { name: "ponder", hold: 4800 },
  ];
  var STEP_S = 0.62;           // product's stroll leg cycle

  var tpl = document.getElementById("mascot-tpl");
  var brand = document.getElementById("brand");
  var W, H, mh, mw, bounds, zone;
  var walkers = [];

  function measure() {
    W = window.innerWidth;
    H = window.innerHeight;
    mh = Math.round(Math.max(96, Math.min(H * 0.19, W * 0.12)));
    mw = Math.round(mh * 0.727);           // 64:88 viewBox ratio
    var pad = Math.round(Math.min(W, H) * 0.03);
    // he walks a horizontal strip along the bottom, under the wordmark and QR
    var floor = H - mh - Math.round(H * 0.035);
    // ...and only up to the QR card's left edge, never underneath it
    var card = document.querySelector(".qr__card").getBoundingClientRect();
    // the bow pose tilts him 19deg about his feet, so keep that much head room on both sides
    var lean = Math.ceil(mh * Math.sin(19 * Math.PI / 180));
    var xMax = Math.min(W - pad, card.left - Math.round(W * 0.01)) - mw - lean;
    bounds = { x0: pad + lean, y0: floor, x1: Math.max(pad + lean, xMax), y1: floor };
    var r = brand.getBoundingClientRect();   // the QR side is handled by bounds.x1
    var m = Math.round(Math.min(W, H) * 0.025);
    // in walker top-left coordinates
    zone = { x0: r.left - m - mw, y0: r.top - m - mh, x1: r.right + m, y1: r.bottom + m };
  }

  function inZone(x, y, z) { return x > z.x0 && x < z.x1 && y > z.y0 && y < z.y1; }
  function inBounds(p) { return p.x >= bounds.x0 - 1 && p.x <= bounds.x1 + 1 && p.y >= bounds.y0 - 1 && p.y <= bounds.y1 + 1; }
  function clear(a, b) {
    for (var i = 1; i < 48; i++) {
      var t = i / 48;
      if (inZone(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, zone)) return false;
    }
    return true;
  }
  function dist(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
  function rand(a, b) { return a + Math.random() * (b - a); }

  function randomSpot(from) {
    for (var i = 0; i < 200; i++) {
      var p = { x: rand(bounds.x0, bounds.x1), y: rand(bounds.y0, bounds.y1) };
      if (inZone(p.x, p.y, zone)) continue;
      if (from && dist(from, p) < Math.min(W * 0.22, (bounds.x1 - bounds.x0) * 0.4)) continue;
      if (walkers.some(function (w) { return w.goal && dist(w.goal, p) < mw * 2; })) continue;
      return p;
    }
    return { x: bounds.x0, y: bounds.y0 };
  }

  // Shortest route from a to b that walks around the wordmark, via 0-2 corners.
  function route(a, b) {
    if (clear(a, b)) return [b];
    var e = 2;
    var c = [
      { x: zone.x0 - e, y: zone.y0 - e }, { x: zone.x1 + e, y: zone.y0 - e },
      { x: zone.x1 + e, y: zone.y1 + e }, { x: zone.x0 - e, y: zone.y1 + e },
    ].filter(inBounds);
    var best = null, bestLen = Infinity, i, j, len;
    for (i = 0; i < c.length; i++) {
      if (clear(a, c[i]) && clear(c[i], b)) {
        len = dist(a, c[i]) + dist(c[i], b);
        if (len < bestLen) { bestLen = len; best = [c[i], b]; }
      }
    }
    for (i = 0; i < c.length; i++) for (j = 0; j < c.length; j++) {
      if (i === j) continue;
      if (clear(a, c[i]) && clear(c[i], c[j]) && clear(c[j], b)) {
        len = dist(a, c[i]) + dist(c[i], c[j]) + dist(c[j], b);
        if (len < bestLen) { bestLen = len; best = [c[i], c[j], b]; }
      }
    }
    return best;               // null: no way round inside the screen
  }

  function Walker(index) {
    var node = tpl.content.firstElementChild.cloneNode(true);
    document.body.appendChild(node);
    this.el = node;
    this.face = node.querySelector(".walker__face");
    this.body = node.querySelector(".nawab-mascot");
    this.body.style.setProperty("--mc", "var(--city-color)");
    var p = randomSpot(null);
    this.x = p.x; this.y = p.y;
    this.goal = p;
    this.path = [];
    this.phase = Math.random() * STEP_S;
    this.lastMood = -1;
    this.size();
    this.walk();
  }
  Walker.prototype.size = function () {
    this.body.style.height = mh + "px";
    this.body.style.width = mw + "px";
    this.body.style.setProperty("--m-h", mh + "px");
  };
  Walker.prototype.setMood = function (name) {
    this.body.className = "nawab-mascot is-" + name;
  };
  Walker.prototype.walk = function () {
    this.path = [];
    // only take goals he can reach without crossing the wordmark
    for (var i = 0; i < 30; i++) {
      var g = randomSpot(i < 15 ? this : null);
      var r = route(this, g);
      if (r) { this.goal = g; this.path = r; break; }
    }
    if (!this.path.length) { this.idle(); return; }
    this.mode = "walk";
    this.setMood("walk");
  };
  Walker.prototype.idle = function (mood) {
    if (!mood) {
      var k;
      do { k = Math.floor(Math.random() * MOODS.length); } while (k === this.lastMood);
      this.lastMood = k;
      mood = MOODS[k];
    }
    this.mode = "idle";
    this.until = performance.now() + mood.hold * (reduced ? 1.5 : 1);
    // turn to face the wordmark while posing
    this.face.classList.toggle("left", this.x + mw / 2 > W / 2);
    this.setMood(mood.name);
  };
  Walker.prototype.tick = function (dt, now) {
    var bob = 0;
    if (this.mode === "walk") {
      var speed = mh * (reduced ? 0.55 : 0.95);
      var step = speed * dt;
      while (step > 0 && this.path.length) {
        var t = this.path[0];
        var dx = t.x - this.x, dy = t.y - this.y, d = Math.hypot(dx, dy);
        if (Math.abs(dx) > 0.5) this.face.classList.toggle("left", dx < 0);
        if (d <= step) { this.x = t.x; this.y = t.y; step -= d; this.path.shift(); }
        else { this.x += dx / d * step; this.y += dy / d * step; step = 0; }
      }
      this.phase += dt;
      bob = -Math.abs(Math.sin(this.phase * Math.PI * 2 / STEP_S)) * mh * 0.014;
      if (!this.path.length) {
        // mostly walking: pose only on about one stop in three
        this.stops = (this.stops || 0) + 1;
        if (this.stops >= 3) { this.stops = 0; this.idle(); }
        else this.walk();
      }
    } else if (now >= this.until) {
      this.walk();
    }
    this.el.style.transform = "translate3d(" + this.x.toFixed(1) + "px," + (this.y + bob).toFixed(1) + "px,0)";
    this.el.style.zIndex = String(2 + Math.round(this.y));   // lower on screen = in front
  };

  function count() {
    var n = parseInt(params.get("count"), 10);
    if (n >= 1 && n <= 4) return n;
    return 1;
  }

  function start() {
    measure();
    var n = count();
    for (var i = 0; i < n; i++) walkers.push(new Walker(i));
    var last = performance.now();
    function frame(now) {
      var dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      for (var i = 0; i < walkers.length; i++) walkers[i].tick(dt, now);
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  window.addEventListener("resize", function () {
    measure();
    walkers.forEach(function (w) {
      w.size();
      w.x = Math.min(Math.max(w.x, bounds.x0), bounds.x1);
      w.y = Math.min(Math.max(w.y, bounds.y0), bounds.y1);
      if (inZone(w.x, w.y, zone)) { var p = randomSpot(null); w.x = p.x; w.y = p.y; }
      if (w.mode === "walk") w.walk();
    });
  });

  // Hide the cursor after 2.5 s without movement.
  var idleTimer;
  function wake() {
    document.body.classList.remove("idle");
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () { document.body.classList.add("idle"); }, 2500);
  }
  window.addEventListener("mousemove", wake);
  wake();

  // Fullscreen: F11 in the browser, or F / double-click here.
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () {});
  }
  window.addEventListener("keydown", function (e) { if (e.key === "f" || e.key === "F") toggleFullscreen(); });
  window.addEventListener("dblclick", toggleFullscreen);
  var hint = document.getElementById("hint");
  if (!document.fullscreenElement && !params.has("nohint")) {
    hint.classList.add("show");
    setTimeout(function () { hint.classList.remove("show"); }, 6000);
  }

  // Cache everything so a reload still works if the venue Wi-Fi drops.
  if ("serviceWorker" in navigator && location.protocol === "https:") {
    navigator.serviceWorker.register("sw.js").catch(function () {});
  }

  // Wait for the fonts so the wordmark box (and the no-walk zone) is final.
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(start);
})();
