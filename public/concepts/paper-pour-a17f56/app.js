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

  // Motion adapted from Codrops tutorials, not copied wholesale:
  // One Element Scroll (Flip waypoints), Scroll-based Layout Animations (Flip reflow),
  // Text Character Animations (masked letters on a timeline), Scroll Text Motion (scroll-linked type).
  // https://github.com/codrops/OneElementScroll
  // https://github.com/codrops/ScrollBasedLayoutAnimations
  // https://github.com/codrops/TextCharacterAnimations
  // https://github.com/codrops/ScrollTextMotion
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

  var mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", function () {
    var narrow = window.matchMedia("(max-width: 719px)").matches;
    var gallery = document.getElementById("pour-gallery");
    var traveler = document.getElementById("traveler");
    var stops = gsap.utils.toArray("[data-cup]");
    var h1 = document.querySelector(".hero h1");
    var titles = gsap.utils.toArray(".scroll-title");
    var cards = gsap.utils.toArray(".menu-grid > section");

    if (h1) pourHeadline(h1);
    titles.forEach(function (title, index) {
      if (narrow && index > 0) return;
      driftTitle(title);
    });

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

    if (gallery) {
      gallery.classList.add("is-spread");
      var items = gsap.utils.toArray(gallery.querySelectorAll(".gallery-item"));
      var box = gallery.getBoundingClientRect();
      items.forEach(function (el) {
        var rect = el.getBoundingClientRect();
        var cx = box.left + box.width / 2;
        var cy = box.top + box.height / 2;
        var ix = rect.left + rect.width / 2;
        var iy = rect.top + rect.height / 2;
        var roomX = Math.max(0, Math.min(rect.left - box.left, box.right - rect.right) - 2);
        var roomY = Math.max(0, Math.min(rect.top - box.top, box.bottom - rect.bottom) - 2);
        var dx = Math.max(-roomX, Math.min(roomX, (cx - ix) * 0.7));
        var dy = Math.max(-roomY, Math.min(roomY, (cy - iy) * 0.45));
        gsap.fromTo(el, { x: dx, y: dy, scale: narrow ? 0.92 : 0.86 }, {
          x: 0,
          y: 0,
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: gallery,
            start: "top 82%",
            end: narrow ? "top 46%" : "center 58%",
            scrub: true
          }
        });
      });
    }

    if (cards.length) {
      var rise = gsap.timeline({
        scrollTrigger: {
          trigger: ".menu-board",
          start: "top 88%",
          end: narrow ? "top 48%" : "top 32%",
          scrub: 0.35
        }
      });
      cards.forEach(function (cardEl, index) {
        rise.fromTo(cardEl, { clipPath: "inset(100% 0% 0% 0%)" }, {
          clipPath: "inset(0% 0% 0% 0%)",
          ease: "none",
          duration: 0.55
        }, index * 0.12);
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
      if (gallery) gallery.classList.add("is-spread");
      if (h1) restoreText(h1);
      titles.forEach(restoreText);
      gsap.set(".menu-grid > section, .gallery-item, #traveler", { clearProps: "all" });
    };
  });
})();
