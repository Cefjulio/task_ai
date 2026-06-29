/** Strip all HTML tags, returning plain text */
export function stripHtml(html: string): string {
    return html.replace(/<[^>]*>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').trim();
}

/** Extract text content from each <li> element */
export function parseListItems(html: string): string[] {
    const matches = [...html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi)];
    return matches
        .map(m => stripHtml(m[1]))
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
