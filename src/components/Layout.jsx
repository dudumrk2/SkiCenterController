import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FaMountain, FaList, FaRegCalendarAlt, FaMapMarkedAlt, FaHistory, FaExclamationTriangle } from 'react-icons/fa';
import SOSButton from './SOSButton';
import { useTripMembers } from '../hooks/useTripMembers';

const Layout = () => {
    const location = useLocation();
    const isMapPage = location.pathname === '/map';

    // Global SOS Monitoring
    const { members } = useTripMembers();
    const [sosAlert, setSosAlert] = useState(null);

    useEffect(() => {
        const sosMember = members.find(m => m.isSOS);
        if (sosMember) {
            setSosAlert(sosMember);
            if (navigator.vibrate) navigator.vibrate([500, 200, 500, 200, 500]);
        } else {
            setSosAlert(null);
        }
    }, [members]);

    const navItems = [
        { path: '/', icon: <FaMountain />, label: 'Dashboard' },
        { path: '/map', icon: <FaMapMarkedAlt />, label: 'Map' },
        { path: '/history', icon: <FaHistory />, label: 'History' },
    ];

    return (
        <div className="layout-container">
            {/* Main Content Area */}
            <main style={{
                padding: isMapPage ? 0 : '20px',
                paddingBottom: '100px',
                maxWidth: isMapPage ? '100%' : '800px',
                margin: '0 auto',
                height: isMapPage ? '100vh' : 'auto',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <div className={isMapPage ? '' : "glass-panel"} style={{
                    flex: 1,
                    padding: isMapPage ? 0 : '20px',
                    borderRadius: isMapPage ? 0 : undefined,
                    minHeight: isMapPage ? '100%' : 'auto',
                    overflowY: isMapPage ? 'hidden' : 'auto', // Allow scroll on dashboard
                    overflowX: 'hidden'
                }}>
                    <Outlet />
                </div>
            </main>

            {/* SHARED SOS OVERLAY */}
            {sosAlert && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(220, 38, 38, 0.95)', // Intense Red
                    zIndex: 9999,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    color: 'white', animation: 'flash 2s infinite'
                }}>
                    <FaExclamationTriangle size={80} />
                    <h1 style={{ fontSize: '3rem', margin: '20px 0', fontWeight: '900' }}>SOS ALERT</h1>
                    <div style={{ fontSize: '1.5rem', textAlign: 'center' }}>
                        <strong>{sosAlert.name}</strong><br />
                        needs help immediately!
                    </div>
                    <button
                        onClick={() => setSosAlert(null)}
                        style={{
                            marginTop: '40px', padding: '15px 30px',
                            background: 'white', color: 'red',
                            border: 'none', borderRadius: '50px',
                            fontWeight: 'bold', fontSize: '1.2rem'
                        }}
                    >
                        ACKNOWLEDGE
                    </button>
                    <style>{`
                        @keyframes flash {
                            0% { background-color: rgba(220, 38, 38, 0.95); }
                            50% { background-color: rgba(153, 27, 27, 0.95); }
                            100% { background-color: rgba(220, 38, 38, 0.95); }
                        }
                    `}</style>
                </div>
            )}

            {/* Floating Bottom Navigation */}
            <nav className="glass-panel" style={{
                position: 'fixed',
                bottom: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                width: '90%',
                maxWidth: '500px',
                display: 'flex',
                justifyContent: 'space-around',
                padding: '10px 0',
                zIndex: 1000,
                background: 'rgba(15, 23, 42, 0.85)' // Darker background for visibility
            }}>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        style={({ isActive }) => ({
                            color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            fontSize: '0.8rem',
                            gap: '4px'
                        })}
                    >
                        <span style={{ fontSize: '1.4rem' }}>{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                {/* SOS Button Integration */}
                <SOSButton />
            </nav>
        </div>
    );
};

export default Layout;
