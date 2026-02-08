import React, { useState, useEffect } from 'react';
import NavbarPengurus from '../../components/PengurusKelas/NavbarPengurus'; // Adjust path if needed
import { getClassAttendanceByDate } from '../../services/attendance';
import apiClient from '../../services/api'; // To get user info
import './RiwayatKelas.css';

const RiwayatKelas = () => {
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [classId, setClassId] = useState(null);
  const [className, setClassName] = useState('');

  // 1. Get User/Class Info
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get('me');
        const user = response.data;
        // Assume student user has class_id
        if (user.class_id) {
          setClassId(user.class_id);
          setClassName(user.class_name || 'Kelas Saya');
        } else if (user.student_profile?.class_id) {
          setClassId(user.student_profile.class_id);
          setClassName(user.class_name || 'Kelas Saya');
        }
      } catch (e) {
        console.error("Failed to get user info", e);
      }
    };
    fetchUserInfo();
  }, []);

  // 2. Fetch Attendance
  useEffect(() => {
    if (!classId) return;

    const fetchAttendance = async () => {
      setLoading(true);
      try {
        const response = await getClassAttendanceByDate(classId, selectedDate);
        // Assuming response is array of records or wrapped in data
        const records = Array.isArray(response) ? response : (response.data || []);
        setAttendanceRecords(records);
      } catch (e) {
        console.error("Failed to fetch class attendance", e);
        setAttendanceRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, [classId, selectedDate]);

  // Statistics
  const stats = {
    Hadir: attendanceRecords.filter(r => r.status === 'present').length,
    Sakit: attendanceRecords.filter(r => r.status === 'sick').length,
    Izin: attendanceRecords.filter(r => r.status === 'excused' || r.status === 'izin').length,
    Alpha: attendanceRecords.filter(r => r.status === 'absent').length,
    Terlambat: attendanceRecords.filter(r => r.status === 'late').length
  };

  return (
    <div className="riwayat-kelas-page">
      <NavbarPengurus />
      <div className="page-header">
        <div className="header-content">
          <h1>Riwayat Kehadiran Kelas</h1>
          <p className="subtitle">{className}</p>
        </div>
      </div>

      <div className="page-content">
        <div className="filters-section">
          <div className="date-filter">
            <label>Pilih Tanggal:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="pengurus-stats-wrapper">
            <div className="pengurus-stats-grid">
              <div className="pengurus-stat-box box-hadir">
                <div className="pengurus-stat-title">Hadir</div>
                <div className="pengurus-stat-number">{stats.Hadir}</div>
              </div>
              <div className="pengurus-stat-box box-sakit">
                <div className="pengurus-stat-title">Sakit</div>
                <div className="pengurus-stat-number">{stats.Sakit}</div>
              </div>
              <div className="pengurus-stat-box box-izin">
                <div className="pengurus-stat-title">Izin</div>
                <div className="pengurus-stat-number">{stats.Izin}</div>
              </div>
              <div className="pengurus-stat-box box-alpha">
                <div className="pengurus-stat-title">Alpha</div>
                <div className="pengurus-stat-number">{stats.Alpha}</div>
              </div>
              <div className="pengurus-stat-box box-terlambat">
                <div className="pengurus-stat-title">Terlambat</div>
                <div className="pengurus-stat-number">{stats.Terlambat}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="table-container">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Nama Siswa</th>
                <th>Mata Pelajaran</th>
                <th>Waktu</th>
                <th>Status</th>
                <th>Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center">Memuat data...</td></tr>
              ) : attendanceRecords.length > 0 ? (
                attendanceRecords.map((record, index) => (
                  <tr key={index}>
                    <td>{index + 1}</td>
                    <td>{record.student_name || record.user?.name}</td>
                    <td>{record.subject_name || record.schedule?.subject?.name || '-'}</td>
                    <td>{record.check_in_time || '-'}</td>
                    <td>
                      <span className={`status-badge ${record.status}`}>
                        {record.status === 'present' ? 'Hadir' :
                          record.status === 'sick' ? 'Sakit' :
                            record.status === 'excused' ? 'Izin' :
                              record.status === 'late' ? 'Terlambat' :
                                record.status === 'absent' ? 'Alpha' : record.status}
                      </span>
                    </td>
                    <td>{record.reason || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6" className="text-center">Tidak ada data kehadiran pada tanggal ini.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiwayatKelas;