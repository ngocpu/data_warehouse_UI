import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getStoreItems, getCustomerTypes } from '../services/olap/olapService';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

// Các màu cho biểu đồ
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

interface StoreItem {
  store_key: number;
  item_name: string;
  total_sold: number;
  units_sold: number;
}

interface CustomerType {
  customer_type: string;
  count: number;
}

const DataVisualization: React.FC = () => {
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy data for demo purposes
  const salesData = [
    { month: 'Jan', sales: 4000, units: 240 },
    { month: 'Feb', sales: 3000, units: 198 },
    { month: 'Mar', sales: 2000, units: 120 },
    { month: 'Apr', sales: 2780, units: 190 },
    { month: 'May', sales: 1890, units: 208 },
    { month: 'Jun', sales: 2390, units: 150 },
    { month: 'Jul', sales: 3490, units: 310 },
  ];

  const inventoryData = [
    { month: 'Jan', quantity: 100 },
    { month: 'Feb', quantity: 200 },
    { month: 'Mar', quantity: 150 },
    { month: 'Apr', quantity: 300 },
    { month: 'May', quantity: 290 },
    { month: 'Jun', quantity: 240 },
    { month: 'Jul', quantity: 380 },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu từ API
        const storeItemsData = await getStoreItems();
        const customerTypesData = await getCustomerTypes();
        
        setStoreItems(storeItemsData.slice(0, 10)); // Giới hạn 10 mục
        setCustomerTypes(customerTypesData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching visualization data:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  // Chuyển đổi dữ liệu cửa hàng cho biểu đồ
  const storeItemsChartData = storeItems.map(item => ({
    name: item.item_name.length > 15 ? item.item_name.substring(0, 15) + '...' : item.item_name,
    sales: item.total_sold,
    units: item.units_sold
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Trực quan hóa dữ liệu</h1>

      {/* Row 1: Sales and Units */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Doanh số theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Số lượng đã bán theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="units" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Inventory and Customer Types */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tồn kho theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={inventoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="quantity" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Phân bố loại khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerTypes}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="customer_type"
                  label={({ customer_type, percent }) => `${customer_type}: ${(percent * 100).toFixed(0)}%`}
                >
                  {customerTypes.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 3: Store Items */}
      <Card>
        <CardHeader>
          <CardTitle>Sản phẩm bán chạy nhất</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={storeItemsChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={150} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" name="Doanh số" />
              <Bar dataKey="units" fill="#82ca9d" name="Số lượng" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataVisualization;