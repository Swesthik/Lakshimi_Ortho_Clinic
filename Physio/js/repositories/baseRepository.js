/**
 * ============================================================
 * Lakshmi HIS
 * Base Repository
 * Shared CRUD operations for all Supabase tables
 * ============================================================
 */

class BaseRepository {

    constructor(tableName) {
        this.table = tableName;
        this.db = window.supabaseClient;

        console.log("Constructor called");
        console.log("this.db =", this.db);
        console.log("this.db.from =", this.db.from);
    }

    /**
     * Common Error Handler
     */
    handleError(error) {
        if (error) {
            console.error(`[${this.table}]`, error);
            throw error;
        }
    }

    /**
     * Get all records
     */
    async getAll(orderBy = "created_at", ascending = false, limit = null) {
        
        console.log("Inside getAll()");
        console.log("this =", this);
        console.log("this.db =", this.db);
        console.log("this.db.from =", this.db.from);

        let query = this.db
            .from(this.table)
            .select("*")
            .order(orderBy, { ascending });

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        this.handleError(error);

        return data;
    }

    /**
     * Get record by ID
     */
    async getById(id) {

        const { data, error } = await this.db
            .from(this.table)
            .select("*")
            .eq("id", id)
            .single();

        this.handleError(error);

        return data;
    }

    /**
     * Get records by column
     */
    async getByColumn(column, value) {

        const { data, error } = await this.db
            .from(this.table)
            .select("*")
            .eq(column, value);

        this.handleError(error);

        return data;
    }

    /**
     * Create new record
     */
    async create(record) {

        const { data, error } = await this.db
            .from(this.table)
            .insert(record)
            .select()
            .single();

        this.handleError(error);

        return data;
    }

    /**
     * Update record
     */
    async update(id, updates) {

        const { data, error } = await this.db
            .from(this.table)
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        this.handleError(error);

        return data;
    }

    /**
     * Delete record
     */
    async delete(id) {

        const { error } = await this.db
            .from(this.table)
            .delete()
            .eq("id", id);

        this.handleError(error);

        return true;
    }

    /**
     * Count records
     */
    async count() {

        const { count, error } = await this.db
            .from(this.table)
            .select("*", {
                count: "exact",
                head: true
            });

        this.handleError(error);

        return count;
    }

    /**
     * Search records
     */
    async search(column, value) {

        const { data, error } = await this.db
            .from(this.table)
            .select("*")
            .ilike(column, `%${value}%`);

        this.handleError(error);

        return data;
    }

    /**
     * Check if a record exists
     */
    async exists(column, value) {

        const { count, error } = await this.db
            .from(this.table)
            .select("*", {
                count: "exact",
                head: true
            })
            .eq(column, value);

        this.handleError(error);

        return count > 0;
    }

}

window.BaseRepository = BaseRepository;