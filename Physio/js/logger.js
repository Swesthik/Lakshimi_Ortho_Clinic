/**
 * ReviveCMS - Centralized Logging Module
 * Formats: [Timestamp] [Level] [Module] Message
 */

export const Logger = {
  format: (level, moduleName, message) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] [${moduleName}] ${message}`;
  },
  info: (moduleName, message) => {
    console.info(Logger.format('INFO', moduleName, message));
  },
  warn: (moduleName, message) => {
    console.warn(Logger.format('WARN', moduleName, message));
  },
  error: (moduleName, message) => {
    console.error(Logger.format('ERROR', moduleName, message));
  },
  debug: (moduleName, message) => {
    console.debug(Logger.format('DEBUG', moduleName, message));
  }
};
