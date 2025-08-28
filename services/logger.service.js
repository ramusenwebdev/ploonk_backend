// File: src/infrastructure/services/logger.service.js
const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

// Tentukan level log
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Tentukan warna untuk setiap level (untuk tampilan di konsol)
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);

// Format log
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Tentukan "transports" (tujuan log: konsol atau file)
const transports = [
  // Selalu tampilkan log di konsol
  new winston.transports.Console(),
  // Simpan semua log error ke file terpisah
  new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../../logs/error-%DATE%.log'),
    level: 'error',
    format: winston.format.uncolorize(), // Hapus warna untuk file log
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
  // Simpan semua log ke file gabungan
  new winston.transports.DailyRotateFile({
    filename: path.join(__dirname, '../../../logs/all-%DATE%.log'),
    format: winston.format.uncolorize(),
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: '20m',
    maxFiles: '14d',
  }),
];

// Buat dan ekspor instance logger
const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'http',
  levels,
  format,
  transports,
});

module.exports = logger;
