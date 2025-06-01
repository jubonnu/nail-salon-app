import { defineStore } from 'pinia';

export const useStaffStore = defineStore('staff', {
  state: () => ({
    staff: [],
    schedules: {},
    performance: {},
    loading: false,
    error: null
  }),

  actions: {
    async fetchStaff() {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const data = await $api.staff.getAll();
        this.staff = data;
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchSchedule(staffId, date) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const data = await $api.staff.getSchedule(staffId, date);
        this.schedules[`${staffId}-${date}`] = data;
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async fetchPerformance(staffId, startDate, endDate) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const data = await $api.staff.getPerformance(staffId, startDate, endDate);
        this.performance[`${staffId}-${startDate}-${endDate}`] = data;
        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createStaff(data) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const staff = await $api.staff.create(data);
        this.staff.push(staff);
        return staff;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async updateStaff(id, data) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        const updated = await $api.staff.update(id, data);
        const index = this.staff.findIndex(s => s.id === id);
        if (index !== -1) {
          this.staff[index] = updated;
        }
        return updated;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteStaff(id) {
      this.loading = true;
      try {
        const { $api } = useNuxtApp();
        await $api.staff.delete(id);
        const index = this.staff.findIndex(s => s.id === id);
        if (index !== -1) {
          this.staff.splice(index, 1);
        }
        // Clear cached data
        Object.keys(this.schedules).forEach(key => {
          if (key.startsWith(`${id}-`)) {
            delete this.schedules[key];
          }
        });
        Object.keys(this.performance).forEach(key => {
          if (key.startsWith(`${id}-`)) {
            delete this.performance[key];
          }
        });
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});