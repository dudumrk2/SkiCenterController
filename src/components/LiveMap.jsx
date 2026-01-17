import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../contexts/AuthContext';
import ResortStatusPanel from './ResortStatusPanel'; // Import Overlay
import L from 'leaflet';

// Fix for default marker icons in React Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Helper to center map on config change
const MapRecenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
};

const LiveMap = () => {
    const { config } = useConfig();
    const { currentUser } = useAuth(); // In real app, we'd fetch ALL users from Firestore here

    // Mock list of other users for visualization
    const otherUsers = [
        { uid: 'u2', name: 'Teen', location: { lat: 45.735, lng: 7.322 }, status: 'Skiing' },
        { uid: 'u3', name: 'Child', location: { lat: 45.731, lng: 7.318 }, status: 'Hot Choco' }
    ];

    if (!config) return <div>Loading Map Config...</div>;

    // Use Hotel as center, or fallback to Pila
    const center = config.hotel?.location || { lat: 45.733, lng: 7.320 };

    return (
        <div style={{ height: '70vh', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--glass-border)', position: 'relative' }}>
            <MapContainer center={[center.lat, center.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapRecenter center={[center.lat, center.lng]} />

                {/* Resort POIs */}
                <Marker position={[config.hotel.location.lat, config.hotel.location.lng]}>
                    <Popup>🏨 {config.hotel.name}</Popup>
                </Marker>

                <Marker position={[config.skiGear.location.lat, config.skiGear.location.lng]}>
                    <Popup>🎿 {config.skiGear.shopName}</Popup>
                </Marker>

                {/* Real-time Users */}
                {otherUsers.map(user => (
                    <Marker key={user.uid} position={[user.location.lat, user.location.lng]}>
                        <Popup>
                            <strong>{user.name}</strong><br />
                            {user.status}
                        </Popup>
                    </Marker>
                ))}

                {/* Current User (Simulated) */}
                <Marker position={[center.lat + 0.001, center.lng + 0.001]}>
                    <Popup>
                        <strong>You</strong><br />
                        (GPS Active)
                    </Popup>
                </Marker>

            </MapContainer>

            {/* Overlay Status Panel */}
            <ResortStatusPanel />
        </div>
    );
};

export default LiveMap;
