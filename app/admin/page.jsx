
'use client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { DollarSign, Users, ShoppingCart, Activity } from 'lucide-react';
import Footer from '@/components/admin/Footer';
import { useAppContext } from '@/context/AppContext';
import { useCollection } from '@/src/firebase';
import Loading from '@/components/Loading';
import { useMemo } from 'react';

const Card = ({ title, value, icon, change }) => (
    <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-lg sm:text-2xl font-bold text-gray-800">{value}</p>
        {change && <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>}
      </div>
      <div className="bg-orange-100 text-orange-600 p-2 sm:p-3 rounded-full">
        {icon}
      </div>
    </div>
);

const AdminDashboard = () => {
    const { currency } = useAppContext();
    const { data: allOrders, loading: ordersLoading } = useCollection('orders');
    const { data: users, loading: usersLoading } = useCollection('users');

    const loading = ordersLoading || usersLoading;

    const { totalRevenue, salesThisMonth, totalUsers, totalOrders, recentOrders, salesData, userData } = useMemo(() => {
        const _allOrders = allOrders || [];
        const _users = users || [];

        const totalRevenue = _allOrders.reduce((sum, order) => sum + order.amount, 0);
        const totalUsers = _users.length;
        const totalOrders = _allOrders.length;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const salesThisMonth = _allOrders.reduce((sum, order) => {
            const orderDate = order.date?.toDate();
            if (orderDate && orderDate.getMonth() === currentMonth && orderDate.getFullYear() === currentYear) {
                return sum + order.amount;
            }
            return sum;
        }, 0);

        const recentOrders = [..._allOrders]
            .sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0))
            .slice(0, 5)
            .map(o => ({...o, _id: o.id, date: o.date?.toDate()}));
        
        const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const salesData = monthNames.map(month => ({ name: month, sales: 0 }));
        
        const initialUserCounts = Array(12).fill(0);

        _allOrders.forEach(order => {
            const orderDate = order.date?.toDate();
            if (orderDate && orderDate.getFullYear() === currentYear) {
                const month = orderDate.getMonth();
                salesData[month].sales += order.amount;
            }
        });
        
        _users.forEach(user => {
            if (user.createdAt) {
                const creationDate = user.createdAt?.toDate ? user.createdAt.toDate() : new Date(user.createdAt);
                if (creationDate && creationDate.getFullYear() === currentYear) {
                    const month = creationDate.getMonth();
                    initialUserCounts[month] += 1;
                }
            }
        });

        const cumulativeUserCounts = initialUserCounts.reduce((acc, count) => {
            const lastTotal = acc.length > 0 ? acc[acc.length - 1] : 0;
            acc.push(lastTotal + count);
            return acc;
        }, []);

        const userData = monthNames.map((month, index) => ({
            name: month,
            users: cumulativeUserCounts[index] || 0
        }));

        return { totalRevenue, salesThisMonth, totalUsers, totalOrders, recentOrders, salesData, userData };
    }, [allOrders, users]);

    if (loading) {
        return <Loading />
    }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
       <div className="w-full p-4 md:p-10">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card title="Total Revenue" value={`${currency}${totalRevenue.toFixed(2)}`} icon={<DollarSign className="w-5 h-5 sm:w-6 sm:h-6" />} />
            <Card title="Sales (This Month)" value={`${currency}${salesThisMonth.toFixed(2)}`} icon={<Activity className="w-5 h-5 sm:w-6 sm:h-6" />} />
            <Card title="Total Users" value={totalUsers} icon={<Users className="w-5 h-5 sm:w-6 sm:h-6" />} />
            <Card title="Total Orders" value={totalOrders} icon={<ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Sales Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#fb923c" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">User Growth</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={userData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#fb923c" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Orders</h3>
            
            {/* Mobile View */}
            <div className="md:hidden space-y-4">
              {recentOrders.map((order) => (
                <div key={order._id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-800">...{order._id.slice(-6)}</p>
                    <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{order.status}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p><span className="font-medium text-gray-700">Customer:</span> {order.address.fullName}</p>
                    <p><span className="font-medium text-gray-700">Date:</span> {order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</p>
                    <p><span className="font-medium text-gray-700">Amount:</span> {currency}{order.amount.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3">Order ID</th>
                    <th scope="col" className="px-6 py-3">Customer</th>
                    <th scope="col" className="px-6 py-3">Amount</th>
                    <th scope="col" className="px-6 py-3">Date</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">...{order._id.slice(-6)}</td>
                      <td className="px-6 py-4">{order.address.fullName}</td>
                      <td className="px-6 py-4">{currency}{order.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">{order.date ? new Date(order.date).toLocaleDateString() : 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
        </div>

       </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
