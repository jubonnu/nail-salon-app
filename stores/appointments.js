import { defineStore } from 'pinia';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export const useAppointmentStore = defineStore('appointments', {
  state: () => ({
    appointments: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchAppointments() {
      this.loading = true;
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select(`
            *,
            customers (
              name,
              email,
              phone
            ),
            staff (
              name,
              email
            )
          `)
          .order('start_time', { ascending: true });

        if (error) throw error;
        this.appointments = data || [];
        return this.appointments;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async createAppointment(data) {
      this.loading = true;
      try {
        const { data: newAppointment, error } = await supabase
          .from('appointments')
          .insert([data])
          .select(`
            *,
            customers (
              name,
              email,
              phone
            ),
            staff (
              name,
              email
            )
          `)
          .single();

        if (error) throw error;

        // Create corresponding sales record
        const salesData = {
          appointment_id: newAppointment.id,
          customer_id: newAppointment.customer_id,
          staff_id: newAppointment.staff_id,
          amount: this.getServiceAmount(newAppointment.service_type), // 施術タイプに応じた金額
          payment_method: 'Cash', // デフォルトの支払方法
          status: 'Pending', // 初期ステータス
          notes: `予約ID: ${newAppointment.id} の売上記録`
        };

        const { error: salesError } = await supabase
          .from('sales_records')
          .insert([salesData])
          .select()
          .single();

        if (salesError) throw salesError;

        this.appointments.push(newAppointment);
        return newAppointment;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    getServiceAmount(serviceType) {
      // サービスタイプに応じた金額を返す
      const prices = {
        'ジェルネイル': 8000, // 基本料金
        'ネイルケア': 5000,   // 基本料金
        'ネイルアート': 10000, // アート込み
        'ハンドケア': 3000    // 基本料金
      };
      return prices[serviceType] || 0;
    },

    async updateAppointment(id, data) {
      this.loading = true;
      try {
        const { data: updated, error } = await supabase
          .from('appointments')
          .update(data)
          .eq('id', id)
          .select(`
            *,
            customers (
              name,
              email,
              phone
            ),
            staff (
              name,
              email
            )
          `)
          .single();

        if (error) throw error;
        const index = this.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
          this.appointments[index] = updated;
        }
        return updated;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async deleteAppointment(id) {
      this.loading = true;
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id);

        if (error) throw error;
        const index = this.appointments.findIndex(a => a.id === id);
        if (index !== -1) {
          this.appointments.splice(index, 1);
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    async checkAvailability(staffId, startTime, endTime) {
      try {
        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .eq('staff_id', staffId)
          .overlaps('start_time', 'end_time', startTime, endTime);

        if (error) throw error;
        return data.length === 0;
      } catch (error) {
        this.error = error.message;
        throw error;
      }
    }
  }
});