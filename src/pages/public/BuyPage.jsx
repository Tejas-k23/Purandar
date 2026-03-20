import React from 'react';
import SearchBar from '../../components/search/SearchBar';
import ListingsPanel from '../../components/property/ListingsPanel';
import MapPanel from '../../components/search/MapPanel';

export default function BuyPage() {
    return (
        <>
            <SearchBar />
            <div className="flex flex-1 overflow-hidden mt-1">
                <div className="w-full lg:w-1/2 h-full">
                    <ListingsPanel />
                </div>
                <div className="hidden lg:block lg:w-1/2 h-full bg-gray-100 rounded-tl-3xl border-l border-t border-gray-200 shadow-inner overflow-hidden">
                    <MapPanel />
                </div>
            </div>
        </>
    );
}
