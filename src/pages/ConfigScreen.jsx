import React, { useState } from 'react';
import pilaPreset from '../data/presets/pila.json';
import { useConfig } from '../contexts/ConfigContext';

import { FaCopy } from 'react-icons/fa';

const ConfigScreen = () => {
    const [jsonConfig, setJsonConfig] = useState('');
    const [shareLink, setShareLink] = useState(null);
    const { createTrip } = useConfig();

    const promptTemplate = `I need a JSON configuration for a ski resort app. 
Please act as a researcher and generate a valid JSON object for [INSERT RESORT NAME].

Data Requirements:
1. **Real Data**: Find actual names of lifts, trails, hotels, and services for this resort.
2. **Coordinates**: Use approximate real-world Lat/Lng coordinates.
3. **Map Paths**: For 'mapPath', generate simple SVG path data (e.g., "M 10 10 L 20 20") relative to a 100x100 virtual grid representing the resort map.

JSON Structure:
{
  "resortName": "Full Name of Resort",
  "mapImage": "URL to a high-res trail map image",
  "gpsInterval": 300000,
  "recordingInterval": 5000,
  "hotel": { 
      "name": "Name of a popular hotel near base", 
      "location": { "lat": 0.0, "lng": 0.0 }, 
      "address": "Full Address",
      "mapLink": "Google Maps Link"
  },
  "airport": {
      "name": "Nearest Major Airport",
      "terminal": "Terminal Info",
      "location": { "lat": 0.0, "lng": 0.0 },
      "landingTime": "2025-01-01T12:00:00"
  },
  "carRental": {
      "company": "Rental Company Name",
      "location": "Pickup Location",
      "details": "Opening hours or notes"
  },
  "skiGear": {
      "shopName": "Name of rental shop",
      "location": { "lat": 0.0, "lng": 0.0 },
      "notes": "Near main gondola?"
  },
  "lifts": [
    { 
      "id": "l1", 
      "name": "Real Lift Name", 
      "type": "Chairlift/Gondola/Surface", 
      "status": "open",
      "mapPath": "M 50 80 L 50 60" 
    }
  ],
  "trails": [
    { 
      "id": "t1", 
      "name": "Real Trail Name", 
      "difficulty": "Blue/Red/Black", 
      "status": "open", 
      "mapPath": "M 50 40 Q 45 60 50 80" 
    }
  ],
  "emergency": {
      "police": "112",
      "ambulance": "118",
      "resortRescue": "Resort Specific Number"
  }
}

Please provide ONLY the JSON object.`;

    const handleCopyPrompt = () => {
        navigator.clipboard.writeText(promptTemplate);
        alert("AI Prompt copied! Paste it into ChatGPT/Claude to generate your config.");
    };

    const handlePresetChange = (e) => {
        const value = e.target.value;
        if (value === 'pila') {
            setJsonConfig(JSON.stringify(pilaPreset, null, 2));
        }
    };

    const handleSave = () => {
        try {
            const parsed = JSON.parse(jsonConfig);
            console.log("Saving Config:", parsed);
            saveConfig(parsed);
        } catch (e) {
            alert("Invalid JSON");
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
            <h1>Trip Configuration</h1>

            <button
                className="glass-btn"
                onClick={handleCopyPrompt}
                style={{
                    width: '100%',
                    margin: '10px 0 20px 0',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'rgba(56, 189, 248, 0.2)',
                    border: '1px solid #38bdf8'
                }}
            >
                <FaCopy /> Copy AI Prompt
            </button>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>Or load a preset:</label>
                <select
                    className="glass-btn"
                    style={{
                        width: '100%',
                        textAlign: 'left',
                        color: '#333',               // Dark text for better contrast
                        background: 'rgba(255, 255, 255, 0.9)', // Lighter background
                        appearance: 'auto',
                        border: 'none',
                        padding: '12px'
                    }}
                    onChange={handlePresetChange}
                >
                    <option value="">Select a Resort...</option>
                    <option value="pila">Pila, Italy (2025)</option>
                </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>GPS Update Frequency (Power Saving):</label>
                <select
                    className="glass-btn"
                    style={{
                        width: '100%',
                        textAlign: 'left',
                        color: '#333',
                        background: 'rgba(255, 255, 255, 0.9)',
                        appearance: 'auto',
                        border: 'none',
                        padding: '12px'
                    }}
                    onChange={(e) => {
                        try {
                            const currentConfig = jsonConfig ? JSON.parse(jsonConfig) : {};
                            currentConfig.gpsInterval = parseInt(e.target.value);
                            setJsonConfig(JSON.stringify(currentConfig, null, 2));
                        } catch (err) {
                            alert("Please load a valid JSON config first");
                        }
                    }}
                    defaultValue={60000} // Default 1 min
                >
                    <option value={60000}>Every 1 Minute (Default)</option>
                    <option value={300000}>Every 5 Minutes (Battery Saver)</option>
                    <option value={10000}>Dev Mode (10s)</option>
                </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>Record Mode Frequency (High Precision):</label>
                <select
                    className="glass-btn"
                    style={{
                        width: '100%',
                        textAlign: 'left',
                        color: '#333',
                        background: 'rgba(255, 255, 255, 0.9)',
                        appearance: 'auto',
                        border: 'none',
                        padding: '12px'
                    }}
                    onChange={(e) => {
                        try {
                            const currentConfig = jsonConfig ? JSON.parse(jsonConfig) : {};
                            currentConfig.recordingInterval = parseInt(e.target.value);
                            setJsonConfig(JSON.stringify(currentConfig, null, 2));
                        } catch (err) {
                            alert("Please load a valid JSON config first");
                        }
                    }}
                    defaultValue={5000}
                >
                    <option value={1000}>Every 1 Second (Pro)</option>
                    <option value={2000}>Every 2 Seconds</option>
                    <option value={5000}>Every 5 Seconds (Recommended)</option>
                    <option value={10000}>Every 10 Seconds</option>
                </select>
            </div>

            <textarea
                className="glass-panel"
                style={{
                    width: '100%',
                    height: '200px', // Reduced from 400px for mobile friendliness
                    background: 'rgba(0, 0, 0, 0.5)',
                    color: '#e2e8f0',
                    padding: '15px',
                    fontFamily: 'monospace',
                    marginBottom: '20px',
                    border: '1px solid var(--glass-border)',
                    resize: 'vertical'
                }}
                value={jsonConfig}
                onChange={(e) => setJsonConfig(e.target.value)}
                placeholder='Paste JSON here...'
            />

            <button
                className="glass-btn"
                style={{
                    background: 'var(--color-primary)',
                    width: '100%',
                    fontWeight: 'bold',
                    color: '#0f172a',
                    marginTop: '20px',
                    padding: '16px',
                    fontSize: '1.1rem'
                }}
                onClick={async () => {
                    try {
                        const parsed = JSON.parse(jsonConfig);
                        console.log("Creating Shared Trip:", parsed);
                        const id = await createTrip(parsed);
                        const link = `${window.location.origin}/?tripId=${id}`;
                        setShareLink(link);
                    } catch (e) {
                        alert("Invalid JSON or Network Error");
                    }
                }}
            >
                🚀 Start Shared Trip
            </button>

            {/* Share Modal */}
            {shareLink && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.9)', zIndex: 3000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '20px'
                }}>
                    <div className="glass-panel" style={{ padding: '30px', maxWidth: '400px', width: '100%', textAlign: 'center', background: '#1e293b' }}>
                        <h2 style={{ color: 'var(--color-primary)', marginTop: 0 }}>Trip Created!</h2>
                        <p>Share this link with your friends so they can join your map:</p>

                        <div style={{
                            background: 'rgba(0,0,0,0.3)',
                            padding: '12px',
                            borderRadius: '8px',
                            wordBreak: 'break-all',
                            fontFamily: 'monospace',
                            margin: '20px 0',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            {shareLink}
                        </div>

                        <button
                            className="glass-btn"
                            style={{ width: '100%', background: 'var(--color-primary)', color: '#0f172a', fontWeight: 'bold' }}
                            onClick={() => {
                                navigator.clipboard.writeText(shareLink);
                                alert("Link Copied!");
                            }}
                        >
                            📋 Copy Link
                        </button>

                        <button
                            style={{
                                marginTop: '15px',
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                textDecoration: 'underline',
                                cursor: 'pointer'
                            }}
                            onClick={() => setShareLink(null)} // Close and continue to app
                        >
                            Continue to App &rarr;
                        </button>
                    </div>
                </div>
            )}
        </div >
    );
};

export default ConfigScreen;
