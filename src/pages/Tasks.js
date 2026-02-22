import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/context/AuthContext';
import { taskAPI } from '../components/services/api';
import toast from 'react-hot-toast';
import {
  Plus, Search, Trash2, Edit2, X, Check
} from 'lucide-react';
import styles from './Tasks.module.css';

const EMPTY_FORM = { title: '', description: '' };

export default function Tasks() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // ✅ ALWAYS ARRAY - Bulletproof initialization
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // ✅ PROTECTED ROUTE
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  const fetchTasks = useCallback(async () => {
  setLoading(true);
  try {
    const params = {};
    if (search) params.search = search;
    const res = await taskAPI.getAll(params);
    
    // ✅ FIXED: Backend returns array directly
    setTasks(Array.isArray(res.data) ? res.data : res); 
    console.log('✅ Fetched tasks:', res.data || res);
  } catch (error) {
    console.error('Fetch tasks error:', error);
    toast.error('Failed to load tasks');
    if (error.response?.status === 401) {
      logout();
    }
    setTasks([]);
  } finally {
    setLoading(false);
  }
}, [search, logout]);


  useEffect(() => { 
    fetchTasks(); 
  }, [fetchTasks]);

  useEffect(() => {
    if (searchParams.get('new') === '1') openModal();
  }, [searchParams]);

  const openModal = (task = null) => {
    setEditTask(task);
    setForm(task ? { 
      title: task.title || '', 
      description: task.description || '' 
    } : EMPTY_FORM);
    setErrors({});
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditTask(null);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Title is required';
    else if (form.title.length > 100) e.title = 'Max 100 characters';
    return e;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    try {
      if (editTask) {
        await taskAPI.update(editTask.id, form);
        toast.success('Task updated!');
      } else {
        await taskAPI.create(form);
        toast.success('Task created!');
      }
      closeModal();
      fetchTasks();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
      if (err.response?.status === 401) {
        logout();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    try {
      await taskAPI.delete(id);
      toast.success('Task deleted');
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch (err) {
      toast.error('Delete failed');
      if (err.response?.status === 401) logout();
    } finally {
      setDeleteId(null);
    }
  };

  const toggleDone = async (task) => {
    try {
      await taskAPI.update(task.id, { 
        ...task, 
        completed: !task.completed 
      });
      setTasks(prev => prev.map(t => 
        t.id === task.id ? { ...t, completed: !t.completed } : t
      ));
    } catch (err) {
      toast.error('Update failed');
      if (err.response?.status === 401) logout();
    }
  };

  // ✅ BULLETPROOF FILTER - NEVER crashes
  const filtered = Array.isArray(tasks) ? tasks.filter(t => {
    const q = search.toLowerCase();
    return !q || 
      t.title.toLowerCase().includes(q) || 
      (t.description || '').toLowerCase().includes(q);
  }) : [];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>My Tasks</h1>
          <p className={styles.subtitle}>{tasks.length} tasks total</p>
        </div>
        <button className={styles.newBtn} onClick={() => openModal()}>
          <Plus size={16} /> New Task
        </button>
      </div>

      {/* Search */}
      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <Search size={15} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Search tasks..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && <button className={styles.clearSearch} onClick={() => setSearch('')}><X size={14} /></button>}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <div className={styles.skeletons}>
          {[...Array(5)].map((_, i) => <div key={i} className={styles.skeleton} />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>
          <p style={{ fontSize: 32 }}>✓</p>
          <p>{tasks.length === 0 ? 'No tasks yet. Create your first!' : 'No tasks match search.'}</p>
          {tasks.length === 0 && (
            <button className={styles.emptyBtn} onClick={() => openModal()}>Create Task</button>
          )}
        </div>
      ) : (
        <div className={styles.taskGrid}>
          {filtered.map(task => {
            const isDone = task.completed;
            return (
              <div key={task.id} className={`${styles.taskCard} ${isDone ? styles.taskDone : ''}`}>
                <div className={styles.cardTop}>
                  <button
                    className={`${styles.checkBtn} ${isDone ? styles.checked : ''}`}
                    onClick={() => toggleDone(task)}
                    title={isDone ? 'Mark incomplete' : 'Mark complete'}
                  >
                    {isDone && <Check size={12} />}
                  </button>
                  <div className={styles.cardActions}>
                    <button className={styles.iconBtn} onClick={() => openModal(task)} title="Edit">
                      <Edit2 size={14} />
                    </button>
                    <button
                      className={`${styles.iconBtn} ${styles.deleteBtn}`}
                      onClick={() => handleDelete(task.id)}
                      disabled={deleteId === task.id}
                      title="Delete"
                    >
                      {deleteId === task.id ? <span className={styles.miniSpinner} /> : <Trash2 size={14} />}
                    </button>
                  </div>
                </div>

                <h3 className={`${styles.taskTitle} ${isDone ? styles.strikethrough : ''}`}>
                  {task.title}
                </h3>
                {task.description && (
                  <p className={styles.taskDesc}>{task.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>{editTask ? 'Edit Task' : 'New Task'}</h2>
              <button className={styles.closeBtn} onClick={closeModal}><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className={styles.modalForm} noValidate>
              <div className={styles.field}>
                <label className={styles.label}>Title *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  className={`${styles.input} ${errors.title ? styles.inputError : ''}`}
                  placeholder="What needs to be done?"
                  autoFocus
                  maxLength={100}
                />
                {errors.title && <span className={styles.error}>{errors.title}</span>}
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  className={styles.textarea}
                  placeholder="Add more details (optional)..."
                  rows={3}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={closeModal}>Cancel</button>
                <button type="submit" className={styles.saveBtn} disabled={submitting}>
                  {submitting ? <span className={styles.miniSpinner} /> : editTask ? 'Update Task' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
