import type { FeNodeFactory } from "./types";

const showWhen = (
  intf: any,
  typeKey: string,
  values: string[]
) => {
  intf.__showWhen = { typeKey, values };
  return intf;
};

const feComponentTransfer: FeNodeFactory = ({
  textPort,
  textAttr,
  selectAttr,
  groupDivider,
}) => ({
  type: "feComponentTransfer",
  title: "分量传递",
  description: "对 RGBA 分量做表映射/线性/伽马等变换。",
  inputs: {
    in: () => textPort("输入 in（默认 SourceGraphic）", "SourceGraphic"),
    __groupR: () => groupDivider("R 通道"),
    funcRType: () =>
      selectAttr("R 类型 funcR type", "linear", [
        "identity",
        "table",
        "discrete",
        "linear",
        "gamma",
      ]),
    funcRTableValues: () =>
      showWhen(textAttr("R tableValues", ""), "funcRType", ["table", "discrete"]),
    funcRSlope: () => showWhen(textAttr("R slope", "1"), "funcRType", ["linear"]),
    funcRIntercept: () =>
      showWhen(textAttr("R intercept", "0"), "funcRType", ["linear"]),
    funcRAmplitude: () =>
      showWhen(textAttr("R amplitude", "1"), "funcRType", ["gamma"]),
    funcRExponent: () =>
      showWhen(textAttr("R exponent", "1"), "funcRType", ["gamma"]),
    funcROffset: () => showWhen(textAttr("R offset", "0"), "funcRType", ["gamma"]),
    __groupG: () => groupDivider("G 通道"),
    funcGType: () =>
      selectAttr("G 类型 funcG type", "linear", [
        "identity",
        "table",
        "discrete",
        "linear",
        "gamma",
      ]),
    funcGTableValues: () =>
      showWhen(textAttr("G tableValues", ""), "funcGType", ["table", "discrete"]),
    funcGSlope: () => showWhen(textAttr("G slope", "1"), "funcGType", ["linear"]),
    funcGIntercept: () =>
      showWhen(textAttr("G intercept", "0"), "funcGType", ["linear"]),
    funcGAmplitude: () =>
      showWhen(textAttr("G amplitude", "1"), "funcGType", ["gamma"]),
    funcGExponent: () =>
      showWhen(textAttr("G exponent", "1"), "funcGType", ["gamma"]),
    funcGOffset: () => showWhen(textAttr("G offset", "0"), "funcGType", ["gamma"]),
    __groupB: () => groupDivider("B 通道"),
    funcBType: () =>
      selectAttr("B 类型 funcB type", "linear", [
        "identity",
        "table",
        "discrete",
        "linear",
        "gamma",
      ]),
    funcBTableValues: () =>
      showWhen(textAttr("B tableValues", ""), "funcBType", ["table", "discrete"]),
    funcBSlope: () => showWhen(textAttr("B slope", "1"), "funcBType", ["linear"]),
    funcBIntercept: () =>
      showWhen(textAttr("B intercept", "0"), "funcBType", ["linear"]),
    funcBAmplitude: () =>
      showWhen(textAttr("B amplitude", "1"), "funcBType", ["gamma"]),
    funcBExponent: () =>
      showWhen(textAttr("B exponent", "1"), "funcBType", ["gamma"]),
    funcBOffset: () => showWhen(textAttr("B offset", "0"), "funcBType", ["gamma"]),
    __groupA: () => groupDivider("A 通道"),
    funcAType: () =>
      selectAttr("A 类型 funcA type", "linear", [
        "identity",
        "table",
        "discrete",
        "linear",
        "gamma",
      ]),
    funcATableValues: () =>
      showWhen(textAttr("A tableValues", ""), "funcAType", ["table", "discrete"]),
    funcASlope: () => showWhen(textAttr("A slope", "1"), "funcAType", ["linear"]),
    funcAIntercept: () =>
      showWhen(textAttr("A intercept", "0"), "funcAType", ["linear"]),
    funcAAmplitude: () =>
      showWhen(textAttr("A amplitude", "1"), "funcAType", ["gamma"]),
    funcAExponent: () =>
      showWhen(textAttr("A exponent", "1"), "funcAType", ["gamma"]),
    funcAOffset: () => showWhen(textAttr("A offset", "0"), "funcAType", ["gamma"]),
  },
  onCreate(node) {
    node.width = 320;
  },
});

export default feComponentTransfer;
