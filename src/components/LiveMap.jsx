import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';
import { useRide } from '../contexts/RideContext';
import { useTripMembers } from '../hooks/useTripMembers'; // New Hook
import L from 'leaflet';

// Fix Leaflet Default Icon
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Custom Icon Generator
const createCustomIcon = (name, color) => {
    return L.divIcon({
        className: 'custom-map-marker',
        html: `
            <div style="display: flex; align-items: center; gap: 8px; transform: translate(-10%, -50%);">
                <div style="
                    width: 14px; 
                    height: 14px; 
                    background: ${color}; 
                    border: 2px solid white; 
                    border-radius: 50%; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                "></div>
                <span style="
                    background: rgba(15, 23, 42, 0.9); 
                    color: white; 
                    padding: 2px 6px; 
                    border-radius: 4px; 
                    font-size: 11px; 
                    font-weight: 600; 
                    white-space: nowrap;
                    border: 1px solid ${color};
                    text-shadow: 0 1px 2px rgba(0,0,0,0.5);
                ">${name}</span>
            </div>
        `,
        iconSize: [150, 30], // Big enough container
        iconAnchor: [0, 15]   // Left-Center aligned so dot is at coordinate
    });
};

const FRIEND_COLORS = [
    '#ef4444', // Red
    '#f59e0b', // Orange
    '#10b981', // Green
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#14b8a6'  // Teal
];

// Component to recenter map on user location
const MapRecenter = ({ center }) => {
    const map = useMap();
    const hasCentered = React.useRef(false);

    useEffect(() => {
        if (center && center.lat && center.lng && !hasCentered.current) {
            map.flyTo([center.lat, center.lng], 15, {
                animate: true,
                duration: 1.5
            });
            hasCentered.current = true;
        }
    }, [center, map]);
    return null;
};

const LiveMap = () => {
    const { config } = useConfig();
    const { userStatus } = useAuth();
    const { isRecording, startRecording, stopRecording, currentPath, currentRideStats } = useRide();
    const { members } = useTripMembers();

    // Default center (Resort Base or Configured Hotel)
    const defaultCenter = config.hotel?.location || { lat: 45.733, lng: 7.320 };

    // Effective Center: User Location -> Hotel -> Defaults
    const center = userStatus.location || defaultCenter;

    if (!config) return null;

    return (
        <div style={{ height: '100%', width: '100%', position: 'relative', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, position: 'relative' }}>
                <MapContainer center={[center.lat, center.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {/* Live Recenter */}
                    <MapRecenter center={userStatus.location} />

                    {/* Recorded Path visualization */}
                    {isRecording && currentPath.length > 1 && (
                        <Polyline
                            positions={currentPath.map(p => [p.lat, p.lng])}
                            color="#ef4444" // Red/Orange for tracking
                            weight={4}
                            opacity={0.8}
                        />
                    )}

                    {/* Resort POIs (Standard Markers for context) */}
                    <Marker position={[config.hotel.location.lat, config.hotel.location.lng]}>
                        <Popup>🏨 {config.hotel.name}</Popup>
                    </Marker>

                    {/* Real-time Users (Friends) */}
                    {members.map((user, index) => {
                        if (!user.coordinates) return null;

                        // Deterministic color based on name/index
                        const color = FRIEND_COLORS[index % FRIEND_COLORS.length] || '#3b82f6';

                        return (
                            <Marker
                                key={user.id}
                                position={[user.coordinates.lat, user.coordinates.lng]}
                                icon={createCustomIcon(user.name, color)}
                            >
                                <Popup>
                                    <strong>{user.name}</strong><br />
                                    {user.status.location || 'Unknown'}
                                </Popup>
                            </Marker>
                        );
                    })}

                    {/* Current User */}
                    {userStatus.location && (
                        <Marker
                            position={[userStatus.location.lat, userStatus.location.lng]}
                            icon={createCustomIcon('You', '#0ea5e9')} // Sky Blue for User
                            zIndexOffset={1000} // Keep on top
                        >
                            <Popup>
                                <strong>You</strong><br />
                                (GPS Active)
                            </Popup>
                        </Marker>
                    )}

                </MapContainer>

                {/* RECORDING CONTROL OVERLAY */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    zIndex: 900,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    {isRecording ? (
                        <>
                            {/* Stats Box */}
                            <div style={{
                                background: 'rgba(15, 23, 42, 0.9)',
                                color: 'white',
                                padding: '8px 16px',
                                borderRadius: '20px',
                                display: 'flex',
                                gap: '16px',
                                fontSize: '0.9rem',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
                            }}>
                                <span>📏 {currentRideStats.distance.toFixed(2)} km</span>
                                <span>⏱️ {Math.floor(currentRideStats.duration / 60)}:{(currentRideStats.duration % 60).toFixed(0).padStart(2, '0')}</span>
                            </div>

                            {/* Stop Button */}
                            <button
                                onClick={stopRecording}
                                style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    padding: '10px 24px',
                                    borderRadius: '50px',
                                    fontWeight: 'bold',
                                    fontSize: '1rem',
                                    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '8px'
                                }}
                            >
                                ⏹ Stop Recording
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={startRecording}
                            style={{
                                background: '#3b82f6',
                                color: 'white',
                                border: 'none',
                                padding: '10px 24px',
                                borderRadius: '50px',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                        >
                            ⏺ Start Recording
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default LiveMap;
