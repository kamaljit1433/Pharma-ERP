import React from 'react';

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '32px', backgroundColor: '#ffffff', minHeight: '100vh' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '36px', fontWeight: 'bold', color: '#0a0a0a', marginBottom: '8px' }}>
          Employee Management System
        </h1>
        <p style={{ color: '#737373', fontSize: '16px' }}>
          Welcome to your comprehensive HR management dashboard
        </p>

        <hr style={{ margin: '32px 0', borderColor: '#e5e5e5' }} />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '32px' }}>
          <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', backgroundColor: '#fff' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#0a0a0a', marginBottom: '8px' }}>
              Total Employees
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0a0a0a' }}>1,234</div>
            <p style={{ fontSize: '12px', color: '#737373', marginTop: '4px' }}>
              <span style={{ color: '#16A34A' }}>+12%</span> from last month
            </p>
          </div>

          <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', backgroundColor: '#fff' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#0a0a0a', marginBottom: '8px' }}>
              Present Today
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0a0a0a' }}>1,156</div>
            <p style={{ fontSize: '12px', color: '#737373', marginTop: '4px' }}>
              93.7% attendance rate
            </p>
          </div>

          <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', backgroundColor: '#fff' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#0a0a0a', marginBottom: '8px' }}>
              Leave Requests
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0a0a0a' }}>23</div>
            <p style={{ fontSize: '12px', color: '#737373', marginTop: '4px' }}>
              Pending approval
            </p>
          </div>

          <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '16px', backgroundColor: '#fff' }}>
            <div style={{ fontSize: '14px', fontWeight: '500', color: '#0a0a0a', marginBottom: '8px' }}>
              Payroll Status
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0a0a0a' }}>Processed</div>
            <p style={{ fontSize: '12px', color: '#737373', marginTop: '4px' }}>
              For March 2026
            </p>
          </div>
        </div>

        <div style={{ border: '1px solid #e5e5e5', borderRadius: '8px', padding: '24px', backgroundColor: '#fff' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#0a0a0a', marginBottom: '4px' }}>
            Status Indicators
          </h2>
          <p style={{ fontSize: '14px', color: '#737373', marginBottom: '20px' }}>
            Monochromatic theme with semantic accent colors
          </p>

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#0a0a0a', marginBottom: '12px' }}>
              Attendance Status
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#16A34A', color: '#fafafa', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                ✓ Present
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#E11D48', color: '#fafafa', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                ✗ Absent
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#F59E0B', color: '#171717', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                ⚠ Half-Day
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#3B82F6', color: '#fafafa', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                On Leave
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#f5f5f5', color: '#171717', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                Holiday
              </span>
            </div>
          </div>

          <hr style={{ margin: '20px 0', borderColor: '#e5e5e5' }} />

          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#0a0a0a', marginBottom: '12px' }}>
              Leave Status
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#FB923C', color: '#171717', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                Pending
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#10B981', color: '#fafafa', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                Approved
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#E11D48', color: '#fafafa', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                Rejected
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#f5f5f5', color: '#171717', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                Cancelled
              </span>
            </div>
          </div>

          <hr style={{ margin: '20px 0', borderColor: '#e5e5e5' }} />

          <div>
            <h3 style={{ fontSize: '14px', fontWeight: '500', color: '#0a0a0a', marginBottom: '12px' }}>
              Employee Status
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#16A34A', color: '#fafafa', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                Active
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#3B82F6', color: '#fafafa', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                On Leave
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#F59E0B', color: '#171717', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                Suspended
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#f5f5f5', color: '#171717', border: '1px solid #e5e5e5', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                Resigned
              </span>
              <span style={{ display: 'inline-block', padding: '6px 12px', backgroundColor: '#EF4444', color: '#fafafa', borderRadius: '6px', fontSize: '13px', fontWeight: '500' }}>
                Terminated
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
