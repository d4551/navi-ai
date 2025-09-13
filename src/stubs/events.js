
console.warn(
  "Node.js events module - using enhanced browser-compatible implementation",
);

// Enhanced EventEmitter implementation
class EventEmitter {
  constructor(options = {}) {
    this._events = new Map();
    this._captureRejections = options.captureRejections || false;
  }

  // Core EventEmitter methods
  on(event, listener) {
    return this.addListener(event, listener);
  }

  addListener(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }

    if (!this._events.has(event)) {
      this._events.set(event, []);
    }

    const listeners = this._events.get(event);

    // Check max listeners warning
    if (listeners.length >= this.getMaxListeners()) {
      console.warn(`Possible EventEmitter memory leak detected. ${listeners.length + 1} ${event} listeners added.`);
    }

    listeners.push(listener);
    this.emit("newListener", event, listener);

    return this;
  }

  once(event, listener) {
    if (typeof listener !== 'function') {
      throw new TypeError('listener must be a function');
    }

    const wrapper = (...args) => {
      this.removeListener(event, wrapper);
      listener.apply(this, args);
    };

    wrapper.listener = listener;

    return this.addListener(event, wrapper);
  }

  off(event, listener) {
    return this.removeListener(event, listener);
  }

  removeListener(event, listener) {
    const listeners = this._events.get(event);
    if (!listeners) {
      return this;
    }

    // Find the listener or its wrapper
    for (let i = listeners.length - 1; i >= 0; i--) {
      const currentListener = listeners[i];
      if (
        currentListener === listener ||
        currentListener.listener === listener
      ) {
        listeners.splice(i, 1);
        this.emit("removeListener", event, listener);
        break;
      }
    }

    // Clean up empty event arrays
    if (listeners.length === 0) {
      this._events.delete(event);
    }

    return this;
  }

  removeAllListeners(event) {
    if (event === undefined) {
      // Remove all listeners for all events
      const events = Array.from(this._events.keys());
      for (const eventName of events) {
        this.removeAllListeners(eventName);
      }
      return this;
    }

    const listeners = this._events.get(event);
    if (listeners) {
      // Emit removeListener for each listener
      for (const listener of listeners.slice()) {
        this.emit("removeListener", event, listener);
      }
      this._events.delete(event);
    }

    return this;
  }

  emit(event, ...args) {
    const listeners = this._events.get(event);
    if (!listeners || listeners.length === 0) {
      // Special handling for 'error' events
      if (event === "error") {
        const error = args[0];
        if (error instanceof Error) {
          throw error;
        } else {
          throw new Error(`Unhandled 'error' event: ${error}`);
        }
      }
      return false;
    }

    for (const listener of listeners.slice()) {
      try {
        listener.apply(this, args);
      } catch (error) {
        if (this._captureRejections) {
          this.emit("error", error);
        } else {
          // Defer error to next tick to prevent sync errors
          setTimeout(() => {
            throw error;
          }, 0);
        }
      }
    }

    return true;
  }

  // EventEmitter utility methods
  listenerCount(event) {
    const listeners = this._events.get(event);
    return listeners ? listeners.length : 0;
  }

  listeners(event) {
    const listeners = this._events.get(event);
    return listeners ? listeners.slice() : [];
  }

  rawListeners(event) {
    return this.listeners(event);
  }

  eventNames() {
    return Array.from(this._events.keys());
  }

  setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || !Number.isInteger(n)) {
      throw new RangeError(
        'The value of "n" is out of range. It must be a non-negative number.',
      );
    }
    this._maxListeners = n;
    return this;
  }

  getMaxListeners() {
    return this._maxListeners ?? EventEmitter.defaultMaxListeners;
  }

  // Static methods
  static listenerCount(emitter, event) {
    return emitter.listenerCount(event);
  }

  static once(emitter, name) {
    return new Promise((resolve, reject) => {
      const errorListener = (error) => {
        emitter.removeListener(name, resolver);
        reject(error);
      };

      const resolver = (...args) => {
        emitter.removeListener("error", errorListener);
        resolve(args);
      };

      emitter.once(name, resolver);
      if (name !== "error") {
        emitter.once("error", errorListener);
      }
    });
  }

  static on(emitter, event) {
    // Simplified async iterator implementation
    const events = [];
    let resolve = null;
    let finished = false;

    const listener = (...args) => {
      if (resolve) {
        resolve({ value: args, done: false });
        resolve = null;
      } else {
        events.push(args);
      }
    };

    emitter.on(event, listener);

    return {
      [Symbol.asyncIterator]() {
        return this;
      },
      async next() {
        if (events.length > 0) {
          return { value: events.shift(), done: false };
        }
        if (finished) {
          return { value: undefined, done: true };
        }
        return new Promise((res) => {
          resolve = res;
        });
      },
      async return() {
        finished = true;
        emitter.removeListener(event, listener);
        return { value: undefined, done: true };
      },
    };
  }

  // Default max listeners
  static defaultMaxListeners = 10;
}

// Default max listeners
EventEmitter.defaultMaxListeners = 10;

// Export for ES modules
export { EventEmitter };
export default EventEmitter;

// Additional Node.js events module exports
export const once = EventEmitter.once;
export const on = EventEmitter.on;

// Error classes
export class AbortError extends Error {
  constructor(message = "The operation was aborted") {
    super(message);
    this.name = "AbortError";
  }
}

export function getEventListeners(emitter, name) {
  return emitter.listeners(name);
}

export function setMaxListeners(n, ...eventTargets) {
  for (const target of eventTargets) {
    target.setMaxListeners(n);
  }
}

// Browser-specific enhancements
if (typeof window !== "undefined") {
  console.info("Enhanced EventEmitter available in browser environment with full Node.js compatibility");
}
