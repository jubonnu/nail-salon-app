import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useSalesStore = defineStore('sales', {
  state: () => ({
    summary: {
      totalSales: 0,
      salesTrend: 0,
      targetProgress: 0,
      customerCount: 0,
      customerTrend: 0,
      customerTargetProgress: 0,
      averageTransaction: 0,
      avgTransactionTrend: 0,
      avgTransactionTargetProgress: 0,
      newCustomers: 0,
      newCustomerTrend: 0,
      newCustomerTargetProgress: 0
    },
    records: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchSummary(period = 'day', date = new Date()) {
      this.loading = true;
      try {
        const startDate = dayjs(date).startOf(period).toISOString();
        const endDate = dayjs(date).endOf(period).toISOString();

        // Get sales records for the period
        const { data: salesData, error: salesError } = await supabase
          .from('sales_records')
          .select(`
            *,
            customers (name),
            staff (name),
            appointments (service_type)
          `).order('created_at', { ascending: false })
          .gte('created_at', startDate)
          .lte('created_at', endDate);

        if (salesError) throw salesError;

        // Get previous period data for trends
        const prevStartDate = startDate.subtract(1, period);
        const prevEndDate = endDate.subtract(1, period).toISOString();

        const { data: prevSalesData } = await supabase
          .from('sales_records')
          .select('amount, customer_id')
          .gte('created_at', prevStartDate.toISOString())
          .lte('created_at', prevEndDate);

        // Calculate metrics
        const totalSales = salesData?.reduce((sum, record) => sum + record.amount, 0) || 0;
        const prevTotalSales = prevSalesData?.reduce((sum, record) => sum + record.amount, 0) || 0;
        const salesTrend = prevTotalSales ? Math.round((totalSales - prevTotalSales) / prevTotalSales * 100) : 0;

        const customerCount = new Set(salesData?.map(record => record.customer_id)).size;
        const prevCustomerCount = new Set(prevSalesData?.map(record => record.customer_id)).size;
        const customerTrend = prevCustomerCount ? Math.round((customerCount - prevCustomerCount) / prevCustomerCount * 100) : 0;

        const averageTransaction = customerCount ? Math.round(totalSales / customerCount) : 0;
        const prevAverageTransaction = prevCustomerCount ? Math.round(prevTotalSales / prevCustomerCount) : 0;
        const avgTransactionTrend = prevAverageTransaction ? Math.round((averageTransaction - prevAverageTransaction) / prevAverageTransaction * 100) : 0;

        this.summary = {
          totalSales,
          salesTrend,
          targetProgress: 75,
          customerCount,
          customerTrend,
          customerTargetProgress: 80,
          averageTransaction,
          avgTransactionTrend,
          avgTransactionTargetProgress: 85,
          newCustomers: Math.round(customerCount * 0.3), // Example calculation
          newCustomerTrend: 10,
          newCustomerTargetProgress: 70
        };

        this.records = salesData || [];
        return { summary: this.summary, records: this.records };
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
        const { data, error } = await supabase
          .from('sales_records')
          .select(`
            *,
            customers (name),
            staff (name),
            appointments (service_type)
          `)
          .order('created_at', { ascending: false });

        if (error) throw error;
        this.records = data || [];
        return this.records;
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
        const { data: newRecord, error } = await supabase
          .from('sales_records')
          .insert([data])
          .select(`
            *,
            customers (name),
            staff (name),
            appointments (service_type)
          `)
          .single();

        if (error) throw error;
        this.records.unshift(newRecord);
        return newRecord;
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
        const { data: updated, error } = await supabase
          .from('sales_records')
          .update(data)
          .eq('id', id)
          .select(`
            *,
            customers (name),
            staff (name),
            appointments (service_type)
          `)
          .single();

        if (error) throw error;

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
        const { error } = await supabase
          .from('sales_records')
          .delete()
          .eq('id', id);

        if (error) throw error;

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