(function () {
  document.documentElement.classList.add("js");

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function prefersReduce() { return reduceQuery.matches; }

  var carousel = document.getElementById("project-carousel");
  var viewport = document.getElementById("project-track");
  var pluginsReady = window.gsap && window.ScrollTrigger && window.SplitText && window.Draggable && window.InertiaPlugin && window.CustomEase;

  initForm();
  if (pluginsReady) bootMotion();
  else {
    if (carousel && viewport) initCarousel(carousel, viewport);
    initCompare();
    setupReviewClamps(null);
  }

  function bootMotion() {
    gsap.registerPlugin(ScrollTrigger, SplitText, Draggable, InertiaPlugin, CustomEase);
    CustomEase.create("katz", "M0,0 C0.22,1 0.36,1 1,1");
    document.documentElement.classList.add("drag");

    var mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: reduce)", function () {
      return mount({ motion: false, parallax: false });
    });
    mm.add("(prefers-reduced-motion: no-preference) and (min-width: 720px)", function () {
      document.documentElement.classList.add("motion");
      var kill = mount({ motion: true, parallax: true });
      return function () {
        document.documentElement.classList.remove("motion");
        kill();
      };
    });
    mm.add("(prefers-reduced-motion: no-preference) and (max-width: 719px)", function () {
      document.documentElement.classList.add("motion");
      var kill = mount({ motion: true, parallax: false });
      return function () {
        document.documentElement.classList.remove("motion");
        kill();
      };
    });
  }

  function mount(opts) {
    var kills = [];
    if (carousel && viewport) kills.push(mountCarousel(opts));
    kills.push(mountCompare(opts));
    kills.push(mountReviews(opts));
    if (opts.motion) kills.push(mountReveals(opts));
    return function () {
      kills.forEach(function (kill) { if (kill) kill(); });
    };
  }

  function setupReviewClamps(onToggle) {
    var stops = [];
    var measures = [];
    document.querySelectorAll(".review").forEach(function (card) {
      var text = card.querySelector(".review-text");
      var btn = card.querySelector(".review-more");
      if (!text || !btn) return;

      function measure() {
        var expanded = btn.getAttribute("aria-expanded") === "true";
        text.classList.remove("is-clamped");
        var full = text.scrollHeight;
        text.classList.add("is-clamped");
        var clamped = text.clientHeight;
        if (full <= clamped + 2) {
          text.classList.remove("is-clamped");
          btn.hidden = true;
          return;
        }
        btn.hidden = false;
        text.classList.toggle("is-clamped", !expanded);
      }

      function onClick() {
        var clamped = text.classList.toggle("is-clamped");
        btn.textContent = clamped ? "Read more" : "Read less";
        btn.setAttribute("aria-expanded", clamped ? "false" : "true");
        if (onToggle) onToggle();
      }

      measure();
      measures.push(measure);
      btn.addEventListener("click", onClick);
      stops.push(function () { btn.removeEventListener("click", onClick); });
    });
    function remeasure() { measures.forEach(function (measure) { measure(); }); }
    remeasure.stop = function () { stops.forEach(function (stop) { stop(); }); };
    return remeasure;
  }

  function mountReviews(opts) {
    var root = document.getElementById("review-slider");
    var viewport = document.getElementById("review-viewport");
    var strip = document.getElementById("review-strip");
    if (!root || !viewport || !strip) return function () {};
    var cards = Array.prototype.slice.call(strip.querySelectorAll(".review"));
    var prevBtn = root.querySelector(".rev-prev");
    var nextBtn = root.querySelector(".rev-next");
    var countEl = root.querySelector(".rev-count");
    var live = document.getElementById("rev-live");
    var total = cards.length;
    var index = 0;
    var announced = 0;
    var alive = true;
    var ac = new AbortController();
    var signal = ac.signal;

    function width() { return viewport.clientWidth || 1; }

    function snapX(x) {
      var w = width();
      var n = Math.round(-x / w);
      n = Math.max(0, Math.min(total - 1, n));
      return -n * w;
    }

    function fit(i, smooth) {
      var card = cards[typeof i === "number" ? i : index];
      if (!card) return;
      var height = card.offsetHeight;
      if (smooth && opts.motion) {
        gsap.to(viewport, { height: height, duration: 0.4, ease: "katz", overwrite: true });
      } else {
        gsap.set(viewport, { height: height });
      }
    }

    function render(i, announce) {
      index = Math.max(0, Math.min(total - 1, i));
      if (countEl) countEl.textContent = (index + 1) + " / " + total;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === total - 1;
      cards.forEach(function (card, n) {
        var current = n === index;
        card.setAttribute("aria-hidden", current ? "false" : "true");
        if (current) card.removeAttribute("inert");
        else card.setAttribute("inert", "");
      });
      if (announce && live && index !== announced) {
        var name = cards[index].querySelector(".review-name");
        live.textContent = (index + 1) + " of " + total + ". " + (name ? name.textContent.trim() : "") + ".";
        announced = index;
      }
    }

    function sync(announce) {
      render(Math.round(-Number(gsap.getProperty(strip, "x") || 0) / width()), announce);
    }

    var drag = Draggable.create(strip, {
      type: "x",
      trigger: viewport,
      bounds: { minX: -((total - 1) * width()), maxX: 0 },
      inertia: !!opts.motion,
      throwResistance: 1400,
      maxDuration: 0.4,
      minDuration: 0.15,
      snap: snapX,
      edgeResistance: 0.85,
      zIndexBoost: false,
      allowNativeTouchScrolling: true,
      dragClickables: false,
      cursor: "grab",
      activeCursor: "grabbing",
      onDragStart: function () { viewport.classList.add("is-dragging"); },
      onDrag: function () { sync(false); },
      onThrowUpdate: function () { sync(false); },
      onDragEnd: function () {
        viewport.classList.remove("is-dragging");
        var self = this;
        if (!opts.motion) {
          gsap.set(strip, { x: snapX(self.x) });
          sync(true);
          fit(index, false);
          return;
        }
        requestAnimationFrame(function () {
          if (!alive || self.tween) return;
          gsap.set(strip, { x: snapX(self.x) });
          sync(true);
          fit(index, false);
        });
      },
      onThrowComplete: function () { sync(true); fit(index, true); }
    })[0];

    function go(i, smooth) {
      var next = Math.max(0, Math.min(total - 1, i));
      if (drag.tween) drag.tween.kill();
      gsap.killTweensOf(strip);
      gsap.to(strip, {
        x: -next * width(),
        duration: smooth && opts.motion ? 0.55 : 0,
        ease: "katz",
        overwrite: true,
        onUpdate: function () { sync(false); },
        onComplete: function () { render(next, true); fit(next, false); }
      });
      fit(next, smooth);
    }

    prevBtn.addEventListener("click", function () { go(index - 1, true); }, { signal: signal });
    nextBtn.addEventListener("click", function () { go(index + 1, true); }, { signal: signal });
    root.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      if (event.target.closest && event.target.closest("button, a")) return;
      event.preventDefault();
      go(index + (event.key === "ArrowRight" ? 1 : -1), true);
    }, { signal: signal });

    var remeasure = setupReviewClamps(function () { fit(index, true); });

    function onResize() {
      remeasure();
      drag.applyBounds({ minX: -((total - 1) * width()), maxX: 0 });
      gsap.set(strip, { x: -index * width() });
      fit(index, false);
    }
    window.addEventListener("resize", onResize);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        if (!alive) return;
        remeasure();
        fit(index, false);
      });
    }

    gsap.set(strip, { x: 0 });
    render(0, false);
    fit(0, false);

    return function () {
      alive = false;
      ac.abort();
      window.removeEventListener("resize", onResize);
      remeasure.stop();
      if (drag) drag.kill();
      gsap.set(strip, { clearProps: "transform" });
      gsap.set(viewport, { clearProps: "height" });
      cards.forEach(function (card) {
        card.removeAttribute("aria-hidden");
        card.removeAttribute("inert");
      });
    };
  }

  function mountReveals(opts) {
    var splits = [];
    gsap.utils.toArray("h1, h2").forEach(function (heading) {
      if (heading.closest(".pair")) return;
      var immediate = !!heading.closest(".hero");
      splits.push(SplitText.create(heading, {
        type: "lines",
        mask: "lines",
        autoSplit: true,
        aria: "auto",
        onSplit: function (self) {
          return gsap.from(self.lines, {
            yPercent: 110,
            duration: 0.85,
            stagger: 0.06,
            ease: "katz",
            delay: immediate ? 0.08 : 0,
            scrollTrigger: immediate ? null : {
              trigger: heading,
              start: "top 90%",
              once: true
            }
          });
        }
      }));
    });

    gsap.from(".hero-copy .lede", {
      autoAlpha: 0,
      y: 10,
      duration: 0.7,
      stagger: 0.08,
      delay: 0.28,
      ease: "katz"
    });

    gsap.from(".hero-photo img", {
      clipPath: "inset(10% 0% 0% 0%)",
      scale: 1.04,
      duration: 1.15,
      ease: "katz",
      clearProps: "clipPath,scale,transform"
    });

    ScrollTrigger.batch("#services article, #process .steps li", {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        gsap.from(batch, {
          autoAlpha: 0,
          y: 14,
          duration: 0.7,
          stagger: 0.07,
          ease: "katz",
          overwrite: "auto"
        });
      }
    });

    if (opts.parallax) {
      gsap.fromTo(".carousel .slide img", {
        yPercent: 2.5,
        scale: 1.05
      }, {
        yPercent: -2.5,
        scale: 1.05,
        ease: "none",
        scrollTrigger: {
          trigger: "#project-carousel",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.4
        }
      });
    }

    return function () {
      splits.forEach(function (split) {
        if (split && split.isSplit) split.revert();
      });
    };
  }

  function mountCarousel(opts) {
    var strip = document.getElementById("project-strip");
    if (!strip) return function () {};
    var slides = Array.prototype.slice.call(strip.querySelectorAll(".slide"));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".dot"));
    var prevBtn = carousel.querySelector(".car-prev");
    var nextBtn = carousel.querySelector(".car-next");
    var countEl = carousel.querySelector(".car-count");
    var live = document.getElementById("car-live");
    var total = slides.length;
    var index = 0;
    var announced = 0;
    var ac = new AbortController();
    var signal = ac.signal;

    function width() { return viewport.clientWidth || 1; }

    function snapX(x) {
      var w = width();
      var n = Math.round(-x / w);
      n = Math.max(0, Math.min(total - 1, n));
      return -n * w;
    }

    function render(i, announce) {
      index = Math.max(0, Math.min(total - 1, i));
      if (countEl) countEl.textContent = (index + 1) + " / " + total;
      prevBtn.disabled = index === 0;
      nextBtn.disabled = index === total - 1;
      dots.forEach(function (dot, n) {
        if (n === index) dot.setAttribute("aria-current", "true");
        else dot.removeAttribute("aria-current");
      });
      slides.forEach(function (slide, n) {
        var img = slide.querySelector("img");
        if (img && Math.abs(n - index) <= 1) img.loading = "eager";
        slide.setAttribute("aria-hidden", n === index ? "false" : "true");
      });
      if (announce && live && index !== announced) {
        live.textContent = "Photo " + (index + 1) + " of " + total + ".";
        announced = index;
      }
    }

    function sync(announce) {
      render(Math.round(-Number(gsap.getProperty(strip, "x") || 0) / width()), announce);
    }

    var drag = Draggable.create(strip, {
      type: "x",
      trigger: viewport,
      bounds: { minX: -((total - 1) * width()), maxX: 0 },
      inertia: !!opts.motion,
      throwResistance: 1200,
      maxDuration: 0.45,
      minDuration: 0.15,
      snap: snapX,
      edgeResistance: 0.85,
      zIndexBoost: false,
      allowNativeTouchScrolling: true,
      cursor: "grab",
      activeCursor: "grabbing",
      onDragStart: function () { viewport.classList.add("is-dragging"); },
      onDrag: function () { sync(false); },
      onThrowUpdate: function () { sync(false); },
      onDragEnd: function () {
        viewport.classList.remove("is-dragging");
        if (!opts.motion) {
          gsap.set(strip, { x: snapX(this.x) });
          sync(true);
        }
      },
      onThrowComplete: function () { sync(true); }
    })[0];

    function go(i, smooth) {
      var next = Math.max(0, Math.min(total - 1, i));
      if (drag.tween) drag.tween.kill();
      gsap.killTweensOf(strip);
      gsap.to(strip, {
        x: -next * width(),
        duration: smooth && opts.motion ? 0.6 : 0,
        ease: "katz",
        overwrite: true,
        onUpdate: function () { sync(false); },
        onComplete: function () { render(next, true); }
      });
    }

    prevBtn.addEventListener("click", function () { go(index - 1, true); }, { signal: signal });
    nextBtn.addEventListener("click", function () { go(index + 1, true); }, { signal: signal });
    dots.forEach(function (dot, n) {
      dot.addEventListener("click", function () { go(n, true); }, { signal: signal });
    });
    carousel.addEventListener("keydown", function (event) {
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      if (event.altKey || event.ctrlKey || event.metaKey) return;
      event.preventDefault();
      go(index + (event.key === "ArrowRight" ? 1 : -1), true);
    }, { signal: signal });

    function onResize() {
      drag.applyBounds({ minX: -((total - 1) * width()), maxX: 0 });
      gsap.set(strip, { x: -index * width() });
    }
    window.addEventListener("resize", onResize);

    slides.forEach(function (slide) {
      var img = slide.querySelector("img");
      if (img) img.setAttribute("draggable", "false");
    });
    gsap.set(strip, { x: 0 });
    render(0, false);

    return function () {
      ac.abort();
      window.removeEventListener("resize", onResize);
      if (drag) drag.kill();
      gsap.set(strip, { clearProps: "transform" });
    };
  }

  function mountCompare(opts) {
    var root = document.getElementById("compare-widget");
    if (!root) return function () {};
    var pairs = Array.prototype.slice.call(root.querySelectorAll(".pair"));
    var prev = root.querySelector(".cmp-prev");
    var next = root.querySelector(".cmp-next");
    var count = root.querySelector(".cmp-count");
    var live = document.getElementById("cmp-live");
    var total = pairs.length;
    var index = 0;
    var ac = new AbortController();
    var signal = ac.signal;
    var hint = null;
    var drags = [];

    function pointerX(event) {
      if (!event) return null;
      if (event.touches && event.touches.length) return event.touches[0].clientX;
      if (event.changedTouches && event.changedTouches.length) return event.changedTouches[0].clientX;
      return event.clientX;
    }

    function applyReveal(handle) {
      var stage = handle.closest(".stage");
      var w = stage.clientWidth || 1;
      var x = Number(gsap.getProperty(handle, "x")) || 0;
      var percent = ((x + handle.offsetWidth / 2) / w) * 100;
      percent = Math.max(0, Math.min(100, percent));
      stage.style.setProperty("--reveal", percent + "%");
      var rounded = Math.round(percent);
      handle.setAttribute("aria-valuenow", String(rounded));
      handle.setAttribute("aria-valuetext", rounded + " percent after");
    }

    function boundsFor(stage, handle) {
      var w = stage.clientWidth || 1;
      var half = handle.offsetWidth / 2;
      return { minX: -half, maxX: Math.max(-half, w - half) };
    }

    function place(handle, percent) {
      var stage = handle.closest(".stage");
      var drag = handle._katzDrag;
      if (drag && drag.tween) drag.tween.kill();
      gsap.killTweensOf(handle);
      var w = stage.clientWidth || 1;
      gsap.set(handle, { left: 0, x: (percent / 100) * w - handle.offsetWidth / 2 });
      applyReveal(handle);
    }

    pairs.forEach(function (pair) {
      var stage = pair.querySelector(".stage");
      var handle = pair.querySelector(".handle");
      if (!stage || !handle) return;
      gsap.set(handle, { left: 0, x: 0 });
      var drag = Draggable.create(handle, {
        type: "x",
        trigger: stage,
        bounds: boundsFor(stage, handle),
        inertia: opts.motion ? { resistance: 800, maxDuration: 0.45 } : false,
        edgeResistance: 0.9,
        zIndexBoost: false,
        allowNativeTouchScrolling: true,
        cursor: "ew-resize",
        activeCursor: "ew-resize",
        onPressInit: function (event) {
          if (hint) hint.kill();
          var x = pointerX(event);
          if (x == null) return;
          var rect = stage.getBoundingClientRect();
          gsap.set(handle, { x: x - rect.left - handle.offsetWidth / 2 });
        },
        onDrag: function () { applyReveal(handle); },
        onThrowUpdate: function () { applyReveal(handle); }
      })[0];
      handle._katzDrag = drag;
      drags.push(drag);
      handle.addEventListener("keydown", function (event) {
        var current = Number(handle.getAttribute("aria-valuenow"));
        if (!isFinite(current)) current = 50;
        var step = event.shiftKey ? 10 : 5;
        var nextValue = null;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") nextValue = current + step;
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextValue = current - step;
        else if (event.key === "Home") nextValue = 0;
        else if (event.key === "End") nextValue = 100;
        if (nextValue === null) return;
        event.preventDefault();
        if (hint) hint.kill();
        place(handle, Math.max(0, Math.min(100, nextValue)));
      }, { signal: signal });
      pair.querySelectorAll("img").forEach(function (img) {
        img.setAttribute("draggable", "false");
      });
    });

    function show(i, announce) {
      index = Math.max(0, Math.min(total - 1, i));
      pairs.forEach(function (pair, n) {
        var on = n === index;
        pair.hidden = !on;
        if (!on) return;
        pair.querySelectorAll("img").forEach(function (img) { img.loading = "eager"; });
        var handle = pair.querySelector(".handle");
        var stage = pair.querySelector(".stage");
        if (handle && handle._katzDrag) handle._katzDrag.applyBounds(boundsFor(stage, handle));
        if (handle) place(handle, 50);
      });
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === total - 1;
      if (count) count.textContent = (index + 1) + " / " + total;
      if (announce && live) {
        var label = pairs[index].querySelector(".pair-label");
        live.textContent = (index + 1) + " of " + total + (label ? ". " + label.textContent.trim() : ".");
      }
    }

    if (prev) prev.addEventListener("click", function () {
      if (hint) hint.kill();
      show(index - 1, true);
    }, { signal: signal });
    if (next) next.addEventListener("click", function () {
      if (hint) hint.kill();
      show(index + 1, true);
    }, { signal: signal });

    show(0, false);

    if (opts.motion && pairs[0]) {
      var first = pairs[0];
      var handle = first.querySelector(".handle");
      var stage = first.querySelector(".stage");
      hint = gsap.timeline({
        scrollTrigger: { trigger: "#compare", start: "top 75%", once: true },
        onStart: function () { if (handle._katzDrag && handle._katzDrag.tween) handle._katzDrag.tween.kill(); }
      });
      hint.to(handle, {
        x: function () { return stage.clientWidth * 0.62 - handle.offsetWidth / 2; },
        duration: 0.45,
        ease: "katz",
        onUpdate: function () { applyReveal(handle); }
      }).to(handle, {
        x: function () { return stage.clientWidth * 0.5 - handle.offsetWidth / 2; },
        duration: 0.65,
        ease: "katz",
        onUpdate: function () { applyReveal(handle); }
      });
    }

    function onResize() {
      var pair = pairs[index];
      if (!pair) return;
      var handle = pair.querySelector(".handle");
      var stage = pair.querySelector(".stage");
      if (!handle || !stage) return;
      var percent = Number(handle.getAttribute("aria-valuenow"));
      if (!isFinite(percent)) percent = 50;
      if (handle._katzDrag) handle._katzDrag.applyBounds(boundsFor(stage, handle));
      place(handle, percent);
    }
    window.addEventListener("resize", onResize);

    return function () {
      ac.abort();
      window.removeEventListener("resize", onResize);
      if (hint) hint.kill();
      drags.forEach(function (drag) { drag.kill(); });
      pairs.forEach(function (pair) {
        var handle = pair.querySelector(".handle");
        if (handle) {
          delete handle._katzDrag;
          gsap.set(handle, { clearProps: "transform,left" });
        }
      });
    };
  }

  function initCarousel(carousel, viewport) {
  var slides = Array.prototype.slice.call(viewport.querySelectorAll(".slide"));
  var dots = Array.prototype.slice.call(carousel.querySelectorAll(".dot"));
  var prevBtn = carousel.querySelector(".car-prev");
  var nextBtn = carousel.querySelector(".car-next");
  var countEl = carousel.querySelector(".car-count");
  var live = document.getElementById("car-live");
  var total = slides.length;
  var index = 0;
  var dragging = false;
  var startX = 0;
  var startScroll = 0;
  var lastX = 0;
  var lastTime = 0;
  var velocity = 0;
  var announced = 0;

  function width() {
    return viewport.clientWidth || 1;
  }

  function render(i, announce) {
    index = Math.max(0, Math.min(total - 1, i));
    if (countEl) countEl.textContent = (index + 1) + " / " + total;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === total - 1;
    dots.forEach(function (dot, n) {
      if (n === index) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    slides.forEach(function (slide, n) {
      var img = slide.querySelector("img");
      if (img && Math.abs(n - index) <= 1) img.loading = "eager";
      slide.setAttribute("aria-hidden", n === index ? "false" : "true");
    });
    if (announce && live && index !== announced) {
      live.textContent = "Photo " + (index + 1) + " of " + total + ".";
      announced = index;
    }
  }

  function go(i, smooth) {
    var next = Math.max(0, Math.min(total - 1, i));
    var behavior = smooth && !prefersReduce() ? "smooth" : "auto";
    viewport.scrollTo({ left: next * width(), behavior: behavior });
    render(next, true);
  }

  prevBtn.addEventListener("click", function () { go(index - 1, true); });
  nextBtn.addEventListener("click", function () { go(index + 1, true); });
  dots.forEach(function (dot, n) {
    dot.addEventListener("click", function () { go(n, true); });
  });

  carousel.addEventListener("keydown", function (event) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    event.preventDefault();
    go(index + (event.key === "ArrowRight" ? 1 : -1), true);
  });

  viewport.addEventListener("pointerdown", function (event) {
    if (event.button !== undefined && event.button !== 0) return;
    dragging = true;
    startX = lastX = event.clientX;
    startScroll = viewport.scrollLeft;
    lastTime = performance.now();
    velocity = 0;
    viewport.classList.add("dragging");
    if (viewport.setPointerCapture) viewport.setPointerCapture(event.pointerId);
    carousel.focus({ preventScroll: true });
  });

  viewport.addEventListener("pointermove", function (event) {
    if (!dragging) return;
    var now = performance.now();
    var dt = now - lastTime || 16;
    velocity = (event.clientX - lastX) / dt;
    lastX = event.clientX;
    lastTime = now;
    viewport.scrollLeft = startScroll - (event.clientX - startX);
    render(Math.round(viewport.scrollLeft / width()), false);
  });

  function endDrag() {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove("dragging");
    var projected = prefersReduce() ? viewport.scrollLeft : viewport.scrollLeft - velocity * 180;
    var next = Math.round(projected / width());
    go(next, !prefersReduce());
  }

  viewport.addEventListener("pointerup", endDrag);
  viewport.addEventListener("pointercancel", endDrag);

  viewport.addEventListener("scroll", function () {
    if (!dragging) return;
    render(Math.round(viewport.scrollLeft / width()), false);
  }, { passive: true });

  if ("onscrollend" in viewport) {
    viewport.addEventListener("scrollend", function () {
      if (dragging) return;
      var next = Math.round(viewport.scrollLeft / width());
      var left = next * width();
      if (Math.abs(viewport.scrollLeft - left) > 2) {
        viewport.scrollTo({ left: left, behavior: prefersReduce() ? "auto" : "smooth" });
      }
      render(next, true);
    });
  }

  window.addEventListener("resize", function () {
    viewport.scrollTo({ left: index * width(), behavior: "auto" });
  });

  slides.forEach(function (slide) {
    var img = slide.querySelector("img");
    if (img) img.setAttribute("draggable", "false");
  });

  render(0, false);
  }

  function initCompare() {
    var root = document.getElementById("compare-widget");
    if (!root) return;
    var pairs = Array.prototype.slice.call(root.querySelectorAll(".pair"));
    var prev = root.querySelector(".cmp-prev");
    var next = root.querySelector(".cmp-next");
    var count = root.querySelector(".cmp-count");
    var live = document.getElementById("cmp-live");
    var total = pairs.length;
    var index = 0;

    function setReveal(pair, value) {
      var reveal = Math.max(0, Math.min(100, value));
      var stage = pair.querySelector(".stage");
      var handle = pair.querySelector(".handle");
      var rounded = Math.round(reveal);
      stage.style.setProperty("--reveal", reveal + "%");
      if (!handle) return;
      handle.setAttribute("aria-valuenow", String(rounded));
      handle.setAttribute("aria-valuetext", rounded + " percent after");
    }

    function show(i, announce) {
      index = Math.max(0, Math.min(total - 1, i));
      pairs.forEach(function (pair, n) {
        var on = n === index;
        pair.hidden = !on;
        if (!on) return;
        pair.querySelectorAll("img").forEach(function (img) {
          img.loading = "eager";
        });
      });
      setReveal(pairs[index], 50);
      if (prev) prev.disabled = index === 0;
      if (next) next.disabled = index === total - 1;
      if (count) count.textContent = (index + 1) + " / " + total;
      if (announce && live) {
        var label = pairs[index].querySelector(".pair-label");
        live.textContent = (index + 1) + " of " + total + (label ? ". " + label.textContent.trim() : ".");
      }
    }

    pairs.forEach(function (pair) {
      var stage = pair.querySelector(".stage");
      var handle = pair.querySelector(".handle");
      var dragging = false;

      function revealFromEvent(event) {
        var rect = stage.getBoundingClientRect();
        if (!rect.width) return;
        setReveal(pair, ((event.clientX - rect.left) / rect.width) * 100);
      }

      stage.addEventListener("pointerdown", function (event) {
        if (event.button !== undefined && event.button !== 0) return;
        dragging = true;
        if (stage.setPointerCapture) stage.setPointerCapture(event.pointerId);
        revealFromEvent(event);
        if (handle) handle.focus({ preventScroll: true });
      });

      stage.addEventListener("pointermove", function (event) {
        if (!dragging) return;
        revealFromEvent(event);
      });

      function endDrag() { dragging = false; }
      stage.addEventListener("pointerup", endDrag);
      stage.addEventListener("pointercancel", endDrag);

      if (!handle) return;
      handle.addEventListener("keydown", function (event) {
        var current = Number(handle.getAttribute("aria-valuenow"));
        if (!isFinite(current)) current = 50;
        var step = event.shiftKey ? 10 : 5;
        var nextValue = null;
        if (event.key === "ArrowRight" || event.key === "ArrowUp") nextValue = current + step;
        else if (event.key === "ArrowLeft" || event.key === "ArrowDown") nextValue = current - step;
        else if (event.key === "Home") nextValue = 0;
        else if (event.key === "End") nextValue = 100;
        if (nextValue === null) return;
        event.preventDefault();
        setReveal(pair, nextValue);
      });
    });

    pairs.forEach(function (pair) {
      pair.querySelectorAll("img").forEach(function (img) {
        img.setAttribute("draggable", "false");
      });
    });

    if (prev) prev.addEventListener("click", function () { show(index - 1, true); });
    if (next) next.addEventListener("click", function () { show(index + 1, true); });
    show(0, false);
  }

  function initForm() {
    var form = document.getElementById("sample-form");
    var note = document.getElementById("form-note");
    if (!form || !note) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      note.hidden = false;
      form.reset();
    });
  }
})();
