/**
 * ============================================================
 * Lakshmi HIS
 * Rehab & Physiotherapy Repository
 * Handles all Rehab Program database operations with Supabase rehab_programs table
 * ============================================================
 */

class RehabRepository extends BaseRepository {

    constructor() {
        super("rehab_programs");
    }

    _mapPlanToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            id: "id",
            patientId: "patient_id",
            name: "program_name",
            status: "program_status",
            sessionsTotal: "total_sessions",
            sessionsCompleted: "completed_sessions",
            sessionDuration: "session_duration",
            assignedTherapist: "assigned_therapist",
            goals: "rehab_goals",
            startDate: "start_date",
            endDate: "end_date"
        };
        for (const [key, val] of Object.entries(data)) {
            if (fieldMap[key]) {
                mapped[fieldMap[key]] = val;
            }
        }
        
        if (!mapped.start_date) {
            mapped.start_date = new Date().toISOString().split('T')[0];
        }
        
        return mapped;
    }

    _mapPlanToUi(data) {
        if (!data) return data;
        if (Array.isArray(data)) {
            return data.map(item => this._mapPlanToUi(item));
        }
        const mapped = {};
        const fieldMap = {
            id: "id",
            patient_id: "patientId",
            program_name: "name",
            program_status: "status",
            total_sessions: "sessionsTotal",
            completed_sessions: "sessionsCompleted",
            session_duration: "sessionDuration",
            assigned_therapist: "assignedTherapist",
            rehab_goals: "goals",
            start_date: "startDate",
            end_date: "endDate",
            created_at: "createdAt"
        };
        for (const [key, val] of Object.entries(data)) {
            const uiKey = fieldMap[key] || key;
            mapped[uiKey] = val;
        }

        // Support both styles of variables for safety
        mapped.patientId = data.patient_id;
        mapped.sessionsTotal = data.total_sessions;
        mapped.sessionsCompleted = data.completed_sessions;
        mapped.sessionDuration = data.session_duration;
        mapped.assignedTherapist = data.assigned_therapist;
        mapped.goals = data.rehab_goals;

        if (data.patients && data.patients.name) {
            mapped.patientName = data.patients.name;
        } else if (data.patient_name) {
            mapped.patientName = data.patient_name;
        }
        return mapped;
    }

    // Plans CRUD
    async create(record) {
        const dbRecord = this._mapPlanToDb(record);
        const data = await super.create(dbRecord);
        return this._mapPlanToUi(data);
    }

    async update(id, updates) {
        const dbUpdates = this._mapPlanToDb(updates);
        const data = await super.update(id, dbUpdates);
        return this._mapPlanToUi(data);
    }

    async getAll(orderBy = "created_at", ascending = false, limit = null) {
        let query = this.db
            .from(this.table)
            .select("*, patients(name)")
            .order(orderBy, { ascending });
        if (limit) {
            query = query.limit(limit);
        }
        const { data, error } = await query;
        this.handleError(error);
        return this._mapPlanToUi(data);
    }

    async getById(id) {
        const { data, error } = await this.db
            .from(this.table)
            .select("*, patients(name)")
            .eq("id", id)
            .single();
        this.handleError(error);
        return this._mapPlanToUi(data);
    }

    async getByPatient(patientId) {
        const { data, error } = await this.db
            .from(this.table)
            .select("*, patients(name)")
            .eq("patient_id", patientId);
        this.handleError(error);
        return this._mapPlanToUi(data);
    }

}

/**
 * Global Instance (lazy-initialized to avoid race conditions)
 */
let _rehabRepositoryInstance = null;
Object.defineProperty(window, 'RehabRepository', {
    get: () => {
        if (!_rehabRepositoryInstance) {
            _rehabRepositoryInstance = new RehabRepository();
        }
        return _rehabRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
