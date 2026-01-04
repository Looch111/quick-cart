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
  { name: 'Jan', sales: 0 },
  { name: 'Feb', sales: 0 },
  { name: 'Mar', sales: 0 },
  { name: 'Apr', sales: 0 },
  { name: 'May', sales: 0 },
  { name: 'Jun', sales: 0 },
  { name: 'Jul', sales: 0 },
  { name: 'Aug', sales: 0 },
  { name: 'Sep', sales: 0 },
  { name: 'Oct', sales: 0 },
  { name: 'Nov', sales: 0 },
  { name: 'Dec', sales: 0 },
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
  const { allOrders, products, userData, currency, productsLoading, platformSettings } = useAppContext();
  const [sellerStats, setSellerStats] = useState({
    totalEarnings: 0,
    productsSold: 0,
    activeListings: 0,
    recentOrders: [],
    monthlySales: salesData,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userData && allOrders && products && !productsLoading && platformSettings) {
      const sellerProducts = products.filter(p => p.userId === userData._id);
      const sellerProductIds = sellerProducts.map(p => p._id);
      const commissionRate = (platformSettings.commission || 0) / 100;
      
      let totalSales = 0;
      let productsSold = 0;
      const recentOrders = [];
      const monthlySalesData = [...salesData].map(item => ({...item})); // Deep copy

      allOrders.forEach(order => {
        let orderSales = 0;
        let sellerItemsInOrder = 0;
        
        const sellerOrderItems = order.items.filter(item => sellerProductIds.includes(item._id));

        if (sellerOrderItems.length > 0) {
          sellerOrderItems.forEach(item => {
            const itemTotal = item.offerPrice * item.quantity;
            orderSales += itemTotal;
            sellerItemsInOrder += item.quantity;

            const orderMonth = new Date(order.date).getMonth();
            if (monthlySalesData[orderMonth]) {
                monthlySalesData[orderMonth].sales += itemTotal;
            }
          });

          totalSales += orderSales;
          productsSold += sellerItemsInOrder;
          
          recentOrders.push({
            ...order,
            amount: orderSales, // Show only seller's gross sales for this order
          });
        }
      });

      const totalEarnings = totalSales * (1 - commissionRate);
      
      setSellerStats({
        totalEarnings,
        productsSold,
        activeListings: sellerProducts.length,
        recentOrders: recentOrders.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
        monthlySales: monthlySalesData,
      });

      setLoading(false);
    } else if (userData && !productsLoading) {
      const sellerProducts = products.filter(p => p.userId === userData._id);
       setSellerStats(prev => ({
        ...prev,
        activeListings: sellerProducts.length,
      }));
      setLoading(false);
    }
  }, [userData, allOrders, products, productsLoading, platformSettings]);
  
  if (loading || productsLoading) {
    return <Loading />;
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
       <div className="w-full md:p-10 p-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Seller Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card title="Total Earnings" value={`${currency}${sellerStats.totalEarnings.toFixed(2)}`} icon={<DollarSign className="w-6 h-6" />} />
            <Card title="Products Sold" value={sellerStats.productsSold} icon={<ShoppingCart className="w-6 h-6" />} />
            <Card title="Active Listings" value={sellerStats.activeListings} icon={<Package className="w-6 h-6" />} />
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Sales</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sellerStats.monthlySales}>
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
                    <th scope="col" className="px-6 py-3">Sale Amount</th>
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
