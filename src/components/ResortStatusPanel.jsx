import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { FaSkiing, FaTram } from 'react-icons/fa';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

const ResortStatusPanel = () => {
    const { config } = useConfig();
    const [activeTab, setActiveTab] = useState('slopes'); // 'slopes' | 'lifts'
    const [liveStatus, setLiveStatus] = useState({}); // Map of id -> 'open'|'closed'

    useEffect(() => {
        const docRef = doc(db, 'artifacts', 'pila-ski-2025', 'public', 'resortStatus');
        const unsubscribe = onSnapshot(docRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (data.detailedStatus) {
                    setLiveStatus(data.detailedStatus);
                }
            }
        });
        return () => unsubscribe();
    }, []);

    if (!config) return null;

    // Helper to get effective status
    const getStatus = (item) => liveStatus[item.id] || item.status;

    return (
        <div className="glass-panel" style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '250px',
            maxHeight: '400px',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            padding: 0,
            background: 'rgba(30, 41, 59, 0.95)' // Darker, closer to ref image
        }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={() => setActiveTab('slopes')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: activeTab === 'slopes' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: activeTab === 'slopes' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                    }}
                >
                    SLOPES
                </button>
                <button
                    onClick={() => setActiveTab('lifts')}
                    style={{
                        flex: 1,
                        padding: '12px',
                        background: activeTab === 'lifts' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        color: activeTab === 'lifts' ? 'var(--color-primary)' : 'var(--color-text-muted)',
                        border: 'none',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                        fontSize: '0.9rem'
                    }}
                >
                    LIFTS
                </button>
            </div>

            {/* List Content */}
            <div style={{ padding: '10px', overflowY: 'auto', flex: 1 }}>
                {activeTab === 'slopes' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {config.trails?.map(trail => {
                            const status = getStatus(trail);
                            const isClosed = status === 'closed';
                            return (
                                <div key={trail.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '0.85rem',
                                    color: isClosed ? '#fca5a5' : 'white', // Light red for text
                                    opacity: isClosed ? 0.8 : 1
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        {/* Difficulty Icon/Bar */}
                                        <div style={{
                                            width: '4px',
                                            height: '14px',
                                            borderRadius: '2px',
                                            background: getDifficultyColor(trail.difficulty)
                                        }} />
                                        <span>{trail.name}</span>
                                    </div>
                                    <StatusDot status={status} />
                                </div>
                            );
                        })}
                    </div>
                )}

                {activeTab === 'lifts' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {config.lifts?.map(lift => {
                            const status = getStatus(lift);
                            const isClosed = status === 'closed';
                            return (
                                <div key={lift.id} style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    fontSize: '0.85rem',
                                    color: isClosed ? '#fca5a5' : 'white', // Light red for text
                                    opacity: isClosed ? 0.8 : 1
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <FaTram size={10} style={{ opacity: 0.7 }} />
                                        <span>{lift.name}</span>
                                    </div>
                                    <StatusDot status={status} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

// Sub-components
const StatusDot = ({ status }) => (
    <div style={{
        width: '10px',
        height: '10px',
        borderRadius: '50%',
        background: status === 'open' ? '#22c55e' : '#ef4444', // Green vs Red
        boxShadow: status === 'open' ? '0 0 5px #22c55e' : 'none'
    }} title={status} />
);

const getDifficultyColor = (diff) => {
    const d = diff.toLowerCase();
    if (d.includes('black')) return 'black';
    if (d.includes('red')) return '#ec3c3c'; // Pila Red
    if (d.includes('blue')) return '#3b82f6';
    return '#fff';
};

export default ResortStatusPanel;
