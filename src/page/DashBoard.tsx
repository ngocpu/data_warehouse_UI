import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { getCustomerTypes, getMeasures } from '../services/olap/olapService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

interface CustomerType {
  customer_type: string;
  count: number;
}

interface Measure {
  measure: string;
  unit: string;
}

const DashBoard: React.FC = () => {
  const [customerTypes, setCustomerTypes] = useState<CustomerType[]>([]);
  const [measures, setMeasures] = useState<Measure[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Lấy dữ liệu về loại khách hàng
        const customerTypesData = await getCustomerTypes();
        setCustomerTypes(customerTypesData);
        
        // Lấy dữ liệu về measure
        const measuresData = await getMeasures();
        setMeasures(measuresData);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Demo data cho biểu đồ
  const salesData = [
    { month: 'Jan', sales: 1200 },
    { month: 'Feb', sales: 2100 },
    { month: 'Mar', sales: 800 },
    { month: 'Apr', sales: 1600 },
    { month: 'May', sales: 900 },
    { month: 'Jun', sales: 1700 },
  ];

  if (loading) {
    return <div className="flex justify-center items-center h-full">Đang tải...</div>;
  }

  if (error) {
    return <div className="text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tổng doanh số</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$12,546.00</div>
            <p className="text-xs text-muted-foreground">+20.1% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Sản phẩm bán ra</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,350</div>
            <p className="text-xs text-muted-foreground">+15.2% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Số khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,203</div>
            <p className="text-xs text-muted-foreground">+5.2% so với tháng trước</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tồn kho</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">85%</div>
            <p className="text-xs text-muted-foreground">+2.5% so với tháng trước</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Doanh số theo tháng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="sales" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Phân bổ loại khách hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={customerTypes}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="count"
                  nameKey="customer_type"
                  label={(entry) => entry.customer_type}
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
      
      {/* Measures Table */}
      <Card>
        <CardHeader>
          <CardTitle>Chỉ số đo lường có sẵn</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-md">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="p-2 text-left">Chỉ số</th>
                  <th className="p-2 text-left">Đơn vị</th>
                </tr>
              </thead>
              <tbody>
                {measures.map((measure, index) => (
                  <tr key={index} className={index < measures.length - 1 ? "border-b" : ""}>
                    <td className="p-2">{measure.measure}</td>
                    <td className="p-2">{measure.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashBoard;