<script setup lang="ts">
import { computed, inject } from "vue";
import { addDynamicInput, listDynamicInputKeys, removeDynamicInput } from "../nodes/dynamicInputs";

const props = defineProps<{
  node: { __dynamicInputs?: { addInput?: () => void; removeInput?: () => void; keys?: () => string[] } };
  intf: { name?: string };
  modelValue?: string;
}>();

const triggerDynamicInputsUpdate = inject<(() => void) | undefined>("triggerDynamicInputsUpdate");

const count = computed(() => {
  try {
    return listDynamicInputKeys(props.node as any).length;
  } catch {
    return 0;
  }
});

const addInput = () => {
  addDynamicInput(props.node as any);
  triggerDynamicInputsUpdate?.();
};

const removeInput = () => {
  removeDynamicInput(props.node as any);
  triggerDynamicInputsUpdate?.();
};
</script>

<template>
  <div class="dynamic-inputs">
    <div class="dynamic-title">{{ intf?.name ?? "输入管理" }} ({{ count }})</div>
    <div class="dynamic-actions">
      <button class="dynamic-btn" type="button" @click="addInput">+ 添加</button>
      <button class="dynamic-btn" type="button" @click="removeInput">- 移除</button>
    </div>
  </div>
</template>

<style scoped>
.dynamic-inputs {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.dynamic-title {
  font-size: 12px;
  color: #9bb0c7;
}

.dynamic-actions {
  display: flex;
  gap: 8px;
}

.dynamic-btn {
  border-radius: 6px;
  border: 1px solid #2b3139;
  background: #0f1318;
  color: #e4e8ee;
  padding: 4px 8px;
  font-size: 12px;
  cursor: pointer;
}

.dynamic-btn:hover {
  border-color: #4a78ff;
}
</style>
