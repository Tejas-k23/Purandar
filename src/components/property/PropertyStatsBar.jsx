import React from 'react';
import { Bed, Bath, Ruler, CalendarDays } from 'lucide-react';

const stats = [
    { icon: Bed, label: 'Bedrooms', value: '4' },
    { icon: Bath, label: 'Bathrooms', value: '3' },
    { icon: Ruler, label: 'Area', value: '320 sqft' },
    { icon: CalendarDays, label: 'Built', value: '2021' },
];

export default function PropertyStatsBar() {
    return (
        <div className="grid grid-cols-4 gap-3 mt-6">
            {stats.map(({ icon: Icon, label, value }, i) => (
                <div
                    key={i}
                    className="flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md hover:border-[#4F8EF7]/40 transition-all duration-200 group"
                >
                    <div className="w-9 h-9 rounded-xl bg-[#4F8EF7]/10 flex items-center justify-center group-hover:bg-[#4F8EF7]/20 transition-colors">
                        <Icon className="w-4.5 h-4.5 text-[#4F8EF7]" strokeWidth={1.8} />
                    </div>
                    <span className="text-white font-semibold text-sm">{value}</span>
                    <span className="text-gray-500 text-xs">{label}</span>
                </div>
            ))}
        </div>
    );
}
