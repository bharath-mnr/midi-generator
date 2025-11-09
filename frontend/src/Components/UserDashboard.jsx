// frontend/src/Components/UserDashboard.jsx
import React, { useState, useEffect } from 'react';
import { Globe, Monitor, Download, Trash2, Music, Menu, X, BarChart3 } from 'lucide-react';
import axiosInstance from '../services/axiosConfig';

const UserDashboard = () => {
  const [generations, setGenerations] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const statsResponse = await axiosInstance.get('/user/statistics');
      if (statsResponse.data) {
        setStatistics(statsResponse.data);
      }

      const generationsResponse = await axiosInstance.get('/midi/generations?page=0&size=50');
      if (generationsResponse.data) {
        setGenerations(generationsResponse.data.content || []);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      if (error.response?.status === 401) {
        // Handle unauthorized - token will be refreshed automatically by interceptor
      }
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
        icon: Monitor,
      };
    }
    return {
      text: 'Web Interface',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-800',
      icon: Globe,
    };
  };

  const filteredGenerations = generations.filter(gen => {
    if (filter === 'all') return true;
    return gen.source === filter;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white safe-area">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white safe-area">
      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}

      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-30 safe-area-top">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-xs text-gray-600 hidden sm:block">View your music generations across all platforms</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4">
              <button
                onClick={() => window.location.href = '/Generator'}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium text-sm"
              >
                Create Music
              </button>
              <button
                onClick={() => window.location.href = '/pricing'}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
              >
                Upgrade Plan
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-200 py-4 px-4 shadow-lg">
              <div className="space-y-3">
                <button
                  onClick={() => {
                    window.location.href = '/Generator';
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg font-medium transition-colors"
                >
                  Create Music
                </button>
                <button
                  onClick={() => {
                    window.location.href = '/pricing';
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
                >
                  Upgrade Plan
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Statistics Cards */}
        {statistics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Total Generations */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Total Generations</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 sm:mt-3">{statistics.totalGenerations}</p>
            </div>

            {/* Web Generations */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Web Generated</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 sm:mt-3">{statistics.webGenerations}</p>
              <div className="mt-3 sm:mt-4 w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-blue-600 h-1.5 rounded-full transition-all"
                  style={{ 
                    width: `${statistics.totalGenerations > 0 ? (statistics.webGenerations / statistics.totalGenerations * 100) : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* VST Generations */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">VST Generated</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 sm:mt-3">{statistics.vstGenerations}</p>
              <div className="mt-3 sm:mt-4 w-full bg-gray-100 rounded-full h-1.5">
                <div 
                  className="bg-purple-600 h-1.5 rounded-full transition-all"
                  style={{ 
                    width: `${statistics.totalGenerations > 0 ? (statistics.vstGenerations / statistics.totalGenerations * 100) : 0}%` 
                  }}
                />
              </div>
            </div>

            {/* Remaining Today */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Remaining Today</p>
              <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2 sm:mt-3">{statistics.remainingGenerations}</p>
              <p className="text-xs text-gray-500 mt-1 sm:mt-2">Used {statistics.dailyGenerationCount} today</p>
            </div>
          </div>
        )}

        {/* Filter Tabs - Mobile Optimized */}
        <div className="mb-4 sm:mb-6">
          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                filter === 'all'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <span>All</span>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                {generations.length}
              </span>
            </button>
            <button
              onClick={() => setFilter('web')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                filter === 'web'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Web</span>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                {statistics?.webGenerations || 0}
              </span>
            </button>
            <button
              onClick={() => setFilter('vst')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-1 sm:gap-2 ${
                filter === 'vst'
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Monitor className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>VST</span>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs">
                {statistics?.vstGenerations || 0}
              </span>
            </button>
          </div>
        </div>

        {/* Generations List */}
        {filteredGenerations.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Music className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm sm:text-base">
              {filter === 'all' 
                ? 'No generations yet' 
                : `No ${filter === 'web' ? 'web' : 'VST'} generations yet`}
            </p>
            <button
              onClick={() => window.location.href = '/Generator'}
              className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm"
            >
              Create Your First Track
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGenerations.map((generation) => {
              const sourceBadge = getSourceBadge(generation.source);
              const SourceIcon = sourceBadge.icon;

              return (
                <div 
                  key={generation.id} 
                  className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 mb-2 flex-col sm:flex-row sm:items-center">
                        <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate flex-1">
                          {generation.fileName}
                        </h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${sourceBadge.bgColor} ${sourceBadge.textColor}`}>
                          <SourceIcon className="w-3 h-3 mr-1" />
                          {sourceBadge.text}
                        </span>
                      </div>
                      
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-2 sm:mb-3">
                        {generation.originalPrompt || 'No prompt saved'}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                        <span className="bg-gray-100 px-2 py-1 rounded">{generation.barCount} bars</span>
                        <span>
                          {new Date(generation.generatedAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button
                        onClick={() => window.location.href = generation.midiUrl}
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Download MIDI"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
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

        {/* Mobile CTA Section */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 safe-area-bottom">
          <div className="flex gap-3">
            <button
              onClick={() => window.location.href = '/Generator'}
              className="flex-1 px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
            >
              Create Music
            </button>
            <button
              onClick={() => window.location.href = '/pricing'}
              className="flex-1 px-4 py-3 bg-white border border-gray-300 text-gray-900 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
            >
              Upgrade
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;