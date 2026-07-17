/**
 * ============================================================
 * Lakshmi HIS
 * Surgery Repository
 * Handles all Surgery related database operations with Supabase surgeries table
 * ============================================================
 */

class SurgeryRepository extends BaseRepository {

    constructor() {
        super("surgeries");
    }

    _mapToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            id: "id",
            patientId: "patient_id",
            type: "surgery_type",
            date: "surgery_date",
            surgeon: "lead_surgeon",
            status: "case_status",
            implantUsed: "implant_used",
            followUpVisits: "follow_up_schedule",
            rehabNotes: "rehab_notes",
            recoveryProgress: "recovery_progress",
            dischargeStatus: "discharge_status"
        };
        for (const [key, val] of Object.entries(data)) {
            if (fieldMap[key] !== undefined) {
                let dbVal = val;
                if (key === "recoveryProgress") {
                    if (dbVal === "" || dbVal === undefined || dbVal === null) {
                        dbVal = 0;
                    } else {
                        const parsed = parseInt(dbVal, 10);
                        dbVal = isNaN(parsed) ? 0 : parsed;
                    }
                }
                mapped[fieldMap[key]] = dbVal;
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
            surgery_type: "type",
            surgery_date: "date",
            lead_surgeon: "surgeon",
            case_status: "status",
            implant_used: "implantUsed",
            follow_up_schedule: "followUpVisits",
            rehab_notes: "rehabNotes",
            recovery_progress: "recoveryProgress",
            discharge_status: "dischargeStatus",
            created_at: "createdAt"
        };
        for (const [key, val] of Object.entries(data)) {
            const uiKey = fieldMap[key] || key;
            mapped[uiKey] = val;
        }

        // Support both styles of variables for safety
        mapped.patientId = data.patient_id;
        mapped.patientName = data.patient_name;
        mapped.type = data.surgery_type;
        mapped.date = data.surgery_date;
        mapped.surgeon = data.lead_surgeon;
        mapped.status = data.case_status;
        mapped.implantUsed = data.implant_used;
        mapped.followUpVisits = data.follow_up_schedule;
        mapped.recoveryProgress = (data.recovery_progress === undefined || data.recovery_progress === null || data.recovery_progress === "") ? 0 : data.recovery_progress;

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

    async getAll(orderBy = "surgery_date", ascending = false, limit = null) {
        const dbOrderBy = orderBy === "date" || orderBy === "surgeryDate" || orderBy === "surgery_date" ? "surgery_date" : orderBy;
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
            type: "surgery_type",
            surgeryType: "surgery_type",
            date: "surgery_date",
            surgeryDate: "surgery_date",
            surgeon: "lead_surgeon",
            leadSurgeon: "lead_surgeon",
            status: "case_status",
            caseStatus: "case_status",
            implantUsed: "implant_used",
            followUpVisits: "follow_up_schedule",
            followUpSchedule: "follow_up_schedule",
            rehabNotes: "rehab_notes",
            recoveryProgress: "recovery_progress",
            dischargeStatus: "discharge_status"
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

}

/**
 * Global Instance (lazy-initialized to avoid race conditions)
 */
let _surgeryRepositoryInstance = null;
Object.defineProperty(window, 'SurgeryRepository', {
    get: () => {
        if (!_surgeryRepositoryInstance) {
            _surgeryRepositoryInstance = new SurgeryRepository();
        }
        return _surgeryRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
