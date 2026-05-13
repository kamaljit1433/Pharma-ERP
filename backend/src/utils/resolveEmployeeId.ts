import { Knex } from 'knex';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Accepts either a UUID primary key or a business employee_id string (e.g. "EMP001")
 * and returns the UUID primary key. Returns null when no matching employee is found.
 */
export async function resolveEmployeeUUID(db: Knex, employeeId: string): Promise<string | null> {
  if (UUID_PATTERN.test(employeeId)) return employeeId;
  const emp = await db('employees').where('employee_id', employeeId).select('id').first();
  return emp ? emp.id : null;
}
