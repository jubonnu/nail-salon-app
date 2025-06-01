import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useCounselingStore = defineStore('counseling', {
  state: () => ({
    counselingSheets: [],
    loading: false,
    error: null
  }),
  
  getters: {
    newSheets: (state) => state.counselingSheets.filter(sheet => sheet.status === 'New'),
    processedSheets: (state) => state.counselingSheets.filter(sheet => sheet.status === 'Processed'),
    archivedSheets: (state) => state.counselingSheets.filter(sheet => sheet.status === 'Archived'),
  },
  
  actions: {
    async fetchCounselingSheets() {
      this.loading = true;
      this.error = null;
      
      try {
        const { data, error } = await supabase
          .from('counseling_sheets')
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        this.counselingSheets = data || [];
        return this.counselingSheets;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async processSheet(sheetId) {
      this.loading = true;
      try {
        const { data, error } = await supabase
          .from('counseling_sheets')
          .update({ status: 'Processed' })
          .eq('id', sheetId)
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)
          .single();

        if (error) throw error;

        const index = this.counselingSheets.findIndex(s => s.id === sheetId);
        if (index !== -1) {
          this.counselingSheets[index] = data;
        }

        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async archiveSheet(sheetId) {
      this.loading = true;
      try {
        const { data, error } = await supabase
          .from('counseling_sheets')
          .update({ status: 'Archived' })
          .eq('id', sheetId)
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)
          .single();

        if (error) throw error;

        const index = this.counselingSheets.findIndex(s => s.id === sheetId);
        if (index !== -1) {
          this.counselingSheets[index] = data;
        }

        return data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteSheet(sheetId) {
      this.loading = true;
      try {
        const { error } = await supabase
          .from('counseling_sheets')
          .delete()
          .eq('id', sheetId);

        if (error) throw error;

        const index = this.counselingSheets.findIndex(s => s.id === sheetId);
        if (index !== -1) {
          this.counselingSheets.splice(index, 1);
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createSheet(data) {
      this.loading = true;
      try {
        const { data: newSheet, error } = await supabase
          .from('counseling_sheets')
          .insert([data])
          .select(`
            *,
            customers (
              name,
              email,
              phone
            )
          `)
          .single();

        if (error) throw error;
        this.counselingSheets.unshift(newSheet);
        return newSheet;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});