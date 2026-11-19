// --- Safe Storage Wrapper ---
const storage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      if (!window.__inMemoryDb) window.__inMemoryDb = {};
      return window.__inMemoryDb[key] || null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      if (!window.__inMemoryDb) window.__inMemoryDb = {};
      window.__inMemoryDb[key] = value;
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      if (window.__inMemoryDb) delete window.__inMemoryDb[key];
    }
  }
};

// --- Shared Toast Utility ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  let iconSVG = '';
  if (type === 'success') {
    iconSVG = `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  } else if (type === 'warning') {
    iconSVG = `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>`;
  } else if (type === 'danger') {
    iconSVG = `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  } else {
    iconSVG = `<svg class="toast-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
  }

  toast.innerHTML = `
    ${iconSVG}
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);
  
  // Trigger transition
  setTimeout(() => toast.classList.add('show'), 50);

  // Auto remove
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

// --- Loading Spinner Controls ---
function showLoader(show) {
  const loader = document.getElementById('loadingSpinner');
  if (loader) {
    if (show) loader.classList.add('active');
    else loader.classList.remove('active');
  }
}

// --- Dark Mode State Management ---
const themeToggleBtn = document.getElementById('themeToggleBtn');
const htmlEl = document.documentElement;

// Sync theme with localStorage
const savedTheme = storage.getItem('theme') || 'light';
htmlEl.setAttribute('data-theme', savedTheme);

if (themeToggleBtn) {
  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlEl.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlEl.setAttribute('data-theme', newTheme);
    storage.setItem('theme', newTheme);
  });
}

// --- Auth Controls ---
document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  const usernameInput = document.getElementById('username');
  const passwordInput = document.getElementById('password');
  const showPasswordChk = document.getElementById('showPassword');
  const rememberMeChk = document.getElementById('rememberMe');
  const forgotPasswordLink = document.getElementById('forgotPasswordLink');

  // Load remembered username
  const rememberedUser = storage.getItem('remembered_username');
  if (rememberedUser) {
    usernameInput.value = rememberedUser;
    rememberMeChk.checked = true;
  }

  // Show/Hide Password Toggle
  showPasswordChk.addEventListener('change', () => {
    passwordInput.type = showPasswordChk.checked ? 'text' : 'password';
  });

  // Forgot Password helper
  forgotPasswordLink.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Mock Creds: User: manager, Pass: admin123', 'warning');
  });

  // Form Submit
  loginForm.addEventListener('submit', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
      showToast('Please fill in all fields.', 'warning');
      return;
    }

    // Authenticate manager:admin123
    if (username === 'manager' && password === 'admin123') {
      // Remember me logic
      if (rememberMeChk.checked) {
        storage.setItem('remembered_username', username);
      } else {
        storage.removeItem('remembered_username');
      }

      // Store auth session
      storage.setItem('isLoggedIn', 'true');
      storage.setItem('currentUser', JSON.stringify({
        username: 'manager',
        fullName: 'Vamsi Kelam',
        role: 'Manager',
        email: 'vamsi.manager@enterprise.com'
      }));

      showLoader(true);
      showToast('Login successful! Loading dashboard...', 'success');

      // Mock loading state before redirect
      setTimeout(() => {
        showLoader(false);
        window.location.href = 'dashboard.html';
      }, 1000);

    } else {
      showToast('Invalid username or password.', 'danger');
    }
  });
});
