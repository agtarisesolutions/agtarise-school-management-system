import React, { useState } from 'react';
import { Package, Plus, Search, Filter, AlertTriangle, CheckCircle, Download, User } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Inventory = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const inventoryItems = [
    { id: 'INV001', name: 'Mathematics Textbook (SS3)', category: 'Books', quantity: 150, sold: 120, price: '₦4,500', staff: 'Mrs. Adebayo' },
    { id: 'INV002', name: 'School Uniform (Junior)', category: 'Apparel', quantity: 200, sold: 185, price: '₦8,500', staff: 'Mr. Yusuf' },
    { id: 'INV003', name: 'A4 Exercise Books (60 Leaves)', category: 'Stationery', quantity: 1000, sold: 850, price: '₦250', staff: 'Mr. Yusuf' },
    { id: 'INV004', name: 'Geometry Set', category: 'Stationery', quantity: 100, sold: 95, price: '₦1,200', staff: 'Mrs. Adebayo' },
    { id: 'INV005', name: 'School Bag (Premium)', category: 'Bags', quantity: 50, sold: 10, price: '₦12,000', staff: 'Mr. Yusuf' },
  ];

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Inventory & Stationery Report', 14, 15);
    const tableData = inventoryItems.map(item => [
      item.name, 
      item.category, 
      item.quantity, 
      item.sold, 
      item.quantity - item.sold, 
      item.price,
      item.staff
    ]);
    doc.autoTable({
      head: [['Item Name', 'Category', 'Initial Qty', 'Sold', 'Remaining', 'Price', 'Staff In-Charge']],
      body: tableData,
      startY: 20,
    });
    doc.save('inventory_report.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Inventory & <span className="text-gradient">Stationery</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Track school books, uniforms, and other stationery items.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={generatePDF} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.75rem 1.25rem', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            cursor: 'pointer'
          }}>
            <Download size={18} /> Export PDF
          </button>
          <button className="btn-primary">
            <Plus size={20} /> Add New Item
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Total Stock Value', value: '₦2.8M', icon: <Package color="var(--primary-color)" /> },
          { label: 'Items Sold (Term)', value: '1,260', icon: <CheckCircle color="var(--success)" /> },
          { label: 'Low Stock Alerts', value: '3 Items', icon: <AlertTriangle color="var(--error)" /> },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '12px' }}>
              {stat.icon}
            </div>
            <div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</p>
              <h3 style={{ fontSize: '1.5rem' }}>{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '350px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Search items or staff..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.6rem 0.75rem 0.6rem 2.2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                outline: 'none'
              }}
            />
          </div>
          <button style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            padding: '0.6rem 1rem', 
            background: 'var(--glass-bg)', 
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--radius-md)',
            color: 'white',
            cursor: 'pointer'
          }}>
            <Filter size={16} /> Category
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '1rem' }}>Item Name</th>
                <th style={{ padding: '1rem' }}>Category</th>
                <th style={{ padding: '1rem' }}>Price</th>
                <th style={{ padding: '1rem' }}>Initial Qty</th>
                <th style={{ padding: '1rem' }}>Sold</th>
                <th style={{ padding: '1rem' }}>Remaining</th>
                <th style={{ padding: '1rem' }}>Staff In-Charge</th>
                <th style={{ padding: '1rem' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item) => {
                const remaining = item.quantity - item.sold;
                const isLow = remaining < 20;
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                    <td style={{ padding: '1rem', fontWeight: '600' }}>{item.name}</td>
                    <td style={{ padding: '1rem' }}>{item.category}</td>
                    <td style={{ padding: '1rem' }}>{item.price}</td>
                    <td style={{ padding: '1rem' }}>{item.quantity}</td>
                    <td style={{ padding: '1rem', color: 'var(--success)', fontWeight: '600' }}>{item.sold}</td>
                    <td style={{ padding: '1rem', color: isLow ? 'var(--error)' : 'white', fontWeight: '700' }}>
                      {remaining}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <User size={14} color="var(--text-muted)" />
                        {item.staff}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.2rem 0.6rem', 
                        borderRadius: 'var(--radius-full)', 
                        fontSize: '0.75rem',
                        background: isLow ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                        color: isLow ? 'var(--error)' : 'var(--success)'
                      }}>
                        {isLow ? 'Low Stock' : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
