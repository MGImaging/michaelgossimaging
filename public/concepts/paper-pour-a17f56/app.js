(function () {
  var form = document.querySelector(".note-form");
  if (!form) return;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var note = document.getElementById("concept-note");
    if (note) note.classList.add("is-on");
    form.reset();
  });
})();
