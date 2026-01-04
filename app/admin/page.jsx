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

const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
];

const userData = [
  { name: 'Jan', users: 200 },
  { name: 'Feb', users: 250 },
  { name: 'Mar', users: 300 },
  { name: 'Apr', users: 320 },
  { name: 'May', users: 350 },
  { name: 'Jun', users: 400 },
];

const Card = ({ title, value, icon, change }) => (
    <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {change && <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>}
      </div>
      <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
        {icon}
      </div>
    </div>
);

const AdminDashboard = () => {
    const { allOrders, currency, productsLoading } = useAppContext();
    const { data: users, loading: usersLoading } = useCollection('users');

    const loading = productsLoading || usersLoading;

    const totalRevenue = allOrders.reduce((sum, order) => sum + order.amount, 0);
    const totalUsers = users?.length || 0;
    const totalOrders = allOrders?.length || 0;
    const recentOrders = allOrders.slice(0, 5);
  
    if (loading) {
        return <Loading />
    }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
       <div className="w-full md:p-10 p-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card title="Total Revenue" value={`${currency}${totalRevenue.toFixed(2)}`} icon={<DollarSign className="w-6 h-6" />} />
            <Card title="Total Users" value={totalUsers} icon={<Users className="w-6 h-6" />} />
            <Card title="Total Orders" value={totalOrders} icon={<ShoppingCart className="w-6 h-6" />} />
            <Card title="Active Now" value="350" icon={<Activity className="w-6 h-6" />} change="+50 since last hour" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
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
          <div className="bg-white p-6 rounded-lg shadow-md">
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

        <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Recent Orders</h3>
            <div className="overflow-x-auto">
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
                      <td className="px-6 py-4">${order.amount.toFixed(2)}</td>
                      <td className="px-6 py-4">{new Date(order.date).toLocaleDateString()}</td>
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
