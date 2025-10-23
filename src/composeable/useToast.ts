import { toast } from "vue-sonner";
import { h } from "vue";

export function useToast() {
  const showToast = (message: string, description: string, variant: "success" | "error" | "info" = "info") => {
    let backgroundColor: string;
    let textColor: string;

    switch (variant) {
      case "success":
        backgroundColor = "#009689";
        textColor = "white";
        break;
      case "error":
        backgroundColor = "#e7000b";
        textColor = "white";
        break;
      case "info":
      default:
        backgroundColor = "#E08C23";
        textColor = "white";
        break;
    }

    toast(message, {
      description: h("p", { style: { color: textColor } }, description),
      style: {
        background: backgroundColor,
        color: textColor,
      },
    });
  };

  return { showToast };
}
