// --- Performance Report Preview Controller ---

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

document.addEventListener('DOMContentLoaded', () => {
  // Parse parameters
  const urlParams = new URLSearchParams(window.location.search);
  const empId = urlParams.get('id');
  const isDraft = urlParams.get('draft') === 'true';

  if (!empId) {
    showToast('Missing employee parameters.', 'danger');
    setTimeout(() => { window.location.href = 'dashboard.html'; }, 1500);
    return;
  }

  let activeReview = null;

  if (isDraft) {
    // Load cached draft review
    const draftData = storage.getItem(`pr_draft_${empId}`);
    if (draftData) {
      activeReview = JSON.parse(draftData);
    }
    
    // Update navbar tag to show Draft state
    const modeTag = document.getElementById('previewModeTag');
    if (modeTag) {
      modeTag.innerText = 'Draft Evaluation Preview';
      modeTag.classList.add('draft');
    }
  } else {
    // Load finalized review from reviews db
    const reviews = getReviews();
    activeReview = reviews.find(r => r.employeeId === empId);
  }

  if (!activeReview) {
    showToast('No performance evaluation found for this employee.', 'danger');
    setTimeout(() => { window.location.href = 'employees.html'; }, 1500);
    return;
  }

  // Populate Report Fields
  populateReport(activeReview);

  // Bind Buttons
  const backBtn = document.getElementById('backBtn');
  backBtn.addEventListener('click', () => {
    if (isDraft) {
      // Go back to edit form
      window.location.href = `review.html?id=${empId}`;
    } else {
      // Go back to employees list
      window.location.href = 'employees.html';
    }
  });

  document.getElementById('printBtn').addEventListener('click', () => {
    window.print();
  });

  document.getElementById('downloadPdfBtn').addEventListener('click', () => {
    showToast('Opening print dialog. Choose "Save as PDF" to download the report.', 'success');
    setTimeout(() => {
      window.print();
    }, 1000);
  });
});

function populateReport(review) {
  // Document level titles
  document.getElementById('metaEmpName').innerText = review.employeeName;
  document.getElementById('metaEmpId').innerText = review.employeeId;
  document.getElementById('metaEmpDept').innerText = review.department;
  document.getElementById('metaEmpPosition').innerText = review.position;
  
  document.getElementById('metaPeriod').innerText = review.reviewPeriod;
  document.getElementById('metaManager').innerText = review.managerName;
  
  // Date formatting
  const rawDate = review.date ? new Date(review.date) : new Date();
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('metaDate').innerText = rawDate.toLocaleDateString('en-US', options);

  // Score metrics
  const scoreText = `${review.overallRating.toFixed(1)} / 5.0`;
  document.getElementById('metaOverallScore').innerText = scoreText;

  // Grade Badge Color matching
  const gradeBadge = document.getElementById('reportGradeBadge');
  if (gradeBadge) {
    gradeBadge.innerText = review.performanceLevel;
    
    // Match colors
    if (review.performanceLevel === 'Excellent') {
      gradeBadge.style.color = '#22C55E';
      gradeBadge.style.borderColor = '#22C55E';
      gradeBadge.style.backgroundColor = 'rgba(34, 197, 94, 0.05)';
    } else if (review.performanceLevel === 'Good') {
      gradeBadge.style.color = '#2563EB';
      gradeBadge.style.borderColor = '#2563EB';
      gradeBadge.style.backgroundColor = 'rgba(37, 99, 235, 0.05)';
    } else if (review.performanceLevel === 'Average') {
      gradeBadge.style.color = '#F59E0B';
      gradeBadge.style.borderColor = '#F59E0B';
      gradeBadge.style.backgroundColor = 'rgba(245, 158, 11, 0.05)';
    } else {
      gradeBadge.style.color = '#EF4444';
      gradeBadge.style.borderColor = '#EF4444';
      gradeBadge.style.backgroundColor = 'rgba(239, 68, 68, 0.05)';
    }
  }

  // Comments
  document.getElementById('previewComments').innerText = review.comments || 'No comments provided.';

  // Signatures Names
  document.getElementById('sigManagerName').innerText = review.managerName || 'Vamsi Kelam';
  document.getElementById('sigEmpName').innerText = review.employeeName;

  // Render Detailed Criteria Matrix
  const tableBody = document.getElementById('previewMatrixBody');
  if (!tableBody) return;

  tableBody.innerHTML = '';
  
  CRITERIA.forEach(c => {
    const score = review.ratings ? (review.ratings[c.id] || 0) : 0;
    
    // Draw star characters: solid and empty
    const solidStars = '★'.repeat(score);
    const emptyStars = '☆'.repeat(5 - score);

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td style="font-weight: 600; color: #0F172A;">${c.name}</td>
      <td style="color: #475569; font-size: 0.75rem;">${c.desc}</td>
      <td style="text-align: center; font-weight: 700; color: var(--primary-color);">${score}</td>
      <td style="text-align: right;" class="preview-stars">
        <span>${solidStars}</span><span style="color: #CBD5E1;">${emptyStars}</span>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}
