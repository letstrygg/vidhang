import { supabase } from './supabase.js'
import { getThemeHTML, getLoginHTML, getLogoutHTML } from './theme.js'

const authContainer = document.querySelector('header > #auth')

function renderAuth(user) {
  if (!authContainer) return

  const themeHTML = getThemeHTML()
  const logoutHTML = getLogoutHTML('Sign out')
  const googleHTML = getLoginHTML('Google')
  const twitchHTML = getLoginHTML('Twitch')

  if (user) {
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
    authContainer.innerHTML = `
      <details>
        <summary><img src="${avatar}" alt="Profile" class="icon top right" /></summary>
        <div>
          <a href="#" id="theme">${themeHTML}</a>
          <a href="#" id="signout">${logoutHTML}</a>
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
        <div class="top right">
          <a href="#" id="theme">${themeHTML}</a>
          <a href="#" data-provider="google" data-auth-action="login" data-label="Google">${googleHTML}</a>
          <a href="#" data-provider="twitch" data-auth-action="login" data-label="Twitch">${twitchHTML}</a>
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