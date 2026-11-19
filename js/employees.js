// --- Employee Directory Controller ---

let employees = [];
let reviews = [];

// Filter States
let searchTerm = '';
let selectedDept = 'All';
let currentSort = 'nameAsc';
let currentPage = 1;
const itemsPerPage = 5;

document.addEventListener('DOMContentLoaded', () => {
  // Load database arrays
  refreshData();
  
  // Bind search & filter inputs
  const searchInput = document.getElementById('employeeSearch');
  const deptFilter = document.getElementById('departmentFilter');
  const sortBySelect = document.getElementById('sortBySelect');

  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    currentPage = 1; // Reset to page 1 on filter
    renderDirectory();
  });

  deptFilter.addEventListener('change', (e) => {
    selectedDept = e.target.value;
    currentPage = 1;
    renderDirectory();
  });

  sortBySelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderDirectory();
  });

  // Modal Controls
  const addEmpBtn = document.getElementById('addEmployeeBtn');
  const modal = document.getElementById('employeeModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const employeeForm = document.getElementById('employeeForm');

  addEmpBtn.addEventListener('click', () => {
    // Open for creation
    document.getElementById('modalTitle').innerText = 'Add New Employee';
    document.getElementById('editEmployeeId').value = '';
    
    // Generate next EMP ID automatically
    const nextId = generateNextEmpId();
    document.getElementById('empIdInput').value = nextId;
    document.getElementById('empIdInput').disabled = false;
    
    // Clear inputs
    document.getElementById('empName').value = '';
    document.getElementById('empPosition').value = '';
    document.getElementById('empDept').value = 'IT';
    document.getElementById('empEmail').value = '';
    
    modal.classList.add('active');
  });

  closeModalBtn.addEventListener('click', () => {
    modal.classList.remove('active');
  });

  employeeForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveEmployeeForm();
  });

  // Initial draw
  renderDirectory();
});

function refreshData() {
  employees = getEmployees();
  reviews = getReviews();
}

function generateNextEmpId() {
  const ids = employees.map(emp => {
    const numPart = parseInt(emp.id.replace('EMP', ''));
    return isNaN(numPart) ? 0 : numPart;
  });
  const max = Math.max(...ids, 0);
  const nextNum = max + 1;
  return `EMP${nextNum.toString().padStart(3, '0')}`;
}

// Calculate review status for an employee
function getEmployeeReviewStatus(empId) {
  const review = reviews.find(r => r.employeeId === empId);
  if (!review) return { status: 'Pending', label: 'Pending Review', score: null };
  return {
    status: review.status, // Completed or Rejected
    label: review.status === 'Completed' ? `Completed (${review.overallRating.toFixed(1)})` : 'Rejected',
    score: review.overallRating
  };
}

function renderDirectory() {
  const tableBody = document.getElementById('employeeTableBody');
  if (!tableBody) return;

  // 1. Filtering
  let filtered = employees.filter(emp => {
    // Search Term Match (Name, ID, Position)
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm) || 
                          emp.id.toLowerCase().includes(searchTerm) ||
                          emp.position.toLowerCase().includes(searchTerm);
    
    // Department Filter Match
    const matchesDept = selectedDept === 'All' || emp.department === selectedDept;

    return matchesSearch && matchesDept;
  });

  // 2. Sorting
  filtered.sort((a, b) => {
    if (currentSort === 'nameAsc') {
      return a.name.localeCompare(b.name);
    }
    if (currentSort === 'nameDesc') {
      return b.name.localeCompare(a.name);
    }
    if (currentSort === 'idAsc') {
      return a.id.localeCompare(b.id);
    }
    if (currentSort === 'reviewStatus') {
      const statusA = getEmployeeReviewStatus(a.id).status;
      const statusB = getEmployeeReviewStatus(b.id).status;
      // Completed, then Rejected, then Pending
      const order = { Completed: 1, Rejected: 2, Pending: 3 };
      return (order[statusA] || 9) - (order[statusB] || 9);
    }
    return 0;
  });

  // 3. Pagination bounds
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (currentPage > totalPages && totalPages > 0) {
    currentPage = totalPages;
  }
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const paginatedItems = filtered.slice(startIndex, endIndex);

  // 4. Render Table rows
  tableBody.innerHTML = '';

  if (paginatedItems.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: var(--text-secondary); padding: 40px;">
          No matching employees found in the directory.
        </td>
      </tr>
    `;
    updatePaginationControls(0, 0, 0, 0);
    return;
  }

  paginatedItems.forEach(emp => {
    const reviewData = getEmployeeReviewStatus(emp.id);
    
    let badgeClass = 'badge-warning';
    if (reviewData.status === 'Completed') badgeClass = 'badge-success';
    if (reviewData.status === 'Rejected') badgeClass = 'badge-danger';

    // Build Action Buttons
    let reviewBtn = '';
    if (reviewData.status === 'Completed') {
      reviewBtn = `
        <a href="preview.html?id=${emp.id}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" title="View Report">
          View Report
        </a>
        <a href="review.html?id=${emp.id}" class="btn btn-secondary" style="padding: 6px 12px; font-size: 0.8rem; color: var(--primary-color);" title="Edit Evaluation">
          Edit Review
        </a>
      `;
    } else {
      reviewBtn = `
        <a href="review.html?id=${emp.id}" class="btn btn-primary" style="padding: 6px 12px; font-size: 0.8rem;" title="Evaluate Performance">
          Evaluate
        </a>
      `;
    }

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <span class="emp-id-text">${emp.id}</span>
      </td>
      <td>
        <div class="emp-details-cell">
          <div class="employee-avatar-wrapper" style="width: 40px; height: 40px;">
            ${getInitialsAvatar(emp.name)}
          </div>
          <div class="emp-info-stack">
            <span class="emp-name">${emp.name}</span>
            <span class="emp-email">${emp.email}</span>
          </div>
        </div>
      </td>
      <td>
        <span style="font-weight: 500;">${emp.department}</span>
      </td>
      <td>
        <span style="color: var(--text-secondary);">${emp.position}</span>
      </td>
      <td>
        <span class="badge ${badgeClass}">${reviewData.label}</span>
      </td>
      <td>
        <div class="actions-cell">
          ${reviewBtn}
          <button class="btn btn-secondary" onclick="openEditModal('${emp.id}')" style="padding: 6px; border-radius: var(--radius-sm);" title="Edit Profile Details">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button class="btn btn-secondary" onclick="triggerDelete('${emp.id}', '${emp.name.replace("'", "\\'")}')" style="padding: 6px; border-radius: var(--radius-sm); color: var(--danger-color);" title="Delete Employee">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // 5. Update pagination summary details
  updatePaginationControls(totalItems, startIndex + 1, endIndex, totalPages);
}

function updatePaginationControls(totalItems, fromIndex, toIndex, totalPages) {
  const info = document.getElementById('paginationInfo');
  const btnsContainer = document.getElementById('paginationBtns');
  
  if (totalItems === 0) {
    info.innerText = 'Showing 0 to 0 of 0 entries';
    btnsContainer.innerHTML = '';
    return;
  }

  info.innerText = `Showing ${fromIndex} to ${toIndex} of ${totalItems} entries`;
  btnsContainer.innerHTML = '';

  // Prev Button
  const prevBtn = document.createElement('button');
  prevBtn.className = `pagination-btn ${currentPage === 1 ? 'disabled' : ''}`;
  prevBtn.innerHTML = `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
    </svg>
  `;
  if (currentPage > 1) {
    prevBtn.addEventListener('click', () => {
      currentPage--;
      renderDirectory();
    });
  }
  btnsContainer.appendChild(prevBtn);

  // Numerical pages
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement('button');
    pageBtn.className = `pagination-btn ${currentPage === i ? 'active' : ''}`;
    pageBtn.innerText = i;
    pageBtn.addEventListener('click', () => {
      currentPage = i;
      renderDirectory();
    });
    btnsContainer.appendChild(pageBtn);
  }

  // Next Button
  const nextBtn = document.createElement('button');
  nextBtn.className = `pagination-btn ${currentPage === totalPages ? 'disabled' : ''}`;
  nextBtn.innerHTML = `
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
    </svg>
  `;
  if (currentPage < totalPages) {
    nextBtn.addEventListener('click', () => {
      currentPage++;
      renderDirectory();
    });
  }
  btnsContainer.appendChild(nextBtn);
}

// Edit Modal Opening Action
function openEditModal(empId) {
  const emp = employees.find(e => e.id === empId);
  if (!emp) return;

  document.getElementById('modalTitle').innerText = 'Edit Employee Details';
  document.getElementById('editEmployeeId').value = emp.id;
  
  const idInput = document.getElementById('empIdInput');
  idInput.value = emp.id;
  idInput.disabled = true;

  document.getElementById('empName').value = emp.name;
  document.getElementById('empPosition').value = emp.position;
  document.getElementById('empDept').value = emp.department;
  document.getElementById('empEmail').value = emp.email;

  document.getElementById('employeeModal').classList.add('active');
}

// Save/Update logic from Modal form
function saveEmployeeForm() {
  const editId = document.getElementById('editEmployeeId').value;
  const name = document.getElementById('empName').value.trim();
  const position = document.getElementById('empPosition').value.trim();
  const dept = document.getElementById('empDept').value;
  const email = document.getElementById('empEmail').value.trim();
  const idVal = document.getElementById('empIdInput').value.trim().toUpperCase();

  if (!name || !position || !email || !idVal) {
    showToast('All fields are required.', 'warning');
    return;
  }

  if (editId) {
    // Edit existing employee
    const index = employees.findIndex(e => e.id === editId);
    if (index >= 0) {
      employees[index].name = name;
      employees[index].position = position;
      employees[index].department = dept;
      employees[index].email = email;
      showToast('Employee information updated.', 'success');
    }
  } else {
    // Check if ID is duplicate
    if (employees.some(e => e.id === idVal)) {
      showToast(`Employee ID ${idVal} already exists.`, 'danger');
      return;
    }
    // Add new employee
    const newEmp = {
      id: idVal,
      name: name,
      department: dept,
      position: position,
      email: email,
      status: 'Active'
    };
    employees.push(newEmp);
    showToast('New employee added successfully.', 'success');
  }

  saveEmployees(employees);
  refreshData();
  document.getElementById('employeeModal').classList.remove('active');
  renderDirectory();
}

// Delete Confirmation trigger
function triggerDelete(empId, empName) {
  showConfirmDialog(
    'Delete Employee Record',
    `Are you sure you want to permanently delete ${empName} (${empId})? This will also remove any performance evaluations linked to them.`,
    () => {
      // Perform delete
      employees = employees.filter(e => e.id !== empId);
      reviews = reviews.filter(r => r.employeeId !== empId);
      
      saveEmployees(employees);
      saveReviews(reviews);
      
      showToast(`Employee record for ${empName} has been deleted.`, 'success');
      
      refreshData();
      renderDirectory();
    }
  );
}
