// This file is required by the Jest configuration
// It sets up the test environment for Excalibur

// Mock the global window object which is not available in Node.js environment
global.window = {} as any;
