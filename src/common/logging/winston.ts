import { createLogger, format, transports } from 'winston'

const consoleLogsFormat = format.combine(
  format.errors({ stack: true }),
  format.colorize(),
  format.timestamp(),
  format.align(),
  format.printf(({ level, message, timestamp, stack }) => {
    if (stack) {
      return `${timestamp} ${level}: ${message} - ${stack}`
    }
    return `${timestamp} ${level}: ${message}`
  }),
)

export const winstonLogger = createLogger({
  level: 'info',
  transports: [
    new transports.Console({
      format: consoleLogsFormat,
    }),
  ],
})
