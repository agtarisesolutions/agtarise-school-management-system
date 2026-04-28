import React from 'react';
import { Wallet, DollarSign, Download, CheckCircle, Clock, AlertCircle, Plus, Search } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const Payroll = () => {
  const payrollData = [
    { id: 'PAY001', name: 'Dr. Smith', baseSalary: '₦450,000', allowances: '₦50,000', tax: '₦45,000', netPay: '₦455,000', status: 'Paid' },
    { id: 'PAY002', name: 'Mrs. Adebayo', baseSalary: '₦250,000', allowances: '₦20,000', tax: '₦25,000', netPay: '₦245,000', status: 'Paid' },
    { id: 'PAY003', name: 'Mr. Okoro', baseSalary: '₦220,000', allowances: '₦15,000', tax: '₦22,000', netPay: '₦213,000', status: 'Pending' },
    { id: 'PAY004', name: 'Miss Chima', baseSalary: '₦210,000', allowances: '₦15,000', tax: '₦21,000', netPay: '₦204,000', status: 'Paid' },
    { id: 'PAY005', name: 'Mr. Yusuf', baseSalary: '₦300,000', allowances: '₦30,000', tax: '₦30,000', netPay: '₦300,000', status: 'Pending' },
  ];

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Staff Payroll Report - April 2026', 14, 15);
    const tableData = payrollData.map(p => [p.name, p.baseSalary, p.allowances, p.tax, p.netPay, p.status]);
    doc.autoTable({
      head: [['Staff Name', 'Base Salary', 'Allowances', 'Tax/Deductions', 'Net Pay', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save('payroll_report_april_2026.pdf');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Staff <span className="text-gradient">Payroll</span></h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage salaries, taxes, allowances, and payment disbursements.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button onClick={generatePDF} className="btn-primary" style={{ background: 'var(--glass-bg)', border: '1px solid var(--glass-border)', color: 'white' }}>
            <Download size={18} /> Export Payroll
          </button>
          <button className="btn-primary">
            <Wallet size={18} /> Disburse Salaries
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Total Payroll', value: '₦1.4M', icon: <DollarSign color="var(--primary-color)" />, status: 'Monthly' },
          { label: 'Disbursed', value: '₦904k', icon: <CheckCircle color="var(--success)" />, status: '65% Complete' },
          { label: 'Pending', value: '₦513k', icon: <Clock color="var(--warning)" />, status: '2 Staff' },
        ].map((stat, i) => (
          <div key={i} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ padding: '0.5rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px' }}>{stat.icon}</div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.status}</span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{stat.label}</p>
            <h3 style={{ fontSize: '1.75rem' }}>{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.25rem' }}>Staff Salary Records</h3>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
            <input 
              type="text" 
              placeholder="Search staff name..."
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem 0.5rem 2.2rem',
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                borderRadius: 'var(--radius-md)',
                color: 'white',
                outline: 'none',
                fontSize: '0.85rem'
              }}
            />
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: 'var(--text-muted)', borderBottom: '1px solid var(--glass-border)' }}>
              <th style={{ padding: '1rem' }}>Staff Name</th>
              <th style={{ padding: '1rem' }}>Base Salary</th>
              <th style={{ padding: '1rem' }}>Allowances</th>
              <th style={{ padding: '1rem' }}>Tax</th>
              <th style={{ padding: '1rem' }}>Net Pay</th>
              <th style={{ padding: '1rem' }}>Status</th>
              <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payrollData.map((row) => (
              <tr key={row.id} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '1rem', fontWeight: '600' }}>{row.name}</td>
                <td style={{ padding: '1rem' }}>{row.baseSalary}</td>
                <td style={{ padding: '1rem', color: 'var(--success)' }}>{row.allowances}</td>
                <td style={{ padding: '1rem', color: 'var(--error)' }}>{row.tax}</td>
                <td style={{ padding: '1rem', fontWeight: '700' }}>{row.netPay}</td>
                <td style={{ padding: '1rem' }}>
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.4rem',
                    color: row.status === 'Paid' ? 'var(--success)' : 'var(--warning)',
                    fontSize: '0.85rem'
                  }}>
                    {row.status === 'Paid' ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {row.status}
                  </div>
                </td>
                <td style={{ padding: '1rem', textAlign: 'right' }}>
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Pay Slip</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Payroll;
