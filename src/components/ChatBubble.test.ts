import { test, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/svelte";
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

  expect(screen.getByText("Hello world")).toBeInTheDocument();
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
  expect(bold).toBeInTheDocument();
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
  expect(timeEl).toBeInTheDocument();
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

  expect(screen.getByText("document.pdf")).toBeInTheDocument();
});
