const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function areaCheck(event) {
  event.preventDefault();
  const raw = document.querySelector("#place").value.trim().toLowerCase().replace(/\./g, "");
  const box = document.querySelector("#area-out");
  const cities = {
    aurora: "Aurora",
    denver: "Denver",
    parker: "Parker",
    "highlands ranch": "Highlands Ranch",
    highlandsranch: "Highlands Ranch",
    "castle rock": "Castle Rock",
    castlerock: "Castle Rock",
    englewood: "Englewood"
  };
  if (!raw) {
    box.textContent = "Enter a city or ZIP.";
    return;
  }
  if (raw === "80017") {
    box.textContent = "80017 is the Aurora drop-off. The address is 648 South Kalispell Way, Aurora, CO 80017. Mobile service also covers Aurora.";
    return;
  }
  if (/^\d{5}$/.test(raw)) {
    box.textContent = "That ZIP is not on the short list here. Text (720) 441-4880 and ask about mobile service or the Aurora drop-off.";
    return;
  }
  const city = cities[raw];
  if (!city) {
    box.textContent = "That city is outside Aurora, Denver, Parker, Highlands Ranch, Castle Rock, and Englewood. Text the shop and ask.";
    return;
  }
  box.textContent = "Mobile service comes to " + city + ". Drop-off is at 648 South Kalispell Way, Aurora, CO 80017.";
}

function slider() {
  const box = document.querySelector(".ba");
  const clip = box.querySelector(".clip");
  const range = box.querySelector("input");
  const handle = box.querySelector(".handle");
  const before = clip.querySelector("img");
  function size() {
    before.style.width = box.clientWidth + "px";
  }
  function move() {
    const value = range.value + "%";
    clip.style.width = value;
    handle.style.left = value;
  }
  size();
  move();
  range.addEventListener("input", move);
  window.addEventListener("resize", size);
}

function animate() {
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const chars = document.querySelectorAll(".split .ch");
  gsap.from(chars, { y: 28, opacity: 0, stagger: 0.015, duration: 0.45, ease: "power3.out", delay: 0.08 });
  gsap.from(".hero-copy .kicker, .hero-copy .lede, .hero-copy .hero-actions", {
    y: 16, opacity: 0, stagger: 0.06, duration: 0.4, delay: 0.2
  });
  gsap.to(".sheen", { xPercent: 120, duration: 1.05, delay: 0.12, ease: "power2.inOut" });
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 88%" },
      y: 18,
      opacity: 0,
      duration: 0.4
    });
  });
  gsap.utils.toArray(".course").forEach((course) => {
    const items = course.querySelectorAll(".pkg, .dish");
    if (!items.length) return;
    gsap.from(items, {
      scrollTrigger: { trigger: course, start: "top 84%" },
      y: 12,
      opacity: 0,
      stagger: 0.05,
      duration: 0.35,
      ease: "power2.out"
    });
  });
  const steps = [...document.querySelectorAll(".step")];
  if (steps.length && window.innerWidth >= 800) {
    const visual = document.querySelector("#step-visual");
    function show(i) {
      const step = steps[i];
      visual.querySelector("b").textContent = String(i + 1).padStart(2, "0");
      visual.querySelector("h3").textContent = step.dataset.title;
      visual.querySelector("p").textContent = step.dataset.copy;
      steps.forEach((el, n) => el.classList.toggle("is-on", n === i));
    }
    show(0);
    ScrollTrigger.create({
      trigger: "#process",
      start: "top top",
      end: "+=" + steps.length * 55 + "%",
      pin: true,
      scrub: 0.25,
      onUpdate(self) {
        const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        show(i);
      }
    });
    document.querySelector("#process").dataset.pinned = "true";
  }
  const magnet = document.querySelector(".magnet");
  if (magnet && window.matchMedia("(pointer: fine)").matches) {
    magnet.addEventListener("mousemove", (event) => {
      const rect = magnet.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      gsap.to(magnet, { x: x * 0.22, y: y * 0.28, duration: 0.2 });
    });
    magnet.addEventListener("mouseleave", () => gsap.to(magnet, { x: 0, y: 0, duration: 0.3 }));
  }
}

function splitHeading() {
  if (reduce) return;
  document.querySelectorAll(".split").forEach((el) => {
    const text = el.textContent.trim();
    el.textContent = "";
    text.split(/\s+/).forEach((word, index) => {
      if (index) el.appendChild(document.createTextNode(" "));
      const wrap = document.createElement("span");
      wrap.className = "word";
      [...word].forEach((ch) => {
        const span = document.createElement("span");
        span.className = "ch";
        span.textContent = ch;
        wrap.appendChild(span);
      });
      el.appendChild(wrap);
    });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelector("#area-form").addEventListener("submit", areaCheck);
  slider();
  splitHeading();
  animate();
});
