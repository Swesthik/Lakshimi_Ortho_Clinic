/**
 * ============================================================
 * Lakshmi HIS
 * Medicines Repository
 * Handles all Medicine related database operations with Supabase medicines table
 * ============================================================
 */

class MedicineRepository extends BaseRepository {

    constructor() {
        super("medicines");
    }

    _mapToDb(data) {
        if (!data) return data;
        const mapped = {};
        const fieldMap = {
            id: "id",
            name: "medicine_name",
            medicineName: "medicine_name",
            unit: "unit",
            buyingPrice: "buying_price",
            sellingPrice: "selling_price",
            totalQty: "total_quantity",
            totalQuantity: "total_quantity",
            availableQty: "available_quantity",
            availableQuantity: "available_quantity",
            stockLevel: "stock_level",
            stockStatus: "stock_status"
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
            medicine_name: "medicineName",
            unit: "unit",
            buying_price: "buyingPrice",
            selling_price: "sellingPrice",
            total_quantity: "totalQuantity",
            available_quantity: "availableQuantity",
            stock_level: "stockLevel",
            stock_status: "stockStatus",
            created_at: "createdAt",
            updated_at: "updatedAt"
        };
        for (const [key, val] of Object.entries(data)) {
            const uiKey = fieldMap[key] || key;
            mapped[uiKey] = val;
        }

        // For UI template backward compatibility:
        mapped.name = data.medicine_name;
        mapped.totalQty = data.total_quantity;
        mapped.availableQty = data.available_quantity;
        mapped.price = data.selling_price; // price = sellingPrice

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

    async getAll(orderBy = "medicine_name", ascending = true, limit = null) {
        const dbOrderBy = orderBy === "name" || orderBy === "medicineName" || orderBy === "medicine_name" ? "medicine_name" : orderBy;
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
            medicineName: "medicine_name",
            name: "medicine_name",
            unit: "unit",
            buyingPrice: "buying_price",
            sellingPrice: "selling_price",
            totalQuantity: "total_quantity",
            totalQty: "total_quantity",
            availableQuantity: "available_quantity",
            availableQty: "available_quantity",
            stockLevel: "stock_level",
            stockStatus: "stock_status"
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
let _medicineRepositoryInstance = null;
Object.defineProperty(window, 'MedicineRepository', {
    get: () => {
        if (!_medicineRepositoryInstance) {
            _medicineRepositoryInstance = new MedicineRepository();
        }
        return _medicineRepositoryInstance;
    },
    configurable: true,
    enumerable: true
});
