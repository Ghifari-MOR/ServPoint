import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export default function ConfirmActionModal({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Konfirmasi', 
  cancelText = 'Batal',
  onConfirm, 
  onCancel,
  type = 'warning' // 'warning', 'success', 'error', 'info'
}) {
  if (!isOpen) return null

  const getIcon = () => {
    switch(type) {
      case 'success': return <CheckCircle size={24} color="#10b981" />
      case 'error': return <XCircle size={24} color="#ef4444" />
      default: return <AlertCircle size={24} color="#dc2626" />
    }
  }

  const getButtonColor = () => {
    switch(type) {
      case 'success': return { primary: '#10b981', hover: '#059669' }
      case 'error': return { primary: '#ef4444', hover: '#dc2626' }
      default: return { primary: '#dc2626', hover: '#b91c1c' }
    }
  }

  const colors = getButtonColor()

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
          {getIcon()}
          <h2 style={{
            margin: 0,
            fontSize: 18,
            fontWeight: 700,
            color: '#0f172a'
          }}>
            {title}
          </h2>
        </div>

        <p style={{
          margin: '0 0 24px 0',
          fontSize: 14,
          color: '#64748b',
          lineHeight: 1.5
        }}>
          {message}
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
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              background: colors.primary,
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              color: '#fff',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.target.style.background = colors.hover
            }}
            onMouseLeave={(e) => {
              e.target.style.background = colors.primary
            }}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
