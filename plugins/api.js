export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  
  const api = {
    // Authentication
    async login(email, password) {
      try {
        const response = await fetch(`${config.public.apiBaseUrl}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
        });
        
        if (!response.ok) throw new Error('Authentication failed');
        return await response.json();
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    
    // Counseling Sheets
    async getCounselingSheets(status = null) {
      try {
        let url = `${config.public.apiBaseUrl}/counseling-sheets`;
        if (status) url += `?status=${status}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch counseling sheets');
        return await response.json();
      } catch (error) {
        console.error('Get counseling sheets error:', error);
        throw error;
      }
    },
    
    async createCounselingSheet(data) {
      try {
        const response = await fetch(`${config.public.apiBaseUrl}/counseling-sheets`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) throw new Error('Failed to create counseling sheet');
        return await response.json();
      } catch (error) {
        console.error('Create counseling sheet error:', error);
        throw error;
      }
    },
    
    // Customers
    async getCustomers(params = {}) {
      try {
        const queryParams = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
        
        const url = `${config.public.apiBaseUrl}/customers?${queryParams}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch customers');
        return await response.json();
      } catch (error) {
        console.error('Get customers error:', error);
        throw error;
      }
    },
    
    // Sales data
    async getSalesData(dateRange) {
      try {
        const { start, end } = dateRange;
        const url = `${config.public.apiBaseUrl}/sales?start=${start}&end=${end}`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        
        if (!response.ok) throw new Error('Failed to fetch sales data');
        return await response.json();
      } catch (error) {
        console.error('Get sales data error:', error);
        throw error;
      }
    },
    
    // Instagram integration
    async createInstagramPost(postData) {
      try {
        const response = await fetch(`${config.public.apiBaseUrl}/instagram/posts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(postData),
        });
        
        if (!response.ok) throw new Error('Failed to create Instagram post');
        return await response.json();
      } catch (error) {
        console.error('Create Instagram post error:', error);
        throw error;
      }
    },
  };
  
  return {
    provide: {
      api
    }
  };
});