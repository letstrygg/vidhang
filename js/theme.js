const sun = `<img src="/images/icons/light_mode_20dp_1A1A1A_FILL0_wght400_GRAD0_opsz20.svg" alt="" class="icon-sm" /> Theme`
const moon = `<img src="/images/icons/dark_mode_20dp_E0E0E0_FILL0_wght400_GRAD0_opsz20.svg" alt="" class="icon-sm" /> Theme`

export function getThemeHTML() {
  const isLight = document.documentElement.classList.contains('light-theme')
  return isLight ? sun : moon
}

document.addEventListener('click', (e) => {
  const themeLink = e.target.closest('#theme')
  if (!themeLink) return

  e.preventDefault()
  document.documentElement.classList.toggle('light-theme')
  
  const isLight = document.documentElement.classList.contains('light-theme')
  localStorage.setItem('theme', isLight ? 'light' : 'dark')
  
  // Updates all theme links on the page instantly when clicked
  document.querySelectorAll('#theme').forEach(el => {
    el.innerHTML = getThemeHTML()
  })
})