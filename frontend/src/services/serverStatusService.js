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
    this.maxAttempts = 36; // 3 minutes at 5-second intervals (36 * 5s = 180s = 3min)
    this.isInitializing = false;
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
    // Don't check if already healthy or max attempts reached
    if (this.currentStatus === 'healthy' || this.failedAttempts >= this.maxAttempts) {
      if (this.failedAttempts >= this.maxAttempts) {
        this.currentStatus = 'error';
        this.notifyListeners();
        this.stopPolling();
      }
      return;
    }

    this.currentStatus = this.failedAttempts === 0 ? 'checking' : 'waking';
    this.notifyListeners();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(`${this.apiUrl}/health`, {
        signal: controller.signal,
        headers: { 
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        },
        // Add cache busting for more reliable health checks
        cache: 'no-cache'
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        this.currentStatus = 'healthy';
        this.failedAttempts = 0;
        this.stopPolling();
        console.log('✅ Server health check passed');
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
    
    // Determine status based on number of attempts
    if (this.failedAttempts === 1) {
      this.currentStatus = 'checking';
    } else if (this.failedAttempts <= this.maxAttempts) {
      this.currentStatus = 'waking';
    } else {
      this.currentStatus = 'error';
      this.stopPolling();
      console.error(`❌ Server health check failed after ${this.maxAttempts} attempts`);
    }
    
    // Start polling if not already and we haven't exceeded max attempts
    if (this.failedAttempts < this.maxAttempts) {
      this.startPolling();
    }
  }

  startPolling() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
    
    // Use exponential backoff for polling intervals
    const baseInterval = 5000; // 5 seconds
    const backoffMultiplier = this.failedAttempts > 10 ? 1.5 : 1; // Slow down after 10 attempts
    const interval = Math.min(baseInterval * backoffMultiplier, 30000); // Max 30 seconds
    
    this.checkInterval = setInterval(() => {
      if (this.failedAttempts < this.maxAttempts) {
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

  reset() {
    this.failedAttempts = 0;
    this.currentStatus = 'checking';
    this.stopPolling();
    this.notifyListeners();
  }

  async initialize() {
    if (this.isInitializing) return;
    
    this.isInitializing = true;
    this.reset();
    await this.checkHealth();
    this.isInitializing = false;
  }

  destroy() {
    this.stopPolling();
    this.listeners.clear();
    this.isInitializing = false;
  }
}

const API_URL = import.meta.env.VITE_JAVA_API_URL || 'http://localhost:8080/api';
export const serverStatusService = new ServerStatusService(API_URL);