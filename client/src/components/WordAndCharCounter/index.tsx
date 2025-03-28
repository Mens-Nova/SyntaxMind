import React, { useState, useEffect } from "react";
import { htmlParser } from "../../lib/htmlParser";
import "./index.css";

interface WordAndCharCounterProps {
    htmlContent: string;
}

export const WordAndCharCounter = ({ htmlContent }: WordAndCharCounterProps) => {
    const [charCount, setCharCount] = useState(0);
    const [wordCount, setWordCount] = useState(0);

    useEffect(() => {
        const cleanStringFromHtmlTags = htmlParser(htmlContent);
        const countCharacters = (content: string): void => {
            if (!content || typeof content !== "string") {
                setCharCount(0);
                setWordCount(0);
                return;
            }

            // blank characters count as characters (?
            setCharCount(content.length);

            let wordArr = content.trim().split(/\s+/);
            const validateWords = wordArr.filter((word) => word.length > 0);

            setWordCount(validateWords.length);
        };
        countCharacters(cleanStringFromHtmlTags);
    }, [htmlContent]);

    console.log(charCount, wordCount);
    return (
        <div className="counter-container">
            <div className="counter-card">
                <p>Characters: {charCount} </p>
            </div>
            <div className="counter-card">
                <p>Words: {wordCount} </p>
            </div>
        </div>
    );
};
