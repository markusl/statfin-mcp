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
 * Map Pino level labels to Google Cloud Logging severity values.
 * Cloud Logging keys off the `severity` field, not Pino's `level`, so without
 * this mapping every entry (including errors) is ingested as DEFAULT severity
 * and becomes invisible to severity filters and log-based alerts.
 * @see https://cloud.google.com/logging/docs/reference/v2/rest/v2/LogEntry#LogSeverity
 */
const PINO_LEVEL_TO_GCP_SEVERITY: Record<string, string> = {
  trace: 'DEBUG',
  debug: 'DEBUG',
  info: 'INFO',
  warn: 'WARNING',
  error: 'ERROR',
  fatal: 'CRITICAL',
};

/**
 * Logger instance configured for MCP compatibility.
 * Writes to stderr (and optionally file) to keep stdout clear for JSON-RPC.
 *
 * Output is shaped for Cloud Logging structured ingestion: the level is mapped
 * to `severity` and the log text to `message` so entries are correctly
 * classified and rendered in the GCP console.
 */
export const logger = pino(
  {
    level: process.env.LOG_LEVEL || (config.nodeEnv === 'development' ? 'debug' : 'info'),
    messageKey: 'message',
    formatters: {
      level: (label) => ({
        level: label,
        severity: PINO_LEVEL_TO_GCP_SEVERITY[label] ?? 'DEFAULT',
      }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream(streams)
);

// Log file location for debugging
if (config.nodeEnv === 'development') {
  logger.info(`Logs also written to ${logFile}`);
}
