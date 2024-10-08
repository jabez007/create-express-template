const winston = require('winston')

// Define your severity levels.
// With them, You can create log files,
// see or hide levels based on the running ENV.
const levels = {
  error: 0,
  warn: 1,
  http: 2,
  info: 3,
  debug: 4
}

// This method set the current severity based on
// the current NODE_ENV: show all the log levels
// if the server was run in development mode; otherwise,
// if it was run in production, show only info, http, warn, and error messages.
const level = () => {
  if (process.env.WINSTON_LEVEL) {
    return process.env.WINSTON_LEVEL
  }

  const env = process.env.NODE_ENV || 'development'
  switch (env) {
    case 'test':
      return 'error'

    case 'development':
      return 'debug'

    default:
      return 'info'
  }
}

// Define different colors for each level.
// Colors make the log message more visible,
// adding the ability to focus or ignore messages.
const colors = {
  error: 'red',
  warn: 'yellow',
  http: 'magenta',
  info: 'green',
  debug: 'white'
}

// Tell winston that you want to link the colors
// defined above to the severity levels.
winston.addColors(colors)

// Chose the aspect of your log customizing the log format.
const format = () => {
  const env = process.env.NODE_ENV || 'development'

  return winston.format.combine(
    // Make sure to write the stack when logging an error
    winston.format.errors({ stack: true }),
    // Add the message timestamp with the preferred format
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    // Define the JSON format for pretty print
    (env === 'development' ? winston.format.json({ replacer: null, space: 2 }) : winston.format.json())
    // winston.format.prettyPrint(),
    /*
     * Define the format of the message showing the timestamp, the level and the message
    winston.format.printf(
      (info) => `${info.timestamp} ${info.level}: ${info.message}`
    )
     */
  )
}

// Define which transports the logger must use to print out messages.
// In this example, we are using two different transports
const defaultTransports = () => {
  const env = process.env.NODE_ENV || 'development'

  return [
    // Allow the use of the console to print all messages
    new winston.transports.Console({
      format: winston.format.combine(
        // Tell Winston that the logs must be colored
        winston.format.colorize({ all: env === 'development' })
      )
    }),
    // Allow error level messages to print to the error.log file
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error'
    })
  ]
}

module.exports = (transports = defaultTransports()) => {
  const env = process.env.NODE_ENV || 'development'

  // Create the logger instance that has to be exported
  // and used to log messages.
  return winston.createLogger({
    level: level(),
    defaultMeta: {
      service: process.env.npm_package_name
    },
    levels,
    format: format(),
    transports,
    exceptionHandlers: transports,
    rejectionHandlers: transports,
    exitOnError: env !== 'development'
  })
}
