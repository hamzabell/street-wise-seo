#!/usr/bin/env npx tsx

/**
 * Background Worker Process
 * Runs the job manager as a standalone process for production environments
 */

import { jobManager } from './job-manager';

console.log('🚀 [BACKGROUND WORKER] Starting background job worker...');

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n📦 [BACKGROUND WORKER] Received SIGINT, shutting down gracefully...');
  jobManager.stop();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n📦 [BACKGROUND WORKER] Received SIGTERM, shutting down gracefully...');
  jobManager.stop();
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 [BACKGROUND WORKER] Uncaught exception:', error);
  jobManager.stop();
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 [BACKGROUND WORKER] Unhandled rejection at:', promise, 'reason:', reason);
});

// Start the job manager (it will automatically start processing)
console.log('✅ [BACKGROUND WORKER] Background worker started successfully');
console.log('📋 [BACKGROUND WORKER] Monitoring for background jobs...');

// Keep the process alive
setInterval(() => {
  // Heartbeat - could be used for health checks
}, 30000); // Every 30 seconds