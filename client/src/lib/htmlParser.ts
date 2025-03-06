export const htmlParser = (htmlString: string): string => {
    let result = "";
    let inOrderedList = false;
    let inUnorderedList = false;
    let listItemCount = 0;
    let i = 0;

    while (i < htmlString.length) {
        while (i < htmlString.length && /\s/.test(htmlString[i])) i++;

        if (htmlString[i] === "<") {
            let tagEnd = htmlString.indexOf(">", i);
            if (tagEnd === -1) break;

            const tag = htmlString.slice(i, tagEnd + 1);
            i = tagEnd + 1;

            // Block-level tags
            if (/^<(h[1-6]|p|div|section|article|aside|header|footer|main|blockquote|pre|form|figure|figcaption)>$/.test(tag)) {
                if (result.length > 0) result += "\n";
            } else if (tag === "<ol>") {
                inOrderedList = true;
                listItemCount = 0;
                if (result.length > 0) result += "\n";
            } else if (tag === "</ol>") {
                inOrderedList = false;
            } else if (tag === "<ul>") {
                inUnorderedList = true;
                listItemCount = 0;
                if (result.length > 0) result += "\n";
            } else if (tag === "</ul>") {
                inUnorderedList = false;
            } else if (tag === "<li>") {
                listItemCount++;
                result += inOrderedList ? `${listItemCount}. ` : "- ";
            } else if (tag === "</li>") {
                result += "\n";
            } else if (tag === "<dt>" || tag === "<dd>" || tag === "<summary>" || tag === "<label>") {
                if (result.length > 0) result += "\n";
            } else if (tag === "<img") {
                let altStart = htmlString.indexOf('alt="', i);
                if (altStart !== -1) {
                    let altEnd = htmlString.indexOf('"', altStart + 5);
                    result += "\n" + htmlString.slice(altStart + 5, altEnd);
                    i = tagEnd + 1; // Skip past img tag
                }
            } else if (/^<(table|thead|tbody|tr)>$/.test(tag)) {
                if (result.length > 0) result += "\n";
            } else if (tag === "<th>" || tag === "<td>") {
                result += " "; // Space-separated table cells
            }

            // Skip metadata tags entirely
            if (/^<(head|meta|link|script|style|base|!DOCTYPE)/.test(tag)) {
                let closingTag = tag.replace("<", "</").replace(/\s.*/g, ">");
                i = htmlString.indexOf(closingTag, i) + closingTag.length;
                if (i === -1) break;
            }
            continue;
        }

        let text = "";
        while (i < htmlString.length && htmlString[i] !== "<") {
            text += htmlString[i];
            i++;
        }
        if (text.length > 0) {
            result += text.trim();
        }
    }

    return result.trim();
};
