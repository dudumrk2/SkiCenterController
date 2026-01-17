import React, { useState } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { useResortStatus } from '../hooks/useResortStatus';
import { MdChair, MdTerrain, MdOpenInFull, MdCloseFullscreen, MdCable } from 'react-icons/md';
import ResortItemsList from './ResortItemsList';

const MapWithStatus = ({ isFullPage = false }) => {
    const { config } = useConfig();
    const { statusData } = useResortStatus();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('lifts'); // 'lifts' or 'slopes'
    const [selectedId, setSelectedId] = useState(null);

    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    React.useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!config?.mapImage) return null;

    // ... helpers ...

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

    // Helper to extract start coordinates from SVG path
    const getStartCoords = (pathMarkup) => {
        if (!pathMarkup) return null;
        const parts = pathMarkup.trim().split(/\s+/);
        // Expecting "M x y ..."
        if (parts[0] === 'M' && parts.length >= 3) {
            return { x: parseFloat(parts[1]), y: parseFloat(parts[2]) };
        }
        return null;
    };

    const lifts = config.lifts || [];
    const trails = config.trails || [];

    const handleItemClick = (id, type) => {
        setSelectedId(id);
        setActiveTab(type);
    };

    // Filter items based on active tab
    const activeItems = activeTab === 'lifts' ? lifts : trails;

    return (
        <div className="glass-panel" style={{
            padding: 0,
            overflow: 'hidden',
            position: 'relative',
            marginBottom: isFullPage ? 0 : '20px',
            height: isFullPage ? '100%' : (isMobile ? 'auto' : '600px'),
            display: 'flex',
            flexDirection: 'column',
            aspectRatio: isFullPage ? 'auto' : (isMobile ? '3/4' : 'auto')
        }}>

            {/* Map Container */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#0f172a', minHeight: isMobile ? '300px' : 'auto' }}>
                <img
                    src={config.mapImage}
                    alt="Ski Map"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'contain',
                        opacity: 0.9
                    }}
                />



                {/* Markers Layer (Main Interaction) */}
                <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}>
                    {/* Render Lifts */}
                    {lifts.map(item => {
                        if (!item.mapPath) return null;
                        const coords = getStartCoords(item.mapPath);
                        if (!coords) return null;

                        const status = getItemStatus(item.id, item.status);
                        const isSelected = selectedId === item.id;
                        const color = getStatusColor(status);

                        return (
                            <div
                                key={item.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick(item.id, 'lifts');
                                }}
                                style={{
                                    position: 'absolute',
                                    left: `${coords.x}%`,
                                    top: `${coords.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'pointer',
                                    pointerEvents: 'all',
                                    zIndex: isSelected ? 30 : 20,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <img
                                    src={item.type === 'Gondola' || item.type === 'Cable Car' ? '/assets/gondola-icon.png' : '/assets/chairlift-icon.png'}
                                    alt={item.name}
                                    style={{
                                        width: isSelected ? '44px' : '40px',
                                        height: isSelected ? '44px' : '40px',
                                        filter: isSelected ? `drop-shadow(0 0 5px ${color})` : 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                                        transition: 'all 0.3s ease'
                                    }}
                                />

                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '42px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        color: 'white',
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.85rem',
                                        border: `1px solid ${color}`,
                                        backdropFilter: 'blur(4px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                        zIndex: 40,
                                        display: 'flex', flexDirection: 'column', gap: '2px'
                                    }}>
                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', opacity: 0.9 }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }}></span>
                                            <span style={{ textTransform: 'capitalize' }}>{status}</span>
                                            {item.type && <span>• {item.type}</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Render Trails */}
                    {trails.map(item => {
                        if (!item.mapPath) return null;
                        const coords = getStartCoords(item.mapPath);
                        if (!coords) return null;

                        const status = getItemStatus(item.id, item.status);
                        const isSelected = selectedId === item.id;
                        const color = getStatusColor(status);

                        return (
                            <div
                                key={item.id}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleItemClick(item.id, 'slopes');
                                }}
                                style={{
                                    position: 'absolute',
                                    left: `${coords.x}%`,
                                    top: `${coords.y}%`,
                                    transform: 'translate(-50%, -50%)',
                                    cursor: 'pointer',
                                    pointerEvents: 'all',
                                    zIndex: isSelected ? 30 : 20,
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                <img
                                    src="/assets/slope-icon.png"
                                    alt={item.name}
                                    style={{
                                        width: isSelected ? '34px' : '30px',
                                        height: isSelected ? '34px' : '30px',
                                        filter: isSelected ? `drop-shadow(0 0 5px ${color})` : 'drop-shadow(0 0 2px rgba(0,0,0,0.5))',
                                        transition: 'all 0.3s ease'
                                    }}
                                />

                                {isSelected && (
                                    <div style={{
                                        position: 'absolute',
                                        left: '24px',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'rgba(15, 23, 42, 0.95)',
                                        color: 'white',
                                        padding: '6px 10px',
                                        borderRadius: '6px',
                                        whiteSpace: 'nowrap',
                                        fontSize: '0.85rem',
                                        border: `1px solid ${color}`,
                                        backdropFilter: 'blur(4px)',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                                        zIndex: 40,
                                        display: 'flex', flexDirection: 'column', gap: '2px'
                                    }}>
                                        <div style={{ fontWeight: 'bold' }}>{item.name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', opacity: 0.9 }}>
                                            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: color }}></span>
                                            <span style={{ textTransform: 'capitalize' }}>{status}</span>
                                            {item.difficulty && <span>• {item.difficulty}</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar (Desktop Only) */}
            {!isMobile && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    right: sidebarOpen ? 0 : '-260px',
                    width: '260px',
                    height: '100%',
                    background: 'rgba(15, 23, 42, 0.85)',
                    backdropFilter: 'blur(10px)',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    transition: 'right 0.3s ease',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100
                }}>
                    {/* Header / Tabs */}
                    <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <button
                            onClick={() => setActiveTab('lifts')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: activeTab === 'lifts' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: 'none',
                                color: activeTab === 'lifts' ? '#fff' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                fontWeight: activeTab === 'lifts' ? 'bold' : 'normal'
                            }}
                        >
                            <MdChair /> Lifts
                        </button>
                        <button
                            onClick={() => setActiveTab('slopes')}
                            style={{
                                flex: 1,
                                padding: '12px',
                                background: activeTab === 'slopes' ? 'rgba(255,255,255,0.1)' : 'transparent',
                                border: 'none',
                                color: activeTab === 'slopes' ? '#fff' : 'rgba(255,255,255,0.5)',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                                fontWeight: activeTab === 'slopes' ? 'bold' : 'normal'
                            }}
                        >
                            <MdTerrain /> Slopes
                        </button>
                    </div>

                    {/* List Content */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '10px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {activeItems.map(item => {
                                const status = getItemStatus(item.id, item.status);
                                const isSelected = selectedId === item.id;
                                return (
                                    <div key={item.id}
                                        onClick={() => handleItemClick(item.id, activeTab)}
                                        style={{
                                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                            padding: '8px',
                                            background: isSelected ? 'rgba(250, 204, 21, 0.2)' : 'rgba(255,255,255,0.05)',
                                            border: isSelected ? '1px solid rgba(250, 204, 21, 0.5)' : '1px solid transparent',
                                            borderRadius: '6px',
                                            fontSize: '0.85rem',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s'
                                        }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: '8px', height: '8px', borderRadius: '50%',
                                                background: getStatusColor(status),
                                                boxShadow: `0 0 5px ${getStatusColor(status)}`
                                            }} />
                                            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.name}</div>
                                        </div>
                                        {item.difficulty && (
                                            <div style={{
                                                width: '12px', height: '12px', borderRadius: '2px',
                                                background: item.difficulty.toLowerCase(),
                                                border: item.difficulty.toLowerCase() === 'white' ? '1px solid #ccc' : 'none'
                                            }} title={item.difficulty} />
                                        )}
                                        {item.type && (
                                            <div style={{ fontSize: '0.7rem', opacity: 0.5, marginLeft: '6px' }}>{item.type}</div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* Toggle Button (Desktop Only) */}
            {!isMobile && (
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: sidebarOpen ? '260px' : '10px',
                        zIndex: 101, // Higher than sidebar
                        background: 'rgba(15, 23, 42, 0.9)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        padding: '8px',
                        cursor: 'pointer',
                        transition: 'right 0.3s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    {sidebarOpen ? <MdCloseFullscreen /> : <MdOpenInFull />}
                </button>
            )}

            {/* Mobile Horizontal List (Mobile Only) */}
            {isMobile && (
                <ResortItemsList onSelect={(item, type) => handleItemClick(item.id, type)} />
            )}

        </div>
    );
};

export default MapWithStatus;
