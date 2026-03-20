import React, { useState } from 'react';
import { Play, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

const images = [
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80',
    'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80',
];

export default function PropertyGallery() {
    const [activeIdx, setActiveIdx] = useState(0);

    const prev = () => setActiveIdx(i => (i - 1 + images.length) % images.length);
    const next = () => setActiveIdx(i => (i + 1) % images.length);

    return (
        <div className="space-y-3">
            {/* Hero Image */}
            <div className="relative w-full h-[420px] rounded-2xl overflow-hidden group">
                <img
                    src={images[activeIdx]}
                    alt="Property hero"
                    className="w-full h-full object-cover transition-all duration-700"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Left/Right Nav */}
                <button
                    onClick={prev}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20"
                >
                    <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                    onClick={next}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20"
                >
                    <ChevronRight className="w-4 h-4" />
                </button>

                {/* Top-left: Virtual Tour */}
                <button className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-medium hover:bg-white/20 transition-all duration-200">
                    <div className="w-6 h-6 rounded-full bg-[#4F8EF7] flex items-center justify-center">
                        <Play className="w-3 h-3 text-white fill-white" />
                    </div>
                    Virtual Tour
                </button>

                {/* Top-right: Badges */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-[#4F8EF7] text-white text-xs font-semibold shadow-lg">
                        For Sale
                    </span>
                    <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                        <CheckCircle className="w-3 h-3" />
                        Verified
                    </span>
                </div>

                {/* Image count */}
                <div className="absolute bottom-4 right-4 px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-sm text-white/80 text-xs font-medium">
                    {activeIdx + 1} / {images.length}
                </div>
            </div>

            {/* Thumbnails */}
            <div className="flex gap-3">
                {images.map((img, i) => (
                    <button
                        key={i}
                        onClick={() => setActiveIdx(i)}
                        className={`relative flex-1 h-[72px] rounded-xl overflow-hidden transition-all duration-200 ${i === activeIdx
                                ? 'ring-2 ring-[#4F8EF7] ring-offset-2 ring-offset-[#0D1117] shadow-[0_0_12px_rgba(79,142,247,0.5)]'
                                : 'opacity-60 hover:opacity-90'
                            }`}
                    >
                        <img src={img} alt={`thumb-${i}`} className="w-full h-full object-cover" />
                    </button>
                ))}
            </div>
        </div>
    );
}
