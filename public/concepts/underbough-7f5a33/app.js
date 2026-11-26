(function () {
  var form = document.querySelector(".yard-form");
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
  gsap.from(".hero-media img", {
    scale: 1.08,
    duration: 1.4,
    ease: "power2.out",
    clearProps: "transform"
  });
})();
