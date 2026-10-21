(function () {
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduce && window.gsap && window.ScrollTrigger) {
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

  var dialog = document.getElementById("lightbox");
  var links = Array.prototype.slice.call(document.querySelectorAll("#project .frame"));
  if (!dialog || typeof dialog.showModal !== "function" || !links.length) return;

  var img = document.getElementById("lb-img");
  var cap = document.getElementById("lb-cap");
  var closeBtn = dialog.querySelector(".lb-close");
  var prevBtn = dialog.querySelector(".lb-prev");
  var nextBtn = dialog.querySelector(".lb-next");
  var index = 0;
  var opener = null;
  var touchX = null;
  var touchOnButton = false;

  function show(i) {
    var count = links.length;
    index = (i + count) % count;
    var link = links[index];
    var photo = link.querySelector("img");
    img.src = link.getAttribute("href");
    img.alt = photo ? photo.getAttribute("alt") || "" : "";
    cap.textContent = link.getAttribute("data-caption") || "";
  }

  function openAt(i, trigger) {
    opener = trigger || null;
    show(i);
    if (!dialog.open) dialog.showModal();
    closeBtn.focus();
  }

  links.forEach(function (link, i) {
    link.addEventListener("click", function (event) {
      event.preventDefault();
      openAt(i, link);
    });
  });

  closeBtn.addEventListener("click", function () { dialog.close(); });
  prevBtn.addEventListener("click", function () { show(index - 1); });
  nextBtn.addEventListener("click", function () { show(index + 1); });

  dialog.addEventListener("close", function () {
    if (opener && typeof opener.focus === "function") opener.focus();
  });

  dialog.addEventListener("keydown", function (event) {
    var buttons = [closeBtn, prevBtn, nextBtn];
    if (event.key === "ArrowRight") {
      event.preventDefault();
      show(index + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(index - 1);
    } else if (event.key === "Tab") {
      var first = buttons[0];
      var last = buttons[buttons.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  dialog.addEventListener("touchstart", function (event) {
    if (!event.changedTouches || !event.changedTouches.length) return;
    touchX = event.changedTouches[0].clientX;
    touchOnButton = !!(event.target.closest && event.target.closest("button"));
  }, { passive: true });

  dialog.addEventListener("touchend", function (event) {
    if (touchX == null || touchOnButton || !event.changedTouches || !event.changedTouches.length) {
      touchX = null;
      return;
    }
    var delta = event.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(delta) < 48) return;
    show(delta < 0 ? index + 1 : index - 1);
  }, { passive: true });
})();
