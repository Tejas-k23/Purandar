import React, { useState } from 'react';
import { Copy, ExternalLink, Check } from 'lucide-react';

const rows = [
    { label: 'Token Standard', value: 'ERC-721', mono: false },
    { label: 'Contract Address', value: '0x3f5a...b9c2', mono: true, copy: true },
    { label: 'Token ID', value: '#4821', mono: true },
    { label: 'Blockchain', value: 'Ethereum', mono: false },
    { label: 'Total Shares', value: '1,000', mono: false },
    { label: 'Your Shares', value: '0', mono: false },
];

export default function BlockchainInfo() {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText('0x3f5adc89ab13c2d7e1f3a9b8e73f4d2b6ca8b9c2');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="mt-7">
            <h2 className="text-base font-semibold text-white mb-3">On-Chain Property Details</h2>

            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
                {rows.map(({ label, value, mono, copy }, i) => (
                    <div
                        key={i}
                        className={`flex items-center justify-between px-4 py-3 ${i !== rows.length - 1 ? 'border-b border-white/[0.07]' : ''
                            } hover:bg-white/[0.03] transition-colors`}
                    >
                        <span className="text-gray-400 text-sm">{label}</span>
                        <div className="flex items-center gap-2">
                            <span className={`text-white text-sm font-medium ${mono ? 'font-mono' : ''}`}>
                                {value}
                            </span>
                            {copy && (
                                <button
                                    onClick={handleCopy}
                                    className="text-gray-500 hover:text-[#4F8EF7] transition-colors"
                                    title="Copy address"
                                >
                                    {copied ? (
                                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    ) : (
                                        <Copy className="w-3.5 h-3.5" />
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <a
                href="https://etherscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-3 text-[#4F8EF7] text-sm hover:text-[#6BA3FF] transition-colors"
            >
                View on Etherscan <ExternalLink className="w-3.5 h-3.5" />
            </a>
        </div>
    );
}
