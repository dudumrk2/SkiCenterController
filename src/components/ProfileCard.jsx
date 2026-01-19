import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useConfig } from '../contexts/ConfigContext';
import { FaSignOutAlt, FaCog, FaShareAlt, FaEdit, FaTrash, FaTimes, FaSave, FaDoorOpen } from 'react-icons/fa';

const ProfileCard = () => {
    const { currentUser, logout } = useAuth();
    const { resetConfig, tripId, isAdmin, config, updateTripConfig, deleteTrip } = useConfig();

    // UI State
    const [showSettings, setShowSettings] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editJson, setEditJson] = useState('');

    if (!currentUser) return null;

    const handleOpenSettings = () => {
        setShowSettings(true);
        setIsEditing(false);
    };

    const startEditing = () => {
        setEditJson(JSON.stringify(config, null, 2));
        setIsEditing(true);
    };

    const saveEdits = async () => {
        try {
            const newConfig = JSON.parse(editJson);
            await updateTripConfig(newConfig);
            setIsEditing(false);
            setShowSettings(false);
            alert("Configuration updated for all users!");
        } catch (e) {
            alert("Invalid JSON");
        }
    };

    return (
        <>
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
                        <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                            {isAdmin ? <span style={{ color: '#fcd34d' }}>Admin (Owner)</span> : "Ready to Ski"}
                        </div>
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
                        onClick={handleOpenSettings}
                        className="glass-btn"
                        style={{ padding: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem' }}
                        title="Trip Settings"
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

            {/* SETTINGS MODAL */}
            {showSettings && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    zIndex: 10000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', background: '#1e293b', padding: '0', overflow: 'hidden' }}>

                        {/* Header */}
                        <div style={{ padding: '15px 20px', background: 'rgba(0,0,0,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, color: 'white' }}>{isEditing ? "Edit Configuration" : "Trip Settings"}</h3>
                            <button onClick={() => setShowSettings(false)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '1.2rem' }}>
                                <FaTimes />
                            </button>
                        </div>

                        <div style={{ padding: '20px' }}>

                            {!isEditing ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                                    {/* Everyone can leave */}
                                    <button
                                        onClick={() => { if (window.confirm("Leave this trip?")) { resetConfig(); } }}
                                        className="glass-btn"
                                        style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', justifyContent: 'flex-start' }}
                                    >
                                        <div style={{ background: '#3b82f6', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaDoorOpen color="white" /></div>
                                        <div style={{ textAlign: 'left' }}>
                                            <div style={{ fontWeight: 'bold' }}>Leave Trip</div>
                                            <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Disconnect your device only</div>
                                        </div>
                                    </button>

                                    {/* Admin Only Actions */}
                                    {isAdmin && (
                                        <>
                                            <div style={{ height: '1px', background: 'rgba(255,255,255,0.1)', margin: '5px 0' }}></div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', textTransform: 'uppercase' }}>Admin Zone</div>

                                            <button
                                                onClick={startEditing}
                                                className="glass-btn"
                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', justifyContent: 'flex-start' }}
                                            >
                                                <div style={{ background: '#f59e0b', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaEdit color="white" /></div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontWeight: 'bold' }}>Edit Configuration</div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Update resort info for everyone</div>
                                                </div>
                                            </button>

                                            <button
                                                onClick={deleteTrip}
                                                className="glass-btn"
                                                style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '15px', justifyContent: 'flex-start', border: '1px solid rgba(239, 68, 68, 0.3)' }}
                                            >
                                                <div style={{ background: '#ef4444', width: '30px', height: '30px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTrash color="white" /></div>
                                                <div style={{ textAlign: 'left' }}>
                                                    <div style={{ fontWeight: 'bold', color: '#ef4444' }}>Delete Trip</div>
                                                    <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>Kick everyone out & destroy data</div>
                                                </div>
                                            </button>
                                        </>
                                    )}
                                </div>
                            ) : (
                                /* EDIT MODE */
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                    <textarea
                                        value={editJson}
                                        onChange={(e) => setEditJson(e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '300px',
                                            padding: '10px',
                                            background: 'rgba(0,0,0,0.3)',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            color: '#e2e8f0',
                                            fontFamily: 'monospace',
                                            fontSize: '0.85rem',
                                            borderRadius: '6px'
                                        }}
                                    />
                                    <div style={{ display: 'flex', gap: '10px' }}>
                                        <button
                                            onClick={() => setIsEditing(false)}
                                            className="glass-btn"
                                            style={{ flex: 1, padding: '12px' }}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={saveEdits}
                                            className="glass-btn"
                                            style={{ flex: 1, padding: '12px', background: '#22c55e', color: 'white', fontWeight: 'bold' }}
                                        >
                                            <FaSave style={{ marginBottom: '-2px', marginRight: '5px' }} /> Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProfileCard;
