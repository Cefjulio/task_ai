import React from 'react';
import { cn } from './Button';

interface QuillContentProps {
    html: string;
    className?: string;
}

/**
 * Renders saved Quill HTML for read-only display.
 * Quill's bullet/number markers are CSS ::before content scoped to `.ql-editor`
 * (via the li[data-list] > .ql-ui selector in quill.snow.css), so the wrapper
 * must carry that class or list markers silently disappear outside the editor.
 */
export const QuillContent: React.FC<QuillContentProps> = ({ html, className }) => {
    return (
        <div
            className={cn('ql-editor ql-display break-words [overflow-wrap:anywhere]', className)}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
};
