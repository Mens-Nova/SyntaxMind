import React from "react";
import "@testing-library/jest-dom";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LiveMarkdownPreview } from "../components/LiveMarkdownPreview";
import { marked } from "marked";
import DOMPurify from "dompurify";
// Mock dependencies
jest.mock("../components/LiveMarkdownPreview/index.css", () => ({}));
jest.mock("marked", () => {
    const markedMock = jest.fn((markdown: string) => `<mocked-html>${markdown}</mocked-html>`) as jest.Mock & {
        setOptions: jest.Mock;
    };

    markedMock.setOptions = jest.fn();
    return {
        __esModule: true,
        marked: markedMock,
    };
});

jest.mock("dompurify", () => ({
    sanitize: jest.fn((html: string) => html),
}));

beforeAll(() => {
    jest.spyOn(console, "error").mockImplementation(() => {});
});

afterAll(() => {
    jest.restoreAllMocks();
});

// Mock window.innerWidth
const mockInnerWidth = (width: number) => {
    Object.defineProperty(window, "innerWidth", {
        writable: true,
        configurable: true,
        value: width,
    });
    window.dispatchEvent(new Event("resize"));
};

describe("LiveMarkdownPreview Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockInnerWidth(1200);
    });

    it("renders the component with editor and preview sections", async () => {
        await act(async () => {
            render(<LiveMarkdownPreview />);
        });
        await waitFor(() => {
            expect(screen.getByText("Editor")).toBeInTheDocument();
            expect(screen.getByText("Preview")).toBeInTheDocument();
            expect(screen.getByPlaceholderText("Enter Markdown here...")).toBeInTheDocument();
        });
    });

    it("updates markdown input and renders preview", async () => {
        render(<LiveMarkdownPreview />);

        const textarea = screen.getByPlaceholderText("Enter Markdown here...");
        await act(async () => {
            userEvent.type(textarea, "# Hello World");
        });

        await waitFor(() => {
            const previewContent = screen.getByTestId("preview-content");
            expect(previewContent).toHaveTextContent("Hello World");
            expect(marked).toHaveBeenCalledWith("# Hello World");
            expect(DOMPurify.sanitize).toHaveBeenCalled();
        });
    });

    it("changes layout to column when window width is small", async () => {
        mockInnerWidth(800);

        await act(async () => {
            render(<LiveMarkdownPreview />);
        });

        const container = screen.getByTestId("markdown-container");
        await waitFor(() => {
            expect(container).toHaveStyle({ flexDirection: "column" });
        });
    });

    it("allows resizing when not in column layout", async () => {
        await act(async () => {
            render(<LiveMarkdownPreview />);
        });

        const resizeHandle = screen.getByTestId("resize-handle");

        fireEvent.mouseDown(resizeHandle, { clientX: 500 });
        fireEvent.mouseMove(document, { clientX: 700 });
        fireEvent.mouseUp(document);

        await waitFor(() => {
            expect(screen.getByText("Reset Size")).toBeInTheDocument();
        });
    });

    it("resets width when reset button is clicked", async () => {
        await act(async () => {
            render(<LiveMarkdownPreview />);
        });

        const resizeHandle = screen.getByTestId("resize-handle");

        fireEvent.mouseDown(resizeHandle, { clientX: 500 });
        fireEvent.mouseMove(document, { clientX: 700 });
        fireEvent.mouseUp(document);

        const resetButton = await screen.findByText("Reset Size");
        userEvent.click(resetButton);

        const container = screen.getByTestId("markdown-container");
        expect(container).toHaveStyle({ flexDirection: "row" });
    });

    it("calls marked.setOptions on component mount", async () => {
        await act(async () => {
            render(<LiveMarkdownPreview />);
        });

        expect(marked.setOptions).toHaveBeenCalledWith({
            breaks: true,
            gfm: true,
            highlight: expect.any(Function),
        });
    });

    it("sanitizes HTML content", async () => {
        await act(async () => {
            render(<LiveMarkdownPreview />);
        });

        const textarea = screen.getByPlaceholderText("Enter Markdown here...");
        await act(async () => {
            userEvent.type(textarea, "# Dangerous <script>alert('XSS')</script>");
        });

        await waitFor(() => {
            expect(DOMPurify.sanitize).toHaveBeenCalled();
        });
    });
});
