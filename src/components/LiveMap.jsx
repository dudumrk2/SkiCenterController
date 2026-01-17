import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';
import { mockFriends } from '../data/mockFriends';
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

const FRIEND_COLORS = {
    f1: '#ef4444', // Red (Sarah)
    f2: '#f59e0b', // Orange (Mike)
    f3: '#10b981', // Green (Jessica)
    f4: '#8b5cf6', // Purple (David)
};

// Component to recenter map on user location
const MapRecenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center.lat && center.lng) {
            map.flyTo([center.lat, center.lng], 15, {
                animate: true,
                duration: 1.5
            });
        }
    }, [center, map]);
    return null;
};

const LiveMap = () => {
    const { config } = useConfig();
    const { userStatus } = useAuth();

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

                    {/* Resort POIs (Standard Markers for context) */}
                    <Marker position={[config.hotel.location.lat, config.hotel.location.lng]}>
                        <Popup>🏨 {config.hotel.name}</Popup>
                    </Marker>

                    {/* Real-time Users (Friends) */}
                    {mockFriends.map(user => {
                        if (!user.coordinates) return null;
                        const color = FRIEND_COLORS[user.id] || '#3b82f6'; // Fallback Blue

                        return (
                            <Marker
                                key={user.id}
                                position={[user.coordinates.lat, user.coordinates.lng]}
                                icon={createCustomIcon(user.name, color)}
                            >
                                <Popup>
                                    <strong>{user.name}</strong><br />
                                    {user.status.lift ? `On ${user.status.lift}` : user.status.trail ? `Skiing ${user.status.trail}` : 'Relaxing'}
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
            </div>
        </div>
    );
};

export default LiveMap;
