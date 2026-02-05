<script setup lang="ts">
import { computed } from "vue";

type AnyIntf = { name?: string; __showWhen?: { typeKey: string; values: string[] } };
type AnyNode = { inputs?: Record<string, { value?: string }> };

const props = defineProps<{
  modelValue: string;
  intf: AnyIntf;
  node?: AnyNode;
}>();

const emit = defineEmits<{
  (event: "update:modelValue", value: string): void;
}>();

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement | null;
  emit("update:modelValue", target?.value ?? "");
};

const shouldShow = computed(() => {
  const rule = props.intf.__showWhen;
  if (!rule || !props.node?.inputs) {
    return true;
  }
  const typeValue = props.node.inputs[rule.typeKey]?.value ?? "";
  return rule.values.includes(typeValue);
});
</script>

<template>
  <div v-if="shouldShow" class="interface-field">
    <div class="interface-label">{{ props.intf?.name ?? "" }}</div>
    <input class="interface-input" :value="props.modelValue" @input="onInput" />
  </div>
</template>

<style scoped>
.interface-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.interface-label {
  font-size: 12px;
  color: #9bb0c7;
}

.interface-input {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #2b3139;
  background: #0f1318;
  color: #e4e8ee;
  padding: 6px 8px;
  font-size: 12px;
  outline: none;
}

.interface-input:focus {
  border-color: #4a78ff;
}
</style>
