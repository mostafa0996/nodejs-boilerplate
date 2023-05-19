const { createLogger, format, transports } = require('winston');

const logger = createLogger({
    level: 'debug',
    format: format.combine(
        format.colorize(),
        format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
        format.errors({ stack: true }),
    ),
    transports: [new transports.Console()],
});

module.exports = logger;
