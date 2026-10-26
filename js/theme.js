const sun = `<img src="/images/icons/light_mode_20dp_1A1A1A_FILL0_wght400_GRAD0_opsz20.svg" alt="" class="icon-sm" /> Theme`
const moon = `<img src="/images/icons/dark_mode_20dp_E0E0E0_FILL0_wght400_GRAD0_opsz20.svg" alt="" class="icon-sm" /> Theme`

const loginLight = `/images/icons/login_20dp_1A1A1A_FILL0_wght400_GRAD0_opsz20.svg`
const loginDark = `/images/icons/login_20dp_E0E0E0_FILL0_wght400_GRAD0_opsz20.svg`
const logoutLight = `/images/icons/logout_20dp_1A1A1A_FILL0_wght400_GRAD0_opsz20.svg`
const logoutDark = `/images/icons/logout_20dp_E0E0E0_FILL0_wght400_GRAD0_opsz20.svg`

export function getThemeHTML() {
  const isLight = document.documentElement.classList.contains('light-theme')
  return isLight ? sun : moon
}

export function getLoginHTML(label) {
  const isLight = document.documentElement.classList.contains('light-theme')
  const icon = isLight ? loginLight : loginDark
  return `<img src="${icon}" alt="" class="icon-sm" /> ${label}`
}

export function getLogoutHTML(label = 'Sign out') {
  const isLight = document.documentElement.classList.contains('light-theme')
  const icon = isLight ? logoutLight : logoutDark
  return `<img src="${icon}" alt="" class="icon-sm" /> ${label}`
}

document.addEventListener('click', (e) => {
  const themeLink = e.target.closest('#theme')
  if (!themeLink) return

  e.preventDefault()
  document.documentElement.classList.toggle('light-theme')
  
  const isLight = document.documentElement.classList.contains('light-theme')
  localStorage.setItem('theme', isLight ? 'light' : 'dark')
  
  // Updates theme links instantly
  document.querySelectorAll('#theme').forEach(el => {
    el.innerHTML = getThemeHTML()
  })

  // Updates login/logout links instantly on toggle
  document.querySelectorAll('[data-auth-action="login"]').forEach(el => {
    el.innerHTML = getLoginHTML(el.dataset.label)
  })
  document.querySelectorAll('#signout').forEach(el => {
    el.innerHTML = getLogoutHTML('Sign out')
  })
})