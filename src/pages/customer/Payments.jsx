import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faMoneyBillWave, 
  faCreditCard, 
  faMobileScreenButton, 
  faBuildingColumns, 
  faCircleCheck,
  faXmark
} from '@fortawesome/free-solid-svg-icons';
import CustomerLayout from '../../components/CustomerLayout';
import API from '../../api/axios';

const statusColors = {
  pending: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  paid: 'bg-green-500/10 text-green-400 border-green-500/30',
  refunded: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  failed: 'bg-red-500/10 text-red-400 border-red-500/30',
};

const PaymentModal = ({ bill, onClose, onPaid }) => {
  const [method, setMethod] = useState('cash');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: faMoneyBillWave },
    { value: 'card', label: 'Card', icon: faCreditCard },
    { value: 'mobile', label: 'Mobile Transfer', icon: faMobileScreenButton },
    { value: 'transfer', label: 'Bank Transfer', icon: faBuildingColumns },
  ];

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await API.patch(`/billing/${bill._id}/pay`, { paymentMethod: method });
      setConfirmed(true);
      setTimeout(() => {
        onPaid();
        onClose();
      }, 2000);
    } catch (err) {
      console.error(err);
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
        {confirmed ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-6"
          >
            <div className="text-6xl text-green-400 mb-4">
              <FontAwesomeIcon icon={faCircleCheck} />
            </div>
            <h3 className="text-white font-bold text-xl">Payment Confirmed!</h3>
            <p className="text-gray-400 text-sm mt-2">
              Your payment of <span className="text-orange-400 font-semibold">
                ₦{bill.totalAmount?.toLocaleString()}
              </span> has been received.
            </p>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white font-semibold text-lg">Pay Bill</h3>
              <button onClick={onClose} className="text-gray-400 hover:text-white text-lg">
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>

            {/* Bill summary */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6 space-y-2">
              <p className="text-gray-400 text-xs mb-3">BILL SUMMARY</p>
              {bill.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300">{item.name} x{item.quantity}</span>
                  <span className="text-white">₦{item.subtotal?.toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-gray-700 pt-2 space-y-1">
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
                <div className="flex justify-between font-bold pt-1">
                  <span className="text-white">Total</span>
                  <span className="text-orange-400 text-lg">
                    ₦{bill.totalAmount?.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-3">Select Payment Method</p>
              <div className="grid grid-cols-2 gap-3">
                {paymentMethods.map((m) => (
                  <motion.button
                    key={m.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setMethod(m.value)}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition ${
                      method === m.value
                        ? 'border-orange-500 bg-orange-500/10 text-white'
                        : 'border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600'
                    }`}
                  >
                    <span className={`text-xl ${method === m.value ? 'text-orange-400' : 'text-gray-400'}`}>
                      <FontAwesomeIcon icon={m.icon} />
                    </span>
                    <span className="text-sm font-medium">{m.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 border border-gray-700 text-gray-400 py-3 rounded-lg text-sm hover:bg-gray-800 transition"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg text-sm font-semibold transition disabled:opacity-50"
              >
                {loading ? 'Processing...' : `Pay ₦${bill.totalAmount?.toLocaleString()}`}
              </motion.button>
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
};

const CustomerPayments = () => {
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchBills = async () => {
    try {
      const { data } = await API.get('/billing/mybills');
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

  const pendingBills = bills.filter((b) => b.paymentStatus === 'pending');
  const totalSpent = bills
    .filter((b) => b.paymentStatus === 'paid')
    .reduce((acc, b) => acc + b.totalAmount, 0);

  return (
    <CustomerLayout>
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Payments</h2>
          <p className="text-gray-400 text-sm mt-1">
            Total spent: <span className="text-orange-400 font-semibold">
              ₦{totalSpent.toLocaleString()}
            </span>
          </p>
        </div>

        {/* Pending bill alert */}
        {pendingBills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-4 flex items-start gap-3"
          >
            <span className="text-yellow-400 text-base mt-0.5">
              <FontAwesomeIcon icon={faCreditCard} />
            </span>
            <div>
              <p className="text-yellow-400 font-semibold text-sm">
                You have {pendingBills.length} unpaid bill(s)
              </p>
              <p className="text-yellow-400/70 text-xs mt-1">
                Total due: ₦{pendingBills.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <p className="text-2xl font-bold text-orange-400">{bills.length}</p>
            <p className="text-gray-500 text-xs mt-1">Total Bills</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{pendingBills.length}</p>
            <p className="text-gray-500 text-xs mt-1">Pending</p>
          </div>
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-4 text-center">
            <p className="text-2xl font-bold text-green-400">
              {bills.filter((b) => b.paymentStatus === 'paid').length}
            </p>
            <p className="text-gray-500 text-xs mt-1">Paid</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {['all', 'pending', 'paid', 'refunded', 'failed'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-4 py-1.5 rounded-full text-sm transition capitalize whitespace-nowrap ${
                filterStatus === s
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Bills list */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 text-center">
            <p className="text-4xl text-gray-600 mb-4">
              <FontAwesomeIcon icon={faCreditCard} />
            </p>
            <p className="text-gray-400 font-medium">No bills yet</p>
            <p className="text-gray-600 text-sm mt-1">
              Your payment history will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((bill) => (
              <motion.div
                key={bill._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900 rounded-2xl border border-gray-800 p-5"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[bill?.paymentStatus || 'pending']}`}>
                        {bill?.paymentStatus}
                      </span>
                      <span className="text-gray-500 text-xs capitalize">
                        {bill?.paymentMethod || 'cash'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      {bill.items?.slice(0, 2).map((item, i) => (
                        <p key={i} className="text-white text-sm">
                          {item.name} x{item.quantity}
                        </p>
                      ))}
                      {bill.items?.length > 2 && (
                        <p className="text-gray-500 text-xs">
                          +{bill.items.length - 2} more items
                        </p>
                      )}
                    </div>
                    <p className="text-gray-500 text-xs">
                      {new Date(bill.createdAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="text-right space-y-2">
                    <p className="text-orange-400 font-bold text-lg">
                      ₦{bill.totalAmount?.toLocaleString()}
                    </p>
                    {bill.discount > 0 && (
                      <p className="text-red-400 text-xs">-{bill.discount}% discount</p>
                    )}
                    {bill.paymentStatus === 'pending' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setSelected(bill)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-xs font-semibold transition block"
                      >
                        Pay Now
                      </motion.button>
                    )}
                    {bill.paymentStatus === 'paid' && bill.paidAt && (
                      <p className="text-green-400 text-xs">
                        Paid {new Date(bill.paidAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <AnimatePresence>
          {selected && (
            <PaymentModal
              bill={selected}
              onClose={() => setSelected(null)}
              onPaid={fetchBills}
            />
          )}
        </AnimatePresence>
      </div>
    </CustomerLayout>
  );
};

export default CustomerPayments;