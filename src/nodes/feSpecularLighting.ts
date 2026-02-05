import type { FeNodeFactory } from "./types";

const feSpecularLighting: FeNodeFactory = ({
  textPort,
  textAttr,
  selectAttr,
  lightControl,
}) => ({
  type: "feSpecularLighting",
  title: "高光反射",
  description: "基于光源对输入高度图进行高光渲染。",
  inputs: {
    in: () => textPort("输入 in（默认 SourceGraphic）", "SourceGraphic"),
    lightingColor: () => textAttr("光照颜色 lighting-color", "#ffffff").setHidden(true),
    surfaceScale: () => textAttr("表面缩放 surfaceScale", "1").setHidden(true),
    specularConstant: () => textAttr("高光系数 specularConstant", "1").setHidden(true),
    specularExponent: () => textAttr("高光指数 specularExponent", "20").setHidden(true),
    kernelUnitLength: () => textAttr("单位长度 kernelUnitLength", "").setHidden(true),
    lightType: () =>
      selectAttr("光源类型 lightType", "distant", ["distant", "point", "spot"]).setHidden(
        true
      ),
    azimuth: () => textAttr("方位角 azimuth", "45").setHidden(true),
    elevation: () => textAttr("仰角 elevation", "60").setHidden(true),
    x: () => textAttr("点光源 x", "0").setHidden(true),
    y: () => textAttr("点光源 y", "0").setHidden(true),
    z: () => textAttr("点光源 z", "10").setHidden(true),
    pointsAtX: () => textAttr("聚光点 pointsAtX", "0").setHidden(true),
    pointsAtY: () => textAttr("聚光点 pointsAtY", "0").setHidden(true),
    pointsAtZ: () => textAttr("聚光点 pointsAtZ", "0").setHidden(true),
    limitingConeAngle: () => textAttr("锥角 limitingConeAngle", "30").setHidden(true),
    __light: () => lightControl("光源设置"),
  },
});

export default feSpecularLighting;
