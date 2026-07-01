export type DashboardData = {
  kpis: {
    totalProducts: number;
    activeUsers: number;
    branches: number;
    todaySales: number;
    monthlyRevenue: number;
    inventoryValue: number;
    lowStock: number;
    pendingOrders: number;
    ordersToday: number;
    stockInToday: number;
    stockOutToday: number;
  };
  salesTrend: {
    label: string;
    sales: number;
    forecast: number;
    expense: number;
    profit: number;
  }[];
  categoryShare: {
    name: string;
    value: number;
  }[];
  lowStockItems: {
    id: string;
    sku: string;
    name: string;
    stock: number;
    minStock: number;
    status: "low" | "out";
    suggestedReorder: number;
  }[];
  supplierScores: {
    id: string;
    name: string;
    score: number;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    status: "paid" | "pending" | "cancelled";
    date: string;
  }[];
  insights: {
    title: string;
    body: string;
    level: "primary" | "success" | "warning" | "danger" | "info";
  }[];
};
