import axiosInstance from '../api/apiInstance';

interface Dimension {
  dimension: string;
}

interface Measure {
  measure: string;
  unit: string;
}

interface Hierarchy {
  dimension: string;
  hierarchy: string;
}

interface Filter {
  dimension: string;
  value: string | number;
}

interface DiceRequest {
  filters: Filter[];
  measures?: string[];
}

interface PivotRequest {
  rows: string[];
  columns: string[];
  measures: string[];
  filters?: Filter[];
}

interface CustomerType {
  customer_type: string;
  count: number;
}

// Mock data để sử dụng khi backend chưa sẵn sàng
const mockDimensions: Dimension[] = [
  { dimension: "thoi_gian" },
  { dimension: "khach_hang" },
  { dimension: "san_pham" },
  { dimension: "cua_hang" },
  { dimension: "dia_diem" }
];

const mockMeasures: Measure[] = [
  { measure: "doanh_thu", unit: "VND" },
  { measure: "so_luong", unit: "cái" },
  { measure: "loi_nhuan", unit: "VND" },
  { measure: "chi_phi", unit: "VND" },
  { measure: "ton_kho", unit: "cái" }
];

const mockHierarchies: Hierarchy[] = [
  { dimension: "thoi_gian", hierarchy: "ngay > thang > quy > nam" },
  { dimension: "dia_diem", hierarchy: "duong > quan > thanh_pho > tinh > quoc_gia" },
  { dimension: "san_pham", hierarchy: "san_pham > danh_muc > nhom_hang" }
];

const mockCustomerTypes: CustomerType[] = [
  { customer_type: "Khách hàng thường xuyên", count: 120 },
  { customer_type: "Khách hàng VIP", count: 45 },
  { customer_type: "Khách hàng mới", count: 78 },
  { customer_type: "Khách hàng doanh nghiệp", count: 32 },
  { customer_type: "Khách hàng tiềm năng", count: 65 }
];

// Metadata API
export const getDimensions = async () => {
  try {
    const response = await axiosInstance.get('/api/metadata/dimensions');
    return response.data;
  } catch (error) {
    console.warn('Sử dụng dữ liệu mẫu cho dimensions:', error);
    return mockDimensions;
  }
};

export const getMeasures = async () => {
  try {
    const response = await axiosInstance.get('/api/metadata/measures');
    return response.data;
  } catch (error) {
    console.warn('Sử dụng dữ liệu mẫu cho measures:', error);
    return mockMeasures;
  }
};

export const getHierarchies = async () => {
  try {
    const response = await axiosInstance.get('/api/metadata/hierarchies');
    return response.data;
  } catch (error) {
    console.warn('Sử dụng dữ liệu mẫu cho hierarchies:', error);
    return mockHierarchies;
  }
};

// OLAP Operations
export const drillDown = async (dimension: string, level: string, value: string) => {
  try {
    const response = await axiosInstance.get(`/api/olap/drilldown/${dimension}/${level}/${value}`);
    return response.data;
  } catch (error) {
    console.warn('Không thể thực hiện drillDown:', error);
    return {};
  }
};

export const rollUp = async (dimension: string, level: string) => {
  try {
    const response = await axiosInstance.get(`/api/olap/rollup/${dimension}/${level}`);
    return response.data;
  } catch (error) {
    console.warn('Không thể thực hiện rollUp:', error);
    return {};
  }
};

export const slice = async (dimension: string, value: string) => {
  try {
    const response = await axiosInstance.get(`/api/olap/slice/${dimension}/${value}`);
    return response.data;
  } catch (error) {
    console.warn('Không thể thực hiện slice:', error);
    return {};
  }
};

export const dice = async (request: DiceRequest) => {
  try {
    const response = await axiosInstance.post('/api/olap/dice', request);
    return response.data;
  } catch (error) {
    console.warn('Không thể thực hiện dice:', error);
    return {};
  }
};

export const pivot = async (request: PivotRequest) => {
  try {
    const response = await axiosInstance.post('/api/olap/pivot', request);
    return response.data;
  } catch (error) {
    console.warn('Không thể thực hiện pivot:', error);
    return {};
  }
};

// Report API
export const getStoreItems = async (threshold?: number) => {
  try {
    const url = threshold ? `/api/report/store-items?threshold=${threshold}` : '/api/report/store-items';
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.warn('Không thể lấy dữ liệu store items:', error);
    return [];
  }
};

export const getCustomerTransactions = async (customerName: string) => {
  try {
    const response = await axiosInstance.get(`/api/report/customer-transactions/${customerName}`);
    return response.data;
  } catch (error) {
    console.warn('Không thể lấy dữ liệu customer transactions:', error);
    return [];
  }
};

export const getStoresByCustomer = async (customerName: string) => {
  try {
    const response = await axiosInstance.get(`/api/report/stores-by-customer/${customerName}`);
    return response.data;
  } catch (error) {
    console.warn('Không thể lấy dữ liệu stores by customer:', error);
    return [];
  }
};

export const getInventoryByQuantity = async (itemName: string, threshold: number) => {
  try {
    const response = await axiosInstance.get(`/api/report/inventory-by-quantity/${itemName}/${threshold}`);
    return response.data;
  } catch (error) {
    console.warn('Không thể lấy dữ liệu inventory by quantity:', error);
    return [];
  }
};

export const getTransactionDetails = async (customerName: string) => {
  try {
    const response = await axiosInstance.get(`/api/report/transaction-details/${customerName}`);
    return response.data;
  } catch (error) {
    console.warn('Không thể lấy dữ liệu transaction details:', error);
    return [];
  }
};

export const getCustomerLocation = async (customerName: string) => {
  try {
    const response = await axiosInstance.get(`/api/report/customer-location/${customerName}`);
    return response.data;
  } catch (error) {
    console.warn('Không thể lấy dữ liệu customer location:', error);
    return {};
  }
};

export const getInventoryByCity = async (itemName: string, cityName: string) => {
  try {
    const response = await axiosInstance.get(`/api/report/inventory-by-city/${itemName}/${cityName}`);
    return response.data;
  } catch (error) {
    console.warn('Không thể lấy dữ liệu inventory by city:', error);
    return [];
  }
};

export const getCustomerTypes = async () => {
  try {
    const response = await axiosInstance.get('/api/report/customer-types');
    return response.data;
  } catch (error) {
    console.warn('Sử dụng dữ liệu mẫu cho customer types:', error);
    return mockCustomerTypes;
  }
}; 