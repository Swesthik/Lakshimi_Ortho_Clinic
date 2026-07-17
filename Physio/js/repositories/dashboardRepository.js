/**
 * ============================================================
 * Lakshmi HIS
 * Dashboard Aggregator Repository
 * Aggregates live data from PatientRepository, AppointmentRepository,
 * MedicineRepository, PrescriptionRepository, InvoiceRepository,
 * ProfitAnalysisRepository, and RehabRepository
 * ============================================================
 */

function injectRepoMethod(repoInstance, methodName, fn) {
    if (!repoInstance) return;
    // Inject directly on singleton instance
    repoInstance[methodName] = fn.bind(repoInstance);
    // Inject on prototype if constructor exists
    if (repoInstance.constructor && repoInstance.constructor.prototype) {
        repoInstance.constructor.prototype[methodName] = fn;
    }
}

// Perform dynamic injection on lazy-loaded repository getters
const checkAndInject = () => {
    if (window.PatientRepository) {
        injectRepoMethod(window.PatientRepository, 'getRecent', async function(limitCount = 5) {
            return this.getAll("created_at", false, limitCount);
        });
    }

    if (window.PrescriptionRepository) {
        injectRepoMethod(window.PrescriptionRepository, 'getRecent', async function(limitCount = 5) {
            return this.getAll("prescription_date", false, limitCount);
        });
    }

    if (window.InvoiceRepository) {
        injectRepoMethod(window.InvoiceRepository, 'getTotalRevenue', async function() {
            const list = await this.getAll();
            return (list || []).reduce((acc, curr) => acc + parseFloat(curr.totalAmount || 0), 0);
        });
    }

    if (window.ProfitAnalysisRepository) {
        injectRepoMethod(window.ProfitAnalysisRepository, 'getSummary', async function() {
            const txs = await this.getAll();
            const res = window.MedicineProfitService.calculate(txs);
            return {
                totalRevenue: res.medicineRevenue,
                totalCost: res.medicineCost,
                totalProfit: res.medicineProfit,
                profitMargin: res.profitMargin,
                unitsSold: res.unitsSold,
                prescriptionLines: res.prescriptionLines
            };
        });

        injectRepoMethod(window.ProfitAnalysisRepository, 'getNetProfit', async function() {
            const sum = await this.getSummary();
            return sum ? sum.totalProfit || 0 : 0;
        });
    }

    if (window.MedicineRepository) {
        injectRepoMethod(window.MedicineRepository, 'getLowStock', async function() {
            const list = await this.getAll();
            return (list || []).filter(m => m && m.availableQty <= 10);
        });

        injectRepoMethod(window.MedicineRepository, 'getRecent', async function(limitCount = 5) {
            return this.getAll("created_at", false, limitCount);
        });
    }

    if (window.AppointmentRepository) {
        injectRepoMethod(window.AppointmentRepository, 'getToday', async function() {
            const today = window.todayISO ? window.todayISO() : new Date().toLocaleDateString('en-CA');
            const list = await this.getAll();
            return (list || []).filter(a => a && (a.date === today || a.appointmentDate === today));
        });
    }

    if (window.RehabRepository) {
        injectRepoMethod(window.RehabRepository, 'getActive', async function() {
            const list = await this.getAll();
            return (list || []).filter(p => p && p.status === 'Active');
        });
    }
};

// Hook checkAndInject onto property access dynamically
setTimeout(checkAndInject, 100);

class DashboardRepository {

    constructor() {
        checkAndInject();
    }

    async getDashboardSummary() {
        checkAndInject();
        const results = await Promise.allSettled([
            window.PatientRepository ? window.PatientRepository.count() : Promise.resolve(0),
            window.AppointmentRepository ? window.AppointmentRepository.getToday() : Promise.resolve([]),
            window.RehabRepository ? window.RehabRepository.getActive() : Promise.resolve([]),
            window.InvoiceRepository ? window.InvoiceRepository.getAll() : Promise.resolve([]),
            window.ProfitAnalysisRepository ? window.ProfitAnalysisRepository.getAll() : Promise.resolve([]),
            window.MedicineRepository ? window.MedicineRepository.getLowStock() : Promise.resolve([])
        ]);

        const totalPatients = results[0].status === 'fulfilled' ? results[0].value || 0 : 0;
        const todaysVisits = results[1].status === 'fulfilled' ? (results[1].value || []).length : 0;
        const activeRehab = results[2].status === 'fulfilled' ? (results[2].value || []).length : 0;
        const appointments = results[1].status === 'fulfilled' ? (results[1].value || []).length : 0;
        
        const invoices = results[3].status === 'fulfilled' ? results[3].value || [] : [];
        const profitTx = results[4].status === 'fulfilled' ? results[4].value || [] : [];
        const lowStockCount = results[5].status === 'fulfilled' ? (results[5].value || []).length : 0;

        const fin = window.HospitalFinanceService.calculate(invoices, profitTx);

        return {
            totalPatients,
            todaysVisits,
            activeRehab,
            appointments,
            revenue: fin.invoiceRevenue, // Sum of Paid Invoice Amounts
            expenses: fin.expenses,       // Hospital operational expenses (Medicine purchase cost)
            netProfit: fin.netProfit,     // Revenue - Expenses
            lowStockCount
        };
    }

    async getFinanceTrend() {
        checkAndInject();
        const results = await Promise.allSettled([
            window.InvoiceRepository ? window.InvoiceRepository.getAll() : Promise.resolve([]),
            window.ProfitAnalysisRepository ? window.ProfitAnalysisRepository.getAll() : Promise.resolve([])
        ]);

        const invoices = results[0].status === 'fulfilled' ? results[0].value || [] : [];
        const profitTx = results[1].status === 'fulfilled' ? results[1].value || [] : [];

        const agg = {};

        // Revenue = Paid Invoice Amounts
        invoices.forEach(inv => {
            const d = inv.date || inv.invoiceDate;
            if (!d) return;
            if (!agg[d]) agg[d] = { date: d, revenue: 0, expenses: 0, profit: 0 };
            agg[d].revenue += parseFloat(inv.paidAmount || 0);
        });

        // Expenses = Medicine purchase costs
        profitTx.forEach(tx => {
            const d = tx.soldDate;
            if (!d) return;
            if (!agg[d]) agg[d] = { date: d, revenue: 0, expenses: 0, profit: 0 };
            const qty = parseFloat(tx.quantity || 0);
            const bp = parseFloat(tx.buyingPrice || tx.buying_price || 0);
            agg[d].expenses += qty * bp;
        });

        Object.keys(agg).forEach(d => {
            agg[d].profit = agg[d].revenue - agg[d].expenses;
        });

        return Object.values(agg).sort((a, b) => a.date.localeCompare(b.date));
    }

    async getRehabStatistics() {
        checkAndInject();
        const results = await Promise.allSettled([
            window.RehabRepository ? window.RehabRepository.getAll() : Promise.resolve([]),
            window.RehabRepository ? window.RehabRepository.getActive() : Promise.resolve([])
        ]);

        const plans = results[0].status === 'fulfilled' ? results[0].value || [] : [];
        const activePlans = results[1].status === 'fulfilled' ? results[1].value || [] : [];

        const completed = plans.filter(p => p && p.status === 'Completed').length;
        const pending = plans.filter(p => p && p.status === 'Pending').length;

        return {
            activePatients: activePlans.length,
            completedPrograms: completed,
            pendingPrograms: pending,
            dailySessions: activePlans.length + completed
        };
    }

    async refreshDashboard() {
        if (window.loadDashboardData) {
            await window.loadDashboardData();
        }
    }
}

/**
 * Global Instance (lazy-initialized to avoid race conditions)
 */
let _dashboardRepositoryInstance = null;
Object.defineProperty(window, 'DashboardRepository', {
    get: () => {
        if (!_dashboardRepositoryInstance) {
            _dashboardRepositoryInstance = new DashboardRepository();
        }
        return _dashboardRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
