import { defineStore } from 'pinia';

export const useSalesStore = defineStore('sales', {
  state: () => ({
    summary: null,
    records: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchSummary(period = 'day', date = new Date()) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const data = await $api.sales.getSummary(period, date);
        this.summary = data.summary;
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchRecords() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const data = await $api.sales.getRecords();
        this.records = data;
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createRecord(data) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const record = await $api.sales.create(data);
        this.records.unshift(record);
        return record;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateRecord(id, data) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const updated = await $api.sales.update(id, data);
        const index = this.records.findIndex(r => r.id === id);
        if (index !== -1) {
          this.records[index] = updated;
        }
        return updated;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteRecord(id) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        await $api.sales.delete(id);
        const index = this.records.findIndex(r => r.id === id);
        if (index !== -1) {
          this.records.splice(index, 1);
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