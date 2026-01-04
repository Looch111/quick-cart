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
} from 'recharts';
import { DollarSign, ShoppingCart, Package } from 'lucide-react';
import Footer from '@/components/seller/Footer';
import { useAppContext } from '@/context/AppContext';
import { useEffect, useState } from 'react';
import Loading from '@/components/Loading';

const salesData = [
  { name: 'Jan', sales: 2200 },
  { name: 'Feb', sales: 1800 },
  { name: 'Mar', sales: 3200 },
  { name: 'Apr', sales: 2800 },
  { name: 'May', sales: 4100 },
  { name: 'Jun', sales: 3900 },
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

const SellerDashboard = () => {
  const { allOrders, products, userData, currency } = useAppContext();
  const [sellerStats, setSellerStats] = useState({
    totalEarnings: 0,
    productsSold: 0,
    activeListings: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData && allOrders.length > 0 && products.length > 0) {
      const sellerProducts = products.filter(p => p.userId === userData._id);
      const sellerProductIds = sellerProducts.map(p => p.id);
      
      let totalEarnings = 0;
      let productsSold = 0;
      const recentOrders = [];

      allOrders.forEach(order => {
        let orderEarnings = 0;
        let sellerItemsInOrder = 0;
        
        const sellerOrderItems = order.items.filter(item => sellerProductIds.includes(item.id));

        if (sellerOrderItems.length > 0) {
          sellerOrderItems.forEach(item => {
            orderEarnings += item.offerPrice * item.quantity;
            sellerItemsInOrder += item.quantity;
          });

          totalEarnings += orderEarnings;
          productsSold += sellerItemsInOrder;
          
          recentOrders.push({
            ...order,
            amount: orderEarnings, // Show only seller's earnings for this order
          });
        }
      });
      
      setSellerStats({
        totalEarnings,
        productsSold,
        activeListings: sellerProducts.length,
        recentOrders: recentOrders.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
      });

      setLoading(false);
    } else if (userData) {
      setLoading(false);
    }
  }, [userData, allOrders, products]);
  
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
       <div className="w-full md:p-10 p-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Seller Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card title="Total Earnings" value={`${currency}${sellerStats.totalEarnings.toFixed(2)}`} icon={<DollarSign className="w-6 h-6" />} />
            <Card title="Products Sold" value={sellerStats.productsSold} icon={<ShoppingCart className="w-6 h-6" />} />
            <Card title="Active Listings" value={sellerStats.activeListings} icon={<Package className="w-6 h-6" />} />
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Sales</h3>
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
                  {sellerStats.recentOrders.map((order) => (
                    <tr key={order._id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">...{order._id.slice(-6)}</td>
                      <td className="px-6 py-4">{order.address.fullName}</td>
                      <td className="px-6 py-4">{currency}{order.amount.toFixed(2)}</td>
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

export default SellerDashboard;
