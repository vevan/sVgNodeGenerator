<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";

const PREVIEW_STORAGE_KEY = "svgfilter-preview";

const defaultPreviewHtml = `<style>
  .demo {
    width: 100%;
    background: url("https://picsum.photos/600/400") center center /cover no-repeat;
    display: flex;
    flex-direction: column;
    gap: 1em;
    align-items: center;
    justify-content: center;
    color: #fff;
    * {
      text-shadow: 0 1px 3px rgba(0,0,0,0.2);
    }
  }
  .card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    position: relative;
    width: 80%;
    height: 80%;
    padding: 1em;
    border-radius: 28px;
    isolation: isolate;
    box-shadow: 0px 0px 21px -8px rgba(255, 255, 255, 0.3);
    cursor: pointer;
    &:before {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
      border-radius: 28px;
      box-shadow: inset 0 0 14px -4px rgba(255, 255, 255, 0.7);
      background-color: rgba(255, 255, 255, 0);
      pointer-events: none;
    }
    &:after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: -1;
      border-radius: 28px;
      backdrop-filter: blur(22px);
      isolation: isolate;
      pointer-events: none;
    }
    .pill {
      background: rgba(255,255,255,0.1);
      padding: 0.2em 0.5em;
      border-radius: 1em;
      cursor: pointer;
      border: none;
      outline: none;
      text-align: center;
      align-self: flex-end;
    }
    .title {
      font-size: 1.5em;
      font-weight: 600;
      margin: 1em 0;
    }
    .button {
      color: #fff;
      background: rgba(255,255,255,0.1);
      padding: 0.5em 1em;
      border-radius: 1em;
      cursor: pointer;
      border: none;
      outline: none;
      &:hover {
        background: rgba(255,255,255,0.3);
      }
    }
  }
  </style>
  <div class="demo">
    <div class="card">
      <div class="pill">Pill</div>
      <h3 class="title">Card</h3>
      <button class="button">Button</button>
    </div>
  </div>`;

const defaultSelectors = [".card:after"];

function loadPreviewState(): { previewHtml: string; selectors: string[] } | null {
  try {
    const raw = localStorage.getItem(PREVIEW_STORAGE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { previewHtml?: string; selectors?: string[] };
    if (typeof data.previewHtml !== "string" || !Array.isArray(data.selectors)) return null;
    return { previewHtml: data.previewHtml, selectors: data.selectors };
  } catch {
    return null;
  }
}

function savePreviewState(previewHtml: string, selectors: string[]) {
  try {
    localStorage.setItem(
      PREVIEW_STORAGE_KEY,
      JSON.stringify({ previewHtml, selectors })
    );
  } catch {
    /* ignore */
  }
}

const props = withDefaults(
  defineProps<{
    filterId: string;
    filterMarkup: string;
    onClearEditor?: () => void;
  }>(),
  { onClearEditor: undefined }
);

const previewHtml = ref(defaultPreviewHtml);
const selectors = ref<string[]>([...defaultSelectors]);

onMounted(() => {
  const saved = loadPreviewState();
  if (saved) {
    previewHtml.value = saved.previewHtml;
    selectors.value = saved.selectors.length ? saved.selectors : [""];
  }
});

let saveTimeout: number | undefined;
watch(
  [previewHtml, selectors],
  () => {
    if (saveTimeout !== undefined) window.clearTimeout(saveTimeout);
    saveTimeout = window.setTimeout(() => {
      saveTimeout = undefined;
      savePreviewState(previewHtml.value, selectors.value);
    }, 400);
  },
  { deep: true }
);

const activeSelectors = computed(() =>
  selectors.value.map((item) => item.trim()).filter(Boolean),
);

const filterCss = computed(() => {
  if (activeSelectors.value.length === 0) {
    return `#preview { filter: url(#${props.filterId}); }`;
  }
  const scoped = activeSelectors.value.map((item) => `#preview ${item}`);
  return `${scoped.join(", ")} { filter: url(#${props.filterId}); }`;
});

const addSelector = () => {
  selectors.value.push("");
};

const removeSelector = (index: number) => {
  selectors.value.splice(index, 1);
};

const clearPreview = () => {
  previewHtml.value = "";
  selectors.value = [""];
  props.onClearEditor?.();
};

const restoreDefault = () => {
  previewHtml.value = defaultPreviewHtml;
  selectors.value = [...defaultSelectors];
};
</script>

<template>
  <div class="html-header">
    <div class="pane-title">HTML 输入</div>
    <div class="html-actions">
      <button type="button" class="action-button" @click="clearPreview">清除</button>
      <button type="button" class="action-button" @click="restoreDefault">恢复默认</button>
    </div>
  </div>
  <textarea v-model="previewHtml" class="html-input"></textarea>

  <div class="pane-title">选择器</div>
  <div class="selector-list">
    <div v-if="selectors.length === 0" class="selector-hint">
      留空将应用在 #preview 本身
    </div>
    <div v-for="(_, index) in selectors" :key="index" class="selector-row">
      <input
        v-model="selectors[index]"
        class="selector-input"
        placeholder="如 .button 或 #logo"
      />
      <button
        type="button"
        class="selector-button"
        @click="removeSelector(index)"
      >
        删除
      </button>
    </div>
    <button type="button" class="selector-button add" @click="addSelector">
      添加选择器
    </button>
  </div>

  <div class="pane-title">预览</div>
  <div class="preview-wrap">
    <div id="preview" v-html="previewHtml"></div>
    <component :is="'style'">{{ filterCss }}</component>
    <svg class="filter-defs" aria-hidden="true">
      <defs>
        <filter :id="filterId" v-html="filterMarkup"></filter>
      </defs>
    </svg>
  </div>
</template>

<style scoped>
.html-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 0 14px;
  border-bottom: 1px solid #2b3139;
  background: #12171d;
}

.html-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  border-radius: 6px;
  border: 1px solid #2b3139;
  background: #0f1318;
  color: #e4e8ee;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.action-button:hover {
  background: #1a2028;
}

.html-input {
  margin: 0;
  min-height: 140px;
  resize: vertical;
  border: 1px solid #2b3139;
  border-left: none;
  border-right: none;
  background: #0f1318;
  color: #e4e8ee;
  padding: 12px 14px;
  font-size: 12px;
  line-height: 1.5;
  outline: none;
}

.selector-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  border-bottom: 1px solid #2b3139;
  background: #12171d;
}

.selector-row {
  display: flex;
  gap: 8px;
  align-items: center;
}

.selector-input {
  flex: 1;
  border-radius: 6px;
  border: 1px solid #2b3139;
  background: #0f1318;
  color: #e4e8ee;
  padding: 6px 8px;
  font-size: 12px;
  outline: none;
}

.selector-button {
  border-radius: 6px;
  border: 1px solid #2b3139;
  background: #0f1318;
  color: #e4e8ee;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.selector-button.add {
  align-self: flex-start;
}

.selector-hint {
  font-size: 12px;
  color: #9bb0c7;
}

.preview-wrap {
  padding: 16px;
  flex: 0 0 auto;
  position: relative;
}

#preview {
  display: flex;
  width: 100%;
  min-height: 360px;
  border-radius: 12px;
  background: #0f1318;
  border: 1px solid #2b3139;
  overflow: auto;
}

.filter-defs {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
}
</style>
