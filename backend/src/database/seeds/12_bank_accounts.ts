import { Knex } from 'knex';

// One primary salary account per employee
// account_number_encrypted stores the raw number; the export layer masks it (shows last 4 digits)
const accounts = [
  { empId: 'e0000000-0000-0000-0000-000000000001', holder: 'Admin User',      bank: 'HDFC Bank',   account: '50100234567801', ifsc: 'HDFC0001234', type: 'salary'  },
  { empId: 'e0000000-0000-0000-0000-000000000002', holder: 'Sarah Johnson',   bank: 'ICICI Bank',  account: '12345678902345', ifsc: 'ICIC0002345', type: 'salary'  },
  { empId: 'e0000000-0000-0000-0000-000000000003', holder: 'Michael Chen',    bank: 'SBI',         account: '32198765430001', ifsc: 'SBIN0003456', type: 'savings' },
  { empId: 'e0000000-0000-0000-0000-000000000004', holder: 'Robert Martinez', bank: 'Axis Bank',   account: '91876543214567', ifsc: 'UTIB0004567', type: 'salary'  },
  { empId: 'e0000000-0000-0000-0000-000000000005', holder: 'Emily Davis',     bank: 'Kotak Bank',  account: '46751234560002', ifsc: 'KKBK0005678', type: 'savings' },
  { empId: 'e0000000-0000-0000-0000-000000000006', holder: 'John Doe',        bank: 'HDFC Bank',   account: '50100876543201', ifsc: 'HDFC0006789', type: 'salary'  },
  { empId: 'e0000000-0000-0000-0000-000000000007', holder: 'Jane Smith',      bank: 'ICICI Bank',  account: '12398765436789', ifsc: 'ICIC0007890', type: 'salary'  },
  { empId: 'e0000000-0000-0000-0000-000000000008', holder: 'Mike Johnson',    bank: 'SBI',         account: '32112345678901', ifsc: 'SBIN0008901', type: 'savings' },
  { empId: 'e0000000-0000-0000-0000-000000000009', holder: 'Sarah Williams',  bank: 'PNB',         account: '04519876543210', ifsc: 'PUNB0009012', type: 'savings' },
  { empId: 'e0000000-0000-0000-0000-000000000010', holder: 'David Brown',     bank: 'Axis Bank',   account: '91823456781234', ifsc: 'UTIB0010123', type: 'salary'  },
];

export async function seed(knex: Knex): Promise<void> {
  // Cascades to bank_account_audit_logs
  await knex('bank_accounts').del();

  await knex('bank_accounts').insert(
    accounts.map((a, idx) => ({
      id: `a2000000-0000-0000-0000-${String(idx + 1).padStart(12, '0')}`,
      employee_id: a.empId,
      account_holder_name: a.holder,
      bank_name: a.bank,
      account_number_encrypted: a.account,
      ifsc_code: a.ifsc,
      account_type: a.type,
      is_primary: true,
      verification_status: 'verified',
      verified_by: 'e0000000-0000-0000-0000-000000000001', // Admin verified
      verified_at: '2026-01-15 10:00:00',
    }))
  );

  console.log('Bank accounts seeded successfully');
}
