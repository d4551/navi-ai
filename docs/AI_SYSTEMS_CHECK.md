# Google AI SDK Systems Check

This utility provides comprehensive diagnostics for the Google AI SDK integration in NAVI.

## Quick Start

### 1. Browser Console (Recommended)

The easiest way to test your Google AI setup:

```javascript
// Test basic connectivity (no API key needed)
await testGoogleAIConnection()

// Test with your API key
await testGoogleAI('YOUR_GEMINI_API_KEY_HERE')

// Full systems diagnostic
await runAISystemsCheck()

// Quick check using stored API key
await quickAICheck()
```

### 2. Dashboard UI

1. Navigate to the Dashboard
2. Look for the "AI Insights" card on the right side
3. Click "Systems Check" (if AI is configured) or "Test Connection" (if not configured)
4. View results in toast notifications and browser console

### 3. Command Line

```bash
# Basic check (no API key)
node scripts/ai-systems-check.js --basic

# Full check with your API key
node scripts/ai-systems-check.js YOUR_GEMINI_API_KEY_HERE
```

## What It Checks

### 🔍 Environment

- Browser/Node.js compatibility
- Google AI SDK availability
- Required dependencies

### 🔑 API Key

- Format validation
- Prefix verification
- Length requirements

### 🌐 Connectivity

- Google AI API reachability
- Models endpoint access
- Request/response timing

### 🎯 Models

- Available Gemini models
- Model response testing
- Capability verification

### 🔗 Services

- App store integration
- Service imports
- Component availability

### ⚡ Performance

- Response times
- Error rates
- Throughput testing

## Understanding Results

### Score Ranges

- **80-100**: 🟢 Excellent - All systems operational
- **60-79**: 🟡 Good - Minor issues, mostly functional
- **40-59**: 🟠 Partial - Some features may not work
- **0-39**: 🔴 Fail - Major configuration needed

### Common Issues

#### "No API key provided"

- Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
- Add it in Settings → AI Configuration

#### "Invalid API key format"

- Gemini API keys start with "AIza"
- Keys should be 30+ characters long
- Check for typos or extra spaces

#### "API key lacks permissions"

- Verify key has Generative AI access in Google AI Studio
- Check API restrictions (HTTP referrers, etc.)

#### "Models endpoint failed: 403/401"

- API key may be invalid or expired
- Check quota limits in Google AI Studio
- Verify billing is enabled if required

#### "Generation timeout"

- Check internet connection
- Try again in a few minutes
- Check Google AI service status

## Integration Examples

### Using in Components

```vue
<script setup>
import { runAISystemsCheck } from '@/utils/ai-systems-check'

const checkAI = async () => {
  const results = await runAISystemsCheck()
  console.log('AI Status:', results.overall.status)
}
</script>
```

### Using in Services

```javascript
import { quickAICheck } from '@/utils/ai-systems-check'

// Verify AI is working before using it
const ensureAIReady = async () => {
  const check = await quickAICheck()
  if (!check.success) {
    throw new Error('AI service not available')
  }
  return true
}
```

## Advanced Usage

### Custom Configuration

```javascript
// Run check with specific API key
await runAISystemsCheck('your-api-key-here')

// Test specific model
await testGoogleAI('your-key', 'gemini-1.5-pro')
```

### Automated Monitoring

```javascript
// Set up periodic health checks
setInterval(
  async () => {
    const status = await quickAICheck()
    if (!status.success) {
      console.warn('AI service degraded:', status.error)
    }
  },
  5 * 60 * 1000
) // Every 5 minutes
```

## Troubleshooting

### Development Environment

1. Ensure `@google/generative-ai` is installed: `npm install @google/generative-ai`
2. Check network connectivity
3. Verify no firewall blocking Google APIs

### Production Environment

1. Check environment variables
2. Verify API key is properly stored
3. Test with different models if one fails

### Getting Help

1. Run full systems check: `await runAISystemsCheck()`
2. Check browser console for detailed errors
3. Verify API key at [Google AI Studio](https://aistudio.google.com/apikey)
4. Test with a fresh API key if needed

---

**Need an API Key?** Get a free one at [Google AI Studio](https://aistudio.google.com/apikey) - no credit card required!
