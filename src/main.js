import './style.css'

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
