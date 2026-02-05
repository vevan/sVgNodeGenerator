<script setup lang="ts">
import { ref } from "vue";

type NodeInput = { value: string };
type NodeInputs = Record<string, NodeInput | undefined>;

const props = defineProps<{
  node: { inputs: NodeInputs };
  intf: { name?: string };
  modelValue?: string;
}>();

const fileName = ref("");
const isLoading = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);

const setValue = (key: string, value: string) => {
  const target = props.node.inputs?.[key];
  if (target) {
    target.value = value;
  }
};

const onFileChange = (event: Event) => {
  const input = event.target as HTMLInputElement | null;
  const file = input?.files?.[0];
  if (!file) {
    return;
  }
  fileName.value = file.name;
  isLoading.value = true;
  const reader = new FileReader();
  reader.onload = () => {
    const result = typeof reader.result === "string" ? reader.result : "";
    setValue("href", result);
    setValue("xlinkHref", result);
    isLoading.value = false;
  };
  reader.onerror = () => {
    isLoading.value = false;
  };
  reader.readAsDataURL(file);
};

const clearImage = () => {
  setValue("href", "");
  setValue("xlinkHref", "");
  fileName.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};
</script>

<template>
  <div class="image-picker">
    <div class="image-title">{{ intf?.name ?? "本地图片" }}</div>
    <div class="image-actions">
      <label class="image-button">
        <input ref="fileInput" type="file" accept="image/*" @change="onFileChange" />
        {{ isLoading ? "读取中..." : "选择图片" }}
      </label>
      <button type="button" class="image-button --secondary" @click="clearImage">
        清空
      </button>
    </div>
    <div v-if="fileName" class="image-file">{{ fileName }}</div>
  </div>
</template>

<style scoped>
.image-picker {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.image-title {
  font-size: 12px;
  color: #9bb0c7;
}

.image-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.image-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border-radius: 6px;
  border: 1px solid #2b3139;
  background: #0f1318;
  color: #e4e8ee;
  padding: 6px 8px;
  font-size: 12px;
  cursor: pointer;
  width: fit-content;
}

.image-button.--secondary {
  background: #1b2129;
}

.image-button input {
  display: none;
}

.image-file {
  font-size: 12px;
  color: #cdd6e3;
}
</style>
