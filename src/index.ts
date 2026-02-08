import "./styles/global.css";
import { mount, unmount } from "svelte";
import ChatWidget from "./components/ChatWidget.svelte";
import type { WidgetProps } from "./types";

export { ChatWidget };
export type { WidgetProps };

// Mount function for programmatic usage
export function mountWebchat(props: WidgetProps & { container?: HTMLElement }) {
  const { container, ...widgetProps } = props;
  const target = container || document.body;

  const widget = mount(ChatWidget, {
    target,
    props: widgetProps,
  });

  return {
    destroy: () => unmount(widget),
  };
}

// Auto-initialize if data attributes are present
document.addEventListener("DOMContentLoaded", () => {
  const elements = document.querySelectorAll("[data-mitrachat-provider]");
  elements.forEach((el) => {
    const providerId = el.getAttribute("data-mitrachat-provider");
    const apiUrl =
      el.getAttribute("data-mitrachat-api-url") || window.location.origin;
    const theme = (el.getAttribute("data-mitrachat-theme") as any) || "auto";
    const position =
      (el.getAttribute("data-mitrachat-position") as any) || "bottom-right";

    if (providerId) {
      mountWebchat({
        providerId,
        apiUrl,
        theme,
        position,
        container: el as HTMLElement,
      });
    }
  });
});
