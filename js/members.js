/**
 * FITZONE - Members Management Controller
 * Handles Member CRUD, filtering, sorting, pagination, profile view, renewals
 */

let membersState = {
  search: '',
  statusFilter: 'all',
  planFilter: 'all',
  sortBy: 'name',
  sortOrder: 'asc',
  currentPage: 1,
  pageSize: 8
};

document.addEventListener('DOMContentLoaded', () => {
  // Check for search query param in URL
  const urlParams = new URLSearchParams(window.location.search);
  const q = urlParams.get('search');
  if (q) {
    membersState.search = q;
    const searchInput = document.getElementById('member-search-input');
    if (searchInput) searchInput.value = q;
  }

  MembersCtrl.init();
});

const MembersCtrl = {
  init() {
    this.populateDropdowns();
    this.render();
    this.bindEvents();
  },

  populateDropdowns() {
    // Populate plans in filter & modal
    const plans = DB.get('plans');
    const filterSelect = document.getElementById('filter-plan-select');
    const modalPlanSelect = document.getElementById('member-plan-select');

    if (filterSelect) {
      filterSelect.innerHTML = `<option value="all">All Plans</option>` + 
        plans.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
    }

    if (modalPlanSelect) {
      modalPlanSelect.innerHTML = plans.map(p => `<option value="${p.id}">${p.name} (${App.formatCurrency(p.price)})</option>`).join('');
    }

    // Populate trainers in modal
    const trainers = DB.get('trainers');
    const modalTrainerSelect = document.getElementById('member-trainer-select');
    if (modalTrainerSelect) {
      modalTrainerSelect.innerHTML = `<option value="">None (Self-guided)</option>` + 
        trainers.map(t => `<option value="${t.id}">${t.name} - ${t.specialization}</option>`).join('');
    }

    // Populate workouts in modal
    const workouts = DB.get('workouts');
    const modalWorkoutSelect = document.getElementById('member-workout-select');
    if (modalWorkoutSelect) {
      modalWorkoutSelect.innerHTML = `<option value="">None Assigned</option>` + 
        workouts.map(w => `<option value="${w.id}">${w.title} (${w.category})</option>`).join('');
    }
  },

  bindEvents() {
    const searchInput = document.getElementById('member-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        membersState.search = e.target.value.trim().toLowerCase();
        membersState.currentPage = 1;
        this.render();
      });
    }

    const statusFilter = document.getElementById('filter-status-select');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        membersState.statusFilter = e.target.value;
        membersState.currentPage = 1;
        this.render();
      });
    }

    const planFilter = document.getElementById('filter-plan-select');
    if (planFilter) {
      planFilter.addEventListener('change', (e) => {
        membersState.planFilter = e.target.value;
        membersState.currentPage = 1;
        this.render();
      });
    }

    // Auto calculate expiration date when changing plan or start date in add modal
    const startDateInput = document.getElementById('member-start-date');
    const planSelect = document.getElementById('member-plan-select');
    const expDateInput = document.getElementById('member-exp-date');

    const updateCalculatedExpDate = () => {
      if (startDateInput && planSelect && expDateInput) {
        const startVal = startDateInput.value || new Date().toISOString().split('T')[0];
        const planId = planSelect.value;
        const plan = DB.getById('plans', planId);
        if (plan) {
          const startDate = new Date(startVal);
          const expDate = new Date(startDate.getTime() + (plan.durationDays || 30) * 24 * 60 * 60 * 1000);
          expDateInput.value = expDate.toISOString().split('T')[0];
        }
      }
    };

    if (startDateInput) startDateInput.addEventListener('change', updateCalculatedExpDate);
    if (planSelect) planSelect.addEventListener('change', updateCalculatedExpDate);
  },

  getFilteredMembers() {
    let list = DB.get('members');

    // Search filter
    if (membersState.search) {
      const q = membersState.search;
      list = list.filter(m => 
        (m.name && m.name.toLowerCase().includes(q)) ||
        (m.id && m.id.toLowerCase().includes(q)) ||
        (m.email && m.email.toLowerCase().includes(q)) ||
        (m.phone && m.phone.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (membersState.statusFilter !== 'all') {
      list = list.filter(m => m.status.toLowerCase() === membersState.statusFilter.toLowerCase());
    }

    // Plan filter
    if (membersState.planFilter !== 'all') {
      list = list.filter(m => m.planId === membersState.planFilter);
    }

    // Sorting
    list.sort((a, b) => {
      let valA = a[membersState.sortBy] || '';
      let valB = b[membersState.sortBy] || '';
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return membersState.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return membersState.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  },

  render() {
    const tableBody = document.getElementById('members-table-body');
    const countBadge = document.getElementById('members-total-count');
    if (!tableBody) return;

    const filtered = this.getFilteredMembers();
    if (countBadge) countBadge.textContent = `${filtered.length} Members`;

    if (filtered.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 3rem; color: var(--text-muted);">
            <i class="fa-solid fa-users-slash" style="font-size: 2.5rem; margin-bottom: 1rem; display: block; opacity: 0.5;"></i>
            No members found matching your search or filters.
          </td>
        </tr>
      `;
      this.renderPagination(0);
      return;
    }

    // Pagination slice
    const totalPages = Math.ceil(filtered.length / membersState.pageSize);
    if (membersState.currentPage > totalPages) membersState.currentPage = totalPages || 1;
    
    const startIndex = (membersState.currentPage - 1) * membersState.pageSize;
    const paginated = filtered.slice(startIndex, startIndex + membersState.pageSize);

    tableBody.innerHTML = paginated.map(m => {
      return `
        <tr>
          <td>
            <div class="avatar-cell">
              <img src="${m.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="avatar-img" alt="${m.name}" />
              <div>
                <div class="avatar-info-name">${m.name}</div>
                <div class="avatar-info-sub font-mono">${m.id}</div>
              </div>
            </div>
          </td>
          <td>
            <div>${m.phone}</div>
            <div class="text-muted" style="font-size: 0.78rem;">${m.email}</div>
          </td>
          <td>
            <span class="font-semibold text-primary">${m.planName || 'Standard'}</span>
          </td>
          <td>
            <div>${App.formatDate(m.startDate)}</div>
            <div class="text-muted" style="font-size: 0.78rem;">Exp: ${App.formatDate(m.expireDate)}</div>
          </td>
          <td>
            ${m.assignedTrainerName && m.assignedTrainerName !== 'None' ? 
              `<span class="badge badge-secondary"><i class="fa-solid fa-user-tie text-primary"></i> ${m.assignedTrainerName.replace('Captain ', '')}</span>` : 
              `<span class="text-muted" style="font-size: 0.8rem;">Unassigned</span>`
            }
          </td>
          <td>${App.statusBadge(m.status)}</td>
          <td class="text-right">
            <div class="flex gap-1 justify-center">
              <button class="btn btn-outline btn-sm btn-icon" title="View Member Profile" onclick="MembersCtrl.viewMember('${m.id}')">
                <i class="fa-solid fa-eye"></i>
              </button>
              <button class="btn btn-secondary btn-sm btn-icon" title="Edit Member" onclick="MembersCtrl.openEditModal('${m.id}')">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline btn-sm btn-icon text-danger" title="Delete Member" onclick="MembersCtrl.deleteMember('${m.id}')">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.renderPagination(filtered.length);
  },

  renderPagination(totalCount) {
    const container = document.getElementById('members-pagination');
    if (!container) return;

    const totalPages = Math.ceil(totalCount / membersState.pageSize);
    if (totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let html = `
      <div class="flex items-center gap-1">
        <button class="btn btn-secondary btn-sm" ${membersState.currentPage === 1 ? 'disabled' : ''} onclick="MembersCtrl.setPage(${membersState.currentPage - 1})">
          <i class="fa-solid fa-chevron-left"></i>
        </button>
    `;

    for (let p = 1; p <= totalPages; p++) {
      html += `
        <button class="btn btn-sm ${membersState.currentPage === p ? 'btn-primary' : 'btn-secondary'}" onclick="MembersCtrl.setPage(${p})">
          ${p}
        </button>
      `;
    }

    html += `
        <button class="btn btn-secondary btn-sm" ${membersState.currentPage === totalPages ? 'disabled' : ''} onclick="MembersCtrl.setPage(${membersState.currentPage + 1})">
          <i class="fa-solid fa-chevron-right"></i>
        </button>
      </div>
    `;

    container.innerHTML = html;
  },

  setPage(page) {
    membersState.currentPage = page;
    this.render();
  },

  // View Member Details in modal drawer
  viewMember(memberId) {
    const member = DB.getById('members', memberId);
    if (!member) return;

    // Fill Modal elements
    document.getElementById('view-member-id').textContent = member.id;
    document.getElementById('view-member-name').textContent = member.name;
    document.getElementById('view-member-photo').src = member.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200';
    document.getElementById('view-member-status').innerHTML = App.statusBadge(member.status);
    document.getElementById('view-member-email').textContent = member.email;
    document.getElementById('view-member-phone').textContent = member.phone;
    document.getElementById('view-member-gender').textContent = member.gender || 'Not specified';
    document.getElementById('view-member-dob').textContent = member.dob || 'N/A';
    document.getElementById('view-member-address').textContent = member.address || 'Cairo, Egypt';
    document.getElementById('view-member-reg').textContent = App.formatDate(member.registrationDate);

    // Plan & Expiration
    document.getElementById('view-member-plan').textContent = member.planName || 'None';
    document.getElementById('view-member-start').textContent = App.formatDate(member.startDate);
    document.getElementById('view-member-expire').textContent = App.formatDate(member.expireDate);
    document.getElementById('view-member-trainer').textContent = member.assignedTrainerName || 'None Assigned';
    document.getElementById('view-member-workout').textContent = member.workoutPlanName || 'Standard Full Body';

    // Member attendance history
    const allAttendance = DB.get('attendance').filter(a => a.memberId === member.id);
    const attListEl = document.getElementById('view-member-attendance-list');
    if (attListEl) {
      if (allAttendance.length === 0) {
        attListEl.innerHTML = `<p class="text-muted" style="font-size: 0.85rem;">No attendance records found for this member.</p>`;
      } else {
        attListEl.innerHTML = `
          <table class="table" style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th>Date</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Duration</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${allAttendance.map(a => `
                <tr>
                  <td>${a.date}</td>
                  <td>${a.checkInTime.split(' ')[1] || a.checkInTime}</td>
                  <td>${a.checkOutTime ? a.checkOutTime.split(' ')[1] : '<span class="text-primary font-semibold">Active Inside</span>'}</td>
                  <td>${a.durationMin ? `${a.durationMin} mins` : '-'}</td>
                  <td>${App.statusBadge(a.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }

    // Member payments history
    const allPayments = DB.get('payments').filter(p => p.memberId === member.id);
    const payListEl = document.getElementById('view-member-payments-list');
    if (payListEl) {
      if (allPayments.length === 0) {
        payListEl.innerHTML = `<p class="text-muted" style="font-size: 0.85rem;">No payment transactions recorded.</p>`;
      } else {
        payListEl.innerHTML = `
          <table class="table" style="font-size: 0.82rem;">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${allPayments.map(p => `
                <tr>
                  <td class="font-mono">${p.id}</td>
                  <td>${p.planName}</td>
                  <td class="font-semibold text-primary">${App.formatCurrency(p.amount)}</td>
                  <td>${p.method}</td>
                  <td>${p.date}</td>
                  <td>${App.statusBadge(p.status)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }
    }

    // Set action buttons in modal
    const renewBtn = document.getElementById('modal-renew-member-btn');
    if (renewBtn) {
      renewBtn.onclick = () => {
        MembersCtrl.openRenewModal(member.id);
      };
    }

    App.openModal('member-details-modal');
  },

  // Open Add Member Modal
  openAddModal() {
    document.getElementById('member-modal-title').textContent = "Add New Gym Member";
    document.getElementById('member-form').reset();
    document.getElementById('member-id-field').value = ""; // Empty means create new
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('member-start-date').value = today;
    
    // Auto calculate initial exp date
    const planSelect = document.getElementById('member-plan-select');
    if (planSelect) {
      const plan = DB.getById('plans', planSelect.value);
      if (plan) {
        const expDate = new Date(Date.now() + (plan.durationDays || 30) * 24 * 60 * 60 * 1000);
        document.getElementById('member-exp-date').value = expDate.toISOString().split('T')[0];
      }
    }

    App.openModal('member-form-modal');
  },

  // Open Edit Member Modal
  openEditModal(memberId) {
    const member = DB.getById('members', memberId);
    if (!member) return;

    document.getElementById('member-modal-title').textContent = `Edit Member: ${member.name}`;
    document.getElementById('member-id-field').value = member.id;
    document.getElementById('member-name').value = member.name || '';
    document.getElementById('member-email').value = member.email || '';
    document.getElementById('member-phone').value = member.phone || '';
    document.getElementById('member-gender').value = member.gender || 'Male';
    document.getElementById('member-dob').value = member.dob || '';
    document.getElementById('member-address').value = member.address || '';
    document.getElementById('member-plan-select').value = member.planId || 'plan-1';
    document.getElementById('member-start-date').value = member.startDate || '';
    document.getElementById('member-exp-date').value = member.expireDate || '';
    document.getElementById('member-status-select').value = member.status || 'Active';
    document.getElementById('member-trainer-select').value = member.assignedTrainerId || '';
    document.getElementById('member-workout-select').value = member.workoutPlanId || '';
    document.getElementById('member-photo-url').value = member.photo || '';

    App.openModal('member-form-modal');
  },

  // Save Member (Add or Update)
  saveMember(event) {
    event.preventDefault();
    const idField = document.getElementById('member-id-field').value;
    const name = document.getElementById('member-name').value.trim();
    const email = document.getElementById('member-email').value.trim();
    const phone = document.getElementById('member-phone').value.trim();
    const gender = document.getElementById('member-gender').value;
    const dob = document.getElementById('member-dob').value;
    const address = document.getElementById('member-address').value.trim();
    const planId = document.getElementById('member-plan-select').value;
    const startDate = document.getElementById('member-start-date').value;
    const expireDate = document.getElementById('member-exp-date').value;
    const status = document.getElementById('member-status-select').value;
    const trainerId = document.getElementById('member-trainer-select').value;
    const workoutId = document.getElementById('member-workout-select').value;
    const photoUrl = document.getElementById('member-photo-url').value.trim();

    if (!name || !email || !phone) {
      App.showToast("Please fill in all required fields (Name, Email, Phone).", "error");
      return;
    }

    const plan = DB.getById('plans', planId);
    const trainer = trainerId ? DB.getById('trainers', trainerId) : null;
    const workout = workoutId ? DB.getById('workouts', workoutId) : null;

    if (idField) {
      // Update existing
      DB.update('members', idField, {
        name,
        email,
        phone,
        gender,
        dob,
        address,
        planId: plan ? plan.id : planId,
        planName: plan ? plan.name : 'Standard',
        startDate,
        expireDate,
        status,
        assignedTrainerId: trainer ? trainer.id : null,
        assignedTrainerName: trainer ? trainer.name : 'None',
        workoutPlanId: workout ? workout.id : null,
        workoutPlanName: workout ? workout.title : 'None Assigned',
        photo: photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'
      });
      App.showToast(`Member ${name} successfully updated!`, "success");
    } else {
      // Create new
      const newId = DB.generateNextMemberId();
      const newMember = {
        id: newId,
        name,
        email,
        phone,
        gender,
        dob,
        address,
        photo: photoUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200',
        registrationDate: new Date().toISOString().split('T')[0],
        planId: plan ? plan.id : planId,
        planName: plan ? plan.name : 'Standard',
        startDate,
        expireDate,
        status,
        assignedTrainerId: trainer ? trainer.id : null,
        assignedTrainerName: trainer ? trainer.name : 'None',
        workoutPlanId: workout ? workout.id : null,
        workoutPlanName: workout ? workout.title : 'None Assigned',
        measurements: [
          { date: startDate, weight: 75, height: 175, chest: 100, waist: 82, arms: 35, bodyFat: 18 }
        ]
      };

      DB.add('members', newMember);

      // Create notification
      DB.add('notifications', {
        type: 'registration',
        title: 'New Member Enrolled',
        message: `${name} has been enrolled in ${newMember.planName} (${newId}).`,
        time: new Date().toISOString().replace('T', ' ').slice(0, 16),
        read: false,
        badge: 'Member',
        link: 'members.html'
      });

      App.showToast(`New member ${name} (${newId}) successfully added!`, "success");
    }

    App.closeModal('member-form-modal');
    this.render();
  },

  // Delete Member
  deleteMember(memberId) {
    const member = DB.getById('members', memberId);
    if (!member) return;

    App.confirm(
      `Delete Member ${member.name}?`,
      `Are you sure you want to delete ${member.name} (${member.id})? This will permanently remove their records from the database.`,
      () => {
        DB.delete('members', memberId);
        App.showToast(`Member ${member.name} removed.`, "success");
        this.render();
      }
    );
  },

  // Open Membership Renewal Modal
  openRenewModal(memberId) {
    const member = DB.getById('members', memberId);
    if (!member) return;

    document.getElementById('renew-member-id').value = member.id;
    document.getElementById('renew-member-name').textContent = `${member.name} (${member.id})`;
    document.getElementById('renew-current-exp').textContent = member.expireDate;

    // Plans list
    const plans = DB.get('plans');
    const renewPlanSelect = document.getElementById('renew-plan-select');
    if (renewPlanSelect) {
      renewPlanSelect.innerHTML = plans.map(p => `
        <option value="${p.id}" ${p.id === member.planId ? 'selected' : ''}>
          ${p.name} - ${App.formatCurrency(p.price)} (${p.durationDays} days)
        </option>
      `).join('');
    }

    App.closeModal('member-details-modal');
    App.openModal('renew-membership-modal');
  },

  // Process Renewal
  processRenewal(event) {
    event.preventDefault();
    const memberId = document.getElementById('renew-member-id').value;
    const planId = document.getElementById('renew-plan-select').value;
    const paymentMethod = document.getElementById('renew-payment-method').value;

    const member = DB.getById('members', memberId);
    const plan = DB.getById('plans', planId);

    if (!member || !plan) {
      App.showToast("Renewal failed: invalid member or plan selection.", "error");
      return;
    }

    // Calculate new expiration date
    const now = new Date();
    const currentExp = member.expireDate ? new Date(member.expireDate) : now;
    const baseDate = currentExp > now ? currentExp : now;
    const newExp = new Date(baseDate.getTime() + (plan.durationDays || 30) * 24 * 60 * 60 * 1000);
    const newExpStr = newExp.toISOString().split('T')[0];

    // Update member
    DB.update('members', member.id, {
      planId: plan.id,
      planName: plan.name,
      expireDate: newExpStr,
      status: 'Active'
    });

    // Record invoice
    DB.recordPayment({
      memberId: member.id,
      memberName: member.name,
      amount: plan.price,
      planId: plan.id,
      planName: `${plan.name} (Renewal)`,
      method: paymentMethod,
      status: 'Paid',
      notes: `Membership renewal through admin panel. New expiration: ${newExpStr}`
    });

    App.closeModal('renew-membership-modal');
    App.showToast(`Membership for ${member.name} renewed until ${newExpStr}!`, "success");
    this.render();
  }
};
