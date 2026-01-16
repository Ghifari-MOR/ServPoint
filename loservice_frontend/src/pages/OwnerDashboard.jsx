import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png'
import iconUrl from 'leaflet/dist/images/marker-icon.png'
import shadowUrl from 'leaflet/dist/images/marker-shadow.png'

// Fix default marker icons for Leaflet in bundlers
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
})

const markers = [
  { id: 1, name: 'Toko Central', position: [-6.4025, 106.7942], category: 'Electronics', rating: 4.6 },
  { id: 2, name: 'Depot Kopi', position: [-6.426, 106.82], category: 'Cafe', rating: 4.4 },
  { id: 3, name: 'Bengkel Prima', position: [-6.391, 106.815], category: 'Workshop', rating: 4.7 },
]

const results = [
  { id: 11, name: 'Laundry Express', category: 'Laundry', rating: 4.5 },
  { id: 12, name: 'AC Service Pro', category: 'Perbaikan', rating: 4.7 },
  { id: 13, name: 'Kopi Kita', category: 'Cafe', rating: 4.3 },
  { id: 14, name: 'Toko Sembako Jaya', category: 'Grocery', rating: 4.2 },
]

export default function OwnerDashboard() {
  const center = [-6.405, 106.81]

  return (
  <div className="layout">
    {/* SIDEBAR */}
    <aside className="sidebar">
      ...
    </aside>

    {/* MAIN */}
    <main className="main">
      {/* HEADER */}
      <header className="page-header">
        <div>
          <h1>Jelajahi layanan & lokasi</h1>
          <p>Temukan layanan terdekat di sekitarmu</p>
        </div>

        <div className="stats">
          <div className="stat-box">
            <span>{results.length}</span>
            <small>Layanan</small>
          </div>
          <div className="stat-box">
            <span>{recent.length}</span>
            <small>Riwayat</small>
          </div>
          <div className="stat-box">
            <span>{user?.role || 'USER'}</span>
            <small>Status</small>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <section className="content">
        {/* MAP */}
        <div className="map-section">
          <div className="search-box">
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder="Cari layanan atau lokasi..."
            />
          </div>

          <div className="map-card">
            <iframe title="map" src={mapUrl} loading="lazy" />
          </div>
        </div>

        {/* RESULT */}
        <div className="result-section">
          <h3>Hasil Pencarian</h3>

          <div className="service-list">
            {results.map((svc) => (
              <div key={svc.id} className="service-card">
                <div>
                  <strong>{svc.name}</strong>
                  <p>{svc.category} • {svc.location}</p>
                  <div className="tags">
                    {svc.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
                <div className="rating">⭐ {svc.rating}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  </div>
 )
}
