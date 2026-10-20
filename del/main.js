// Initialize the Supabase client using window.ENV
if (!window.ENV || !window.ENV.SUPABASE_URL || !window.ENV.SUPABASE_ANON_KEY) {
  console.error('Missing Supabase configuration in window.ENV');
}

const supabaseClient = window.supabase.createClient(
  window.ENV.SUPABASE_URL,
  window.ENV.SUPABASE_ANON_KEY
);

// DOM Elements
const authSection = document.getElementById('auth-section');
const userSection = document.getElementById('user-section');
const gameSection = document.getElementById('game-section');

const loginForm = document.getElementById('login-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const btnSignup = document.getElementById('btn-signup');
const btnGoogle = document.getElementById('btn-google');
const btnTwitch = document.getElementById('btn-twitch');
const btnLogout = document.getElementById('btn-logout');
const authStatus = document.getElementById('auth-status');

const userUsernameEl = document.getElementById('user-username');
const userIdEl = document.getElementById('user-id');

const gameForm = document.getElementById('game-form');
const gameTitleInput = document.getElementById('game-title');
const gameSlugInput = document.getElementById('game-slug');
const gameSteamIdInput = document.getElementById('game-steam-id');
const gameStatus = document.getElementById('game-status');

let currentUser = null;

// Helpers to show status messages
function showStatus(element, message, type = 'error') {
  element.textContent = message;
  element.className = `status-msg ${type}`;
}

function clearStatus(element) {
  element.textContent = '';
  element.className = 'status-msg';
}

// Fetch and display username from public.profiles
async function loadUserProfile(userId) {
  userUsernameEl.textContent = 'Loading...';

  try {
    const { data, error } = await supabaseClient
      .from('profiles')
      .select('username')
      .eq('id', userId)
      .single();

    if (error) {
      console.warn('Could not fetch profile username:', error.message);
      userUsernameEl.textContent = '(Username not found)';
      return;
    }

    if (data && data.username) {
      userUsernameEl.textContent = data.username;
    } else {
      userUsernameEl.textContent = '(No username set)';
    }
  } catch (err) {
    console.error('Error fetching user profile:', err);
    userUsernameEl.textContent = '(Error loading profile)';
  }
}

// Update UI based on auth state
async function handleAuthState(session) {
  if (session && session.user) {
    currentUser = session.user;
    authSection.classList.add('hidden');
    userSection.classList.remove('hidden');
    gameSection.classList.remove('hidden');

    userIdEl.textContent = currentUser.id;
    await loadUserProfile(currentUser.id);
  } else {
    currentUser = null;
    authSection.classList.remove('hidden');
    userSection.classList.add('hidden');
    gameSection.classList.add('hidden');
    clearStatus(authStatus);
    clearStatus(gameStatus);
  }
}

// 1. Email/Password Login
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearStatus(authStatus);

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  if (!email || !password) {
    showStatus(authStatus, 'Please enter both email and password.');
    return;
  }

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    showStatus(authStatus, `Login failed: ${error.message}`);
  } else {
    showStatus(authStatus, 'Login successful!', 'success');
  }
});

// Email/Password Sign Up (convenience helper)
btnSignup.addEventListener('click', async () => {
  clearStatus(authStatus);

  const email = loginEmailInput.value.trim();
  const password = loginPasswordInput.value;

  if (!email || !password) {
    showStatus(authStatus, 'Please enter email and password to sign up.');
    return;
  }

  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password,
  });

  if (error) {
    showStatus(authStatus, `Sign up failed: ${error.message}`);
  } else {
    showStatus(authStatus, 'Sign up successful! Please check your email or log in.', 'success');
  }
});

// 2. OAuth Logins (Google & Twitch)
btnGoogle.addEventListener('click', async () => {
  clearStatus(authStatus);
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'google',
  });
  if (error) {
    showStatus(authStatus, `Google sign-in error: ${error.message}`);
  }
});

btnTwitch.addEventListener('click', async () => {
  clearStatus(authStatus);
  const { error } = await supabaseClient.auth.signInWithOAuth({
    provider: 'twitch',
  });
  if (error) {
    showStatus(authStatus, `Twitch sign-in error: ${error.message}`);
  }
});

// Logout
btnLogout.addEventListener('click', async () => {
  const { error } = await supabaseClient.auth.signOut();
  if (error) {
    alert(`Logout failed: ${error.message}`);
  }
});

// 3. Submit New Game to public.vh_games
gameForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearStatus(gameStatus);

  if (!currentUser) {
    showStatus(gameStatus, 'You must be logged in to submit a game.');
    return;
  }

  const title = gameTitleInput.value.trim();
  const slug = gameSlugInput.value.trim();
  const rawSteamId = gameSteamIdInput.value.trim();

  if (!title || !slug) {
    showStatus(gameStatus, 'Title and slug are required.');
    return;
  }

  // Parse steam_id if numeric, else null if empty, or keep as string/number
  let steamId = null;
  if (rawSteamId) {
    steamId = isNaN(Number(rawSteamId)) ? rawSteamId : Number(rawSteamId);
  }

  const payload = {
    title,
    slug,
    steam_id: steamId,
    added_by: currentUser.id,
  };

  const { data, error } = await supabaseClient
    .from('vh_games')
    .insert([payload]);

  if (error) {
    showStatus(gameStatus, `Failed to add game: ${error.message}`);
  } else {
    showStatus(gameStatus, `Game "${title}" added successfully!`, 'success');
    gameForm.reset();
  }
});

// Listen to auth state changes
supabaseClient.auth.onAuthStateChange((event, session) => {
  handleAuthState(session);
});

// Initial session check on load
supabaseClient.auth.getSession().then(({ data: { session } }) => {
  handleAuthState(session);
});