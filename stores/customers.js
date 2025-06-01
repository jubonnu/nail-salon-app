import { defineStore } from 'pinia';

export const useCustomerStore = defineStore('customers', {
  state: () => ({
    customers: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchCustomers() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const data = await $api.customers.getAll();
        this.customers = data;
        return data;
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
        const { $api } = useNuxtApp();
        const customer = await $api.customers.create(data);
        this.customers.unshift(customer);
        return customer;
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
        const { $api } = useNuxtApp();
        const updated = await $api.customers.update(id, data);
        const index = this.customers.findIndex(c => c.id === id);
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
        const { $api } = useNuxtApp();
        await $api.customers.delete(id);
        const index = this.customers.findIndex(c => c.id === id);
        if (index !== -1) {
          this.customers.splice(index, 1);
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});