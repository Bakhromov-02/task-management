import winston from 'winston';

const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.colorize(),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    })
  ),
  transports: [
    new winston.transports.Console({
      handleExceptions: true,
      handleRejections: true
    })
  ],
  exitOnError: false
});

export const logger = {
  info: (message: string, ...args: any[]) => {
    winstonLogger.info(message, ...args);
  },
  
  error: (message: string, ...args: any[]) => {
    winstonLogger.error(message, ...args);
  },
  
  warn: (message: string, ...args: any[]) => {
    winstonLogger.warn(message, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    winstonLogger.debug(message, ...args);
  }
};

export { winstonLogger };