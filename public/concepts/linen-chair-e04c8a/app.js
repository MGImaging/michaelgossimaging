(function () {
  var form = document.querySelector(".book-form");
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
  gsap.from(".display", {
    y: 28,
    autoAlpha: 0,
    duration: 0.9,
    ease: "power3.out",
    clearProps: "opacity,visibility,transform"
  });
})();
