import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Data.css';
import NavbarWakel from '../../components/WaliKelas/NavbarWakel';
import InputSuratModal from '../../components/WaliKelas/InputDispensasiModal';

const Data = () => {
  const navigate = useNavigate();
  const [editingIndex, setEditingIndex] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [previewModal, setPreviewModal] = useState({ 
    open: false, 
    file: null, 
    type: null,
    studentName: '',
    fileName: ''
  });

  const kelasInfo = {
    nama: 'XII Rekayasa Perangkat Lunak 2',
  };

  // Data siswa dengan properti suratFile, keterangan, dan jamMasuk (untuk terlambat)
  const [studentList, setStudentList] = useState([
    { nisn: '00601', nama: 'Andi Pratama', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null },
    { nisn: '00602', nama: 'Siti Aisyah', status: 'Izin', keterangan: 'Izin menghadiri acara keluarga', jamMasuk: null, suratFile: '/uploads/surat-izin-siti.jpg', suratFileName: 'surat-izin-siti.jpg' },
    { nisn: '00603', nama: 'Budi Santoso', status: 'Sakit', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null },
    { nisn: '00604', nama: 'Rina Lestari', status: 'Alpha', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null },
    { nisn: '00605', nama: 'Dewi Anggraini', status: 'Pulang', keterangan: 'Pulang di Jam Ke-4 (09:15)', jamMasuk: null, suratFile: '/uploads/surat-pulang-dewi.png', suratFileName: 'surat-pulang-dewi.png' },
    { nisn: '00606', nama: 'Ahmad Rizki', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null },
    { nisn: '00607', nama: 'Nur Halimah', status: 'Terlambat', keterangan: '', jamMasuk: '08:15', suratFile: null, suratFileName: null },
    { nisn: '00608', nama: 'Fajar Sidiq', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null },
    { nisn: '00609', nama: 'Maya Sari', status: 'Hadir', keterangan: '', jamMasuk: null, suratFile: null, suratFileName: null },
    { nisn: '00610', nama: 'Rudi Hartono', status: 'Terlambat', keterangan: '', jamMasuk: '07:50', suratFile: null, suratFileName: null }
  ]);

  const stats = {
    Hadir: studentList.filter((s) => s.status === 'Hadir').length,
    Izin: studentList.filter((s) => s.status === 'Izin').length,
    Sakit: studentList.filter((s) => s.status === 'Sakit').length,
    Alpha: studentList.filter((s) => s.status === 'Alpha').length,
    Pulang: studentList.filter((s) => s.status === 'Pulang').length,
    Terlambat: studentList.filter((s) => s.status === 'Terlambat').length,
  };

  const handleStatusChange = (index, value) => {
    const updated = [...studentList];
    updated[index].status = value;
    setStudentList(updated);
    setEditingIndex(null);
  };

  const handleViewSurat = (student) => {
    const fileType = student.suratFile.match(/\.(jpg|jpeg|png)$/i) ? 'image' : 'pdf';
    setPreviewModal({
      open: true,
      file: student.suratFile,
      type: fileType,
      studentName: student.nama,
      fileName: student.suratFileName
    });
  };

  const handleDownloadSurat = () => {
    const link = document.createElement('a');
    link.href = previewModal.file;
    link.download = previewModal.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const closePreview = () => {
    setPreviewModal({ 
      open: false, 
      file: null, 
      type: null,
      studentName: '',
      fileName: ''
    });
  };

  // Fungsi untuk handle surat yang diunggah dari modal
  const handleSuratUploaded = (suratData) => {
    console.log('Surat diterima:', suratData);
    
    const updatedList = studentList.map(student => {
      if (student.nama === suratData.namaSiswa) {
        return {
          ...student,
          status: suratData.jenisSurat,
          keterangan: suratData.keterangan,
          suratFile: suratData.uploadFile1 ? URL.createObjectURL(suratData.uploadFile1) : student.suratFile,
          suratFileName: suratData.uploadFile1 ? suratData.uploadFile1.name : student.suratFileName
        };
      }
      return student;
    });
    
    setStudentList(updatedList);
  };

  const needsSurat = (status) => {
    return ['Izin', 'Sakit', 'Pulang'].includes(status);
  };

  // Fungsi untuk menampilkan keterangan berdasarkan status
  const getKeteranganText = (student) => {
    if (student.status === 'Terlambat' && student.jamMasuk) {
      return `Masuk jam ${student.jamMasuk}`;
    }
    return student.keterangan || '-';
  };

  return (
    <div className="kehadiran-siswa-page">
      <NavbarWakel />
      <div className="page-header">
        <h1>Kehadiran Siswa</h1>
      </div>

      <div className="page-content">
        {/* ===== HEADER INFO ===== */}
        <div className="header-box">
          <div className="kelas-info">
            <div className="kelas-icon">🏫</div>
            <div>
              <div className="kelas-nama">{kelasInfo.nama}</div>
            </div>
          </div>

          <div className="header-right">
            <div className="header-actions">
              <button
                className="btn-primary"
                onClick={() => navigate('/walikelas/riwayatkehadiran')}
              >
                Lihat Rekap
              </button>

              <button
                className="btn-primary"
                onClick={() => setOpenModal(true)}
              >
                📄 Unggah Surat
              </button>
            </div>

            <div className="stat-boxes">
              {Object.keys(stats).map((key) => (
                <div key={key} className="stat-item">
                  <span>{key}</span>
                  <strong>{stats[key]}</strong>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ===== TABLE ===== */}
        <div className="table-wrapperr">
          <table>
            <thead>
              <tr>
                <th className="col-no">No</th>
                <th className="col-nisn">NISN</th>
                <th className="col-nama">Nama</th>
                <th className="col-status">Status</th>
                <th className="col-keterangan">Keterangan</th>
                <th className="col-aksi">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {studentList.map((s, i) => (
                <tr key={i}>
                  <td className="col-no">{i + 1}</td>
                  <td className="col-nisn">{s.nisn}</td>
                  <td className="col-nama">{s.nama}</td>
                  <td className="col-status">
                    {editingIndex === i ? (
                      <select
                        value={s.status}
                        onChange={(e) => handleStatusChange(i, e.target.value)}
                        onBlur={() => setEditingIndex(null)}
                        autoFocus
                      >
                        <option>Hadir</option>
                        <option>Izin</option>
                        <option>Sakit</option>
                        <option>Alpha</option>
                        <option>Pulang</option>
                        {/* TERLAMBAT TIDAK BISA DIPILIH - hanya dari guru */}
                        <option disabled style={{color: '#999'}}>Terlambat (dari guru)</option>
                      </select>
                    ) : (
                      <div className="status-cell">
                        <span className={`status ${s.status.toLowerCase()}`}>
                          {s.status}
                        </span>
                        {needsSurat(s.status) && !s.suratFile && (
                          <span className="surat-belum">Surat belum diunggah</span>
                        )}
                      </div>
                    )}
                  </td>
                  <td className="col-keterangan">
                    <span className="keterangan-text">{getKeteranganText(s)}</span>
                  </td>
                  <td className="col-aksi">
                    <div className="aksi-icons">
                      <button
                        title="Edit Status"
                        onClick={() => setEditingIndex(i)}
                        className="btn-icon btn-edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        title="Lihat Surat"
                        onClick={() => needsSurat(s.status) && s.suratFile ? handleViewSurat(s) : null}
                        className={`btn-icon btn-view ${needsSurat(s.status) && s.suratFile ? 'visible' : 'invisible'}`}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===== MODAL UNGGAH SURAT ===== */}
      <InputSuratModal
        isOpen={openModal}
        onClose={() => setOpenModal(false)}
        onSuratUploaded={handleSuratUploaded}
        studentList={studentList}
      />

      {/* ===== MODAL PREVIEW SURAT ===== */}
      {previewModal.open && (
        <div className="preview-modal-overlay" onClick={closePreview}>
          <div className="preview-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-modal-header">
              <div>
                <h3>Surat - {previewModal.studentName}</h3>
                <p className="file-name">{previewModal.fileName}</p>
              </div>
              <button className="close-preview" onClick={closePreview} title="Tutup">
                ✕
              </button>
            </div>
            <div className="preview-modal-body">
              {previewModal.type === 'image' ? (
                <img
                  src={previewModal.file}
                  alt="Preview Surat"
                  className="image-preview"
                />
              ) : (
                <div className="pdf-preview">
                  <iframe
                    src={previewModal.file}
                    title="Preview Surat PDF"
                    width="100%"
                    height="100%"
                  />
                </div>
              )}
            </div>
            <div className="preview-modal-footer">
              <button 
                className="btn-download" 
                onClick={handleDownloadSurat}
              >
                📥 Download Surat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Data;