<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  filterCodeText: string;
  isCodeReadonly: boolean;
  copyCodeFeedback: boolean;
  showApplyButton: boolean;
}>();

defineEmits<{
  "update:filterCodeText": [value: string];
  toggleEdit: [];
  copy: [];
  apply: [];
}>();

const editToggleEl = ref<HTMLButtonElement | null>(null);
defineExpose({ editToggleEl });
</script>

<template>
  <div class="pane-title filter-code-header">
    <span>滤镜代码</span>
    <button
      ref="editToggleEl"
      type="button"
      class="filter-code-edit-toggle"
      :title="isCodeReadonly ? '点击进入编辑' : '点击恢复只读'"
      @click.stop.prevent="$emit('toggleEdit')"
    >
      {{ isCodeReadonly ? "🔒 只读" : "✏️ 编辑" }}
    </button>
    <button
      type="button"
      class="filter-code-copy"
      :class="{ 'copy-done': copyCodeFeedback }"
      @click="$emit('copy')"
    >
      {{ copyCodeFeedback ? "已复制" : "复制代码" }}
    </button>
    <button
      v-if="showApplyButton"
      type="button"
      class="filter-code-apply"
      @click="$emit('apply')"
    >
      应用代码
    </button>
  </div>
  <textarea
    :value="filterCodeText"
    :readonly="isCodeReadonly"
    class="filter-code"
    spellcheck="false"
    @input="(e: Event) => $emit('update:filterCodeText', (e.target as HTMLTextAreaElement).value)"
  ></textarea>
</template>
