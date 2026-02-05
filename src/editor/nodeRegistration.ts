import { markRaw } from "vue";
import { defineNode, SelectInterface, TextInputInterface, TextInterface, useBaklava } from "baklavajs";
import DynamicInputsControl from "../components/DynamicInputsControl.vue";
import InterfaceTextInput from "../components/InterfaceTextInput.vue";
import LightTypeControl from "../components/LightTypeControl.vue";
import NodeDescription from "../components/NodeDescription.vue";
import GroupDivider from "../components/GroupDivider.vue";
import ImageFilePicker from "../components/ImageFilePicker.vue";
import type { FeNodeFactory } from "../nodes/types";
import feGaussianBlur from "../nodes/feGaussianBlur";
import feColorMatrix from "../nodes/feColorMatrix";
import feComponentTransfer from "../nodes/feComponentTransfer";
import feOffset from "../nodes/feOffset";
import feBlend from "../nodes/feBlend";
import feComposite from "../nodes/feComposite";
import feConvolveMatrix from "../nodes/feConvolveMatrix";
import feDiffuseLighting from "../nodes/feDiffuseLighting";
import feDisplacementMap from "../nodes/feDisplacementMap";
import feDropShadow from "../nodes/feDropShadow";
import feFlood from "../nodes/feFlood";
import feImage from "../nodes/feImage";
import feMerge from "../nodes/feMerge";
import feMorphology from "../nodes/feMorphology";
import feSpecularLighting from "../nodes/feSpecularLighting";
import feTile from "../nodes/feTile";
import feTurbulence from "../nodes/feTurbulence";

const NODE_FACTORIES: FeNodeFactory[] = [
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

export function createNodeRegistration() {
  const baklava = useBaklava();

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

  const helpers = {
    textPort,
    textAttr,
    selectAttr,
    textInfo,
    textControl,
    lightControl,
    groupDivider,
    imagePicker,
  };

  const isInputKey = (key: string) =>
    key === "in" || key === "in2" || /^in\d+$/.test(key) || key === "__controls";

  const defineFeNode = (def: {
    type: string;
    title: string;
    description: string;
    inputs: Record<string, () => any>;
    outputs?: Record<string, () => any>;
    onCreate?: (node: any) => void;
    onPlaced?: (node: any) => void;
  }) => {
    const withSection = (section: string, key: string, factory: () => any) => {
      return () => {
        const intf = factory();
        intf.__section = section;
        if (key.startsWith("__group")) intf.__isGroup = true;
        return intf;
      };
    };

    const buildInputs = (rawInputs: Record<string, () => any>) => {
      const inputEntries: Array<[string, () => any]> = [];
      const attrEntries: Array<[string, () => any]> = [];
      const descEntries: Array<[string, () => any]> = [];

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
          if (key.startsWith("__group")) intf.__isGroup = true;
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

    const rawInputs = { ...def.inputs, __desc: () => textInfo(def.description) };
    const rawOutputs = def.outputs ?? { result: () => textPort("结果 result", "") };
    const displayTitle = `${def.type}\n${def.title}`;

    return defineNode({
      type: def.type,
      title: displayTitle,
      inputs: buildInputs(rawInputs),
      outputs: buildOutputs(rawOutputs),
      onCreate(this: any) {
        def.onCreate?.(this);
      },
      onPlaced(this: any) {
        def.onPlaced?.(this);
      },
    });
  };

  const nodeDefinitions = NODE_FACTORIES.map((f) => f(helpers));
  nodeDefinitions.sort((a, b) => a.type.localeCompare(b.type));

  const nodeTypes = nodeDefinitions.map((d) => defineFeNode(d)) as any[];
  nodeTypes.forEach((nt: any) => baklava.editor.registerNodeType(nt));

  const getNodeCtor = (type: string) => baklava.editor.nodeTypes.get(type)?.type;

  return { baklava, getNodeCtor };
}
