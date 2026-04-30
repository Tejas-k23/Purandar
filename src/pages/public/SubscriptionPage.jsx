import React from 'react';

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-16 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_30px_80px_rgba(15,23,42,0.08)] sm:p-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-indigo-600">
                Launching Soon
              </p>
              <h1 className="mt-4 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Free Trial
              </h1>
            </div>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-700">
              Launching Soon
            </span>
          </div>

          <p className="mt-6 text-slate-600">
            Enjoy a short free trial package before paid plans become available. This is a limited launch offer so you can start listing your first property.
          </p>

          <div className="mt-10 grid gap-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 sm:grid-cols-[1fr_auto]">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Properties</p>
              <p className="mt-3 text-4xl font-semibold text-slate-900">1 Property Listing</p>
              <p className="mt-4 text-sm font-medium text-slate-500">Validity</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">35 Days</p>
            </div>
            <div className="flex flex-col items-start justify-center gap-4 rounded-3xl bg-white p-6 text-slate-900 shadow-lg sm:items-end">
              <span className="text-sm uppercase tracking-[0.2em] text-slate-500">Price</span>
              <p className="text-5xl font-bold text-slate-900">₹0</p>
              <button
                type="button"
                disabled
                className="mt-2 inline-flex cursor-not-allowed items-center justify-center rounded-full bg-slate-200 px-6 py-3 text-sm font-semibold text-slate-600 transition duration-200"
              >
                Buy now
              </button>
            </div>
          </div>

          <div className="mt-10 rounded-3xl bg-white p-6 text-center text-slate-500 shadow-sm">
            Paid packages will appear here soon
          </div>
        </div>
      </div>
    </div>
  );
}
