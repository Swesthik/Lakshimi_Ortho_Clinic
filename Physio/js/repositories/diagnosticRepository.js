/**
 * ============================================================
 * Lakshmi HIS
 * Diagnostics Repository
 * Handles all Diagnostics related database operations with Supabase diagnostics table
 * ============================================================
 */

class DiagnosticRepository extends BaseRepository {

    constructor() {
        super("diagnostics");
    }

    _mapToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            id: "id",
            patientId: "patient_id",
            patientName: "patient_name",
            category: "category",
            scanDate: "scan_date",
            physician: "physician",
            findings: "findings",
            fileName: "file_name",
            fileUrl: "file_url",
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
            patient_id: "patientId",
            patient_name: "patientName",
            category: "category",
            scan_date: "scanDate",
            physician: "physician",
            findings: "findings",
            file_name: "fileName",
            file_url: "fileUrl",
            report_status: "reportStatus",
            created_at: "createdAt",
            updated_at: "updatedAt"
        };
        for (const [key, val] of Object.entries(data)) {
            const uiKey = fieldMap[key] || key;
            mapped[uiKey] = val;
        }

        // For UI template compatibility:
        mapped.date = data.scan_date;
        mapped.doctorName = data.physician;
        mapped.details = data.findings;
        mapped.dataUrl = data.file_url;
        mapped.fileName = data.file_name;

        if (data.patients && data.patients.name) {
            mapped.patientName = data.patients.name;
        } else if (data.patient_name) {
            mapped.patientName = data.patient_name;
        }

        return mapped;
    }

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

    async getAll(orderBy = "scan_date", ascending = false, limit = null) {
        const dbOrderBy = orderBy === "scanDate" || orderBy === "date" || orderBy === "scan_date" ? "scan_date" : orderBy;
        let query = this.db
            .from(this.table)
            .select("*, patients(name)")
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
            .select("*, patients(name)")
            .eq("id", id)
            .single();
        this.handleError(error);
        return this._mapToUi(data);
    }

    async getByColumn(column, value) {
        const fieldMap = {
            patientId: "patient_id",
            patientName: "patient_name",
            category: "category",
            scanDate: "scan_date",
            physician: "physician",
            findings: "findings",
            fileName: "file_name",
            fileUrl: "file_url",
            reportStatus: "report_status"
        };
        const dbColumn = fieldMap[column] || column;
        const { data, error } = await this.db
            .from(this.table)
            .select("*, patients(name)")
            .eq(dbColumn, value);
        this.handleError(error);
        return this._mapToUi(data);
    }

    async getByPatient(patientId) {
        return await this.getByColumn("patientId", patientId);
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
let _diagnosticRepositoryInstance = null;
Object.defineProperty(window, 'DiagnosticRepository', {
    get: () => {
        if (!_diagnosticRepositoryInstance) {
            _diagnosticRepositoryInstance = new DiagnosticRepository();
        }
        return _diagnosticRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
