<script setup lang="ts">
defineProps<{
  intf: { name?: string };
  modelValue?: string;
}>();
</script>

<template>
  <div class="group-divider">
    <div class="line"></div>
    <div class="label">{{ intf?.name ?? "" }}</div>
    <div class="line"></div>
  </div>
</template>

<style scoped>
.group-divider {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9bb0c7;
  font-size: 12px;
  padding: 4px 0;
}

.line {
  flex: 1;
  height: 1px;
  background: #2b3139;
}

.label {
  white-space: nowrap;
}
</style>
