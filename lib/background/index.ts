/**
 * Background System Initialization
 * Initializes the background job system when the app starts
 */

import { jobManager } from './job-manager';

// Initialize the job manager when this module is imported
// This ensures background processing starts as soon as the app loads
console.log('🔄 [BACKGROUND] Initializing background job system...');

// Start the job manager
const bgJobManager = jobManager;

// Export for use in other parts of the application
export { bgJobManager as jobManager };
export { jobManager as default };

// Export types and other utilities
export * from './job-types';
export * from './job-manager';
export * from './job-processor';

console.log('✅ [BACKGROUND] Background job system initialized');