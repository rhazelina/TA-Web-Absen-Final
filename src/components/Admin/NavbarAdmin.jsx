import React from 'react';
import Navbar from '../Common/Navbar';

function NavbarAdmin() {
  const links = [
    { to: "/admin/dashboard", label: "Beranda" },
    { to: "/admin/siswa", label: "Data Siswa" },
    { to: "/admin/guru", label: "Data Guru" },
    { to: "/admin/kelas", label: "Data Kelas" },
    { to: "/admin/jurusan", label: "Data Konsentrasi Keahlian" },
  ];

  return (
    <Navbar links={links} showLogout={true} />
  );
}

export default NavbarAdmin;