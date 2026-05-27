import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import type { WebchatEvent } from "../types";

interface CallOptions {
  signal?: AbortSignal;
}

interface ConnectOutput {
  sessionId: string;
  config: {
    widgetTitle?: string;
    widgetSubtitle?: string;
    widgetColor?: string;
    widgetWelcomeMessage?: string;
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
  };
}

type WebchatRpcClient = {
  webchat: {
    connect: (input: {
      providerId: string;
      sessionId?: string;
      origin?: string;
      contactInfo?: {
        name: string;
        email: string;
        phone?: string;
      };
      /** Anti-bot honeypot — must be empty for human clients. */
      did?: string;
    }) => Promise<ConnectOutput>;
    sendMessage: (input: {
      sessionId: string;
      providerId: string;
      content?: string;
      clientMessageId?: string;
      replyToMessageId?: string;
      replyPreview?: {
        sender: "user" | "agent" | "system";
        senderLabel: string;
        content?: string;
        attachmentLabel?: string;
      };
      attachments?: Array<{
        type: "image" | "file";
        name: string;
        mimeType: string;
        size: number;
        dataUrl: string;
      }>;
    }) => Promise<{ success: boolean }>;
    subscribe: (
      input: { sessionId: string; providerId: string },
      options?: CallOptions,
    ) => Promise<AsyncIterable<WebchatEvent>>;
    typing: (input: {
      sessionId: string;
      providerId: string;
      isTyping: boolean;
    }) => Promise<{ success: boolean }>;
    resolve: (input: {
      sessionId: string;
      providerId: string;
    }) => Promise<{ success: boolean }>;
  };
};

export function createWebchatClient(baseUrl: string) {
  const link = new RPCLink({
    url: `${baseUrl}/api`,
    fetch: (input, init) => {
      return fetch(input, {
        ...init,
        credentials: "omit", // Widget doesn't use cookies
      });
    },
  });

  const client = createORPCClient(link) as unknown as WebchatRpcClient;
  return client.webchat;
}

export type WebchatClient = WebchatRpcClient["webchat"];
