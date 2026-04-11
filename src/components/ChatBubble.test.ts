import { test, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/svelte";
import ChatBubble from "../components/ChatBubble.svelte";

afterEach(() => cleanup());

test("renders user message content", () => {
  render(ChatBubble, {
    message: {
      id: "1",
      content: "Hello world",
      sender: "user",
      timestamp: "2026-04-10T10:00:00Z",
    },
  });

  expect(screen.getByText("Hello world")).toBeTruthy();
});

test("renders agent message with markdown content", () => {
  render(ChatBubble, {
    message: {
      id: "2",
      content: "**bold text**",
      sender: "agent",
      timestamp: "2026-04-10T10:00:00Z",
    },
  });

  const bold = screen.getByText("bold text");
  expect(bold).toBeTruthy();
  expect(bold.tagName).toBe("STRONG");
});

test("renders timestamp", () => {
  render(ChatBubble, {
    message: {
      id: "3",
      content: "Test",
      sender: "user",
      timestamp: "2026-04-10T14:30:00Z",
    },
  });

  const timeEl = screen.getByText(/\d{1,2}:\d{2}/);
  expect(timeEl).toBeTruthy();
});

test("renders file attachment", () => {
  render(ChatBubble, {
    message: {
      id: "4",
      content: "Here's the file",
      sender: "agent",
      timestamp: "2026-04-10T10:00:00Z",
      attachments: [
        {
          id: "att-1",
          type: "file",
          url: "https://example.com/doc.pdf",
          name: "document.pdf",
        },
      ],
    },
  });

  expect(screen.getByText("document.pdf")).toBeTruthy();
});

test("renders reply preview content", () => {
  render(ChatBubble, {
    message: {
      id: "5",
      content: "Reply body",
      sender: "user",
      timestamp: "2026-04-10T10:00:00Z",
      reply: {
        sender: "agent",
        senderLabel: "Admin",
        content: "Original message",
      },
    },
  });

  expect(screen.getByText("Admin")).toBeTruthy();
  expect(screen.getByText("Original message")).toBeTruthy();
});

test("renders outgoing status text", () => {
  render(ChatBubble, {
    message: {
      id: "6",
      content: "Pending message",
      sender: "user",
      timestamp: "2026-04-10T10:00:00Z",
      status: "pending",
    },
  });

  expect(screen.getByText(/· pending/i)).toBeTruthy();
});

test("invokes reply action when provided", async () => {
  const handled = vi.fn();
  render(ChatBubble, {
    message: {
      id: "7",
      content: "Can you reply?",
      sender: "agent",
      timestamp: "2026-04-10T10:00:00Z",
    },
    onReply: handled,
  });

  await fireEvent.click(screen.getByRole("button", { name: /reply/i }));
  expect(handled).toHaveBeenCalledTimes(1);
});
