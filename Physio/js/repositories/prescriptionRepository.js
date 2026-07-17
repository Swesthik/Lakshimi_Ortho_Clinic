/**
 * ============================================================
 * Lakshmi HIS
 * Prescription Repository
 * Handles all Prescription related database operations with Supabase prescriptions table
 * ============================================================
 */

class PrescriptionRepository extends BaseRepository {

    constructor() {
        super("prescriptions");
    }

    _mapToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            id: "id",
            patientId: "patient_id",
            patientName: "patient_name",
            date: "prescription_date",
            doctor: "doctor_name",
            doctorNotes: "doctor_notes",
            medicines: "medicines",
            imageUrls: "image_urls",
            totalItems: "total_items",
            status: "prescription_status"
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
            prescription_date: "date",
            doctor_name: "doctor",
            doctor_notes: "doctorNotes",
            medicines: "medicines",
            image_urls: "imageUrls",
            total_items: "totalItems",
            prescription_status: "status",
            created_at: "createdAt",
            updated_at: "updatedAt"
        };
        for (const [key, val] of Object.entries(data)) {
            const uiKey = fieldMap[key] || key;
            mapped[uiKey] = val;
        }

        // Backward compatibility properties:
        mapped.patientId = mapped.patientId || data.patient_id;
        mapped.patientName = mapped.patientName || data.patient_name;
        mapped.date = mapped.date || data.prescription_date;
        mapped.doctorName = mapped.doctor || data.doctor_name;
        mapped.notes = mapped.doctorNotes || data.doctor_notes;

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
        const dbOrderBy = orderBy === "date" ? "prescription_date" : orderBy;
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

    async getByPatient(patientId) {
        const { data, error } = await this.db
            .from(this.table)
            .select("*")
            .eq("patient_id", patientId);
        this.handleError(error);
        return this._mapToUi(data);
    }

    async getByColumn(column, value) {
        const fieldMap = {
            patientId: "patient_id",
            patientName: "patient_name",
            date: "prescription_date",
            doctor: "doctor_name",
            doctorNotes: "doctor_notes",
            medicines: "medicines",
            imageUrls: "image_urls",
            totalItems: "total_items",
            status: "prescription_status"
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
let _prescriptionRepositoryInstance = null;
Object.defineProperty(window, 'PrescriptionRepository', {
    get: () => {
        if (!_prescriptionRepositoryInstance) {
            _prescriptionRepositoryInstance = new PrescriptionRepository();
        }
        return _prescriptionRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
