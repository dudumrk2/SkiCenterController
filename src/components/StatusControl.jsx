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
                                <span>{lift.name}</span>
                                {isClosed && <span style={{ fontSize: '0.6rem', color: '#fca5a5', fontWeight: 'bold' }}>CLOSED</span>}
                            </div>
                            <span style={{ opacity: 0.6, fontSize: '0.7rem' }}>({lift.type})</span>
                        </button>
                    );
                })}

                {activeTab === 'run' && config.trails?.map(trail => {
                    const isSelected = trail.id === selectedId;
                    return (
                        <button
                            key={trail.id}
                            className="glass-btn"
                            style={{
                                fontSize: '0.8rem',
                                textAlign: 'left',
                                borderLeft: `4px solid ${getTrailColor(trail.difficulty)}`,
                                background: isSelected ? '#22c55e' : 'rgba(255,255,255,0.05)',
                                outline: isSelected ? '1px solid #4ade80' : 'none'
                            }}
                            onClick={() => handleSelect(trail, 'run')}
                        >
                            {trail.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

// Helper for Trail Colors
const getTrailColor = (difficulty) => {
    const norm = difficulty.toLowerCase();
    if (norm.includes('black')) return 'black';
    if (norm.includes('red')) return '#f43f5e';
    if (norm.includes('blue')) return '#38bdf8';
    return 'white';
};

export default StatusControl;
