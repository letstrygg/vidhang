import { supabase } from './supabase.js'

const savedTheme = localStorage.getItem('theme')
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches

if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
  document.body.classList.add('light-theme')
}

const sunIconHTML = `<img src="/images/icons/light_mode_125dp_E66B00_FILL0_wght400_GRAD0_opsz48.svg" alt="" class="icon-sm" /> Theme`
const moonIconHTML = `<img src="/images/icons/dark_mode_125dp_C390FF_FILL0_wght400_GRAD0_opsz48.svg" alt="" class="icon-sm" /> Theme`

document.addEventListener('click', (e) => {
  const themeLink = e.target.closest('#theme')
  if (!themeLink) return

  e.preventDefault()
  document.body.classList.toggle('light-theme')
  
  const isLight = document.body.classList.contains('light-theme')
  localStorage.setItem('theme', isLight ? 'light' : 'dark')
  
  themeLink.innerHTML = isLight ? moonIconHTML : sunIconHTML
})

const authContainer = document.querySelector('header > #auth')

function renderAuth(user) {
  if (!authContainer) return

  const isLight = document.body.classList.contains('light-theme')
  const themeHTML = isLight ? moonIconHTML : sunIconHTML

  if (user) {
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
    authContainer.innerHTML = `
      <details>
        <summary><img src="${avatar}" alt="Profile" class="icon" /></summary>
        <div>
          <a href="#" id="theme">${themeHTML}</a>
          <a href="#" id="signout">Sign out</a>
        </div>
      </details>
    `
    document.getElementById('signout').onclick = (e) => {
      e.preventDefault()
      supabase.auth.signOut()
    }
  } else {
    authContainer.innerHTML = `
      <details>
        <summary class="button">Sign in</summary>
        <div>
          <a href="#" id="theme">${themeHTML}</a>
          <a href="#" data-provider="google">Google</a>
          <a href="#" data-provider="twitch">Twitch</a>
        </div>
      </details>
    `
    authContainer.querySelectorAll('[data-provider]').forEach(link => {
      link.onclick = (e) => {
        e.preventDefault()
        supabase.auth.signInWithOAuth({
          provider: link.dataset.provider,
          options: { redirectTo: window.location.origin + window.location.pathname }
        })
      }
    })
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  renderAuth(session?.user || null)
})