import { createContext, useContext, useEffect, useState } from 'react';
import { baseUsers } from '../data/mockData.js';
import { getData, setData } from '../utils/storage.js';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => getData('user', null));
  const [users, setUsers] = useState(() => getData('users', baseUsers));

  useEffect(() => {
    setData('user', user);
  }, [user]);

  useEffect(() => {
    setData('users', users);
  }, [users]);

  // Cleanup effect: Remove temporary blob URLs that cannot persist across sessions
  useEffect(() => {
    const hasBlobs = users.some(u => u.profilePic?.startsWith('blob:'));
    if (hasBlobs) {
      setUsers(prev => prev.map(u => ({
        ...u,
        profilePic: u.profilePic?.startsWith('blob:') ? null : u.profilePic
      })));
    }
  }, []);

  const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
    return `u-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const persistUser = (nextUser) => {
    setUsers((prev) => {
      const existingIdx = prev.findIndex(
        (u) => u.email === nextUser.email && u.role === nextUser.role
      );
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = { ...prev[existingIdx], ...nextUser };
        return updated;
      }
      return [...prev, nextUser];
    });
    setUser(nextUser);
  };

  const login = ({ email, role, password }) => {
    // Strict Admin Policy - Master Admin can always log in
    if (role === 'Admin') {
      if (email !== 'admin@gmail.com') {
        return { success: false, message: 'Invalid administration login attempt.' };
      }
      if (password !== '123@#$80aA') {
        return { success: false, message: 'Incorrect administrator password.' };
      }
      // Admin credentials are correct - ensure admin exists in users array
      let adminUser = users.find((u) => u.email === 'admin@gmail.com' && u.role === 'Admin');
      if (!adminUser) {
        // Create the admin user if it doesn't exist
        adminUser = {
          id: 'u-admin',
          email: 'admin@gmail.com',
          role: 'Admin',
          username: 'Super Admin',
          password: '123@#$80aA'
        };
        setUsers((prev) => [...prev, adminUser]);
      }
      setUser(adminUser);
      return { success: true, user: adminUser, message: `Welcome back, Super Admin!` };
    }

    const existing = users.find((u) => u.email === email && u.role === role);
    if (existing) {
      // Basic password check for other roles if they have one set
      if (existing.password && password && existing.password !== password) {
        return { success: false, message: 'Invalid password. Please try again.' };
      }
      setUser(existing);
      return { success: true, user: existing, message: `Welcome back, ${email}!` };
    } else {
      const emailExists = users.some(u => u.email === email);
      if (emailExists) {
        return { success: false, message: `Incorrect role selected for this email.` };
      }
      return { success: false, message: 'Email not registered. Please sign up first.' };
    }
  };

  const register = ({ email, role, password, username }) => {
    if (role === 'Admin') {
      return { success: false, message: 'Self-registration for Admin accounts is restricted.' };
    }
    const existing = users.find((u) => u.email === email);
    if (existing) {
      return { success: false, message: 'An account with this email already exists. Please login instead.' };
    }
    const nextUser = { id: generateId(), email, role, password, username };
    persistUser(nextUser);
    return { success: true, user: nextUser, message: 'Account created successfully! You are now logged in.' };
  };

  const logout = () => setUser(null);

  const updateUser = (userId, updates) => {
    setUsers((prev) => {
      const updatedList = prev.map((u) => (u.id === userId ? { ...u, ...updates } : u));

      // If the current logged in user is being updated, sync the session state
      if (user && user.id === userId) {
        const updatedUser = updatedList.find(u => u.id === userId);
        setUser(updatedUser);
      }

      return updatedList;
    });
  };

  const changePassword = (userId, newPassword) => {
    updateUser(userId, { password: newPassword });
  };

  const deleteUser = (userId) => {
    const targetUser = users.find(u => u.id === userId);
    if (targetUser?.email === 'admin@gmail.com' && targetUser?.role === 'Admin') {
      alert('Security Alert: This master administrative account cannot be deleted.');
      return;
    }
    if (user?.id === userId) logout();
    setUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <AuthContext.Provider value={{ user, users, login, register, logout, deleteUser, updateUser, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

