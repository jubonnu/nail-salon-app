<template>
  <NuxtLayout name="customer">
    <div class="bg-white rounded-lg shadow-md p-6">
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-center text-secondary">Counseling Form</h1>
        <p class="text-center text-gray-500 text-sm mt-2">Please fill out this form to help us provide the best service</p>
      </div>
      
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top">
        <!-- Basic Information -->
        <h2 class="text-lg font-medium text-primary mb-3">Personal Information</h2>
        <el-form-item prop="name" label="Full Name">
          <el-input v-model="form.name" placeholder="Enter your full name" />
        </el-form-item>
        
        <el-form-item prop="phone" label="Phone Number">
          <el-input v-model="form.phone" placeholder="Enter your phone number" />
        </el-form-item>
        
        <el-form-item prop="email" label="Email Address (Optional)">
          <el-input v-model="form.email" placeholder="Enter your email address" />
        </el-form-item>
        
        <!-- Service Preferences -->
        <h2 class="text-lg font-medium text-primary mb-3 mt-6">Service Preferences</h2>
        <el-form-item prop="serviceType" label="Service Type">
          <el-select v-model="form.serviceType" placeholder="Select service type" class="w-full">
            <el-option label="Gel Nail" value="gel" />
            <el-option label="Regular Polish" value="regular" />
            <el-option label="Nail Art" value="art" />
            <el-option label="Nail Care" value="care" />
          </el-select>
        </el-form-item>
        
        <el-form-item prop="nailLength" label="Preferred Nail Length">
          <el-radio-group v-model="form.nailLength">
            <el-radio label="short">Short</el-radio>
            <el-radio label="medium">Medium</el-radio>
            <el-radio label="long">Long</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item prop="nailShape" label="Preferred Nail Shape">
          <el-select v-model="form.nailShape" placeholder="Select nail shape" class="w-full">
            <el-option label="Square" value="square" />
            <el-option label="Round" value="round" />
            <el-option label="Oval" value="oval" />
            <el-option label="Almond" value="almond" />
            <el-option label="Stiletto" value="stiletto" />
            <el-option label="Coffin/Ballerina" value="coffin" />
          </el-select>
        </el-form-item>
        
        <!-- Health Information -->
        <h2 class="text-lg font-medium text-primary mb-3 mt-6">Health Information</h2>
        <el-form-item prop="allergies" label="Do you have any allergies?">
          <el-radio-group v-model="form.hasAllergies">
            <el-radio :label="true">Yes</el-radio>
            <el-radio :label="false">No</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="form.hasAllergies" prop="allergiesDetails" label="Please describe your allergies">
          <el-input 
            v-model="form.allergiesDetails" 
            type="textarea" 
            placeholder="Please describe your allergies" 
            rows="3" 
          />
        </el-form-item>
        
        <el-form-item prop="medicalConditions" label="Do you have any medical conditions we should be aware of?">
          <el-radio-group v-model="form.hasMedicalConditions">
            <el-radio :label="true">Yes</el-radio>
            <el-radio :label="false">No</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item v-if="form.hasMedicalConditions" prop="medicalDetails" label="Please describe your medical conditions">
          <el-input 
            v-model="form.medicalDetails" 
            type="textarea" 
            placeholder="Please describe your medical conditions" 
            rows="3" 
          />
        </el-form-item>
        
        <!-- Additional Preferences -->
        <h2 class="text-lg font-medium text-primary mb-3 mt-6">Additional Information</h2>
        <el-form-item prop="notes" label="Additional Notes or Requests">
          <el-input 
            v-model="form.notes" 
            type="textarea" 
            placeholder="Any additional information you'd like us to know" 
            rows="3" 
          />
        </el-form-item>
        
        <div class="flex justify-center mt-8">
          <el-button type="primary" @click="submitForm" :loading="loading" size="large">
            Submit Counseling Form
          </el-button>
        </div>
      </el-form>
      
      <!-- Success Dialog -->
      <el-dialog v-model="showSuccess" title="Form Submitted" width="90%" align-center>
        <div class="text-center py-4">
          <div class="text-success text-5xl mb-4">✓</div>
          <h3 class="text-xl font-medium mb-2">Thank You!</h3>
          <p class="mb-4">Your counseling form has been submitted successfully.</p>
          <p>Please show this screen to the salon staff.</p>
          
          <div class="bg-gray-100 p-4 rounded-lg mt-6 text-center">
            <p class="text-sm text-gray-500">Reference Code</p>
            <p class="text-xl font-bold tracking-wider">{{ referenceCode }}</p>
          </div>
        </div>
      </el-dialog>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, reactive } from 'vue';

const formRef = ref(null);
const loading = ref(false);
const showSuccess = ref(false);
const referenceCode = ref('');

const form = reactive({
  name: '',
  phone: '',
  email: '',
  serviceType: '',
  nailLength: 'medium',
  nailShape: '',
  hasAllergies: false,
  allergiesDetails: '',
  hasMedicalConditions: false,
  medicalDetails: '',
  notes: ''
});

const rules = {
  name: [
    { required: true, message: 'Please enter your name', trigger: 'blur' },
  ],
  phone: [
    { required: true, message: 'Please enter your phone number', trigger: 'blur' },
  ],
  email: [
    { type: 'email', message: 'Please enter a valid email address', trigger: 'blur' }
  ],
  serviceType: [
    { required: true, message: 'Please select a service type', trigger: 'change' }
  ],
  nailShape: [
    { required: true, message: 'Please select a nail shape', trigger: 'change' }
  ]
};

// Generate a unique reference code
const generateReferenceCode = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const submitForm = async () => {
  if (!formRef.value) return;
  
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      
      try {
        // In a real implementation, this would make an API call to the backend
        // const response = await fetch(`${config.public.apiBaseUrl}/counseling-sheets`, {
        //   method: 'POST',
        //   headers: {
        //     'Content-Type': 'application/json',
        //   },
        //   body: JSON.stringify({
        //     ...form,
        //     salonId: localStorage.getItem('salonId')
        //   }),
        // });
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Generate a reference code for the customer
        referenceCode.value = generateReferenceCode();
        
        // Show success dialog
        showSuccess.value = true;
      } catch (error) {
        console.error('Error submitting form:', error);
        // Show error notification (would use Element Plus notification in full implementation)
        alert('There was an error submitting your form. Please try again.');
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>