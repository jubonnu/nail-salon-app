import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js';
import dayjs from 'dayjs';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);

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
        // Calculate current period dates
        const currentPeriod = {
          start: dayjs(date).startOf(period),
          end: dayjs(date).endOf(period)
        };

        // Calculate previous period dates
        const previousPeriod = {
          start: currentPeriod.start.subtract(1, period),
          end: currentPeriod.end.subtract(1, period)
        };

        // Get sales records for the period
        const { data: salesData, error: salesError } = await supabase
          .from('sales_records')
          .select('*')
          .gte('created_at', currentPeriod.start.toISOString())
          .lte('created_at', currentPeriod.end.toISOString())
          .order('created_at', { ascending: false });

        if (salesError) throw salesError;

        // Get previous period sales data
        const { data: prevSalesData } = await supabase
          .from('sales_records')
          .select('*')
          .gte('created_at', previousPeriod.start.toISOString())
          .lte('created_at', previousPeriod.end.toISOString());

        // Ensure we have arrays to work with
        const currentSales = salesData || [];
        const previousSales = prevSalesData || [];

        // Calculate metrics
        const totalSales = currentSales.reduce((sum, record) => sum + (record.amount || 0), 0);
        const prevTotalSales = previousSales.reduce((sum, record) => sum + (record.amount || 0), 0);
        const salesTrend = prevTotalSales ? Math.round((totalSales - prevTotalSales) / prevTotalSales * 100) : 0;

        // Calculate unique customers
        const uniqueCustomers = new Set(currentSales.map(record => record.customer_id));
        const customerCount = uniqueCustomers.size;
        const prevUniqueCustomers = new Set(previousSales.map(record => record.customer_id));
        const prevCustomerCount = prevUniqueCustomers.size;
        const customerTrend = prevCustomerCount ? Math.round((customerCount - prevCustomerCount) / prevCustomerCount * 100) : 0;

        // Calculate average transaction value
        const averageTransaction = currentSales.length ? Math.round(totalSales / currentSales.length) : 0;
        const prevAverageTransaction = previousSales.length ? Math.round(prevTotalSales / previousSales.length) : 0;
        const avgTransactionTrend = prevAverageTransaction ? Math.round((averageTransaction - prevAverageTransaction) / prevAverageTransaction * 100) : 0;

        // Get all customer IDs from previous periods
        const { data: allPreviousCustomers } = await supabase
          .from('sales_records')
          .select('customer_id, created_at')
          .lt('created_at', currentPeriod.start.toISOString())
          .order('created_at', { ascending: true });

        const previousCustomerIds = new Set();
        allPreviousCustomers?.forEach(record => {
          if (record.customer_id) {
            previousCustomerIds.add(record.customer_id);
          }
        });
        
        // Calculate new customers (customers who made their first purchase in this period)
        const newCustomers = currentSales.reduce((count, record) => {
          if (record.customer_id && !previousCustomerIds.has(record.customer_id)) {
            previousCustomerIds.add(record.customer_id); // Add to set so we don't count the same customer twice
            return count + 1;
          }
          return count;
        }, 0);

        const prevNewCustomers = previousSales.reduce((count, record) => {
          if (record.customer_id && !previousCustomerIds.has(record.customer_id)) {
            previousCustomerIds.add(record.customer_id);
            return count + 1;
          }
          return count;
        }, 0);

        const newCustomerTrend = prevNewCustomers ? Math.round((newCustomers - prevNewCustomers) / prevNewCustomers * 100) : 0;

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
          newCustomers,
          newCustomerTrend,
          newCustomerTargetProgress: 70
        };
        this.records = currentSales;
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