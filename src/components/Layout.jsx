import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { FaMountain, FaList, FaRegCalendarAlt, FaMapMarkedAlt } from 'react-icons/fa';
import SOSButton from './SOSButton';

const Layout = () => {
    const location = useLocation();
    const isMapPage = location.pathname === '/map';

    const navItems = [
        { path: '/', icon: <FaMountain />, label: 'Dashboard' },
        { path: '/map', icon: <FaMapMarkedAlt />, label: 'Map' },
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
                    minHeight: isMapPage ? 0 : '80vh',
                    overflow: 'hidden'
                }}>
                    <Outlet />
                </div>
            </main>

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
