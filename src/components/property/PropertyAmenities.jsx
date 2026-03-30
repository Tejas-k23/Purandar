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
        <div>
            <h2 className="pd-section-title">Amenities</h2>
            <div className="pd-amenities-grid">
                {amenities.map(({ icon: Icon, label }) => (
                    <div key={label} className="pd-amenity">
                        <Icon size={16} strokeWidth={1.8} />
                        <span className="pd-amenity-label">{label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
