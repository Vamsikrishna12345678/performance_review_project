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
window.storage = storage; // Export to other scripts

// --- Central Mock Database & Seeding Module ---

const DEFAULT_EMPLOYEES = [
  { id: "EMP001", name: "David Vance", department: "IT", position: "Lead Architect", email: "david.v@enterprise.com", status: "Active" },
  { id: "EMP002", name: "Sarah Jenkins", department: "HR", position: "Talent Specialist", email: "sarah.j@enterprise.com", status: "Active" },
  { id: "EMP003", name: "Marcus Thorne", department: "Finance", position: "Senior Accountant", email: "marcus.t@enterprise.com", status: "Active" },
  { id: "EMP004", name: "Sophia Martinez", department: "Marketing", position: "Content Strategist", email: "sophia.m@enterprise.com", status: "Active" },
  { id: "EMP005", name: "Alex Chen", department: "IT", position: "Senior Dev", email: "alex.c@enterprise.com", status: "Active" },
  { id: "EMP006", name: "Elena Rostova", department: "Sales", position: "Account Executive", email: "elena.r@enterprise.com", status: "Active" },
  { id: "EMP007", name: "Daniel Craig", department: "Support", position: "L2 Support Lead", email: "daniel.c@enterprise.com", status: "Active" },
  { id: "EMP008", name: "Aria Sterling", department: "Design", position: "Product Designer", email: "aria.s@enterprise.com", status: "Active" },
  { id: "EMP009", name: "Ryan Reynolds", department: "Operations", position: "Operations Analyst", email: "ryan.r@enterprise.com", status: "Active" },
  { id: "EMP010", name: "Olivia Wilde", department: "Marketing", position: "SEO Manager", email: "olivia.w@enterprise.com", status: "Active" },
  { id: "EMP011", name: "Liam Neeson", department: "Support", position: "Helpdesk Agent", email: "liam.n@enterprise.com", status: "Active" },
  { id: "EMP012", name: "Emma Watson", department: "HR", position: "HR Generalist", email: "emma.w@enterprise.com", status: "Active" },
  { id: "EMP013", name: "Bruce Wayne", department: "Operations", position: "Facility Manager", email: "bruce.w@enterprise.com", status: "Active" },
  { id: "EMP014", name: "Diana Prince", department: "Finance", position: "Financial Advisor", email: "diana.p@enterprise.com", status: "Active" },
  { id: "EMP015", name: "Peter Parker", department: "Design", position: "Junior UX Designer", email: "peter.p@enterprise.com", status: "Active" },
  { id: "EMP016", name: "Clark Kent", department: "Marketing", position: "PR Specialist", email: "clark.k@enterprise.com", status: "Active" },
  { id: "EMP017", name: "Tony Stark", department: "IT", position: "R&D Director", email: "tony.s@enterprise.com", status: "Active" },
  { id: "EMP018", name: "Natasha Romanoff", department: "Sales", position: "Sales Director", email: "natasha.r@enterprise.com", status: "Active" },
  { id: "EMP019", name: "Steve Rogers", department: "HR", position: "Employee Relations", email: "steve.r@enterprise.com", status: "Active" },
  { id: "EMP020", name: "Barry Allen", department: "IT", position: "Systems Administrator", email: "barry.a@enterprise.com", status: "Active" }
];

const DEFAULT_REVIEWS = [
  {
    employeeId: "EMP001",
    employeeName: "David Vance",
    department: "IT",
    position: "Lead Architect",
    managerName: "Vamsi Kelam",
    reviewPeriod: "Q2 2026",
    ratings: {
      communication: 5,
      technicalSkills: 5,
      teamwork: 4,
      leadership: 5,
      productivity: 4,
      problemSolving: 5,
      innovation: 5,
      attendance: 4,
      timeManagement: 4,
      adaptability: 5
    },
    overallRating: 4.6,
    performanceLevel: "Excellent",
    comments: "David has shown outstanding architectural leadership this quarter. His technical skills are peerless, and he solved major infrastructure bottlenecks.",
    status: "Completed",
    date: "2026-07-28"
  },
  {
    employeeId: "EMP003",
    employeeName: "Marcus Thorne",
    department: "Finance",
    position: "Senior Accountant",
    managerName: "Vamsi Kelam",
    reviewPeriod: "Q2 2026",
    ratings: {
      communication: 4,
      technicalSkills: 4,
      teamwork: 4,
      leadership: 3,
      productivity: 4,
      problemSolving: 4,
      innovation: 3,
      attendance: 5,
      timeManagement: 5,
      adaptability: 4
    },
    overallRating: 4.0,
    performanceLevel: "Good",
    comments: "Marcus is extremely detail-oriented and maintains perfect ledger books. Strong time management and attendance. Needs to step up in leadership tasks.",
    status: "Completed",
    date: "2026-07-25"
  },
  {
    employeeId: "EMP008",
    employeeName: "Aria Sterling",
    department: "Design",
    position: "Product Designer",
    managerName: "Vamsi Kelam",
    reviewPeriod: "Q2 2026",
    ratings: {
      communication: 4,
      technicalSkills: 5,
      teamwork: 5,
      leadership: 4,
      productivity: 4,
      problemSolving: 4,
      innovation: 5,
      attendance: 3,
      timeManagement: 3,
      adaptability: 5
    },
    overallRating: 4.2,
    performanceLevel: "Good",
    comments: "Aria is a highly innovative designer whose work has elevated our product experience. Her collaboration and technical UI design skills are fantastic. However, she needs to improve time management and meet deadlines more consistently.",
    status: "Completed",
    date: "2026-07-29"
  },
  {
    employeeId: "EMP002",
    employeeName: "Sarah Jenkins",
    department: "HR",
    position: "Talent Specialist",
    managerName: "Vamsi Kelam",
    reviewPeriod: "Q2 2026",
    ratings: {
      communication: 3,
      technicalSkills: 2,
      teamwork: 3,
      leadership: 2,
      productivity: 2,
      problemSolving: 2,
      innovation: 2,
      attendance: 4,
      timeManagement: 3,
      adaptability: 3
    },
    overallRating: 2.6,
    performanceLevel: "Needs Improvement",
    comments: "Sarah's review shows a decline in operational metrics. Communication and problem-solving need structured coaching to align with corporate standards.",
    status: "Rejected",
    date: "2026-07-27"
  }
];

// --- Initialization & API ---
function getEmployees() {
  let emps = storage.getItem('pr_employees');
  if (!emps) {
    storage.setItem('pr_employees', JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  }
  return JSON.parse(emps);
}

function saveEmployees(emps) {
  storage.setItem('pr_employees', JSON.stringify(emps));
}

function getReviews() {
  let reviews = storage.getItem('pr_reviews');
  if (!reviews) {
    storage.setItem('pr_reviews', JSON.stringify(DEFAULT_REVIEWS));
    return DEFAULT_REVIEWS;
  }
  return JSON.parse(reviews);
}

function saveReviews(reviews) {
  storage.setItem('pr_reviews', JSON.stringify(reviews));
}

function saveReview(review) {
  const reviews = getReviews();
  const index = reviews.findIndex(r => r.employeeId === review.employeeId);
  if (index >= 0) {
    reviews[index] = review;
  } else {
    reviews.push(review);
  }
  saveReviews(reviews);
}

// Generate color gradient avatar dynamically based on initials
function getInitialsAvatar(name) {
  const parts = name.split(' ');
  const initials = parts.map(p => p[0]).join('').substring(0, 2).toUpperCase();
  
  // Hash name to get a consistent gradient pair
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const colors = [
    ['#2563EB', '#1D4ED8'], // Blue
    ['#8B5CF6', '#7C3AED'], // Violet
    ['#EC4899', '#D946EF'], // Pink
    ['#F59E0B', '#D97706'], // Amber
    ['#10B981', '#059669'], // Emerald
    ['#06B6D4', '#0891B2'], // Cyan
    ['#3B82F6', '#1E3A8A'], // Indigo/Blue
    ['#EF4444', '#DC2626']  // Red
  ];
  
  const index = Math.abs(hash) % colors.length;
  const gradient = colors[index];
  
  return `
    <svg width="40" height="40" viewBox="0 0 40 40" class="avatar-svg" style="border-radius: 50%; box-shadow: var(--shadow-sm);">
      <defs>
        <linearGradient id="grad-${hash}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${gradient[0]};stop-opacity:1" />
          <stop offset="100%" style="stop-color:${gradient[1]};stop-opacity:1" />
        </linearGradient>
      </defs>
      <circle cx="20" cy="20" r="20" fill="url(#grad-${hash})" />
      <text x="50%" y="53%" fill="white" font-size="14" font-weight="600" font-family="'Poppins', sans-serif" text-anchor="middle" dominant-baseline="middle">${initials}</text>
    </svg>
  `;
}

// Check authorization on access
function checkAuth() {
  // Bypassing strict redirect for local file viewing to avoid CORS/Origin isolation blocking on file:/// protocol
  if (window.location.protocol === 'file:') {
    // Auto-login for local file development convenience
    if (storage.getItem('isLoggedIn') !== 'true') {
      storage.setItem('isLoggedIn', 'true');
      storage.setItem('currentUser', JSON.stringify({
        username: 'manager',
        fullName: 'Vamsi Kelam',
        role: 'Manager',
        email: 'vamsi.manager@enterprise.com'
      }));
    }
    return;
  }

  const isLoggedIn = storage.getItem('isLoggedIn');
  if (isLoggedIn !== 'true') {
    window.location.href = 'index.html';
  }
}

// Perform Log Out
function handleLogout() {
  showConfirmDialog(
    'Confirm Log Out',
    'Are you sure you want to end your session? You will be redirected to the login screen.',
    () => {
      storage.removeItem('isLoggedIn');
      showLoader(true);
      setTimeout(() => {
        showLoader(false);
        window.location.href = 'index.html';
      }, 800); // 800ms
    }
  );
}

// Confirmation Dialog helper
let confirmCallback = null;
function showConfirmDialog(title, message, callback) {
  confirmCallback = callback;
  
  let modal = document.getElementById('confirmModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'confirmModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content">
        <h3 class="modal-title" id="confirmTitle"></h3>
        <p class="modal-body" id="confirmMessage"></p>
        <div class="modal-footer">
          <button class="btn btn-secondary" id="confirmCancelBtn">Cancel</button>
          <button class="btn btn-primary" id="confirmOkBtn">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    
    document.getElementById('confirmCancelBtn').addEventListener('click', () => {
      modal.classList.remove('active');
    });
    
    document.getElementById('confirmOkBtn').addEventListener('click', () => {
      modal.classList.remove('active');
      if (confirmCallback) confirmCallback();
    });
  }
  
  document.getElementById('confirmTitle').innerText = title;
  document.getElementById('confirmMessage').innerText = message;
  
  // Show it
  setTimeout(() => modal.classList.add('active'), 50);
}

// Global Theme syncing
function initGlobalTheme() {
  const savedTheme = storage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  
  const themeToggle = document.getElementById('themeToggleBtn');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      storage.setItem('theme', newTheme);
    });
  }
}

// Profile dropdown controls
function initProfileDropdown() {
  const trigger = document.getElementById('profileTrigger');
  const dropdown = document.getElementById('profileDropdown');
  
  if (trigger && dropdown) {
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });
    
    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
    });
  }
}

// Mobile sidebar controls
function initMobileSidebar() {
  const hamburger = document.getElementById('mobileHamburger');
  const sidebar = document.getElementById('sidebar');
  const body = document.body;
  
  if (hamburger && sidebar) {
    let backdrop = document.getElementById('sidebarBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'sidebarBackdrop';
      backdrop.className = 'sidebar-backdrop';
      document.body.appendChild(backdrop);
    }
    
    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      sidebar.classList.toggle('mobile-open');
      backdrop.classList.toggle('active');
    });
    
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('mobile-open');
      backdrop.classList.remove('active');
    });
  }
  
  // Add Sidebar Toggle button logic for Desktop
  const toggleBtn = document.getElementById('toggleSidebarBtn');
  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('collapsed');
    });
  }
}

// --- Shared Toast Utility (redundant for safety across pages) ---
function showToast(message, type = 'info') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

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
  setTimeout(() => toast.classList.add('show'), 50);
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 400);
  }, 4000);
}

function showLoader(show) {
  let loader = document.getElementById('loadingSpinner');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'loadingSpinner';
    loader.className = 'spinner-overlay';
    loader.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loader);
  }
  if (show) loader.classList.add('active');
  else loader.classList.remove('active');
}

// Initialise common components
document.addEventListener('DOMContentLoaded', () => {
  // If we are on index.html, don't trigger checkAuth
  if (!window.location.pathname.endsWith('index.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('\\')) {
    checkAuth();
    initProfileDropdown();
    initMobileSidebar();
  }
  initGlobalTheme();
});
