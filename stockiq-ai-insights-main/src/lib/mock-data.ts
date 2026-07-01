export const salesTrend = [
  { m: "Jan", sales: 42000, forecast: 41000 },
  { m: "Feb", sales: 48500, forecast: 47000 },
  { m: "Mar", sales: 51200, forecast: 50500 },
  { m: "Apr", sales: 47800, forecast: 49000 },
  { m: "May", sales: 58900, forecast: 56000 },
  { m: "Jun", sales: 63400, forecast: 60500 },
  { m: "Jul", sales: 69200, forecast: 66000 },
  { m: "Aug", sales: 72100, forecast: 71000 },
  { m: "Sep", sales: 78400, forecast: 75500 },
];

export const categoryShare = [
  { name: "Electronics", value: 38 },
  { name: "Apparel", value: 22 },
  { name: "Grocery", value: 18 },
  { name: "Home", value: 14 },
  { name: "Other", value: 8 },
];

export const stockUsage = [
  { d: "Mon", in: 120, out: 95 },
  { d: "Tue", in: 80, out: 110 },
  { d: "Wed", in: 145, out: 120 },
  { d: "Thu", in: 95, out: 140 },
  { d: "Fri", in: 175, out: 160 },
  { d: "Sat", in: 200, out: 190 },
  { d: "Sun", in: 85, out: 70 },
];

export const products = [
  {
    id: "SKU-1001",
    name: "Wireless Mouse Pro",
    category: "Electronics",
    stock: 142,
    min: 50,
    price: 1499,
    status: "in",
  },
  {
    id: "SKU-1002",
    name: "Mechanical Keyboard",
    category: "Electronics",
    stock: 18,
    min: 25,
    price: 4299,
    status: "low",
  },
  {
    id: "SKU-1003",
    name: "USB-C Hub 7-in-1",
    category: "Electronics",
    stock: 0,
    min: 20,
    price: 2299,
    status: "out",
  },
  {
    id: "SKU-1004",
    name: "Cotton T-Shirt L",
    category: "Apparel",
    stock: 320,
    min: 100,
    price: 599,
    status: "in",
  },
  {
    id: "SKU-1005",
    name: "Denim Jacket M",
    category: "Apparel",
    stock: 12,
    min: 30,
    price: 2199,
    status: "low",
  },
  {
    id: "SKU-1006",
    name: "Basmati Rice 5kg",
    category: "Grocery",
    stock: 240,
    min: 80,
    price: 799,
    status: "in",
  },
  {
    id: "SKU-1007",
    name: "Olive Oil 1L",
    category: "Grocery",
    stock: 56,
    min: 40,
    price: 649,
    status: "in",
  },
  {
    id: "SKU-1008",
    name: "Ceramic Mug Set",
    category: "Home",
    stock: 8,
    min: 25,
    price: 899,
    status: "low",
  },
  {
    id: "SKU-1009",
    name: "LED Desk Lamp",
    category: "Home",
    stock: 67,
    min: 30,
    price: 1899,
    status: "in",
  },
  {
    id: "SKU-1010",
    name: "Yoga Mat 6mm",
    category: "Other",
    stock: 34,
    min: 20,
    price: 1299,
    status: "in",
  },
];

export const suppliers = [
  {
    id: "SUP-01",
    name: "Pinnacle Traders",
    products: 48,
    score: 94,
    delay: "0 days",
    status: "active",
  },
  {
    id: "SUP-02",
    name: "Orbit Supplies Co.",
    products: 32,
    score: 87,
    delay: "1 day",
    status: "active",
  },
  {
    id: "SUP-03",
    name: "Nimbus Wholesale",
    products: 21,
    score: 72,
    delay: "3 days",
    status: "review",
  },
  {
    id: "SUP-04",
    name: "Apex Distributors",
    products: 56,
    score: 91,
    delay: "0 days",
    status: "active",
  },
  {
    id: "SUP-05",
    name: "Forge & Fern Co.",
    products: 18,
    score: 64,
    delay: "5 days",
    status: "review",
  },
];

export const orders = [
  { id: "ORD-9821", customer: "Acme Corp", total: 12450, status: "paid", date: "2026-06-22" },
  { id: "ORD-9822", customer: "Globex Inc.", total: 8200, status: "pending", date: "2026-06-23" },
  { id: "ORD-9823", customer: "Initech", total: 22890, status: "paid", date: "2026-06-23" },
  { id: "ORD-9824", customer: "Hooli", total: 5640, status: "paid", date: "2026-06-24" },
  { id: "ORD-9825", customer: "Soylent Ltd", total: 17320, status: "pending", date: "2026-06-24" },
  { id: "ORD-9826", customer: "Stark Co.", total: 9870, status: "refunded", date: "2026-06-24" },
];

export const users = [
  {
    name: "Aarav Mehta",
    email: "aarav@stockiq.app",
    role: "Admin",
    branch: "HQ",
    status: "active",
  },
  {
    name: "Priya Shah",
    email: "priya@stockiq.app",
    role: "Manager",
    branch: "Mumbai",
    status: "active",
  },
  {
    name: "Rohan Verma",
    email: "rohan@stockiq.app",
    role: "Staff",
    branch: "Mumbai",
    status: "active",
  },
  {
    name: "Ananya Iyer",
    email: "ananya@stockiq.app",
    role: "Manager",
    branch: "Bengaluru",
    status: "active",
  },
  {
    name: "Kunal Joshi",
    email: "kunal@stockiq.app",
    role: "Staff",
    branch: "Delhi",
    status: "pending",
  },
  {
    name: "Sneha Reddy",
    email: "sneha@stockiq.app",
    role: "Viewer",
    branch: "HQ",
    status: "active",
  },
];

export const aiInsights = [
  {
    title: "Reorder Wireless Mouse Pro",
    body: "Demand is projected to rise 32% next month. Recommended PO of 120 units.",
    level: "warning",
  },
  {
    title: "Slow movers detected",
    body: "3 SKUs in Home category sold < 5 units in 30 days. Consider promotion.",
    level: "info",
  },
  {
    title: "Supplier risk: Forge & Fern",
    body: "Average delay of 5 days. Score dropped 12 pts this quarter.",
    level: "danger",
  },
  {
    title: "Sales surge — Apparel",
    body: "Apparel revenue up 18% WoW. AI suggests boosting stock at Bengaluru.",
    level: "success",
  },
];

export const tasks = [
  { id: 1, title: "Receive PO #4421 from Pinnacle", due: "Today", done: false },
  { id: 2, title: "Stock count — aisle B3", due: "Today", done: false },
  { id: 3, title: "Dispatch ORD-9824 (Hooli)", due: "Today", done: true },
  { id: 4, title: "Update prices — Grocery", due: "Tomorrow", done: false },
];
