import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useResortStatus } from '../hooks/useResortStatus';
import { MdChair, MdTerrain } from 'react-icons/md';

const ResortItemsList = ({ onSelect }) => {
    const { config } = useConfig();
    const { statusData } = useResortStatus();
    const [activeTab, setActiveTab] = useState('lifts'); // 'lifts' or 'slopes'
    const [selectedId, setSelectedId] = useState(null);

    if (!config) return null;

    // Helper to get status color
    const getStatusColor = (status) => {
        return status === 'open' ? '#4ade80' : '#f87171';
    };

    // Helper to get status of an item
    const getItemStatus = (id, defaultStatus) => {
        if (statusData.detailedStatus && statusData.detailedStatus[id]) {
            return statusData.detailedStatus[id];
        }
        return defaultStatus;
    };

    const lifts = config.lifts || [];
    const trails = config.trails || [];
    const activeItems = activeTab === 'lifts' ? lifts : trails;

    const handleItemClick = (item) => {
        setSelectedId(item.id);
        if (onSelect) {
            onSelect(item, activeTab);
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(15, 23, 42, 0.85)',
            borderTop: '1px solid rgba(255,255,255,0.1)'
        }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                    onClick={() => setActiveTab('lifts')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: activeTab === 'lifts' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        color: activeTab === 'lifts' ? '#fff' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        fontSize: '0.9rem',
                        fontWeight: activeTab === 'lifts' ? 'bold' : 'normal'
                    }}
                >
                    <MdChair /> Lifts
                </button>
                <button
                    onClick={() => setActiveTab('slopes')}
                    style={{
                        flex: 1,
                        padding: '10px',
                        background: activeTab === 'slopes' ? 'rgba(255,255,255,0.1)' : 'transparent',
                        border: 'none',
                        color: activeTab === 'slopes' ? '#fff' : 'rgba(255,255,255,0.5)',
                        cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                        fontSize: '0.9rem',
                        fontWeight: activeTab === 'slopes' ? 'bold' : 'normal'
                    }}
                >
                    <MdTerrain /> Slopes
                </button>
            </div>

            {/* Horizontal Scroll Area */}
            <div style={{
                overflowX: 'auto',
                padding: '12px',
                display: 'flex',
                gap: '10px',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
            }}
                className="mobile-scroll-container">
                <style>{`
                    .mobile-scroll-container::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
                {activeItems.map(item => {
                    const status = getItemStatus(item.id, item.status);
                    const isSelected = selectedId === item.id;
                    const color = getStatusColor(status);

                    return (
                        <div key={item.id}
                            onClick={() => handleItemClick(item)}
                            style={{
                                minWidth: '140px',
                                maxWidth: '140px',
                                background: isSelected ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255,255,255,0.05)',
                                border: isSelected ? '1px solid rgba(250, 204, 21, 0.5)' : '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                padding: '10px',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                cursor: 'pointer',
                                flexShrink: 0
                            }}>

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{
                                    width: '8px',
                                    height: '8px',
                                    borderRadius: '50%',
                                    background: color,
                                    boxShadow: `0 0 5px ${color}`
                                }} />
                                {item.difficulty && (
                                    <div style={{
                                        width: '12px', height: '12px', borderRadius: '2px',
                                        background: item.difficulty.toLowerCase(),
                                        border: item.difficulty.toLowerCase() === 'white' ? '1px solid #ccc' : 'none'
                                    }} />
                                )}
                                {item.type && (
                                    <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>{item.type}</span>
                                )}
                            </div>

                            <div style={{ fontWeight: '500', fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {item.name}
                            </div>

                            <div style={{ fontSize: '0.75rem', opacity: 0.7, textTransform: 'capitalize' }}>
                                {status}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ResortItemsList;
