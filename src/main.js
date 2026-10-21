import './style.css'

const motionOn = document.documentElement.classList.contains('motion')

if (motionOn) {
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
      mm.add('(min-width: 1000px) and (hover: hover) and (pointer: fine)', () => {
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

      if (desktopSmooth) {
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
            if (event.pointerType === 'touch') return
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
    .catch(() => {})
}

const yearEl = document.getElementById('year')
if (yearEl) yearEl.textContent = String(new Date().getFullYear())

const form = document.querySelector('form')
const status = document.getElementById('form-status')
if (form && status) {
  const showSuccess = () => {
    status.className = 'form-ok'
    status.textContent = 'Got it, I’ll reply within one business day.'
  }
  const showError = () => {
    status.className = 'form-error'
    status.replaceChildren('That did not send. Email ')
    const link = document.createElement('a')
    link.href = 'mailto:michael@michaelgossimaging.com'
    link.textContent = 'michael@michaelgossimaging.com'
    status.append(link, '.')
  }
  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const data = new FormData(form)
    if (String(data.get('_honey') || '').trim()) {
      showSuccess()
      return
    }
    const name = String(data.get('name') || '').trim()
    const email = String(data.get('email') || '').trim()
    const need = String(data.get('need') || '').trim()
    const message = String(data.get('message') || '').trim()
    if (!name || !email || !need) {
      status.className = 'form-error'
      status.textContent = 'Name, email, and what you need are required.'
      return
    }
    const button = form.querySelector('button')
    if (button) button.disabled = true
    status.className = ''
    status.textContent = ''
    try {
      const response = await fetch('https://formsubmit.co/ajax/michael@michaelgossimaging.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          name,
          email,
          need,
          message,
          _subject: 'New lead from michaelgossimaging.com',
          _template: 'table',
          _captcha: 'false',
          _honey: '',
        }),
      })
      const payload = await response.json().catch(() => null)
      if (!response.ok || (payload && String(payload.success) === 'false')) throw new Error('send failed')
      form.reset()
      showSuccess()
    } catch {
      showError()
    } finally {
      if (button) button.disabled = false
    }
  })
}
