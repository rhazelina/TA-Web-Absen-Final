import React from 'react';
import Navbar from '../Common/Navbar';

function NavbarSiswa() {
  const links = [
    { to: "/siswa/dashboard", label: "Beranda" },
    { to: "/siswa/riwayat", label: "Riwayat Kehadiran" },
  ];

  return (
    <Navbar links={links} showLogout={true} />
  );
}

export default NavbarSiswa;