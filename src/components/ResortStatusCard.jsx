import React from 'react';
import { useResortStatus } from '../hooks/useResortStatus';
import { useConfig } from '../contexts/ConfigContext';
import { FaSnowflake, FaWind, FaTemperatureLow, FaSync, FaBed, FaSkiing } from 'react-icons/fa';
import { MdChair } from 'react-icons/md';

const ResortStatusCard = () => {
    const { config } = useConfig();
    const { statusData, loading, refreshStatus } = useResortStatus();

    return (
        <div className="glass-panel" style={{
            padding: '12px', // Reduced padding
            marginBottom: '10px', // Reduced margin
            border: '1px solid rgba(167, 139, 250, 0.3)',
            background: 'linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* Loading Overlay */}
            {loading && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 10
                }}>
                    <FaSync className="spin" size={20} color="white" />
                    <style>{`
                        .spin { animation: spin 1s linear infinite; }
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                    `}</style>
                </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'white', fontSize: '1rem' }}>
                        <FaSnowflake color="#60a5fa" size={14} />
                        Resort Status
                    </h3>
                    <div style={{ fontSize: '0.65rem', opacity: 0.6, marginTop: '2px' }}>
                        (Updated: {statusData.lastUpdated})
                    </div>
                </div>
                <button
                    onClick={refreshStatus}
                    className="glass-btn"
                    style={{ padding: '6px', fontSize: '0.8rem', cursor: loading ? 'not-allowed' : 'pointer', minWidth: 'auto' }}
                    title="Refresh Data"
                    disabled={loading}
                >
                    <FaSync size={12} />
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {/* Lifts Status */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <MdChair size={20} color={statusData.liftsOpen >= 14 ? "#4ade80" : "#fbbf24"} />
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Open Lifts</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>
                            {statusData.liftsOpen}/{statusData.liftsTotal}
                        </div>
                    </div>
                </div>

                {/* Weather */}
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FaTemperatureLow size={20} color="#fcd34d" />
                    <div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.7 }}>Weather</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem' }}>{statusData.weather}, {statusData.temp}°C</div>
                    </div>
                </div>
            </div>

            <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {config.hotel && (
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(config.hotel.name)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '6px',
                            textDecoration: 'none', color: 'white', fontSize: '0.8rem', cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <FaBed size={14} color="#fcd34d" />
                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Hotel</div>
                            <div style={{ fontWeight: 'bold' }}>{config.hotel.name}</div>
                        </div>
                    </a>
                )}
                {config.skiGear && (
                    <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(config.skiGear.shopName)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                            display: 'flex', alignItems: 'center', gap: '8px',
                            background: 'rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: '6px',
                            textDecoration: 'none', color: 'white', fontSize: '0.8rem', cursor: 'pointer',
                            transition: 'background 0.2s'
                        }}
                    >
                        <FaSkiing size={14} color="#60a5fa" />
                        <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            <div style={{ fontSize: '0.65rem', opacity: 0.7 }}>Gear</div>
                            <div style={{ fontWeight: 'bold' }}>{config.skiGear.shopName}</div>
                        </div>
                    </a>
                )}
            </div>

            <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaSnowflake size={12} style={{ opacity: 0.7 }} />
                    <span>Snow: <strong>{statusData.nextSnow}</strong></span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <FaWind size={12} style={{ opacity: 0.7 }} />
                    <span>{statusData.warning}</span>
                </div>
            </div>
        </div>
    );
};

export default ResortStatusCard;
