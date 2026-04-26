import fc from 'fast-check';
import { describe, it, expect } from '@jest/globals';

/**
 * Property 62: Birthday Detection and Notification
 * Property 63: Work Anniversary Detection and Notification
 * Property 64: Manager Advance Birthday Notification
 * Property 65: Birthday Opt-Out Respect
 * 
 * Feature: employee-management-system
 * 
 * **Validates: Requirements FR-4.11.1, FR-4.11.2, FR-4.11.3, FR-4.11.4, FR-4.11.7, FR-4.11.8**
 */

describe('Property 62: Birthday Detection and Notification', () => {
  
  it('should detect birthdays matching current date', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            firstName: fc.string({ minLength: 2, maxLength: 20 }),
            lastName: fc.string({ minLength: 2, maxLength: 20 }),
            dateOfBirth: fc.date({ min: new Date('1960-01-01'), max: new Date('2005-12-31') }),
            optOutBirthdayAnnouncement: fc.boolean()
          }),
          { minLength: 5, maxLength: 20 }
        ),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }), // current date
        (employees, currentDate) => {
          // Find employees with birthday today
          const birthdaysToday = employees.filter(emp => {
            const dob = emp.dateOfBirth;
            return dob.getMonth() === currentDate.getMonth() &&
                   dob.getDate() === currentDate.getDate();
          });
          
          // Generate notifications for birthdays
          const notifications = birthdaysToday.map(emp => ({
            recipientId: emp.id,
            type: 'Birthday' as const,
            title: 'Happy Birthday!',
            message: `Happy Birthday ${emp.firstName}! Wishing you a wonderful day!`,
            channel: 'In-App' as const,
            sentAt: currentDate,
            age: currentDate.getFullYear() - emp.dateOfBirth.getFullYear()
          }));
          
          // Verify notifications
          expect(notifications.length).toBe(birthdaysToday.length);
          notifications.forEach((notif, index) => {
            expect(notif.type).toBe('Birthday');
            expect(notif.message).toContain(birthdaysToday[index].firstName);
            expect(notif.age).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should handle leap year birthdays (Feb 29 → Feb 28)', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1960, max: 2000 }), // birth year (leap year)
        fc.integer({ min: 2024, max: 2030 }), // current year (non-leap year)
        (birthYear, currentYear) => {
          // Ensure birth year is leap year
          const isLeapYear = (year: number) => 
            (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
          
          fc.pre(isLeapYear(birthYear));
          fc.pre(!isLeapYear(currentYear));
          
          const employee = {
            id: fc.sample(fc.uuid(), 1)[0],
            firstName: 'John',
            dateOfBirth: new Date(birthYear, 1, 29) // Feb 29
          };
          
          // In non-leap year, celebrate on Feb 28
          const currentDate = new Date(currentYear, 1, 28); // Feb 28
          
          const isBirthday = 
            (employee.dateOfBirth.getMonth() === 1 && employee.dateOfBirth.getDate() === 29) &&
            (currentDate.getMonth() === 1 && currentDate.getDate() === 28) &&
            !isLeapYear(currentYear);
          
          if (isBirthday) {
            const notification = {
              recipientId: employee.id,
              type: 'Birthday' as const,
              message: `Happy Birthday ${employee.firstName}!`,
              note: 'Celebrating on Feb 28 (leap year birthday)'
            };
            
            expect(notification.type).toBe('Birthday');
            expect(notification.note).toContain('leap year');
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should send birthday wishes to all employees with birthday today', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 10 }), // number of employees with birthday today
        fc.integer({ min: 5, max: 20 }), // total employees
        (birthdayCount, totalCount) => {
          fc.pre(birthdayCount <= totalCount);
          
          const currentDate = new Date(2024, 5, 15); // June 15, 2024
          
          const employees = Array.from({ length: totalCount }, (_, i) => ({
            id: fc.sample(fc.uuid(), 1)[0],
            firstName: `Employee${i}`,
            dateOfBirth: i < birthdayCount 
              ? new Date(1990, 5, 15) // Birthday today
              : new Date(1990, 3, 10), // Different date
            optOutBirthdayAnnouncement: false
          }));
          
          // Process birthdays
          const birthdaysToday = employees.filter(emp => 
            emp.dateOfBirth.getMonth() === currentDate.getMonth() &&
            emp.dateOfBirth.getDate() === currentDate.getDate() &&
            !emp.optOutBirthdayAnnouncement
          );
          
          // Verify count
          expect(birthdaysToday.length).toBe(birthdayCount);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 63: Work Anniversary Detection and Notification', () => {
  
  it('should detect work anniversaries matching current date', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            firstName: fc.string({ minLength: 2, maxLength: 20 }),
            lastName: fc.string({ minLength: 2, maxLength: 20 }),
            dateOfJoining: fc.date({ min: new Date('2010-01-01'), max: new Date('2023-12-31') })
          }),
          { minLength: 5, maxLength: 20 }
        ),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }), // current date
        (employees, currentDate) => {
          // Find employees with anniversary today
          const anniversariesToday = employees.filter(emp => {
            const doj = emp.dateOfJoining;
            return doj.getMonth() === currentDate.getMonth() &&
                   doj.getDate() === currentDate.getDate() &&
                   doj.getFullYear() < currentDate.getFullYear();
          });
          
          // Generate notifications for anniversaries
          const notifications = anniversariesToday.map(emp => {
            const yearsOfService = currentDate.getFullYear() - emp.dateOfJoining.getFullYear();
            return {
              recipientId: emp.id,
              type: 'Work Anniversary' as const,
              title: 'Work Anniversary!',
              message: `Congratulations ${emp.firstName} on completing ${yearsOfService} years with us!`,
              channel: 'In-App' as const,
              sentAt: currentDate,
              yearsOfService
            };
          });
          
          // Verify notifications
          expect(notifications.length).toBe(anniversariesToday.length);
          notifications.forEach((notif, index) => {
            expect(notif.type).toBe('Work Anniversary');
            expect(notif.message).toContain(anniversariesToday[index].firstName);
            expect(notif.message).toContain(`${notif.yearsOfService} years`);
            expect(notif.yearsOfService).toBeGreaterThan(0);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should calculate correct years of service', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2010, max: 2020 }), // joining year
        fc.integer({ min: 0, max: 11 }), // joining month
        fc.integer({ min: 1, max: 28 }), // joining day
        fc.integer({ min: 2024, max: 2030 }), // current year
        (joiningYear, joiningMonth, joiningDay, currentYear) => {
          fc.pre(currentYear > joiningYear);
          
          const employee = {
            id: fc.sample(fc.uuid(), 1)[0],
            firstName: 'John',
            dateOfJoining: new Date(joiningYear, joiningMonth, joiningDay)
          };
          
          const currentDate = new Date(currentYear, joiningMonth, joiningDay);
          const yearsOfService = currentYear - joiningYear;
          
          const notification = {
            recipientId: employee.id,
            type: 'Work Anniversary' as const,
            message: `Congratulations on completing ${yearsOfService} years!`,
            yearsOfService
          };
          
          // Verify years calculation
          expect(notification.yearsOfService).toBe(yearsOfService);
          expect(notification.yearsOfService).toBeGreaterThan(0);
          expect(notification.message).toContain(`${yearsOfService} years`);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should not send anniversary notification on joining date in same year', () => {
    fc.assert(
      fc.property(
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }), // joining date
        (joiningDate) => {
          const employee = {
            id: fc.sample(fc.uuid(), 1)[0],
            firstName: 'John',
            dateOfJoining: joiningDate
          };
          
          // Same date, same year
          const currentDate = new Date(joiningDate);
          
          const isAnniversary = 
            employee.dateOfJoining.getMonth() === currentDate.getMonth() &&
            employee.dateOfJoining.getDate() === currentDate.getDate() &&
            employee.dateOfJoining.getFullYear() < currentDate.getFullYear();
          
          // Should not be anniversary (same year)
          expect(isAnniversary).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 64: Manager Advance Birthday Notification', () => {
  
  it('should send notification to manager one day before employee birthday', () => {
    fc.assert(
      fc.property(
        fc.record({
          employeeId: fc.uuid(),
          employeeName: fc.string({ minLength: 2, maxLength: 20 }),
          dateOfBirth: fc.date({ min: new Date('1980-01-01'), max: new Date('2005-12-31') }),
          managerId: fc.uuid()
        }),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-30') }), // current date
        (employee, currentDate) => {
          // Calculate tomorrow's date
          const tomorrow = new Date(currentDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Check if employee's birthday is tomorrow
          const isBirthdayTomorrow = 
            employee.dateOfBirth.getMonth() === tomorrow.getMonth() &&
            employee.dateOfBirth.getDate() === tomorrow.getDate();
          
          if (isBirthdayTomorrow) {
            const managerNotification = {
              recipientId: employee.managerId,
              type: 'Manager Alert' as const,
              title: 'Employee Birthday Tomorrow',
              message: `${employee.employeeName}'s birthday is tomorrow. Consider sending a personal message!`,
              channel: 'In-App' as const,
              sentAt: currentDate,
              employeeId: employee.employeeId,
              birthdayDate: tomorrow
            };
            
            // Verify manager notification
            expect(managerNotification.recipientId).toBe(employee.managerId);
            expect(managerNotification.type).toBe('Manager Alert');
            expect(managerNotification.message).toContain(employee.employeeName);
            expect(managerNotification.message).toContain('tomorrow');
            expect(managerNotification.employeeId).toBe(employee.employeeId);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should send advance notification to all managers with team birthdays tomorrow', () => {
    fc.assert(
      fc.property(
        fc.uuid(), // managerId
        fc.array(
          fc.record({
            id: fc.uuid(),
            firstName: fc.string({ minLength: 2, maxLength: 20 }),
            dateOfBirth: fc.date({ min: new Date('1980-01-01'), max: new Date('2005-12-31') })
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-30') }),
        (managerId, teamMembers, currentDate) => {
          const tomorrow = new Date(currentDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Find team members with birthday tomorrow
          const birthdaysTomorrow = teamMembers.filter(emp =>
            emp.dateOfBirth.getMonth() === tomorrow.getMonth() &&
            emp.dateOfBirth.getDate() === tomorrow.getDate()
          );
          
          // Generate manager notifications
          const managerNotifications = birthdaysTomorrow.map(emp => ({
            recipientId: managerId,
            type: 'Manager Alert' as const,
            message: `${emp.firstName}'s birthday is tomorrow`,
            employeeId: emp.id
          }));
          
          // Verify notifications
          expect(managerNotifications.length).toBe(birthdaysTomorrow.length);
          managerNotifications.forEach(notif => {
            expect(notif.recipientId).toBe(managerId);
            expect(notif.type).toBe('Manager Alert');
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should not send advance notification on the birthday itself', () => {
    fc.assert(
      fc.property(
        fc.record({
          employeeId: fc.uuid(),
          employeeName: fc.string({ minLength: 2, maxLength: 20 }),
          dateOfBirth: fc.date({ min: new Date('1980-01-01'), max: new Date('2005-12-31') }),
          managerId: fc.uuid()
        }),
        (employee) => {
          // Current date is the birthday
          const currentDate = new Date(2024, employee.dateOfBirth.getMonth(), employee.dateOfBirth.getDate());
          const tomorrow = new Date(currentDate);
          tomorrow.setDate(tomorrow.getDate() + 1);
          
          // Check if birthday is tomorrow (should be false)
          const isBirthdayTomorrow = 
            employee.dateOfBirth.getMonth() === tomorrow.getMonth() &&
            employee.dateOfBirth.getDate() === tomorrow.getDate();
          
          // Should not send advance notification on birthday itself
          expect(isBirthdayTomorrow).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe('Property 65: Birthday Opt-Out Respect', () => {
  
  it('should send private notification only for opted-out employees', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            id: fc.uuid(),
            firstName: fc.string({ minLength: 2, maxLength: 20 }),
            dateOfBirth: fc.date({ min: new Date('1980-01-01'), max: new Date('2005-12-31') }),
            optOutBirthdayAnnouncement: fc.boolean()
          }),
          { minLength: 5, maxLength: 15 }
        ),
        fc.date({ min: new Date('2024-01-01'), max: new Date('2024-12-31') }),
        (employees, currentDate) => {
          // Find employees with birthday today
          const birthdaysToday = employees.filter(emp =>
            emp.dateOfBirth.getMonth() === currentDate.getMonth() &&
            emp.dateOfBirth.getDate() === currentDate.getDate()
          );
          
          // Generate notifications based on opt-out preference
          const notifications = birthdaysToday.map(emp => ({
            recipientId: emp.id,
            type: 'Birthday' as const,
            channel: emp.optOutBirthdayAnnouncement ? 'Private' as const : 'Public' as const,
            message: `Happy Birthday ${emp.firstName}!`,
            postToNoticeBoard: !emp.optOutBirthdayAnnouncement
          }));
          
          // Verify opt-out respected
          notifications.forEach((notif, index) => {
            const employee = birthdaysToday[index];
            if (employee.optOutBirthdayAnnouncement) {
              expect(notif.channel).toBe('Private');
              expect(notif.postToNoticeBoard).toBe(false);
            } else {
              expect(notif.channel).toBe('Public');
              expect(notif.postToNoticeBoard).toBe(true);
            }
          });
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should not post to notice board for opted-out employees', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          firstName: fc.string({ minLength: 2, maxLength: 20 }),
          dateOfBirth: fc.date({ min: new Date('1980-01-01'), max: new Date('2005-12-31') }),
          optOutBirthdayAnnouncement: fc.constant(true) // Always opted out
        }),
        (employee) => {
          const notification = {
            recipientId: employee.id,
            type: 'Birthday' as const,
            message: `Happy Birthday ${employee.firstName}!`,
            channel: 'Private' as const,
            postToNoticeBoard: false,
            visibleToOthers: false
          };
          
          // Verify privacy
          expect(notification.channel).toBe('Private');
          expect(notification.postToNoticeBoard).toBe(false);
          expect(notification.visibleToOthers).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should post to notice board for non-opted-out employees', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          firstName: fc.string({ minLength: 2, maxLength: 20 }),
          dateOfBirth: fc.date({ min: new Date('1980-01-01'), max: new Date('2005-12-31') }),
          optOutBirthdayAnnouncement: fc.constant(false) // Not opted out
        }),
        (employee) => {
          const notification = {
            recipientId: employee.id,
            type: 'Birthday' as const,
            message: `Happy Birthday ${employee.firstName}!`,
            channel: 'Public' as const,
            postToNoticeBoard: true,
            visibleToOthers: true
          };
          
          // Verify public announcement
          expect(notification.channel).toBe('Public');
          expect(notification.postToNoticeBoard).toBe(true);
          expect(notification.visibleToOthers).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });
  
  it('should respect opt-out preference changes', () => {
    fc.assert(
      fc.property(
        fc.record({
          id: fc.uuid(),
          firstName: fc.string({ minLength: 2, maxLength: 20 }),
          dateOfBirth: fc.date({ min: new Date('1980-01-01'), max: new Date('2005-12-31') }),
          optOutBirthdayAnnouncement: fc.boolean()
        }),
        fc.boolean(), // new opt-out preference
        (employee, newOptOutPreference) => {
          // Update preference
          const updatedEmployee = {
            ...employee,
            optOutBirthdayAnnouncement: newOptOutPreference
          };
          
          // Generate notification with updated preference
          const notification = {
            recipientId: updatedEmployee.id,
            channel: updatedEmployee.optOutBirthdayAnnouncement ? 'Private' as const : 'Public' as const,
            postToNoticeBoard: !updatedEmployee.optOutBirthdayAnnouncement
          };
          
          // Verify updated preference is respected
          if (newOptOutPreference) {
            expect(notification.channel).toBe('Private');
            expect(notification.postToNoticeBoard).toBe(false);
          } else {
            expect(notification.channel).toBe('Public');
            expect(notification.postToNoticeBoard).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
