const API_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL,
  apiKey: process.env.NEXT_PUBLIC_API_KEY
}

class ApiService {
  private baseUrl: string = API_CONFIG.baseUrl || ""
  private apiKey: string = API_CONFIG.apiKey || ""

  constructor() {
    // Values are initialized directly in the property declarations
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    const config: RequestInit = {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": this.apiKey,
        ...options.headers,
      },
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error("[v0] API request failed:", error)
      throw error
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" })
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" })
  }
}

export const apiService = new ApiService()
