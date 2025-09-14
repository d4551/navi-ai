// Canonical API module entrypoint
// Centralized API layer with controllers, schemas, and routing

export * from './schemas';
export * from './controllers';
export * from './routes';

// Re-export main controllers for easy access
export {
  JobSearchController,
  ResumeController, 
  PortfolioController,
  AIController,
  ProviderHealthController
} from './controllers';

// Centralized API client
export class APIClient {
  private static baseURL = '/api/v1';

  static async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  }

  static async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  static async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  static async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT', 
      body: JSON.stringify(data)
    });
  }

  static async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

