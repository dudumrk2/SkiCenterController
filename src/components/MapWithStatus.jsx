import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useConfig } from '../contexts/ConfigContext';
import { FaExpand, FaTimes, FaUndo, FaSearchPlus, FaSearchMinus } from 'react-icons/fa'; // Added icons
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch"; // New Import

const MapWithStatus = () => {
    const { config } = useConfig();
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [isRotated, setIsRotated] = useState(false);

    // State for exact viewport dimensions
    const getViewportSize = () => {
        if (window.visualViewport) {
            return { width: window.visualViewport.width, height: window.visualViewport.height };
        }
        return { width: window.innerWidth, height: window.innerHeight };
    };

    const [viewportSize, setViewportSize] = useState(getViewportSize());

    // Handle Resize & Orientation
    useEffect(() => {
        const handleResize = () => {
            setViewportSize(getViewportSize());
        };

        if (window.visualViewport) {
            window.visualViewport.addEventListener('resize', handleResize);
        }
        window.addEventListener('resize', handleResize);
        window.addEventListener('orientationchange', handleResize);

        return () => {
            if (window.visualViewport) {
                window.visualViewport.removeEventListener('resize', handleResize);
            }
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('orientationchange', handleResize);
        };
    }, []);

    // Auto-rotate & Lock Scroll
    useEffect(() => {
        if (isFullScreen) {
            // Smart Rotation: Only if Portrait
            const isPortrait = window.matchMedia("(orientation: portrait)").matches;
            if (isPortrait) {
                setIsRotated(true);
            }
            // Lock Body Scroll
            document.body.style.overflow = 'hidden';
        } else {
            setIsRotated(false); // Reset
            document.body.style.overflow = '';
        }

        // Cleanup
        return () => {
            document.body.style.overflow = '';
        };
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
                }} >
                    <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaExpand size={16} /> Trail Map
                    </h3>
                    <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Tap to view full map</div>
                </div>
            </div>

            {/* Full Screen Modal - Using Portal to sit above everything */}
            {isFullScreen && createPortal(
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: `${viewportSize.width}px`,   // Explicit Pixel Width
                    height: `${viewportSize.height}px`, // Explicit Pixel Height
                    zIndex: 99999, // Max Z-Index
                    background: '#0f172a',
                    display: 'flex',
                    flexDirection: 'column',
                    touchAction: 'none',
                    overscrollBehavior: 'none'
                }}>
                    <TransformWrapper
                        initialScale={1}
                        minScale={1}
                        maxScale={4}
                        centerOnInit={true}
                    >
                        {({ zoomIn, zoomOut, resetTransform }) => (
                            <>
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
                                        {/* Zoom Controls */}
                                        <button onClick={() => zoomIn()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FaSearchPlus size={18} /></button>
                                        <button onClick={() => zoomOut()} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}><FaSearchMinus size={18} /></button>

                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsRotated(!isRotated); resetTransform(); }}
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
                                <div style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#000' }}>

                                    {/* 
                                        ROTATION LOGIC:
                                        We rotate the CONTAINER that holds the TransformComponent. 
                                     */}
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        transform: isRotated ? 'translate(-50%, -50%) rotate(90deg)' : 'none',
                                        transformOrigin: 'center center',
                                        // When rotated, we swap dimensions and center absolutely
                                        ...(isRotated ? {
                                            width: `${viewportSize.height}px`,
                                            height: `${viewportSize.width}px`,
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            margin: 0
                                        } : {})
                                    }}>
                                        {mapUrl.endsWith('.pdf') ? (
                                            <iframe
                                                src={mapUrl}
                                                title="PDF Map"
                                                style={{ width: '100%', height: '100%', border: 'none' }}
                                            />
                                        ) : (
                                            <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }} contentStyle={{ width: '100%', height: '100%' }}>
                                                <img
                                                    src={mapUrl}
                                                    alt="Full Map"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            </TransformComponent>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </TransformWrapper>
                </div>,
                document.body
            )}
        </>
    );
};

export default MapWithStatus;
