import './style.css'

const motionOn = document.documentElement.classList.contains('motion')

function showHeadline() {
  document.querySelectorAll('.hero .line-inner').forEach((el) => {
    el.style.transform = 'none'
  })
}

if (motionOn) {
  window.setTimeout(showHeadline, 2800)

  const desktopSmooth = window.matchMedia('(min-width: 1000px) and (hover: hover) and (pointer: fine)').matches

  Promise.all([import('gsap'), import('gsap/ScrollTrigger')])
    .then(async ([{ default: gsap }, { ScrollTrigger }]) => {
      gsap.registerPlugin(ScrollTrigger)

      let Lenis = null
      if (desktopSmooth) {
        try {
          const lenisMod = await import('lenis')
          await import('lenis/dist/lenis.css')
          Lenis = lenisMod.default
        } catch {
          Lenis = null
        }
      }

      if (Lenis) {
        const lenis = new Lenis({
          autoRaf: false,
          lerp: 0.12,
          anchors: { offset: -80 },
        })
        lenis.on('scroll', ScrollTrigger.update)
        gsap.ticker.add((time) => {
          lenis.raf(time * 1000)
        })
        gsap.ticker.lagSmoothing(0)
        document.documentElement.style.scrollBehavior = 'auto'
      }

      const lines = gsap.utils.toArray('.hero .line-inner')
      if (lines.length) {
        gsap.fromTo(lines, { yPercent: 110 }, {
          yPercent: 0,
          duration: 1.05,
          ease: 'power4.out',
          stagger: 0.08,
          delay: 0.12,
        })
      }

      gsap.utils.toArray('[data-reveal]').forEach((el) => {
        gsap.from(el, {
          y: 48,
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

      gsap.utils.toArray('.shot-frame img').forEach((img) => {
        const frame = img.closest('.shot')
        if (!frame) return
        gsap.fromTo(img, { yPercent: -8, scale: 1.12 }, {
          yPercent: 6,
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

      const mm = gsap.matchMedia()
      mm.add('(min-width: 1000px)', () => {
        const section = document.querySelector('.process')
        const sticky = document.querySelector('.process-sticky')
        const track = document.querySelector('.steps')
        const windowEl = document.querySelector('.process-window')
        if (!section || !sticky || !track || !windowEl) return undefined
        section.classList.add('pin-ready')
        const distance = () => {
          const last = track.lastElementChild
          if (!last) return 0
          const end = last.offsetLeft + last.offsetWidth
          const visible = windowEl.clientWidth - track.offsetLeft
          return Math.max(0, end - visible + 28)
        }
        gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: sticky,
            start: 'top 4.75rem',
            end: () => `+=${Math.max(distance(), 1)}`,
            pin: true,
            scrub: 0.65,
            invalidateOnRefresh: true,
            anticipatePin: 1,
          },
        })
        return () => {
          section.classList.remove('pin-ready')
        }
      })

      const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches
      if (fine) {
        const cursor = document.querySelector('.cursor')
        if (cursor) {
          const xTo = gsap.quickTo(cursor, 'x', { duration: 0.45, ease: 'power3.out' })
          const yTo = gsap.quickTo(cursor, 'y', { duration: 0.45, ease: 'power3.out' })
          window.addEventListener('pointermove', (event) => {
            xTo(event.clientX)
            yTo(event.clientY)
          }, { passive: true })
        }

        document.querySelectorAll('[data-magnetic]').forEach((el) => {
          const xTo = gsap.quickTo(el, 'x', { duration: 0.35, ease: 'power3.out' })
          const yTo = gsap.quickTo(el, 'y', { duration: 0.35, ease: 'power3.out' })
          const limit = el.classList.contains('build') ? 16 : 8
          el.addEventListener('pointermove', (event) => {
            const rect = el.getBoundingClientRect()
            const dx = event.clientX - (rect.left + rect.width / 2)
            const dy = event.clientY - (rect.top + rect.height / 2)
            xTo(Math.max(-limit, Math.min(limit, dx * 0.2)))
            yTo(Math.max(-limit, Math.min(limit, dy * 0.25)))
          })
          el.addEventListener('pointerleave', () => {
            xTo(0)
            yTo(0)
          })
        })
      }

      window.addEventListener('load', () => ScrollTrigger.refresh())
    })
    .catch(showHeadline)
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
