import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Home, User as UserIcon } from 'lucide-react'

export default function Sidebar() {
    const location = useLocation()
    const path = location.pathname

    return (
        <aside className="owner-sidebar" style={{ width: 260 }}>
            {/* Brand */}
            <div className="sidebar-brand" style={{ padding: '0 8px 16px' }}>
                <div style={{
                    width: 32, height: 32, background: '#3b82f6', borderRadius: 8,
                    display: 'grid', placeItems: 'center', color: '#fff', fontSize: 16
                }}>
                    SP
                </div>
                <span style={{ fontSize: 18, fontWeight: 700 }}>ServPoint</span>
            </div>

            <div style={{ marginBottom: 24, padding: '0 8px' }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Menu Utama</p>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <SidebarLink to="/user-map" icon={<Home size={18} />} label="Home" active={path === '/user-map'} />
                </nav>
            </div>


        </aside>
    )
}

function SidebarLink({ to, icon, label, active }) {
    return (
        <Link to={to} className={`sidebar-link ${active ? 'active' : ''}`} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 8, color: active ? '#3b82f6' : '#475569',
            background: active ? '#e0e7ff' : 'transparent',
            fontWeight: 500, fontSize: 14, textDecoration: 'none'
        }}>
            {icon}
            <span>{label}</span>
        </Link>
    )
}