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

// Auto-initialize if data attributes are present.
function autoInitWebchat() {
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
}

// bag.7 #6 — run immediately when the DOM is already parsed (the bundle may be
// loaded async/defer or injected after DOMContentLoaded already fired, in which
// case the event listener would never run); otherwise wait for the event.
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", autoInitWebchat);
  } else {
    autoInitWebchat();
  }
}
