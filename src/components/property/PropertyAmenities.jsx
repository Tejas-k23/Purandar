import React from 'react';
import {
    Wifi, Waves, Dumbbell, Car, Eye, Leaf,
    Cpu, Shield, Wind, Building2, Star, Umbrella
} from 'lucide-react';

const amenities = [
    { icon: Wifi, label: 'WiFi' },
    { icon: Waves, label: 'Pool' },
    { icon: Dumbbell, label: 'Gym' },
    { icon: Car, label: 'Parking' },
    { icon: Eye, label: 'Sea View' },
    { icon: Leaf, label: 'Garden' },
    { icon: Cpu, label: 'Smart Home' },
    { icon: Shield, label: 'Security' },
    { icon: Wind, label: 'Air Conditioning' },
    { icon: Building2, label: 'Rooftop Terrace' },
    { icon: Star, label: 'Concierge' },
    { icon: Umbrella, label: 'Private Beach' },
];

export default function PropertyAmenities() {
    return (
        <div className="mt-7">
            <h2 className="text-base font-semibold text-white mb-3">Amenities</h2>
            <div className="grid grid-cols-3 gap-2.5">
                {amenities.map(({ icon: Icon, label }) => (
                    <div
                        key={label}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-[#4F8EF7]/40 hover:bg-[#4F8EF7]/5 transition-all duration-200 group cursor-default"
                    >
                        <Icon className="w-4 h-4 text-[#4F8EF7] flex-shrink-0 group-hover:scale-110 transition-transform" strokeWidth={1.8} />
                        <span className="text-gray-300 text-xs font-medium">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
