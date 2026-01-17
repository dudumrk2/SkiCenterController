import React, { useState, useEffect } from 'react';
import { FaCheckSquare, FaSquare, FaPlus } from 'react-icons/fa';

const DEFAULT_ITEMS = [
    { id: 1, label: 'Passport / ID', category: 'Documents', checked: false },
    { id: 2, label: 'Boarding Pass', category: 'Documents', checked: false },
    { id: 3, label: 'Driving License', category: 'Documents', checked: false },
    { id: 4, label: 'Ski Jacket', category: 'Gear', checked: false },
    { id: 5, label: 'Ski Pants', category: 'Gear', checked: false },
    { id: 6, label: 'Thermals', category: 'Gear', checked: false },
    { id: 7, label: 'Gloves', category: 'Gear', checked: false },
    { id: 8, label: 'Swimsuit (Spa)', category: 'Essentials', checked: false },
    { id: 9, label: 'Sunscreen', category: 'Essentials', checked: false },
];

const Checklist = () => {
    const [items, setItems] = useState([]);
    const [newItem, setNewItem] = useState('');
    const [newCategory, setNewCategory] = useState('Essentials');

    useEffect(() => {
        // Load from local storage or default
        const saved = localStorage.getItem('packingList');
        if (saved) {
            setItems(JSON.parse(saved));
        } else {
            setItems(DEFAULT_ITEMS);
        }
    }, []);

    const saveItems = (updatedItems) => {
        setItems(updatedItems);
        localStorage.setItem('packingList', JSON.stringify(updatedItems));
    };

    const toggleItem = (id) => {
        const newItems = items.map(item =>
            item.id === id ? { ...item, checked: !item.checked } : item
        );
        saveItems(newItems);
    };

    const addItem = (e) => {
        e.preventDefault();
        if (!newItem.trim()) return;

        const item = {
            id: Date.now(), // Simple unique ID
            label: newItem,
            category: newCategory,
            checked: false
        };

        saveItems([...items, item]);
        setNewItem('');
    };

    // Group by Category
    const grouped = items.reduce((acc, item) => {
        if (!acc[item.category]) acc[item.category] = [];
        acc[item.category].push(item);
        return acc;
    }, {});

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', paddingBottom: '80px' }}>
            <h1 style={{ textAlign: 'center' }}>Packing List</h1>

            {/* Add New Item Form */}
            <form onSubmit={addItem} className="glass-panel" style={{ padding: '15px', marginBottom: '20px', display: 'flex', gap: '10px' }}>
                <input
                    type="text"
                    placeholder="Add new item..."
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white'
                    }}
                />
                <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    style={{
                        padding: '10px',
                        borderRadius: '8px',
                        border: 'none',
                        background: 'rgba(255,255,255,0.1)',
                        color: 'white'
                    }}
                >
                    <option value="Documents" style={{ color: 'black' }}>Documents</option>
                    <option value="Gear" style={{ color: 'black' }}>Gear</option>
                    <option value="Essentials" style={{ color: 'black' }}>Essentials</option>
                    <option value="Food" style={{ color: 'black' }}>Food</option>
                    <option value="Other" style={{ color: 'black' }}>Other</option>
                </select>
                <button type="submit" className="glass-btn" style={{ background: 'var(--color-primary)', color: '#0f172a' }}>
                    <FaPlus />
                </button>
            </form>

            {Object.entries(grouped).map(([category, catItems]) => (
                <div key={category} className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                    <h3 style={{ marginTop: 0, color: 'var(--color-primary)' }}>{category}</h3>
                    <div style={{ display: 'grid', gap: '10px' }}>
                        {catItems.map(item => (
                            <div
                                key={item.id}
                                className="glass-btn"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    background: item.checked ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255,255,255,0.05)',
                                    opacity: item.checked ? 0.7 : 1,
                                    textAlign: 'left'
                                }}
                                onClick={() => toggleItem(item.id)}
                            >
                                <div style={{ fontSize: '1.2rem', color: item.checked ? 'var(--color-primary)' : 'inherit' }}>
                                    {item.checked ? <FaCheckSquare /> : <FaSquare />}
                                </div>
                                <span style={{ textDecoration: item.checked ? 'line-through' : 'none' }}>
                                    {item.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default Checklist;
