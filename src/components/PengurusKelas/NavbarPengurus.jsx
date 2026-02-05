import React from 'react';
import Navbar from '../Common/Navbar';

function NavbarPengurus() {
  const links = [
    { to: "/pengurus-kelas/dashboard", label: "Beranda" },
    { to: "/pengurus-kelas/riwayat", label: "Riwayat Kehadiran" },
    { to: "/pengurus-kelas/presensi", label: "Presensi" },
  ];

  return (
    <Navbar links={links} />
  );
}

export default NavbarPengurus;