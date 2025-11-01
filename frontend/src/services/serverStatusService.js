class ServerStatusService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.listeners = new Set();
    this.currentStatus = 'checking';
    this.failedAttempts = 0;
    this.checkInterval = null;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.currentStatus, this.failedAttempts);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentStatus, this.failedAttempts));
  }

  async checkHealth() {
    this.currentStatus = 'checking';
    this.notifyListeners();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        this.currentStatus = 'healthy';
        this.failedAttempts = 0;
        this.stopPolling();
      } else {
        this.handleFailure();
      }
    } catch (error) {
      clearTimeout(timeoutId);
      this.handleFailure();
    }
    
    this.notifyListeners();
  }

  handleFailure() {
    this.failedAttempts++;
    this.currentStatus = this.failedAttempts >= 2 ? 'waking' : 'error';
    this.startPolling();
  }

  startPolling() {
    if (this.checkInterval) return;
    this.checkInterval = setInterval(() => this.checkHealth(), 5000);
  }

  stopPolling() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async initialize() {
    await this.checkHealth();
    if (this.currentStatus !== 'healthy') this.startPolling();
  }

  destroy() {
    this.stopPolling();
    this.listeners.clear();
  }
}

const API_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';
export const serverStatusService = new ServerStatusService(API_URL);