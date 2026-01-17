import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { FaSignOutAlt, FaCog, FaShareAlt } from 'react-icons/fa';

const ProfileCard = () => {
    const { currentUser, logout } = useAuth();
    const { resetConfig, tripId } = useConfig();

    if (!currentUser) return null;

    return (
        <div className="glass-panel" style={{
            padding: '15px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(56, 189, 248, 0.1)' // Primary tint
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {currentUser.photoURL ? (
                    <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        style={{ width: '40px', height: '40px', borderRadius: '50%', border: '2px solid white' }}
                    />
                ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                        {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                )}
                <div>
                    <div style={{ fontWeight: 'bold' }}>{currentUser.displayName}</div>
                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Ready to Ski</div>
                </div>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
                {tripId && (
                    <button
                        onClick={() => {
                            const link = `${window.location.origin}/?tripId=${tripId}`;
                            navigator.clipboard.writeText(link);
                            alert("Trip Link Copied! Share it with friends.");
                        }}
                        className="glass-btn"
                        style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8' }}
                        title="Share Trip Link"
                    >
                        <FaShareAlt />
                    </button>
                )}
                <button
                    onClick={resetConfig}
                    className="glass-btn"
                    style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                    title="Change Trip Config"
                >
                    <FaCog />
                </button>
                <button
                    onClick={logout}
                    className="glass-btn"
                    style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                    title="Logout"
                >
                    <FaSignOutAlt />
                </button>
            </div>
        </div>
    );
};

export default ProfileCard;
