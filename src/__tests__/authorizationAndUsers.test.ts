import { describe, it, expect, beforeEach } from 'vitest';
import { userService, INITIAL_USERS } from '../services/userService';
import { UserRole } from '../types/auth';

describe('Role-Based Authorization & User Management', () => {
  beforeEach(() => {
    userService.resetStorage();
  });

  it('initializes default users with super user admin / admin', () => {
    const users = userService.getUsers();
    expect(users.length).toBeGreaterThanOrEqual(4);

    const admin = users.find((u) => u.username === 'admin');
    expect(admin).toBeDefined();
    expect(admin?.role).toBe('admin');
    expect(admin?.password).toBe('admin');

    const doctor = users.find((u) => u.username === 'dr_sarah');
    expect(doctor).toBeDefined();
    expect(doctor?.role).toBe('doctor');

    const compounder = users.find((u) => u.username === 'compounder_raj');
    expect(compounder).toBeDefined();
    expect(compounder?.role).toBe('compounder');

    const labTech = users.find((u) => u.username === 'lab_elena');
    expect(labTech).toBeDefined();
    expect(labTech?.role).toBe('lab_technician');
  });

  it('authenticates valid credentials correctly for all roles', () => {
    // Admin
    const adminUser = userService.authenticate('admin', 'admin');
    expect(adminUser).not.toBeNull();
    expect(adminUser?.role).toBe('admin');

    // Doctor
    const doctorUser = userService.authenticate('dr_sarah', 'doctor123');
    expect(doctorUser).not.toBeNull();
    expect(doctorUser?.role).toBe('doctor');

    // Compounder
    const compounderUser = userService.authenticate('compounder_raj', 'comp123');
    expect(compounderUser).not.toBeNull();
    expect(compounderUser?.role).toBe('compounder');

    // Lab Technician
    const labUser = userService.authenticate('lab_elena', 'lab123');
    expect(labUser).not.toBeNull();
    expect(labUser?.role).toBe('lab_technician');
  });

  it('rejects incorrect passwords or invalid usernames', () => {
    expect(userService.authenticate('admin', 'wrongpass')).toBeNull();
    expect(userService.authenticate('nonexistent', 'admin')).toBeNull();
    expect(userService.authenticate('dr_sarah', 'wrongpass')).toBeNull();
  });

  it('enforces role-based permissions correctly', () => {
    const adminPerms = userService.getRolePermissions('admin');
    expect(adminPerms.canManageUsers).toBe(true);
    expect(adminPerms.canSignEncounters).toBe(true);
    expect(adminPerms.canPrescribeMeds).toBe(true);
    expect(adminPerms.canEditLabs).toBe(true);
    expect(adminPerms.canRecordVitals).toBe(true);

    const doctorPerms = userService.getRolePermissions('doctor');
    expect(doctorPerms.canManageUsers).toBe(false); // Doctor cannot manage application users
    expect(doctorPerms.canSignEncounters).toBe(true);
    expect(doctorPerms.canPrescribeMeds).toBe(true);
    expect(doctorPerms.canEditLabs).toBe(true);

    const compounderPerms = userService.getRolePermissions('compounder');
    expect(compounderPerms.canManageUsers).toBe(false);
    expect(compounderPerms.canSignEncounters).toBe(false); // Compounder cannot sign encounters
    expect(compounderPerms.canPrescribeMeds).toBe(false);
    expect(compounderPerms.canDispenseMeds).toBe(true);
    expect(compounderPerms.canRecordVitals).toBe(true);
    expect(compounderPerms.canManageQueue).toBe(true);

    const labPerms = userService.getRolePermissions('lab_technician');
    expect(labPerms.canManageUsers).toBe(false);
    expect(labPerms.canSignEncounters).toBe(false);
    expect(labPerms.canPrescribeMeds).toBe(false);
    expect(labPerms.canEditLabs).toBe(true);
  });

  it('allows creating a new user and prevents duplicate usernames', () => {
    const newUser = userService.createUser({
      username: 'nurse_amy',
      password: 'password123',
      displayName: 'Amy Pond, RN',
      role: 'compounder',
      email: 'amy@cascade-ehr.internal',
      department: 'Urgent Care Triage',
    });

    expect(newUser.id).toBeDefined();
    expect(newUser.username).toBe('nurse_amy');
    expect(newUser.role).toBe('compounder');

    expect(() =>
      userService.createUser({
        username: 'nurse_amy',
        password: 'password456',
        displayName: 'Another Amy',
        role: 'compounder',
        email: 'amy2@cascade-ehr.internal',
        department: 'Triage',
      })
    ).toThrow(/already taken/);
  });

  it('prevents deletion of the primary super user (admin)', () => {
    const admin = userService.getUsers().find((u) => u.username === 'admin');
    expect(admin).toBeDefined();

    expect(() => userService.deleteUser(admin!.id)).toThrow(
      /super user \(admin\) cannot be deleted/
    );
  });

  it('supports updating password for an existing user account', () => {
    const doctor = userService.getUsers().find((u) => u.username === 'dr_sarah');
    expect(doctor).toBeDefined();

    userService.resetPassword(doctor!.id, 'newDocPass2026!');
    const reAuth = userService.authenticate('dr_sarah', 'newDocPass2026!');
    expect(reAuth).not.toBeNull();
  });
});
