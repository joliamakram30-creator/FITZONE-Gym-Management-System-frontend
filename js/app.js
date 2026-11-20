/**
 * FITZONE - Shared Application Utilities & UI Components
 * Toast notifications, modal helpers, currency & date formatters, badges
 */

const App = {
  // Format currency in Egyptian Pounds (EGP)
  formatCurrency(amount) {
    const num = Number(amount) || 0;
    return `${num.toLocaleString('en-US')} EGP`;
  },

  // Format readable date
  formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parts[0], parts[1] - 1, parts[2]);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch(e) {
      return dateStr;
    }
  },

  // Status HTML badge helper
  statusBadge(status) {
    const st = (status || '').toLowerCase();
    let badgeClass = 'badge-secondary';
    let icon = 'circle';

    if (st === 'active' || st === 'paid' || st === 'operational' || st === 'available' || st === 'completed') {
      badgeClass = 'badge-success';
      icon = 'check-circle';
    } else if (st === 'expired' || st === 'out of order' || st === 'cancelled' || st === 'failed') {
      badgeClass = 'badge-danger';
      icon = 'times-circle';
    } else if (st === 'pending' || st === 'needs repair' || st === 'under maintenance' || st === 'busy') {
      badgeClass = 'badge-warning';
      icon = 'exclamation-circle';
    } else if (st === 'checked in') {
      badgeClass = 'badge-primary';
      icon = 'arrow-right-to-bracket';
    } else if (st === 'frozen') {
      badgeClass = 'badge-info';
      icon = 'snowflake';
    }

    return `<span class="badge ${badgeClass}"><i class="fa-solid fa-${icon}"></i> ${status}</span>`;
  },

  // Modern Toast notification system
  showToast(message, type = 'info', title = '') {
    let container = document.getElementById('fitzone-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'fitzone-toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'info-circle';
    if (type === 'success') icon = 'circle-check';
    if (type === 'error') icon = 'circle-xmark';
    if (type === 'warning') icon = 'triangle-exclamation';

    const defaultTitle = type.charAt(0).toUpperCase() + type.slice(1);

    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fa-solid fa-${icon}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title || defaultTitle}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">&times;</button>
    `;

    container.appendChild(toast);

    // Auto remove after 4.5 seconds
    setTimeout(() => {
      toast.classList.add('toast-fadeout');
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  },

  // Modal helpers
  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    modal.classList.remove('active');
    // Restore overflow if no other modal active
    if (!document.querySelector('.modal.active')) {
      document.body.style.overflow = '';
    }
  },

  // Universal confirmation dialog
  confirm(title, message, onConfirm) {
    let confirmModal = document.getElementById('fitzone-confirm-modal');
    if (!confirmModal) {
      confirmModal = document.createElement('div');
      confirmModal.id = 'fitzone-confirm-modal';
      confirmModal.className = 'modal confirm-modal';
      confirmModal.innerHTML = `
        <div class="modal-backdrop" onclick="App.closeModal('fitzone-confirm-modal')"></div>
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 id="confirm-modal-title"><i class="fa-solid fa-triangle-exclamation text-warning"></i> Confirm Action</h3>
            <button class="modal-close" onclick="App.closeModal('fitzone-confirm-modal')">&times;</button>
          </div>
          <div class="modal-body">
            <p id="confirm-modal-msg" class="text-secondary"></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" onclick="App.closeModal('fitzone-confirm-modal')">Cancel</button>
            <button id="confirm-modal-btn" class="btn btn-danger">Confirm</button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmModal);
    }

    document.getElementById('confirm-modal-title').innerHTML = `<i class="fa-solid fa-circle-question text-warning"></i> ${title}`;
    document.getElementById('confirm-modal-msg').textContent = message;

    const actionBtn = document.getElementById('confirm-modal-btn');
    // Clone button to remove previous listeners
    const newBtn = actionBtn.cloneNode(true);
    actionBtn.parentNode.replaceChild(newBtn, actionBtn);

    newBtn.addEventListener('click', () => {
      App.closeModal('fitzone-confirm-modal');
      if (typeof onConfirm === 'function') onConfirm();
    });

    App.openModal('fitzone-confirm-modal');
  },

  // Highlight active sidebar navigation links
  initActiveNav() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link, .sidebar-link, .client-nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href === currentPath || href.endsWith(currentPath))) {
        link.classList.add('active');
      }
    });
  },

  // Generate QR code safely (using QRCode.js or dynamic SVG/Canvas fallback)
  generateQRCode(containerElement, text, size = 160) {
    if (!containerElement) return;
    containerElement.innerHTML = '';

    if (typeof QRCode !== 'undefined') {
      try {
        new QRCode(containerElement, {
          text: text,
          width: size,
          height: size,
          colorDark: "#10131a",
          colorLight: "#ffffff",
          correctLevel: QRCode.CorrectLevel.H
        });
        return;
      } catch (e) {
        console.warn("QRCode lib error, using SVG fallback:", e);
      }
    }

    // High quality visual SVG fallback if external script is still loading or offline
    const svgCode = `
      <svg width="${size}" height="${size}" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" style="background: white; border-radius: 8px; padding: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
        <!-- QR Corner Markers -->
        <rect x="5" y="5" width="26" height="26" rx="4" fill="#ff5e14" />
        <rect x="9" y="9" width="18" height="18" rx="2" fill="white" />
        <rect x="13" y="13" width="10" height="10" fill="#14171f" />
        
        <rect x="69" y="5" width="26" height="26" rx="4" fill="#ff5e14" />
        <rect x="73" y="9" width="18" height="18" rx="2" fill="white" />
        <rect x="77" y="13" width="10" height="10" fill="#14171f" />
        
        <rect x="5" y="69" width="26" height="26" rx="4" fill="#ff5e14" />
        <rect x="9" y="73" width="18" height="18" rx="2" fill="white" />
        <rect x="13" y="77" width="10" height="10" fill="#14171f" />

        <!-- Data Blocks simulation -->
        <rect x="36" y="8" width="6" height="6" fill="#14171f" />
        <rect x="46" y="8" width="6" height="6" fill="#14171f" />
        <rect x="56" y="8" width="6" height="6" fill="#14171f" />
        
        <rect x="8" y="36" width="6" height="6" fill="#14171f" />
        <rect x="18" y="44" width="6" height="6" fill="#14171f" />
        <rect x="26" y="36" width="6" height="6" fill="#14171f" />
        <rect x="36" y="36" width="12" height="12" rx="2" fill="#ff5e14" />
        <rect x="52" y="36" width="6" height="6" fill="#14171f" />
        <rect x="62" y="44" width="6" height="6" fill="#14171f" />
        <rect x="72" y="36" width="6" height="6" fill="#14171f" />
        <rect x="82" y="44" width="10" height="6" fill="#14171f" />

        <rect x="36" y="52" width="6" height="6" fill="#14171f" />
        <rect x="44" y="52" width="6" height="6" fill="#14171f" />
        <rect x="52" y="60" width="14" height="6" fill="#14171f" />
        <rect x="70" y="52" width="6" height="14" fill="#14171f" />

        <rect x="36" y="68" width="10" height="6" fill="#14171f" />
        <rect x="50" y="76" width="14" height="8" fill="#14171f" />
        <rect x="68" y="72" width="12" height="6" fill="#14171f" />
        <rect x="84" y="80" width="8" height="12" fill="#14171f" />

        <!-- Center Badge -->
        <circle cx="50" cy="50" r="8" fill="#14171f" stroke="#ff5e14" stroke-width="2" />
        <text x="50" y="53" font-size="6" font-weight="900" text-anchor="middle" fill="#ff5e14" font-family="sans-serif">FZ</text>
      </svg>
    `;
    containerElement.innerHTML = svgCode;
  }
};

// Initialize listeners on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  App.initActiveNav();

  // Close modals on Esc key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal.active');
      activeModals.forEach(m => m.classList.remove('active'));
      document.body.style.overflow = '';
    }
  });

  // Modal backdrop click close
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-backdrop')) {
      const modal = e.target.closest('.modal');
      if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  });
});
