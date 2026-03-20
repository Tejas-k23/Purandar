import React, { useEffect } from 'react';

// Neighborhood tags shown below map
const neighborhoodTags = ['5 min to beach', 'Near supermarket', 'Quiet area'];

export default function PropertyMap() {
    useEffect(() => {
        // Dynamically load Leaflet CSS
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);

        // Load Leaflet JS then init map
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = () => {
            const L = window.L;
            if (!L || document.getElementById('property-map')._leaflet_id) return;

            const map = L.map('property-map', {
                center: [42.2883, 18.8401],
                zoom: 14,
                zoomControl: true,
                scrollWheelZoom: false,
            });

            // Dark tile layer (CartoDB Dark Matter)
            L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                subdomains: 'abcd',
                maxZoom: 20,
            }).addTo(map);

            // Custom glowing marker
            const markerHtml = `
        <div style="
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #4F8EF7, #7B5EF8);
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 0 20px rgba(79,142,247,0.6);
          border: 2px solid rgba(255,255,255,0.3);
        "></div>
      `;
            const icon = L.divIcon({
                className: '',
                html: markerHtml,
                iconSize: [36, 36],
                iconAnchor: [18, 36],
            });

            L.marker([42.2883, 18.8401], { icon })
                .addTo(map)
                .bindPopup('<strong style="color:#111">Luxury Villa by the Sea</strong><br>Budva, Montenegro')
                .openPopup();
        };
        document.head.appendChild(script);

        return () => {
            // cleanup is handled by Leaflet itself on unmount
        };
    }, []);

    return (
        <div className="mt-7">
            <h2 className="text-base font-semibold text-white mb-3">Location</h2>

            {/* Map container */}
            <div
                id="property-map"
                className="w-full h-[280px] rounded-2xl overflow-hidden border border-white/10"
                style={{ zIndex: 0 }}
            />

            {/* Neighborhood tags */}
            <div className="flex flex-wrap gap-2 mt-3">
                {neighborhoodTags.map(tag => (
                    <span
                        key={tag}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-white/5 border border-white/10 text-gray-300"
                    >
                        📍 {tag}
                    </span>
                ))}
            </div>
        </div>
    );
}
