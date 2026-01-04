import pino from 'pino';
import { config } from '../config.js';
import fs from 'fs';
import path from 'path';

// Create log directory if it doesn't exist
const logDir = '/tmp';
const logFile = path.join(logDir, 'statfin-mcp.log');

// Create streams for file and stderr
const streams: pino.StreamEntry[] = [
  // Always write to stderr (MCP compatible - stdout reserved for JSON-RPC)
  {
    level: 'trace',
    stream: process.stderr,
  },
];

// In development, also write to file for easier debugging
if (config.nodeEnv === 'development') {
  try {
    const fileStream = fs.createWriteStream(logFile, { flags: 'a' });
    streams.push({
      level: 'trace',
      stream: fileStream,
    });
  } catch {
    // Ignore file logging errors in production
  }
}

/**
 * Logger instance configured for MCP compatibility.
 * Writes to stderr (and optionally file) to keep stdout clear for JSON-RPC.
 */
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || (config.nodeEnv === 'development' ? 'debug' : 'info'),
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(streams)
);

// Log file location for debugging
if (config.nodeEnv === 'development') {
  logger.info(`Logs also written to ${logFile}`);
}
