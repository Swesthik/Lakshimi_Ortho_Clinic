/**
 * Lakshmi HIS — Medicine Profit Analytics v3.0
 * Supabase Integrated Edition.
 *
 * How it works:
 *   1. Reads from ProfitAnalysisRepository for transactions and summary
 *   2. Displays metrics, charts, and tables completely sourced from Supabase
 *   3. Filter, search, and date aggregations map to repository calls
 *   4. Refreshes dynamically on update event triggers
 */

let _allTx        = [];   // computed on-the-fly from prescriptions
let _dateRange    = { startStr: null, endStr: null };
let _chartInst    = null;
let _trendInst    = null;
let _currentPage  = 1;
const PER_PAGE    = 15;
let _search       = '';
let _initialized  = false;

// Date range calculation helper
function getDateRangeDates() {
  return {
    fromDate: _dateRange.startStr || null,
    toDate: _dateRange.endStr || null
  };
}

// ── Bootstrap ────────────────────────────────────────────────────────────────
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkAndInit);
} else {
  checkAndInit();
}

function checkAndInit() {
  if (window.CMS && window.CMS.ready) {
    initializeProfitAnalysis();
  } else {
    document.addEventListener('cms:ready', initializeProfitAnalysis);
  }
}

document.addEventListener('profit-updated', () => {
  runProfitAnalytics().catch(err => console.error("Refresh error:", err));
});

function initializeProfitAnalysis() {
  if (_initialized) return;
  _initialized = true;

  // Verify that repositories exist before execution
  if (!window.ProfitAnalysisRepository) {
    console.warn("ProfitAnalysisRepository not loaded");
  }

  // Setup refresh button exactly once
  const refreshBtn = document.getElementById('btnRefresh');
  if (refreshBtn) {
    refreshBtn.onclick = () => {
      runProfitAnalytics().catch(err => console.error("Refresh error:", err));
    };
  }

  runProfitAnalytics();
}

// ── Main Entry Point ─────────────────────────────────────────────────────────
async function runProfitAnalytics() {
  showSpinner(true);
  try {
    const { fromDate, toDate } = getDateRangeDates();

    // Query ProfitAnalysisRepository with the current date filters
    if (!window.ProfitAnalysisRepository) {
      throw new Error("ProfitAnalysisRepository is not loaded yet");
    }

    _allTx = await window.ProfitAnalysisRepository.getTransactionsByDate(fromDate, toDate);

    // Validate that _allTx is an array
    if (!Array.isArray(_allTx)) {
      _allTx = [];
    }

    // Convert NULL / undefined values to 0 dynamically to prevent NaN
    _allTx.forEach(t => {
      if (t) {
        t.quantity = parseInt(t.quantity || 0, 10);
        t.buyingPrice = parseFloat(t.buyingPrice || 0);
        t.sellingPrice = parseFloat(t.sellingPrice || 0);
        t.totalCost = parseFloat(t.totalCost || 0);
        t.totalRevenue = parseFloat(t.totalRevenue || 0);
        t.totalProfit = parseFloat(t.totalProfit || 0);
        t.profitMargin = parseFloat(t.profitMargin || 0);
      }
    });

    // Set up UI and draw sections
    setupFilters();
    renderAll();

  } catch (err) {
    console.error('[ProfitAnalytics] Supabase Load Error:', err);
    const errEl = document.getElementById('profitError');
    if (errEl) {
      errEl.textContent = 'Error loading data: ' + err.message;
      errEl.style.display = 'block';
    }
    showToast(err.message || 'Error loading profit reports', 'error');
  } finally {
    showSpinner(false);
  }
}

// ── Filter Setup ─────────────────────────────────────────────────────────────
function setupFilters() {
  document.querySelectorAll('.pf-btn').forEach(btn => {
    btn.onclick = () => {
      document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const r = btn.dataset.range;
      const today = new Date();
      let startStr = null;
      let endStr = null;

      if (r === 'today') {
        startStr = today.toISOString().split('T')[0];
        endStr = startStr;
      }
      else if (r === 'week') {
        const day = today.getDay();
        const diff = today.getDate() - day + (day === 0 ? -6 : 1);
        const monday = new Date(today.getFullYear(), today.getMonth(), diff, 12, 0, 0);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        
        startStr = monday.toISOString().split('T')[0];
        endStr = sunday.toISOString().split('T')[0];
      }
      else if (r === 'month') {
        const firstDay = new Date(today.getFullYear(), today.getMonth(), 1, 12, 0, 0);
        const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0, 12, 0, 0);
        
        startStr = firstDay.toISOString().split('T')[0];
        endStr = lastDay.toISOString().split('T')[0];
      }
      else if (r === 'year') {
        const firstDay = new Date(today.getFullYear(), 0, 1, 12, 0, 0);
        const lastDay = new Date(today.getFullYear(), 11, 31, 12, 0, 0);
        
        startStr = firstDay.toISOString().split('T')[0];
        endStr = lastDay.toISOString().split('T')[0];
      }

      _dateRange = { startStr, endStr };
      _currentPage = 1;
      runProfitAnalytics().catch(err => console.error("Filter error:", err));
    };
  });

  const applyBtn = document.getElementById('pfApply');
  if (applyBtn) {
    applyBtn.onclick = () => {
      document.querySelectorAll('.pf-btn').forEach(b => b.classList.remove('active'));
      const from = document.getElementById('pfFrom').value;
      const to   = document.getElementById('pfTo').value;
      _dateRange = {
        startStr: from || null,
        endStr  : to || null
      };
      _currentPage = 1;
      runProfitAnalytics().catch(err => console.error("Apply filter error:", err));
    };
  }

  const searchInput = document.getElementById('pfSearch');
  if (searchInput) {
    searchInput.oninput = (e) => {
      _search = e.target.value.toLowerCase();
      _currentPage = 1;
      renderTable();
    };
  }
}

// ── Filter Transactions dynamically by cached Search input ─────────────────────
function getFiltered() {
  return (_allTx || []);
}

// ── Render Everything ─────────────────────────────────────────────────────────
function renderAll() {
  try {
    const filtered = getFiltered();
    renderMetrics(filtered);
    renderMedBreakdown(filtered);
    renderChart(filtered);
    renderTable();
  } catch (err) {
    console.error("Error during rendering all sections:", err);
  }
}

function renderMetrics(tx) {
  const sum = window.MedicineProfitService.calculate(tx);

  animCount('mRevenue',    sum.medicineRevenue, true);
  animCount('mCost',       sum.medicineCost,    true);
  animCount('mProfit',     sum.medicineProfit,  true);
  animCount('mQty',        sum.unitsSold, false);
  setText('mMargin',       sum.profitMargin.toFixed(1) + '%');
  setText('mTxCount',      sum.prescriptionLines.toString());
}

// ── Per-Medicine Breakdown ─────────────────────────────────────────────────────
function renderMedBreakdown(tx) {
  const agg = {};
  if (Array.isArray(tx)) {
    tx.forEach(t => {
      if (t && t.medicineId) {
        if (!agg[t.medicineId]) {
          agg[t.medicineId] = { name: t.medicineName, qty: 0, revenue: 0, cost: 0, profit: 0 };
        }
        agg[t.medicineId].qty     += parseInt(t.quantity || 0, 10);
        agg[t.medicineId].revenue += parseFloat(t.totalRevenue || 0);
        agg[t.medicineId].cost    += parseFloat(t.totalCost || 0);
        agg[t.medicineId].profit  += parseFloat(t.totalProfit || 0);
      }
    });
  }

  // Sort descending by Revenue
  const meds = Object.values(agg).sort((a, b) => b.revenue - a.revenue);
  const tbody = document.getElementById('medBreakBody');
  if (!tbody) return;

  setText('medBreakCount', meds.length + ' medicine' + (meds.length !== 1 ? 's' : ''));

  if (!meds.length) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:2rem;color:var(--text-muted);">No medicines available.</td></tr>`;
    return;
  }

  tbody.innerHTML = meds.map((m, i) => {
    const margin = m.revenue > 0 ? ((m.profit / m.revenue) * 100).toFixed(1) : '0.0';
    const isPos  = m.profit >= 0;
    return `<tr>
      <td class="td-light">${i + 1}</td>
      <td class="td-name"><strong>${esc(m.name)}</strong></td>
      <td style="text-align:center;font-weight:700;">${m.qty}</td>
      <td style="text-align:right;color:#0d9488;font-weight:700;">${formatCurrency(m.revenue)}</td>
      <td style="text-align:right;color:${isPos ? 'var(--success)' : 'var(--danger)'};font-weight:700;">${isPos ? '+' : ''}${formatCurrency(m.profit)}</td>
      <td style="text-align:right;"><span class="badge ${isPos ? 'badge-success' : 'badge-danger'}" style="font-size:0.75rem;">${margin}%</span></td>
    </tr>`;
  }).join('');
}

// ── Profit Trend Chart ────────────────────────────────────────────────────────
function renderChart(tx) {
  const ctx = document.getElementById('profitChart');
  if (!ctx) return;
  if (_trendInst) { _trendInst.destroy(); _trendInst = null; }

  const byDate = {};
  if (Array.isArray(tx)) {
    tx.forEach(t => {
      if (t) {
        const d = t.soldDate || todayISO();
        if (!byDate[d]) byDate[d] = { revenue: 0, profit: 0, cost: 0 };
        byDate[d].revenue += parseFloat(t.totalRevenue || 0);
        byDate[d].profit  += parseFloat(t.totalProfit || 0);
        byDate[d].cost    += parseFloat(t.totalCost || 0);
      }
    });
  }

  const labels  = Object.keys(byDate).sort();
  const revenue = labels.map(d => byDate[d].revenue);
  const profit  = labels.map(d => byDate[d].profit);
  const cost    = labels.map(d => byDate[d].cost);

  const emptyEl = document.getElementById('chartEmpty');

  if (!labels.length) {
    ctx.style.display = 'none';
    setText('chartEmpty', 'No chart data available.');
    if (emptyEl) emptyEl.style.display = 'block';
    return;
  }
  ctx.style.display = '';
  if (emptyEl) emptyEl.style.display = 'none';

  if (!window.Chart) {
    console.warn("Chart.js is not loaded");
    return;
  }

  try {
    Chart.defaults.color       = '#94a3b8';
    Chart.defaults.borderColor = 'rgba(255,255,255,0.05)';
    Chart.defaults.font.family = 'Inter, sans-serif';

    _trendInst = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          { label: 'Revenue (\u20B9)',       data: revenue, backgroundColor: 'rgba(20,184,166,0.7)',  borderColor: 'rgba(20,184,166,1)',  borderWidth: 1 },
          { label: 'Medicine Cost (\u20B9)', data: cost,    backgroundColor: 'rgba(239,68,68,0.5)',   borderColor: 'rgba(239,68,68,1)',   borderWidth: 1 },
          { label: 'Profit (\u20B9)',        data: profit,  backgroundColor: 'rgba(168,85,247,0.7)',  borderColor: 'rgba(168,85,247,1)',  borderWidth: 1 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            backgroundColor: 'rgba(15,23,42,0.95)',
            titleColor: '#fff', bodyColor: '#cbd5e1',
            borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1,
            callbacks: { label: ctx => `${ctx.dataset.label}: ${formatCurrency(ctx.raw)}` }
          }
        },
        scales: {
          y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { callback: v => '\u20B9' + v.toLocaleString('en-IN') } },
          x: { grid: { display: false } }
        }
      }
    });
  } catch (chartErr) {
    console.error("Error drawing Chart:", chartErr);
  }
}

// ── Detailed Table ────────────────────────────────────────────────────────────
function renderTable() {
  const filtered = getFiltered();
  const tbody = document.getElementById('txTableBody');
  if (!tbody) return;

  let rows = filtered || [];

  // Search
  if (_search) {
    const q = _search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(t => t && (t.medicineName || '').toLowerCase().includes(q));
    }
  }

  // Sort newest first
  rows = [...rows].sort((a, b) => {
    const da = a.soldDate || '';
    const db = b.soldDate || '';
    return db.localeCompare(da);
  });

  // Pagination
  const total      = rows.length;
  const totalPages = Math.ceil(total / PER_PAGE) || 1;
  if (_currentPage > totalPages) _currentPage = totalPages;
  const start      = (_currentPage - 1) * PER_PAGE;
  const page       = rows.slice(start, start + PER_PAGE);

  setText('txCount', `${total} transaction${total !== 1 ? 's' : ''}`);

  if (!page.length) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:2rem;color:var(--text-muted);">No transactions available.</td></tr>`;
  } else {
    tbody.innerHTML = page.map(t => {
      if (!t) return '';
      const isPos = t.totalProfit >= 0;
      return `<tr>
        <td class="td-light">${formatDate(t.soldDate)}</td>
        <td class="td-name"><strong>${esc(t.medicineName)}</strong></td>
        <td style="text-align:center;">${t.quantity}</td>
        <td class="td-light" style="text-align:right;">${formatCurrency(t.buyingPrice)} / ${formatCurrency(t.sellingPrice)}</td>
        <td style="text-align:right;color:#0d9488;font-weight:700;">${formatCurrency(t.totalRevenue)}</td>
        <td style="text-align:right;color:#f97316;">-${formatCurrency(t.totalCost)}</td>
        <td style="text-align:right;color:${isPos ? 'var(--success)' : 'var(--danger)'};font-weight:700;">${isPos ? '+' : ''}${formatCurrency(t.totalProfit)}</td>
      </tr>`;
    }).join('');
  }

  // Pagination
  const pag = document.getElementById('txPagination');
  if (pag) {
    let html = '';
    for (let i = 1; i <= totalPages; i++) {
      html += `<button class="${i === _currentPage ? 'active' : ''}" onclick="_currentPage=${i};renderTable()">${i}</button>`;
    }
    pag.innerHTML = html;
  }

  if (window.lucide) lucide.createIcons();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function showSpinner(on) {
  const el = document.getElementById('loadingSpinner');
  if (el) el.style.display = on ? 'flex' : 'none';
}

function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function fmt(n) {
  return parseFloat(n || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Escapes special HTML characters defensively
function esc(s) {
  return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;');
}

function animCount(id, end, isCurrency) {
  const el = document.getElementById(id);
  if (!el) return;
  
  if (el._animId) {
    cancelAnimationFrame(el._animId);
    el._animId = null;
  }
  
  const duration = 700;
  let start = null;
  const step = ts => {
    if (!start) start = ts;
    const p   = Math.min((ts - start) / duration, 1);
    const val = (1 - Math.pow(1 - p, 3)) * end;
    el.textContent = isCurrency
      ? formatCurrency(val)
      : Math.floor(val).toLocaleString('en-IN');
    if (p < 1) {
      el._animId = requestAnimationFrame(step);
    } else {
      el.textContent = isCurrency
        ? formatCurrency(end)
        : end.toLocaleString('en-IN');
      el._animId = null;
    }
  };
  el._animId = requestAnimationFrame(step);
}
