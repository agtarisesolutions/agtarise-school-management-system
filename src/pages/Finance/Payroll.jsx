import React, { useState } from 'react';
import { Wallet, DollarSign, Download, CheckCircle, Clock, AlertCircle, Plus, Search, X, Printer } from 'lucide-react';
import jsPDF from 'jsPDF';
import 'jspdf-autotable';

const Payroll = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPayslip, setSelectedPayslip] = useState(null);
  const [payrollData, setPayrollData] = useState([
    { id: 'PAY001', name: 'Dr. Smith', baseSalary: '₦450,000', allowances: '₦50,000', tax: '₦45,000', netPay: '₦455,000', status: 'Paid' },
    { id: 'PAY002', name: 'Mrs. Adebayo', baseSalary: '₦250,000', allowances: '₦20,000', tax: '₦25,000', netPay: '₦245,000', status: 'Paid' },
    { id: 'PAY003', name: 'Mr. Okoro', baseSalary: '₦220,000', allowances: '₦15,000', tax: '₦22,000', netPay: '₦213,000', status: 'Pending' },
    { id: 'PAY004', name: 'Miss Chima', baseSalary: '₦210,000', allowances: '₦15,000', tax: '₦21,000', netPay: '₦204,000', status: 'Paid' },
    { id: 'PAY005', name: 'Mr. Yusuf', baseSalary: '₦300,000', allowances: '₦30,000', tax: '₦30,000', netPay: '₦300,000', status: 'Pending' },
  ]);

  const handleDisburse = () => {
    if (window.confirm("Are you sure you want to disburse salaries for the remaining 2 staff members?")) {
      setPayrollData(payrollData.map(p => ({ ...p, status: 'Paid' })));
      alert("Salaries disbursed successfully!");
    }
  };

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.text('Staff Payroll Report - April 2026', 14, 15);
    const tableData = payrollData.map(p => [
      p.name, 
      p.baseSalary.replace('₦', 'N'), 
      p.allowances.replace('₦', 'N'), 
      p.tax.replace('₦', 'N'), 
      p.netPay.replace('₦', 'N'), 
      p.status
    ]);
    doc.autoTable({
      head: [['Staff Name', 'Base Salary', 'Allowances', 'Tax/Deductions', 'Net Pay', 'Status']],
      body: tableData,
      startY: 20,
    });
    doc.save('payroll_report_april_2026.pdf');
  };

  const handlePrintPayslip = (slip) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Payslip - ${slip.name}</title>
          <style>
            body {
              font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
              padding: 40px;
              color: #1e293b;
              background-color: #ffffff;
            }
            .payslip-container {
              max-width: 600px;
              margin: 0 auto;
              border: 1px solid #e2e8f0;
              padding: 30px;
              border-radius: 8px;
              box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 2px solid #6366f1;
              padding-bottom: 20px;
            }
            .header h1 {
              margin: 0;
              font-size: 24px;
              color: #4f46e5;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .header p {
              margin: 5px 0 0;
              color: #64748b;
              font-size: 14px;
            }
            .details {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
              font-size: 14px;
            }
            .details p {
              margin: 6px 0;
            }
            .details strong {
              color: #0f172a;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 30px;
            }
            th, td {
              padding: 12px;
              border-bottom: 1px solid #e2e8f0;
              text-align: left;
              font-size: 14px;
            }
            th {
              background-color: #f1f5f9;
              font-weight: 600;
              color: #475569;
            }
            .text-right {
              text-align: right;
            }
            .earnings {
              color: #16a34a;
            }
            .deductions {
              color: #dc2626;
            }
            .net-pay-row {
              background-color: #f8fafc;
              font-size: 16px;
              font-weight: 700;
              border-top: 2px solid #e2e8f0;
              border-bottom: 2px solid #e2e8f0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              font-size: 12px;
              color: #94a3b8;
              border-top: 1px dashed #e2e8f0;
              padding-top: 20px;
            }
            @media print {
              body {
                padding: 0;
                background-color: transparent;
              }
              .payslip-container {
                border: none;
                box-shadow: none;
                padding: 0;
                max-width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="payslip-container">
            <div class="header">
              <h1>Agtarise Solutions School</h1>
              <p>Official Staff Salary Payslip</p>
            </div>
            <div class="details">
              <div>
                <p><strong>Staff Name:</strong> ${slip.name}</p>
                <p><strong>Staff ID:</strong> ${slip.id}</p>
              </div>
              <div class="text-right">
                <p><strong>Pay Period:</strong> April 2026</p>
                <p><strong>Status:</strong> ${slip.status}</p>
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Base Salary</td>
                  <td class="text-right">${slip.baseSalary}</td>
                </tr>
                <tr>
                  <td class="earnings">Allowances</td>
                  <td class="text-right earnings">+ ${slip.allowances}</td>
                </tr>
                <tr>
                  <td class="deductions">Tax / Deductions</td>
                  <td class="text-right deductions">- ${slip.tax}</td>
                </tr>
                <tr class="net-pay-row">
                  <td>Net Pay</td>
                  <td class="text-right" style="color: #4f46e5;">${slip.netPay}</td>
                </tr>
              </tbody>
            </table>
            <div class="footer">
              <p>This is a system-generated document. No signature required.</p>
              <p style="margin-top: 5px; font-weight: 500;">© 2026 Agtarise Solutions. All rights reserved.</p>
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const filteredPayroll = payrollData.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: '₦1.4M',
    pendingCount: payrollData.filter(p => p.status === 'Pending').length
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
          <button className="btn-primary" onClick={handleDisburse}>
            <Wallet size={18} /> Disburse Salaries
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        {[
          { label: 'Total Payroll', value: stats.total, icon: <DollarSign color="var(--primary-color)" />, status: 'Monthly' },
          { label: 'Disbursed', value: '₦904k', icon: <CheckCircle color="var(--success)" />, status: 'Calculated' },
          { label: 'Pending', value: stats.pendingCount, icon: <Clock color="var(--warning)" />, status: 'Staff' },
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
            {filteredPayroll.map((row) => (
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
                  <button onClick={() => setSelectedPayslip(row)} style={{ background: 'transparent', border: 'none', color: 'var(--primary-color)', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>Pay Slip</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedPayslip && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="glass-card" style={{ width: '90%', maxWidth: '500px', padding: '2rem', position: 'relative', border: '1px solid rgba(255,255,255,0.1)' }}>
            <button onClick={() => setSelectedPayslip(null)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
              <X size={24} />
            </button>
            
            <div style={{ textAlign: 'center', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>Agtarise Solutions School</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>STAFF SALARY PAYSLIP</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
              <div>
                <p style={{ margin: '0.3rem 0' }}><span style={{ color: 'var(--text-muted)' }}>Staff Name:</span> <strong style={{ color: 'white' }}>{selectedPayslip.name}</strong></p>
                <p style={{ margin: '0.3rem 0' }}><span style={{ color: 'var(--text-muted)' }}>Staff ID:</span> <strong style={{ color: 'white' }}>{selectedPayslip.id}</strong></p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ margin: '0.3rem 0' }}><span style={{ color: 'var(--text-muted)' }}>Pay Period:</span> <strong style={{ color: 'white' }}>April 2026</strong></p>
                <p style={{ margin: '0.3rem 0' }}><span style={{ color: 'var(--text-muted)' }}>Status:</span> <strong style={{ color: selectedPayslip.status === 'Paid' ? 'var(--success)' : 'var(--warning)' }}>{selectedPayslip.status}</strong></p>
              </div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Base Salary</span>
                <span style={{ color: 'white', fontWeight: '500' }}>{selectedPayslip.baseSalary}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Allowances</span>
                <span style={{ color: 'var(--success)', fontWeight: '500' }}>+ {selectedPayslip.allowances}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Tax & Deductions</span>
                <span style={{ color: 'var(--error)', fontWeight: '500' }}>- {selectedPayslip.tax}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0 0 0', marginTop: '0.25rem' }}>
                <strong style={{ fontSize: '1.1rem', color: 'white' }}>Net Pay</strong>
                <strong style={{ fontSize: '1.1rem', color: 'var(--primary-color)' }}>{selectedPayslip.netPay}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                onClick={() => handlePrintPayslip(selectedPayslip)} 
                className="btn-primary" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Printer size={16} /> Print Payslip
              </button>
              <button 
                onClick={() => setSelectedPayslip(null)} 
                style={{ 
                  padding: '0.75rem 1.25rem', 
                  background: 'var(--glass-bg)', 
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--radius-md)',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;
