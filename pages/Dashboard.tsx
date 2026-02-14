import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api, DashboardStats, SalesData, OrderStatusData } from '../services/api';
import { Card } from '../components/ui/Card';
import { Package, ShoppingBag, Truck, DollarSign, AlertCircle, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '../utils/cn';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const StatCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  icon: any; 
  color: string; 
  trend?: string;
}) => (
  <Card className="border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs text-green-400">
            <ArrowUpRight size={12} />
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div className={`p-3 rounded-lg opacity-80`} style={{ backgroundColor: `${color}20` }}>
        <Icon size={24} style={{ color }} />
      </div>
    </div>
  </Card>
);

const Dashboard = () => {
  const { data: statsResponse, isLoading: statsLoading } = useQuery({ 
    queryKey: ['dashboardStats'], 
    queryFn: api.getDashboardStats 
  });

  const { data: salesData = [], isLoading: salesLoading } = useQuery({ 
    queryKey: ['salesData'], 
    queryFn: api.getSalesData 
  });

  const { data: orderStatusData = [], isLoading: orderStatusLoading } = useQuery({
    queryKey: ['orderStatusData'],
    queryFn: api.getOrderStatusData
  });

  const COLORS = ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#ef4444'];

  if (statsLoading || salesLoading || orderStatusLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400">Welcome back, here's what's happening today.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-20 bg-slate-800 rounded"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const stats = statsResponse?.stats || {
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    todayOrders: 0,
    lowStockProducts: 0
  };

  // Calculate trends (mock for now)
  const getTrend = (current: number, previous: number = current * 0.8) => {
    const change = ((current - previous) / previous) * 100;
    return `+${change.toFixed(1)}% from last month`;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue)} 
          icon={DollarSign} 
          color="#10b981"
          trend={getTrend(stats.totalRevenue)}
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={ShoppingBag} 
          color="#3b82f6"
          trend={`+${stats.todayOrders} new today`}
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={Truck} 
          color="#f59e0b"
        />
        <StatCard 
          title="Low Stock" 
          value={stats.lowStockProducts} 
          icon={AlertCircle} 
          color="#ef4444"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2" title="Revenue Overview">
          <div className="h-80 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesData as any[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                  itemStyle={{ color: '#f8fafc' }}
                  formatter={(value: number) => [formatCurrency(value), 'Sales']}
                />
                <Bar dataKey="sales" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Order Status">
          <div className="h-80 w-full flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData as any[]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {(orderStatusData as any[]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [value, 'Orders']}
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center">
                <span className="block text-2xl font-bold text-white">{stats.totalOrders}</span>
                <span className="text-xs text-slate-400">Total Orders</span>
              </div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {(orderStatusData as any[]).map((item, index) => (
              <div key={item.name} className="flex items-center gap-2 text-xs text-slate-300">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                <span>{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card title="Product Summary">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Products</span>
              <span className="text-white font-medium">{stats.totalProducts}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Low Stock Items</span>
              <span className={`font-medium ${stats.lowStockProducts > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {stats.lowStockProducts}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Order Summary">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Today's Orders</span>
              <span className="text-white font-medium">{stats.todayOrders}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Pending</span>
              <span className="text-yellow-400 font-medium">{stats.pendingOrders}</span>
            </div>
          </div>
        </Card>

        <Card title="Financial Summary">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Total Revenue</span>
              <span className="text-white font-medium">{formatCurrency(stats.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Avg. Order Value</span>
              <span className="text-white font-medium">
                {stats.totalOrders > 0 
                  ? formatCurrency(stats.totalRevenue / stats.totalOrders) 
                  : formatCurrency(0)
                }
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;