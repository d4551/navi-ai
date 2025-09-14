# Random Port Configuration

This document explains the random port system implemented to avoid port conflicts during development.

## Overview

The NAVI AI application now supports automatic random port assignment to prevent conflicts when multiple development servers are running or when the default ports are occupied.

## Available Scripts

### Development Scripts

- `npm run dev` - Standard Vite dev server (uses default port 5173 or random if 5173 is occupied)
- `npm run dev:random` - Vite dev server with guaranteed random port
- `npm run dev:port` - Alias for `dev:random`
- `npm run dev:host` - Vite dev server with host binding
- `npm run dev:https` - Vite dev server with HTTPS

### Electron Development Scripts

- `npm run electron-dev` - Electron with Vite dev server on random port
- `npm run electron-dev:port` - Electron with Vite dev server on random port (strict mode)
- `npm run electron` - Electron only (for production builds)

## How It Works

### 1. Random Port Detection

The system uses `scripts/get-random-port.js` to find available ports:

```javascript
// Get a random port in range 3000-9999
const port = await getVitePort();
```

### 2. Vite Configuration

`vite.config.js` is configured to:
- Use port 0 (random) by default
- Allow fallback to next available port if random port fails
- Support environment variable override with `VITE_PORT`

```javascript
server: {
  port: Number(process.env.VITE_PORT) || 0, // 0 = random available port
  strictPort: false, // Allow fallback to next available port
  host: true,
  cors: true,
}
```

### 3. Electron Integration

The Electron main process (`electron/main.cjs`) automatically:
- Detects the Vite dev server port from `VITE_PORT` environment variable
- Falls back to common ports if environment variable is not set
- Provides helpful error messages if no dev server is found

## Usage Examples

### Basic Development

```bash
# Start Vite with random port
npm run dev:random

# Start Electron with Vite on random port
npm run electron-dev
```

### Custom Port

```bash
# Use specific port
VITE_PORT=4000 npm run dev

# Use specific port with Electron
VITE_PORT=4000 npm run electron-dev
```

### Multiple Instances

```bash
# Terminal 1: First instance
npm run dev:random

# Terminal 2: Second instance (will get different random port)
npm run dev:random

# Terminal 3: Electron connecting to first instance
VITE_PORT=5173 npm run electron
```

## Port Range

The random port system uses ports in the range **3000-9999** to:
- Avoid system ports (0-1023)
- Avoid well-known ports (1024-2999)
- Stay within reasonable development ranges
- Provide plenty of available ports

## Troubleshooting

### Port Still in Use

If you get "port in use" errors:

1. **Check what's using the port:**
   ```bash
   # Windows
   netstat -ano | findstr :5173
   
   # macOS/Linux
   lsof -i :5173
   ```

2. **Kill the process:**
   ```bash
   # Windows
   taskkill /PID <PID> /F
   
   # macOS/Linux
   kill -9 <PID>
   ```

3. **Use a different port:**
   ```bash
   VITE_PORT=4000 npm run dev:random
   ```

### Electron Can't Find Vite

If Electron shows "Dev server not running":

1. **Check Vite is running:**
   ```bash
   curl http://localhost:5173
   ```

2. **Check the correct port:**
   ```bash
   # Look for the port in Vite output
   npm run dev:random
   ```

3. **Set the port explicitly:**
   ```bash
   VITE_PORT=5173 npm run electron-dev
   ```

### Multiple Projects

When working with multiple projects:

1. **Use different port ranges:**
   ```bash
   # Project 1
   VITE_PORT=3000 npm run dev:random
   
   # Project 2
   VITE_PORT=4000 npm run dev:random
   ```

2. **Use random ports (recommended):**
   ```bash
   # Each will get a different random port
   npm run dev:random
   ```

## Environment Variables

- `VITE_PORT` - Override the default port (0 for random)
- `NODE_ENV` - Set to 'development' for dev mode

## Files Modified

- `vite.config.js` - Updated server configuration
- `package.json` - Added random port scripts
- `electron/main.cjs` - Enhanced port detection
- `scripts/get-random-port.js` - Random port utility
- `scripts/dev-with-random-port.js` - Dev server with random port
- `scripts/electron-dev-with-random-port.js` - Electron with random port
- `scripts/electron-dev-port.js` - Electron with random port (strict)

## Benefits

1. **No Port Conflicts** - Multiple instances can run simultaneously
2. **Automatic Detection** - No manual port management needed
3. **Fallback Support** - Graceful handling of port unavailability
4. **Development Friendly** - Clear error messages and troubleshooting
5. **Production Safe** - Doesn't affect production builds

## Future Improvements

- Port persistence across restarts
- Port conflict detection and resolution
- Integration with IDE/editor port detection
- Port sharing between team members
