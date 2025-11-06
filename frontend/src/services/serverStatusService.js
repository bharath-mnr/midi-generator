// // frontend/src/services/serverStatusService.js

// class ServerStatusService {
//   constructor(apiUrl) {
//     this.apiUrl = apiUrl;
//     this.listeners = new Set();
//     this.currentStatus = 'checking';
//     this.failedAttempts = 0;
//     this.checkInterval = null;
//   }

//   subscribe(callback) {
//     this.listeners.add(callback);
//     callback(this.currentStatus, this.failedAttempts);
//     return () => this.listeners.delete(callback);
//   }

//   notifyListeners() {
//     this.listeners.forEach(cb => cb(this.currentStatus, this.failedAttempts));
//   }

//   async checkHealth() {
//     this.currentStatus = 'checking';
//     this.notifyListeners();

//     const controller = new AbortController();
//     const timeoutId = setTimeout(() => controller.abort(), 8000);

//     try {
//       const response = await fetch(`${this.apiUrl}/health`, {
//         signal: controller.signal,
//         headers: { 'Cache-Control': 'no-cache' }
//       });
      
//       clearTimeout(timeoutId);

//       if (response.ok) {
//         this.currentStatus = 'healthy';
//         this.failedAttempts = 0;
//         this.stopPolling();
//       } else {
//         this.handleFailure();
//       }
//     } catch (error) {
//       clearTimeout(timeoutId);
//       this.handleFailure();
//     }
    
//     this.notifyListeners();
//   }

//   handleFailure() {
//     this.failedAttempts++;
//     this.currentStatus = this.failedAttempts >= 2 ? 'waking' : 'error';
//     this.startPolling();
//   }

//   startPolling() {
//     if (this.checkInterval) return;
//     this.checkInterval = setInterval(() => this.checkHealth(), 5000);
//   }

//   stopPolling() {
//     if (this.checkInterval) {
//       clearInterval(this.checkInterval);
//       this.checkInterval = null;
//     }
//   }

//   async initialize() {
//     await this.checkHealth();
//     if (this.currentStatus !== 'healthy') this.startPolling();
//   }

//   destroy() {
//     this.stopPolling();
//     this.listeners.clear();
//   }
// }

// const API_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';
// export const serverStatusService = new ServerStatusService(API_URL);









// frontend/src/services/serverStatusService.js
class ServerStatusService {
  constructor(apiUrl) {
    this.apiUrl = apiUrl;
    this.listeners = new Set();
    this.currentStatus = 'checking';
    this.failedAttempts = 0;
    this.checkInterval = null;
    this.maxRetries = 50; // Limit retries to avoid infinite loop
  }

  subscribe(callback) {
    this.listeners.add(callback);
    callback(this.currentStatus);
    return () => this.listeners.delete(callback);
  }

  notifyListeners() {
    this.listeners.forEach(cb => cb(this.currentStatus));
  }

  async checkHealth() {
    // Don't check if we're already in a retry loop
    if (this.failedAttempts >= this.maxRetries) {
      this.currentStatus = 'error';
      this.notifyListeners();
      return;
    }

    this.currentStatus = 'checking';
    this.notifyListeners();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Shorter timeout

    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        signal: controller.signal,
        headers: { 
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
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
    
    if (this.failedAttempts === 1) {
      // First failure - might just be slow
      this.currentStatus = 'checking';
    } else if (this.failedAttempts <= 3) {
      // Few failures - server is probably waking
      this.currentStatus = 'waking';
    } else {
      // Multiple failures - actual error
      this.currentStatus = 'error';
    }
    
    this.startPolling();
  }

  startPolling() {
    if (this.checkInterval) return;
    
    // Progressive backoff: check less frequently over time
    const interval = this.failedAttempts > 5 ? 10000 : 5000;
    
    this.checkInterval = setInterval(() => {
      if (this.failedAttempts < this.maxRetries) {
        this.checkHealth();
      } else {
        this.stopPolling();
      }
    }, interval);
  }

  stopPolling() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async initialize() {
    // Initial check with a bit of delay to avoid flash
    setTimeout(() => {
      this.checkHealth();
    }, 1000);
  }

  destroy() {
    this.stopPolling();
    this.listeners.clear();
  }
}

const API_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';
export const serverStatusService = new ServerStatusService(API_URL);