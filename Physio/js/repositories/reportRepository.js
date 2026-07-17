/**
 * ============================================================
 * Lakshmi HIS
 * Report Repository
 * Handles all Report related database operations with Supabase reports table
 * ============================================================
 */

class ReportRepository extends BaseRepository {

    constructor() {
        super("reports");
    }

    _mapToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            id: "id",
            reportName: "report_name",
            reportType: "report_type",
            patientId: "patient_id",
            patientName: "patient_name",
            generatedBy: "generated_by",
            generatedDate: "generated_date",
            totalPatients: "total_patients",
            totalPrescriptions: "total_prescriptions",
            totalMedicines: "total_medicines",
            lowStockAlerts: "low_stock_alerts",
            reportFileUrl: "report_file_url",
            reportStatus: "report_status"
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
            report_name: "reportName",
            report_type: "reportType",
            patient_id: "patientId",
            patient_name: "patientName",
            generated_by: "generatedBy",
            generated_date: "generatedDate",
            total_patients: "totalPatients",
            total_prescriptions: "totalPrescriptions",
            total_medicines: "totalMedicines",
            low_stock_alerts: "lowStockAlerts",
            report_file_url: "reportFileUrl",
            report_status: "reportStatus",
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

    async getAll(orderBy = "created_at", ascending = false, limit = null) {
        let query = this.db
            .from(this.table)
            .select("*")
            .order(orderBy, { ascending });
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
            reportName: "report_name",
            reportType: "report_type",
            patientId: "patient_id",
            patientName: "patient_name",
            generatedBy: "generated_by",
            generatedDate: "generated_date",
            totalPatients: "total_patients",
            totalPrescriptions: "total_prescriptions",
            totalMedicines: "total_medicines",
            lowStockAlerts: "low_stock_alerts",
            reportFileUrl: "report_file_url",
            reportStatus: "report_status"
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
}

/**
 * Global Instance (lazy-initialized to avoid race conditions)
 */
let _reportRepositoryInstance = null;
Object.defineProperty(window, 'ReportRepository', {
    get: () => {
        if (!_reportRepositoryInstance) {
            _reportRepositoryInstance = new ReportRepository();
        }
        return _reportRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
