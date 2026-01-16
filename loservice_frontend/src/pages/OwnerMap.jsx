import React from 'react'

const mapUrl = import.meta.env.VITE_FOLIUM_MAP_URL ||
  'https://www.openstreetmap.org/export/embed.html?bbox=106.77%2C-6.3%2C107.1%2C-6.05&layer=mapnik'

export default function OwnerMap() {
  return (
    <div className="flex min-h-screen bg-[#0d1021] text-white">
      <aside className="w-[260px] bg-[#0f1629] p-5 flex flex-col justify-between">
        <div>
          <p className="text-sm font-semibold">Owner Panel</p>
          <div className="mt-4 space-y-3">
            <div className="h-12 rounded-lg bg-[#1b243a]" />
            <div className="h-12 rounded-lg bg-[#1b243a]" />
            <div className="h-12 rounded-lg bg-[#1b243a]" />
          </div>
        </div>
        <button className="w-full bg-[#7b3cff] hover:bg-[#6a33dc] text-white py-3 rounded-lg font-semibold transition">
          Logout
        </button>
      </aside>

      <main className="flex-1 relative">
        <div className="absolute inset-0">
          <iframe title="owner-map" src={mapUrl} className="w-full h-full border-0" />
        </div>
      </main>
    </div>
  )
}
