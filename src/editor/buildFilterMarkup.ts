type AnyNode = any;
type AnyConnection = any;
type AnyInterface = any;

export type GraphSnapshot = {
  orderedNodes: AnyNode[];
  inputConnections: Map<string, string>;
  outputInterfaceToNode: Map<string, string>;
};

export function buildGraphSnapshot(graph: {
  nodes: Iterable<AnyNode>;
  connections: Iterable<AnyConnection>;
}): GraphSnapshot {
  const nodes = Array.from(graph.nodes) as AnyNode[];
  const connections = Array.from(graph.connections) as AnyConnection[];
  const nodeById = new Map(nodes.map((n: AnyNode) => [n.id, n]));
  const outputInterfaceToNode = new Map<string, string>();
  const inputConnections = new Map<string, string>();

  nodes.forEach((node: AnyNode) => {
    Object.values(node.outputs || {}).forEach((output: AnyInterface) => {
      if (output) outputInterfaceToNode.set(output.id, node.id);
    });
  });
  connections.forEach((c: AnyConnection) => {
    inputConnections.set(c.to.id, c.from.id);
  });

  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, Set<string>>();
  nodes.forEach((n: AnyNode) => {
    incoming.set(n.id, new Set());
    outgoing.set(n.id, new Set());
  });
  connections.forEach((c: AnyConnection) => {
    const fromId = c.from.nodeId;
    const toId = c.to.nodeId;
    (incoming.get(toId) ?? new Set()).add(fromId);
    (outgoing.get(fromId) ?? new Set()).add(toId);
  });

  const queue: string[] = [];
  incoming.forEach((deps, nodeId) => {
    if (deps.size === 0) queue.push(nodeId);
  });
  const ordered: AnyNode[] = [];
  while (queue.length) {
    const nodeId = queue.shift()!;
    const next = nodeById.get(nodeId);
    if (next) ordered.push(next);
    (outgoing.get(nodeId) ?? new Set()).forEach((nextId) => {
      const set = incoming.get(nextId);
      if (set) {
        set.delete(nodeId);
        if (set.size === 0) queue.push(nextId);
      }
    });
  }
  if (ordered.length !== nodes.length) {
    nodes.forEach((n: AnyNode) => {
      if (!ordered.includes(n)) ordered.push(n);
    });
  }

  return {
    orderedNodes: ordered.filter(Boolean),
    inputConnections,
    outputInterfaceToNode,
  };
}

const buildAttrs = (entries: Array<[string, string]>) =>
  entries
    .filter(([, v]) => v !== "" && v !== undefined && v !== null)
    .map(([k, v]) => `${k}="${v}"`)
    .join(" ");

const getValue = (node: AnyNode, key: string): string => {
  const v = node.inputs?.[key]?.value;
  return v != null ? String(v).trim() : "";
};

export function buildFilterMarkup(graph: {
  nodes: Iterable<AnyNode>;
  connections: Iterable<AnyConnection>;
}): string {
  const { orderedNodes, inputConnections, outputInterfaceToNode } = buildGraphSnapshot(graph);
  const resultMap = new Map<string, string>();

  orderedNodes.forEach((node: AnyNode) => {
    if (!node) return;
    const resultValue = node.outputs?.result?.value?.trim();
    resultMap.set(
      node.id,
      resultValue || `result_${node.id.replace(/-/g, "").slice(0, 6)}`
    );
  });

  const resolveInput = (inputInterface: AnyInterface) => {
    if (!inputInterface) return "";
    const connectedId = inputConnections.get(inputInterface.id);
    if (connectedId) {
      const sourceId = outputInterfaceToNode.get(connectedId);
      if (sourceId) return resultMap.get(sourceId) || "";
    }
    return inputInterface.value?.trim() || "";
  };

  const buildLightChild = (node: AnyNode) => {
    const t = getValue(node, "lightType").toLowerCase();
    if (t === "point") {
      return `<fePointLight ${buildAttrs([["x", getValue(node, "x")], ["y", getValue(node, "y")], ["z", getValue(node, "z")]])} />`;
    }
    if (t === "spot") {
      return `<feSpotLight ${buildAttrs([
        ["x", getValue(node, "x")],
        ["y", getValue(node, "y")],
        ["z", getValue(node, "z")],
        ["pointsAtX", getValue(node, "pointsAtX")],
        ["pointsAtY", getValue(node, "pointsAtY")],
        ["pointsAtZ", getValue(node, "pointsAtZ")],
        ["limitingConeAngle", getValue(node, "limitingConeAngle")],
      ])} />`;
    }
    return `<feDistantLight ${buildAttrs([["azimuth", getValue(node, "azimuth")], ["elevation", getValue(node, "elevation")]])} />`;
  };

  const lines = orderedNodes.map((node: AnyNode) => {
    if (!node) return "";
    const type = node.type;

    if (type === "feComponentTransfer") {
      const attrs: Array<[string, string]> = [];
      const inVal = resolveInput(node.inputs?.in);
      if (inVal) attrs.push(["in", inVal]);
      attrs.push(["result", resultMap.get(node.id) || ""]);
      const attrText = buildAttrs(attrs);
      const buildFunc = (tag: string, prefix: string) => {
        const arr: Array<[string, string]> = [
          ["type", getValue(node, `${prefix}Type`)],
          ["tableValues", getValue(node, `${prefix}TableValues`)],
          ["slope", getValue(node, `${prefix}Slope`)],
          ["intercept", getValue(node, `${prefix}Intercept`)],
          ["amplitude", getValue(node, `${prefix}Amplitude`)],
          ["exponent", getValue(node, `${prefix}Exponent`)],
          ["offset", getValue(node, `${prefix}Offset`)],
        ];
        if (arr.every(([, v]) => !v)) return "";
        const funcAttrs = buildAttrs(arr);
        return funcAttrs ? `<${tag} ${funcAttrs} />` : `<${tag} />`;
      };
      const prefixes = ["funcR", "funcG", "funcB", "funcA"];
      const children = ["feFuncR", "feFuncG", "feFuncB", "feFuncA"]
        .map((tag, i) => buildFunc(tag, prefixes[i]!))
        .filter((s): s is string => Boolean(s));
      if (children.length === 0) return attrText ? `<feComponentTransfer ${attrText} />` : `<feComponentTransfer />`;
      return `<feComponentTransfer ${attrText}>\n  ${children.join("\n  ")}\n</feComponentTransfer>`;
    }

    if (type === "feDiffuseLighting" || type === "feSpecularLighting") {
      const attrs: Array<[string, string]> = [];
      const inVal = resolveInput(node.inputs?.in);
      if (inVal) attrs.push(["in", inVal]);
      attrs.push(["lighting-color", getValue(node, "lightingColor")]);
      attrs.push(["surfaceScale", getValue(node, "surfaceScale")]);
      attrs.push(["kernelUnitLength", getValue(node, "kernelUnitLength")]);
      if (type === "feDiffuseLighting") {
        attrs.push(["diffuseConstant", getValue(node, "diffuseConstant")]);
      } else {
        attrs.push(["specularConstant", getValue(node, "specularConstant")]);
        attrs.push(["specularExponent", getValue(node, "specularExponent")]);
      }
      attrs.push(["result", resultMap.get(node.id) || ""]);
      return `<${type} ${buildAttrs(attrs)}>\n  ${buildLightChild(node)}\n</${type}>`;
    }

    if (type === "feMerge") {
      const inputKeys = Object.keys(node.inputs || {})
        .filter((k) => /^in\d+$/.test(k))
        .sort((a, b) => Number(a.slice(2)) - Number(b.slice(2)));
      const ins = inputKeys.map((k) => resolveInput(node.inputs?.[k])).filter(Boolean);
      const attr = buildAttrs([["result", resultMap.get(node.id) || ""]]);
      const mergeNodes = ins.map((v) => `  <feMergeNode in="${v}" />`).join("\n");
      return `<feMerge ${attr}>\n${mergeNodes}\n</feMerge>`;
    }

    const attrs: Array<[string, string]> = [];
    if (node.inputs?.in) attrs.push(["in", resolveInput(node.inputs.in)]);
    if (node.inputs?.in2) attrs.push(["in2", resolveInput(node.inputs.in2)]);
    Object.entries(node.inputs || {}).forEach(([key, input]: [string, AnyInterface]) => {
      if (key === "in" || key === "in2" || key.startsWith("__")) return;
      attrs.push([key, input.value?.trim() || ""]);
    });
    attrs.push(["result", resultMap.get(node.id) || ""]);
    const attrText = buildAttrs(attrs);
    return attrText ? `<${type} ${attrText} />` : `<${type} />`;
  });

  return lines.filter(Boolean).join("\n");
}
