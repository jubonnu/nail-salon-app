export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  
  const api = {
    // Sales API
    sales: {
      async getSummary(period = 'day', date = new Date()) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/sales/summary?period=${period}&date=${date.toISOString()}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch sales summary');
        return response.json();
      },
      
      async getRecords() {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/sales`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch sales records');
        return response.json();
      },
      
      async create(data) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/sales`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) throw new Error('Failed to create sales record');
        return response.json();
      },
      
      async update(id, data) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/sales/${id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) throw new Error('Failed to update sales record');
        return response.json();
      },
      
      async delete(id) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/sales/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to delete sales record');
        return response.json();
      },
    },
    
    // Instagram API
    instagram: {
      async getPosts() {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/instagram`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch Instagram posts');
        return response.json();
      },
      
      async getScheduledPosts() {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/instagram/scheduled`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch scheduled posts');
        return response.json();
      },
      
      async createPost(data) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/instagram`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) throw new Error('Failed to create Instagram post');
        return response.json();
      },
      
      async updatePost(id, data) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/instagram/${id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) throw new Error('Failed to update Instagram post');
        return response.json();
      },
      
      async deletePost(id) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/instagram/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to delete Instagram post');
        return response.json();
      },
    },
    
    // Staff API
    staff: {
      async getAll() {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/staff`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch staff members');
        return response.json();
      },
      
      async getSchedule(staffId, date) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/staff/schedule?staffId=${staffId}&date=${date}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch staff schedule');
        return response.json();
      },
      
      async getPerformance(staffId, startDate, endDate) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/staff/performance?staffId=${staffId}&startDate=${startDate}&endDate=${endDate}`,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to fetch staff performance');
        return response.json();
      },
      
      async create(data) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/staff`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) throw new Error('Failed to create staff member');
        return response.json();
      },
      
      async update(id, data) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/staff/${id}`,
          {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
            body: JSON.stringify(data),
          }
        );
        if (!response.ok) throw new Error('Failed to update staff member');
        return response.json();
      },
      
      async delete(id) {
        const response = await fetch(
          `${config.public.apiBaseUrl}/functions/v1/staff/${id}`,
          {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
            },
          }
        );
        if (!response.ok) throw new Error('Failed to delete staff member');
        return response.json();
      },
    },
  };
  
  return {
    provide: {
      api
    }
  };
});