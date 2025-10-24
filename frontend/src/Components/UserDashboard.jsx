// frontend/src/Components/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Globe, Monitor, Download, Trash2, Music } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';

const UserDashboard = () => {
  const [generations, setGenerations] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };

      const statsResponse = await fetch(`${API_BASE_URL}/user/statistics`, { headers });
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStatistics(statsData);
      }

      const generationsResponse = await fetch(`${API_BASE_URL}/midi/generations?page=0&size=50`, { headers });
      if (generationsResponse.ok) {
        const genData = await generationsResponse.json();
        setGenerations(genData.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSourceBadge = (source) => {
    if (source === 'vst') {
      return {
        text: 'VST Plugin',
        bgColor: 'bg-purple-100',
        textColor: 'text-purple-800',
      };
    }
    return {
      text: 'Web Interface',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
    };
  };

  const filteredGenerations = generations.filter(gen => {
    if (filter === 'all') return true;
    return gen.source === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">View your music generations across all platforms</p>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Generations */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Generations</p>
              <p className="text-3xl font-bold text-gray-900 mt-3">{statistics.totalGenerations}</p>
            </div>

            {/* Web Generations */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Web Generated</p>
              <p className="text-3xl font-bold text-gray-900 mt-3">{statistics.webGenerations}</p>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ 
                    width: `${statistics.totalGenerations > 0 ? (statistics.webGenerations / statistics.totalGenerations * 100) : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* VST Generations */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">VST Generated</p>
              <p className="text-3xl font-bold text-gray-900 mt-3">{statistics.vstGenerations}</p>
              <div className="mt-4 w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full transition-all"
                  style={{ 
                    width: `${statistics.totalGenerations > 0 ? (statistics.vstGenerations / statistics.totalGenerations * 100) : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Remaining Today */}
            <div className="bg-white border border-gray-200 rounded-lg p-5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Remaining Today</p>
              <p className="text-3xl font-bold text-gray-900 mt-3">{statistics.remainingGenerations}</p>
              <p className="text-xs text-gray-500 mt-2">Used {statistics.dailyGenerationCount} today</p>
            </div>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
              filter === 'all'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            All Generations ({generations.length})
          </button>
          <button
            onClick={() => setFilter('web')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              filter === 'web'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            Web ({statistics?.webGenerations || 0})
          </button>
          <button
            onClick={() => setFilter('vst')}
            className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 flex items-center gap-2 ${
              filter === 'vst'
                ? 'border-gray-900 text-gray-900'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            <Monitor className="w-4 h-4" />
            VST ({statistics?.vstGenerations || 0})
          </button>
        </div>

        {/* Generations List */}
        {filteredGenerations.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600">
              {filter === 'all' 
                ? 'No generations yet' 
                : `No ${filter === 'web' ? 'web' : 'VST'} generations yet`}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGenerations.map((generation) => {
              const sourceBadge = getSourceBadge(generation.source);

              return (
                <div 
                  key={generation.id} 
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900 truncate">
                          {generation.fileName}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${sourceBadge.bgColor} ${sourceBadge.textColor}`}>
                          {sourceBadge.text}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-1 mb-3">
                        {generation.originalPrompt || 'No prompt saved'}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>{generation.barCount} bars</span>
                        <span>
                          {new Date(generation.generatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => window.location.href = generation.midiUrl}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download MIDI"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;