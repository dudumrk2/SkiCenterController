import React, { useState, useEffect } from 'react';
import { useConfig } from '../contexts/ConfigContext';
import { FaExpand, FaTimes, FaUndo } from 'react-icons/fa';

const MapWithStatus = () => {
    const { config } = useConfig();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isRotated, setIsRotated] = useState(false);

    // Auto-rotate on Mobile when opening Full Screen
    useEffect(() => {
        if (isFullScreen) {
            const isMobile = window.innerWidth <= 768; // Standard Mobile Breakpoint
            if (isMobile) {
                setIsRotated(true);
            }
        } else {
            setIsRotated(false); // Reset when closing
        }
    }, [isFullScreen]);

    if (!config) return null;

    // Default to the config PDF or fallback to the image
    const mapUrl = config.staticMapPdf || config.mapImage;

    return (
        <>
            {/* Dashboard Widget (Thumbnail) */}
            <div
                className="glass-panel"
                style={{
                    height: '250px',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    position: 'relative',
                    border: '1px solid rgba(255,255,255,0.1)',
                    cursor: 'pointer'
                }}
                onClick={() => setIsFullScreen(true)}
            >
                <img
                    src={config.mapImage}
                    alt="Trail Map"
                    style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        opacity: 0.8,
                        transition: 'transform 0.3s'
                    }}
                />

                {/* Overlay Text */}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)',
                    padding: '20px 15px 15px 15px',
                    color: 'white'
                }}>
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaExpand size={16} /> Trail Map
                    </h3>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Tap to view full map</div>
                </div>
            </div>

            {/* Full Screen Modal */}
            {isFullScreen && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 5000,
                    background: '#0f172a',
                    display: 'flex',
                    flexDirection: 'column'
                }}>
                    {/* Toolbar */}
                    <div style={{
                        padding: '10px 15px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: 'rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(10px)',
                        zIndex: 5010
                    }}>
                        <h3 style={{ margin: 0, color: 'white', fontSize: '1rem' }}>Resort Map</h3>
                        <div style={{ display: 'flex', gap: '15px' }}>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsRotated(!isRotated); }}
                                style={{
                                    background: 'rgba(255,255,255,0.1)',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    color: 'white',
                                    padding: '8px 12px',
                                    borderRadius: '8px',
                                    display: 'flex', alignItems: 'center', gap: '6px',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaUndo size={14} /> Rotate
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setIsFullScreen(false); }}
                                style={{
                                    background: 'transparent',
                                    border: 'none',
                                    color: 'white',
                                    cursor: 'pointer'
                                }}
                            >
                                <FaTimes size={24} />
                            </button>
                        </div>
                    </div>

                    {/* Viewer Container */}
                    <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                        <div style={{
                            width: '100%',
                            height: '100%',
                            transform: isRotated ? 'rotate(90deg)' : 'none',
                            transformOrigin: 'center center',
                            // Adjust dimensions when rotated to fill screen
                            ...(isRotated ? {
                                width: '100vh',
                                height: '100vw',
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                margin: '-50vw 0 0 -50vh'
                            } : {})
                        }}>
                            {mapUrl.endsWith('.pdf') ? (
                                <iframe
                                    src={mapUrl}
                                    title="PDF Map"
                                    style={{ width: '100%', height: '100%', border: 'none' }}
                                />
                            ) : (
                                <img
                                    src={mapUrl}
                                    alt="Full Map"
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default MapWithStatus;
