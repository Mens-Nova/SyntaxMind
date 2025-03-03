import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { LiveMarkdownPreview } from "../components/LiveMarkdownPreview";
import userEvent from "@testing-library/user-event";

// Mocking DOMPurify
jest.mock("dompurify", () => ({
  sanitize: (html: string) => html,
}));

// Mocking the entire 'marked' module and completely bypassing 'setOptions'
jest.mock("marked", () => {
  return {
    __esModule: true,
    default: jest.fn((text: string) => `<h1>${text.slice(1)}</h1>`), // Simple markdown to HTML mock
  };
});

describe("LiveMarkdownPreview", () => {
  it("should render the component", () => {
    render(<LiveMarkdownPreview />);
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.getByText("Preview")).toBeInTheDocument();
  });

  it("should update the markdown input and preview content", async () => {
    render(<LiveMarkdownPreview />);

    const textarea = screen.getByPlaceholderText("Enter Markdown here...");
    userEvent.type(textarea, "# Hello World");

    await waitFor(() => {
      // Expect the preview to show the parsed HTML content
      expect(screen.getByText("<h1>Hello World</h1>")).toBeInTheDocument();
    });
  });

  it("should resize the markdown input area when dragging the resize handle", async () => {
    render(<LiveMarkdownPreview />);

    const resizeHandle = screen.getByRole("separator");
    const initialWidth = screen.getByText("Editor").parentElement?.getBoundingClientRect().width;

    // Simulate mouse down and mouse move
    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 150 });
    fireEvent.mouseUp(document);

    const newWidth = screen.getByText("Editor").parentElement?.getBoundingClientRect().width;
    expect(newWidth).not.toBe(initialWidth);
  });

  it("should show the reset button when the area has been resized", async () => {
    render(<LiveMarkdownPreview />);

    const textarea = screen.getByPlaceholderText("Enter Markdown here...");
    userEvent.type(textarea, "# Hello World");

    const resizeHandle = screen.getByRole("separator");

    // Simulate resizing
    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 150 });
    fireEvent.mouseUp(document);

    const resetButton = screen.getByText("Reset Size");
    expect(resetButton).toBeInTheDocument();
  });

  it("should reset the size to default when clicking the reset button", () => {
    render(<LiveMarkdownPreview />);

    const textarea = screen.getByPlaceholderText("Enter Markdown here...");
    userEvent.type(textarea, "# Hello World");

    const resizeHandle = screen.getByRole("separator");

    // Simulate resizing
    fireEvent.mouseDown(resizeHandle, { clientX: 100 });
    fireEvent.mouseMove(document, { clientX: 150 });
    fireEvent.mouseUp(document);

    const resetButton = screen.getByText("Reset Size");
    userEvent.click(resetButton);

    // Check that the width is reset (this can depend on your implementation)
    const previewContainer = screen.getByText("Preview").parentElement;
    expect(previewContainer?.style.width).toBe("50%");
  });
});

