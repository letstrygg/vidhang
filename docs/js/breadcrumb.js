const nav = document.querySelector('header > nav')

if (nav) {
  const host = window.location.hostname.replace(/^www\./, '')
  const parts = window.location.pathname.split('/').filter( p => p && p !== 'index.html')

  if (parts.length === 0) {
    nav.textContent = host
  } else {
    let html = `<a href="/">${host}</a>`
    let path = ''
    parts.forEach((part, i) => {
      path += `/${part}`
      const name = decodeURIComponent(part)
      html += ` / ` + (i === parts.length - 1 ? name : `<a href="${path}">${name}</a>`)
    })
    nav.innerHTML = html
  }
}