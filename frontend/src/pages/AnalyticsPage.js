import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';
import { useCustomization } from '../contexts/CustomizationContext';
import { useFavorites } from '../contexts/FavoritesContext';
import { radioAPI } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { Link } from 'react-router-dom';
import { format, subDays, startOfDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const AnalyticsPage = () => {
  const { isAuthenticated } = useAuth();
  const { customization } = useCustomization();
  const { favorites, favoritesCount } = useFavorites();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [radios, setRadios] = useState([]);
  const [timeRange, setTimeRange] = useState('7'); // 7, 30, 90 days
  const [analyticsData, setAnalyticsData] = useState({
    dailyAccesses: [],
    topRadios: [],
    regionDistribution: [],
    genreDistribution: [],
    userEngagement: {}
  });

  useEffect(() => {
    if (isAuthenticated) {
      loadAnalyticsData();
    }
  }, [isAuthenticated, timeRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load basic data
      const [statsData, radiosData] = await Promise.all([
        radioAPI.getStats(),
        radioAPI.getRadios({ limite: 100 })
      ]);

      setStats(statsData);
      setRadios(radiosData);

      // Generate mock analytics data (in real app, this would come from tracking)
      generateMockAnalytics(statsData, radiosData);

    } catch (error) {
      console.error('Erro ao carregar analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockAnalytics = (statsData, radiosData) => {
    const days = parseInt(timeRange);
    const dailyAccesses = [];
    const topRadios = [];
    
    // Generate daily access data
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const baseAccess = Math.floor(Math.random() * 500) + 200;
      const weekendMultiplier = [0, 6].includes(date.getDay()) ? 1.3 : 1;
      
      dailyAccesses.push({
        date: format(date, 'dd/MM', { locale: ptBR }),
        fullDate: date,
        accesses: Math.floor(baseAccess * weekendMultiplier),
        uniqueUsers: Math.floor((baseAccess * weekendMultiplier) * 0.7),
        favorites: Math.floor(Math.random() * 50) + 10
      });
    }

    // Generate top radios with mock listening data
    const topRadiosData = radiosData.slice(0, 8).map((radio, index) => ({
      ...radio,
      listeningTime: Math.floor(Math.random() * 3600) + 1800, // 30min - 90min
      totalListeners: Math.floor(Math.random() * 1000) + 500,
      favoriteCount: Math.floor(Math.random() * 100) + 20,
      rank: index + 1
    })).sort((a, b) => b.totalListeners - a.totalListeners);

    setAnalyticsData({
      dailyAccesses,
      topRadios: topRadiosData,
      regionDistribution: statsData.por_regiao,
      genreDistribution: statsData.por_genero,
      userEngagement: {
        totalSessions: dailyAccesses.reduce((sum, day) => sum + day.accesses, 0),
        avgSessionTime: '23:42',
        bounceRate: '34.5%',
        returnVisitors: '67.8%'
      }
    });
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)',
        },
      },
    },
  };

  const dailyAccessChart = {
    labels: analyticsData.dailyAccesses.map(d => d.date),
    datasets: [
      {
        label: 'Acessos',
        data: analyticsData.dailyAccesses.map(d => d.accesses),
        backgroundColor: customization.colors.primary + '80',
        borderColor: customization.colors.primary,
        borderWidth: 2,
      },
      {
        label: 'Usuários Únicos',
        data: analyticsData.dailyAccesses.map(d => d.uniqueUsers),
        backgroundColor: customization.colors.secondary + '80',
        borderColor: customization.colors.secondary,
        borderWidth: 2,
      }
    ],
  };

  const genreChart = {
    labels: analyticsData.genreDistribution.map(g => g._id),
    datasets: [
      {
        data: analyticsData.genreDistribution.map(g => g.count),
        backgroundColor: [
          customization.colors.primary,
          customization.colors.secondary,
          customization.colors.accent,
          '#F59E0B',
          '#EF4444',
          '#10B981',
          '#8B5CF6',
          '#F97316',
          '#06B6D4',
          '#84CC16'
        ],
        borderWidth: 2,
        borderColor: '#fff',
      },
    ],
  };

  const regionChart = {
    labels: analyticsData.regionDistribution.map(r => r._id),
    datasets: [
      {
        label: 'Rádios por Região',
        data: analyticsData.regionDistribution.map(r => r.count),
        backgroundColor: customization.colors.primary,
        borderColor: customization.colors.secondary,
        borderWidth: 2,
      },
    ],
  };

  if (!isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Acesso Restrito
        </h2>
        <p className="text-gray-600 mb-6">
          Você precisa estar logado como administrador para acessar o dashboard de analytics.
        </p>
        <Link
          to="/admin"
          className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-colors"
        >
          Fazer Login
        </Link>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              📊 Dashboard de Analytics
            </h1>
            <p className="text-cyan-100">
              Métricas e insights da sua plataforma
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white bg-opacity-20 rounded-lg text-white border border-white border-opacity-30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Rádios</p>
              <p className="text-3xl font-bold text-gray-900">{stats?.total_radios || 0}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            +{Math.floor(Math.random() * 5) + 1} esta semana
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sessões Totais</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.userEngagement.totalSessions?.toLocaleString()}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            +23% vs período anterior
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Favoritos</p>
              <p className="text-3xl font-bold text-gray-900">{favoritesCount}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            Taxa de conversão: 12.3%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Médio</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.userEngagement.avgSessionTime}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            +5.2 min vs período anterior
          </p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Access Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acessos Diários
          </h3>
          <Bar data={dailyAccessChart} options={chartOptions} />
        </div>

        {/* Genre Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribuição por Gênero
          </h3>
          <Pie data={genreChart} />
        </div>

        {/* Region Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Rádios por Região
          </h3>
          <Bar data={regionChart} options={chartOptions} />
        </div>

        {/* User Engagement */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Engajamento do Usuário
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Taxa de Rejeição</span>
              <span className="text-lg font-semibold text-gray-900">{analyticsData.userEngagement.bounceRate}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Visitantes Recorrentes</span>
              <span className="text-lg font-semibold text-gray-900">{analyticsData.userEngagement.returnVisitors}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Sessões por Usuário</span>
              <span className="text-lg font-semibold text-gray-900">2.4</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Páginas por Sessão</span>
              <span className="text-lg font-semibold text-gray-900">3.7</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top Radios Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Rádios Mais Populares
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rank
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rádio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gênero
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ouvintes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tempo Médio
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Favoritos
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.topRadios.map((radio) => (
                <tr key={radio.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                        radio.rank === 1 ? 'bg-yellow-100 text-yellow-800' :
                        radio.rank === 2 ? 'bg-gray-100 text-gray-800' :
                        radio.rank === 3 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {radio.rank}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{radio.nome}</div>
                    <div className="text-sm text-gray-500">{radio.cidade}, {radio.estado}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-800">
                      {radio.genero}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {radio.totalListeners.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {Math.floor(radio.listeningTime / 60)}:{(radio.listeningTime % 60).toString().padStart(2, '0')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {radio.favoriteCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;