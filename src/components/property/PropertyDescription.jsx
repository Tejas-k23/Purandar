import React, { useState } from 'react';

const fullText = `This stunning luxury villa sits on the edge of the Adriatic coastline in Budva, offering unrivalled views of the Montenegro coastline. The open-plan interior features floor-to-ceiling glass walls, premium Italian marble finishes, and a fully integrated smart home system that controls lighting, climate, and security from your phone. The villa's private infinity pool merges seamlessly with the horizon, while the landscaped Mediterranean garden provides both beauty and privacy. A rare offering in one of Europe's most sought-after coastal destinations — properties of this caliber seldom reach the open market.`;

const shortText = fullText.slice(0, 210) + '...';

export default function PropertyDescription() {
    const [expanded, setExpanded] = useState(false);

    return (
        <div className="mt-7">
            <h2 className="text-base font-semibold text-white mb-3">About this property</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
                {expanded ? fullText : shortText}
            </p>
            <button
                onClick={() => setExpanded(e => !e)}
                className="mt-2 text-[#4F8EF7] text-sm font-medium hover:text-[#6BA3FF] transition-colors"
            >
                {expanded ? 'Show less ↑' : 'Read more ↓'}
            </button>
        </div>
    );
}
