/**
 * ============================================================
 * Lakshmi HIS
 * Profit Analysis Repository
 * Handles all Profit Analysis related database operations with Supabase profit_analysis table
 * ============================================================
 */

class ProfitAnalysisRepository extends BaseRepository {

    constructor() {
        super("profit_analysis");
    }

    _mapToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            id: "id",
            prescriptionId: "prescription_id",
            invoiceId: "invoice_id",
            patientId: "patient_id",
            patientName: "patient_name",
            medicineId: "medicine_id",
            medicineName: "medicine_name",
            quantity: "quantity",
            buyingPrice: "buying_price",
            sellingPrice: "selling_price",
            totalCost: "total_cost",
            totalRevenue: "total_revenue",
            totalProfit: "total_profit",
            profitMargin: "profit_margin",
            soldDate: "sold_date",
            doctorName: "doctor_name"
        };
        for (const [key, val] of Object.entries(data)) {
            if (fieldMap[key] !== undefined) {
                mapped[fieldMap[key]] = val;
            }
        }
        return mapped;
    }

    _mapToUi(data) {
        if (!data) return data;
        if (Array.isArray(data)) {
            return data.map(item => this._mapToUi(item));
        }
        const mapped = {};
        const fieldMap = {
            id: "id",
            prescription_id: "prescriptionId",
            invoice_id: "invoiceId",
            patient_id: "patientId",
            patient_name: "patientName",
            medicine_id: "medicineId",
            medicine_name: "medicineName",
            quantity: "quantity",
            buying_price: "buyingPrice",
            selling_price: "sellingPrice",
            total_cost: "totalCost",
            total_revenue: "totalRevenue",
            total_profit: "totalProfit",
            profit_margin: "profitMargin",
            sold_date: "soldDate",
            doctor_name: "doctorName",
            created_at: "createdAt",
            updated_at: "updatedAt"
        };
        for (const [key, val] of Object.entries(data)) {
            const uiKey = fieldMap[key] || key;
            mapped[uiKey] = val;
        }
        return mapped;
    }

    // CRUD Overrides
    async create(record) {
        const dbRecord = this._mapToDb(record);
        const data = await super.create(dbRecord);
        return this._mapToUi(data);
    }

    async update(id, updates) {
        const dbUpdates = this._mapToDb(updates);
        const data = await super.update(id, dbUpdates);
        return this._mapToUi(data);
    }

    async getAll(orderBy = "sold_date", ascending = false, limit = null) {
        const dbOrderBy = orderBy === "soldDate" ? "sold_date" : orderBy;
        let query = this.db
            .from(this.table)
            .select("*")
            .order(dbOrderBy, { ascending });
        if (limit) {
            query = query.limit(limit);
        }
        const { data, error } = await query;
        this.handleError(error);
        return this._mapToUi(data);
    }

    async getById(id) {
        const { data, error } = await this.db
            .from(this.table)
            .select("*")
            .eq("id", id)
            .single();
        this.handleError(error);
        return this._mapToUi(data);
    }

    async getByColumn(column, value) {
        const fieldMap = {
            id: "id",
            prescriptionId: "prescription_id",
            invoiceId: "invoice_id",
            patientId: "patient_id",
            patientName: "patient_name",
            medicineId: "medicine_id",
            medicineName: "medicine_name",
            quantity: "quantity",
            buyingPrice: "buying_price",
            sellingPrice: "selling_price",
            totalCost: "total_cost",
            totalRevenue: "total_revenue",
            totalProfit: "total_profit",
            profitMargin: "profit_margin",
            soldDate: "sold_date",
            doctorName: "doctor_name"
        };
        const dbColumn = fieldMap[column] || column;
        const { data, error } = await this.db
            .from(this.table)
            .select("*")
            .eq(dbColumn, value);
        this.handleError(error);
        return this._mapToUi(data);
    }

    async count() {
        const { count, error } = await this.db
            .from(this.table)
            .select("*", { count: "exact", head: true });
        this.handleError(error);
        return count;
    }

    // Helper Methods
    async getTransactions() {
        return this.getAll();
    }

    async getTransactionsByDate(fromDate, toDate) {
        let query = this.db
            .from(this.table)
            .select("*")
            .order("sold_date", { ascending: false });
        if (fromDate) {
            query = query.gte("sold_date", fromDate);
        }
        if (toDate) {
            query = query.lte("sold_date", toDate);
        }
        const { data, error } = await query;
        this.handleError(error);
        return this._mapToUi(data);
    }

    async getMedicineSummary(fromDate, toDate) {
        const txs = await this.getTransactionsByDate(fromDate, toDate);
        const agg = {};
        txs.forEach(t => {
            if (!t.medicineId) return;
            if (!agg[t.medicineId]) {
                agg[t.medicineId] = { medicineId: t.medicineId, name: t.medicineName, qty: 0, revenue: 0, cost: 0, profit: 0 };
            }
            agg[t.medicineId].qty += t.quantity || 0;
            agg[t.medicineId].revenue += t.totalRevenue || 0;
            agg[t.medicineId].cost += t.totalCost || 0;
            agg[t.medicineId].profit += t.totalProfit || 0;
        });
        return Object.values(agg);
    }

    async getSummary(fromDate = null, toDate = null) {
        const txs = await this.getTransactionsByDate(fromDate, toDate);
        const res = window.MedicineProfitService.calculate(txs);
        return {
            totalRevenue: res.medicineRevenue,
            totalCost: res.medicineCost,
            totalProfit: res.medicineProfit,
            profitMargin: res.profitMargin,
            unitsSold: res.unitsSold,
            prescriptionLines: res.prescriptionLines
        };
    }

    async getDashboardSummary(fromDate = null, toDate = null) {
        return this.getSummary(fromDate, toDate);
    }

    async getRevenueChartData(fromDate, toDate) {
        const txs = await this.getTransactionsByDate(fromDate, toDate);
        const agg = {};
        txs.forEach(t => {
            const d = t.soldDate;
            if (!d) return;
            if (!agg[d]) {
                agg[d] = { date: d, revenue: 0, cost: 0, profit: 0 };
            }
            agg[d].revenue += t.totalRevenue || 0;
            agg[d].cost += t.totalCost || 0;
            agg[d].profit += t.totalProfit || 0;
        });
        return Object.values(agg).sort((a, b) => a.date.localeCompare(b.date));
    }

    async getTopMedicines(fromDate, toDate, limitCount = 5) {
        const summary = await this.getMedicineSummary(fromDate, toDate);
        return summary
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limitCount);
    }
}

/**
 * Global Instance (lazy-initialized to avoid race conditions)
 */
let _profitAnalysisRepositoryInstance = null;
Object.defineProperty(window, 'ProfitAnalysisRepository', {
    get: () => {
        if (!_profitAnalysisRepositoryInstance) {
            _profitAnalysisRepositoryInstance = new ProfitAnalysisRepository();
        }
        return _profitAnalysisRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
