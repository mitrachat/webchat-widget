// Embed script entry point - creates global window.MitraChatWidget
import { mountWebchat } from "./index";
import type { WidgetProps } from "./types";

interface MitraChatWidgetGlobal {
  init: (props: WidgetProps) => { destroy: () => void };
  mount: typeof mountWebchat;
}

declare global {
  interface Window {
    MitraChatWidget: MitraChatWidgetGlobal;
  }
}

// Create global API
window.MitraChatWidget = {
  init(props) {
    return mountWebchat(props);
  },
  mount: mountWebchat,
};

// Dispatch event to notify that widget is ready
window.dispatchEvent(new CustomEvent("mitrachat-widget-ready"));
