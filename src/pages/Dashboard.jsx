import React from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';
import StatusControl from '../components/StatusControl';
import ProfileCard from '../components/ProfileCard';
import ResortStatusCard from '../components/ResortStatusCard';
import MapWithStatus from '../components/MapWithStatus';
import Schedule from '../components/Schedule';
import { useTripMembers } from '../hooks/useTripMembers';
import { useWakeLock } from '../hooks/useWakeLock';
import { FaBatteryFull, FaRegEye } from 'react-icons/fa';

const Dashboard = () => {
    const { config } = useConfig();
    const { userStatus } = useAuth(); // Get live status
    const { members } = useTripMembers();
    const { isSupported, active: isWakeLockActive, toggleWakeLock } = useWakeLock();

    if (!config) return null;

    // Helper to get name from ID (Reusable for user and friends)
    const getStatusDisplay = (statusObj) => {
        const { lift, trail, location } = statusObj;
        if (lift) {
            const l = config.lifts.find(i => i.id === lift);
            return {
                location: l ? l.name : lift,
                activity: 'Taking Lift',
                color: '#4ade80'
            };
        }
        if (trail) {
            const t = config.trails.find(i => i.id === trail);
            return {
                location: t ? t.name : trail,
                activity: 'Skiing Down',
                color: '#38bdf8'
            };
        }
        // Default
        let displayLoc = location || config.hotel?.name || 'Resort';
        if (typeof displayLoc === 'object') {
            displayLoc = "On Mountain";
        }

        return {
            location: displayLoc,
            activity: 'Relaxing',
            color: '#94a3b8'
        };
    };

    const currentStatus = getStatusDisplay(userStatus);
    const friends = members || []; // Use real members

    return (
        <div className="dashboard">
            <ProfileCard />

            {/* iOS Web Ski Mode Toggle */}
            {isSupported && (
                <button
                    onClick={toggleWakeLock}
                    className="glass-panel"
                    style={{
                        width: '100%',
                        padding: '12px',
                        marginBottom: '15px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '10px',
                        background: isWakeLockActive ? 'rgba(34, 197, 94, 0.2)' : 'rgba(255,255,255,0.05)',
                        border: isWakeLockActive ? '1px solid #22c55e' : '1px solid rgba(255,255,255,0.1)',
                        color: isWakeLockActive ? '#4ade80' : 'var(--color-text-muted)',
                        cursor: 'pointer'
                    }}
                >
                    {isWakeLockActive ? <FaRegEye /> : <FaBatteryFull />}
                    <span style={{ fontWeight: 'bold' }}>
                        {isWakeLockActive ? "Ski Mode Active (Screen On)" : "Enable Ski Mode"}
                    </span>
                </button>
            )}

            <h1 style={{ textAlign: 'center', marginBottom: '20px' }}>{config.resortName}</h1>

            {/* Real-time Status via Gemini */}
            <ResortStatusCard />

            <div className="glass-panel" style={{ padding: '15px', marginBottom: '15px', background: 'rgba(255,255,255,0.05)' }}>
                <h3 style={{ margin: '0 0 10px 0', color: 'var(--color-primary)' }}>Current Status</h3>

                {/* My Status */}
                <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '4px 0' }}>Location: <strong>{currentStatus.location}</strong></p>
                    <p style={{ margin: '4px 0' }}>Activity: <strong style={{ color: currentStatus.color }}>{currentStatus.activity}</strong></p>
                </div>

                {/* Friends Status */}
                {friends.length > 0 && (
                    <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '10px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.9rem', opacity: 0.8 }}>Friends</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {friends.map(friend => {
                                const friendStatus = getStatusDisplay(friend.status);
                                return (
                                    <div key={friend.id} style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        background: 'rgba(255,255,255,0.03)',
                                        padding: '8px',
                                        borderRadius: '6px'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '24px', height: '24px',
                                                borderRadius: '50%',
                                                background: 'var(--color-primary)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.7rem', fontWeight: 'bold'
                                            }}>
                                                {friend.name.charAt(0)}
                                            </div>
                                            <span style={{ fontSize: '0.9rem' }}>{friend.name}</span>
                                        </div>
                                        <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                                            <div style={{ opacity: 0.9 }}>{friendStatus.location}</div>
                                            <div style={{ fontSize: '0.7rem', color: friendStatus.color }}>{friendStatus.activity}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Manual Status Control */}
            <StatusControl />

            {/* Combined Map & Live Status */}
            <MapWithStatus />

            {/* Plan / Schedule Section */}
            <div style={{ marginTop: '20px' }}>
                <Schedule />
            </div>

        </div>
    );
};

export default Dashboard;
