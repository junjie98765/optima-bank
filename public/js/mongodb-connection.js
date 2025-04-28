// MongoDB connection utility
class MongoDBConnection {
    constructor() {
      this.isConnected = false;
      this.connectionError = null;
    }
  
    // Check connection status
    async checkConnection() {
      try {
        const response = await fetch('/api/db-status');
        if (!response.ok) {
          throw new Error('Database connection check failed');
        }
        
        const data = await response.json();
        this.isConnected = data.connected;
        this.connectionError = data.connected ? null : data.error;
        
        return this.isConnected;
      } catch (error) {
        console.error('Error checking database connection:', error);
        this.isConnected = false;
        this.connectionError = error.message;
        return false;
      }
    }
  }
  
  // Initialize MongoDB connection
  window.mongoDBConnection = new MongoDBConnection();
  