// Simple test for the events.js stub implementation
import { EventEmitter, once, on, AbortError } from './events.js'

console.log('🧪 Testing EventEmitter implementation...')

// Test 1: Basic event emission and listening
const emitter = new EventEmitter()
let testResult = ''

emitter.on('test', data => {
  testResult = `Received: ${data}`
})

emitter.emit('test', 'Hello World')
console.log(
  '✅ Basic emit/on:',
  testResult === 'Received: Hello World' ? 'PASS' : 'FAIL'
)

// Test 2: Once listener
let onceResult = ''
emitter.once('once-test', data => {
  onceResult = `Once: ${data}`
})

emitter.emit('once-test', 'First')
emitter.emit('once-test', 'Second') // Should not trigger

console.log('✅ Once listener:', onceResult === 'Once: First' ? 'PASS' : 'FAIL')

// Test 3: Remove listener
let removeResult = 0
const incrementer = () => removeResult++

emitter.on('remove-test', incrementer)
emitter.emit('remove-test')
emitter.removeListener('remove-test', incrementer)
emitter.emit('remove-test') // Should not increment

console.log('✅ Remove listener:', removeResult === 1 ? 'PASS' : 'FAIL')

// Test 4: Listener count
emitter.on('count-test', () => {})
emitter.on('count-test', () => {})
console.log(
  '✅ Listener count:',
  emitter.listenerCount('count-test') === 2 ? 'PASS' : 'FAIL'
)

// Test 5: Event names
const eventNames = emitter.eventNames()
console.log(
  '✅ Event names:',
  eventNames.includes('test') && eventNames.includes('count-test')
    ? 'PASS'
    : 'FAIL'
)

// Test 6: Static once method
;(async () => {
  try {
    setTimeout(() => emitter.emit('async-test', 'async-data'), 10)
    const [data] = await EventEmitter.once(emitter, 'async-test')
    console.log('✅ Static once:', data === 'async-data' ? 'PASS' : 'FAIL')
  } catch (error) {
    console.log('❌ Static once: FAIL -', error.message)
  }
})()

// Test 7: Error handling
const errorEmitter = new EventEmitter()
let errorCaught = false

try {
  errorEmitter.emit('error', new Error('Test error'))
} catch (error) {
  errorCaught = error.message === 'Test error'
}

console.log('✅ Error handling:', errorCaught ? 'PASS' : 'FAIL')

// Test 8: Max listeners warning
const maxEmitter = new EventEmitter()
maxEmitter.setMaxListeners(2)

// This should trigger a warning (but not throw)
maxEmitter.on('warn-test', () => {})
maxEmitter.on('warn-test', () => {})
console.log('⚠️  Max listeners warning should appear above')

console.log('🎉 EventEmitter tests completed!')
