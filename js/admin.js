/**
 * FITZONE - Admin Master Shell Script
 * Enforces admin authorization, handles topbar, notifications popover, mobile sidebar
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Enforce Admin Guard
  const user = Auth.getCurrentUser();
  if (!user || user.role !== 'admin') {
    // If client user lands here, redirect to client portal
    if (user && user.role === 'client') {
      alert("Notice: You are logged in as a gym member. Redirecting to your personal portal.");
      window.location.href = '../client/my-dashboard.html';
      return;
    } else {
      window.location.href = '../login.html';
      return;
    }
  }

  // 2. Populate Admin Profile Info in UI
  const adminNameEls = document.querySelectorAll('.admin-display-name');
  adminNameEls.forEach(el => el.textContent = user.name || 'Admin');

  const adminAvatarEls = document.querySelectorAll('.admin-display-avatar');
  adminAvatarEls.forEach(el => {
    if (el.tagName === 'IMG') el.src = user.avatar;
  });

  // 3. Initialize Notifications Popover & Badge
  AdminUI.refreshNotifications();

  // 4. Initialize Mobile Sidebar Toggle
  AdminUI.initMobileSidebar();

  // 5. Initialize Global Search Handler
  AdminUI.initGlobalSearch();
});

const AdminUI = {
  // Refresh notifications list and badge count
  refreshNotifications() {
    const notifs = DB.get('notifications');
    const unreadCount = notifs.filter(n => !n.read).length;

    const badgeEl = document.getElementById('admin-notif-count');
    if (badgeEl) {
      badgeEl.textContent = unreadCount;
      badgeEl.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    const listEl = document.getElementById('admin-notif-list');
    if (listEl) {
      if (notifs.length === 0) {
        listEl.innerHTML = `<div style="padding: 1.5rem; text-align: center; color: var(--text-muted); font-size: 0.85rem;">No new notifications</div>`;
        return;
      }

      listEl.innerHTML = notifs.slice(0, 8).map(n => {
        let icon = 'bell';
        let colorClass = 'stat-icon-orange';
        if (n.type === 'expiration') { icon = 'user-xmark'; colorClass = 'stat-icon-rose'; }
        else if (n.type === 'payment') { icon = 'receipt'; colorClass = 'stat-icon-amber'; }
        else if (n.type === 'booking') { icon = 'calendar-check'; colorClass = 'stat-icon-cyan'; }
        else if (n.type === 'equipment') { icon = 'wrench'; colorClass = 'stat-icon-purple'; }

        return `
          <div class="notif-item ${!n.read ? 'unread' : ''}" onclick="AdminUI.handleNotifClick('${n.id}', '${n.link || '#'}')">
            <div class="notif-icon-circle ${colorClass}">
              <i class="fa-solid fa-${icon}"></i>
            </div>
            <div class="notif-item-body">
              <div class="notif-item-title">${n.title}</div>
              <div class="notif-item-msg">${n.message}</div>
              <div class="notif-item-time">${n.time}</div>
            </div>
          </div>
        `;
      }).join('');
    }
  },

  toggleNotifications(event) {
    if (event) event.stopPropagation();
    const popover = document.getElementById('admin-notif-popover');
    if (popover) {
      popover.classList.toggle('active');
    }
  },

  handleNotifClick(notifId, link) {
    DB.update('notifications', notifId, { read: true });
    this.refreshNotifications();
    if (link && link !== '#') {
      window.location.href = link;
    }
  },

  markAllNotificationsRead() {
    const notifs = DB.get('notifications');
    notifs.forEach(n => {
      DB.update('notifications', n.id, { read: true });
    });
    this.refreshNotifications();
    App.showToast("All notifications marked as read.", "success");
  },

  // Setup mobile sidebar drawer
  initMobileSidebar() {
    const toggleBtn = document.querySelector('.mobile-menu-toggle');
    const sidebar = document.querySelector('.admin-sidebar');
    let backdrop = document.querySelector('.admin-sidebar-backdrop');

    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'admin-sidebar-backdrop';
      document.body.appendChild(backdrop);
    }

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        backdrop.classList.toggle('active');
      });

      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('open');
        backdrop.classList.remove('active');
      });
    }
  },

  // Global search
  initGlobalSearch() {
    const searchInput = document.getElementById('global-admin-search');
    if (!searchInput) return;

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          window.location.href = `members.html?search=${encodeURIComponent(query)}`;
        }
      }
    });
  },

  // Confirm and Reset Demo Data
  confirmResetDemo() {
    App.confirm(
      "Reset All Demo Data?",
      "This will restore all default 20 members, plans, attendance, payments, classes, and equipment to initial factory status. Custom additions will be overwritten.",
      () => {
        DB.resetDemo();
        App.showToast("Demo data successfully reinitialized!", "success");
        setTimeout(() => window.location.reload(), 800);
      }
    );
  },

  // Confirm and Logout
  logout() {
    App.confirm(
      "Confirm Logout",
      "Are you sure you want to log out of the admin panel?",
      () => {
        Auth.logout();
      }
    );
  }
};

// Close popover when clicking outside
document.addEventListener('click', (e) => {
  const popover = document.getElementById('admin-notif-popover');
  const btn = document.querySelector('.notif-btn');
  if (popover && popover.classList.contains('active')) {
    if (!popover.contains(e.target) && (!btn || !btn.contains(e.target))) {
      popover.classList.remove('active');
    }
  }
});
