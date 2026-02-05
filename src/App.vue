<script setup lang="ts">
import { computed, markRaw, onMounted, onUnmounted, ref } from "vue";
import {
  BaklavaEditor,
  SelectInterface,
  TextInputInterface,
  TextInterface,
  defineNode,
  useBaklava,
} from "baklavajs";
import DynamicInputsControl from "./components/DynamicInputsControl.vue";
import InterfaceTextInput from "./components/InterfaceTextInput.vue";
import LightTypeControl from "./components/LightTypeControl.vue";
import NodeDescription from "./components/NodeDescription.vue";
import GroupDivider from "./components/GroupDivider.vue";
import ImageFilePicker from "./components/ImageFilePicker.vue";
import CustomNode from "./components/CustomNode.vue";
import PreviewPane from "./components/PreviewPane.vue";
import feGaussianBlur from "./nodes/feGaussianBlur";
import feColorMatrix from "./nodes/feColorMatrix";
import feComponentTransfer from "./nodes/feComponentTransfer";
import feOffset from "./nodes/feOffset";
import feBlend from "./nodes/feBlend";
import feComposite from "./nodes/feComposite";
import feConvolveMatrix from "./nodes/feConvolveMatrix";
import feDiffuseLighting from "./nodes/feDiffuseLighting";
import feDisplacementMap from "./nodes/feDisplacementMap";
import feDropShadow from "./nodes/feDropShadow";
import feFlood from "./nodes/feFlood";
import feImage from "./nodes/feImage";
import feMerge from "./nodes/feMerge";
import feMorphology from "./nodes/feMorphology";
import feSpecularLighting from "./nodes/feSpecularLighting";
import feTile from "./nodes/feTile";
import feTurbulence from "./nodes/feTurbulence";
import type { FeNodeFactory } from "./nodes/types";

const baklava = useBaklava();

type AnyNode = any;
type AnyConnection = any;
type AnyInterface = any;

const textPort = (label: string, value: string) =>
  new TextInputInterface(label, value)
    .setComponent(markRaw(InterfaceTextInput))
    .setPort(true);

const textAttr = (label: string, value: string) =>
  new TextInputInterface(label, value)
    .setComponent(markRaw(InterfaceTextInput))
    .setPort(false);

const selectAttr = (label: string, value: string, options: string[]) =>
  new SelectInterface(label, value, options).setPort(false);

const textControl = (label: string) =>
  new TextInterface(label, "")
    .setComponent(markRaw(DynamicInputsControl))
    .setPort(false);

const lightControl = (label: string) =>
  new TextInterface(label, "")
    .setComponent(markRaw(LightTypeControl))
    .setPort(false);

const groupDivider = (label: string) =>
  new TextInterface(label, "")
    .setComponent(markRaw(GroupDivider))
    .setPort(false);

const imagePicker = (label: string) =>
  new TextInterface(label, "")
    .setComponent(markRaw(ImageFilePicker))
    .setPort(false);

const textInfo = (text: string) =>
  new TextInterface("说明", text)
    .setComponent(markRaw(NodeDescription))
    .setPort(false);

const defineFeNode = ({
  type,
  title,
  description,
  inputs,
  outputs,
  onCreate,
  onPlaced,
}: {
  type: string;
  title: string;
  description: string;
  inputs: Record<string, () => any>;
  outputs?: Record<string, () => any>;
  onCreate?: (node: any) => void;
  onPlaced?: (node: any) => void;
}) => {
  const isInputKey = (key: string) =>
    key === "in" || key === "in2" || /^in\\d+$/.test(key) || key === "__controls";

  const buildInputs = (rawInputs: Record<string, () => any>) => {
    const inputEntries: Array<[string, () => any]> = [];
    const attrEntries: Array<[string, () => any]> = [];
    const descEntries: Array<[string, () => any]> = [];

    const withSection = (section: string, key: string, factory: () => any) => {
      return () => {
        const intf = factory();
        intf.__section = section;
        if (key.startsWith("__group")) {
          intf.__isGroup = true;
        }
        return intf;
      };
    };

    Object.entries(rawInputs).forEach(([key, factory]) => {
      if (key === "__desc") {
        descEntries.push([key, withSection("desc", key, factory)]);
        return;
      }
      if (isInputKey(key)) {
        inputEntries.push([key, withSection("input", key, factory)]);
        return;
      }
      attrEntries.push([key, withSection("attr", key, factory)]);
    });

    const ordered: Record<string, () => any> = {};
    if (inputEntries.length) {
      ordered.__groupInput = withSection("input", "__groupInput", () => groupDivider("输入"));
      inputEntries.forEach(([key, factory]) => {
        ordered[key] = factory;
      });
    }
    if (attrEntries.length) {
      ordered.__groupAttrs = withSection("attr", "__groupAttrs", () => groupDivider("属性"));
      attrEntries.forEach(([key, factory]) => {
        ordered[key] = factory;
      });
    }
    if (descEntries.length) {
      ordered.__groupDesc = withSection("desc", "__groupDesc", () => groupDivider("说明"));
      descEntries.forEach(([key, factory]) => {
        ordered[key] = factory;
      });
    }
    return ordered;
  };

  const buildOutputs = (rawOutputs: Record<string, () => any>) => {
    const withSection = (key: string, factory: () => any) => {
      return () => {
        const intf = factory();
        intf.__section = "output";
        if (key.startsWith("__group")) {
          intf.__isGroup = true;
        }
        return intf;
      };
    };
    const ordered: Record<string, () => any> = {};
    ordered.__groupOutputs = withSection("__groupOutputs", () => groupDivider("输出"));
    Object.entries(rawOutputs).forEach(([key, factory]) => {
      ordered[key] = withSection(key, factory);
    });
    return ordered;
  };

  const rawInputs = {
    ...inputs,
    __desc: () => textInfo(description),
  };

  const rawOutputs = outputs || { result: () => textPort("结果 result", "") };

  const displayTitle = `${type}\n${title}`;
  return defineNode({
    type,
    title: displayTitle,
    inputs: buildInputs(rawInputs),
    outputs: buildOutputs(rawOutputs),
    onCreate(this: any) {
      onCreate?.(this);
    },
    onPlaced(this: any) {
      onPlaced?.(this);
    },
  });
};
const nodeFactories: FeNodeFactory[] = [
  feGaussianBlur,
  feColorMatrix,
  feComponentTransfer,
  feOffset,
  feBlend,
  feComposite,
  feConvolveMatrix,
  feDiffuseLighting,
  feDisplacementMap,
  feDropShadow,
  feFlood,
  feImage,
  feMerge,
  feMorphology,
  feSpecularLighting,
  feTile,
  feTurbulence,
];

const nodeDefinitions = nodeFactories.map((factory) =>
  factory({
    textPort,
    textAttr,
    selectAttr,
    textInfo,
    textControl,
    lightControl,
    groupDivider,
    imagePicker,
  })
);

nodeDefinitions.sort((a, b) => a.type.localeCompare(b.type));

const nodeTypes = nodeDefinitions.map((definition) => defineFeNode(definition)) as any[];

nodeTypes.forEach((nodeType: any) => baklava.editor.registerNodeType(nodeType));

const getNodeCtor = (type: string) =>
  nodeTypes.find((nodeType: any) => nodeType.type === type);

const EDITOR_STORAGE_KEY = "svgfilter-editor";

function loadEditorState(): unknown | null {
  try {
    const raw = localStorage.getItem(EDITOR_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

function saveEditorState() {
  try {
    const state = baklava.editor.save();
    localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function clearEditorGraph() {
  const graph = baklava.editor.graph;
  const nodes = Array.from(graph.nodes);
  nodes.forEach((node) => graph.removeNode(node));
  saveEditorState();
}

const seedNodes = () => {
  const BlurCtor = getNodeCtor("feGaussianBlur");
  const MatrixCtor = getNodeCtor("feColorMatrix");
  if (!BlurCtor || !MatrixCtor) {
    return;
  }
  const blurNode = new BlurCtor();
  const matrixNode = new MatrixCtor();
  baklava.editor.graph.addNode(blurNode);
  baklava.editor.graph.addNode(matrixNode);
  baklava.editor.graph.addConnection(blurNode.outputs.result, matrixNode.inputs.in);
};

const savedState = loadEditorState();
if (savedState && typeof savedState === "object" && savedState !== null && "graph" in savedState) {
  const warnings = baklava.editor.load(savedState as Parameters<typeof baklava.editor.load>[0]);
  if (warnings.length > 0) {
    console.warn("[svgfilter] 恢复编辑器状态时有警告:", warnings);
  }
} else {
  seedNodes();
}

const buildGraphSnapshot = () => {
  const graph = baklava.editor.graph;
  const nodes = Array.from(graph.nodes) as AnyNode[];
  const connections = Array.from(graph.connections) as AnyConnection[];

  const nodeById = new Map(nodes.map((node: AnyNode) => [node.id, node]));
  const outputInterfaceToNode = new Map();
  const inputConnections = new Map();

  nodes.forEach((node: AnyNode) => {
    Object.values(node.outputs).forEach((output: AnyInterface) => {
      if (output) {
        outputInterfaceToNode.set(output.id, node.id);
      }
    });
  });

  connections.forEach((connection: AnyConnection) => {
    inputConnections.set(connection.to.id, connection.from.id);
  });

  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, Set<string>>();
  nodes.forEach((node: AnyNode) => {
    incoming.set(node.id, new Set());
    outgoing.set(node.id, new Set());
  });

  connections.forEach((connection: AnyConnection) => {
    const fromId = connection.from.nodeId;
    const toId = connection.to.nodeId;
    const incomingSet = incoming.get(toId) || new Set<string>();
    incomingSet.add(fromId);
    incoming.set(toId, incomingSet);

    const outgoingSet = outgoing.get(fromId) || new Set<string>();
    outgoingSet.add(toId);
    outgoing.set(fromId, outgoingSet);
  });

  const queue: string[] = [];
  incoming.forEach((deps, nodeId) => {
    if (deps.size === 0) {
      queue.push(nodeId);
    }
  });

  const ordered: AnyNode[] = [];
  while (queue.length) {
    const nodeId = queue.shift();
    if (!nodeId) {
      continue;
    }
    const nextNode = nodeById.get(nodeId);
    if (nextNode) {
      ordered.push(nextNode);
    }
    const deps = outgoing.get(nodeId) || new Set<string>();
    deps.forEach((nextId) => {
      const incomingSet = incoming.get(nextId);
      if (incomingSet) {
        incomingSet.delete(nodeId);
        if (incomingSet.size === 0) {
          queue.push(nextId);
        }
      }
    });
  }

  if (ordered.length !== nodes.length) {
    nodes.forEach((node: AnyNode) => {
      if (!ordered.includes(node)) {
        ordered.push(node);
      }
    });
  }

  return {
    orderedNodes: ordered.filter(Boolean),
    inputConnections,
    outputInterfaceToNode,
  };
};

const buildFilterMarkup = () => {
  const { orderedNodes, inputConnections, outputInterfaceToNode } =
    buildGraphSnapshot();

  const resultMap = new Map<string, string>();

  orderedNodes.forEach((node: AnyNode) => {
    if (!node) {
      return;
    }
    const resultOutput = node.outputs?.result;
    const resultValue = resultOutput?.value?.trim();
    const resultName =
      resultValue || `result_${node.id.replace(/-/g, "").slice(0, 6)}`;
    resultMap.set(node.id, resultName);
  });

  const resolveInput = (inputInterface: AnyInterface) => {
    if (!inputInterface) {
      return "";
    }
    const connectedOutputId = inputConnections.get(inputInterface.id);
    if (connectedOutputId) {
      const sourceNodeId = outputInterfaceToNode.get(connectedOutputId);
      if (sourceNodeId) {
        return resultMap.get(sourceNodeId) || "";
      }
    }
    return inputInterface.value?.trim() || "";
  };

  const buildAttrs = (entries: Array<[string, string]>) =>
    entries
      .filter(([, value]) => value !== "" && value !== undefined && value !== null)
      .map(([key, value]) => `${key}="${value}"`)
      .join(" ");

  const getValue = (node: AnyNode, key: string) =>
    node.inputs?.[key]?.value?.trim?.() ?? "";

  const buildLightChild = (node: AnyNode) => {
    const lightType = getValue(node, "lightType").toLowerCase();
    if (lightType === "point") {
      const attrs = buildAttrs([
        ["x", getValue(node, "x")],
        ["y", getValue(node, "y")],
        ["z", getValue(node, "z")],
      ]);
      return `<fePointLight ${attrs} />`;
    }
    if (lightType === "spot") {
      const attrs = buildAttrs([
        ["x", getValue(node, "x")],
        ["y", getValue(node, "y")],
        ["z", getValue(node, "z")],
        ["pointsAtX", getValue(node, "pointsAtX")],
        ["pointsAtY", getValue(node, "pointsAtY")],
        ["pointsAtZ", getValue(node, "pointsAtZ")],
        ["limitingConeAngle", getValue(node, "limitingConeAngle")],
      ]);
      return `<feSpotLight ${attrs} />`;
    }
    const attrs = buildAttrs([
      ["azimuth", getValue(node, "azimuth")],
      ["elevation", getValue(node, "elevation")],
    ]);
    return `<feDistantLight ${attrs} />`;
  };

  const lines = orderedNodes.map((node) => {
    if (!node) {
      return "";
    }
    const type = node.type;
    if (type === "feComponentTransfer") {
      const attrs: Array<[string, string]> = [];
      const inValue = resolveInput(node.inputs?.in);
      if (inValue) {
        attrs.push(["in", inValue]);
      }
      const resultName = resultMap.get(node.id) || "";
      attrs.push(["result", resultName]);
      const attrText = buildAttrs(attrs);

      const buildFunc = (tag: string, prefix: string) => {
        const funcType = getValue(node, `${prefix}Type`);
        const funcValues = getValue(node, `${prefix}TableValues`);
        const funcSlope = getValue(node, `${prefix}Slope`);
        const funcIntercept = getValue(node, `${prefix}Intercept`);
        const funcAmplitude = getValue(node, `${prefix}Amplitude`);
        const funcExponent = getValue(node, `${prefix}Exponent`);
        const funcOffset = getValue(node, `${prefix}Offset`);
        if (
          !funcType &&
          !funcValues &&
          !funcSlope &&
          !funcIntercept &&
          !funcAmplitude &&
          !funcExponent &&
          !funcOffset
        ) {
          return "";
        }
        const funcAttrs = buildAttrs([
          ["type", funcType],
          ["tableValues", funcValues],
          ["slope", funcSlope],
          ["intercept", funcIntercept],
          ["amplitude", funcAmplitude],
          ["exponent", funcExponent],
          ["offset", funcOffset],
        ]);
        return funcAttrs ? `<${tag} ${funcAttrs} />` : `<${tag} />`;
      };

      const children = [
        buildFunc("feFuncR", "funcR"),
        buildFunc("feFuncG", "funcG"),
        buildFunc("feFuncB", "funcB"),
        buildFunc("feFuncA", "funcA"),
      ].filter((item) => item);

      if (children.length === 0) {
        return attrText ? `<feComponentTransfer ${attrText} />` : `<feComponentTransfer />`;
      }

      return `<feComponentTransfer ${attrText}>\n  ${children.join("\n  ")}\n</feComponentTransfer>`;
    }

    if (type === "feDiffuseLighting" || type === "feSpecularLighting") {
      const attrs: Array<[string, string]> = [];
      const inValue = resolveInput(node.inputs?.in);
      if (inValue) {
        attrs.push(["in", inValue]);
      }
      attrs.push(["lighting-color", getValue(node, "lightingColor")]);
      attrs.push(["surfaceScale", getValue(node, "surfaceScale")]);
      attrs.push(["kernelUnitLength", getValue(node, "kernelUnitLength")]);
      if (type === "feDiffuseLighting") {
        attrs.push(["diffuseConstant", getValue(node, "diffuseConstant")]);
      } else {
        attrs.push(["specularConstant", getValue(node, "specularConstant")]);
        attrs.push(["specularExponent", getValue(node, "specularExponent")]);
      }
      const resultName = resultMap.get(node.id) || "";
      attrs.push(["result", resultName]);
      const attrText = buildAttrs(attrs);
      const lightChild = buildLightChild(node);
      return `<${type} ${attrText}>\n  ${lightChild}\n</${type}>`;
    }

    if (type === "feMerge") {
      const inputKeys = Object.keys(node.inputs || {})
        .filter((key) => /^in\d+$/.test(key))
        .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));
      const ins = inputKeys
        .map((key) => resolveInput(node.inputs?.[key]))
        .filter((value) => value);
      const result = resultMap.get(node.id);
      const attr = buildAttrs([["result", result || ""]]);
      const nodes = ins.map((value) => `  <feMergeNode in="${value}" />`).join("\n");
      return `<feMerge ${attr}>\n${nodes}\n</feMerge>`;
    }

    const attrs: Array<[string, string]> = [];
    if (node.inputs?.in) {
      const inValue = resolveInput(node.inputs.in);
      attrs.push(["in", inValue]);
    }
    if (node.inputs?.in2) {
      const inValue = resolveInput(node.inputs.in2);
      attrs.push(["in2", inValue]);
    }

    Object.entries(node.inputs || {}).forEach(([key, input]: [string, AnyInterface]) => {
      if (key === "in" || key === "in2" || key.startsWith("__")) {
        return;
      }
      attrs.push([key, input.value?.trim() || ""]);
    });

    const resultName = resultMap.get(node.id) || "";
    attrs.push(["result", resultName]);

    const attrText = buildAttrs(attrs);
    return attrText ? `<${type} ${attrText} />` : `<${type} />`;
  });

  return lines.filter(Boolean).join("\n");
};

const filterId = "test";
const filterMarkup = ref("");
const filterCode = computed(
  () => `<filter id="${filterId}">\n${filterMarkup.value}\n</filter>`
);

let refreshTimer: number | undefined;
let saveEditorTimer: number | undefined;
onMounted(() => {
  const updatePreview = () => {
    filterMarkup.value = buildFilterMarkup();
  };
  updatePreview();
  refreshTimer = window.setInterval(updatePreview, 300);
  saveEditorTimer = window.setInterval(saveEditorState, 800);
  window.addEventListener("beforeunload", saveEditorState);
});

onUnmounted(() => {
  if (refreshTimer) {
    window.clearInterval(refreshTimer);
  }
  if (saveEditorTimer) {
    window.clearInterval(saveEditorTimer);
  }
  window.removeEventListener("beforeunload", saveEditorState);
});
</script>

<template>
  <div class="app">
    <section class="pane pane-editor">
      <div class="pane-title">节点编辑器</div>
      <div class="editor-wrap">
        <BaklavaEditor :view-model="baklava">
          <template
            #node="{ node, selected, dragging, onSelect, onStartDrag }"
          >
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
        :on-clear-editor="clearEditorGraph"
      />
      <div class="pane-title">滤镜代码</div>
      <pre class="filter-code">{{ filterCode }}</pre>
    </section>
  </div>
</template>

<style>
  .baklava-node > .__content > div > div{
    margin: 0;
  }
</style>