import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../api/axios';
 
const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [errorStatus, setErrorStatus] = useState(null);
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setErrorStatus(null);
 
    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 8) {
      return setError('Password must be at least 8 characters');
    }
 
    setLoading(true);
    try {
      await API.put(`/auth/reset-password/${token}`, {
        password: form.password,
      });
      setSuccess('Password reset successfully! Redirecting to sign in...');
      setTimeout(() => navigate('/login', { state: { passwordReset: true } }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.');
      setErrorStatus(err.response?.status || null);
    } finally {
      setLoading(false);
    }
  };
 
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-orange-500">StackDine</h1>
          <p className="text-gray-400 mt-2">Choose a new password</p>
        </div>
 
        <AnimatePresence>
          {success && (
            <motion.div
              key="success"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-green-500/10 border border-green-500/30 text-green-400 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              {success}
            </motion.div>
          )}
          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm"
            >
              {error}
              {/* If token is invalid, show link to request a new one */}
              {errorStatus === 400 && (
                <Link
                  to="/forgot-password"
                  className="block mt-2 text-orange-400 hover:text-orange-300 underline"
                >
                  Request a new reset link
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
 
        {!success && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm text-gray-400 mb-1">New Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
 
            <div>
              <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                required
                placeholder="••••••••"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 transition"
              />
            </div>
 
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || !!success}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </motion.button>
          </form>
        )}
 
        <p className="text-center text-gray-500 text-sm mt-6">
          <Link to="/forgot-password" className="text-orange-400 hover:text-orange-300">
            Request a new reset link
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
 
export default ResetPassword;