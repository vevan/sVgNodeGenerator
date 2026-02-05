<script setup lang="ts">
import { computed } from "vue";

type NodeInput = { value: string };
type NodeInputs = Record<string, NodeInput | undefined>;

const props = defineProps<{
  node: { inputs: NodeInputs };
  intf: { name?: string };
  modelValue?: string;
}>();

const getValue = (key: string, fallback = "") =>
  props.node.inputs?.[key]?.value ?? fallback;

const setValue = (key: string, value: string) => {
  const target = props.node.inputs?.[key];
  if (target) {
    target.value = value;
  }
};

const lightType = computed({
  get: () => getValue("lightType", "distant"),
  set: (value) => setValue("lightType", value),
});

const commonFields = [
  { key: "lightingColor", label: "光照颜色 lighting-color" },
  { key: "surfaceScale", label: "表面缩放 surfaceScale" },
  { key: "kernelUnitLength", label: "单位长度 kernelUnitLength" },
];

const distantFields = [
  { key: "azimuth", label: "方位角 azimuth" },
  { key: "elevation", label: "仰角 elevation" },
];

const pointFields = [
  { key: "x", label: "点光源 x" },
  { key: "y", label: "点光源 y" },
  { key: "z", label: "点光源 z" },
];

const spotFields = [
  { key: "x", label: "点光源 x" },
  { key: "y", label: "点光源 y" },
  { key: "z", label: "点光源 z" },
  { key: "pointsAtX", label: "聚光点 pointsAtX" },
  { key: "pointsAtY", label: "聚光点 pointsAtY" },
  { key: "pointsAtZ", label: "聚光点 pointsAtZ" },
  { key: "limitingConeAngle", label: "锥角 limitingConeAngle" },
];
</script>

<template>
  <div class="light-control">
    <div class="light-title">{{ intf?.name ?? "光源" }}</div>
    <label class="field">
      <span>光源类型 lightType</span>
      <select v-model="lightType">
        <option value="distant">feDistantLight</option>
        <option value="point">fePointLight</option>
        <option value="spot">feSpotLight</option>
      </select>
    </label>
    <div class="fields">
      <label v-for="field in commonFields" :key="field.key" class="field">
        <span>{{ field.label }}</span>
        <input
          :value="getValue(field.key)"
          @input="setValue(field.key, ($event.target as HTMLInputElement).value)"
        />
      </label>
      <template v-if="lightType === 'distant'">
        <label v-for="field in distantFields" :key="field.key" class="field">
          <span>{{ field.label }}</span>
          <input
            :value="getValue(field.key)"
            @input="setValue(field.key, ($event.target as HTMLInputElement).value)"
          />
        </label>
      </template>
      <template v-else-if="lightType === 'point'">
        <label v-for="field in pointFields" :key="field.key" class="field">
          <span>{{ field.label }}</span>
          <input
            :value="getValue(field.key)"
            @input="setValue(field.key, ($event.target as HTMLInputElement).value)"
          />
        </label>
      </template>
      <template v-else>
        <label v-for="field in spotFields" :key="field.key" class="field">
          <span>{{ field.label }}</span>
          <input
            :value="getValue(field.key)"
            @input="setValue(field.key, ($event.target as HTMLInputElement).value)"
          />
        </label>
      </template>
    </div>
  </div>
</template>

<style scoped>
.light-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.light-title {
  font-size: 12px;
  color: #9bb0c7;
}

.fields {
  display: grid;
  gap: 6px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #cdd6e3;
}

.field input,
.field select {
  width: 100%;
  border-radius: 6px;
  border: 1px solid #2b3139;
  background: #0f1318;
  color: #e4e8ee;
  padding: 6px 8px;
  font-size: 12px;
  outline: none;
}

.field input:focus,
.field select:focus {
  border-color: #4a78ff;
}
</style>
