import { supabase } from './supabase.js'

// --- Theme Initialization (Runs immediately) ---
const savedTheme = localStorage.getItem('theme')
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches

if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
  document.body.classList.add('light-theme')
}

// Global click listener to handle the theme toggle link anywhere it's rendered
document.addEventListener('click', (e) => {
  const themeLink = e.target.closest('#theme')
  if (!themeLink) return

  e.preventDefault()
  document.body.classList.toggle('light-theme')
  
  // Save preference
  const isLight = document.body.classList.contains('light-theme')
  localStorage.setItem('theme', isLight ? 'light' : 'dark')
})

// --- Auth Rendering ---
const authContainer = document.querySelector('header > #auth')

function renderAuth(user) {
  if (!authContainer) return

  // Dynamic label based on active theme state
  const isLight = document.body.classList.contains('light-theme')
  const themeLabel = isLight ? '🌙 Dark mode' : '☀️ Light mode'

  if (user) {
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
    authContainer.innerHTML = `
      <details>
        <summary><img src="${avatar}" alt="Profile" class="icon" /></summary>
        <div>
          <a href="#" id="theme">${themeLabel}</a>
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
          <a href="#" id="theme">${themeLabel}</a>
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