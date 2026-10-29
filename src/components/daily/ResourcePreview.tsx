import React from 'react';

export type PreviewKind = 'youtube' | 'audio' | 'pdf' | 'webpage';

/** Pulls the video id out of the usual YouTube URL shapes. */
export function youtubeId(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname.includes('youtu.be')) return u.pathname.slice(1).split('/')[0] || null;
        if (u.searchParams.get('v')) return u.searchParams.get('v');
        const match = /\/(embed|shorts|live)\/([\w-]{6,})/.exec(u.pathname);
        return match ? match[2] : null;
    } catch {
        return null;
    }
}

interface ResourcePreviewProps {
    kind: PreviewKind;
    url: string;
    title: string;
}

/** Inline look at the resource: a YouTube player, an audio player, or an embedded page (which some sites block). */
export const ResourcePreview: React.FC<ResourcePreviewProps> = ({ kind, url, title }) => {
    if (kind === 'audio') {
        return <audio controls src={url} className="w-full" preload="none" />;
    }

    const id = kind === 'youtube' ? youtubeId(url) : null;
    const src = id ? `https://www.youtube.com/embed/${id}` : url;

    return (
        <div className="space-y-1.5">
            <iframe
                src={src}
                title={`Preview of ${title}`}
                className="aspect-video w-full rounded-xl border border-slate-200 bg-white dark:border-slate-700"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
            />
            {kind !== 'youtube' && (
                <p className="text-[11px] text-slate-400">
                    Some sites refuse to be embedded — if this stays blank, use the Open button.
                </p>
            )}
        </div>
    );
};
