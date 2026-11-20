/**
 * FITZONE - Attendance Controller
 * Check-in/out logic, duplicate prevention, expired membership warning, QR scanner simulation
 */

let attendanceState = {
  dateFilter: '',
  search: '',
  statusFilter: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  AttendanceCtrl.init();
});

const AttendanceCtrl = {
  init() {
    this.populateMemberSelect();
    this.renderStats();
    this.renderTable();
    this.bindEvents();
  },

  populateMemberSelect() {
    const selectEl = document.getElementById('checkin-member-select');
    if (!selectEl) return;

    const members = DB.get('members');
    selectEl.innerHTML = `<option value="">Select Member to Check In...</option>` + 
      members.map(m => `
        <option value="${m.id}" data-status="${m.status}" data-exp="${m.expireDate}">
          ${m.name} (${m.id}) - ${m.status} [Exp: ${m.expireDate}]
        </option>
      `).join('');
  },

  bindEvents() {
    const searchInput = document.getElementById('attendance-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        attendanceState.search = e.target.value.trim().toLowerCase();
        this.renderTable();
      });
    }

    const dateFilter = document.getElementById('attendance-date-filter');
    if (dateFilter) {
      // Set to today by default or leave blank for all
      dateFilter.addEventListener('change', (e) => {
        attendanceState.dateFilter = e.target.value;
        this.renderTable();
      });
    }

    const statusFilter = document.getElementById('attendance-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        attendanceState.statusFilter = e.target.value;
        this.renderTable();
      });
    }
  },

  renderStats() {
    const attendance = DB.get('attendance');
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendance.filter(a => a.date === today);

    const activeInside = todayRecords.filter(a => a.status === 'Checked In').length;
    const totalToday = todayRecords.length;
    const completedToday = todayRecords.filter(a => a.status === 'Completed').length;

    // Average duration
    let avgDuration = 0;
    const completedRecords = todayRecords.filter(a => a.durationMin > 0);
    if (completedRecords.length > 0) {
      const sum = completedRecords.reduce((acc, cur) => acc + (cur.durationMin || 0), 0);
      avgDuration = Math.round(sum / completedRecords.length);
    }

    const elActive = document.getElementById('stat-active-inside');
    const elTotal = document.getElementById('stat-total-today');
    const elCompleted = document.getElementById('stat-completed-today');
    const elAvg = document.getElementById('stat-avg-duration');

    if (elActive) elActive.textContent = activeInside;
    if (elTotal) elTotal.textContent = totalToday;
    if (elCompleted) elCompleted.textContent = completedToday;
    if (elAvg) elAvg.textContent = `${avgDuration || 75} mins`;
  },

  renderTable() {
    const tableBody = document.getElementById('attendance-table-body');
    if (!tableBody) return;

    let list = DB.get('attendance');

    // Filter by date
    if (attendanceState.dateFilter) {
      list = list.filter(a => a.date === attendanceState.dateFilter);
    }

    // Filter by status
    if (attendanceState.statusFilter !== 'all') {
      list = list.filter(a => a.status.toLowerCase() === attendanceState.statusFilter.toLowerCase());
    }

    // Filter by search
    if (attendanceState.search) {
      const q = attendanceState.search;
      list = list.filter(a => 
        (a.memberName && a.memberName.toLowerCase().includes(q)) ||
        (a.memberId && a.memberId.toLowerCase().includes(q))
      );
    }

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">
            <i class="fa-solid fa-clock-rotate-left" style="font-size: 2rem; margin-bottom: 0.8rem; display: block; opacity: 0.5;"></i>
            No attendance records found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = list.map(item => {
      const isCheckedIn = item.status === 'Checked In';
      return `
        <tr>
          <td>
            <div class="avatar-cell">
              <img src="${item.memberPhoto || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" class="avatar-img" alt="${item.memberName}" />
              <div>
                <div class="avatar-info-name">${item.memberName}</div>
                <div class="avatar-info-sub font-mono">${item.memberId}</div>
              </div>
            </div>
          </td>
          <td>${item.date}</td>
          <td>
            <span class="font-semibold text-primary"><i class="fa-solid fa-right-to-bracket"></i> ${item.checkInTime.split(' ')[1] || item.checkInTime}</span>
          </td>
          <td>
            ${item.checkOutTime ? 
              `<span><i class="fa-solid fa-right-from-bracket text-muted"></i> ${item.checkOutTime.split(' ')[1] || item.checkOutTime}</span>` : 
              `<span class="badge badge-primary"><i class="fa-solid fa-pulse fa-dumbbell"></i> In Gym</span>`
            }
          </td>
          <td>
            ${item.durationMin ? `${item.durationMin} mins` : '-'}
          </td>
          <td>${App.statusBadge(item.status)}</td>
          <td class="text-right">
            ${isCheckedIn ? `
              <button class="btn btn-primary btn-sm" onclick="AttendanceCtrl.handleCheckOut('${item.id}')">
                <i class="fa-solid fa-arrow-right-from-bracket"></i> Check Out
              </button>
            ` : `
              <span class="text-muted" style="font-size: 0.8rem;"><i class="fa-solid fa-check-double text-success"></i> Finished</span>
            `}
          </td>
        </tr>
      `;
    }).join('');
  },

  // Manual Check In Trigger
  handleManualCheckIn(event) {
    if (event) event.preventDefault();
    const selectEl = document.getElementById('checkin-member-select');
    const memberId = selectEl ? selectEl.value : '';

    if (!memberId) {
      App.showToast("Please select a member to check in.", "warning");
      return;
    }

    this.executeCheckIn(memberId, 'Manual Check-in');
  },

  // Execute check in
  executeCheckIn(memberId, method = 'Manual') {
    const res = DB.checkInMember(memberId, method);

    if (!res.success) {
      if (res.expired) {
        // Warning Modal for Expired Membership
        this.showExpiredAlert(res.member);
      } else if (res.alreadyCheckedIn) {
        App.showToast(res.message, "warning", "Already Inside");
      } else {
        App.showToast(res.message, "error");
      }
      return;
    }

    App.showToast(`Welcome! ${res.member.name} (${res.member.id}) checked in successfully.`, "success", "Check-in Confirmed");
    
    // Reset select
    const selectEl = document.getElementById('checkin-member-select');
    if (selectEl) selectEl.value = '';

    this.renderStats();
    this.renderTable();
  },

  // Check out member
  handleCheckOut(attendanceId) {
    const res = DB.checkOutMember(attendanceId);
    if (res.success) {
      App.showToast(`Check-out recorded (${res.record.durationMin} mins workout).`, "info", "Check-out Confirmed");
      this.renderStats();
      this.renderTable();
    } else {
      App.showToast(res.message, "error");
    }
  },

  // Expired alert modal
  showExpiredAlert(member) {
    document.getElementById('expired-modal-member-name').textContent = `${member.name} (${member.id})`;
    document.getElementById('expired-modal-plan').textContent = member.planName || 'Standard';
    document.getElementById('expired-modal-date').textContent = member.expireDate;
    
    const renewBtn = document.getElementById('expired-modal-renew-btn');
    if (renewBtn) {
      renewBtn.onclick = () => {
        App.closeModal('expired-warning-modal');
        window.location.href = `members.html?search=${encodeURIComponent(member.id)}`;
      };
    }

    const overrideBtn = document.getElementById('expired-modal-override-btn');
    if (overrideBtn) {
      overrideBtn.onclick = () => {
        App.closeModal('expired-warning-modal');
        // Admin override check-in
        const now = new Date();
        const timeStr = `${now.toISOString().split('T')[0]} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
        
        DB.add('attendance', {
          memberId: member.id,
          memberName: member.name,
          memberPhoto: member.photo,
          planName: member.planName,
          checkInTime: timeStr,
          checkOutTime: null,
          status: 'Checked In',
          date: now.toISOString().split('T')[0],
          method: 'Admin Override'
        });

        App.showToast(`Admin override granted for ${member.name}. Check-in recorded.`, "warning");
        AttendanceCtrl.renderStats();
        AttendanceCtrl.renderTable();
      };
    }

    App.openModal('expired-warning-modal');
  },

  // QR Code Scanner Simulation
  openQRScanner() {
    App.openModal('qr-scanner-modal');
    
    // Start scan animation
    const scannerStatus = document.getElementById('qr-scan-status');
    if (scannerStatus) {
      scannerStatus.textContent = "Point member QR pass toward the camera...";
    }
  },

  simulateQRScan(memberId) {
    const scannerStatus = document.getElementById('qr-scan-status');
    if (scannerStatus) {
      scannerStatus.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Processing QR code token: <strong>${memberId}</strong>...`;
    }

    setTimeout(() => {
      App.closeModal('qr-scanner-modal');
      this.executeCheckIn(memberId, 'QR Scanner');
    }, 700);
  }
};
