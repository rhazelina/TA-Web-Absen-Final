import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import './Navbar.css';
import logo from '../../assets/logo.png';
import CustomAlert from './CustomAlert';

function Navbar({ links = [], showLogout = false, userName = '', userRole = '' }) {
    const navigate = useNavigate();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [alertState, setAlertState] = useState({
        show: false,
        type: 'confirm',
        title: '',
        message: ''
    });
    const [userInfo, setUserInfo] = useState({ name: '', role: '' });
    const menuRef = useRef(null);
    const hamburgerRef = useRef(null);

    // Get user info from localStorage or props
    useEffect(() => {
        if (userName && userRole) {
            setUserInfo({ name: userName, role: userRole });
        } else {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUserInfo({
                        name: userData.nama || userData.name || 'User',
                        role: userData.role || userData.jabatan || ''
                    });
                } catch (error) {
                    console.error('Error parsing user data:', error);
                }
            }
        }
    }, [userName, userRole]);

    // Prevent body scroll when menu is open on mobile
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    // Handle keyboard navigation (Escape key to close menu)
    useEffect(() => {
        const handleEscapeKey = (event) => {
            if (event.key === 'Escape' && isMenuOpen) {
                setIsMenuOpen(false);
                // Return focus to hamburger button
                if (hamburgerRef.current) {
                    hamburgerRef.current.focus();
                }
            }
        };

        document.addEventListener('keydown', handleEscapeKey);
        return () => {
            document.removeEventListener('keydown', handleEscapeKey);
        };
    }, [isMenuOpen]);

    // Focus management when menu opens
    useEffect(() => {
        if (isMenuOpen && menuRef.current) {
            // Focus first link when menu opens
            const firstLink = menuRef.current.querySelector('a');
            if (firstLink) {
                setTimeout(() => firstLink.focus(), 100);
            }
        }
    }, [isMenuOpen]);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const closeMenu = () => {
        setIsMenuOpen(false);
    };

    const handleLogoutClick = () => {
        setAlertState({
            show: true,
            type: 'confirm',
            title: 'Konfirmasi Keluar',
            message: 'Apakah Anda yakin ingin keluar dari aplikasi?'
        });
        closeMenu();
    };

    const handleConfirmLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        sessionStorage.clear();
        navigate('/login');
    };

    const closeAlert = () => {
        setAlertState(prev => ({ ...prev, show: false }));
    };

    const handleLinkClick = () => {
        closeMenu();
    };

    const handleOverlayClick = () => {
        closeMenu();
        // Return focus to hamburger button
        if (hamburgerRef.current) {
            hamburgerRef.current.focus();
        }
    };

    return (
        <>
            <nav className="navbar" role="navigation" aria-label="Main navigation">
                <div className="nav-container">
                    <div className="nav-left">
                        <img src={logo} alt="Logo SMK" className="logo" />
                        <span className="school-name">SMKN 2 SINGOSARI</span>
                    </div>

                    <button
                        ref={hamburgerRef}
                        className={`hamburger-menu ${isMenuOpen ? 'active' : ''}`}
                        onClick={toggleMenu}
                        aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
                        aria-expanded={isMenuOpen}
                        aria-controls="main-menu"
                    >
                        <span className="bar"></span>
                        <span className="bar"></span>
                        <span className="bar"></span>
                    </button>

                    <div
                        ref={menuRef}
                        id="main-menu"
                        className={`nav-right ${isMenuOpen ? 'active' : ''}`}
                        role="menu"
                    >
                        {/* User Profile Section - Mobile Only */}
                        {userInfo.name && (
                            <div className="nav-user-profile">
                                <div className="nav-user-avatar">
                                    <FaUser />
                                </div>
                                <div className="nav-user-info">
                                    <p className="nav-user-name">{userInfo.name}</p>
                                    {userInfo.role && <p className="nav-user-role">{userInfo.role}</p>}
                                </div>
                            </div>
                        )}

                        <div className="nav-links">
                            {links.map((link, index) => (
                                <NavLink
                                    key={index}
                                    to={link.to}
                                    className={({ isActive }) => isActive ? "active" : ""}
                                    onClick={handleLinkClick}
                                    role="menuitem"
                                    tabIndex={isMenuOpen ? 0 : -1}
                                >
                                    {link.label}
                                </NavLink>
                            ))}
                        </div>

                        {showLogout && (
                            <button
                                onClick={handleLogoutClick}
                                className="btn-logout"
                                role="menuitem"
                                tabIndex={isMenuOpen ? 0 : -1}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" />
                                </svg>
                                <span>Keluar</span>
                            </button>
                        )}
                    </div>
                </div>
            </nav>

            {isMenuOpen && (
                <div
                    className="nav-overlay"
                    onClick={handleOverlayClick}
                    role="presentation"
                    aria-hidden="true"
                ></div>
            )}

            <CustomAlert
                isOpen={alertState.show}
                onClose={closeAlert}
                title={alertState.title}
                message={alertState.message}
                type={alertState.type}
                onConfirm={handleConfirmLogout}
                confirmLabel="Ya, Keluar"
                cancelLabel="Kembali"
            />
        </>
    );
}

export default Navbar;