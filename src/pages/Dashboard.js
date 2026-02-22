import React, { useEffect, useState } from 'react';
import { useAuth } from '../components/context/AuthContext';
import Tasks from './Tasks';  // ✅ Default import
import toast from 'react-hot-toast';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  // ✅ SAFE fetchTasks
  const fetchTasks = async () => {
    setLoading(true);
    try {
      // Tasks component fetches its own data
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      toast.error('Failed to load tasks');
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ✅ FIXED: SAFE user check + optional chaining
  if (!user) {
    return (
      <div className={styles.loading}>
        <p>Loading...</p>
      </div>
    );
  }

  // ✅ FIXED: Safe user.email with fallback
  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        {/* ✅ SAFE: user.email always protected */}
        <h1>Welcome back, {displayName}!</h1>
        <p>Manage your tasks</p>
      </div>
      
      {/* ✅ Tasks handles its own state */}
      <Tasks />
    </div>
  );
}
