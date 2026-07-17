/**
 * ============================================================
 * Lakshmi HIS
 * Patient Repository
 * Handles all Patient related database operations
 * ============================================================
 */

class PatientRepository extends BaseRepository {

    constructor() {
        super("patients");
    }

    _mapToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            name: "name",
            age: "age",
            gender: "gender",
            mobile: "mobile",
            address: "address",
            condition: "condition",
            diagnosis: "diagnosis",
            dateOfVisit: "date_of_visit",
            notes: "notes",
            chiefComplaint: "chief_complaint",
            painScore: "pain_score",
            injuryType: "injury_type",
            injuryLocation: "injury_location",
            durationSymptoms: "duration_symptoms",
            prevTreatment: "previous_treatment",
            surgicalHistory: "surgical_history",
            coMorbidities: "co_morbidities",
            rom: "rom",
            muscleStrength: "muscle_strength",
            funcLimit: "functional_limitation",
            gaitAssessment: "gait_assessment",
            isActive: "is_active"
            // Note: patientCode is a client-side computed display field only.
            // It is NOT stored in the database. Do not add it here.
        };
        for (const [key, val] of Object.entries(data)) {
            const dbKey = fieldMap[key] || key;
            mapped[dbKey] = val;
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
            name: "name",
            age: "age",
            gender: "gender",
            mobile: "mobile",
            address: "address",
            condition: "condition",
            diagnosis: "diagnosis",
            date_of_visit: "dateOfVisit",
            notes: "notes",
            chief_complaint: "chiefComplaint",
            pain_score: "painScore",
            injury_type: "injuryType",
            injury_location: "injuryLocation",
            duration_symptoms: "durationSymptoms",
            previous_treatment: "prevTreatment",
            surgical_history: "surgicalHistory",
            co_morbidities: "coMorbidities",
            rom: "rom",
            muscle_strength: "muscleStrength",
            functional_limitation: "funcLimit",
            gait_assessment: "gaitAssessment",
            is_active: "isActive",
            patient_code: "patientCode"
        };
        for (const [key, val] of Object.entries(data)) {
            const uiKey = fieldMap[key] || key;
            mapped[uiKey] = val;
        }
        return mapped;
    }

    async generateNextId() {
        const patients = await this.getAll("created_at", true);
        let maxId = 0;
        patients.forEach(p => {
            const idInt = parseInt(p.id, 10);
            if (!isNaN(idInt) && idInt > maxId) {
                maxId = idInt;
            }
        });
        return String(maxId + 1).padStart(4, '0');
    }

    /**
     * Generate next sequential Patient Code (0001, 0002 ...)
     * Never touches the internal id.
     */
    async generateNextPatientCode() {
        const patients = await this.getAll("created_at", true);
        let maxCode = 0;
        patients.forEach(p => {
            const code = p.patientCode;
            if (code && typeof code === 'string' && /^\d+$/.test(code)) {
                const n = parseInt(code, 10);
                if (!isNaN(n) && n > maxCode) maxCode = n;
            }
        });
        return String(maxCode + 1).padStart(4, '0');
    }

    async create(record) {
        if (!record.id) {
            record.id = await this.generateNextId();
        }
        // patientCode is client-side computed — do NOT store in DB
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
        const dbOrderBy = orderBy === "dateOfVisit" ? "date_of_visit" : (orderBy === "createdAt" ? "created_at" : orderBy);
        const data = await super.getAll(dbOrderBy, ascending, limit);
        const mapped = this._mapToUi(data);

        // Assign client-side patientCode: sort all patients chronologically
        // and number them 0001, 0002... This is a display-only field.
        if (Array.isArray(mapped) && !limit) {
            // Sort ascending by created_at to assign stable sequential codes
            const sorted = [...mapped].sort((a, b) => {
                const ta = new Date(a.createdAt || a.dateOfVisit || 0).getTime();
                const tb = new Date(b.createdAt || b.dateOfVisit || 0).getTime();
                return ta - tb || String(a.id).localeCompare(String(b.id));
            });
            const codeMap = new Map();
            sorted.forEach((p, i) => codeMap.set(p.id, String(i + 1).padStart(4, '0')));
            mapped.forEach(p => { p.patientCode = codeMap.get(p.id) || p.patientCode || String(p.id); });
        }

        return mapped;
    }

    async getById(id) {
        const data = await super.getById(id);
        return this._mapToUi(data);
    }

    async getByColumn(column, value) {
        const dbColumn = column === "dateOfVisit" ? "date_of_visit" : column;
        const data = await super.getByColumn(dbColumn, value);
        return this._mapToUi(data);
    }

    async search(column, value) {
        const dbColumn = column === "dateOfVisit" ? "date_of_visit" : column;
        const data = await super.search(dbColumn, value);
        return this._mapToUi(data);
    }

    /**
     * Get patient by Patient Code
     */
    async getByPatientCode(patientCode) {
        const data = await this.getByColumn("patient_code", patientCode);
        return data.length ? data[0] : null;
    }

    /**
     * Get patient by Mobile Number
     */
    async getByMobile(mobile) {
        const data = await this.getByColumn("mobile", mobile);
        return data.length ? data[0] : null;
    }

    /**
     * Check duplicate mobile number
     */
    async mobileExists(mobile) {
        return await this.exists("mobile", mobile);
    }

    /**
     * Search patients by Name
     */
    async searchByName(name) {
        return await this.search("name", name);
    }

    /**
     * Search patients by Diagnosis
     */
    async searchByDiagnosis(diagnosis) {
        return await this.search("diagnosis", diagnosis);
    }

    /**
     * Search patients by Condition
     */
    async searchByCondition(condition) {
        return await this.search("condition", condition);
    }

    /**
     * Get today's patients
     */
    async getTodaysPatients() {

        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await this.db
            .from(this.table)
            .select("*")
            .eq("date_of_visit", today)
            .order("created_at", { ascending: false });

        this.handleError(error);

        return this._mapToUi(data);
    }

    /**
     * Get Active Patients
     */
    async getActivePatients() {

        const { data, error } = await this.db
            .from(this.table)
            .select("*")
            .eq("is_active", true)
            .order("created_at", { ascending: false });

        this.handleError(error);

        return this._mapToUi(data);
    }

    /**
     * Get Recent Patients
     */
    async getRecentPatients(limit = 10) {
        return await this.getAll("created_at", false, limit);
    }

}

/**
 * Global Instance
 */

let _patientRepositoryInstance = null;
Object.defineProperty(window, 'PatientRepository', {
    get: () => {
        if (!_patientRepositoryInstance) {
            _patientRepositoryInstance = new PatientRepository();
        }
        return _patientRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});