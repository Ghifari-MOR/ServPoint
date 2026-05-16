import { AlertCircle } from 'lucide-react'

export default function LogoutConfirmModal({ isOpen, onConfirm, onCancel }) {
  if (!isOpen) return null

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: 32,
        maxWidth: 400,
        width: '90%',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)',
        animation: 'slideUp 0.2s ease-out'
      }}>
        <style>{`
          @keyframes slideUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16
        }}>
          <AlertCircle size={24} color="#dc2626" />
          <h2 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: '#0f172a'
          }}>
            Konfirmasi Logout
          </h2>
        </div>

        <p style={{
          margin: '0 0 24px 0',
          fontSize: 14,
          color: '#64748b',
          lineHeight: 1.5
        }}>
          Apakah Anda yakin ingin logout? Anda harus login kembali untuk mengakses akun Anda.
        </p>

        <div style={{
          display: 'flex',
          gap: 12,
          justifyContent: 'flex-end'
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#e2e8f0'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#f1f5f9'
            }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              background: '#dc2626',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = '#b91c1c'
            }}
            onMouseLeave={(e) => {
              e.target.style.background = '#dc2626'
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
