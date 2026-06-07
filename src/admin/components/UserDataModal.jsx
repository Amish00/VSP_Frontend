import React, { useState, useEffect } from 'react';
import { useSnackbar } from 'notistack';
import { userApi } from '../api/userApi';
import { ChevronDown } from 'lucide-react';

const UserDataModal = ({ isOpen, onClose, user, onUserUpdated, currentUserRole, currentUserId }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [formData, setFormData] = useState({ username: '', email: '', role: '', plan: '', status: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [profilePreview, setProfilePreview] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const isAdmin = currentUserRole === 'ADMIN';

  // Snackbar options (top-right)
  const snackbarOptions = {
    anchorOrigin: { vertical: 'top', horizontal: 'right' },
    autoHideDuration: 3000,
  };

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        role: user.role || '',
        plan: user.plan || '',
        status: user.status || 'ACTIVE',
      });
      setProfilePreview(user.profilePicture || '');
      setSelectedFile(null);
      setError('');
    }
  }, [user]);

  useEffect(() => {
    return () => {
      if (profilePreview && profilePreview.startsWith('blob:')) {
        URL.revokeObjectURL(profilePreview);
      }
    };
  }, [profilePreview]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (profilePreview && profilePreview.startsWith('blob:')) {
      URL.revokeObjectURL(profilePreview);
    }
    
    const localPreview = URL.createObjectURL(file);
    setProfilePreview(localPreview);
    setSelectedFile(file);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (selectedFile) {
        setUploading(true);
        const isEditingSelf = currentUserId === user.id;
        if (isAdmin && !isEditingSelf) {
          await userApi.uploadProfilePictureForUser(user.id, selectedFile);
        } else {
          await userApi.uploadProfilePicture(selectedFile);
        }
        setUploading(false);
        enqueueSnackbar('Profile picture updated', { variant: 'success', ...snackbarOptions });
      }
      
      const updated = await userApi.updateUser(user.id, formData);
      enqueueSnackbar('User updated successfully', { variant: 'success', ...snackbarOptions });
      
      onUserUpdated(updated);
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Update failed';
      setError(msg);
      enqueueSnackbar(msg, { variant: 'error', ...snackbarOptions });
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-bg-card border border-border rounded-2xl w-full max-w-lg p-6 shadow-xl">
        <h2 className="text-xl font-display font-bold text-text-primary mb-4">Edit User</h2>

        <div className="flex flex-col items-center mb-4">
          {profilePreview ? (
            <img src={profilePreview} alt="Profile" className="w-24 h-24 rounded-full object-cover mb-2" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-2">
              <span className="text-3xl text-primary">📷</span>
            </div>
          )}
          <label className="cursor-pointer bg-bg-el border border-border rounded-lg px-3 py-1.5 text-sm font-medium hover:bg-bg-el/70 transition">
            {uploading ? 'Uploading...' : 'Change Picture'}
            <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" disabled={uploading} />
          </label>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
            <input type="text" name="username" value={formData.username} onChange={handleChange} className="w-full px-3 py-2 rounded-lg border border-border bg-bg-el text-text-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">Email</label>
            <input type="email" name="email" value={formData.email} readOnly className="w-full px-3 py-2 rounded-lg border border-border bg-bg-el/50 text-text-muted cursor-not-allowed" />
          </div>

          {isAdmin && (
            <>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <div className="relative">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full appearance-none px-3 py-2 pr-10 rounded-lg border border-border bg-bg-el text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="VIEWER">Viewer</option>
                    <option value="CREATOR">Creator</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Plan</label>
                <div className="relative">
                  <select
                    name="plan"
                    value={formData.plan}
                    onChange={handleChange}
                    className="w-full appearance-none px-3 py-2 pr-10 rounded-lg border border-border bg-bg-el text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="FREE">Free</option>
                    <option value="VIEW">View</option>
                    <option value="CREATE">Create</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
                <div className="relative">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full appearance-none px-3 py-2 pr-10 rounded-lg border border-border bg-bg-el text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="BLOCKED">Blocked</option>
                    <option value="SUSPENDED">Suspended</option>
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
                </div>
              </div>
            </>
          )}

          {!isAdmin && (
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">Status</label>
              <input type="text" value={formData.status} disabled className="w-full px-3 py-2 rounded-lg border border-border bg-bg-el/50 text-text-muted" />
            </div>
          )}

          {error && <p className="text-danger text-sm">{error}</p>}
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:bg-bg-el transition">Cancel</button>
            <button type="submit" disabled={loading || uploading} className="px-4 py-2 rounded-lg bg-primary text-white font-semibold hover:bg-primary/90 transition disabled:opacity-50">
              {loading || uploading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserDataModal;