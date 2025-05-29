<!-- 新しいラジオグループコンポーネント -->
<script setup>
const props = defineProps({
  modelValue: {
    type: [String, Number, Boolean],
    required: true
  },
  options: {
    type: Array,
    required: true,
    validator: (value) => {
      return value.every(option => 
        typeof option === 'object' && 
        'value' in option && 
        'label' in option
      );
    }
  }
});

const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <el-radio-group 
    :model-value="modelValue" 
    @update:model-value="emit('update:modelValue', $event)"
  >
    <el-radio 
      v-for="option in options" 
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </el-radio>
  </el-radio-group>
</template>