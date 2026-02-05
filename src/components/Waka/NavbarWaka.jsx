import React from 'react';
import Navbar from '../Common/Navbar';

function NavbarWaka() {
  const links = [
    { to: "/waka/dashboard", label: "Beranda" },
    { to: "/waka/jadwal-siswa", label: "Jadwal Siswa" },
    { to: "/waka/jadwal-guru", label: "Jadwal Guru" },
    { to: "/waka/kehadiran-guru", label: "Kehadiran Guru" },
    { to: "/waka/kehadiran-siswa", label: "Kehadiran Siswa" },
  ];

  return (
    <Navbar links={links} />
  );
}

export default NavbarWaka;