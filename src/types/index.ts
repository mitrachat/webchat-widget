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
  widgetRequireContactInfo?: boolean;
  widgetContactFields?: {
    name: boolean;
    email: boolean;
    phone: boolean;
  };
  widgetContactRequiredFields?: {
    name: boolean;
    email: boolean;
    phone: boolean;
  };
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
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
  reply?: ReplyPreview;
  format?: "plain" | "html";
  status?: "pending" | "sent" | "delivered" | "read" | "failed";
}

export interface Attachment {
  id: string;
  type: "image" | "file";
  url: string;
  name: string;
  size?: number;
}

export interface ReplyPreview {
  sender: "user" | "agent" | "system";
  senderLabel: string;
  content?: string;
  attachmentLabel?: string;
}

export interface Session {
  sessionId: string;
  config: WidgetConfig;
}

export interface WebchatEvent {
  type: "message" | "message.updated" | "typing" | "error" | "system";
  payload: {
    id?: string;
    clientMessageId?: string;
    content?: string;
    format?: "plain" | "html";
    sender?: "agent" | "system";
    attachments?: Attachment[];
    reply?: ReplyPreview;
    status?: "pending" | "sent" | "delivered" | "read" | "failed";
    isTyping?: boolean;
    timestamp: string;
  };
}

export interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}
