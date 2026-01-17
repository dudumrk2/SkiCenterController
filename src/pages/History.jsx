import React, { useState, useEffect } from 'react';
import { useRide } from '../contexts/RideContext';
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet Default Icon (copied from LiveMap logic)
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// Auto-zoom component
const FitBounds = ({ path }) => {
    const map = useMap();
    useEffect(() => {
        if (path && path.length > 0) {
            const bounds = path.map(p => [p.lat, p.lng]);
            map.fitBounds(bounds, { padding: [20, 20] });
        }
    }, [path, map]);
    return null;
};

const History = () => {
    const { history, clearHistory } = useRide();
    const [selectedRide, setSelectedRide] = useState(null);

    // Calculate Today's Total
    const today = new Date().toISOString().split('T')[0];
    const todaysRides = history.filter(ride => ride.date.startsWith(today));
    const totalDistance = todaysRides.reduce((sum, ride) => sum + ride.distance, 0);

    return (
        <div style={{ padding: '0 5px' }}>
            <h2 style={{ textAlign: 'center', margin: '20px 0', color: 'var(--color-primary)' }}>Ride History</h2>

            {/* Daily Summary Card */}
            <div style={{
                background: 'linear-gradient(135deg, #1e293b, #334155)',
                padding: '20px',
                borderRadius: '12px',
                marginBottom: '20px',
                textAlign: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.2)'
            }}>
                <div style={{ fontSize: '0.9rem', opacity: 0.8, color: '#94a3b8' }}>TODAY'S TOTAL</div>
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#38bdf8', margin: '10px 0' }}>
                    {totalDistance.toFixed(2)} <span style={{ fontSize: '1rem' }}>km</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
                    {todaysRides.length} {todaysRides.length === 1 ? 'Ride' : 'Rides'}
                </div>
            </div>

            {/* History List */}
            {history.length === 0 ? (
                <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '40px' }}>
                    <p>No rides recorded yet.</p>
                    <p style={{ fontSize: '0.8rem' }}>Go to the Map tab and hit Record!</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {history.map(ride => (
                        <div
                            key={ride.id}
                            onClick={() => setSelectedRide(ride)}
                            style={{
                                background: 'rgba(255, 255, 255, 0.05)',
                                padding: '16px',
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                border: '1px solid transparent'
                            }}
                            onMouseOver={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)'}
                            onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}
                        >
                            <div>
                                <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#f1f5f9' }}>
                                    {new Date(ride.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                    {new Date(ride.date).toLocaleDateString()}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#38bdf8' }}>
                                    {ride.distance.toFixed(2)} km
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                    Duration: {Math.floor(ride.duration / 60)}m {Math.round(ride.duration % 60)}s
                                </div>
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={clearHistory}
                        style={{
                            marginTop: '30px',
                            background: 'none',
                            border: '1px solid #ef4444',
                            color: '#ef4444',
                            padding: '10px',
                            width: '100%',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    >
                        Clear History
                    </button>
                </div>
            )}

            {/* Map Modal */}
            {selectedRide && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.85)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    padding: '20px'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px', color: 'white' }}>
                        <h3>Ride Details</h3>
                        <button
                            onClick={() => setSelectedRide(null)}
                            style={{
                                background: 'rgba(255,255,255,0.2)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '50%',
                                width: '32px', height: '32px',
                                cursor: 'pointer',
                                fontSize: '1.2rem'
                            }}
                        >
                            &times;
                        </button>
                    </div>

                    <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.2)' }}>
                        <MapContainer
                            center={[45.733, 7.320]}
                            zoom={13}
                            style={{ height: '100%', width: '100%' }}
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />

                            {selectedRide.path && selectedRide.path.length > 0 && (
                                <>
                                    <Polyline
                                        positions={selectedRide.path.map(p => [p.lat, p.lng])}
                                        color="#ef4444"
                                        weight={5}
                                    />
                                    <FitBounds path={selectedRide.path} />

                                    {/* Start Marker */}
                                    <Marker position={[selectedRide.path[0].lat, selectedRide.path[0].lng]}>
                                        <Popup>Start</Popup>
                                    </Marker>

                                    {/* End Marker */}
                                    <Marker position={[selectedRide.path[selectedRide.path.length - 1].lat, selectedRide.path[selectedRide.path.length - 1].lng]}>
                                        <Popup>Finish: {selectedRide.distance.toFixed(2)}km</Popup>
                                    </Marker>
                                </>
                            )}
                        </MapContainer>
                    </div>
                </div>
            )}
        </div>
    );
};

export default History;
