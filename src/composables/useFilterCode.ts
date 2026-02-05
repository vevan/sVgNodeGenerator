import { onMounted, onUnmounted, ref } from "vue";

export type UseFilterCodeOptions = {
  /** 当前由节点图生成的完整 filter 代码（只读时同步到 textarea） */
  getFullCode: () => string;
  /** 定时保存编辑器状态 */
  saveState: () => void;
  /** 只读时同步代码的间隔 ms */
  syncInterval?: number;
  /** 保存状态的间隔 ms */
  saveInterval?: number;
};

export function useFilterCode(options: UseFilterCodeOptions) {
  const {
    getFullCode,
    saveState,
    syncInterval = 300,
    saveInterval = 800,
  } = options;

  const isCodeReadonly = ref(true);
  const filterCodeText = ref("");
  const copyCodeFeedback = ref(false);

  let syncTimer: number | undefined;
  let saveTimer: number | undefined;

  function toggleCodeEdit() {
    isCodeReadonly.value = !isCodeReadonly.value;
    if (!isCodeReadonly.value) {
      filterCodeText.value = getFullCode();
    }
  }

  async function copyCode(getCopySource: () => string) {
    const text = filterCodeText.value.trim() || getCopySource();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      copyCodeFeedback.value = true;
      setTimeout(() => (copyCodeFeedback.value = false), 1500);
    } catch {
      alert("复制失败，请手动选择代码复制。");
    }
  }

  function setCodeFromGraph(fullCode: string) {
    filterCodeText.value = fullCode;
    isCodeReadonly.value = true;
  }

  onMounted(() => {
    const updateSync = () => {
      if (isCodeReadonly.value) {
        filterCodeText.value = getFullCode();
      }
    };
    updateSync();
    syncTimer = window.setInterval(updateSync, syncInterval);
    saveTimer = window.setInterval(saveState, saveInterval);
    window.addEventListener("beforeunload", saveState);
  });

  onUnmounted(() => {
    if (syncTimer) window.clearInterval(syncTimer);
    if (saveTimer) window.clearInterval(saveTimer);
    window.removeEventListener("beforeunload", saveState);
  });

  return {
    isCodeReadonly,
    filterCodeText,
    copyCodeFeedback,
    toggleCodeEdit,
    copyCode,
    setCodeFromGraph,
  };
}
