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
        <p className={`text-xs mt-1 ${change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{change}</p>
      </div>
      <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
        {icon}
      </div>
    </div>
);

const AdminDashboard = () => {
  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
       <div className="w-full md:p-10 p-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card title="Total Revenue" value="$45,231.89" icon={<DollarSign className="w-6 h-6" />} change="+20.1% from last month" />
            <Card title="Total Users" value="2,350" icon={<Users className="w-6 h-6" />} change="+180 from last month" />
            <Card title="Total Orders" value="1,750" icon={<ShoppingCart className="w-6 h-6" />} change="+50 from last month" />
            <Card title="Active Now" value="350" icon={<Activity className="w-6 h-6" />} change="+50 since last hour" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
       </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;
