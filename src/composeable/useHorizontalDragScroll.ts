import { onBeforeUnmount, ref } from 'vue';

const INTERACTIVE_SELECTORS = "a,button,input,textarea,select,[role='button'],[role='checkbox'],[data-drag-ignore='true']";

export function useHorizontalDragScroll() {
  const containerRef = ref<HTMLElement | null>(null);
  const isDragging = ref(false);
  const activePointerId = ref<number | null>(null);
  let startX = 0;
  let initialScrollLeft = 0;

  const stopDragging = () => {
    if (!isDragging.value) {
      return;
    }

    isDragging.value = false;
    const container = containerRef.value;
    if (container && activePointerId.value != null) {
      try {
        container.releasePointerCapture?.(activePointerId.value);
      } catch {
       
      }
    }

    activePointerId.value = null;
  };

  const handlePointerDown = (event: PointerEvent) => {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest(INTERACTIVE_SELECTORS)) {
      return;
    }

    const container = containerRef.value;
    if (!container) {
      return;
    }

    isDragging.value = true;
    activePointerId.value = event.pointerId;
    startX = event.clientX;
    initialScrollLeft = container.scrollLeft;

    try {
      container.setPointerCapture?.(event.pointerId);
    } catch {
      /* ignore pointer capture errors */
    }

    event.preventDefault();
  };

  const handlePointerMove = (event: PointerEvent) => {
    if (
      !isDragging.value ||
      activePointerId.value == null ||
      event.pointerId !== activePointerId.value
    ) {
      return;
    }

    const container = containerRef.value;
    if (!container) {
      return;
    }

    const deltaX = event.clientX - startX;
    container.scrollLeft = initialScrollLeft - deltaX;
  };

  const handlePointerUp = (event?: PointerEvent) => {
    if (
      event &&
      activePointerId.value != null &&
      event.pointerId !== activePointerId.value
    ) {
      return;
    }

    stopDragging();
  };

  onBeforeUnmount(() => {
    stopDragging();
    containerRef.value = null;
  });

  return {
    containerRef,
    isDragging,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    stopDragging,
  };
}
