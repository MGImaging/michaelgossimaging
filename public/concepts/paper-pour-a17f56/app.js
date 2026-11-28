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

  if (!window.gsap || !window.ScrollTrigger || !window.SplitText) return;
  gsap.registerPlugin(ScrollTrigger, SplitText);
  ScrollTrigger.config({ ignoreMobileResize: true });

  var mm = gsap.matchMedia();
  mm.add("(prefers-reduced-motion: no-preference)", function () {
    var split = SplitText.create("main .hero h1", {
      type: "lines",
      mask: "lines",
      autoSplit: true,
      aria: "auto",
      onSplit: function (self) {
        return gsap.from(self.lines, {
          yPercent: 110,
          duration: 0.9,
          stagger: 0.07,
          ease: "power2.out"
        });
      }
    });

    gsap.fromTo(".hero img", { scale: 1.045 }, {
      scale: 1,
      ease: "none",
      scrollTrigger: {
        trigger: ".hero",
        start: "top 80%",
        end: "bottom top",
        scrub: 0.6
      }
    });

    var cards = gsap.utils.toArray(".menu-grid > section");
    ScrollTrigger.batch(cards, {
      start: "top 88%",
      once: true,
      onEnter: function (batch) {
        gsap.from(batch, {
          autoAlpha: 0,
          y: 16,
          duration: 0.75,
          stagger: 0.1,
          ease: "power2.out",
          clearProps: "opacity,visibility,transform"
        });
      }
    });

    ScrollTrigger.batch(".cups img", {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        gsap.from(batch, {
          autoAlpha: 0,
          y: 18,
          duration: 0.9,
          ease: "power2.out",
          clearProps: "opacity,visibility,transform"
        });
      }
    });

    var hoverOff = [];
    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      cards.forEach(function (card) {
        function enter() { gsap.to(card, { y: -4, duration: 0.35, ease: "power2.out", overwrite: "auto" }); }
        function leave() { gsap.to(card, { y: 0, duration: 0.4, ease: "power2.out", overwrite: "auto" }); }
        card.addEventListener("pointerenter", enter);
        card.addEventListener("pointerleave", leave);
        hoverOff.push(function () {
          card.removeEventListener("pointerenter", enter);
          card.removeEventListener("pointerleave", leave);
        });
      });
    }

    return function () {
      hoverOff.forEach(function (off) { off(); });
      if (split && split.revert) split.revert();
      gsap.set(".hero img, .menu-grid > section, .cups img", { clearProps: "all" });
    };
  });
})();
