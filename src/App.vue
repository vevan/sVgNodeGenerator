<script setup lang="ts">
import { computed, ref, onUnmounted } from "vue";
import { BaklavaEditor } from "baklavajs";
import CustomNode from "./components/CustomNode.vue";
import PreviewPane from "./components/PreviewPane.vue";
import FilterCodePane from "./components/FilterCodePane.vue";
import { useFilterCode } from "./composables/useFilterCode";
import {
  createNodeRegistration,
  loadEditorState,
  saveEditorState,
  clearEditorGraph,
  buildFilterMarkup,
  applyParsedToGraph,
} from "./editor";

const { baklava, getNodeCtor } = createNodeRegistration();

const filterId = "test";
const filterMarkup = ref("");

const DEFAULT_FILTER_CODE = `<filter id="test">
  <feTurbulence type="turbulence" baseFrequency="0.015" numOctaves="3" seed="66" stitchTiles="stitch" result="Turbulence" />
  <feGaussianBlur in="Turbulence" stdDeviation="3" result="blured" />
  <feDisplacementMap in="SourceGraphic" in2="blured" scale="66" xChannelSelector="R" yChannelSelector="G" result="DisplacementMap" />
</filter>`;

const appliedDefaultFilter = ref(false);
const savedState = loadEditorState();
if (savedState && typeof savedState === "object" && savedState !== null && "graph" in savedState) {
  const warnings = baklava.editor.load(savedState as Parameters<typeof baklava.editor.load>[0]);
  if (warnings.length > 0) {
    console.warn("[svgfilter] 恢复编辑器状态时有警告:", warnings);
  }
} else {
  const result = applyParsedToGraph(DEFAULT_FILTER_CODE, {
    graph: baklava.editor.graph,
    getNodeCtor,
    clearGraph: () => clearEditorGraph(baklava.editor as any),
    saveState: () => saveEditorState(baklava.editor),
  });
  if (result.success) {
    appliedDefaultFilter.value = true;
  } else {
    console.warn("[svgfilter] 应用默认滤镜失败:", result.error);
  }
}

function updateFilterMarkup() {
  filterMarkup.value = buildFilterMarkup(baklava.editor.graph);
}
if (appliedDefaultFilter.value) {
  updateFilterMarkup();
}

const filterCode = computed(
  () => `<filter id="${filterId}">\n${filterMarkup.value}\n</filter>`
);

const getFullCode = () => filterCode.value;
const saveState = () => saveEditorState(baklava.editor);

const { isCodeReadonly, filterCodeText, copyCodeFeedback, copyCode, setCodeFromGraph, toggleCodeEdit } = useFilterCode({
  getFullCode,
  saveState,
});
if (appliedDefaultFilter.value) {
  setCodeFromGraph(getFullCode());
  appliedDefaultFilter.value = false;
}

function setFilterCodeText(v: string) {
  filterCodeText.value = v;
}

updateFilterMarkup();
let syncMarkupTimer: number | undefined;
syncMarkupTimer = window.setInterval(updateFilterMarkup, 300);
// 在 onUnmounted 里 clearInterval(syncMarkupTimer) - 见下方

function clearEditor() {
  clearEditorGraph(baklava.editor as any);
}

function restoreDefaultFilter() {
  const result = applyParsedToGraph(DEFAULT_FILTER_CODE, {
    graph: baklava.editor.graph,
    getNodeCtor,
    clearGraph: () => clearEditorGraph(baklava.editor as any),
    saveState: () => saveEditorState(baklava.editor),
  });
  if (result.success) {
    updateFilterMarkup();
    setCodeFromGraph(getFullCode());
  } else {
    console.warn("[svgfilter] 恢复默认滤镜失败:", result.error);
  }
}

function applyCode() {
  const raw = filterCodeText.value.trim();
  if (!raw) return;
  const result = applyParsedToGraph(raw, {
    graph: baklava.editor.graph,
    getNodeCtor,
    clearGraph: () => clearEditorGraph(baklava.editor as any),
    saveState: () => saveEditorState(baklava.editor as any),
  });
  if (!result.success) {
    alert(result.error);
    return;
  }
  updateFilterMarkup();
  setCodeFromGraph(filterCode.value);
}

onUnmounted(() => {
  if (syncMarkupTimer) window.clearInterval(syncMarkupTimer);
});
</script>

<template>
  <div class="app">
    <section class="pane pane-editor">
      <div class="pane-title">节点编辑器</div>
      <div class="editor-wrap">
        <BaklavaEditor :view-model="baklava">
          <template #node="{ node, selected, dragging, onSelect, onStartDrag }">
            <CustomNode
              :node="node"
              :selected="selected"
              :dragging="dragging"
              :on-select="onSelect"
              :on-start-drag="onStartDrag"
            />
          </template>
        </BaklavaEditor>
      </div>
    </section>
    <section class="pane pane-preview">
      <PreviewPane
        :filter-id="filterId"
        :filter-markup="filterMarkup"
        :on-clear-editor="clearEditor"
        :on-restore-default-filter="restoreDefaultFilter"
      />
      <FilterCodePane
        :filter-code-text="filterCodeText"
        :is-code-readonly="isCodeReadonly"
        :copy-code-feedback="copyCodeFeedback"
        :show-apply-button="!isCodeReadonly"
        @update:filter-code-text="setFilterCodeText"
        @toggle-edit="toggleCodeEdit"
        @copy="copyCode(getFullCode)"
        @apply="applyCode"
      />
    </section>
  </div>
</template>

<style>
.baklava-node > .__content > div > div {
  margin: 0;
}
</style>
