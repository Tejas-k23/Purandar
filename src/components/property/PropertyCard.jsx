import React from 'react';
import { MapPin, ArrowUpRight } from 'lucide-react';

export default function PropertyCard({ image, title, location, beds, baths, sqft, price }) {
    // Format price string to split into main and cents
    let mainPrice = price;
    let cents = null;

    if (price.includes('.')) {
        [mainPrice, cents] = price.split('.');
    }

    return (
        <div
            className="bg-white rounded-[16px] overflow-hidden flex flex-col transition-all duration-300 ease-out hover:-translate-y-[2px] cursor-pointer group"
            style={{ boxShadow: '0 4px 16px rgba(0,0,0,0.07)' }}
        >
            <div className="relative w-full h-[180px] overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm p-1.5 rounded-full shadow-sm opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <ArrowUpRight className="w-4 h-4 text-gray-900" />
                </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
                <h3 className="font-semibold text-[16px] text-gray-900 leading-tight mb-1">{title}</h3>
                <div className="flex items-center text-gray-400 mb-3">
                    <MapPin className="w-3.5 h-3.5 mr-1" />
                    <span className="text-[13px]">{location}</span>
                </div>

                <div className="flex items-center text-[13px] text-gray-500 mb-4 whitespace-nowrap">
                    <span className="font-semibold text-gray-700">{beds}</span> <span className="ml-[3px]">bed</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-semibold text-gray-700">{baths}</span> <span className="ml-[3px]">bath</span>
                    <span className="mx-2 text-gray-300">|</span>
                    <span className="font-semibold text-gray-700">{sqft}</span> <span className="ml-[3px]">sqft</span>
                </div>

                <div className="mt-auto flex items-baseline text-gray-900">
                    <span className="text-[15px] font-bold self-start mt-1 mr-0.5">$</span>
                    <span className="text-[22px] font-bold tracking-tight">{mainPrice}</span>
                    {cents && <span className="text-[14px] text-gray-500 font-medium ml-0.5">.{cents}</span>}
                </div>
            </div>
        </div>
    );
}
