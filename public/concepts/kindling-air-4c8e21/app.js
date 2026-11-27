(function () {
  var form = document.querySelector(".visit-form");
  if (form) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var note = document.getElementById("concept-note");
      if (note) note.classList.add("is-on");
      form.reset();
    });
  }

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !window.gsap) return;

  gsap.from(".hero-copy > *", {
    y: 16,
    autoAlpha: 0,
    duration: 0.75,
    stagger: 0.07,
    ease: "power2.out",
    clearProps: "opacity,visibility,transform"
  });
  gsap.from(".hero-photo img", {
    scale: 1.06,
    duration: 1.15,
    ease: "power2.out",
    clearProps: "transform"
  });
})();
