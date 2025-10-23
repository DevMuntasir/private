import { onMounted } from "vue";

export function useScrollToTop(smooth: boolean = true) {
  onMounted(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: smooth ? "smooth" : "auto"
    });
  });
}
