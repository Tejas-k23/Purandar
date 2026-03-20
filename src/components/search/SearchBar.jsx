import React from 'react';
import { MapPin, Building, Wallet, User, Bed, SlidersHorizontal, Search, X, ChevronDown } from 'lucide-react';

const FilterChip = ({ icon: Icon, label, hasClose, hasDropdown, active }) => {
    return (
        <div className={`flex items-center space-x-2 px-4 py-2.5 rounded-[50px] border transition-all cursor-pointer bg-white shadow-sm hover:shadow-md hover:-translate-y-[1px] select-none
      ${active ? 'border-gray-900 ring-1 ring-gray-900/5' : 'border-gray-200 hover:border-gray-400'}`}>
            <Icon className={`w-4 h-4 ${active ? 'text-gray-900' : 'text-gray-500'}`} />
            <span className="text-[14px] font-medium text-gray-800 whitespace-nowrap">{label}</span>
            {hasClose && (
                <button className="ml-1 p-0.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-800 transition-colors">
                    <X className="w-[14px] h-[14px]" />
                </button>
            )}
            {hasDropdown && (
                <ChevronDown className="w-4 h-4 text-gray-400 ml-1" />
            )}
        </div>
    );
};

export default function SearchBar() {
    return (
        <div className="w-full bg-white border-b border-gray-100 flex flex-col lg:flex-row lg:items-center justify-between p-4 shrink-0 gap-4">

            {/* Scrollable Filters Row */}
            <div className="flex items-center gap-3 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide flex-1 w-full pl-1 lg:pl-2">
                <FilterChip icon={MapPin} label="Budva, Montenegro" hasClose active />
                <FilterChip icon={Building} label="Apartment, House" hasDropdown />
                <FilterChip icon={Wallet} label="$100K–200K" hasClose />
                <FilterChip icon={User} label="3 persons" hasDropdown />
                <FilterChip icon={Bed} label="2 bedrooms" hasDropdown />
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center space-x-3 flex-shrink-0 pr-1 lg:pr-2">
                <button className="flex items-center justify-center p-3 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 hover:text-gray-900 transition-all hover:shadow-sm">
                    <SlidersHorizontal className="w-[18px] h-[18px]" />
                </button>
                <button className="flex items-center space-x-2 bg-gray-900 text-white px-7 py-3 rounded-[50px] font-semibold text-[15px] hover:bg-black transition-all shadow-md hover:shadow-lg hover:-translate-y-[1px]">
                    <Search className="w-4 h-4 text-white" />
                    <span>Search</span>
                </button>
            </div>

        </div>
    );
}
