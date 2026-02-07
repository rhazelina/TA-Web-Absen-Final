// Tambah.jsx
import React, { useState, useEffect } from 'react';
import './TambahSiswa.css';

function Tambah({ isOpen, onClose, onSubmit, editData, classes = [] }) {
  const [formData, setFormData] = useState({
    namaSiswa: '',
    nisn: '',
    jurusan: '',
    kelas: '',
    classId: null // Added classId
  });

  // Derived state from classes prop
  const [availableMajors, setAvailableMajors] = useState([]);
  const [availableClasses, setAvailableClasses] = useState([]);

  useEffect(() => {
    // Extract unique majors
    if (classes.length > 0) {
      const majors = [...new Set(classes.map(c => c.major).filter(Boolean))];
      setAvailableMajors(majors.sort());
    }
  }, [classes]);

  useEffect(() => {
    // Filter classes based on selected major
    if (formData.jurusan) {
      const filtered = classes.filter(c => c.major === formData.jurusan);
      setAvailableClasses(filtered);
    } else {
      setAvailableClasses([]);
    }
  }, [formData.jurusan, classes]);

  // Auto isi saat edit
  useEffect(() => {
    if (editData) {
      setFormData({
        namaSiswa: editData.nama,
        nisn: editData.nisn,
        jurusan: editData.jurusan,
        kelas: editData.kelas,
        classId: editData.classId
      });
    } else {
      setFormData({ namaSiswa: '', nisn: '', jurusan: '', kelas: '', classId: null });
    }
  }, [editData, isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // Jika yang diubah adalah jurusan, reset pilihan kelas
    if (name === 'jurusan') {
      setFormData({
        ...formData,
        jurusan: value,
        kelas: '', // Reset kelas ketika jurusan berubah
        classId: null
      });
    } else if (name === 'kelas') {
      const selectedClass = classes.find(c => c.id === parseInt(value) || c.name === value);
      // If value is ID (from select option value), use it. 
      // We will make select option value = class.id

      setFormData({
        ...formData,
        kelas: selectedClass ? selectedClass.name : '',
        classId: value // Assumption: value is class ID
      });

    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);   // kirim data balik ke DataSiswa.jsx
    setFormData({ namaSiswa: '', nisn: '', jurusan: '', kelas: '', classId: null });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">
          {editData ? "Ubah Data Siswa" : "Tambah Siswa"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>Nama Siswa</label>
            <input
              type="text"
              name="namaSiswa"
              placeholder="Masukkan nama siswa..."
              value={formData.namaSiswa}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>NISN</label>
            <input
              type="text"
              name="nisn"
              placeholder="Masukkan NISN siswa..."
              value={formData.nisn}
              onChange={handleChange}
              onKeyPress={(e) => {
                if (!/[0-9]/.test(e.key)) e.preventDefault();
              }}
              required
            />
          </div>

          <div className="input-group">
            <label>Konsentrasi Keahlian</label>
            <select
              name="jurusan"
              value={formData.jurusan}
              onChange={handleChange}
              required
            >
              <option value="">Pilih Konsentrasi Keahlian...</option>
              {availableMajors.length > 0 ? (
                availableMajors.map(major => (
                  <option key={major} value={major}>{major}</option>
                ))
              ) : (
                // Fallback if no classes loaded or empty majors
                <>
                  <option value="RPL">RPL</option>
                  <option value="TKJ">TKJ</option>
                  <option value="DKV">DKV</option>
                </>
              )}
            </select>
          </div>

          <div className="input-group">
            <label>Kelas</label>
            <select
              name="kelas"
              value={formData.classId || ''} // Use classId as value
              onChange={handleChange}
              disabled={!formData.jurusan}
              required
            >
              <option value="">
                {formData.jurusan ? 'Pilih Kelas...' : 'Pilih Konsentrasi Keahlian Terlebih Dahulu'}
              </option>
              {availableClasses.map((kelas) => (
                <option key={kelas.id} value={kelas.id}>
                  {kelas.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-buttons">
            <button type="button" className="btn-batal" onClick={onClose}>
              Batal
            </button>
            <button type="submit" className="btn-submit">
              {editData ? "Simpan" : "Tambah"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Tambah;