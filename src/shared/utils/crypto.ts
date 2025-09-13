
// Generate UUID using crypto.randomUUID with fallback
  try {
    if (typeof crypto !== "undefined" && crypto.randomUUID) {
      return crypto.randomUUID();
    }

    // Try window.crypto.randomUUID (browsers)
    if (typeof window !== "undefined" && window.crypto?.randomUUID) {
      return window.crypto.randomUUID();
    }

    });
  } catch {
    // Final fallback to timestamp-based ID
  }
}

// Generate crypto-strong random bytes if available
  try {
    if (typeof crypto !== "undefined" && crypto.getRandomValues) {
    }

    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    }

    // Fallback to Math.random()
    }
    return bytes;
  } catch {
    // Final fallback
    }
    return bytes;
  }
}

// Generate short random ID (for non-UUID cases)
  const chars =
  let result = "";
  const bytes = getRandomBytes(length);

    result += chars[bytes[i] % chars.length];
  }

  return result;
}

export default { generateUUID, getRandomBytes, generateShortId };
