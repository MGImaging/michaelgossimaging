(function () {
  var form = document.getElementById("note-form");
  var dialog = document.getElementById("contact-dialog");
  var slot = document.getElementById("contact-slot");
  var openBtn = document.getElementById("contact-open");
  var card = dialog ? dialog.querySelector(".contact-card") : null;
  var shade = dialog ? dialog.querySelector(".contact-shade") : null;
  var lastOpener = null;
  var closing = false;

  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var note = document.getElementById("concept-note");
      if (note) note.classList.add("is-on");
      form.reset();
    });
  }

  function motionOn() {
    return window.gsap && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function openDialog(opener) {
    if (!dialog || !form || !slot || dialog.open) return;
    lastOpener = opener || openBtn;
    slot.appendChild(form);
    dialog.showModal();
    document.documentElement.classList.add("modal-open");
    function focusField() {
      var field = form.querySelector("input");
      if (field) field.focus();
    }
    if (!motionOn()) {
      focusField();
      return;
    }
    gsap.fromTo(shade, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.35, ease: "power2.out", overwrite: true });
    gsap.fromTo(card, { autoAlpha: 0, y: 14 }, {
      autoAlpha: 1,
      y: 0,
      duration: 0.45,
      ease: "power2.out",
      overwrite: true,
      onComplete: focusField
    });
  }

  function closeDialog() {
    if (!dialog || !dialog.open || closing) return;
    function finish() {
      closing = false;
      if (dialog.open) dialog.close();
      document.documentElement.classList.remove("modal-open");
      if (window.gsap) gsap.set([shade, card], { clearProps: "opacity,visibility,transform" });
      if (lastOpener && lastOpener.focus) lastOpener.focus();
    }
    if (!motionOn()) {
      finish();
      return;
    }
    closing = true;
    gsap.to(shade, { autoAlpha: 0, duration: 0.25, ease: "power2.in", overwrite: true });
    gsap.to(card, {
      autoAlpha: 0,
      y: 10,
      duration: 0.25,
      ease: "power2.in",
      overwrite: true,
      onComplete: finish
    });
  }

  if (dialog && form && slot && openBtn) {
    slot.appendChild(form);
    document.documentElement.classList.add("modal-ready");
    openBtn.addEventListener("click", function () { openDialog(openBtn); });
    document.querySelectorAll('a[href="#note"]').forEach(function (link) {
      link.addEventListener("click", function (event) {
        event.preventDefault();
        openDialog(link);
      });
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === shade || (event.target.closest && event.target.closest("[data-close]"))) closeDialog();
    });
    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      closeDialog();
    });
  }

  (function setupCounter() {
    var root = document.getElementById("pour-gallery");
    if (!root || !window.EmblaCarousel) return;
    var viewport = root.querySelector(".counter-viewport");
    var slides = root.querySelectorAll(".counter-slide");
    var dots = root.querySelectorAll(".counter-dot");
    var prev = root.querySelector(".counter-prev");
    var next = root.querySelector(".counter-next");
    if (!viewport || !slides.length) return;

    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    viewport.scrollLeft = 0;
    viewport.classList.add("is-ready");
    var embla = window.EmblaCarousel(viewport, {
      loop: true,
      align: "center",
      containScroll: false,
      duration: reduce ? 8 : 25
    });

    function paint() {
      var selected = embla.selectedScrollSnap();
      slides.forEach(function (slide, index) {
        slide.classList.toggle("is-selected", index === selected);
      });
      dots.forEach(function (dot, index) {
        var on = index === selected;
        dot.classList.toggle("is-selected", on);
        if (on) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
    }

    if (prev) prev.addEventListener("click", function () { embla.scrollPrev(); });
    if (next) next.addEventListener("click", function () { embla.scrollNext(); });
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () { embla.scrollTo(index); });
    });
    root.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        embla.scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        embla.scrollNext();
      }
    });
    embla.on("select", paint);
    embla.on("reInit", paint);
    paint();
    window.addEventListener("load", function () { embla.reInit(); });
  })();

  // Motion adapted from Codrops tutorials, not copied wholesale:
  // One Element Scroll (Flip waypoints) and Text Character Animations (masked letters).
  // https://github.com/codrops/OneElementScroll
  // https://github.com/codrops/TextCharacterAnimations
  // Lenis is skipped: a second scroll loop is jumpy on a phone, and native scroll stays calmer.
  if (!window.gsap || !window.ScrollTrigger || !window.Flip) return;
  gsap.registerPlugin(ScrollTrigger, Flip);
  ScrollTrigger.config({ ignoreMobileResize: true });

  function plainText(el) {
    return el.dataset.plain || el.textContent;
  }

  function restoreText(el) {
    if (el && el.dataset.plain) el.textContent = el.dataset.plain;
  }

  function pourHeadline(h1) {
    restoreText(h1);
    var text = h1.textContent;
    h1.dataset.plain = text;
    h1.textContent = "";
    h1.setAttribute("aria-label", text.replace(/\s+/g, " ").trim());
    var letters = [];
    text.split(/(\s+)/).forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        h1.appendChild(document.createTextNode(part));
        return;
      }
      var word = document.createElement("span");
      word.className = "pour-word";
      part.split("").forEach(function (ch) {
        var mask = document.createElement("span");
        mask.className = "pour-mask";
        var letter = document.createElement("span");
        letter.className = "pour-letter";
        letter.textContent = ch;
        mask.appendChild(letter);
        word.appendChild(mask);
        letters.push(letter);
      });
      h1.appendChild(word);
    });
    return gsap.timeline().fromTo(letters, { yPercent: -130 }, {
      yPercent: 0,
      duration: 1.15,
      ease: "power2.out",
      stagger: 0.028
    });
  }

  function driftTitle(el) {
    restoreText(el);
    var text = el.textContent;
    el.dataset.plain = text;
    el.textContent = "";
    var letters = [];
    text.split("").forEach(function (ch) {
      if (ch === " ") {
        el.appendChild(document.createTextNode(" "));
        return;
      }
      var letter = document.createElement("span");
      letter.className = "drift-letter";
      letter.textContent = ch;
      el.appendChild(letter);
      letters.push(letter);
    });
    gsap.fromTo(letters, {
      yPercent: function (index) { return index % 2 ? 22 : -22; }
    }, {
      yPercent: 0,
      ease: "none",
      stagger: 0.03,
      scrollTrigger: {
        trigger: el,
        start: "top 92%",
        end: "top 58%",
        scrub: true
      }
    });
  }

  function playMenu() {
    var board = document.querySelector(".menu-board");
    var title = document.querySelector("#menu h2");
    var cards = gsap.utils.toArray(".menu-grid > section");
    if (!board || !title || !cards.length) return;

    var text = title.textContent.trim();
    title.dataset.plain = text;
    title.textContent = "";
    title.setAttribute("aria-label", text);
    var mask = document.createElement("span");
    mask.className = "menu-title-mask";
    var line = document.createElement("span");
    line.className = "menu-title-line";
    line.textContent = text;
    mask.appendChild(line);
    title.appendChild(mask);

    gsap.set(board, { autoAlpha: 0, y: 18, scale: 0.97, transformOrigin: "50% 0%" });
    gsap.set(line, { yPercent: 110 });
    cards.forEach(function (card) {
      var heading = card.querySelector("h3");
      var rows = card.querySelectorAll("dl > div");
      gsap.set(card, { autoAlpha: 0 });
      if (heading) gsap.set(heading, { autoAlpha: 0, y: 8 });
      gsap.set(rows, { autoAlpha: 0, y: 6 });
    });

    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#menu",
        start: "top 75%",
        toggleActions: "play none none none",
        once: true
      }
    });

    tl.to(board, {
      autoAlpha: 1,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: "power2.out"
    }, 0);

    tl.to(line, {
      yPercent: 0,
      duration: 0.48,
      ease: "power2.out"
    }, 0.22);

    var cursor = 0.42;
    cards.forEach(function (card) {
      var heading = card.querySelector("h3");
      var rows = gsap.utils.toArray(card.querySelectorAll("dl > div"));
      tl.to(card, { autoAlpha: 1, duration: 0.28, ease: "power2.out" }, cursor);
      if (heading) {
        tl.to(heading, { autoAlpha: 1, y: 0, duration: 0.32, ease: "power2.out" }, cursor + 0.08);
      }
      rows.forEach(function (row, i) {
        tl.to(row, { autoAlpha: 1, y: 0, duration: 0.3, ease: "power2.out" }, cursor + 0.16 + i * 0.1);
      });
      cursor += 0.42;
    });
  }

  var mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", function () {
    var narrow = window.matchMedia("(max-width: 719px)").matches;
    var traveler = document.getElementById("traveler");
    var stops = gsap.utils.toArray("[data-cup]");
    var h1 = document.querySelector(".hero h1");
    var titles = gsap.utils.toArray(".scroll-title");

    if (h1) pourHeadline(h1);
    var lockup = document.querySelector(".lockup");
    if (lockup) gsap.from(lockup, { autoAlpha: 0, y: 16, duration: 0.75, ease: "power2.out" });
    titles.forEach(function (title) {
      if (title.closest("#menu")) return;
      if (narrow) return;
      driftTitle(title);
    });
    playMenu();

    if (!narrow && traveler && stops.length > 1) {
      var states = stops.map(function (stop) { return Flip.getState(stop); });
      var cupTl = gsap.timeline({
        scrollTrigger: {
          trigger: stops[0],
          start: "center center",
          endTrigger: stops[stops.length - 1],
          end: "center center",
          scrub: narrow ? 0.4 : true,
          invalidateOnRefresh: true
        }
      });
      states.forEach(function (state, index) {
        cupTl.add(Flip.fit(traveler, state, {
          duration: 1,
          ease: index === 0 ? "none" : "sine.inOut"
        }), index ? "+=0.35" : 0);
      });
    }

    function refresh() { ScrollTrigger.refresh(); }
    window.addEventListener("load", refresh);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    document.querySelectorAll("#gallery img, .hero img, .cups img").forEach(function (img) {
      if (img.complete) return;
      img.addEventListener("load", refresh, { once: true });
    });

    return function () {
      window.removeEventListener("load", refresh);
      if (h1) restoreText(h1);
      titles.forEach(restoreText);
      gsap.set(".menu-board, .menu-grid > section, .menu-grid h3, .menu-grid dl > div, #traveler", { clearProps: "all" });
    };
  });
})();
