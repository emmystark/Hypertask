/**
 * HyperTask Logger Utility
 * Comprehensive logging for monitoring all app processes and errors
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'success';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  data?: any;
  error?: string;
}

class Logger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs in memory
  private isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getConsoleColor(level: LogLevel): string {
    switch (level) {
      case 'debug':
        return 'color: #888; font-weight: bold;';
      case 'info':
        return 'color: #0099ff; font-weight: bold;';
      case 'warn':
        return 'color: #ff9900; font-weight: bold;';
      case 'error':
        return 'color: #ff3333; font-weight: bold;';
      case 'success':
        return 'color: #00cc44; font-weight: bold;';
    }
  }

  private getMessage(level: LogLevel, category: string, message: string): string {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '',
      error: '❌',
      success: ''
    };
    return `${emoji[level]} [${category}] ${message}`;
  }

  private log(level: LogLevel, category: string, message: string, data?: any, error?: string) {
    const timestamp = this.getTimestamp();
    const entry: LogEntry = { timestamp, level, category, message, data, error };

    // Add to in-memory logs
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output
    const fullMessage = this.getMessage(level, category, message);
    const consoleStyle = this.getConsoleColor(level);

    if (this.isDevelopment) {
      console.log(`%c${fullMessage}`, consoleStyle);
      if (data) console.log('  Data:', data);
      if (error) console.log('  Error:', error);
    }

    // Store in localStorage for debugging
    this.persistToLocalStorage(entry);
  }

  private persistToLocalStorage(entry: LogEntry) {
    try {
      if (typeof window !== 'undefined') {
        const existing = localStorage.getItem('hypertask_logs');
        const logs = existing ? JSON.parse(existing) : [];
        logs.push(entry);
        // Keep only last 100 entries in localStorage
        if (logs.length > 100) logs.shift();
        localStorage.setItem('hypertask_logs', JSON.stringify(logs));
      }
    } catch (e) {
      // Silent fail for localStorage issues
    }
  }

  // Public logging methods
  debug(category: string, message: string, data?: any) {
    this.log('debug', category, message, data);
  }

  info(category: string, message: string, data?: any) {
    this.log('info', category, message, data);
  }

  warn(category: string, message: string, data?: any) {
    this.log('warn', category, message, data);
  }

  error(category: string, message: string, error?: any, data?: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    this.log('error', category, message, data, errorMessage);
  }

  success(category: string, message: string, data?: any) {
    this.log('success', category, message, data);
  }

  // Get all logs
  getAllLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get logs by category
  getLogsByCategory(category: string): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('hypertask_logs');
      }
    } catch (e) {
      // Silent fail
    }
    this.info('Logger', 'Logs cleared');
  }

  // Export logs
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  // Get tail of logs (last N entries)
  getTail(count: number = 50): LogEntry[] {
    return this.logs.slice(-count);
  }
}

// Export singleton
export const logger = new Logger();
export default logger;
