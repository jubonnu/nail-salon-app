import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useStaffStore = defineStore('staff', {
  state: () => ({
    staff: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchStaff() {
      this.loading = true;
      try {
        const { data, error } = await supabase
          .from('staff')
          .select('*')
          .order('name');

        if (error) throw error;
        this.staff = data || [];
        return this.staff;
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
        const { data: newStaff, error } = await supabase
          .from('staff')
          .insert([data])
          .select()
          .single();

        if (error) throw error;
        this.staff.push(newStaff);
        return newStaff;
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
        const { data: updated, error } = await supabase
          .from('staff')
          .update(data)
          .eq('id', id)
          .select()
          .single();

        if (error) throw error;
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
        const { error } = await supabase
          .from('staff')
          .delete()
          .eq('id', id);

        if (error) throw error;
        const index = this.staff.findIndex(s => s.id === id);
        if (index !== -1) {
          this.staff.splice(index, 1);
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