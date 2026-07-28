import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StaffLayout from '../../components/StaffLayout';
import API from '../../api/axios';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400',
  paid: 'bg-green-500/10 text-green-400',
  refunded: 'bg-blue-500/10 text-blue-400',
  failed: 'bg-red-500/10 text-red-400',
};

const GenerateBillModal = ({ onClose, onSaved, bills = [] }) => {
  const [orders, setOrders] = useState([]);
  const [form, setForm] = useState({
    orderId: '',
    discount: 0,
    tax: 0,
    tip: 0,
    paymentMethod: 'cash',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await API.get('/orders');
        const billedOrderIds = bills.map(bill =>
          bill.order?._id || bill.order || bill.orderId
        ).filter(Boolean);

        const unbilled = data.data.filter((o) =>
          !billedOrderIds.includes(o._id) && o.status !== 'cancelled'
        );
        setOrders(unbilled);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, [bills]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await API.post(`/billing/generate/${form.orderId}`, {
        discount: Number(form.discount),
        tax: Number(form.tax),
        tip: Number(form.tip),
        paymentMethod: form.paymentMethod,
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Generate Bill</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Select Order</label>
            <select
              value={form.orderId}
              onChange={(e) => setForm({ ...form, orderId: e.target.value })}
              required
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 text-sm"
            >
              <option value="">Select an order</option>
              {orders.map((o) => (
                <option key={o._id} value={o._id}>
                  {o.customer?.name} — ₦{o.totalAmount?.toLocaleString()} ({o.status})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Discount %</label>
              <input
                type="number"
                value={form.discount}
                onChange={(e) => setForm({ ...form, discount: e.target.value })}
                min="0"
                max="100"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tax %</label>
              <input
                type="number"
                value={form.tax}
                onChange={(e) => setForm({ ...form, tax: e.target.value })}
                min="0"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tip (₦)</label>
              <input
                type="number"
                value={form.tip}
                onChange={(e) => setForm({ ...form, tip: e.target.value })}
                min="0"
                className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-3 py-2.5 focus:outline-none focus:border-orange-500 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Payment Method</label>
            <select
              value={form.paymentMethod}
              onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2.5 focus:outline-none focus:border-orange-500 text-sm"
            >
              <option value="cash">Cash</option>
              <option value="card">Card</option>
              <option value="mobile">Mobile</option>
              <option value="transfer">Transfer</option>
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-700 text-gray-400 py-2.5 rounded-lg text-sm hover:bg-gray-800 transition"
            >
              Cancel
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Bill'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const BillModal = ({ bill, onClose, onUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayment = async () => {
    setLoading(true);
    setError('');
    try {
      await API.patch(`/billing/${bill._id}/pay`);
      onUpdated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 rounded-2xl p-6 w-full max-w-md border border-gray-800"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-white font-semibold text-lg">Bill Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Customer</span>
            <span className="text-white">{bill?.customer?.name || 'Guest'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Payment Method</span>
            <span className="text-white capitalize">{bill?.paymentMethod || 'cash'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[bill?.paymentStatus || 'pending']}`}>
              {bill?.paymentStatus}
            </span>
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-2">
            {bill.items?.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-gray-400">{item.name} x{item.quantity}</span>
                <span className="text-white">₦{item.subtotal?.toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Subtotal</span>
              <span className="text-white">₦{bill.subTotal?.toLocaleString()}</span>
            </div>
            {bill.discount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Discount</span>
                <span className="text-red-400">-{bill.discount}%</span>
              </div>
            )}
            {bill.tax > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tax</span>
                <span className="text-white">{bill.tax}%</span>
              </div>
            )}
            {bill.tip > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Tip</span>
                <span className="text-white">₦{bill.tip?.toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-gray-800">
              <span className="text-white">Total</span>
              <span className="text-orange-400 text-lg">
                ₦{bill.totalAmount?.toLocaleString()}
              </span>
            </div>
          </div>

          {bill.paymentStatus === 'pending' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-lg text-sm font-semibold transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Mark as Paid'}
            </motion.button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

const StaffBilling = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showGenerate, setShowGenerate] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBills = async () => {
    try {
      const { data } = await API.get('/billing');
      setBills(data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBills(); }, []);

  const filtered = filterStatus === 'all'
    ? bills
    : bills.filter((b) => b.paymentStatus === filterStatus);

  const totalRevenue = bills
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((acc, b) => acc + b.totalAmount, 0);

  const pendingCount = bills.filter((b) => b.paymentStatus === 'pending').length;

  return (
    <StaffLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Billing</h2>
            <p className="text-gray-400 text-sm mt-1">
              Revenue: <span className="text-orange-400 font-semibold">
                ₦{totalRevenue.toLocaleString()}
              </span>
              {pendingCount > 0 && (
                <span className="ml-2 text-yellow-400">· {pendingCount} pending</span>
              )}
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowGenerate(true)}
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            + Generate Bill
          </motion.button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {['all', 'pending', 'paid', 'refunded', 'failed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm transition capitalize ${
                filterStatus === s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
          </div>
        ) : (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-gray-400 text-sm px-6 py-4 font-medium">Customer</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4 font-medium">Subtotal</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4 font-medium">Discount</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4 font-medium">Total</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4 font-medium">Method</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4 font-medium">Status</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4 font-medium">Date</th>
                    <th className="text-left text-gray-400 text-sm px-6 py-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-gray-500 py-8 text-sm">
                        No bills found
                      </td>
                    </tr>
                  ) : (
                    filtered.map((bill) => (
                      <motion.tr
                        key={bill._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-800/50 transition"
                      >
                        <td className="px-6 py-4 text-white text-sm">
                          {bill.customer?.name}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          ₦{bill.subTotal?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm">
                          {bill.discount > 0 ? `${bill.discount}%` : '—'}
                        </td>
                        <td className="px-6 py-4 text-orange-400 text-sm font-semibold">
                          ₦{bill.totalAmount?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 text-gray-400 text-sm capitalize">
                          {bill?.paymentMethod || 'cash'}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColors[bill.paymentStatus]}`}>
                            {bill.paymentStatus}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">
                          {new Date(bill.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => setSelectedBill(bill)}
                            className="text-xs text-blue-400 hover:text-blue-300 transition"
                          >
                            View
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <AnimatePresence>
          {selectedBill && (
            <BillModal
              bill={selectedBill}
              onClose={() => setSelectedBill(null)}
              onUpdated={fetchBills}
            />
          )}
          {showGenerate && (
            <GenerateBillModal
              onClose={() => setShowGenerate(false)}
              onSaved={fetchBills}
              bills={bills}
            />
          )}
        </AnimatePresence>
      </div>
    </StaffLayout>
  );
};

export default StaffBilling;