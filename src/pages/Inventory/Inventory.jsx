import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, AlertTriangle, CheckCircle, Download, User, X, Trash2, Edit2 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newItem, setNewItem] = useState({ name: '', category: 'Stationery', quantity: '', price: '', staff: '' });

  const fetchItems = async () => {
    setLoading(true);
    try {
      const snap = await getDocs(collection(db, 'inventory'));
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'inventory'), {
        name: newItem.name, category: newItem.category,
        quantity: parseInt(newItem.quantity), sold: 0,
        price: parseFloat(newItem.price), staff: newItem.staff,
        createdAt: new Date().toISOString()
      });
      alert('✅ Inventory item saved successfully!');
      setShowAddModal(false);
      setNewItem({ name: '', category: 'Stationery', quantity: '', price: '', staff: '' });
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('❌ Failed to save inventory item: ' + e.message);
    }
  };

  const handleEditItem = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'inventory', editingItem.id), {
        name: editingItem.name, category: editingItem.category,
        quantity: parseInt(editingItem.quantity), sold: parseInt(editingItem.sold) || 0,
        price: parseFloat(editingItem.price), staff: editingItem.staff,
      });
      alert('✅ Inventory item updated successfully!');
      setEditingItem(null);
      fetchItems();
    } catch (e) {
      console.error(e);
      alert('❌ Failed to update inventory item: ' + e.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Remove this item?')) {
      try { 
        await deleteDoc(doc(db, 'inventory', id)); 
        fetchItems(); 
      } catch (e) { 
        console.error(e); 
        alert('❌ Failed to delete inventory item: ' + e.message);
      }
    }
  };

  const generatePDF = () => {
    const d = new jsPDF();
    d.text('Inventory & Stationery Report', 14, 15);
    autoTable(d, {
      head: [['Item', 'Category', 'Qty', 'Sold', 'Remaining', 'Price (N)', 'Staff']],
      body: filteredItems.map(i => [i.name, i.category, i.quantity, i.sold || 0, i.quantity - (i.sold || 0), i.price, i.staff]),
      startY: 20,
    });
    d.save('inventory_report.pdf');
  };

  const filteredItems = items.filter(i =>
    i.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.staff?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Dynamic stats
  const totalValue = items.reduce((s, i) => s + (parseFloat(i.price) || 0) * (parseInt(i.quantity) || 0), 0);
  const totalSold = items.reduce((s, i) => s + (parseInt(i.sold) || 0), 0);
  const lowCount = items.filter(i => (parseInt(i.quantity) - (parseInt(i.sold) || 0)) < 20).length;

  const fmt = n => n >= 1000000 ? `₦${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `₦${(n / 1000).toFixed(1)}K` : `₦${n}`;

  const inputStyle = { width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Inventory & <span className="text-gradient">Stationery</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Track school books, uniforms, and stationery items.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={generatePDF} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.25rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', cursor: 'pointer' }}>
            <Download size={18} /> Export PDF
          </button>
          <button className="btn-primary" onClick={() => setShowAddModal(true)}>
            <Plus size={20} /> Add New Item
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Total Stock Value', value: fmt(totalValue), icon: <Package color="var(--primary-color)" /> },
          { label: 'Total Items Sold', value: totalSold.toLocaleString(), icon: <CheckCircle color="var(--success)" /> },
          { label: 'Low Stock Alerts', value: `${lowCount} Item${lowCount !== 1 ? 's' : ''}`, icon: <AlertTriangle color="var(--error)" /> },
        ].map((s, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{s.label}</p>
              <h3 style={{ fontSize: '1.5rem' }}>{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem', position: 'relative', width: '350px' }}>
          <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
          <input type="text" placeholder="Search items or staff..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '0.6rem 0.75rem 0.6rem 2.2rem', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', color: 'white', outline: 'none' }} />
        </div>

        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading inventory...</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <Package size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>No inventory items yet. Click "Add New Item" to get started.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                  {['Item Name', 'Category', 'Price', 'Qty', 'Sold', 'Remaining', 'Staff', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '1rem' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => {
                  const remaining = (parseInt(item.quantity) || 0) - (parseInt(item.sold) || 0);
                  const isLow = remaining < 20;
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>{item.name}</td>
                      <td style={{ padding: '1rem' }}>{item.category}</td>
                      <td style={{ padding: '1rem' }}>₦{parseFloat(item.price).toLocaleString()}</td>
                      <td style={{ padding: '1rem' }}>{item.quantity}</td>
                      <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: '600' }}>{item.sold || 0}</td>
                      <td style={{ padding: '1rem', color: isLow ? 'var(--error)' : 'white', fontWeight: '700' }}>{remaining}</td>
                      <td style={{ padding: '1rem' }}><div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><User size={14} color="var(--text-muted)" />{item.staff}</div></td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.2rem 0.6rem', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', background: isLow ? 'rgba(239,68,68,0.1)' : 'rgba(16,185,129,0.1)', color: isLow ? 'var(--error)' : 'var(--success)' }}>
                          {isLow ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => setEditingItem({ ...item })} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer' }}><Edit2 size={15} /></button>
                          <button onClick={() => handleDelete(item.id)} style={{ background: 'transparent', border: 'none', color: 'var(--error)', cursor: 'pointer' }}><Trash2 size={15} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setShowAddModal(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1.5rem' }}>Add Inventory Item</h2>
            <form onSubmit={handleAddItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Item Name</label><input required type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category</label>
                <select value={newItem.category} onChange={e => setNewItem({ ...newItem, category: e.target.value })} style={inputStyle}>
                  {['Books', 'Apparel', 'Stationery', 'Bags', 'Equipment', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Quantity</label><input required type="number" min="0" value={newItem.quantity} onChange={e => setNewItem({ ...newItem, quantity: e.target.value })} style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Unit Price (₦)</label><input required type="number" min="0" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} style={inputStyle} /></div>
              </div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Staff In-Charge</label><input required type="text" value={newItem.staff} onChange={e => setNewItem({ ...newItem, staff: e.target.value })} style={inputStyle} /></div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>Save Item</button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingItem && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '450px', padding: '2rem', position: 'relative' }}>
            <button onClick={() => setEditingItem(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}><X size={24} /></button>
            <h2 style={{ marginBottom: '1.5rem' }}>Edit Item</h2>
            <form onSubmit={handleEditItem} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Item Name</label><input required type="text" value={editingItem.name} onChange={e => setEditingItem({ ...editingItem, name: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Category</label>
                <select value={editingItem.category} onChange={e => setEditingItem({ ...editingItem, category: e.target.value })} style={inputStyle}>
                  {['Books', 'Apparel', 'Stationery', 'Bags', 'Equipment', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Quantity</label><input required type="number" min="0" value={editingItem.quantity} onChange={e => setEditingItem({ ...editingItem, quantity: e.target.value })} style={inputStyle} /></div>
                <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Sold</label><input type="number" min="0" value={editingItem.sold || 0} onChange={e => setEditingItem({ ...editingItem, sold: e.target.value })} style={inputStyle} /></div>
              </div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Unit Price (₦)</label><input required type="number" min="0" value={editingItem.price} onChange={e => setEditingItem({ ...editingItem, price: e.target.value })} style={inputStyle} /></div>
              <div><label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Staff In-Charge</label><input required type="text" value={editingItem.staff} onChange={e => setEditingItem({ ...editingItem, staff: e.target.value })} style={inputStyle} /></div>
              <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', justifyContent: 'center' }}>Update Item</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
