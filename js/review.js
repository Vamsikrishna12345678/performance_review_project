// --- Evaluation Form Controller ---

const CRITERIA = [
  { id: 'communication', name: 'Communication', desc: 'Expresses ideas clearly, listens effectively, and shares information openly.' },
  { id: 'technicalSkills', name: 'Technical Skills', desc: 'Demonstrates job-specific expertise, code quality, and technical problem solving.' },
  { id: 'teamwork', name: 'Teamwork', desc: 'Collaborates well with others, supports teammates, and builds positive relationships.' },
  { id: 'leadership', name: 'Leadership', desc: 'Guides others, takes initiative, acts as a role model, and drives team goals.' },
  { id: 'productivity', name: 'Productivity', desc: 'Maintains high output, meets objectives efficiently, and delivers quality work.' },
  { id: 'problemSolving', name: 'Problem Solving', desc: 'Analyzes complex situations, develops solutions, and resolves issues effectively.' },
  { id: 'innovation', name: 'Innovation', desc: 'Proposes new ideas, improves processes, and embraces creative approaches.' },
  { id: 'attendance', name: 'Attendance', desc: 'Punctual, adheres to working schedules, and manages absences responsibly.' },
  { id: 'timeManagement', name: 'Time Management', desc: 'Prioritizes tasks, meets deadlines, and allocates working hours effectively.' },
  { id: 'adaptability', name: 'Adaptability', desc: 'Adjusts quickly to changes, works under pressure, and handles new challenges.' }
];

let employees = [];
let reviews = [];
let currentEmployee = null;
let currentRatings = {};

// Initialize scores to 0
CRITERIA.forEach(c => {
  currentRatings[c.id] = 0;
});

document.addEventListener('DOMContentLoaded', () => {
  employees = getEmployees();
  reviews = getReviews();

  // Get Employee ID from URL query
  const urlParams = new URLSearchParams(window.location.search);
  const empId = urlParams.get('id');

  // Render Evaluation Criteria rows
  renderCriteriaRows();

  // Set up character counters
  setupCommentsCounter();

  if (empId) {
    // Load specific employee details
    loadEmployee(empId);
  } else {
    // Fallback: No ID in query. Let user pick an employee.
    showEmployeeSelector();
  }

  // Bind actions
  document.getElementById('resetBtn').addEventListener('click', handleReset);
  document.getElementById('previewBtn').addEventListener('click', handlePreview);
  document.getElementById('evaluationForm').addEventListener('submit', handleSubmit);
});

function loadEmployee(empId) {
  currentEmployee = employees.find(e => e.id === empId);
  if (!currentEmployee) {
    showToast(`Employee ID ${empId} not found.`, 'danger');
    setTimeout(() => {
      window.location.href = 'employees.html';
    }, 1500);
    return;
  }

  // Prepopulate form fields
  document.getElementById('empName').value = currentEmployee.name;
  document.getElementById('empId').value = currentEmployee.id;
  document.getElementById('empDept').value = currentEmployee.department;
  document.getElementById('empPosition').value = currentEmployee.position;

  // Check if an evaluation already exists for this employee
  const existingReview = reviews.find(r => r.employeeId === empId);
  if (existingReview) {
    prepopulateReview(existingReview);
  } else {
    // Check if there is a draft review cached
    const draft = storage.getItem(`pr_draft_${empId}`);
    if (draft) {
      prepopulateReview(JSON.parse(draft));
      showToast('Loaded draft review from cache.', 'info');
    }
  }
}

// Show dropdown selector if ID is missing in query string
function showEmployeeSelector() {
  const selectWrapper = document.getElementById('employeeSelectWrapper');
  const dropdown = document.getElementById('employeeDropdown');
  if (!selectWrapper || !dropdown) return;

  selectWrapper.style.display = 'block';
  dropdown.innerHTML = '<option value="">-- Choose an Employee --</option>';

  // Sort employees alphabetically
  const sortedEmps = [...employees].sort((a, b) => a.name.localeCompare(b.name));
  
  sortedEmps.forEach(e => {
    dropdown.innerHTML += `<option value="${e.id}">${e.name} (${e.id}) - ${e.department}</option>`;
  });

  dropdown.addEventListener('change', (e) => {
    const selectedId = e.target.value;
    if (selectedId) {
      loadEmployee(selectedId);
    } else {
      // Clear fields
      document.getElementById('empName').value = '';
      document.getElementById('empId').value = '';
      document.getElementById('empDept').value = '';
      document.getElementById('empPosition').value = '';
      currentEmployee = null;
      handleReset();
    }
  });
}

function renderCriteriaRows() {
  const container = document.getElementById('metricsList');
  if (!container) return;

  container.innerHTML = '';

  CRITERIA.forEach(c => {
    const row = document.createElement('div');
    row.className = 'metric-row';
    row.innerHTML = `
      <div class="metric-info">
        <span class="metric-name">${c.name}</span>
        <span class="metric-desc">${c.desc}</span>
      </div>
      <div class="star-rating-container" id="stars-${c.id}">
        <!-- Render 5 stars in reverse order (5 down to 1) for the CSS hover sibling trick -->
        <span class="star-rating-btn" data-value="5" data-metric="${c.id}">★</span>
        <span class="star-rating-btn" data-value="4" data-metric="${c.id}">★</span>
        <span class="star-rating-btn" data-value="3" data-metric="${c.id}">★</span>
        <span class="star-rating-btn" data-value="2" data-metric="${c.id}">★</span>
        <span class="star-rating-btn" data-value="1" data-metric="${c.id}">★</span>
      </div>
    `;
    container.appendChild(row);

    // Bind event listeners to stars in this row
    const starBtns = row.querySelectorAll('.star-rating-btn');
    starBtns.forEach(btn => {
      // Mouse Click
      btn.addEventListener('click', () => {
        const value = parseInt(btn.getAttribute('data-value'));
        setMetricRating(c.id, value);
      });
    });
  });
}

function setMetricRating(metricId, value) {
  currentRatings[metricId] = value;
  
  // Update visual states for stars in this specific row
  const rowContainer = document.getElementById(`stars-${metricId}`);
  if (rowContainer) {
    const buttons = rowContainer.querySelectorAll('.star-rating-btn');
    buttons.forEach(btn => {
      const btnVal = parseInt(btn.getAttribute('data-value'));
      if (btnVal <= value) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Recalculate values
  recalculatePerformance();
}

function prepopulateReview(review) {
  // Set review period select value
  if (review.reviewPeriod) {
    document.getElementById('reviewPeriod').value = review.reviewPeriod;
  }
  
  // Set comments
  if (review.comments) {
    const commentsArea = document.getElementById('comments');
    commentsArea.value = review.comments;
    // trigger length count update
    const event = new Event('input');
    commentsArea.dispatchEvent(event);
  }

  // Set individual ratings
  if (review.ratings) {
    Object.keys(review.ratings).forEach(metricId => {
      if (currentRatings.hasOwnProperty(metricId)) {
        setMetricRating(metricId, review.ratings[metricId]);
      }
    });
  }
}

function recalculatePerformance() {
  const keys = Object.keys(currentRatings);
  let ratedCount = 0;
  let sum = 0;

  keys.forEach(k => {
    if (currentRatings[k] > 0) {
      ratedCount++;
      sum += currentRatings[k];
    }
  });

  const liveAverage = ratedCount > 0 ? sum / ratedCount : 0.0;
  
  // Update overall text
  document.getElementById('liveScoreText').innerText = liveAverage.toFixed(1);

  // Update grade badge status
  const badge = document.getElementById('liveGradeBadge');
  if (!badge) return;

  // Clear existing grade classes
  badge.className = 'grade-badge';

  if (ratedCount < 10) {
    badge.innerText = 'Evaluation Incomplete';
    badge.classList.add('grade-badge');
  } else {
    // Fully rated, determine grade level
    const grade = getPerformanceLevel(liveAverage);
    badge.innerText = grade.label;
    badge.classList.add(grade.cssClass);
  }

  // Render mini horizontal progress helper in the sticky card
  renderMiniProgress();
}

// Translate scores into labels
function getPerformanceLevel(score) {
  if (score >= 4.5) return { label: 'Excellent', cssClass: 'grade-excellent' };
  if (score >= 3.5) return { label: 'Good', cssClass: 'grade-good' };
  if (score >= 2.5) return { label: 'Average', cssClass: 'grade-average' };
  if (score >= 1.5) return { label: 'Needs Improvement', cssClass: 'grade-needs-improvement' };
  return { label: 'Poor', cssClass: 'grade-poor' };
}

function renderMiniProgress() {
  const container = document.getElementById('criteriaMiniProgress');
  if (!container) return;

  container.innerHTML = '';
  
  // Show list of metrics that have a rating
  CRITERIA.forEach(c => {
    const val = currentRatings[c.id];
    if (val > 0) {
      const row = document.createElement('div');
      row.className = 'progress-row-mini';
      row.innerHTML = `
        <span>${c.name}</span>
        <span style="font-weight:600;">${val} ★</span>
      `;
      container.appendChild(row);
    }
  });
}

function setupCommentsCounter() {
  const commentsArea = document.getElementById('comments');
  const countSpan = document.getElementById('commentCharCount');
  const errSpan = document.getElementById('commentErrorMsg');

  if (!commentsArea || !countSpan || !errSpan) return;

  commentsArea.addEventListener('input', () => {
    const length = commentsArea.value.length;
    countSpan.innerText = `${length} / 500 characters`;

    if (length < 20) {
      errSpan.innerText = `Need ${20 - length} more characters`;
      errSpan.classList.add('active');
    } else if (length > 500) {
      errSpan.innerText = `Character limit exceeded!`;
      errSpan.classList.add('active');
    } else {
      errSpan.classList.remove('active');
    }
  });
}

function handleReset() {
  showConfirmDialog(
    'Reset Evaluation Fields',
    'Are you sure you want to clear all interactive star values and comments? This cannot be undone.',
    () => {
      // Reset rating states
      CRITERIA.forEach(c => {
        setMetricRating(c.id, 0);
      });

      // Clear textarea
      const commentsArea = document.getElementById('comments');
      commentsArea.value = '';
      
      // Update character count label
      const event = new Event('input');
      commentsArea.dispatchEvent(event);

      showToast('Form reset completed.', 'info');
    }
  );
}

// Validates parameters and caches draft review in localStorage
function saveDraftState() {
  if (!currentEmployee) {
    showToast('Please select an employee first.', 'warning');
    return false;
  }

  const reviewPeriod = document.getElementById('reviewPeriod').value;
  const comments = document.getElementById('comments').value.trim();

  // Create Draft structure
  const draftReview = {
    employeeId: currentEmployee.id,
    employeeName: currentEmployee.name,
    department: currentEmployee.department,
    position: currentEmployee.position,
    managerName: 'Vamsi Kelam',
    reviewPeriod: reviewPeriod,
    ratings: currentRatings,
    overallRating: parseFloat(document.getElementById('liveScoreText').innerText),
    performanceLevel: document.getElementById('liveGradeBadge').innerText,
    comments: comments,
    status: 'Pending',
    date: new Date().toISOString().split('T')[0]
  };

  // Cache to draft key
  storage.setItem(`pr_draft_${currentEmployee.id}`, JSON.stringify(draftReview));
  return draftReview;
}

// Redirects user to preview page
function handlePreview() {
  const draft = saveDraftState();
  if (draft) {
    showToast('Caching review report draft... Loading preview.', 'success');
    setTimeout(() => {
      window.location.href = `preview.html?id=${currentEmployee.id}&draft=true`;
    }, 800);
  }
}

// Full form submission handler
function handleSubmit(e) {
  e.preventDefault();

  if (!currentEmployee) {
    showToast('No employee record selected.', 'warning');
    return;
  }

  // 1. Validation: Verify all 10 criteria rated
  const unratedCount = CRITERIA.filter(c => currentRatings[c.id] === 0).length;
  if (unratedCount > 0) {
    showToast(`Evaluation incomplete! Set scores for all 10 performance criteria. (${unratedCount} remaining)`, 'danger');
    return;
  }

  // 2. Validation: Comments check
  const comments = document.getElementById('comments').value.trim();
  if (comments.length < 20) {
    showToast('Comments must contain at least 20 characters of detail.', 'danger');
    return;
  }
  if (comments.length > 500) {
    showToast('Comments cannot exceed 500 characters.', 'danger');
    return;
  }

  // Update draft to completed review
  const finishedReview = saveDraftState();
  finishedReview.status = 'Completed'; // Formally complete it

  // Save to Mock DB
  saveReview(finishedReview);

  // Clear active draft cache
  storage.removeItem(`pr_draft_${currentEmployee.id}`);

  // Display success Overlay animation
  const overlay = document.getElementById('successOverlay');
  const desc = document.getElementById('successDesc');
  
  if (desc) {
    desc.innerText = `The performance review report for ${currentEmployee.name} has been finalized and recorded in the database.`;
  }
  
  if (overlay) {
    overlay.classList.add('active');
  }

  // Redirect back to dashboard after 2.5 seconds
  setTimeout(() => {
    window.location.href = 'dashboard.html';
  }, 2500);
}
