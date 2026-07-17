/**
 * ============================================================
 * Lakshmi HIS
 * Invoice Repository
 * Handles all Invoice related database operations with Supabase invoices table
 * ============================================================
 */

class InvoiceRepository extends BaseRepository {

    constructor() {
        super("invoices");
    }

    _mapToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            id: "id",
            invoiceNumber: "invoice_number",
            patientId: "patient_id",
            patientName: "patient_name",
            invoiceDate: "invoice_date",
            consultationFee: "consultation_fee",
            pharmacyFee: "pharmacy_fee",
            therapyFee: "therapy_fee",
            surgeryFee: "surgery_fee",
            totalAmount: "total_amount",
            paidAmount: "paid_amount",
            balanceDue: "balance_due",
            paymentMethod: "payment_method",
            paymentStatus: "payment_status",
            notes: "notes"
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
            invoice_number: "invoiceNumber",
            patient_id: "patientId",
            patient_name: "patientName",
            invoice_date: "invoiceDate",
            consultation_fee: "consultationFee",
            pharmacy_fee: "pharmacyFee",
            therapy_fee: "therapyFee",
            surgery_fee: "surgeryFee",
            total_amount: "totalAmount",
            paid_amount: "paidAmount",
            balance_due: "balanceDue",
            payment_method: "paymentMethod",
            payment_status: "paymentStatus",
            notes: "notes",
            created_at: "createdAt",
            updated_at: "updatedAt"
        };
        for (const [key, val] of Object.entries(data)) {
            const uiKey = fieldMap[key] || key;
            mapped[uiKey] = val;
        }

        // Backward compatibility mappings:
        mapped.patientId = mapped.patientId || data.patient_id;
        mapped.patientName = mapped.patientName || data.patient_name;
        mapped.invoiceNo = mapped.invoiceNumber || data.invoice_number;
        mapped.date = mapped.invoiceDate || data.invoice_date;
        
        mapped.consultCharges = mapped.consultationFee || data.consultation_fee || 0;
        mapped.medicineCharges = mapped.pharmacyFee || data.pharmacy_fee || 0;
        mapped.therapyCharges = mapped.therapyFee || data.therapy_fee || 0;
        mapped.surgeryCharges = mapped.surgeryFee || data.surgery_fee || 0;
        
        mapped.totalAmount = mapped.totalAmount || data.total_amount || 0;
        mapped.paidAmount = mapped.paidAmount || data.paid_amount || 0;
        mapped.balanceDue = mapped.balanceDue || data.balance_due || 0;
        mapped.status = mapped.paymentStatus || data.payment_status || 'Unpaid';

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
        const dbOrderBy = orderBy === "invoiceDate" ? "invoice_date" : orderBy;
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
            id: "id",
            invoiceNumber: "invoice_number",
            patientId: "patient_id",
            patientName: "patient_name",
            invoiceDate: "invoice_date",
            consultationFee: "consultation_fee",
            pharmacyFee: "pharmacy_fee",
            therapyFee: "therapy_fee",
            surgeryFee: "surgery_fee",
            totalAmount: "total_amount",
            paidAmount: "paid_amount",
            balanceDue: "balance_due",
            paymentMethod: "payment_method",
            paymentStatus: "payment_status",
            notes: "notes"
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
let _invoiceRepositoryInstance = null;
Object.defineProperty(window, 'InvoiceRepository', {
    get: () => {
        if (!_invoiceRepositoryInstance) {
            _invoiceRepositoryInstance = new InvoiceRepository();
        }
        return _invoiceRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
