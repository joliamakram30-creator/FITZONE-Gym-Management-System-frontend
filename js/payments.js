/**
 * FITZONE - Payments and Financial Management Controller
 * Record payments, invoice generation, printable receipts, balance & revenue stats
 */

let paymentsState = {
  search: '',
  methodFilter: 'all',
  statusFilter: 'all'
};

document.addEventListener('DOMContentLoaded', () => {
  PaymentsCtrl.init();
});

const PaymentsCtrl = {
  init() {
    this.populateMemberDropdown();
    this.populatePlanDropdown();
    this.renderStats();
    this.renderTable();
    this.bindEvents();
  },

  populateMemberDropdown() {
    const select = document.getElementById('payment-member-select');
    if (!select) return;

    const members = DB.get('members');
    select.innerHTML = `<option value="">Select Member...</option>` + 
      members.map(m => `
        <option value="${m.id}" data-name="${m.name}" data-plan="${m.planId}">
          ${m.name} (${m.id}) - Plan: ${m.planName || 'None'}
        </option>
      `).join('');
  },

  populatePlanDropdown() {
    const select = document.getElementById('payment-plan-select');
    if (!select) return;

    const plans = DB.get('plans');
    select.innerHTML = `<option value="">Custom / Other Service</option>` + 
      plans.map(p => `
        <option value="${p.id}" data-price="${p.price}" data-name="${p.name}">
          ${p.name} - ${App.formatCurrency(p.price)}
        </option>
      `).join('');
  },

  bindEvents() {
    const searchInput = document.getElementById('payment-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        paymentsState.search = e.target.value.trim().toLowerCase();
        this.renderTable();
      });
    }

    const methodFilter = document.getElementById('payment-method-filter');
    if (methodFilter) {
      methodFilter.addEventListener('change', (e) => {
        paymentsState.methodFilter = e.target.value;
        this.renderTable();
      });
    }

    const statusFilter = document.getElementById('payment-status-filter');
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => {
        paymentsState.statusFilter = e.target.value;
        this.renderTable();
      });
    }

    // Auto-fill amount when member or plan is selected
    const memberSelect = document.getElementById('payment-member-select');
    const planSelect = document.getElementById('payment-plan-select');
    const amountInput = document.getElementById('payment-amount');

    if (memberSelect && planSelect && amountInput) {
      memberSelect.addEventListener('change', () => {
        const selectedOpt = memberSelect.options[memberSelect.selectedIndex];
        const planId = selectedOpt ? selectedOpt.getAttribute('data-plan') : null;
        if (planId) {
          planSelect.value = planId;
          const plan = DB.getById('plans', planId);
          if (plan) amountInput.value = plan.price;
        }
      });

      planSelect.addEventListener('change', () => {
        const planId = planSelect.value;
        if (planId) {
          const plan = DB.getById('plans', planId);
          if (plan) amountInput.value = plan.price;
        }
      });
    }
  },

  renderStats() {
    const payments = DB.get('payments');
    let totalRevenue = 0;
    let pendingAmount = 0;

    payments.forEach(p => {
      const amt = parseFloat(p.amount) || 0;
      if (p.status === 'Paid') {
        totalRevenue += amt;
      } else if (p.status === 'Pending') {
        pendingAmount += amt;
      }
    });

    const elTotal = document.getElementById('stat-total-revenue');
    const elPending = document.getElementById('stat-pending-revenue');
    const elTransactions = document.getElementById('stat-total-transactions');

    if (elTotal) elTotal.textContent = App.formatCurrency(totalRevenue);
    if (elPending) elPending.textContent = App.formatCurrency(pendingAmount);
    if (elTransactions) elTransactions.textContent = payments.length;
  },

  renderTable() {
    const tableBody = document.getElementById('payments-table-body');
    if (!tableBody) return;

    let list = DB.get('payments');

    // Filter by search
    if (paymentsState.search) {
      const q = paymentsState.search;
      list = list.filter(p => 
        (p.id && p.id.toLowerCase().includes(q)) ||
        (p.memberName && p.memberName.toLowerCase().includes(q)) ||
        (p.memberId && p.memberId.toLowerCase().includes(q)) ||
        (p.transactionId && p.transactionId.toLowerCase().includes(q))
      );
    }

    // Filter by method
    if (paymentsState.methodFilter !== 'all') {
      list = list.filter(p => p.method.toLowerCase().includes(paymentsState.methodFilter.toLowerCase()));
    }

    // Filter by status
    if (paymentsState.statusFilter !== 'all') {
      list = list.filter(p => p.status.toLowerCase() === paymentsState.statusFilter.toLowerCase());
    }

    if (list.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="8" class="text-center" style="padding: 2.5rem; color: var(--text-muted);">
            <i class="fa-solid fa-receipt" style="font-size: 2rem; margin-bottom: 0.8rem; display: block; opacity: 0.5;"></i>
            No payments found matching criteria.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = list.map(p => {
      return `
        <tr>
          <td class="font-mono font-bold text-primary">${p.id}</td>
          <td>
            <div class="avatar-info-name">${p.memberName}</div>
            <div class="avatar-info-sub font-mono">${p.memberId}</div>
          </td>
          <td>${p.planName || 'Service'}</td>
          <td class="font-bold font-mono">${App.formatCurrency(p.amount)}</td>
          <td>
            <span class="badge badge-secondary"><i class="fa-solid fa-credit-card"></i> ${p.method}</span>
          </td>
          <td>
            <div>${p.date}</div>
            <div class="text-muted" style="font-size: 0.78rem;">${p.time || ''}</div>
          </td>
          <td>${App.statusBadge(p.status)}</td>
          <td class="text-right">
            <button class="btn btn-outline btn-sm" onclick="PaymentsCtrl.viewReceipt('${p.id}')">
              <i class="fa-solid fa-print"></i> Receipt
            </button>
          </td>
        </tr>
      `;
    }).join('');
  },

  // Open modal to record payment
  openRecordPaymentModal() {
    const form = document.getElementById('record-payment-form');
    if (form) form.reset();

    const dateInput = document.getElementById('payment-date');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];

    App.openModal('record-payment-modal');
  },

  // Save Payment
  savePayment(event) {
    event.preventDefault();
    const memberSelect = document.getElementById('payment-member-select');
    const memberId = memberSelect.value;
    const selectedOpt = memberSelect.options[memberSelect.selectedIndex];
    const memberName = selectedOpt ? selectedOpt.getAttribute('data-name') : '';

    const planSelect = document.getElementById('payment-plan-select');
    const planId = planSelect.value;
    const planName = planId ? planSelect.options[planSelect.selectedIndex].text.split(' - ')[0] : 'Gym Services';

    const amount = parseFloat(document.getElementById('payment-amount').value) || 0;
    const method = document.getElementById('payment-method').value;
    const date = document.getElementById('payment-date').value;
    const status = document.getElementById('payment-status').value;
    const notes = document.getElementById('payment-notes').value.trim();
    const extendMembership = document.getElementById('payment-extend-check') ? document.getElementById('payment-extend-check').checked : true;

    if (!memberId || !amount) {
      App.showToast("Please choose a member and specify a valid amount.", "error");
      return;
    }

    const payment = DB.recordPayment({
      memberId,
      memberName,
      amount,
      planId,
      planName,
      method,
      date,
      status,
      notes,
      extendMembership
    });

    App.closeModal('record-payment-modal');
    App.showToast(`Payment of ${App.formatCurrency(amount)} recorded successfully!`, "success");
    
    this.renderStats();
    this.renderTable();

    // Offer to view receipt
    setTimeout(() => {
      this.viewReceipt(payment.id);
    }, 400);
  },

  // View and Print Receipt Modal
  viewReceipt(paymentId) {
    const p = DB.getById('payments', paymentId);
    if (!p) return;

    const settings = DB.getSettings();
    const subtotal = Math.round(p.amount / 1.14);
    const tax = Math.round(p.amount - subtotal);

    const receiptHtml = `
      <div class="receipt-container">
        <div class="receipt-header">
          <div class="receipt-title">${settings.shortName || 'FITZONE'}</div>
          <div style="font-size: 0.8rem; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Official Tax Invoice & Payment Receipt</div>
          <div style="font-size: 0.78rem; color: #9ca3af; margin-top: 4px;">${settings.address} • Tel: ${settings.phone}</div>
        </div>

        <div class="receipt-meta">
          <div>
            <strong>Invoice #:</strong> <span class="font-mono">${p.id}</span><br>
            <strong>Date / Time:</strong> ${p.date} ${p.time || ''}<br>
            <strong>Payment Method:</strong> ${p.method}
          </div>
          <div style="text-align: right;">
            <strong>Member Name:</strong> ${p.memberName}<br>
            <strong>Member ID:</strong> <span class="font-mono">${p.memberId}</span><br>
            <strong>Transaction Ref:</strong> <span class="font-mono">${p.transactionId || 'N/A'}</span>
          </div>
        </div>

        <table class="receipt-table">
          <thead>
            <tr>
              <th>Description / Item</th>
              <th style="text-align: right;">Amount (EGP)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <strong>${p.planName}</strong>
                <div style="font-size: 0.78rem; color: #6b7280;">${p.notes || 'Gym membership subscription fee'}</div>
              </td>
              <td style="text-align: right; font-weight: 600;">${App.formatCurrency(subtotal)}</td>
            </tr>
            <tr>
              <td>VAT (14% Included)</td>
              <td style="text-align: right;">${App.formatCurrency(tax)}</td>
            </tr>
          </tbody>
        </table>

        <div class="receipt-total">
          Total Paid: ${App.formatCurrency(p.amount)}
        </div>

        <div style="margin-top: 2rem; padding-top: 1rem; border-top: 1px dashed #e5e7eb; font-size: 0.75rem; text-align: center; color: #6b7280;">
          <p>Thank you for choosing FITZONE Luxury Fitness! Please keep this receipt for your records.</p>
          <p style="margin-top: 4px; font-weight: 600;">Authorized Gym Stamp & Digital Verification Code: <strong>${p.id}-${Math.floor(1000 + Math.random()*9000)}</strong></p>
        </div>
      </div>
    `;

    const modalBody = document.getElementById('receipt-modal-content');
    if (modalBody) modalBody.innerHTML = receiptHtml;

    App.openModal('receipt-modal');
  },

  printCurrentReceipt() {
    window.print();
  }
};
