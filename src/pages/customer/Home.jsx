import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import CustomerLayout from '../../components/CustomerLayout';
import API from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const CustomerHome = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, ordersRes] = await Promise.all([
          API.get('/menu'),
          API.get('/orders/myorders'),
        ]);
        setMenuItems(menuRes.data.data.slice(0, 6));
        setOrders(ordersRes.data.data.slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeOrder = orders.find((o) =>
    ['pending', 'confirmed', 'in-progress', 'ready'].includes(o.status)
  );

  const statusColors = {
    pending: 'bg-yellow-500/10 text-yellow-400',
    confirmed: 'bg-blue-500/10 text-blue-400',
    'in-progress': 'bg-purple-500/10 text-purple-400',
    ready: 'bg-green-500/10 text-green-400',
    delivered: 'bg-gray-500/10 text-gray-400',
    cancelled: 'bg-red-500/10 text-red-400',
  };

  return (
    <CustomerLayout>
      <div className="space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-orange-500/20 to-orange-600/5 rounded-2xl p-6 border border-orange-500/20"
        >
          <h2 className="text-2xl font-bold text-white">
            Welcome back, {user?.name?.split(' ')[0]}! 
          </h2>
          <p className="text-gray-400 mt-1">
            What would you like to order today?
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/customer/menu')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition"
          >
            Browse Menu
          </motion.button>
        </motion.div>

        {/* Active order tracker */}
        {activeOrder && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 rounded-2xl border border-gray-800 p-5"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Active Order</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColors[activeOrder.status]}`}>
                {activeOrder.status}
              </span>
            </div>

            {/* Progress bar */}
            <div className="flex items-center gap-2 mb-4">
              {['pending', 'confirmed', 'in-progress', 'ready', 'delivered'].map((s, i) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div className={`h-2 flex-1 rounded-full transition-all ${
                    ['pending', 'confirmed', 'in-progress', 'ready', 'delivered']
                      .indexOf(activeOrder.status) >= i
                      ? 'bg-orange-500'
                      : 'bg-gray-700'
                  }`} />
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-gray-400">
                  {activeOrder.items?.length} item(s) · {activeOrder.orderType}
                </p>
                <p className="text-orange-400 font-semibold mt-0.5">
                  ₦{activeOrder.totalAmount?.toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => navigate('/customer/orders')}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                View Details
              </button>
            </div>
          </motion.div>
        )}

        {/* Quick actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Order Food', icon: '🍽️', path: '/customer/menu', color: 'bg-orange-500/10 border-orange-500/20' },
            { label: 'Reserve Table', icon: '📅', path: '/customer/reservations', color: 'bg-blue-500/10 border-blue-500/20' },
            { label: 'My Orders', icon: '🧾', path: '/customer/orders', color: 'bg-purple-500/10 border-purple-500/20' },
            { label: 'My Profile', icon: '👤', path: '/customer/profile', color: 'bg-green-500/10 border-green-500/20' },
          ].map((action) => (
            <motion.button
              key={action.path}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate(action.path)}
              className={`rounded-2xl border p-4 text-center transition ${action.color}`}
            >
              <span className="text-3xl">{action.icon}</span>
              <p className="text-white text-sm font-medium mt-2">{action.label}</p>
            </motion.button>
          ))}
        </div>

        {/* Featured menu items */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-lg">Featured Items</h3>
            <button
              onClick={() => navigate('/customer/menu')}
              className="text-orange-400 text-sm hover:text-orange-300 transition"
            >
              See all
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {menuItems.map((item, i) => (
                <motion.div
                  key={item._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => navigate('/customer/menu')}
                  className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden cursor-pointer"
                >
                  {item.image?.url ? (
                    <img
                      src={item.image.url}
                      alt={item.name}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-800 flex items-center justify-center text-4xl">
                      🍽️
                    </div>
                  )}
                  <div className="p-3">
                    <p className="text-white text-sm font-medium truncate">{item.name}</p>
                    <p className="text-orange-400 text-sm font-bold mt-1">
                      ₦{item.price?.toLocaleString()}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Recent orders */}
        {orders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold text-lg">Recent Orders</h3>
              <button
                onClick={() => navigate('/customer/orders')}
                className="text-orange-400 text-sm hover:text-orange-300 transition"
              >
                See all
              </button>
            </div>
            <div className="space-y-3">
              {orders.map((order) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-gray-900 rounded-xl border border-gray-800 px-4 py-3 flex items-center justify-between"
                >
                  <div>
                    <p className="text-white text-sm font-medium capitalize">
                      {order.orderType}
                    </p>
                    <p className="text-gray-500 text-xs mt-0.5">
                      {order.items?.length} item(s) · {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-orange-400 text-sm font-semibold">
                      ₦{order.totalAmount?.toLocaleString()}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${statusColors[order.status]}`}>
                      {order.status}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </CustomerLayout>
  );
};

export default CustomerHome;