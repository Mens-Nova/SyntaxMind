import React, { useState, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";
import hljs from "highlight.js";
import { WordAndCharCounter } from "../WordAndCharCounter";
import "./index.css";

declare module "marked" {
    interface MarkedOptions {
        highlight?: (code: string, language: string) => string;
    }
}

export const LiveMarkdownPreview = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const markdownContainerRef = useRef<HTMLDivElement>(null);
    const [markdown, setMarkdown] = useState("");
    const [leftWidth, setLeftWidth] = useState(window.innerWidth / 2);
    const [isResizing, setIsResizing] = useState(false);
    const [isColumnLayout, setIsColumnLayout] = useState(window.innerWidth <= 800);
    const [hasResized, setHasResized] = useState(false);
    const [htmlContent, setHtmlContent] = useState("");
    const [initialRatio, setInitialRatio] = useState(0.5);
    const [isClicked, setIsClicked] = useState(false);
    const [isSmall, setIsSmall] = useState(false);
    // [TODO]:  Add animation olllmmn reset resize
    //const [isReseting, setIsReseting] = useState(false);

    const MIN_WIDTH = 400;
    const DEFAULT_WIDTH = window.innerWidth * initialRatio;

    const showResetButton = !isColumnLayout && hasResized && leftWidth !== DEFAULT_WIDTH;

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        setHasResized(true);
        setIsClicked(true);
    };

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || isColumnLayout || !containerRef.current) return;
            const containerRect = containerRef.current.getBoundingClientRect();
            let newLeftWidth = e.clientX - containerRect.left;
            newLeftWidth = Math.max(MIN_WIDTH, Math.min(newLeftWidth, window.innerWidth - MIN_WIDTH));
            setLeftWidth(newLeftWidth);
        },
        [isResizing, isColumnLayout],
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        setIsClicked(false);
    }, []);

    const handleReset = () => {
        setLeftWidth(window.innerWidth * 0.5);
        setInitialRatio(0.5);
        setHasResized(false);
    };

    useEffect(() => {
        marked.setOptions({
            breaks: true,
            gfm: true,
            highlight: (code, language) => {
                const validLanguage = hljs.getLanguage(language) ? language : "plaintext";
                const highlighted = hljs.highlight(code, { language: validLanguage }).value;
                return `<pre><code className="hljs language-${validLanguage}">${highlighted}</code></pre>`;
            },
        });
    }, []);

    useEffect(() => {
        const handleWindowResize = () => {
            const isNowColumn = window.innerWidth <= 800;
            setIsColumnLayout(isNowColumn);

            if (isNowColumn) {
                setHasResized(false);
            } else {
                if (!hasResized) {
                    const newLeftWidth = window.innerWidth * initialRatio;
                    setLeftWidth(newLeftWidth);
                }
            }
        };

        window.addEventListener("resize", handleWindowResize);
        return () => window.removeEventListener("resize", handleWindowResize);
    }, [hasResized, initialRatio]);

    useEffect(() => {
        if (isResizing) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        } else {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isResizing, handleMouseMove, handleMouseUp]);

    useEffect(() => {
        let isMounted = true;

        const renderMarkdown = async () => {
            const parsedMarkdown = await marked(markdown);
            const sanitizedHtml = DOMPurify.sanitize(parsedMarkdown);
            if (isMounted) setHtmlContent(sanitizedHtml);
        };
        renderMarkdown();

        return () => {
            isMounted = false;
        };
    }, [markdown]);

    useEffect(() => {
        if (!hasResized) {
            setInitialRatio(leftWidth / window.innerWidth);
        }
    }, [leftWidth, hasResized]);

    // useEffect(() => {
    //     const observer = new ResizeObserver(() => {
    //         if (markdownContainerRef.current) setIsSmall(markdownContainerRef.current.clientWidth < 530);
    //     });

    //     if (markdownContainerRef.current) observer.observe(markdownContainerRef.current);

    //     return () => {
    //         observer.disconnect();
    //     };
    // }, []);

    return (
        <div
            ref={containerRef}
            className="box-container"
            style={{ flexDirection: isColumnLayout ? "column" : "row", position: "relative" }}
            data-testid="markdown-container"
        >
            <div
                className={`box-markdown_input ${isSmall ? "small" : ""}`}
                style={{
                    width: isColumnLayout ? "100%" : `${leftWidth}px`,
                    height: isColumnLayout ? "50vh" : "100vh",
                }}
            >
                <div className="header-container">
                    <h2>Editor</h2>
                    {/* <WordAndCharCounter htmlContent={htmlContent} /> */}
                </div>
                <textarea
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    placeholder="Enter Markdown here..."
                    style={{ whiteSpace: "pre-wrap" }}
                />
            </div>

            {/* Resize Handle */}
            {!isColumnLayout && (
                <div className={`resize-handle ${isClicked && "active"}`} onMouseDown={handleMouseDown} data-testid="resize-handle" />
            )}

            {/* HTML Preview */}
            <div
                className="box-markdown_preview"
                style={{ width: isColumnLayout ? "100%" : `calc(100% - ${leftWidth}px)`, height: isColumnLayout ? "50vh" : "100vh" }}
            >
                <h2>Preview</h2>
                <div
                    className="box-markdown_insert-html"
                    dangerouslySetInnerHTML={{ __html: htmlContent }}
                    data-testid="preview-content"
                    style={{ whiteSpace: "pre-wrap" }}
                />
            </div>

            {/* Reset Button */}
            {showResetButton && (
                <button className="resize-reset_button" onClick={handleReset}>
                    Reset Size
                </button>
            )}
        </div>
    );
};
