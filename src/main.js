import './style.css'

const motionOn = document.documentElement.classList.contains('motion')
if (motionOn) {
  Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
    .then(([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)
      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 40,
          autoAlpha: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 88%',
            once: true,
          },
        })
      })
      gsap.utils.toArray('.browser img').forEach((img) => {
        const frame = img.closest('.browser')
        if (!frame) return
        gsap.fromTo(img, { scale: 1.07 }, {
          scale: 1,
          ease: 'none',
          scrollTrigger: {
            trigger: frame,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        })
      })
    })
    .catch(() => {})
}

const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

const form = document.querySelector('form')
const status = document.getElementById('form-status')
if (form && status) {
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    const data = new FormData(form)
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const topic = String(data.get('topic') || '').trim()
    const message = String(data.get('message') || '').trim()
    if (!name || !email || !message) {
      status.textContent = 'Name, email, and a message are required.'
      return
    }
    const body = [`Name: ${name}`, `Email: ${email}`, `Topic: ${topic}`, '', message].join('\n')
    const mailto = `mailto:michael@michaelgossimaging.com?subject=${encodeURIComponent(`Note from ${name}`)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    status.textContent = 'Opening your email app. If it does not open, use michael@michaelgossimaging.com.'
  })
}
