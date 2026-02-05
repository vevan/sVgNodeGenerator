import type { FeNodeFactory } from "./types";

const feConvolveMatrix: FeNodeFactory = ({ textPort, textAttr, selectAttr }) => ({
  type: "feConvolveMatrix",
  title: "卷积矩阵",
  description: "用卷积核对图像进行锐化、模糊或边缘检测。",
  inputs: {
    in: () => textPort("输入 in（默认 SourceGraphic）", "SourceGraphic"),
    order: () => textAttr("矩阵尺寸 order", "3 3"),
    kernelMatrix: () => textAttr("卷积核 kernelMatrix", "0 -1 0 -1 5 -1 0 -1 0"),
    divisor: () => textAttr("除数 divisor", ""),
    bias: () => textAttr("偏置 bias", "0"),
    targetX: () => textAttr("中心点 X targetX", ""),
    targetY: () => textAttr("中心点 Y targetY", ""),
    edgeMode: () => selectAttr("边缘模式 edgeMode", "duplicate", ["duplicate", "wrap", "none"]),
    kernelUnitLength: () => textAttr("单位长度 kernelUnitLength", ""),
    preserveAlpha: () =>
      selectAttr("保留透明 preserveAlpha", "false", ["true", "false"]),
  },
});

export default feConvolveMatrix;
