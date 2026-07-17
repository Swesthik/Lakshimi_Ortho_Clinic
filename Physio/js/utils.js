/**
 * ReviveCMS - Shared UI Utilities
 * Centralized branding, dynamic sidebar nav injection, print, PDF, toast, modals
 *
 * CRITICAL: All page initialization scripts must call `await CMS.init()`
 * before fetching data. The global DOMContentLoaded below handles the
 * shared UI setup (sidebar, modals, icons), but page-specific loaders
 * must await the CMS.init() promise themselves.
 */

// ─── Centralized Branding Configuration ─────────────────────────────────────
window.CLINIC_INFO = {
  clinicName: "LAKSHMI ORTHO & PAIN CLINIC",
  doctorName: "Dr. C. SANJAY",
  qualification: "M.S (ORTHO)",
  specialization: "Consultant Trauma, Replacement & Spine Surgery",
  phone: "8903783462",
  email: "contact@lakshmiortho.com",
  address: "99, West Car Street, Tiruchendur – 628215",
  regNo: "100886",
  logo: ""
};

// ─── Toast Notifications ────────────────────────────────────────────────────

function showToast(message, type = 'success', duration = 3500) {
  const icons = {
    success: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>',
    error:   '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>',
    warning: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>',
  };
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `${icons[type] || ''}<span>${message}</span>`;
  container.appendChild(toast);
  toast.addEventListener('click', () => toast.remove());
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ─── Modal Helpers ───────────────────────────────────────────────────────────

function openModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
  const overlay = document.getElementById(modalId);
  if (overlay) overlay.classList.remove('open');
  const anyOpen = document.querySelector('.modal-overlay.open');
  if (!anyOpen) document.body.style.overflow = '';
}

function setupModalClose() {
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  document.querySelectorAll('.modal-close, [data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const modal = btn.closest('.modal-overlay');
      if (modal) closeModal(modal.id);
    });
  });
}

// ─── Sidebar Toggle & Branding Injection (Dynamic Navigation) ────────────────

function setupSidebar() {
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const openBtns = document.querySelectorAll('.mobile-sidebar-btn');

  openBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      overlay.classList.toggle('open');
    });
  });

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('open');
    });
  }

  const brand = document.querySelector('.sidebar-brand');
  if (brand) {
    brand.innerHTML = `<i data-lucide="activity"></i>Lakshmi<span>HIS</span>`;
  }

  const sidebarNav = document.querySelector('.sidebar-nav');
  if (sidebarNav) {
    sidebarNav.innerHTML = `
      <a href="index.html"         class="nav-item" data-page="index.html"><i data-lucide="layout-dashboard"></i> Dashboard</a>
      <a href="patients.html"      class="nav-item" data-page="patients.html"><i data-lucide="users"></i> Patients</a>
      <a href="appointments.html"  class="nav-item" data-page="appointments.html"><i data-lucide="calendar"></i> Appointments</a>
      <a href="rehab.html"         class="nav-item" data-page="rehab.html"><i data-lucide="heart-pulse"></i> Rehab & Physio</a>
      <a href="surgeries.html"     class="nav-item" data-page="surgeries.html"><i data-lucide="activity"></i> Surgeries</a>
      <a href="diagnostics.html"   class="nav-item" data-page="diagnostics.html"><i data-lucide="clipboard"></i> Diagnostics</a>
      <a href="medicines.html"     class="nav-item" data-page="medicines.html"><i data-lucide="pill"></i> Medicines<span class="nav-badge low-stock-badge" style="display:none">0</span></a>
      <a href="prescriptions.html" class="nav-item" data-page="prescriptions.html"><i data-lucide="file-text"></i> Prescriptions</a>
      <a href="billing.html"       class="nav-item" data-page="billing.html"><i data-lucide="credit-card"></i> Invoices & Billing</a>
      <a href="reports.html"       class="nav-item" data-page="reports.html"><i data-lucide="bar-chart-2"></i> Reports</a>
      <a href="profit.html"        class="nav-item" data-page="profit.html"><i data-lucide="trending-up"></i> Profit Analysis</a>
    `;
  }

  const drAvatar = document.querySelector('.doctor-avatar');
  if (drAvatar) drAvatar.textContent = 'S';
  const drName = document.querySelector('.sidebar-doctor h4');
  if (drName) drName.textContent = window.CLINIC_INFO.doctorName;
  const drSpec = document.querySelector('.sidebar-doctor p');
  if (drSpec) drSpec.textContent = window.CLINIC_INFO.qualification + " (Trauma Surgeon)";

  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-item[data-page]').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === currentPage) item.classList.add('active');
  });
}

// ─── Date Formatting ─────────────────────────────────────────────────────────

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Currency Formatting ─────────────────────────────────────────────────────

function formatCurrency(amount) {
  const val = parseFloat(amount || 0);
  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  let formatted = formatter.format(val);
  // Replace currency symbols/abbreviations to ensure absolute consistency and safety
  formatted = formatted.replace('INR', '\u20B9')
                       .replace('Rs.', '\u20B9')
                       .replace('Rs', '\u20B9')
                       .replace(/\s+/g, '');
  return formatted;
}
window.formatCurrency = formatCurrency;



// ─── Shared: Safe Print Helper ───────────────────────────────────────────────
// Writes HTML to a new window, waits for ALL images to load, THEN prints.
function safePrint(printWindow, htmlContent) {
  // If the caller opened a popup, close it immediately to prevent memory leaks and blank tabs
  if (printWindow && printWindow !== window) {
    try {
      printWindow.close();
    } catch (e) {
      console.warn('[ReviveCMS] Failed to close printWindow:', e);
    }
  }

  // Create temporary hidden iframe for stable printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.zIndex = '-9999';
  document.body.appendChild(iframe);

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.write(htmlContent);
  doc.close();

  const cleanup = () => {
    // Remove the iframe from DOM after printing dialog finishes
    setTimeout(() => {
      if (iframe && iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
    }, 1000);

    // Reset parent page state
    document.body.style.overflow = '';
    document.body.style.pointerEvents = '';

    // Re-enable all buttons
    document.querySelectorAll('button').forEach(btn => {
      btn.disabled = false;
    });

    // Remove overlays
    const overlays = document.querySelectorAll('.modal-overlay, .loading-overlay');
    overlays.forEach(overlay => {
      overlay.classList.remove('open');
      if (overlay.style.display !== 'none' && overlay.classList.contains('modal-overlay')) {
        overlay.style.display = 'none';
      }
    });

    window.isPrinting = false;
  };

  const doPrint = () => {
    setTimeout(() => {
      try {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      } catch (err) {
        console.error('[ReviveCMS] Safe print error:', err);
      } finally {
        cleanup();
      }
    }, 300);
  };

  // Wait for all images inside the iframe to load before printing
  const imgs = Array.from(doc.images);
  if (!imgs.length) {
    doPrint();
    return;
  }

  let loaded = 0;
  const total = imgs.length;
  const tryPrint = () => {
    loaded++;
    if (loaded >= total) {
      doPrint();
    }
  };

  imgs.forEach(img => {
    if (img.complete) {
      tryPrint();
    } else {
      img.onload = tryPrint;
      img.onerror = tryPrint; // Still print even if an image fails to load
    }
  });

  // Safety net: print after 5 seconds regardless of image loading status
  setTimeout(() => {
    if (loaded < total) {
      doPrint();
    }
  }, 5000);
}

// ─── Shared: Fetch all prescription attachment images ────────────────────────
async function fetchPrescriptionImages(prescriptionId, patientId) {
  try {
    // Get images linked directly to this prescription
    const rxImages = await CMS.files.getByPrescription(prescriptionId);
    if (rxImages && rxImages.length) return rxImages;

    // Fallback: get all patient images if no prescription-specific ones found
    if (patientId) {
      const patientImages = await CMS.files.getByPatient(patientId);
      return patientImages || [];
    }
    return [];
  } catch (e) {
    console.warn('[Print] Could not fetch images:', e);
    return [];
  }
}

// ─── Shared: Render image HTML for print ─────────────────────────────────────
function buildImagesPrintHTML(images) {
  if (!images || !images.length) return '';

  const imgRows = images.map(img => {
    const cat      = img.category || img.fileType?.split('/')[0] || 'Attachment';
    const fname    = img.fileName || img.name || 'Image';
    const uploaded = img.uploadedAt ? new Date(img.uploadedAt).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }) : '';
    const dataUrl  = img.dataUrl || img.url || '';

    if (!dataUrl) return '';

    return `
      <div class="rx-image-block">
        <div class="rx-image-meta">
          <strong>${fname}</strong>
          <span class="rx-image-cat">${cat.toUpperCase()}</span>
          ${uploaded ? `<span class="rx-image-date">${uploaded}</span>` : ''}
        </div>
        <img src="${dataUrl}" alt="${fname}" class="rx-print-img" />
      </div>`;
  }).filter(Boolean).join('');

  if (!imgRows) return '';

  return `
    <div class="images-section">
      <div class="section-title" style="margin-top:1.5rem; margin-bottom:1rem;">
        📎 Attached Medical Images (${images.length})
      </div>
      ${imgRows}
    </div>`;
}

// ─── Shared: Print CSS ────────────────────────────────────────────────────────
function basePrintCSS() {
  return `
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    
    /* Global print settings */
    @page {
      size: A4 portrait;
      margin: 0;
    }

    body { 
      font-family: 'Inter', Arial, Helvetica, sans-serif; 
      color: #0f172a; 
      font-size: 14px; 
      line-height: 1.5; 
      background: #fff;
    }

    /* Standardized template elements (used by invoice/patient reports) */
    .header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 1.5rem; border-bottom: 3px solid #14b8a6; margin-bottom: 1.5rem; }
    .clinic-name { font-size: 1.6rem; font-weight: 900; color: #0f766e; }
    .clinic-sub  { font-size: 0.88rem; color: #475569; margin: 2px 0; }
    .rx-symbol   { font-size: 3rem; color: #14b8a6; font-style: italic; font-weight: 700; }
    .section-title { font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1px; color: #64748b; font-weight: 700; margin-bottom: 0.6rem; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 2rem; margin-bottom: 1.5rem; padding-bottom: 1.25rem; border-bottom: 1px solid #e2e8f0; }
    .info-item label { font-size: 0.74rem; color: #94a3b8; font-weight: 600; display: block; }
    .info-item p { font-weight: 600; margin: 2px 0 0; font-size: 0.95rem; }
    table { width: 100%; border-collapse: collapse; }
    thead th { background: #f8fafc; padding: 0.65rem 0.9rem; text-align: left; font-size: 0.74rem; color: #64748b; border-bottom: 1px solid #e2e8f0; }
    tbody td { padding: 0.65rem 0.9rem; border-bottom: 1px solid #f1f5f9; font-size: 0.88rem; }
    .notes { background: #f0f9ff; border-left: 4px solid #14b8a6; padding: 0.85rem 1.1rem; margin-top: 1.25rem; border-radius: 0 6px 6px 0; font-size: 0.88rem; }
    .footer { margin-top: 2.5rem; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #e2e8f0; padding-top: 1.25rem; }
    .signature-line { border-top: 2px solid #0f172a; padding-top: 0.5rem; width: 200px; text-align: center; font-weight: 700; font-size: 0.88rem; }

    /* Prescription Pad specific styling */
    .prescription-page {
      width: 210mm;
      height: 297mm;
      background: #ffffff;
      margin: 10mm auto;
      position: relative;
      padding: 12mm;
      border: 3px solid #7a1f2b;
      overflow: hidden;
      box-sizing: border-box;
    }

    .prescription-page::before {
      content: "";
      position: absolute;
      top: 6mm;
      left: 6mm;
      right: 6mm;
      bottom: 6mm;
      border: 1.5px solid #7a1f2b;
      pointer-events: none;
      box-sizing: border-box;
    }

    .header {
      display: grid;
      grid-template-columns: 1fr 110px 1fr;
      align-items: center;
      gap: 12px;
      margin-bottom: 8mm;
      padding: 0;
      border-bottom: none;
      box-sizing: border-box;
    }

    .left {
      text-align: left;
    }

    .right {
      text-align: right;
    }

    .left h2,
    .right h2 {
      color: #7a1f2b;
      font-size: 20px;
      font-weight: 700;
      margin-bottom: 4px;
      font-family: Arial, Helvetica, sans-serif;
    }

    .left p,
    .right p {
      color: #333;
      font-size: 12px;
      line-height: 1.4;
      font-family: Arial, Helvetica, sans-serif;
    }

    .center {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .logo {
      width: 90px;
      height: 90px;
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .logo svg,
    .logo img {
      display: block;
      width: 76px;
      height: 76px;
      margin: auto;
    }

    .divider {
      border-top: 2px solid #7a1f2b;
      border-radius: 50%;
      margin-bottom: 8mm;
    }

    .rx {
      font-size: 34px;
      color: #7a1f2b;
      font-weight: bold;
      margin-bottom: 6mm;
      line-height: 1;
    }

    .write-area {
      height: 172mm;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
      box-sizing: border-box;
    }

    .watermark {
      position: absolute;
      inset: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      pointer-events: none;
      z-index: 0;
    }

    .watermark svg,
    .watermark img {
      width: 65%;
      height: auto;
      opacity: 0.05;
      object-fit: contain;
    }

    .footer {
      position: absolute;
      left: 12mm;
      right: 12mm;
      bottom: 12mm;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-sizing: border-box;
    }

    .box {
      border: 1.5px solid #7a1f2b;
      border-radius: 10px;
      padding: 8px 16px;
      min-width: 180px;
      color: #7a1f2b;
      background: #fff;
      font-size: 12px;
      font-family: Arial, Helvetica, sans-serif;
    }

    .box b {
      display: block;
      margin-bottom: 4px;
    }

    .patient-info {
      margin-top: 4mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4mm 8mm;
      font-size: 13px;
      line-height: 1.5;
    }

    .patient-info div {
      display: flex;
      align-items: flex-end;
      color: #333;
    }

    .patient-info strong {
      color: #7a1f2b;
      margin-right: 5px;
      white-space: nowrap;
    }

    .patient-info span {
      flex: 1;
      border-bottom: 1px dotted #ccc;
      padding-left: 5px;
      font-weight: 600;
      color: #000;
      line-height: 1.2;
    }

    .patient-info .full {
      grid-column: span 2;
    }

    .medicine-table {
      width: 100%;
      margin-top: 4mm;
      border-collapse: collapse;
    }

    .medicine-table th {
      border-top: 2px solid #7a1f2b;
      border-bottom: 2px solid #7a1f2b;
      color: #7a1f2b;
      text-align: left;
      padding: 8px 6px;
      font-size: 12px;
      font-weight: bold;
    }

    .medicine-table td {
      padding: 10px 8px;
      border-bottom: 1px solid #eee;
      font-size: 12px;
      color: #333;
    }

    .advice-block {
      margin-top: 15px;
      font-size: 13px;
      color: #333;
      line-height: 1.5;
      z-index: 10;
      position: relative;
      padding: 0 4mm;
    }

    .signature-block {
      align-self: flex-end;
      text-align: center;
      margin-right: 7mm;
      margin-bottom: 5mm;
      font-size: 12px;
      color: #333;
      z-index: 10;
      line-height: 1.3;
    }

    .sig-name {
      font-weight: 800;
      color: #000;
      font-size: 13px;
      font-family: Arial, Helvetica, sans-serif;
    }

    .sig-title {
      border-top: 1px solid #ddd;
      width: 130px;
      margin: 4px auto 0 auto;
      padding-top: 3px;
      font-size: 11px;
      color: #666;
    }

    /* Screen view styles */
    @media screen {
      body {
        background: #eee;
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 30px 10px;
      }
      .prescription-page {
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        border-radius: 12px;
        margin-bottom: 25px;
      }
      .images-section {
        background: #fff;
        width: 210mm;
        box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        border-radius: 12px;
        box-sizing: border-box;
        padding: 15mm;
        margin-bottom: 25px;
      }
    }

    /* Print view styles */
    @media print {
      body {
        background: #fff;
        margin: 0;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .prescription-page {
        width: 210mm !important;
        height: 297mm !important;
        margin: 0 !important;
        padding: 12mm !important;
        border: 3px solid #7a1f2b !important;
        box-shadow: none !important;
        page-break-after: always;
        page-break-inside: avoid;
        page-break-before: avoid;
        overflow: hidden;
      }
      .prescription-page::before {
        content: "";
        position: absolute;
        top: 6mm;
        left: 6mm;
        right: 6mm;
        bottom: 6mm;
        border: 1.5px solid #7a1f2b;
      }
      .images-section {
        width: 210mm;
        page-break-before: always;
        box-sizing: border-box;
        padding: 15mm;
      }
    }

    /* ── Medical Image Styles ── */
    .images-section { margin-top: 1.5rem; page-break-before: auto; }
    .rx-image-block {
      margin-bottom: 1.5rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      page-break-inside: avoid;
    }
    .rx-image-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.5rem 0.9rem;
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.82rem;
    }
    .rx-image-meta strong { color: #0f172a; font-weight: 700; flex: 1; }
    .rx-image-cat {
      background: #e0f2fe;
      color: #0369a1;
      padding: 1px 8px;
      border-radius: 50px;
      font-size: 0.7rem;
      font-weight: 700;
    }
    .rx-image-date { color: #94a3b8; font-size: 0.74rem; }
    .rx-print-img {
      width: 100%;
      height: auto;
      display: block;
      max-height: 700px;
      object-fit: contain;
      background: #000;
    }

    @media print {
      .rx-image-block { page-break-inside: avoid; }
      .rx-print-img {
        display: block !important;
        visibility: visible !important;
        opacity: 1 !important;
        max-width: 100% !important;
        height: auto !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      img {
        display: block !important;
        visibility: visible !important;
        max-width: 100% !important;
        height: auto !important;
      }
    }
  `;
}

// Helper: Smart parser for medicine dosage/frequency/duration/instructions
function parseDosage(dosageStr) {
  let dosage = '1';
  let frequency = '—';
  let duration = '—';
  let instructions = '—';

  if (dosageStr) {
    const parts = dosageStr.split(/[,;]/).map(p => p.trim());
    if (parts.length >= 3) {
      const p0 = parts[0].toLowerCase();
      if (p0.includes('tab') || p0.includes('cap') || p0.includes('ml') || p0.includes('mg') || p0.match(/^\d+$/)) {
        dosage = parts[0];
        frequency = parts[1];
        duration = parts[2];
        if (parts.length > 3) {
          instructions = parts.slice(3).join(', ');
        }
      } else {
        frequency = parts[0];
        duration = parts[1];
        instructions = parts.slice(2).join(', ');
      }
    } else if (parts.length === 2) {
      const p1 = parts[1].toLowerCase();
      if (p1.includes('day') || p1.includes('week') || p1.includes('month')) {
        frequency = parts[0];
        duration = parts[1];
      } else if (p1.includes('meal') || p1.includes('food') || p1.includes('night') || p1.includes('morning') || p1.includes('empty')) {
        frequency = parts[0];
        instructions = parts[1];
      } else {
        frequency = parts[0];
        instructions = parts[1];
      }
    } else {
      const lower = dosageStr.toLowerCase();
      if (lower.includes('after') || lower.includes('before') || lower.includes('with') || lower.includes('at') || lower.includes('in')) {
        const splitWords = ['after', 'before', 'with', 'at', 'in'];
        let splitWordIndex = -1;
        let splitWord = '';
        for (const w of splitWords) {
          const idx = lower.indexOf(w);
          if (idx !== -1 && (splitWordIndex === -1 || idx < splitWordIndex)) {
            splitWordIndex = idx;
            splitWord = w;
          }
        }
        if (splitWordIndex !== -1) {
          frequency = dosageStr.substring(0, splitWordIndex).trim();
          instructions = dosageStr.substring(splitWordIndex).trim();
        } else {
          frequency = dosageStr;
        }
      } else {
        frequency = dosageStr;
      }
    }
  }
  return { dosage, frequency, duration, instructions };
}

// Helper: Smart parser to extract Advice and Review Details from doctor's notes
function parseNotes(notesStr) {
  let advice = notesStr || '—';
  let reviewDate = 'As needed / SOS';

  if (notesStr) {
    const reviewRegex = /(?:review\s+(?:in|on|after)?\s*([^.]+))/i;
    const match = notesStr.match(reviewRegex);
    if (match) {
      reviewDate = match[1].trim();
      reviewDate = reviewDate.charAt(0).toUpperCase() + reviewDate.slice(1);
      
      advice = notesStr.replace(reviewRegex, '').replace(/\s*\.\s*$/, '').trim();
      if (!advice) {
        advice = '—';
      }
    }
  }
  return { advice, reviewDate };
}

// ─── Prescription PDF ─────────────────────────────────────────────────────────
let _pdfGenerationCache = {
  prescriptionId: null,
  html: null,
  timestamp: 0,
  patientDataStr: null,
  prescriptionDataStr: null
};

async function generatePrescriptionPDF(prescriptionId, returnHtml = false, prescriptionObj = null) {
  let prescription = prescriptionObj;
  if (!prescription && window.allPrescriptions) {
    prescription = window.allPrescriptions.find(r => r.id === prescriptionId || String(r.id) === String(prescriptionId));
  }
  if (!prescription && window.PrescriptionRepository) {
    prescription = await window.PrescriptionRepository.getById(prescriptionId);
  }
  if (!prescription) {
    prescription = await CMS.db.dbGetById(CMS.db.STORES.prescriptions, prescriptionId);
  }

  if (!prescription) { showToast('Report data unavailable.', 'error'); return; }

  let patient = null;
  if (window.allPatients) {
    patient = window.allPatients.find(p => p.id === prescription.patientId || String(p.id) === String(prescription.patientId));
  }
  if (!patient && window.PatientRepository) {
    patient = await window.PatientRepository.getById(prescription.patientId);
  }
  if (!patient) {
    patient = await CMS.patients.getById(prescription.patientId);
  }

  const prescriptionDataStr = JSON.stringify(prescription);
  const patientDataStr = JSON.stringify(patient);

  const now = Date.now();
  if (_pdfGenerationCache.prescriptionId === prescriptionId &&
      (now - _pdfGenerationCache.timestamp) < 60000 &&
      _pdfGenerationCache.prescriptionDataStr === prescriptionDataStr &&
      _pdfGenerationCache.patientDataStr === patientDataStr) {
    console.log("[PDF Cache] Reusing existing generated PDF/HTML");
    if (returnHtml) {
      return { html: _pdfGenerationCache.html, patientName: patient?.name || 'Patient' };
    }
    const printWindow = window.open('', '_blank');
    if (!printWindow) { showToast('Please allow pop-ups for printing.', 'error'); return; }
    safePrint(printWindow, _pdfGenerationCache.html);
    return;
  }

  let medicines = [];
  if (prescription.medicines && prescription.medicines.length > 0) {
    medicines = prescription.medicines;
  } else if (prescription.meds && prescription.meds.length > 0) {
    medicines = prescription.meds;
  } else if (window.PrescriptionRepository) {
    medicines = await window.PrescriptionRepository.getMedicines(prescriptionId);
  }

  const images   = await fetchPrescriptionImages(prescriptionId, prescription.patientId);

  // Time parsing from ISO createdAt timestamp
  const prescriptionTime = prescription.createdAt 
    ? new Date(prescription.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }) 
    : '—';

  const medRows = medicines.map((m) => {
    const parsed = parseDosage(m.dosage);
    return `
      <tr>
        <td style="font-weight: 700; color: #0f172a;">${m.medicineName || '—'}</td>
        <td>${parsed.dosage || '—'}</td>
        <td style="font-weight: 600;">${parsed.frequency || '—'}</td>
        <td style="font-weight: 600;">${parsed.duration || '—'}</td>
        <td style="color: #475569; font-style: italic;">${parsed.instructions || '—'}</td>
      </tr>`;
  }).join('');

  const parsedNotes = parseNotes(prescription.notes);
  const imagesHTML = buildImagesPrintHTML(images);

  const logoSVG = `<img src="assets/Prescription_logo.svg?v=1.0.1" alt="Clinic Logo">`;
  const watermarkSVG = `<img src="assets/Prescription_watermark.svg?v=1.0.1" alt="Watermark">`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Prescription — ${patient?.name || 'Patient'}</title>
  <style>${basePrintCSS()}</style>
</head>
<body>
  <div class="prescription-page">
    <!-- Centered Watermark -->
    <div class="watermark">
      ${watermarkSVG}
    </div>

    <!-- Header Section -->
    <header class="header">
      <!-- LEFT COLUMN -->
      <div class="left">
        <h2>Lakshmi Ortho &amp; Pain Clinic</h2>
        <p>99, West Car Street</p>
        <p>Tiruchendur - 628215</p>
      </div>

      <!-- CENTER COLUMN -->
      <div class="center">
        <div class="logo">
          ${logoSVG}
        </div>
      </div>

      <!-- RIGHT COLUMN -->
      <div class="right">
        <h2>Dr. C. SANJAY M.S.(ORTHO)</h2>
        <p>Consultant Trauma,</p>
        <p>Replacement &amp; Spine Surgery</p>
        <p>Reg. No.: 100860</p>
      </div>
    </header>

    <div class="divider"></div>

    <div class="rx">℞</div>

    <!-- Write area wrapper -->
    <div class="write-area">
      <!-- Patient Info Section -->
      <section class="patient-info">
        <div><strong>Patient Name:</strong><span>${patient?.name || '—'}</span></div>
        <div><strong>Date:</strong><span>${formatDate(prescription.date)} ${prescriptionTime}</span></div>
        <div><strong>Age / Gender:</strong><span>${patient?.age || '—'} yrs / ${patient?.gender || '—'}</span></div>
        <div><strong>Mobile:</strong><span>${patient?.mobile || '—'}</span></div>
        <div><strong>Patient ID:</strong><span>${patient?.patientCode || patient?.id || '—'}</span></div>
        <div><strong>Diagnosis:</strong><span>${patient?.diagnosis || '—'}</span></div>
        <div class="full" style="display: flex;"><strong>Condition:</strong><span>${patient?.condition || '—'}</span></div>
      </section>

      <!-- Medicines Table -->
      <table class="medicine-table">
        <thead>
          <tr>
            <th>Medicine</th>
            <th>Dosage</th>
            <th>Frequency</th>
            <th>Duration</th>
            <th>Instructions</th>
          </tr>
        </thead>
        <tbody>
          ${medRows || '<tr><td colspan="5" style="text-align: center; padding: 20px; color: #64748b; font-size: 0.85rem;">No medicines prescribed.</td></tr>'}
        </tbody>
      </table>

      <!-- Advice & Instructions Block -->
      <div class="advice-block">
        ${parsedNotes.advice && parsedNotes.advice !== '—' ? `<div style="margin-bottom: 8px;"><strong style="color: #7a1f2b;">Advice / Notes:</strong> <span style="white-space: pre-wrap; font-weight: 600; color: #334155;">${parsedNotes.advice}</span></div>` : ''}
        ${parsedNotes.reviewDate && parsedNotes.reviewDate !== 'As needed / SOS' ? `<div><strong style="color: #7a1f2b;">Review:</strong> <span style="font-weight: 600; color: #334155;">${parsedNotes.reviewDate}</span></div>` : ''}
      </div>

      <!-- Blank spacer -->
      <div style="flex: 1;"></div>

      <!-- Doctor Signature Block -->
      <div class="signature-block">
        <div class="sig-name">Dr. C. SANJAY</div>
        <div class="sig-title">Authorized Signature</div>
      </div>
    </div>

    <!-- Footer -->
    <footer class="footer">
      <div class="box">
        <b>Consultation Time</b>
        6.00 PM to 9.00 PM
      </div>
      <div class="box" style="text-align:right">
        <b>For Appointment</b>
        8903783462
      </div>
    </footer>
  </div>

  <!-- Medical scanned attachments render on subsequent pages -->
  ${imagesHTML}
</body>
</html>`;

  // Save to cache
  _pdfGenerationCache = {
    prescriptionId,
    html,
    timestamp: now,
    patientDataStr,
    prescriptionDataStr
  };

  if (returnHtml) {
    return { html, patientName: patient?.name || 'Patient' };
  }

  const printWindow = window.open('', '_blank');
  if (!printWindow) { showToast('Please allow pop-ups for printing.', 'error'); return; }
  safePrint(printWindow, html);
}

// ─── Invoice PDF ──────────────────────────────────────────────────────────────
async function generateInvoicePDF(invoiceId) {
  const invoice  = await CMS.db.dbGetById(CMS.db.STORES.invoices, invoiceId);
  if (!invoice) { showToast('Invoice not found.', 'error'); return; }

  const patient  = await CMS.patients.getById(invoice.patientId);
  const payments = (await CMS.payments.getAll()).filter(p => p.invoiceId === invoiceId);
  const paid     = payments.reduce((s, p) => s + parseFloat(p.amount || 0), 0);
  const due      = Math.max(0, parseFloat(invoice.totalAmount || 0) - paid);

  const payRows = payments.map(p => `
    <tr>
      <td>${formatDate(p.date)}</td>
      <td>${p.method || '—'}</td>
      <td style="text-align:right;">${formatCurrency(p.amount)}</td>
    </tr>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Invoice — ${invoice.invoiceNo}</title>
  <style>
    ${basePrintCSS()}
    .totals-box { margin-left: auto; width: 280px; padding: 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; margin-top: 1.25rem; }
    .totals-box div { display: flex; justify-content: space-between; padding: 3px 0; font-size: 0.9rem; }
    .total-due { font-size: 1.05rem; font-weight: 700; border-top: 1px solid #cbd5e1; padding-top: 0.5rem; margin-top: 0.5rem; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinic-name">${window.CLINIC_INFO.clinicName}</div>
      <div class="clinic-sub" style="font-weight:700;color:#0f766e;">${window.CLINIC_INFO.doctorName} ${window.CLINIC_INFO.qualification}</div>
      <div class="clinic-sub">&#128205; ${window.CLINIC_INFO.address}</div>
      <div class="clinic-sub">&#128222; ${window.CLINIC_INFO.phone}</div>
    </div>
    <div style="font-size:2rem;font-weight:900;color:#14b8a6;letter-spacing:2px;">INVOICE</div>
  </div>

  <div class="info-grid">
    <div class="info-item"><label>Invoice No</label><p>${invoice.invoiceNo}</p></div>
    <div class="info-item"><label>Date</label><p>${formatDate(invoice.date)}</p></div>
    <div class="info-item"><label>Patient Name</label><p>${patient?.name || '—'}</p></div>
    <div class="info-item"><label>Mobile</label><p>${patient?.mobile || '—'}</p></div>
  </div>

  <table>
    <thead><tr><th>Service Description</th><th style="text-align:right;">Amount</th></tr></thead>
    <tbody>
      ${parseFloat(invoice.consultCharges  || 0) > 0 ? `<tr><td>Consultation Fee</td><td style="text-align:right;">${formatCurrency(invoice.consultCharges)}</td></tr>` : ''}
      ${parseFloat(invoice.therapyCharges  || 0) > 0 ? `<tr><td>Physiotherapy &amp; Rehabilitation</td><td style="text-align:right;">${formatCurrency(invoice.therapyCharges)}</td></tr>` : ''}
      ${parseFloat(invoice.medicineCharges || 0) > 0 ? `<tr><td>Pharmacy &amp; Medicines</td><td style="text-align:right;">${formatCurrency(invoice.medicineCharges)}</td></tr>` : ''}
      ${parseFloat(invoice.surgeryCharges  || 0) > 0 ? `<tr><td>Surgery &amp; Procedure Fees</td><td style="text-align:right;">${formatCurrency(invoice.surgeryCharges)}</td></tr>` : ''}
    </tbody>
  </table>

  <div class="totals-box">
    <div><span>Gross Total:</span><strong>${formatCurrency(invoice.totalAmount)}</strong></div>
    <div class="total-due" style="color:${due > 0 ? '#ef4444' : '#10b981'}">
      <span>Balance Due:</span><strong>${formatCurrency(due)}</strong>
    </div>
    <div style="color:#10b981;"><span>Amount Paid:</span><strong>${formatCurrency(paid)}</strong></div>
    <div style="font-size:0.8rem;color:#94a3b8;"><span>Status:</span><span>${invoice.status || '—'}</span></div>
  </div>

  ${payRows ? `
  <div style="margin-top:1.5rem;">
    <div class="section-title">Payment History</div>
    <table><thead><tr><th>Date</th><th>Method</th><th style="text-align:right;">Amount</th></tr></thead>
    <tbody>${payRows}</tbody></table>
  </div>` : ''}

  <div class="footer">
    <div style="font-size:0.78rem;color:#94a3b8;"><em>Generated by ${window.CLINIC_INFO.clinicName} HIS</em></div>
    <div class="signature-line">${window.CLINIC_INFO.doctorName}, ${window.CLINIC_INFO.qualification}</div>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) { showToast('Please allow pop-ups for printing.', 'error'); return; }
  safePrint(printWindow, html);
}

// ─── Patient Full Report PDF ──────────────────────────────────────────────────
window.generatePatientReportPDF = async function(patientId) {
  const patient       = await CMS.patients.getById(patientId);
  if (!patient) { showToast('Patient not found.', 'error'); return; }

  const prescriptions = await CMS.prescriptions.getByPatient(patientId);
  const visits        = await CMS.db.dbGetByIndex ? await CMS.db.dbGetAll(CMS.db.STORES.visits) : [];
  const patientVisits = visits.filter(v => v.patientId === patientId);
  const allFiles      = await CMS.files.getByPatient(patientId);

  const rxWithMeds = await Promise.all(prescriptions.map(async rx => {
    const meds = await CMS.prescriptions.getMedicines(rx.id);
    const imgs = await CMS.files.getByPrescription(rx.id);
    return { ...rx, meds, imgs };
  }));

  const rxSections = rxWithMeds.map(rx => `
    <div style="margin-bottom:1.25rem;padding:1rem;border:1px solid #e2e8f0;border-radius:8px;page-break-inside:avoid;">
      <div style="display:flex;justify-content:space-between;margin-bottom:0.75rem;">
        <strong>Prescription: ${rx.id}</strong>
        <span style="font-size:0.85rem;color:#64748b;">${formatDate(rx.date)}</span>
      </div>
      <table style="font-size:0.85rem;">
        <thead><tr><th>Medicine</th><th>Qty</th><th>Dosage</th></tr></thead>
        <tbody>${rx.meds.map(m => `<tr><td>${m.medicineName}</td><td>${m.qty}</td><td style="color:#64748b;">${m.dosage || '—'}</td></tr>`).join('')}</tbody>
      </table>
      ${rx.notes ? `<p style="margin:0.75rem 0 0;font-size:0.85rem;color:#475569;"><em>Notes: ${rx.notes}</em></p>` : ''}
      ${buildImagesPrintHTML(rx.imgs)}
    </div>`).join('');

  // Files NOT linked to a specific prescription
  const orphanFiles = allFiles.filter(f => !f.prescriptionId);
  const orphanImagesHTML = buildImagesPrintHTML(orphanFiles);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Patient Report — ${patient.name}</title>
  <style>${basePrintCSS()}</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="clinic-name">${window.CLINIC_INFO.clinicName}</div>
      <div class="clinic-sub" style="font-weight:700;color:#0f766e;">${window.CLINIC_INFO.doctorName} ${window.CLINIC_INFO.qualification}</div>
      <div class="clinic-sub">${window.CLINIC_INFO.specialization}</div>
    </div>
    <div style="text-align:right;">
      <strong style="font-size:1.1rem;">Patient Report</strong><br>
      <span style="font-size:0.82rem;color:#64748b;">Generated: ${formatDate(new Date().toISOString())}</span>
    </div>
  </div>

  <div class="section-title">Patient Details</div>
  <div class="info-grid">
    <div class="info-item"><label>Full Name</label><p>${patient.name}</p></div>
    <div class="info-item"><label>Patient ID</label><p>${patient.patientCode || patient.id || '—'}</p></div>
    <div class="info-item"><label>Age / Gender</label><p>${patient.age || '—'} yrs / ${patient.gender || '—'}</p></div>
    <div class="info-item"><label>Mobile</label><p>${patient.mobile || '—'}</p></div>
    <div class="info-item"><label>Address</label><p>${patient.address || '—'}</p></div>
    <div class="info-item"><label>Condition</label><p>${patient.condition || '—'}</p></div>
    <div class="info-item"><label>Diagnosis</label><p>${patient.diagnosis || '—'}</p></div>
  </div>

  <div style="margin-bottom:1.5rem;">
    <span style="display:inline-block;padding:2px 10px;border-radius:50px;font-size:0.75rem;font-weight:600;background:#e0f2fe;color:#0369a1;margin-right:0.5rem;">${prescriptions.length} Prescriptions</span>
    <span style="display:inline-block;padding:2px 10px;border-radius:50px;font-size:0.75rem;font-weight:600;background:#e0f2fe;color:#0369a1;margin-right:0.5rem;">${patientVisits.length} Visits</span>
    <span style="display:inline-block;padding:2px 10px;border-radius:50px;font-size:0.75rem;font-weight:600;background:#e0f2fe;color:#0369a1;">${allFiles.length} Attachments</span>
  </div>

  ${rxWithMeds.length ? `<div class="section-title">Prescription History</div>${rxSections}` : ''}

  ${orphanFiles.length ? `<div class="section-title" style="margin-top:1.5rem;">Other Patient Files &amp; Reports</div>${orphanImagesHTML}` : ''}

  ${patientVisits.length ? `
  <div class="section-title" style="margin-top:1.5rem;">Visit History</div>
  <ul style="padding-left:1.25rem;font-size:0.88rem;">
    ${[...patientVisits].sort((a,b) => b.date?.localeCompare(a.date)).map(v =>
      `<li style="margin-bottom:0.4rem;"><strong>${formatDate(v.date)}:</strong> ${v.notes || '—'}</li>`
    ).join('')}
  </ul>` : ''}

  <div class="footer">
    <div style="font-size:0.78rem;color:#94a3b8;"><em>Generated by ${window.CLINIC_INFO.clinicName} HIS</em></div>
    <div class="signature-line">${window.CLINIC_INFO.doctorName}, ${window.CLINIC_INFO.qualification}</div>
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) { showToast('Please allow pop-ups for printing.', 'error'); return; }
  safePrint(printWindow, html);
};

// ─── Utilities ──────────────────────────────────────────────────────────────

/**
 * Returns today's date in ISO format (YYYY-MM-DD).
 * Used by dashboard, notifications and any time-sensitive queries.
 */
function todayISO() {
  return new Date().toISOString().split('T')[0];
}
window.todayISO = todayISO;

/**
 * Thin wrapper around window.confirm for destructive actions.
 * Returns boolean — pages call this before deleting records.
 */
function confirmAction(message) {
  return window.confirm(message || 'Are you sure?');
}
window.confirmAction = confirmAction;


function buildStockBar(available, total) {
  const pct = total > 0 ? Math.min(100, Math.round((available / total) * 100)) : 0;
  let barColor = 'var(--primary)'; // Teal
  if (pct <= 10) barColor = 'var(--danger)'; // Red
  else if (pct <= 30) barColor = 'var(--warning)'; // Orange
  
  return `
    <div class="progress-bar-container" style="width:100%; height:6px; background:rgba(255,255,255,0.08); border-radius:3px; overflow:hidden; margin-top:4px; border:1px solid rgba(255,255,255,0.04);">
      <div class="progress-bar-fill" style="width:${pct}%; height:100%; background:${barColor}; border-radius:3px; transition:none;"></div>
    </div>
  `;
}
window.buildStockBar = buildStockBar;

async function updateLowStockBadge() {
  try {
    const low = await CMS.medicines.getLowStock(10);
    const badge = document.querySelector('.low-stock-badge');
    if (badge) {
      badge.textContent = low.length;
      badge.style.display = low.length ? '' : 'none';
    }
  } catch (e) {}
}

document.addEventListener('DOMContentLoaded', async () => {
  await CMS.init();
  setupModalClose();
  setupSidebar();
  try { await updateLowStockBadge(); } catch (e) {}
  try { if (window.lucide) lucide.createIcons(); } catch (e) {}
  document.dispatchEvent(new CustomEvent('cms:ready'));

  // Load QA Automation Center if requested via URL search param
  if (window.location.search.includes('run_qa=true')) {
    const s = document.createElement('script');
    s.src = 'js/qa-automation.js';
    document.body.appendChild(s);
  }
});

class HospitalFinanceService {
    calculate(invoices, profitTransactions) {
        let invoiceRevenue = 0;
        let collectedPayments = 0;
        let outstandingBalance = 0;
        let pendingInvoices = 0;

        (invoices || []).forEach(inv => {
            if (!inv) return;
            invoiceRevenue += parseFloat(inv.totalAmount || 0);
            collectedPayments += parseFloat(inv.paidAmount || 0);
            outstandingBalance += parseFloat(inv.balanceDue || 0);
            if (inv.status !== 'Paid') {
                pendingInvoices++;
            }
        });

        // Expenses = medicine purchase cost
        let expenses = 0;
        (profitTransactions || []).forEach(t => {
            if (!t) return;
            const qty = parseFloat(t.quantity || 0);
            const bp = parseFloat(t.buyingPrice || t.buying_price || 0);
            expenses += qty * bp;
        });

        const netProfit = collectedPayments - expenses;

        return {
            invoiceRevenue: collectedPayments,
            expenses,
            netProfit,
            outstandingBalance,
            pendingInvoices,
            totalInvoiced: invoiceRevenue,
            totalCollected: collectedPayments
        };
    }
}
window.HospitalFinanceService = new HospitalFinanceService();

class MedicineProfitService {
    calculate(transactions) {
        let medicineRevenue = 0;
        let medicineCost = 0;
        let unitsSold = 0;

        (transactions || []).forEach(t => {
            if (!t) return;
            const qty = parseFloat(t.quantity || 0);
            const sp = parseFloat(t.sellingPrice || t.selling_price || 0);
            const bp = parseFloat(t.buyingPrice || t.buying_price || 0);

            medicineRevenue += qty * sp;
            medicineCost += qty * bp;
            unitsSold += qty;
        });

        const medicineProfit = medicineRevenue - medicineCost;
        const profitMargin = medicineRevenue > 0 ? (medicineProfit / medicineRevenue) * 100 : 0;
        const prescriptionLines = (transactions || []).length;

        // Group by medicine
        const medBreakdown = {};
        (transactions || []).forEach(t => {
            if (!t || !t.medicineId) return;
            if (!medBreakdown[t.medicineId]) {
                medBreakdown[t.medicineId] = { medicineId: t.medicineId, name: t.medicineName, qty: 0, revenue: 0, cost: 0, profit: 0 };
            }
            const qty = parseFloat(t.quantity || 0);
            const sp = parseFloat(t.sellingPrice || t.selling_price || 0);
            const bp = parseFloat(t.buyingPrice || t.buying_price || 0);

            medBreakdown[t.medicineId].qty += qty;
            medBreakdown[t.medicineId].revenue += qty * sp;
            medBreakdown[t.medicineId].cost += qty * bp;
            medBreakdown[t.medicineId].profit += (qty * sp) - (qty * bp);
        });
        const profitByMedicine = Object.values(medBreakdown);

        // Daily chart data
        const daily = {};
        (transactions || []).forEach(t => {
            if (!t) return;
            const d = t.soldDate;
            if (!d) return;
            if (!daily[d]) {
                daily[d] = { date: d, revenue: 0, cost: 0, profit: 0 };
            }
            const qty = parseFloat(t.quantity || 0);
            const sp = parseFloat(t.sellingPrice || t.selling_price || 0);
            const bp = parseFloat(t.buyingPrice || t.buying_price || 0);

            daily[d].revenue += qty * sp;
            daily[d].cost += qty * bp;
            daily[d].profit += (qty * sp) - (qty * bp);
        });
        const dailyChart = Object.values(daily).sort((a, b) => a.date.localeCompare(b.date));

        return {
            medicineRevenue,
            medicineCost,
            medicineProfit,
            profitMargin,
            unitsSold,
            prescriptionLines,
            profitByMedicine,
            dailyChart
        };
    }
}
window.MedicineProfitService = new MedicineProfitService();
