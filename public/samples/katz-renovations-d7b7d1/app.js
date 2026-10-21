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
  if (!carousel || !viewport) return;

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

  function captions() {
    return slides.map(function (slide) {
      var cap = slide.querySelector(".cap");
      return cap ? cap.textContent.trim() : "";
    });
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
      live.textContent = (index + 1) + " of " + total + ". " + captions()[index];
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
})();
