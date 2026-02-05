import React from 'react';
import Navbar from '../Common/Navbar';

function NavbarWakel() {
  const links = [
    { to: "/walikelas/dashboard", label: "Beranda" },
    { to: "/walikelas/datasiswa", label: "Data Siswa" },
    { to: "/walikelas/riwayatkehadiran", label: "Riwayat Kehadiran" },
    { to: "/walikelas/jadwalwakel", label: "Jadwal" },
  ];

  return (
    <Navbar links={links} />
  );
}

export default NavbarWakel;