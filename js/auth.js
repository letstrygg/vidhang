import { supabase } from './supabase.js'

const authContainer = document.querySelector('header > #auth')

function renderAuth(user) {
  if (!authContainer) return

  if (user) {
    const avatar = user.user_metadata?.avatar_url || user.user_metadata?.picture || ''
    authContainer.innerHTML = `
      <img src="${avatar}" alt="Profile" class="icon" />
      <button id="signout-btn">Sign out</button>
    `
    document.getElementById('signout-btn').onclick = () => supabase.auth.signOut()
  } else {
    authContainer.innerHTML = `
      <span>Sign in:</span>
      <button data-provider="google">Google</button>
      <button data-provider="twitch">Twitch</button>
    `
    authContainer.querySelectorAll('[data-provider]').forEach(btn => {
      btn.onclick = () => supabase.auth.signInWithOAuth({
        provider: btn.dataset.provider,
        options: { redirectTo: window.location.origin + window.location.pathname }
      })
    })
  }
}

supabase.auth.onAuthStateChange((_event, session) => {
  renderAuth(session?.user || null)
})