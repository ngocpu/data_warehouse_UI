import React, { useEffect, useState, ReactElement } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import {
  getStoreItems,
  getCustomerTransactions,
  getStoresByCustomer,
  getInventoryByQuantity,
  getCustomerTypes
} from '../services/olap/olapService';

interface ReportTab {
  id: string;
  name: string;
  component: ReactElement;
}

const ManagerReport: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('storeItems');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // State cho các báo cáo
  const [storeItems, setStoreItems] = useState<any[]>([]);
  const [customerTransactions, setCustomerTransactions] = useState<any[]>([]);
  const [customerStores, setCustomerStores] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [customerTypeDistribution, setCustomerTypeDistribution] = useState<any[]>([]);
  
  // State cho các tham số
  const [customerName, setCustomerName] = useState<string>('');
  const [itemName, setItemName] = useState<string>('');
  const [threshold, setThreshold] = useState<string>('10');

  const fetchStoreItems = async () => {
    try {
      setLoading(true);
      const data = await getStoreItems();
      setStoreItems(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching store items:', err);
      setError('Không thể tải dữ liệu cửa hàng-sản phẩm. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const fetchCustomerTransactions = async () => {
    if (!customerName) return;
    try {
      setLoading(true);
      const data = await getCustomerTransactions(customerName);
      setCustomerTransactions(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customer transactions:', err);
      setError('Không thể tải dữ liệu giao dịch khách hàng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const fetchCustomerStores = async () => {
    if (!customerName) return;
    try {
      setLoading(true);
      const data = await getStoresByCustomer(customerName);
      setCustomerStores(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customer stores:', err);
      setError('Không thể tải dữ liệu cửa hàng theo khách hàng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    if (!itemName || !threshold) return;
    try {
      setLoading(true);
      const data = await getInventoryByQuantity(itemName, parseInt(threshold));
      setInventoryItems(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching inventory items:', err);
      setError('Không thể tải dữ liệu tồn kho. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  const fetchCustomerTypes = async () => {
    try {
      setLoading(true);
      const data = await getCustomerTypes();
      setCustomerTypeDistribution(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching customer types:', err);
      setError('Không thể tải dữ liệu loại khách hàng. Vui lòng thử lại sau.');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'storeItems') {
      fetchStoreItems();
    } else if (activeTab === 'customerTypes') {
      fetchCustomerTypes();
    }
  }, [activeTab]);

  // Các thành phần báo cáo
  const storeItemsReport = (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        Báo cáo này hiển thị danh sách sản phẩm theo cửa hàng và số lượng bán ra.
      </div>
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">ID Cửa hàng</th>
              <th className="p-2 text-left">Thành phố</th>
              <th className="p-2 text-left">Số điện thoại</th>
              <th className="p-2 text-left">Tên sản phẩm</th>
              <th className="p-2 text-left">Mô tả</th>
              <th className="p-2 text-center">Kích thước</th>
              <th className="p-2 text-right">Giá</th>
            </tr>
          </thead>
          <tbody>
            {storeItems.slice(0, 10).map((item, index) => (
              <tr key={index} className={index < storeItems.length - 1 ? 'border-b' : ''}>
                <td className="p-2">{item.store_key}</td>
                <td className="p-2">{item.city_name}</td>
                <td className="p-2">{item.phone_number}</td>
                <td className="p-2">{item.item_name}</td>
                <td className="p-2">{item.description}</td>
                <td className="p-2 text-center">{item.size}</td>
                <td className="p-2 text-right">${item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const customerTransactionsReport = (
    <>
      <div className="mb-4 space-y-2">
        <div className="text-sm text-muted-foreground">
          Xem giao dịch của khách hàng cụ thể.
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập tên khách hàng"
            className="flex-1 border rounded-md p-2"
            value={customerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.currentTarget.value)}
          />
          <button
            onClick={fetchCustomerTransactions}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            disabled={!customerName}
          >
            Tìm kiếm
          </button>
        </div>
      </div>
      {customerTransactions.length > 0 && (
        <div className="border rounded-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Ngày</th>
                <th className="p-2 text-left">Sản phẩm</th>
                <th className="p-2 text-right">Giá trị</th>
                <th className="p-2 text-right">Số lượng</th>
              </tr>
            </thead>
            <tbody>
              {customerTransactions.slice(0, 10).map((item, index) => (
                <tr key={index} className={index < customerTransactions.length - 1 ? 'border-b' : ''}>
                  <td className="p-2">{item.date || 'N/A'}</td>
                  <td className="p-2">{item.item_name || 'N/A'}</td>
                  <td className="p-2 text-right">{item.total_sold || 0}</td>
                  <td className="p-2 text-right">{item.units_sold || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const storesByCustomerReport = (
    <>
      <div className="mb-4 space-y-2">
        <div className="text-sm text-muted-foreground">
          Xem cửa hàng mà khách hàng đã mua sắm.
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Nhập tên khách hàng"
            className="flex-1 border rounded-md p-2"
            value={customerName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.currentTarget.value)}
          />
          <button
            onClick={fetchCustomerStores}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            disabled={!customerName}
          >
            Tìm kiếm
          </button>
        </div>
      </div>
      {customerStores.length > 0 && (
        <div className="border rounded-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">ID Cửa hàng</th>
                <th className="p-2 text-left">Thành phố</th>
                <th className="p-2 text-left">Số điện thoại</th>
                <th className="p-2 text-right">Số lần mua</th>
                <th className="p-2 text-right">Tổng chi tiêu</th>
              </tr>
            </thead>
            <tbody>
              {customerStores.map((item, index) => (
                <tr key={index} className={index < customerStores.length - 1 ? 'border-b' : ''}>
                  <td className="p-2">{item.store_key}</td>
                  <td className="p-2">{item.city_name || 'N/A'}</td>
                  <td className="p-2">{item.phone_number || 'N/A'}</td>
                  <td className="p-2 text-right">{item.visit_count || 1}</td>
                  <td className="p-2 text-right">{item.total_spent || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const inventoryReport = (
    <>
      <div className="mb-4 space-y-2">
        <div className="text-sm text-muted-foreground">
          Xem tồn kho của sản phẩm cụ thể dưới ngưỡng.
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Tên sản phẩm"
            className="flex-1 border rounded-md p-2"
            value={itemName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemName(e.currentTarget.value)}
          />
          <input
            type="number"
            placeholder="Ngưỡng"
            className="w-24 border rounded-md p-2"
            value={threshold}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setThreshold(e.currentTarget.value)}
          />
          <button
            onClick={fetchInventoryItems}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
            disabled={!itemName || !threshold}
          >
            Tìm kiếm
          </button>
        </div>
      </div>
      {inventoryItems.length > 0 && (
        <div className="border rounded-md overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-2 text-left">Thành phố</th>
                <th className="p-2 text-left">Cửa hàng</th>
                <th className="p-2 text-left">Sản phẩm</th>
                <th className="p-2 text-right">Số lượng tồn</th>
              </tr>
            </thead>
            <tbody>
              {inventoryItems.map((item, index) => (
                <tr key={index} className={index < inventoryItems.length - 1 ? 'border-b' : ''}>
                  <td className="p-2">{item.city_name}</td>
                  <td className="p-2">{item.store_key}</td>
                  <td className="p-2">{item.item_name}</td>
                  <td className="p-2 text-right">{item.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );

  const customerTypeReport = (
    <>
      <div className="mb-4 text-sm text-muted-foreground">
        Báo cáo này hiển thị phân bố loại khách hàng.
      </div>
      <div className="border rounded-md overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="p-2 text-left">Loại khách hàng</th>
              <th className="p-2 text-right">Số lượng</th>
              <th className="p-2 text-right">Tỉ lệ (%)</th>
            </tr>
          </thead>
          <tbody>
            {customerTypeDistribution.map((item, index) => (
              <tr key={index} className={index < customerTypeDistribution.length - 1 ? 'border-b' : ''}>
                <td className="p-2">{item.customer_type}</td>
                <td className="p-2 text-right">{item.count}</td>
                <td className="p-2 text-right">
                  {((item.count / customerTypeDistribution.reduce((sum, i) => sum + i.count, 0)) * 100).toFixed(1)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );

  const tabs: ReportTab[] = [
    { id: 'storeItems', name: 'Sản phẩm theo cửa hàng', component: storeItemsReport },
    { id: 'customerTransactions', name: 'Giao dịch khách hàng', component: customerTransactionsReport },
    { id: 'storesByCustomer', name: 'Cửa hàng theo khách hàng', component: storesByCustomerReport },
    { id: 'inventory', name: 'Báo cáo tồn kho', component: inventoryReport },
    { id: 'customerTypes', name: 'Loại khách hàng', component: customerTypeReport },
  ];
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Báo cáo quản lý</h1>
      
      {/* Tabs */}
      <div className="border-b">
        <nav className="flex space-x-2 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 whitespace-nowrap ${
                activeTab === tab.id 
                  ? 'border-b-2 border-primary font-semibold' 
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      
      {/* Report Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {tabs.find(tab => tab.id === activeTab)?.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">Đang tải...</div>
          ) : error ? (
            <div className="text-red-500 text-center">{error}</div>
          ) : (
            tabs.find(tab => tab.id === activeTab)?.component
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerReport;