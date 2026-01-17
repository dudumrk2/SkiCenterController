import React, { useState } from 'react';
import pilaPreset from '../data/presets/pila.json';
import { useConfig } from '../contexts/ConfigContext';

const ConfigScreen = () => {
    const [jsonConfig, setJsonConfig] = useState('');
    const { saveConfig } = useConfig();

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
            <p style={{ opacity: 0.8 }}>Use the AI Prompt to generate your resort data and paste it here.</p>

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
                <label style={{ display: 'block', marginBottom: '10px' }}>GPS Update Frequency:</label>
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
                    defaultValue={300000}
                >
                    <option value={60000}>Every 1 Minute (High Usage)</option>
                    <option value={300000}>Every 5 Minutes (Recommended)</option>
                    <option value={900000}>Every 15 Minutes (Battery Saver)</option>
                    <option value={10000}>Dev Mode (10s)</option>
                </select>
            </div>

            <textarea
                className="glass-panel"
                style={{
                    width: '100%',
                    height: '400px',
                    background: 'rgba(0, 0, 0, 0.5)',   // Darker background for code
                    color: '#e2e8f0',                   // Light text
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
                    color: '#0f172a' // Dark text on the bright blue button
                }}
                onClick={handleSave}
            >
                Initialize App
            </button>
        </div >
    );
};

export default ConfigScreen;
