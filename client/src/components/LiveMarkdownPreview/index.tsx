import React, { useState, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

marked.setOptions({
    breaks: true,
    gfm: true,
});

export const LiveMarkdownPreview = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [markdown, setMarkdown] = useState("");
    const [leftWidth, setLeftWidth] = useState(window.innerWidth / 2);
    const [isResizing, setIsResizing] = useState(false);
    const [isColumnLayout, setIsColumnLayout] = useState(window.innerWidth <= 800);
    const [hasResized, setHasResized] = useState(false);
    const [htmlContent, setHtmlContent] = useState("");
    const [initialRatio, setInitialRatio] = useState(0.5);

    const MIN_WIDTH = 400;
    const DEFAULT_WIDTH = window.innerWidth * initialRatio;

    const handleMouseDown = (e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        setHasResized(true);
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

    const handleMouseUp = useCallback(() => setIsResizing(false), []);

    const handleReset = () => {
        setLeftWidth(window.innerWidth * 0.5);
        setInitialRatio(0.5);
        setHasResized(false);
    };

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
        const renderMarkdown = async () => {
            const parsedMarkdown = await marked(markdown);
            setHtmlContent(DOMPurify.sanitize(parsedMarkdown));
        };
        renderMarkdown();
    }, [markdown]);

    useEffect(() => {
        if (!hasResized) {
            setInitialRatio(leftWidth / window.innerWidth);
        }
    }, [leftWidth, hasResized]);

    const showResetButton = !isColumnLayout && hasResized && leftWidth !== DEFAULT_WIDTH;

    return (
        <div
            ref={containerRef}
            className="box-container"
            style={{ flexDirection: isColumnLayout ? "column" : "row", position: "relative" }}
        >
            {/* Markdown Input */}
            <div
                className="box-markdown_input"
                style={{ width: isColumnLayout ? "100%" : `${leftWidth}px`, height: isColumnLayout ? "50vh" : "100vh" }}
            >
                <h2>Editor</h2>
                <textarea value={markdown} onChange={(e) => setMarkdown(e.target.value)} placeholder="Enter Markdown here..." />
            </div>

            {/* Resize Handle */}
            {!isColumnLayout && <div className="resize-handle" onMouseDown={handleMouseDown} />}

            {/* HTML Preview */}
            <div
                className="box-markdown_preview"
                style={{ width: isColumnLayout ? "100%" : `calc(100% - ${leftWidth}px)`, height: isColumnLayout ? "50vh" : "100vh" }}
            >
                <h2>Preview</h2>
                <div className="box-markdown_insert-html" dangerouslySetInnerHTML={{ __html: htmlContent }} />
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
