<script setup lang="ts">
defineProps<{
  modelValue: string;
}>();
</script>

<template>
  <div class="node-description">
    {{ modelValue }}
  </div>
</template>

<style scoped>
.node-description {
  padding: 6px 8px;
  border-radius: 6px;
  background: rgba(15, 19, 24, 0.6);
  color: #cdd6e3;
  font-size: 12px;
  line-height: 1.4;
  user-select: text;
  white-space: normal;
}
</style>
