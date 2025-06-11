import { defineStore } from "pinia";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useCustomerStore = defineStore("customers", {
    state: () => ({
        customers: [],
        loading: false,
        error: null,
    }),

    actions: {
        async fetchCustomers() {
            this.loading = true;
            try {
                const { data, error } = await supabase
                    .from("customers")
                    .select("*")
                    .order("created_at", { ascending: false });

                if (error) throw error;
                this.customers = data || [];
                return this.customers;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async createCustomer(data) {
            this.loading = true;
            try {
                const { data: newCustomer, error } = await supabase
                    .from("customers")
                    .insert([data])
                    .select()
                    .single();

                if (error) throw error;
                this.customers.unshift(newCustomer);
                return newCustomer;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async updateCustomer(id, data) {
            this.loading = true;
            try {
                const { data: updated, error } = await supabase
                    .from("customers")
                    .update(data)
                    .eq("id", id)
                    .select()
                    .single();

                if (error) throw error;
                const index = this.customers.findIndex((c) => c.id === id);
                if (index !== -1) {
                    this.customers[index] = updated;
                }
                return updated;
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },

        async deleteCustomer(id) {
            this.loading = true;
            try {
                const { error } = await supabase
                    .from("customers")
                    .delete()
                    .eq("id", id);

                if (error) throw error;
                const index = this.customers.findIndex((c) => c.id === id);
                if (index !== -1) {
                    this.customers.splice(index, 1);
                }
            } catch (error) {
                this.error = error.message;
                throw error;
            } finally {
                this.loading = false;
            }
        },
    },
});
