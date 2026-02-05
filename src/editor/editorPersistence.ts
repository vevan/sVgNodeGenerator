const EDITOR_STORAGE_KEY = "svgfilter-editor";

export function loadEditorState(): unknown | null {
  try {
    const raw = localStorage.getItem(EDITOR_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as unknown;
  } catch {
    return null;
  }
}

export type EditorLike = { save: () => unknown; graph: { nodes: Iterable<unknown>; removeNode: (n: any) => void } };

export function saveEditorState(editor: EditorLike) {
  try {
    const state = editor.save();
    localStorage.setItem(EDITOR_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

export function clearEditorGraph(editor: EditorLike) {
  const graph = editor.graph;
  const nodes = Array.from(graph.nodes);
  nodes.forEach((node) => graph.removeNode(node));
  saveEditorState(editor);
}
