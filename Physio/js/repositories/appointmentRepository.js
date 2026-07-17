/**
 * ============================================================
 * Lakshmi HIS
 * Appointment Repository
 * Handles all Appointment related database operations
 * ============================================================
 */

class AppointmentRepository extends BaseRepository {

    constructor() {
        super("appointments");
    }

    _mapToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            id: "id",
            appointmentCode: "appointment_code",
            patientId: "patient_id",
            appointmentDate: "appointment_date",
            date: "appointment_date",
            appointmentTime: "appointment_time",
            time: "appointment_time",
            consultationType: "consultation_type",
            type: "consultation_type",
            status: "status",
            notes: "notes",
            note: "notes",
            isActive: "is_active"
        };
        for (const [key, val] of Object.entries(data)) {
            if (fieldMap[key]) {
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
            appointment_code: "appointmentCode",
            patient_id: "patientId",
            appointment_date: "appointmentDate",
            appointment_time: "appointmentTime",
            consultation_type: "consultationType",
            status: "status",
            notes: "notes",
            is_active: "isActive"
        };
        for (const [key, val] of Object.entries(data)) {
            const uiKey = fieldMap[key] || key;
            mapped[uiKey] = val;
        }
        
        // For compatibility with the existing frontend templates:
        mapped.date = data.appointment_date;
        mapped.time = data.appointment_time;
        mapped.type = data.consultation_type;
        mapped.note = data.notes;
        
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

    async getAll(orderBy = "appointment_date", ascending = false, limit = null) {
        let query = this.db
            .from(this.table)
            .select("*, patients(name)")
            .order("appointment_date", { ascending: false })
            .order("appointment_time", { ascending: true });
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
        const dbColumn = column === "date" || column === "appointmentDate" ? "appointment_date" : (column === "patientId" ? "patient_id" : column);
        const { data, error } = await this.db
            .from(this.table)
            .select("*, patients(name)")
            .eq(dbColumn, value);
        this.handleError(error);
        return this._mapToUi(data);
    }

    async search(column, value) {
        const { data, error } = await this.db
            .from(this.table)
            .select("*, patients(name)")
            .ilike(column, `%${value}%`);
        this.handleError(error);
        return this._mapToUi(data);
    }

    async getTodayAppointments() {
        const today = new Date().toISOString().split("T")[0];
        return await this.getAppointmentsByDate(today);
    }

    async getAppointmentsByDate(date) {
        const { data, error } = await this.db
            .from(this.table)
            .select("*, patients(name)")
            .eq("appointment_date", date)
            .order("appointment_time", { ascending: true });
        this.handleError(error);
        return this._mapToUi(data);
    }

    async getAppointmentsByWeek(startDate, endDate) {
        const { data, error } = await this.db
            .from(this.table)
            .select("*, patients(name)")
            .gte("appointment_date", startDate)
            .lte("appointment_date", endDate)
            .order("appointment_date", { ascending: true })
            .order("appointment_time", { ascending: true });
        this.handleError(error);
        return this._mapToUi(data);
    }

}

/**
 * Global Instance (lazy-initialized to avoid race conditions)
 */
let _appointmentRepositoryInstance = null;
Object.defineProperty(window, 'AppointmentRepository', {
    get: () => {
        if (!_appointmentRepositoryInstance) {
            _appointmentRepositoryInstance = new AppointmentRepository();
        }
        return _appointmentRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
