import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';
import { FaSkiing, FaTram } from 'react-icons/fa';

const StatusControl = () => {
    const { config } = useConfig();
    const { updateUserStatus } = useAuth();
    const [activeTab, setActiveTab] = useState('lift'); // 'lift' or 'run'

    const [selectedId, setSelectedId] = useState(null);

    if (!config) return null;

    const handleSelect = (item, type) => {
        setSelectedId(item.id); // Track selection
        // Determine status text based on selection
        const statusText = type === 'lift' ? `On ${item.name}` : `Skiing ${item.name}`;
        updateUserStatus('active', null, type === 'lift' ? item.id : null, type === 'run' ? item.id : null);
        // alert(`Status Updated: ${statusText}`); // Removed alert for smoother UI
    };

    return (
        <div className="glass-panel" style={{ padding: '15px', marginBottom: '20px', background: 'rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>Update Status</h3>

            <div style={{ display: 'flex', marginBottom: '10px', gap: '10px' }}>
                <button
                    className={`glass-btn`}
                    style={{ flex: 1, background: activeTab === 'lift' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)' }}
                    onClick={() => setActiveTab('lift')}
                >
                    <FaTram /> Lifts
                </button>
                <button
                    className={`glass-btn`}
                    style={{ flex: 1, background: activeTab === 'run' ? 'var(--color-primary)' : 'rgba(255,255,255,0.1)' }}
                    onClick={() => setActiveTab('run')}
                >
                    <FaSkiing /> Runs
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                {activeTab === 'lift' && config.lifts?.map(lift => {
                    const isSelected = lift.id === selectedId;
                    const isClosed = lift.status === 'closed';

                    return (
                        <button
                            key={lift.id}
                            className="glass-btn"
                            style={{
                                fontSize: '0.8rem',
                                textAlign: 'left',
                                background: isSelected
                                    ? '#22c55e' // Green for selected (Active)
                                    : isClosed
                                        ? 'rgba(239, 68, 68, 0.2)' // Red background for closed
                                        : 'rgba(255,255,255,0.05)',
                                border: isSelected
                                    ? '1px solid #4ade80'
                                    : isClosed
                                        ? '1px solid rgba(239, 68, 68, 0.5)' // Red border for closed
                                        : 'none',
                                opacity: isClosed ? 0.8 : 1
                            }}
                            onClick={() => !isClosed && handleSelect(lift, 'lift')} // Prevent selection if closed
                            disabled={isClosed}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span>{lift.name}</span>
                                    {lift.serves && lift.serves.length > 0 && (
                                        <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>
                                            → {lift.serves.join(', ')}
                                        </span>
                                    )}
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                    {isClosed && <span style={{ fontSize: '0.6rem', color: '#fca5a5', fontWeight: 'bold' }}>CLOSED</span>}
                                    <div style={{ opacity: 0.6, fontSize: '0.65rem' }}>{lift.type}</div>
                                </div>
                            </div>
                        </button>
                    );
                })}

                {activeTab === 'run' && config.trails?.map(trail => {
                    const isSelected = trail.id === selectedId;
                    const colors = getTrailColor(trail.difficulty);

                    return (
                        <button
                            key={trail.id}
                            className="glass-btn"
                            style={{
                                fontSize: '0.8rem',
                                color: 'white',
                                textAlign: 'left',
                                background: isSelected
                                    ? '#22c55e'
                                    : colors.bg,
                                border: isSelected
                                    ? '1px solid #4ade80'
                                    : colors.border,
                                fontWeight: 'bold',
                                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
                            }}
                            onClick={() => handleSelect(trail, 'run')}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <span>{trail.name}</span>
                                {trail.status === 'closed' && <span style={{ fontSize: '0.6em', background: 'rgba(0,0,0,0.5)', padding: '2px 4px', borderRadius: '4px' }}>CLOSED</span>}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Helper for Trail Colors (Returns accessible background colors)
const getTrailColor = (difficulty) => {
    const norm = difficulty ? difficulty.toLowerCase() : 'green';

    if (norm.includes('black')) return { bg: 'rgba(30, 41, 59, 0.9)', border: '1px solid #94a3b8' }; // Dark Slate
    if (norm.includes('red')) return { bg: 'rgba(239, 68, 68, 0.65)', border: '1px solid #fca5a5' }; // Red
    if (norm.includes('blue')) return { bg: 'rgba(59, 130, 246, 0.65)', border: '1px solid #93c5fd' }; // Blue
    // Default Green/Easy
    return { bg: 'rgba(34, 197, 94, 0.65)', border: '1px solid #86efac' };
};

export default StatusControl;
