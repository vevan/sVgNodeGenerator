import type { FeNodeFactory } from "./types";
import { attachDynamicInputs } from "./dynamicInputs";

const feMerge: FeNodeFactory = ({ textPort, textControl }) => ({
  type: "feMerge",
  title: "合并",
  description: "把多路输入依次合并为一个输出。",
  inputs: {
    __controls: () => textControl("输入管理"),
  },
  onCreate(node) {
    attachDynamicInputs(node, {
      baseKey: "in",
      labelPrefix: "输入",
      minCount: 1,
      initialCount: 2,
      createInput: (index, key, label) =>
        textPort(label, index === 1 ? "SourceGraphic" : ""),
    });
  },
  onPlaced(node) {
    attachDynamicInputs(node, {
      baseKey: "in",
      labelPrefix: "输入",
      minCount: 1,
      initialCount: 2,
      createInput: (index, key, label) =>
        textPort(label, index === 1 ? "SourceGraphic" : ""),
    });
  },
});

export default feMerge;
