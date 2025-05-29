import { defineStore } from 'pinia';

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
        // This would be an actual API call in a real implementation
        // const response = await fetch(`${apiBaseUrl}/counseling-sheets`);
        // const data = await response.json();
        
        // Simulate API call for demo
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Sample data
        this.counselingSheets = [
          {
            id: 1,
            customerName: 'Kobayashi Aiko',
            phone: '070-1234-8765',
            email: 'kobayashi.aiko@example.com',
            serviceType: 'Gel Nail',
            nailLength: 'medium',
            nailShape: 'almond',
            hasAllergies: false,
            allergiesDetails: '',
            hasMedicalConditions: false,
            medicalDetails: '',
            notes: 'Prefer pastel colors and minimal design.',
            status: 'New',
            submissionDate: '2024-04-03 14:30'
          },
          // Add more sample data here...
        ];
      } catch (error) {
        this.error = error.message || 'Failed to fetch counseling sheets';
      } finally {
        this.loading = false;
      }
    },
    
    async processSheet(sheetId) {
      const sheet = this.counselingSheets.find(s => s.id === sheetId);
      if (!sheet) return;
      
      try {
        // This would be an actual API call in a real implementation
        // await fetch(`${apiBaseUrl}/counseling-sheets/${sheetId}`, {
        //   method: 'PATCH',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({ status: 'Processed' }),
        // });
        
        // Update locally
        sheet.status = 'Processed';
      } catch (error) {
        this.error = error.message || 'Failed to process sheet';
      }
    },
    
    async archiveSheet(sheetId) {
      const sheet = this.counselingSheets.find(s => s.id === sheetId);
      if (!sheet) return;
      
      try {
        // This would be an API call in a real implementation
        // Update locally
        sheet.status = 'Archived';
      } catch (error) {
        this.error = error.message || 'Failed to archive sheet';
      }
    },
    
    async deleteSheet(sheetId) {
      try {
        // This would be an API call in a real implementation
        
        // Update locally
        const index = this.counselingSheets.findIndex(s => s.id === sheetId);
        if (index !== -1) {
          this.counselingSheets.splice(index, 1);
        }
      } catch (error) {
        this.error = error.message || 'Failed to delete sheet';
      }
    }
  }
});