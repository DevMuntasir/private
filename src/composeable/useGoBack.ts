import { useRouter } from "vue-router";

export function useGoBack(fallbackRoute: string = "/") {
  const router = useRouter();

  function goBack() {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackRoute);
    }
  }

  return { goBack };
}
