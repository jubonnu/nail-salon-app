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
        let startDate, endDate, prevStartDate, prevEndDate;
        
        switch (period) {
          case 'today':
            startDate = dayjs().startOf('day');
            endDate = dayjs().endOf('day');
            prevStartDate = startDate.subtract(1, 'day');
            prevEndDate = prevStartDate.endOf('day');
            break;
          case 'week':
            startDate = dayjs().startOf('week');
            endDate = dayjs().endOf('week');
            prevStartDate = startDate.subtract(1, 'week');
            prevEndDate = prevStartDate.endOf('week');
            break;
          case 'month':
            startDate = dayjs().startOf('month');
            endDate = dayjs().endOf('month');
            prevStartDate = startDate.subtract(1, 'month');
            prevEndDate = prevStartDate.endOf('month');
            break;
          case 'year':
            startDate = dayjs().startOf('year');
            endDate = dayjs().endOf('year');
            prevStartDate = startDate.subtract(1, 'year');
            prevEndDate = prevStartDate.endOf('year');
            break;
          default:
            startDate = dayjs().startOf('month');
            endDate = dayjs().endOf('month');
            prevStartDate = startDate.subtract(1, 'month');
            prevEndDate = prevStartDate.endOf('month');
        }

        // Fetch current period sales data
        const { data: salesData, error: salesError } = await supabase
          .from('sales_records')
          .select(`
            *,
            customers!inner (name, email, phone),
            staff!inner (name, email),
            appointments!left (service_type)
          `)
          .gte('created_at', startDate.toISOString())
          .lte('created_at', endDate.toISOString())
          .order('created_at', { ascending: false });

        if (salesError) throw salesError;
        
        const currentPeriodSales = salesData || [];

        // Fetch previous period sales data
        const { data: prevSalesData, error: prevError } = await supabase
          .from('sales_records')
          .select(`
            *,
            customers!inner (name, email, phone)
          `)
          .gte('created_at', prevStartDate.toISOString())
          .lte('created_at', prevEndDate.toISOString());

        if (prevError) throw prevError;
        const previousPeriodSales = prevSalesData || [];

        // Calculate total sales
        const totalSales = currentPeriodSales.reduce((sum, record) => sum + record.amount, 0);
        const prevTotalSales = previousPeriodSales.reduce((sum, record) => sum + record.amount, 0);
        const salesTrend = prevTotalSales > 0 ? Math.round((totalSales - prevTotalSales) / prevTotalSales * 100) : 0;

        // Calculate customer metrics
        const uniqueCustomers = new Set(currentPeriodSales.map(record => record.customer_id));
        const customerCount = uniqueCustomers.size;
        const prevUniqueCustomers = new Set(previousPeriodSales.map(record => record.customer_id));
        const prevCustomerCount = prevUniqueCustomers.size;
        const customerTrend = prevCustomerCount > 0 ? Math.round((customerCount - prevCustomerCount) / prevCustomerCount * 100) : 0;

        // Calculate average transaction
        const averageTransaction = customerCount ? Math.round(totalSales / customerCount) : 0;
        const prevAverageTransaction = prevCustomerCount ? Math.round(prevTotalSales / prevCustomerCount) : 0;
        const avgTransactionTrend = prevAverageTransaction > 0 ? Math.round((averageTransaction - prevAverageTransaction) / prevAverageTransaction * 100) : 0;

        // Calculate new customers (customers who don't appear in previous period)
        const prevCustomerIds = new Set(previousPeriodSales.map(record => record.customer_id));
        const newCustomers = Array.from(uniqueCustomers).filter(id => !prevCustomerIds.has(id)).length;
        const prevNewCustomers = Array.from(prevUniqueCustomers).filter(id => 
          !Array.from(uniqueCustomers).includes(id)
        ).length;
        const newCustomerTrend = prevNewCustomers > 0 ? Math.round((newCustomers - prevNewCustomers) / prevNewCustomers * 100) : 0;

        // Calculate target progress based on monthly goals
        const monthlyGoals = {
          sales: 1000000,
          customers: 100,
          avgTransaction: 10000,
          newCustomers: 20
        };

        // Adjust progress calculation based on period
        const daysInMonth = dayjs().daysInMonth();
        const currentDay = dayjs().date();
        const progressMultiplier = period === 'month' ? 1 : (daysInMonth / currentDay);

        const targetProgress = Math.min(100, Math.round((totalSales / (monthlyGoals.sales / progressMultiplier)) * 100));
        const customerTargetProgress = Math.min(100, Math.round((customerCount / (monthlyGoals.customers / progressMultiplier)) * 100));
        const avgTransactionTargetProgress = Math.min(100, Math.round((averageTransaction / monthlyGoals.avgTransaction) * 100));
        const newCustomerTargetProgress = Math.min(100, Math.round((newCustomers / (monthlyGoals.newCustomers / progressMultiplier)) * 100));

        this.summary = {
          totalSales,
          salesTrend,
          targetProgress,
          customerCount,
          customerTrend,
          customerTargetProgress,
          averageTransaction,
          avgTransactionTrend,
          avgTransactionTargetProgress,
          newCustomers,
          newCustomerTrend,
          newCustomerTargetProgress
        };

        this.records = currentPeriodSales;
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