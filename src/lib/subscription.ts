import type { WebchatEvent } from "../types";
import type { WebchatClient } from "./orpc-client";
import { connection } from "../stores/messages";

export class SubscriptionManager {
  private abortController: AbortController | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private active = false;

  constructor(
    private client: WebchatClient,
    private sessionId: string,
    private providerId: string,
    private onEvent: (event: WebchatEvent) => void,
  ) {}

  connect(): void {
    if (this.active) {
      this.disconnect();
    }

    this.active = true;
    connection.setConnecting();
    this.startConsuming();
  }

  disconnect(): void {
    this.active = false;
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    connection.setDisconnected();
  }

  private async startConsuming(): Promise<void> {
    this.abortController = new AbortController();

    try {
      const iterator = await this.client.subscribe(
        { sessionId: this.sessionId, providerId: this.providerId },
        { signal: this.abortController.signal },
      );

      connection.setConnected();
      this.reconnectAttempts = 0;

      for await (const event of iterator) {
        if (!this.active) break;
        this.onEvent(event as WebchatEvent);
      }
    } catch (error) {
      if (!this.active) return; // intentional disconnect
      console.error("[WebChat] Subscription error:", error);
      connection.setError("Connection lost");
      this.handleReconnect();
    }
  }

  private handleReconnect(): void {
    if (!this.active) return;

    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay =
        this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
      console.log(
        `[WebChat] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
      );
      setTimeout(() => {
        if (this.active) this.startConsuming();
      }, delay);
    } else {
      console.error("[WebChat] Max reconnection attempts reached");
      connection.setError("Failed to reconnect");
    }
  }
}
