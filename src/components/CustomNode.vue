<script setup lang="ts">
import { computed, nextTick, provide, ref } from "vue";
import { Components, useViewModel } from "baklavajs";

const dynamicInputsVersion = ref(0);
provide("triggerDynamicInputsUpdate", () => {
  dynamicInputsVersion.value += 1;
});

const props = defineProps<{
  node: any;
  selected: boolean;
  dragging?: boolean;
  onSelect: (event: PointerEvent) => void;
  onStartDrag: (event: PointerEvent) => void;
}>();

const { viewModel } = useViewModel();

const renaming = ref(false);
const tempName = ref("");
const renameInputEl = ref<HTMLInputElement | null>(null);
const showContextMenu = ref(false);
const contextMenuItems = computed(() => [
  { value: "rename", label: "Rename" },
  { value: "delete", label: "Delete" },
]);

const openContextMenu = () => {
  showContextMenu.value = true;
};

const doneRenaming = () => {
  renaming.value = false;
  if (tempName.value.trim()) {
    props.node.title = tempName.value.trim();
  }
};

const onContextMenuClick = async (action: string) => {
  switch (action) {
    case "delete":
      viewModel.value.displayedGraph.removeNode(props.node);
      break;
    case "rename":
      tempName.value = props.node.title;
      renaming.value = true;
      await nextTick();
      renameInputEl.value?.focus();
      break;
    default:
      break;
  }
};

const displayedOutputs = computed(() =>
  Object.values(props.node.outputs || {}).filter((intf: any) => !intf.hidden) as any[]
);

const displayedInputs = computed(() => {
  dynamicInputsVersion.value;
  return Object.values(props.node.inputs || {}).filter((intf: any) => !intf.hidden) as any[];
});

const bySection = (section: string): any[] =>
  displayedInputs.value.filter((intf: any) => intf.__section === section);

const outputs = computed(() => displayedOutputs.value);
const inputs = computed(() => bySection("input"));
const attrs = computed(() => bySection("attr"));
const isComponentTransfer = computed(() => props.node.type === "feComponentTransfer");

const groupAttrs = (list: any[]) => {
  const groups: Array<{ id: string; label: string; items: any[] }> = [];
  let current: { id: string; label: string; items: any[] } | null = null;
  list.forEach((intf: any) => {
    if (intf.__isGroup) {
      current = { id: intf.id, label: intf.name || "", items: [] };
      groups.push(current);
      return;
    }
    if (!current) {
      current = { id: "default", label: "", items: [] };
      groups.push(current);
    }
    current.items.push(intf);
  });
  return groups;
};

const attrGroups = computed(() =>
  groupAttrs(attrs.value).filter((group) => group.label !== "属性")
);
const desc = computed(() => bySection("desc"));

const classes = computed(() => ({
  "--selected": props.selected,
  "--dragging": props.dragging,
}));

const classesContent = computed(() => ({
  "--reverse-y": props.node.reverseY ?? viewModel.value.settings.nodes.reverseY,
}));

const styles = computed(() => ({
  top: `${props.node.position?.y ?? 0}px`,
  left: `${props.node.position?.x ?? 0}px`,
  "--width": `${props.node.width ?? viewModel.value.settings.nodes.defaultWidth}px`,
}));

const NodeInterface = Components.NodeInterface;
const ContextMenu = Components.ContextMenu;
</script>

<template>
  <div
    :id="node.id"
    class="baklava-node"
    :class="classes"
    :data-node-type="node.type"
    :style="styles"
    @pointerdown="onSelect"
  >
    <div
      class="__title"
      @pointerdown.stop="(event) => { onSelect(event); onStartDrag(event); }"
      @contextmenu.prevent="openContextMenu"
    >
      <template v-if="!renaming">
        <div class="__title-label">{{ node.title }}</div>
        <div class="__menu">
          <button type="button" class="baklava-toolbar-entry baklava-toolbar-button --clickable" title="菜单" @click.stop.prevent="openContextMenu">⋮</button>
          <ContextMenu
            :model-value="showContextMenu"
            :items="contextMenuItems"
            :x="0"
            :y="0"
            @update:model-value="showContextMenu = $event"
            @click="onContextMenuClick"
          />
        </div>
      </template>
      <input
        v-else
        ref="renameInputEl"
        v-model="tempName"
        type="text"
        class="baklava-input"
        placeholder="Node Name"
        @blur="doneRenaming"
        @keydown.enter="doneRenaming"
      />
    </div>
    <div class="__content" :class="classesContent">
      <div class="__outputs">
        <NodeInterface v-for="output in outputs" :key="output.id" :node="node" :intf="output" />
      </div>
      <div class="__inputs-section">
        <NodeInterface v-for="input in inputs" :key="input.id" :node="node" :intf="input" />
      </div>
      <div class="__attrs">
        <template v-if="isComponentTransfer">
          <div class="func-grid">
            <div v-for="group in attrGroups" :key="group.id" class="func-group">
              <div class="func-title">{{ group.label }}</div>
              <NodeInterface
                v-for="item in group.items"
                :key="item.id"
                :node="node"
                :intf="item"
              />
            </div>
          </div>
        </template>
        <template v-else>
          <NodeInterface v-for="attr in attrs" :key="attr.id" :node="node" :intf="attr" />
        </template>
      </div>
      <div class="__desc">
        <NodeInterface v-for="item in desc" :key="item.id" :node="node" :intf="item" />
      </div>
    </div>
  </div>
</template>
