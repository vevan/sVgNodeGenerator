import { addDynamicInput } from "../nodes/dynamicInputs";
import {
  parseFilterMarkup,
  parsedToInputValues,
  type ParsedElement,
} from "../parseFilterMarkup";
const PARSED_TAG_TO_NODE_TYPE: Record<string, string> = {
  feblend: "feBlend",
  fecolormatrix: "feColorMatrix",
  fecomponenttransfer: "feComponentTransfer",
  fecomposite: "feComposite",
  feconvolvematrix: "feConvolveMatrix",
  fediffuselighting: "feDiffuseLighting",
  fedisplacementmap: "feDisplacementMap",
  fedropshadow: "feDropShadow",
  feflood: "feFlood",
  fegaussianblur: "feGaussianBlur",
  feimage: "feImage",
  femerge: "feMerge",
  femorphology: "feMorphology",
  feoffset: "feOffset",
  fespecularlighting: "feSpecularLighting",
  fetile: "feTile",
  feturbulence: "feTurbulence",
};

function parsedTagToNodeType(tag: string): string {
  const lower = tag.toLowerCase();
  return (
    PARSED_TAG_TO_NODE_TYPE[lower] ??
    "fe" + tag.slice(2, 3).toUpperCase() + tag.slice(3).toLowerCase()
  );
}

function setNodeInputValue(node: any, key: string, value: string) {
  const input = node.inputs?.[key];
  if (input && typeof input.value !== "undefined") {
    input.value = value;
  }
}

export type ApplyCodeOptions = {
  graph: { addNode: (n: any) => void; addConnection: (a: any, b: any) => void };
  getNodeCtor: (type: string) => (new () => any) | undefined;
  clearGraph: () => void;
  saveState: () => void;
};

/**
 * 将解析后的 filter 元素应用到编辑器图：清空图、创建节点、设置属性、建立连线。
 * 不负责更新 UI 状态（如 filterCodeText），由调用方在成功后自行同步。
 */
export function applyParsedToGraph(
  rawCode: string,
  options: ApplyCodeOptions
): { success: boolean; error?: string } {
  const { graph, getNodeCtor, clearGraph, saveState } = options;
  let parsed: ParsedElement[];
  try {
    parsed = parseFilterMarkup(rawCode);
  } catch (e) {
    console.error("[svgfilter] 解析 filter 代码失败", e);
    return { success: false, error: "解析失败，请检查是否为合法的 SVG filter 代码。" };
  }
  if (parsed.length === 0) {
    return { success: false, error: "未解析到有效的 fe* 元素，请检查代码。" };
  }

  clearGraph();

  const resultToNode = new Map<string, any>();
  const nodesByIndex: any[] = [];
  const LAYOUT_DX = 240;

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i]!;
    const type = parsedTagToNodeType(p.tag);
    const Ctor = getNodeCtor(type);
    if (!Ctor) {
      console.warn("[svgfilter] 不支持的节点类型:", type);
      continue;
    }
    const node = new Ctor();
    node.position = { x: i * LAYOUT_DX, y: 0 };

    const inputValues = parsedToInputValues(p);
    for (const [key, value] of Object.entries(inputValues)) {
      if (value !== "") setNodeInputValue(node, key, value);
    }
    if (p.tag === "femerge" && p.mergeIns && p.mergeIns.length > 0) {
      for (let k = 3; k <= p.mergeIns.length; k++) addDynamicInput(node, k);
    }
    if (p.in !== undefined && p.in !== "") setNodeInputValue(node, "in", p.in);
    if (p.in2 !== undefined && p.in2 !== "") setNodeInputValue(node, "in2", p.in2);
    if (p.tag === "femerge" && p.mergeIns) {
      const keys = Object.keys(node.inputs || {})
        .filter((k) => /^in\d+$/.test(k))
        .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));
      p.mergeIns.forEach((inVal, idx) => {
        if (keys[idx]) setNodeInputValue(node, keys[idx], inVal);
      });
    }

    graph.addNode(node);
    nodesByIndex.push(node);
    if (p.result) resultToNode.set(p.result, node);
  }

  for (let i = 0; i < parsed.length; i++) {
    const p = parsed[i]!;
    const node = nodesByIndex[i];
    if (!node) continue;
    const connect = (inputKey: string, sourceResultName: string) => {
      const fromNode = resultToNode.get(sourceResultName);
      if (!fromNode?.outputs?.result) return;
      const toInput = node.inputs?.[inputKey];
      if (!toInput) return;
      try {
        graph.addConnection(fromNode.outputs.result, toInput);
      } catch {
        /* ignore */
      }
    };
    if (p.in && resultToNode.has(p.in)) {
      setNodeInputValue(node, "in", "");
      connect("in", p.in);
    }
    if (p.in2 && resultToNode.has(p.in2)) {
      setNodeInputValue(node, "in2", "");
      connect("in2", p.in2);
    }
    if (p.tag === "femerge" && p.mergeIns) {
      const keys = Object.keys(node.inputs || {})
        .filter((k) => /^in\d+$/.test(k))
        .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));
      p.mergeIns.forEach((inVal, idx) => {
        if (resultToNode.has(inVal) && keys[idx]) {
          setNodeInputValue(node, keys[idx], "");
          connect(keys[idx], inVal);
        }
      });
    }
  }

  saveState();
  return { success: true };
}
