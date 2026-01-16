import React, { useContext } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, LogOut, User as UserIcon } from 'lucide-react'
import { AuthContext } from '../context/AuthContext'

export default function Sidebar() {
    const { user, logout } = useContext(AuthContext)
    const location = useLocation()
    const navigate = useNavigate()
    const path = location.pathname

    const handleLogout = () => {
        if (window.confirm('Apakah Anda yakin ingin logout?')) {
            logout()
            navigate('/login')
        }
    }

    return (
        <aside className="owner-sidebar" style={{ width: 260 }}>
            {/* Brand */}
            <div className="sidebar-brand" style={{ padding: '0 8px 16px' }}>
                <div style={{
                    width: 32, height: 32, background: '#4f46e5', borderRadius: 8,
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

            <div style={{ marginTop: 'auto', borderTop: '1px solid #e2e8f0', paddingTop: 16, padding: '16px 8px 0' }}>
                {!user && (
                    <Link to="/login" className="btn" style={{ width: '100%', textAlign: 'center', justifyContent: 'center', display: 'flex' }}>
                        Masuk Akun
                    </Link>
                )}
            </div>
        </aside>
    )
}

function SidebarLink({ to, icon, label, active }) {
    return (
        <Link to={to} className={`sidebar-link ${active ? 'active' : ''}`} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 8, color: active ? '#4f46e5' : '#475569',
            background: active ? '#e0e7ff' : 'transparent',
            fontWeight: 500, fontSize: 14, textDecoration: 'none'
        }}>
            {icon}
            <span>{label}</span>
        </Link>
    )
}