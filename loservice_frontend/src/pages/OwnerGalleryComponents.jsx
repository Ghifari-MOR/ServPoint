import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'

export function GalleryContent({ gallery, onAdd, onDelete, onSetPrimary }) {
  const safeGallery = Array.isArray(gallery) ? gallery : []

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700, color: '#0f172a' }}>
          Galeri Foto ({safeGallery.length})
        </h1>
        <button
          onClick={onAdd}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 24px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
            border: 'none',
            borderRadius: 8,
            color: '#fff',
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)'
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(79, 70, 229, 0.4)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)'
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(79, 70, 229, 0.3)'
          }}
        >
          <Plus size={18} />
          Upload Foto
        </button>
      </div>

      {safeGallery.length === 0 ? (
        <div style={{ background: '#fff', borderRadius: 12, padding: 60, textAlign: 'center', color: '#94a3b8' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
          <p style={{ margin: 0, fontSize: 16, marginBottom: 8 }}>Belum ada foto di galeri</p>
          <p style={{ margin: 0, fontSize: 14 }}>Upload foto pertama untuk menarik perhatian pelanggan</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {safeGallery.map((img) => (
            <GalleryCard
              key={img.gallery_id}
              image={img}
              onDelete={onDelete}
              onSetPrimary={onSetPrimary}
            />
          ))}
        </div>
      )}
    </>
  )
}

function GalleryCard({ image, onDelete, onSetPrimary }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 12,
      overflow: 'hidden',
      border: image.is_primary ? '2px solid #3b82f6' : '1px solid #e2e8f0',
      position: 'relative'
    }}>
      {image.is_primary && (
        <div style={{
          position: 'absolute',
          top: 8,
          left: 8,
          background: '#3b82f6',
          color: '#fff',
          padding: '4px 12px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          zIndex: 1
        }}>
          Foto Utama
        </div>
      )}
      
      <div style={{ 
        width: '100%', 
        height: 200, 
        overflow: 'hidden',
        background: '#f1f5f9'
      }}>
        <img 
          src={image.image_url || 'https://placehold.co/400x300/1e293b/e2e8f0?text=No+Image'} 
          alt="Gallery" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
      </div>
      
      <div style={{ padding: 12, display: 'flex', gap: 8 }}>
        {!image.is_primary && (
          <button
            onClick={() => onSetPrimary(image.gallery_id)}
            style={{
              flex: 1,
              padding: '8px 12px',
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 500,
              color: '#475569',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#e2e8f0'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#f1f5f9'
            }}
          >
            Set Utama
          </button>
        )}
        <button
          onClick={() => onDelete(image.gallery_id)}
          style={{
            flex: image.is_primary ? 1 : 0,
            padding: '8px 12px',
            background: '#fee2e2',
            border: '1px solid #fecaca',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 500,
            color: '#dc2626',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fecaca'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#fee2e2'
          }}
        >
          <Trash2 size={14} style={{ display: 'inline' }} />
        </button>
      </div>
    </div>
  )
}

export function GalleryModal({ onSave, onClose, selectedImage, imagePreview, handleImageChange, uploading }) {
  const [showConfirmClose, setShowConfirmClose] = useState(false)

  // Check if form has unsaved/selected image
  const hasChanges = !!selectedImage || !!imagePreview

  // Handle close with confirmation
  const handleClose = () => {
    if (hasChanges && !uploading) {
      setShowConfirmClose(true)
    } else if (!uploading) {
      onClose()
    }
  }

  return (
    <>
      {/* Confirmation Dialog */}
      {showConfirmClose && (
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
          zIndex: 2000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 400,
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 12px 0', color: '#0f172a' }}>Batalkan upload?</h3>
            <p style={{ margin: '0 0 20px 0', color: '#64748b', fontSize: 14 }}>
              Foto yang Anda pilih akan tidak disimpan jika tidak diupload.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={() => setShowConfirmClose(false)}
                style={{
                  padding: '10px 20px',
                  border: '1px solid #e2e8f0',
                  background: '#fff',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#64748b'
                }}
              >
                Lanjutkan Upload
              </button>
              <button
                onClick={() => {
                  setShowConfirmClose(false)
                  onClose()
                }}
                style={{
                  padding: '10px 20px',
                  border: 'none',
                  background: '#ef4444',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#fff'
                }}
              >
                Keluar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: 24
      }} onClick={handleClose}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: 32,
        maxWidth: 500,
        width: '100%',
        maxHeight: '90vh',
        overflow: 'auto'
      }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: '#0f172a' }}>
            Upload Foto Galeri
          </h2>
          <button
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: 4
            }}
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={onSave}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', marginBottom: 8, fontSize: 14, fontWeight: 600, color: '#334155' }}>
              Pilih Foto
            </label>
            
            {imagePreview && (
              <div style={{ marginBottom: 12, borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                <img src={imagePreview} alt="Preview" style={{ width: '100%', display: 'block' }} />
              </div>
            )}

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px dashed #cbd5e1',
                borderRadius: 8,
                fontSize: 14,
                cursor: 'pointer'
              }}
            />
            <p style={{ margin: '8px 0 0 0', fontSize: 12, color: '#64748b', lineHeight: '1.6' }}>
              <strong>Format:</strong> JPG, PNG, GIF<br/>
              <strong>Ukuran File:</strong> Maksimal 10MB<br/>
              <strong>Dimensi:</strong> Bebas (Rekomendasi: 800x600px atau lebih)
            </p>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button
              type="button"
              onClick={handleClose}
              style={{
                flex: 1,
                padding: '12px',
                background: '#f1f5f9',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#475569',
                cursor: 'pointer'
              }}
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={uploading}
              style={{
                flex: 1,
                padding: '12px',
                background: uploading ? '#94a3b8' : 'linear-gradient(135deg, #3b82f6 0%, #1e40af 100%)',
                border: 'none',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                color: '#fff',
                cursor: uploading ? 'not-allowed' : 'pointer'
              }}
            >
              {uploading ? 'Mengupload...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  )
}
