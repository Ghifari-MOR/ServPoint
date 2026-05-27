import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function Terms() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg, #eff6ff 0%, #f8fafc 32%, #ffffff 100%)', padding: '24px 16px 40px' }}>
      <div style={{ maxWidth: 980, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
          <div>
            <p style={{ margin: '0 0 6px', color: '#2563eb', fontWeight: 800, letterSpacing: 0.6, fontSize: 12 }}>SERVICEPOINT</p>
            <h1 style={{ margin: 0, fontSize: 30, color: '#0f172a', lineHeight: 1.2 }}>Syarat & Ketentuan Penggunaan Platform Servpoint</h1>
          </div>
          <button
            type="button"
            onClick={() => navigate('/register')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 12,
              background: '#fff',
              border: '1px solid #cbd5e1',
              color: '#0f172a',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 8px 24px rgba(15, 23, 42, 0.06)'
            }}
          >
            <ArrowLeft size={16} />
            Kembali
          </button>
        </div>

        <div style={{ background: '#fff', borderRadius: 24, border: '1px solid #e2e8f0', boxShadow: '0 24px 80px rgba(15, 23, 42, 0.08)', overflow: 'hidden' }}>
          <div style={{ background: 'linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%)', padding: '20px 24px', borderBottom: '1px solid #e2e8f0' }}>
            <p style={{ margin: 0, color: '#334155', lineHeight: 1.7 }}>
              Dengan mengakses dan menggunakan platform Servpoint, pengguna dinyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum dalam dokumen ini.
            </p>
          </div>

          <div style={{ padding: '24px', color: '#334155', lineHeight: 1.7, fontSize: 15 }}>
            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>1. Ketentuan Umum</h2>
              <p style={{ margin: 0 }}>
                Dengan mengakses dan memanfaatkan layanan platform Servpoint, pengguna dinyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang termaktub dalam dokumen ini secara menyeluruh dan tanpa pengecualian. Platform Servpoint merupakan layanan digital yang berfungsi sebagai penghubung antara pengguna dengan pelaku Usaha Mikro, Kecil, dan Menengah (UMKM) yang bergerak di bidang jasa servis elektronik. Servpoint memiliki kewenangan untuk melakukan perubahan terhadap syarat dan ketentuan ini sewaktu-waktu, dan perubahan tersebut dinyatakan berlaku sejak diterbitkan di dalam platform tanpa memerlukan pemberitahuan terlebih dahulu.
              </p>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>2. Akun Pengguna</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Pengguna berkewajiban untuk mendaftarkan akun dengan menyertakan informasi yang benar, lengkap, dan dapat dipertanggungjawabkan kebenarannya.</li>
                <li>Pengguna memikul tanggung jawab penuh atas keamanan dan kerahasiaan kredensial akun yang dimilikinya.</li>
                <li>Satu alamat surat elektronik hanya dapat dipergunakan untuk mendaftarkan satu akun dalam sistem.</li>
                <li>Servpoint berwenang untuk menangguhkan atau menghapus akun yang terbukti secara sah menyertakan informasi yang tidak valid atau melakukan pelanggaran terhadap ketentuan yang berlaku.</li>
                <li>Pengguna dilarang keras untuk mengalihkan kepemilikan akun kepada pihak lain dalam bentuk dan cara apapun.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>3. Peran Pengguna</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Platform Servpoint menetapkan dua klasifikasi peran pengguna, yaitu USER dan OWNER.</li>
                <li>Pengguna dengan klasifikasi peran USER diberikan kesempatan untuk beralih menjadi OWNER melalui mekanisme pendaftaran usaha yang telah disediakan oleh platform.</li>
                <li>Perubahan klasifikasi peran dari USER menjadi OWNER bersifat permanen dan tidak dapat dikembalikan ke kondisi semula dalam keadaan apapun.</li>
                <li>Pengguna diwajibkan untuk memahami sepenuhnya dan menyetujui segala konsekuensi yang timbul dari perubahan peran tersebut sebelum melanjutkan proses pendaftaran usaha.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>4. Ketentuan Pemilik UMKM (OWNER)</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Pemilik UMKM berkewajiban untuk mendaftarkan entitas usahanya dengan informasi yang benar, transparan, dan tidak bersifat menyesatkan bagi pihak manapun.</li>
                <li>Produk dan layanan yang didaftarkan ke dalam platform wajib memiliki kesesuaian dengan bidang usaha yang telah tercatat dalam sistem.</li>
                <li>Pemilik UMKM dilarang untuk mendaftarkan produk atau layanan yang bertentangan dengan peraturan perundang-undangan yang berlaku di wilayah hukum Republik Indonesia.</li>
                <li>Dokumentasi visual berupa foto dan gambar yang diunggah ke dalam galeri usaha wajib merupakan karya atau dokumentasi orisinal yang tidak melanggar hak kekayaan intelektual pihak lain.</li>
                <li>Servpoint memiliki kewenangan untuk menolak, menangguhkan, atau menghapus profil usaha yang terbukti melakukan pelanggaran terhadap ketentuan yang telah ditetapkan.</li>
                <li>Informasi harga yang dicantumkan dalam katalog wajib mencerminkan harga yang berlaku secara aktual dan nyata di lapangan.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>5. Penggunaan Platform</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Pengguna dilarang memanfaatkan platform Servpoint untuk kepentingan yang bertentangan dengan hukum yang berlaku atau yang berpotensi menimbulkan kerugian bagi pihak lain.</li>
                <li>Pengguna dilarang melakukan tindakan yang dapat mengganggu stabilitas, merusak integritas, atau membebani kapasitas infrastruktur sistem Servpoint.</li>
                <li>Pengguna dilarang berupaya mengakses data, informasi, atau fitur yang tidak berada dalam lingkup otoritas dan haknya sebagai pengguna terdaftar.</li>
                <li>Seluruh aktivitas yang dilakukan pengguna di dalam platform dapat dipantau dan didokumentasikan oleh sistem sebagai bagian dari mekanisme pengamanan platform.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>6. Konten dan Informasi</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Servpoint tidak bertanggung jawab atas validitas dan keakuratan informasi produk maupun layanan yang didaftarkan oleh pemilik UMKM secara mandiri.</li>
                <li>Pengguna sangat dianjurkan untuk melakukan konfirmasi dan verifikasi secara langsung kepada pemilik UMKM yang bersangkutan sebelum memutuskan untuk menggunakan layanan yang ditawarkan.</li>
                <li>Servpoint berwenang untuk menghapus konten yang dinilai tidak layak, bersifat menyesatkan, atau melanggar ketentuan yang berlaku tanpa diharuskan memberikan pemberitahuan sebelumnya kepada pihak yang bersangkutan.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>7. Privasi Data</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Servpoint melakukan pengumpulan dan pemrosesan data pengguna dengan mengacu pada kebijakan privasi yang telah ditetapkan dan berlaku dalam platform.</li>
                <li>Data pribadi pengguna tidak akan diperjualbelikan maupun disebarluaskan kepada pihak ketiga tanpa memperoleh persetujuan eksplisit dari pengguna yang bersangkutan, kecuali apabila hal tersebut diwajibkan oleh ketentuan hukum yang berlaku.</li>
                <li>Pengguna memberikan persetujuan bahwa data yang telah diberikan dapat dimanfaatkan oleh Servpoint untuk keperluan evaluasi dan peningkatan kualitas layanan platform secara berkelanjutan.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>8. Penolakan Tanggung Jawab</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Servpoint menjalankan fungsi sebagai perantara digital antara pengguna dan pemilik UMKM, dan karenanya tidak memikul tanggung jawab atas transaksi maupun kesepakatan yang terjadi di luar lingkup platform.</li>
                <li>Servpoint tidak memberikan jaminan apapun terhadap kualitas, keandalan, maupun profesionalisme layanan yang diberikan oleh pemilik UMKM yang terdaftar dalam sistem.</li>
                <li>Segala kerugian yang timbul sebagai akibat dari penggunaan layanan UMKM yang terdaftar di platform sepenuhnya menjadi tanggung jawab masing-masing pihak yang terlibat secara langsung.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>9. Penangguhan dan Penghapusan Akun</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Servpoint berwenang untuk menangguhkan sementara atau menghapus secara permanen akun pengguna yang terbukti melakukan pelanggaran terhadap syarat dan ketentuan yang telah ditetapkan.</li>
                <li>Pengguna dapat mengajukan permohonan penghapusan akun secara mandiri melalui mekanisme yang telah disediakan di dalam platform.</li>
                <li>Penghapusan akun tidak serta-merta membebaskan pengguna dari kewajiban maupun pertanggungjawaban atas pelanggaran yang telah dilakukan sebelum proses penghapusan dilaksanakan.</li>
              </ul>
            </section>

            <section style={{ marginBottom: 24 }}>
              <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#0f172a' }}>10. Perubahan Layanan</h2>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>Servpoint memiliki kewenangan untuk mengubah, menambahkan, atau menghentikan fitur dan layanan yang tersedia sewaktu-waktu tanpa kewajiban untuk menyampaikan pemberitahuan terlebih dahulu.</li>
                <li>Servpoint tidak bertanggung jawab atas kerugian dalam bentuk apapun yang timbul sebagai akibat dari perubahan, pembatasan, maupun penghentian layanan yang dilakukan oleh platform.</li>
              </ul>
            </section>

            <div style={{ marginTop: 28, padding: 16, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', fontWeight: 600 }}>
              Dengan mengakses dan menggunakan platform Servpoint, pengguna dinyatakan telah membaca, memahami, dan menyetujui seluruh syarat dan ketentuan yang tercantum dalam dokumen ini.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}