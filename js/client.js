/**
 * FITZONE - Client-Facing Website & Member Portal Controller
 * Dynamic plan rendering, class booking, QR digital pass, fitness tracker chart, interactive workouts
 */

document.addEventListener('DOMContentLoaded', () => {
  ClientApp.init();
});

const ClientApp = {
  currentUser: null,
  currentMember: null,
  progressChart: null,

  init() {
    this.currentUser = Auth.getCurrentUser();
    this.updateNavbarAuth();
    this.renderDynamicSections();
    this.initMobileNav();

    // If on Member Dashboard page
    if (window.location.pathname.includes('my-dashboard.html')) {
      this.initMemberPortal();
    }
  },

  // Toggle dynamic navigation buttons based on login state
  updateNavbarAuth() {
    const authActions = document.getElementById('client-navbar-actions');
    if (!authActions) return;

    if (this.currentUser) {
      const isInsideClient = window.location.pathname.includes('/client/');
      const dashboardLink = isInsideClient ? 'my-dashboard.html' : 'client/my-dashboard.html';
      const adminLink = isInsideClient ? '../admin/dashboard.html' : 'admin/dashboard.html';

      authActions.innerHTML = `
        ${this.currentUser.role === 'admin' ? `
          <a href="${adminLink}" class="btn btn-outline btn-sm">
            <i class="fa-solid fa-lock"></i> Admin Panel
          </a>
        ` : ''}
        <a href="${dashboardLink}" class="btn btn-outline btn-sm">
          <img src="${this.currentUser.avatar}" style="width: 20px; height: 20px; border-radius: 50%; object-fit: cover; margin-right: 5px;">
          ${this.currentUser.name.split(' ')[0]}
        </a>
        <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">
          <i class="fa-solid fa-arrow-right-from-bracket"></i>
        </button>
      `;
    } else {
      const isInsideClient = window.location.pathname.includes('/client/');
      const loginLink = isInsideClient ? '../login.html' : 'login.html';
      const registerLink = isInsideClient ? '../register.html' : 'register.html';

      authActions.innerHTML = `
        <a href="${loginLink}" class="btn btn-outline btn-sm">Login</a>
        <a href="${registerLink}" class="btn btn-primary btn-sm">Join FITZONE</a>
      `;
    }
  },

  initMobileNav() {
    const toggle = document.querySelector('.client-mobile-toggle');
    const links = document.querySelector('.client-nav-links');
    if (toggle && links) {
      toggle.addEventListener('click', () => {
        links.classList.toggle('open');
      });
    }
  },

  // Render dynamic elements across public pages
  renderDynamicSections() {
    this.renderPricingPlans();
    this.renderTrainersGrid();
    this.renderClassesGrid();
  },

  // Dynamic pricing plans on Home and Plans pages
  renderPricingPlans() {
    const container = document.getElementById('dynamic-pricing-container');
    if (!container) return;

    const plans = DB.get('plans');
    const isInsideClient = window.location.pathname.includes('/client/');
    const plansPageLink = isInsideClient ? 'plans.html' : 'client/plans.html';

    container.innerHTML = plans.map(p => {
      return `
        <div class="pricing-card ${p.popular ? 'popular' : ''}">
          ${p.badge ? `<div class="pricing-badge">${p.badge}</div>` : ''}
          <div class="plan-header">
            <h3 class="plan-name">${p.name}</h3>
            <p class="plan-desc">${p.description}</p>
          </div>

          <div class="plan-price-box">
            <span class="plan-amount">${p.price.toLocaleString('en-US')}</span>
            <span class="plan-currency">EGP</span>
            <span class="plan-cycle">/ ${p.billingCycle}</span>
          </div>

          <ul class="plan-features-list">
            ${p.features.map(f => `
              <li><i class="fa-solid fa-check"></i> <span>${f}</span></li>
            `).join('')}
            ${p.notIncluded ? p.notIncluded.map(nf => `
              <li style="opacity: 0.5;"><i class="fa-solid fa-xmark"></i> <span>${nf}</span></li>
            `).join('') : ''}
          </ul>

          <button class="btn ${p.popular ? 'btn-primary' : 'btn-outline'} w-full" onclick="ClientApp.selectPlan('${p.id}')">
            ${p.popular ? 'Choose Pro Pass' : 'Select Plan'}
          </button>
        </div>
      `;
    }).join('');
  },

  // Dynamic trainer grid on Home and Trainers pages
  renderTrainersGrid() {
    const container = document.getElementById('dynamic-trainers-container');
    if (!container) return;

    const trainers = DB.get('trainers');
    container.innerHTML = trainers.map(t => {
      return `
        <div class="trainer-card">
          <div style="overflow: hidden; height: 280px;">
            <img src="${t.image}" alt="${t.name}" class="trainer-card-img">
          </div>
          <div class="trainer-card-body">
            <div class="trainer-card-spec">${t.specialization}</div>
            <h3 class="trainer-card-name">${t.name}</h3>
            <p class="trainer-card-bio">${t.bio}</p>
            <div class="trainer-card-footer">
              <span><i class="fa-solid fa-clock text-primary"></i> ${t.workingHours}</span>
              <span class="font-bold text-primary"><i class="fa-solid fa-star" style="color: #f59e0b;"></i> ${t.rating}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Dynamic fitness classes grid
  renderClassesGrid() {
    const container = document.getElementById('dynamic-classes-container');
    if (!container) return;

    const classes = DB.get('classes');
    const memberId = this.currentUser ? this.currentUser.memberId : null;

    container.innerHTML = classes.map(c => {
      const bookedCount = c.bookedMembers.length;
      const remainingSeats = c.capacity - bookedCount;
      const isFull = remainingSeats <= 0;
      const isBookedByMe = memberId && c.bookedMembers.includes(memberId);
      const percentFull = Math.min(100, Math.round((bookedCount / c.capacity) * 100));

      return `
        <div class="class-card">
          <div class="class-img-box">
            <img src="${c.image}" alt="${c.title}">
            <span class="class-category-badge">${c.category}</span>
          </div>
          <div class="class-card-body">
            <h3 class="class-card-title">${c.title}</h3>
            <p class="text-secondary" style="font-size: 0.85rem; line-height: 1.5; margin-bottom: 0.85rem;">${c.description}</p>

            <div class="class-meta-list">
              <div class="class-meta-item">
                <i class="fa-solid fa-user-tie"></i>
                <span>Coach: <strong>${c.trainerName}</strong></span>
              </div>
              <div class="class-meta-item">
                <i class="fa-solid fa-calendar-check"></i>
                <span>${c.schedule} (${c.durationMin} mins)</span>
              </div>
              <div class="class-meta-item">
                <i class="fa-solid fa-location-dot"></i>
                <span>${c.room}</span>
              </div>
              <div class="class-meta-item">
                <i class="fa-solid fa-fire"></i>
                <span>Burn: ${c.caloriesBurn}</span>
              </div>
            </div>

            <div class="class-capacity-bar">
              <div class="capacity-text">
                <span>Capacity: ${bookedCount} / ${c.capacity}</span>
                <span class="${isFull ? 'text-danger font-bold' : 'text-primary'}">${isFull ? 'Class Full' : `${remainingSeats} Seats Available`}</span>
              </div>
              <div class="progress-track">
                <div class="progress-fill" style="width: ${percentFull}%; background: ${isFull ? 'var(--danger)' : 'var(--primary)'};"></div>
              </div>
            </div>

            <div style="margin-top: auto;">
              ${isBookedByMe ? `
                <button class="btn btn-secondary w-full" onclick="ClientApp.cancelBooking('${c.id}')">
                  <i class="fa-solid fa-circle-check text-success"></i> Booked • Cancel Seat
                </button>
              ` : `
                <button class="btn ${isFull ? 'btn-secondary' : 'btn-primary'} w-full" ${isFull ? 'disabled' : ''} onclick="ClientApp.handleClassBooking('${c.id}')">
                  <i class="fa-solid fa-ticket"></i> ${isFull ? 'Sold Out' : 'Reserve Seat'}
                </button>
              `}
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  // Plan Selection trigger
  selectPlan(planId) {
    const plan = DB.getById('plans', planId);
    if (!plan) return;

    if (!this.currentUser) {
      App.showToast(`Selected "${plan.name}". Please log in or register to complete your enrollment.`, "info");
      const isInsideClient = window.location.pathname.includes('/client/');
      const loginUrl = isInsideClient ? '../register.html' : 'register.html';
      setTimeout(() => window.location.href = loginUrl, 1000);
      return;
    }

    // If logged in as client, renew/assign plan
    App.confirm(
      `Subscribe to ${plan.name}?`,
      `Would you like to enroll in the ${plan.name} (${App.formatCurrency(plan.price)}) plan?`,
      () => {
        const member = DB.getById('members', this.currentUser.memberId);
        if (member) {
          const now = new Date();
          const newExp = new Date(now.getTime() + (plan.durationDays || 30) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

          DB.update('members', member.id, {
            planId: plan.id,
            planName: plan.name,
            expireDate: newExp,
            status: 'Active'
          });

          DB.recordPayment({
            memberId: member.id,
            memberName: member.name,
            amount: plan.price,
            planId: plan.id,
            planName: plan.name,
            method: 'Visa / Online',
            status: 'Paid',
            notes: 'Subscribed through client portal'
          });

          App.showToast(`Congratulations! You are now subscribed to ${plan.name}.`, "success");
          setTimeout(() => {
            const isInsideClient = window.location.pathname.includes('/client/');
            window.location.href = isInsideClient ? 'my-dashboard.html' : 'client/my-dashboard.html';
          }, 800);
        }
      }
    );
  },

  // Class Booking Trigger
  handleClassBooking(classId) {
    if (!this.currentUser) {
      App.showToast("Please log in to your FITZONE account to reserve a class.", "warning");
      const isInsideClient = window.location.pathname.includes('/client/');
      const loginUrl = isInsideClient ? '../login.html' : 'login.html';
      setTimeout(() => window.location.href = loginUrl, 1200);
      return;
    }

    const memberId = this.currentUser.memberId;
    if (!memberId) {
      App.showToast("Only gym members can reserve classes.", "error");
      return;
    }

    const res = DB.bookClass(classId, memberId);
    if (res.success) {
      App.showToast(`Seat confirmed for ${res.class.title}! (${res.remaining} seats left)`, "success", "Class Reserved");
      this.renderClassesGrid();
      if (window.location.pathname.includes('my-dashboard.html')) {
        this.renderMyBookedClasses();
      }
    } else {
      App.showToast(res.message, "error");
    }
  },

  // Cancel Booking
  cancelBooking(classId) {
    if (!this.currentUser || !this.currentUser.memberId) return;

    const res = DB.cancelClassBooking(classId, this.currentUser.memberId);
    if (res.success) {
      App.showToast(`Booking cancelled for ${res.class.title}. Seat restored.`, "info");
      this.renderClassesGrid();
      if (window.location.pathname.includes('my-dashboard.html')) {
        this.renderMyBookedClasses();
      }
    }
  },

  // =========================================================================
  // Member Portal & Dashboard Initialization
  // =========================================================================
  initMemberPortal() {
    // 1. Guard route: must be logged in
    if (!this.currentUser) {
      window.location.href = '../login.html';
      return;
    }

    // 2. Load member details
    let member = DB.getById('members', this.currentUser.memberId);
    if (!member) {
      // Fallback to first member if demo account
      member = DB.get('members')[0];
    }
    this.currentMember = member;

    this.renderPortalHeader();
    this.renderDigitalMembershipCard();
    this.renderMyBookedClasses();
    this.renderAssignedWorkout();
    this.renderFitnessChart();
    this.renderAttendanceHistory();
    this.renderPaymentHistory();
  },

  renderPortalHeader() {
    const member = this.currentMember;
    const nameEl = document.getElementById('portal-user-name');
    const statusBadgeEl = document.getElementById('portal-status-badge');
    const planNameEl = document.getElementById('portal-plan-name');
    const daysRemainingEl = document.getElementById('portal-days-remaining');

    if (nameEl) nameEl.textContent = member.name;
    if (statusBadgeEl) statusBadgeEl.innerHTML = App.statusBadge(member.status);
    if (planNameEl) planNameEl.textContent = member.planName || 'Standard';

    if (daysRemainingEl) {
      const today = new Date();
      const expDate = new Date(member.expireDate);
      const diffTime = expDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        daysRemainingEl.textContent = `${diffDays} Days Remaining (Expires: ${member.expireDate})`;
        daysRemainingEl.className = 'font-semibold text-primary';
      } else {
        daysRemainingEl.textContent = `Expired on ${member.expireDate}`;
        daysRemainingEl.className = 'font-semibold text-danger';
      }
    }
  },

  renderDigitalMembershipCard() {
    const member = this.currentMember;
    const cardNumEl = document.getElementById('card-member-id');
    const cardHolderEl = document.getElementById('card-member-name');
    const cardPlanEl = document.getElementById('card-member-plan');
    const cardExpEl = document.getElementById('card-member-exp');
    const qrContainer = document.getElementById('card-qr-code');

    if (cardNumEl) cardNumEl.textContent = member.id;
    if (cardHolderEl) cardHolderEl.textContent = member.name.toUpperCase();
    if (cardPlanEl) cardPlanEl.textContent = member.planName || 'FITZONE PASS';
    if (cardExpEl) cardExpEl.textContent = member.expireDate;

    if (qrContainer) {
      App.generateQRCode(qrContainer, member.id, 130);
    }
  },

  renderMyBookedClasses() {
    const container = document.getElementById('portal-booked-classes-container');
    if (!container || !this.currentMember) return;

    const memberId = this.currentMember.id;
    const classes = DB.get('classes').filter(c => c.bookedMembers.includes(memberId));

    if (classes.length === 0) {
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-md);">
          <i class="fa-solid fa-calendar-xmark" style="font-size: 2rem; margin-bottom: 0.5rem; opacity: 0.5; display: block;"></i>
          You have no upcoming class bookings. Explore our schedule to reserve a class!
        </div>
      `;
      return;
    }

    container.innerHTML = classes.map(c => `
      <div class="flex items-center justify-between" style="background: var(--bg-surface); padding: 1rem 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin-bottom: 0.75rem;">
        <div>
          <div class="font-bold text-main" style="font-size: 1rem;">${c.title}</div>
          <div class="text-secondary" style="font-size: 0.8rem; margin-top: 2px;">
            <i class="fa-solid fa-clock text-primary"></i> ${c.schedule} • Coach: ${c.trainerName}
          </div>
        </div>
        <button class="btn btn-outline btn-sm text-danger" onclick="ClientApp.cancelBooking('${c.id}')">
          <i class="fa-solid fa-xmark"></i> Cancel
        </button>
      </div>
    `).join('');
  },

  renderAssignedWorkout() {
    const container = document.getElementById('portal-workout-container');
    if (!container || !this.currentMember) return;

    const planId = this.currentMember.workoutPlanId;
    const plan = planId ? DB.getById('workouts', planId) : null;

    if (!plan) {
      container.innerHTML = `
        <div style="padding: 2rem; text-align: center; color: var(--text-muted); background: var(--bg-surface); border-radius: var(--radius-md);">
          <p>No customized workout plan assigned yet. Ask your coach to assign one!</p>
        </div>
      `;
      return;
    }

    const titleEl = document.getElementById('portal-workout-title');
    if (titleEl) titleEl.textContent = plan.title;

    container.innerHTML = plan.exercises.map((ex, idx) => `
      <div class="workout-item-row" id="workout-row-${idx}">
        <input type="checkbox" class="workout-checkbox" onchange="ClientApp.toggleWorkoutItem(${idx}, this.checked)">
        <div style="flex: 1;">
          <div class="font-semibold text-main">${ex.name}</div>
          <div class="text-secondary" style="font-size: 0.78rem;">
            ${ex.sets} Sets × ${ex.reps} Reps • Rest: ${ex.restSec}s • <span class="text-primary">${ex.muscle}</span>
          </div>
        </div>
        <span class="badge badge-secondary" style="font-size: 0.75rem;">${ex.notes || 'Strict form'}</span>
      </div>
    `).join('');
  },

  toggleWorkoutItem(idx, isChecked) {
    const row = document.getElementById(`workout-row-${idx}`);
    if (row) {
      if (isChecked) {
        row.classList.add('completed');
        App.showToast("Exercise completed!", "success");
      } else {
        row.classList.remove('completed');
      }
    }
  },

  // Interactive Weight & Fitness Progress Chart (Chart.js)
  renderFitnessChart() {
    const canvas = document.getElementById('client-progress-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const member = this.currentMember;
    const measurements = member && member.measurements ? member.measurements : [];

    const labels = measurements.map(m => m.date);
    const weights = measurements.map(m => m.weight);
    const bodyFats = measurements.map(m => m.bodyFat || 20);

    if (this.progressChart) {
      this.progressChart.destroy();
    }

    this.progressChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels.length > 0 ? labels : ['Start'],
        datasets: [
          {
            label: 'Weight (kg)',
            data: weights.length > 0 ? weights : [80],
            borderColor: '#ff5e14',
            backgroundColor: 'rgba(255, 94, 20, 0.1)',
            fill: true,
            tension: 0.35,
            pointBackgroundColor: '#ff5e14',
            pointRadius: 5
          },
          {
            label: 'Body Fat %',
            data: bodyFats.length > 0 ? bodyFats : [20],
            borderColor: '#06b6d4',
            backgroundColor: 'transparent',
            borderDash: [5, 5],
            tension: 0.35,
            pointBackgroundColor: '#06b6d4',
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#9ca3af', font: { family: 'Plus Jakarta Sans', size: 12 } }
          }
        },
        scales: {
          x: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af' }
          },
          y: {
            grid: { color: 'rgba(255, 255, 255, 0.05)' },
            ticks: { color: '#9ca3af' }
          }
        }
      }
    });
  },

  // Log new measurement modal
  openLogMeasurementModal() {
    const dateInput = document.getElementById('log-measure-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    App.openModal('log-measurement-modal');
  },

  saveMeasurement(event) {
    event.preventDefault();
    if (!this.currentMember) return;

    const date = document.getElementById('log-measure-date').value;
    const weight = parseFloat(document.getElementById('log-measure-weight').value) || 0;
    const height = parseFloat(document.getElementById('log-measure-height').value) || 175;
    const chest = parseFloat(document.getElementById('log-measure-chest').value) || 0;
    const waist = parseFloat(document.getElementById('log-measure-waist').value) || 0;
    const arms = parseFloat(document.getElementById('log-measure-arms').value) || 0;
    const bodyFat = parseFloat(document.getElementById('log-measure-bodyfat').value) || 0;

    const newEntry = { date, weight, height, chest, waist, arms, bodyFat };
    const member = this.currentMember;
    const updatedMeasurements = [...(member.measurements || []), newEntry];

    DB.update('members', member.id, { measurements: updatedMeasurements });
    this.currentMember.measurements = updatedMeasurements;

    App.closeModal('log-measurement-modal');
    App.showToast(`Measurement for ${date} logged successfully!`, "success");
    this.renderFitnessChart();
  },

  renderAttendanceHistory() {
    const tableBody = document.getElementById('portal-attendance-tbody');
    if (!tableBody || !this.currentMember) return;

    const history = DB.get('attendance').filter(a => a.memberId === this.currentMember.id);
    if (history.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="padding: 1.5rem;">No attendance visits recorded.</td></tr>`;
      return;
    }

    tableBody.innerHTML = history.map(h => `
      <tr>
        <td>${h.date}</td>
        <td><i class="fa-solid fa-right-to-bracket text-primary"></i> ${h.checkInTime.split(' ')[1] || h.checkInTime}</td>
        <td>${h.checkOutTime ? h.checkOutTime.split(' ')[1] : '<span class="badge badge-primary">Active</span>'}</td>
        <td>${h.durationMin ? `${h.durationMin} mins` : '-'}</td>
        <td>${App.statusBadge(h.status)}</td>
      </tr>
    `).join('');
  },

  renderPaymentHistory() {
    const tableBody = document.getElementById('portal-payments-tbody');
    if (!tableBody || !this.currentMember) return;

    const payments = DB.get('payments').filter(p => p.memberId === this.currentMember.id);
    if (payments.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="padding: 1.5rem;">No payment transactions on file.</td></tr>`;
      return;
    }

    tableBody.innerHTML = payments.map(p => `
      <tr>
        <td class="font-mono">${p.id}</td>
        <td>${p.planName}</td>
        <td class="font-bold text-primary">${App.formatCurrency(p.amount)}</td>
        <td>${p.method}</td>
        <td>${p.date}</td>
        <td>${App.statusBadge(p.status)}</td>
      </tr>
    `).join('');
  },

  // Contact form submission
  handleContactSubmit(event) {
    event.preventDefault();
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const phone = document.getElementById('contact-phone').value.trim();
    const subject = document.getElementById('contact-subject').value;
    const message = document.getElementById('contact-message').value.trim();

    // Create system notification for admin
    DB.add('notifications', {
      type: 'registration',
      title: `Inquiry: ${subject}`,
      message: `Message from ${name} (${phone}, ${email}): "${message.slice(0, 80)}..."`,
      time: new Date().toISOString().replace('T', ' ').slice(0, 16),
      read: false,
      badge: 'Inquiry',
      link: 'notifications.html'
    });

    event.target.reset();
    App.showToast("Thank you! Your message has been received. Our team will contact you shortly.", "success", "Message Sent");
  }
};
