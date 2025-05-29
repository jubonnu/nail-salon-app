<template>
  <NuxtLayout name="customer">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-semibold text-center text-secondary mb-6">Scan Salon QR Code</h1>
      
      <div v-if="!showScanner" class="flex flex-col items-center">
        <el-button type="primary" @click="startScanner" size="large" class="mb-4">
          Start Scanner
        </el-button>
        <p class="text-sm text-gray-500 text-center">
          Please scan the QR code displayed at the salon to identify the location
        </p>
      </div>
      
      <div v-else class="qr-scanner-container">
        <qrcode-stream @detect="onDetect" @init="onInit" :camera="camera" class="rounded-lg overflow-hidden">
          <div class="scan-region-highlight"></div>
          <div class="scan-region-overlay">
            <div class="overlay-instructions">
              Center the QR code in the frame
            </div>
          </div>
        </qrcode-stream>
        
        <el-button @click="stopScanner" size="small" class="mt-4">
          Cancel
        </el-button>
      </div>
      
      <div v-if="error" class="mt-4 p-3 bg-red-100 text-red-700 rounded-md">
        {{ error }}
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
import { ref, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const showScanner = ref(false);
const camera = ref('auto');
const error = ref('');

// This would need to be properly implemented when vue-qrcode-reader is available
const startScanner = () => {
  showScanner.value = true;
  error.value = '';
};

const stopScanner = () => {
  showScanner.value = false;
};

const onInit = (promise) => {
  promise
    .then(() => {
      console.log('QR Scanner initialized successfully');
    })
    .catch(error => {
      if (error.name === 'NotAllowedError') {
        this.error = 'Camera access denied. Please allow camera access and try again.';
      } else if (error.name === 'NotFoundError') {
        this.error = 'No camera found on this device.';
      } else {
        this.error = 'Failed to initialize QR scanner: ' + error.message;
      }
    });
};

const onDetect = (result) => {
  try {
    const salonData = JSON.parse(result.content);
    if (salonData && salonData.salonId) {
      // Store salon info in localStorage or state management
      localStorage.setItem('salonId', salonData.salonId);
      localStorage.setItem('salonName', salonData.salonName || 'Nail Salon');
      
      // Navigate to counseling form
      router.push('/customer/counseling');
    } else {
      error.value = 'Invalid QR code. Please try again.';
    }
  } catch (e) {
    error.value = 'Could not process QR code data. Please try again.';
  }
};

onUnmounted(() => {
  // Clean up any resources
  stopScanner();
});
</script>

<style scoped>
.qr-scanner-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.scan-region-highlight {
  border-radius: 10px;
  border: 2px solid var(--color-primary);
  position: absolute;
  width: 200px;
  height: 200px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.scan-region-overlay {
  position: absolute;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.3);
}

.overlay-instructions {
  position: absolute;
  bottom: 20px;
  left: 0;
  right: 0;
  text-align: center;
  color: white;
  font-size: 14px;
  padding: 0 20px;
}
</style>