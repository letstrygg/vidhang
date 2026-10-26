import { supabase } from './supabase.js'

const savedTheme = localStorage.getItem('theme')
const systemPrefersLight = window.matchMedia('(prefers-color-scheme: light)').matches

if (savedTheme === 'light' || (!savedTheme && systemPrefersLight)) {
  document.body.classList.add('light-theme')
}

document.addEventListener('click', (e) => {
  const themeLink = e.target.closest('#theme')
  if (!themeLink) return

  e.preventDefault()
  document.body.classList.toggle('light-theme')
  
  const isLight = document.body.classList.contains('light-theme')
  localStorage.setItem('theme', isLight ? 'light' : 'dark')
  
  themeLink.innerHTML = isLight 
    ? `<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> Theme` 
    : `<span class="material-symbols-outlined">dark_mode</span> Theme`
})

const authContainer = document.querySelector('header > #auth')

function renderAuth(user) {
  if (!authContainer) return

  const isLight = document.body.classList.contains('light-theme')
  const themeHTML = isLight 
    ? `<span class="material-symbols-outlined">light_mode</span> Theme` 
    : `<span class="material-symbols-outlined">dark_mode</span> Theme`

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