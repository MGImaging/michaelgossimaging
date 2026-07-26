import './style.css'

// Mobile navigation toggle
const menuBtn = document.getElementById('menu-btn')
const mobileNav = document.getElementById('mobile-nav')

if (menuBtn && mobileNav) {
  menuBtn.addEventListener('click', () => {
    const isOpen = mobileNav.classList.contains('nav-open')
    mobileNav.classList.toggle('nav-open', !isOpen)
    mobileNav.classList.toggle('nav-closed', isOpen)
    menuBtn.setAttribute('aria-expanded', String(!isOpen))
  })

  mobileNav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('nav-open')
      mobileNav.classList.add('nav-closed')
      menuBtn.setAttribute('aria-expanded', 'false')
    })
  })
}

// Sticky header elevation on scroll
const header = document.getElementById('site-header')
if (header) {
  const onScroll = () => {
    if (window.scrollY > 12) {
      header.classList.add('shadow-md')
    } else {
      header.classList.remove('shadow-md')
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()
}

// Contact form — opens the visitor's email client (email-only)
const form = document.getElementById('contact-form')
const formStatus = document.getElementById('form-status')

if (form && formStatus) {
  form.addEventListener('submit', (e) => {
    e.preventDefault()
    const data = new FormData(form)
    const name = data.get('name')?.toString().trim()
    const email = data.get('email')?.toString().trim()
    const phone = data.get('phone')?.toString().trim()
    const project = data.get('project')?.toString().trim()
    const message = data.get('message')?.toString().trim()
    const to = form.dataset.contactEmail || 'michael@michaelgossimaging.com'

    if (!name || !email || !message) {
      formStatus.textContent = 'Please fill in all required fields.'
      formStatus.className = 'mt-4 text-sm text-red-700'
      return
    }

    const subject = `Quote request from ${name}`
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      phone ? `Phone: ${phone}` : null,
      project ? `Project type: ${project}` : null,
      '',
      'Quote request:',
      message,
    ]
      .filter((line) => line !== null)
      .join('\n')

    const mailto = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto

    formStatus.textContent =
      'Opening your email application to send the quote request. If nothing opens, email michael@michaelgossimaging.com directly.'
    formStatus.className = 'mt-4 text-sm text-forest-700'
  })
}

// Current year in footer
const yearEl = document.getElementById('year')
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear())
}
