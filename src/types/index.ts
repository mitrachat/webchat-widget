export interface WidgetConfig {
  widgetTitle?: string;
  widgetSubtitle?: string;
  widgetColor?: string;
  widgetPosition?: "bottom-right" | "bottom-left";
  widgetLogoUrl?: string;
  widgetTheme?: "light" | "dark" | "auto";
  widgetWelcomeMessage?: string;
  widgetPlaceholderText?: string;
  widgetShowBranding?: boolean;
  allowedDomains?: string[];
}

export interface WidgetProps {
  providerId: string;
  apiUrl: string;
  theme?: "light" | "dark" | "auto";
  position?: "bottom-right" | "bottom-left";
}

export interface Message {
  id: string;
  content: string;
  sender: "user" | "agent" | "system";
  timestamp: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  size?: number;
}

export interface Session {
  sessionId: string;
  config: WidgetConfig;
}

export interface WebchatEvent {
  type: "message" | "typing" | "error" | "system";
  payload: {
    id?: string;
    content?: string;
    sender?: "agent" | "system";
    isTyping?: boolean;
    timestamp: string;
  };
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}
