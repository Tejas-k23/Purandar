import React from 'react';
import { MapPin, Star } from 'lucide-react';

const tags = ['Sea View', 'Pool', 'Smart Home', 'Parking'];

export default function PropertyTitleSection() {
    return (
        <div className="space-y-3 mt-6">
            <h1 className="text-[2rem] font-semibold text-white leading-tight">
                Luxury Villa by the Sea
            </h1>

            <div className="flex items-center gap-5">
                {/* Location */}
                <div className="flex items-center gap-1.5 text-gray-400">
                    <MapPin className="w-4 h-4 text-[#4F8EF7]" />
                    <span className="text-sm">Budva, Montenegro</span>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1.5">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-sm font-semibold text-white">4.9</span>
                    <span className="text-sm text-gray-500">(48 reviews)</span>
                </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-1">
                {tags.map(tag => (
                    <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-300 hover:border-[#4F8EF7]/50 hover:text-[#4F8EF7] transition-all duration-200"
                    >
                        {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}
