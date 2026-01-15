
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
import { useEffect, useState, useMemo } from 'react';
import Loading from '@/components/Loading';
import { useCollection } from '@/src/firebase';

const salesDataTemplate = [
  { name: 'Jan', sales: 0 }, { name: 'Feb', sales: 0 },
  { name: 'Mar', sales: 0 }, { name: 'Apr', sales: 0 },
  { name: 'May', sales: 0 }, { name: 'Jun', sales: 0 },
  { name: 'Jul', sales: 0 }, { name: 'Aug', sales: 0 },
  { name: 'Sep', sales: 0 }, { name: 'Oct', sales: 0 },
  { name: 'Nov', sales: 0 }, { name: 'Dec', sales: 0 },
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
  const { userData, currency, sellerWalletBalance, allRawProducts } = useAppContext();
  const { data: allOrders, loading: ordersLoading } = useCollection('orders');
  
  const productsLoading = !allRawProducts;
  const loading = ordersLoading || productsLoading;

  const sellerStats = useMemo(() => {
    if (!userData || !allOrders || !allRawProducts) {
        return {
            productsSold: 0,
            activeListings: 0,
            recentOrders: [],
            monthlySales: salesDataTemplate,
        };
    }

    const sellerProducts = allRawProducts.filter(p => p.userId === userData._id);
    const sellerProductIds = sellerProducts.map(p => p.id);
      
    let productsSold = 0;
    const recentOrders = [];
    const monthlySalesData = [...salesDataTemplate].map(item => ({...item})); 

    allOrders.forEach(order => {
        let orderSales = 0;
        let sellerItemsInOrder = 0;
        
        const sellerOrderItems = order.items.filter(item => sellerProductIds.includes(item._id));

        if (sellerOrderItems.length > 0) {
          sellerOrderItems.forEach(item => {
            const itemTotal = item.offerPrice * item.quantity;
            orderSales += itemTotal;
            sellerItemsInOrder += item.quantity;

            const orderDate = order.date?.toDate ? order.date.toDate() : new Date(order.date);
            if (order.status === 'Completed' && orderDate) {
              const orderMonth = orderDate.getMonth();
              if (monthlySalesData[orderMonth]) {
                  monthlySalesData[orderMonth].sales += itemTotal;
              }
            }
          });

          productsSold += sellerItemsInOrder;
          
          recentOrders.push({
            ...order,
            id: order.id,
            date: order.date?.toDate ? order.date.toDate() : new Date(order.date),
            amount: orderSales, 
          });
        }
    });

    return {
        productsSold,
        activeListings: sellerProducts.length,
        recentOrders: recentOrders.sort((a,b) => new Date(b.date) - new Date(a.date)).slice(0, 5),
        monthlySales: monthlySalesData,
    };
  }, [userData, allOrders, allRawProducts]);
  
  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flex-1 min-h-screen flex flex-col justify-between bg-gray-50">
       <div className="w-full md:p-10 p-4">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">Seller Dashboard</h2>

        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card title="Available for Withdrawal" value={`${currency}${sellerWalletBalance.toFixed(2)}`} icon={<DollarSign className="w-6 h-6" />} />
            <Card title="Products Sold (All Time)" value={sellerStats.productsSold} icon={<ShoppingCart className="w-6 h-6" />} />
            <Card title="Active Listings" value={sellerStats.activeListings} icon={<Package className="w-6 h-6" />} />
        </div>

        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Monthly Sales (Completed Orders)</h3>
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
                    <tr key={order.id} className="bg-white border-b">
                      <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">...{order.id.slice(-6)}</td>
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

    