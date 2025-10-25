// client/src/hooks/useDashboard.ts
import { useState, useEffect } from 'react';

const API_URL = import.meta.env.VITE_API_URL!;

interface DashboardMetrics {
  totalRevenue: string;
  newCustomers: number;
  activeAccounts: number;
  growthRate: number;
  trendingUp: {
    revenue: string;
    customers: string;
    accounts: string;
    growth: string;
  };
}

interface VisitorData {
  date: string;
  visitors: number;
  transactions: number;
}

interface ChartData {
  period: string;
  data: VisitorData[];
}

export const useDashboardMetrics = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/metrics`);
        if (!response.ok) throw new Error('Failed to fetch metrics');
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return { metrics, loading, error };
};

export const useDashboardVisitors = () => {
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVisitors = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/visitors`);
        if (!response.ok) throw new Error('Failed to fetch visitor data');
        const data = await response.json();
        setChartData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchVisitors();
  }, []);

  return { chartData, loading, error };
};

export const useDashboardPortfolio = () => {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPortfolio = async () => {
      try {
        const response = await fetch(`${API_URL}/dashboard/portfolio-summary`);
        if (!response.ok) throw new Error('Failed to fetch portfolio');
        const data = await response.json();
        setPortfolio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolio();
  }, []);

  return { portfolio, loading, error };
};

// ============================================
// Usage example in your Dashboard component:
// ============================================

/*
import { useDashboardMetrics, useDashboardVisitors } from '@/hooks/useDashboard';

export default function Dashboard() {
  const { metrics, loading: metricsLoading } = useDashboardMetrics();
  const { chartData, loading: chartLoading } = useDashboardVisitors();

  if (metricsLoading || chartLoading) return <div>Loading...</div>;
  if (!metrics || !chartData) return <div>No data</div>;

  return (
    <div>
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader>Total Revenue</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${metrics.totalRevenue}</p>
            <p className="text-sm text-green-600">{metrics.trendingUp.revenue}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>New Customers</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.newCustomers}</p>
            <p className="text-sm text-red-600">{metrics.trendingUp.customers}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Active Accounts</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.activeAccounts}</p>
            <p className="text-sm text-green-600">{metrics.trendingUp.accounts}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>Growth Rate</CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{metrics.growthRate}%</p>
            <p className="text-sm text-green-600">{metrics.trendingUp.growth}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>Total Visitors (Last 3 Months)</CardHeader>
        <CardContent>
          <LineChart
            data={chartData.data}
            xKey="date"
            yKey="visitors"
          />
        </CardContent>
      </Card>
    </div>
  );
}
*/