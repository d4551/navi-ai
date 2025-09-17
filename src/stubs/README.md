# Browser Stubs and Polyfills

This directory contains browser-compatible stub implementations for Node.js modules that are not available in web browsers. These stubs provide graceful fallbacks and enhanced debugging capabilities for development.

## Files

### `better-sqlite3.js` & `better-sqlite3.d.ts`

- **Purpose**: Browser-compatible mock for the `better-sqlite3` Node.js SQLite library
- **Features**:
  - No-op database operations that prevent import errors
  - Enhanced logging for debugging database calls
  - Type definitions for TypeScript compatibility
  - Helpful guidance for developers to use browser-appropriate storage (IndexedDB, localStorage)

### `events.js`

- **Purpose**: Enhanced browser-compatible implementation of Node.js `events` module
- **Features**:
  - Complete EventEmitter implementation with all standard methods
  - Async iterator support (`EventEmitter.on()` static method)
  - Proper error handling and memory leak detection
  - AbortError class for async operations
  - Browser-specific optimizations and debugging

## Usage

These stubs are automatically used when the corresponding Node.js modules are imported in a browser environment. They provide:

1. **Development Feedback**: Console warnings and helpful guidance when Node.js-specific functionality is attempted
2. **Error Prevention**: Graceful fallbacks instead of import/runtime errors
3. **Type Safety**: Complete TypeScript definitions for IDE support
4. **Debugging Aid**: Enhanced logging and error messages for troubleshooting

## Implementation Notes

- All stubs follow the original module APIs as closely as possible
- Enhanced error messages provide clear guidance on browser alternatives
- Mock implementations return reasonable default values
- Logging is provided for debugging but doesn't interfere with production builds
- TypeScript definitions match the original modules for seamless development

These implementations ensure the NAVI application works seamlessly in both Electron (Node.js) and web browser environments.
