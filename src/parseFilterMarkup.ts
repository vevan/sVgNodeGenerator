/**
 * 将 SVG filter 代码解析为结构化数据，用于反向生成节点图。
 */

export type ParsedFunc = {
  type?: string;
  tableValues?: string;
  slope?: string;
  intercept?: string;
  amplitude?: string;
  exponent?: string;
  offset?: string;
};

export type ParsedLight = {
  tag: "fePointLight" | "feSpotLight" | "feDistantLight";
  attrs: Record<string, string>;
};

export type ParsedElement = {
  tag: string;
  result?: string;
  in?: string;
  in2?: string;
  attrs: Record<string, string>;
  /** feMerge: 各 feMergeNode 的 in 值 */
  mergeIns?: string[];
  /** feComponentTransfer: 各通道函数 */
  funcR?: ParsedFunc;
  funcG?: ParsedFunc;
  funcB?: ParsedFunc;
  funcA?: ParsedFunc;
  /** feDiffuseLighting / feSpecularLighting: 光源子元素 */
  light?: ParsedLight;
};

const FE_TAGS = new Set([
  "feblend", "fecolormatrix", "fecomponenttransfer", "fecomposite", "feconvolvematrix",
  "fediffuselighting", "fedisplacementmap", "fedropshadow", "feflood", "fegaussianblur",
  "feimage", "femerge", "femorphology", "feoffset", "fespecularlighting", "fetile", "feturbulence",
]);

function getDirectChildren(el: Element): Element[] {
  return Array.from(el.children).filter((child) =>
    child.tagName && FE_TAGS.has(child.tagName.toLowerCase())
  );
}

function attrMap(el: Element): Record<string, string> {
  const out: Record<string, string> = {};
  for (const a of Array.from(el.attributes)) {
    out[a.name.toLowerCase()] = a.value;
  }
  return out;
}

/** SVG 属性名（小写/连字符）-> 节点 input key（camelCase） */
const SVG_ATTR_TO_INPUT: Record<string, string> = {
  "stddeviation": "stdDeviation",
  "kernelunitlength": "kernelUnitLength",
  "surfacescale": "surfaceScale",
  "diffuseconstant": "diffuseConstant",
  "specularconstant": "specularConstant",
  "specularexponent": "specularExponent",
  "lighting-color": "lightingColor",
  "limitingconeangle": "limitingConeAngle",
  "pointsatx": "pointsAtX",
  "pointsaty": "pointsAtY",
  "pointsatz": "pointsAtZ",
  "tablevalues": "tableValues",
  "kernelmatrix": "kernelMatrix",
  "order": "order",
  "preservealpha": "preserveAlpha",
  "edgemode": "edgeMode",
  "divisor": "divisor",
  "bias": "bias",
  "targetx": "targetX",
  "targety": "targetY",
  "scale": "scale",
  "xchannelselector": "xChannelSelector",
  "ychannelselector": "yChannelSelector",
  "flood-color": "flood-color",
  "flood-opacity": "flood-opacity",
};

function toInputKey(attrName: string): string {
  const lower = attrName.toLowerCase();
  return SVG_ATTR_TO_INPUT[lower] ?? lower.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function parseFuncEl(funcEl: Element): ParsedFunc {
  const a = attrMap(funcEl);
  return {
    type: a.type,
    tableValues: a.tablevalues,
    slope: a.slope,
    intercept: a.intercept,
    amplitude: a.amplitude,
    exponent: a.exponent,
    offset: a.offset,
  };
}

function parseLightEl(lightEl: Element): ParsedLight | undefined {
  const tag = lightEl.tagName.toLowerCase();
  if (tag === "fepointlight" || tag === "fespotlight" || tag === "fedistantlight") {
    const attrs: Record<string, string> = {};
    for (const a of Array.from(lightEl.attributes)) {
      attrs[toInputKey(a.name)] = a.value;
    }
    return {
      tag: tag as ParsedLight["tag"],
      attrs,
    };
  }
  return undefined;
}

function parseElement(el: Element): ParsedElement | null {
  const tag = el.tagName.toLowerCase();
  if (!FE_TAGS.has(tag)) return null;

  const a = attrMap(el);
  const inVal = a.in;
  const in2Val = a.in2;
  const resultVal = a.result;
  const attrs: Record<string, string> = {};
  for (const [k, v] of Object.entries(a)) {
    if (k === "in" || k === "in2" || k === "result") continue;
    attrs[toInputKey(k)] = v;
  }

  const out: ParsedElement = {
    tag,
    result: resultVal,
    in: inVal,
    in2: in2Val,
    attrs,
  };

  if (tag === "femerge") {
    const mergeNodes = Array.from(el.children).filter(
      (c) => c.tagName && c.tagName.toLowerCase() === "femergenode"
    );
    out.mergeIns = mergeNodes.map((n) => (n.getAttribute("in") || "").trim()).filter(Boolean);
  } else if (tag === "fecomponenttransfer") {
    for (const child of Array.from(el.children)) {
      const ct = child.tagName.toLowerCase();
      const func = parseFuncEl(child);
      if (ct === "funcr") out.funcR = func;
      else if (ct === "funcg") out.funcG = func;
      else if (ct === "funcb") out.funcB = func;
      else if (ct === "funca") out.funcA = func;
    }
  } else if (tag === "fediffuselighting" || tag === "fespecularlighting") {
    for (const child of Array.from(el.children)) {
      const light = parseLightEl(child);
      if (light) {
        out.light = light;
        break;
      }
    }
  }

  return out;
}

/**
 * 从完整 filter 代码或仅内部 markup 解析出 fe* 元素列表。
 * @param filterCode 例如 `<filter id="x">...</filter>` 或 `\n<feGaussianBlur .../>\n...`
 */
export function parseFilterMarkup(filterCode: string): ParsedElement[] {
  const trimmed = filterCode.trim();
  const wrapper = trimmed.startsWith("<filter")
    ? trimmed
    : `<filter id="__parse">${trimmed}</filter>`;

  const parser = new DOMParser();
  const doc = parser.parseFromString(wrapper, "image/svg+xml");
  const filterEl = doc.querySelector("filter");
  if (!filterEl) return [];

  const children = getDirectChildren(filterEl);
  const result: ParsedElement[] = [];
  for (const child of children) {
    const parsed = parseElement(child);
    if (parsed) result.push(parsed);
  }
  return result;
}

/** 将 ParsedElement 的 attrs、mergeIns、funcR/G/B/A、light 映射到节点 input 的 value（用于 setValue） */
export function parsedToInputValues(parsed: ParsedElement): Record<string, string> {
  const values: Record<string, string> = { ...parsed.attrs };

  if (parsed.funcR) {
    if (parsed.funcR.type) values.funcRType = parsed.funcR.type;
    if (parsed.funcR.tableValues != null) values.funcRTableValues = parsed.funcR.tableValues;
    if (parsed.funcR.slope != null) values.funcRSlope = parsed.funcR.slope;
    if (parsed.funcR.intercept != null) values.funcRIntercept = parsed.funcR.intercept;
    if (parsed.funcR.amplitude != null) values.funcRAmplitude = parsed.funcR.amplitude;
    if (parsed.funcR.exponent != null) values.funcRExponent = parsed.funcR.exponent;
    if (parsed.funcR.offset != null) values.funcROffset = parsed.funcR.offset;
  }
  if (parsed.funcG) {
    if (parsed.funcG.type) values.funcGType = parsed.funcG.type;
    if (parsed.funcG.tableValues != null) values.funcGTableValues = parsed.funcG.tableValues;
    if (parsed.funcG.slope != null) values.funcGSlope = parsed.funcG.slope;
    if (parsed.funcG.intercept != null) values.funcGIntercept = parsed.funcG.intercept;
    if (parsed.funcG.amplitude != null) values.funcGAmplitude = parsed.funcG.amplitude;
    if (parsed.funcG.exponent != null) values.funcGExponent = parsed.funcG.exponent;
    if (parsed.funcG.offset != null) values.funcGOffset = parsed.funcG.offset;
  }
  if (parsed.funcB) {
    if (parsed.funcB.type) values.funcBType = parsed.funcB.type;
    if (parsed.funcB.tableValues != null) values.funcBTableValues = parsed.funcB.tableValues;
    if (parsed.funcB.slope != null) values.funcBSlope = parsed.funcB.slope;
    if (parsed.funcB.intercept != null) values.funcBIntercept = parsed.funcB.intercept;
    if (parsed.funcB.amplitude != null) values.funcBAmplitude = parsed.funcB.amplitude;
    if (parsed.funcB.exponent != null) values.funcBExponent = parsed.funcB.exponent;
    if (parsed.funcB.offset != null) values.funcBOffset = parsed.funcB.offset;
  }
  if (parsed.funcA) {
    if (parsed.funcA.type) values.funcAType = parsed.funcA.type;
    if (parsed.funcA.tableValues != null) values.funcATableValues = parsed.funcA.tableValues;
    if (parsed.funcA.slope != null) values.funcASlope = parsed.funcA.slope;
    if (parsed.funcA.intercept != null) values.funcAIntercept = parsed.funcA.intercept;
    if (parsed.funcA.amplitude != null) values.funcAAmplitude = parsed.funcA.amplitude;
    if (parsed.funcA.exponent != null) values.funcAExponent = parsed.funcA.exponent;
    if (parsed.funcA.offset != null) values.funcAOffset = parsed.funcA.offset;
  }

  if (parsed.light) {
    const { tag, attrs: lightAttrs } = parsed.light;
    const lightType =
      tag === "fepointlight" ? "point" : tag === "fespotlight" ? "spot" : "distant";
    values.lightType = lightType;
    Object.assign(values, lightAttrs);
  }

  return values;
}
