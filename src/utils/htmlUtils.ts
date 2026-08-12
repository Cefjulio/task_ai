/** Strip all HTML tags, returning plain text */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
}

/** Extract text content from each <li> element */
export function parseListItems(html: string): string[] {
    const liMatches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    if (liMatches.length > 0) {
        return liMatches.map(m => stripHtml(m[1])).filter(t => t.length > 0);
    }

    // Quill only emits <li> when the user applies list formatting explicitly.
    // If they just typed lines and pressed Enter, each line is a <p> (or a
    // <br>-separated line within one block) instead — treat those as items too.
    const withLineBreaks = html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/p>\s*<p[^>]*>/gi, '\n');
    return stripHtml(withLineBreaks)
        .split('\n')
        .map(t => t.trim())
        .filter(t => t.length > 0);
}

/** Convert an array of plain strings into a Quill-compatible unordered list HTML */
export function toQuillBulletList(items: string[]): string {
    if (items.length === 0) return '';
    return `<ul>${items.map(item => `<li>${item}</li>`).join('')}</ul>`;
}

/** Returns true if HTML string is empty / only has empty Quill placeholders */
export function isQuillEmpty(html: string): boolean {
    return !html || html === '<p><br></p>' || stripHtml(html).length === 0;
}
