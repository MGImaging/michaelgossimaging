(function () {
  document.documentElement.classList.add("js");

  var reduceQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  function prefersReduce() { return reduceQuery.matches; }

  if (!prefersReduce() && window.gsap && window.ScrollTrigger) {
    document.documentElement.classList.add("motion");
    gsap.registerPlugin(ScrollTrigger);
    gsap.utils.toArray("[data-reveal]").forEach(function (el) {
      gsap.fromTo(
        el,
        { autoAlpha: 0, y: 12 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 92%",
            once: true
          }
        }
      );
    });
  }

  var carousel = document.getElementById("project-carousel");
  var viewport = document.getElementById("project-track");
  if (carousel && viewport) initCarousel(carousel, viewport);
  initCompare();
  initForm();

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
