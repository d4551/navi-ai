import { ref } from "vue";

// Generic drag & reorder composable. Provide a resolver that returns the array by type.
export function useDragReorderList(resolveListByType) {
  const dragState = ref({ active: false, type: "", from: -1 });
  const dragOver = ref({ type: "", index: -1 });

  const startDrag = (type, index) => {
    dragState.value = { active: true, type, from: index };
  };
  const onDragOver = (_evt, type, index) => {
    if (!dragState.value.active || dragState.value.type !== type) {
      return;
    }
    dragOver.value = { type, index };
  };
  const endDrag = () => {
    dragState.value = { active: false, type: "", from: -1 };
    dragOver.value = { type: "", index: -1 };
  };
  const moveItem = (type, from, to) => {
    const list = resolveListByType(type);
    if (
      !Array.isArray(list) ||
      from === to ||
      from < 0 ||
      to < 0 ||
      to >= list.length
    ) {
      return;
    }
    const item = list.splice(from, 1)[0];
    list.splice(to, 0, item);
  };
  const onDrop = (type, toIndex) => {
    if (!dragState.value.active || dragState.value.type !== type) {
      return;
    }
    moveItem(type, dragState.value.from, toIndex);
    endDrag();
  };

  return {
    dragState,
    dragOver,
    startDrag,
    onDragOver,
    onDrop,
    endDrag,
    moveItem,
  };
}
