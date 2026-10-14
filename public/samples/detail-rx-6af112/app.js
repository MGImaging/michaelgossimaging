const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const services = {
  gold: { name: "Gold Level Package", amount: 449, kind: "flat", note: "3 hours 30 minutes." },
  platinum: { name: "Platinum Level Package", amount: 749, kind: "flat", note: "6 hours." },
  enhance: { name: "Enhancement Correction", amount: 495, kind: "from", note: "Single-stage polish and a sealant." },
  multi: { name: "Multi-Stage Correction", amount: 1095, kind: "from", note: "Most popular. Deeper correction and an interior reset." },
  c1: { name: "1 Year Ceramic Coating", amount: 995, kind: "flat" },
  c5: { name: "5 Year Ceramic Coating", amount: 1495, kind: "flat" },
  c7: { name: "7 Year Ceramic Coating", amount: 1995, kind: "flat" },
  c25: { name: "25 Year Coating", amount: null, kind: "quote", note: "Requires inspection." },
  detail: { name: "Interior and exterior detail", amount: null, kind: "quote", note: "Quoted on inspection." }
};

const addons = {
  engine: { name: "Engine bay detail", amount: 50, kind: "flat" },
  leather: { name: "Leather cleaning and conditioning", amount: 75, kind: "flat" },
  restore: { name: "Leather restoration", amount: null, kind: "quote" },
  top: { name: "Convertible top clean and protect", amount: 100, kind: "flat" },
  odor: { name: "Odor removal", amount: 100, kind: "flat" },
  lights: { name: "Headlight restoration", amount: 100, kind: "flat" },
  ceramic: { name: "Ceramic upgrade", amount: 300, kind: "from" },
  correction: { name: "Paint correction add-on", amount: null, kind: "size" }
};

function money(n) {
  return "$" + Math.round(n).toLocaleString("en-US");
}

function estimate() {
  const size = document.querySelector('input[name="size"]:checked').value;
  const base = services[document.querySelector("#service").value];
  const picked = [...document.querySelectorAll('input[name="addon"]:checked')].map((el) => addons[el.value]);
  let total = 0;
  let from = false;
  let quote = false;
  const lines = [];
  function add(item) {
    if (item.kind === "quote" || item.amount == null) {
      quote = true;
      lines.push(item.name + ": quoted on inspection");
      return;
    }
    if (item.kind === "from") from = true;
    total += item.amount;
    lines.push(item.name + ": " + (item.kind === "from" ? "starting at " : "") + money(item.amount));
  }
  add(base);
  picked.forEach((item) => {
    if (item.kind === "size") {
      if (size === "sedan") add({ name: item.name + " (sedan)", amount: 250, kind: "flat" });
      else if (size === "truck") add({ name: item.name + " (truck)", amount: 350, kind: "flat" });
      else add({ name: item.name, amount: null, kind: "quote" });
      return;
    }
    add(item);
  });
  const out = document.querySelector("#estimate-out");
  const detail = document.querySelector("#estimate-lines");
  if (!total && quote) out.textContent = "Quoted on inspection";
  else out.textContent = (from ? "Starting at " : "") + money(total);
  detail.textContent = lines.join(" · ") + (quote && total ? " Some add-ons are quoted on inspection." : "");
}

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

function requestText() {
  const data = new FormData(document.querySelector("#book"));
  return [
    "Detail Rx request. This is not a confirmed booking.",
    "Vehicle: " + (data.get("vehicle") || ""),
    "Service: " + (services[data.get("book-service")] ? services[data.get("book-service")].name : data.get("book-service")),
    "Date: " + (data.get("date") || ""),
    "Time: " + (data.get("time") || ""),
    "Location: " + (data.get("location") || ""),
    "Notes: " + (data.get("notes") || "None")
  ].join("\n");
}

async function sendRequest(kind) {
  const form = document.querySelector("#book-form");
  if (!form.reportValidity()) return;
  const files = [...document.querySelector("#photos").files];
  let text = requestText();
  if (files.length && navigator.canShare && navigator.canShare({ files })) {
    try {
      await navigator.share({ title: "Detail Rx request", text, files });
      document.querySelector("#book-note").textContent = "Share sheet opened. The shop still needs to confirm the time.";
      return;
    } catch (err) {
      if (err && err.name === "AbortError") return;
    }
  }
  if (files.length) text += "\nI have photos to attach.";
  if (kind === "sms") {
    location.href = "sms:+17204414880?body=" + encodeURIComponent(text);
  } else {
    location.href = "mailto:detailrxllc@gmail.com?subject=" + encodeURIComponent("Detail Rx request") + "&body=" + encodeURIComponent(text);
  }
  document.querySelector("#book-note").textContent = "Your message app should open with the request. It is not a confirmed booking.";
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

function pickPackage(id) {
  document.querySelector("#service").value = id;
  estimate();
  document.querySelector("#estimate").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
}

function animate() {
  if (reduce || !window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);
  const chars = document.querySelectorAll(".split .ch");
  gsap.from(chars, { y: 40, opacity: 0, stagger: 0.02, duration: 0.7, ease: "power3.out", delay: 0.15 });
  gsap.from(".hero-copy .kicker, .hero-copy .lede, .hero-copy .cta", {
    y: 24, opacity: 0, stagger: 0.08, duration: 0.6, delay: 0.45
  });
  gsap.to(".sheen", { xPercent: 120, duration: 1.6, delay: 0.2, ease: "power2.inOut" });
  gsap.utils.toArray(".reveal").forEach((el) => {
    gsap.from(el, {
      scrollTrigger: { trigger: el, start: "top 85%" },
      y: 28,
      opacity: 0,
      duration: 0.6
    });
  });
  document.querySelectorAll(".count").forEach((el) => {
    const end = Number(el.dataset.count);
    const obj = { val: 0 };
    ScrollTrigger.create({
      trigger: el,
      start: "top 88%",
      once: true,
      onEnter() {
        gsap.to(obj, {
          val: end,
          duration: 1.1,
          ease: "power2.out",
          onUpdate() { el.textContent = Math.round(obj.val).toLocaleString("en-US"); }
        });
      }
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
    const trigger = ScrollTrigger.create({
      trigger: "#process",
      start: "top top",
      end: "+=" + steps.length * 70 + "%",
      pin: true,
      scrub: 0.4,
      onUpdate(self) {
        const i = Math.min(steps.length - 1, Math.floor(self.progress * steps.length));
        show(i);
      }
    });
    document.querySelector("#process").dataset.pinned = "true";
    void trigger;
  }
  const magnet = document.querySelector(".magnet");
  if (magnet && window.matchMedia("(pointer: fine)").matches) {
    magnet.addEventListener("mousemove", (event) => {
      const rect = magnet.getBoundingClientRect();
      const x = event.clientX - (rect.left + rect.width / 2);
      const y = event.clientY - (rect.top + rect.height / 2);
      gsap.to(magnet, { x: x * 0.28, y: y * 0.4, duration: 0.25 });
    });
    magnet.addEventListener("mouseleave", () => gsap.to(magnet, { x: 0, y: 0, duration: 0.4 }));
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
  document.querySelector("#estimator").addEventListener("change", estimate);
  document.querySelector("#area-form").addEventListener("submit", areaCheck);
  document.querySelector("#text-request").addEventListener("click", () => sendRequest("sms"));
  document.querySelector("#email-request").addEventListener("click", () => sendRequest("email"));
  document.querySelectorAll("[data-pick]").forEach((btn) => {
    btn.addEventListener("click", () => pickPackage(btn.dataset.pick));
  });
  estimate();
  slider();
  splitHeading();
  animate();
});
