import React, { useState } from 'react';
import { createPortal } from 'react-dom'; // Import Portal
import { FaBiohazard, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';

const SOSButton = () => {
    const { updateUserStatus } = useAuth();
    const { config } = useConfig();
    const [showConfirm, setShowConfirm] = useState(false);
    const [active, setActive] = useState(false);

    const handleSOS = () => {
        // In real app, get current location immediately
        updateUserStatus('SOS', null); // Status 'SOS'
        setActive(true);
        setShowConfirm(false);
        alert(`SOS SIGNAL SENT! \nCalling Resort Rescue: ${config?.emergency?.resortRescue}`);
        // window.location.href = `tel:${config?.emergency?.resortRescue}`;
    };

    return (
        <>
            <button
                onClick={() => setShowConfirm(true)}
                style={{
                    background: active ? 'var(--color-accent)' : 'transparent',
                    border: 'none',
                    color: active ? 'white' : 'var(--color-accent)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    fontSize: '0.8rem',
                    gap: '4px',
                    cursor: 'pointer',
                    animation: active ? 'pulse 1s infinite' : 'none'
                }}>
                <span style={{ fontSize: '1.4rem' }}><FaBiohazard /></span>
                <span>SOS</span>
            </button>

            {/* Confirmation Modal - PORTALED to Body */}
            {showConfirm && createPortal(
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.8)', zIndex: 9999, // High Z-Index
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="glass-panel" style={{ padding: '30px', maxWidth: '300px', textAlign: 'center', background: '#300', border: '2px solid var(--color-accent)' }}>
                        <FaExclamationTriangle size={50} color="var(--color-accent)" />
                        <h2 style={{ color: 'white', marginTop: '10px' }}>EMERGENCY?</h2>
                        <p style={{ color: '#ddd' }}>This will alert all group members and call rescue.</p>

                        <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
                            <button
                                onClick={handleSOS}
                                style={{
                                    background: 'var(--color-accent)', color: 'white', border: 'none',
                                    padding: '15px', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.2rem', cursor: 'pointer'
                                }}>
                                YES, I NEED HELP
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                style={{
                                    background: 'rgba(255,255,255,0.2)', color: 'white', border: 'none',
                                    padding: '10px', borderRadius: '8px', cursor: 'pointer'
                                }}>
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>,
                document.body // Target
            )}

            <style>{`
                @keyframes pulse {
                    0% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.1); opacity: 0.8; }
                    100% { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </>
    );
};

export default SOSButton;
