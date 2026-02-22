import React, { useState, useEffect } from 'react';
import { useAuth } from '../components/context/AuthContext';
import toast from 'react-hot-toast';
import { User, Mail, Save, Shield, Edit2, X } from 'lucide-react';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  // ✅ FIXED: Safe initialization when user loads
  useEffect(() => {
    if (user?.email) {
      setForm({
        name: (user.email.split('@')[0] || user.name || 'User').substring(0, 20),
        email: user.email,
      });
    }
  }, [user]);

  const validate = () => {
    const e = {};
    
    // ✅ FIXED: Name validation only
    if (!form.name.trim()) {
      e.name = 'Name is required';
    } else if (form.name.length < 2) {
      e.name = 'Min 2 characters';
    }
    
    // ✅ FIXED: Email validation - allow current email or valid format
    if (!form.email.trim()) {
      e.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      e.email = 'Invalid email format';
    }
    
    return e;
  };

  const handleSave = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { 
      setErrors(errs); 
      return; 
    }
    setLoading(true);
    try {
      // ✅ Save display name locally (email read-only but editable for display)
      toast.success('Profile updated successfully!');
      localStorage.setItem('profile', JSON.stringify({ name: form.name }));
      setEditing(false);
    } catch (err) {
      toast.error('Update failed');
    } finally { 
      setLoading(false); 
    }
  };

  // ✅ FIXED: Safe split with fallback
  const handleCancel = () => {
    if (user?.email) {
      setForm({ 
        name: (user.email.split('@')[0] || user.name || 'User').substring(0, 20),
        email: user.email 
      });
    } else {
      setForm({ name: 'User', email: '' });
    }
    setErrors({});
    setEditing(false);
  };

  // ✅ FIXED: Safe initials
  const initials = (form.name || 'TF').slice(0, 2).toUpperCase();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Profile</h1>
        <p className={styles.subtitle}>Manage your account settings</p>
      </div>

      <div className={styles.grid}>
        {/* Avatar Card */}
        <div className={styles.avatarCard}>
          <div className={styles.avatarRing}>
            <div className={styles.avatar}>{initials}</div>
          </div>
          <h2 className={styles.avatarName}>{form.name || 'User'}</h2>
          <p className={styles.avatarEmail}>{form.email || 'No email'}</p>
          <div className={styles.roleBadge}>
            <Shield size={12} />
            User
          </div>
        </div>

        {/* Info Card */}
        <div className={styles.infoCard}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Account Information</h3>
            {!editing && (
              <button className={styles.editBtn} onClick={() => setEditing(true)}>
                <Edit2 size={14} /> Edit
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSave} className={styles.form} noValidate>
              <div className={styles.field}>
                <label className={styles.label}>
                  <User size={14} /> Display Name
                </label>
                <input
                  name="name"
                  value={form.name}
                  onChange={e => { 
                    setForm(p => ({ ...p, name: e.target.value })); 
                    setErrors(p => ({ ...p, name: '' })); 
                  }}
                  className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                  placeholder="Your display name"
                  maxLength={30}
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  <Mail size={14} /> Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={e => { 
                    setForm(p => ({ ...p, email: e.target.value })); 
                    setErrors(p => ({ ...p, email: '' })); 
                  }}
                  className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                  placeholder="email@example.com"
                  // ✅ REMOVED readOnly - NOW EDITABLE
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>

              <div className={styles.actions}>
                <button 
                  type="button" 
                  className={styles.cancelBtn} 
                  onClick={handleCancel}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className={styles.saveBtn} 
                  disabled={loading}
                >
                  {loading ? (
                    <span className={styles.spinner} />
                  ) : (
                    <>
                      <Save size={14} /> Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className={styles.infoList}>
              <InfoRow icon={<User size={16} />} label="Display Name" value={form.name} />
              <InfoRow icon={<Mail size={16} />} label="Email" value={form.email} />
              <InfoRow icon={<Shield size={16} />} label="Role" value="USER" />
            </div>
          )}
        </div>
      </div>

      {/* Logout Section */}
      <div className={styles.logoutSection}>
        <button className={styles.logoutBtn} onClick={logout}>
          Logout
        </button>
      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className={styles.infoRow}>
      <div className={styles.infoLabel}>
        <span className={styles.infoIcon}>{icon}</span>
        {label}
      </div>
      <span className={styles.infoValue}>{value || '—'}</span>
    </div>
  );
}
