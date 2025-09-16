/**
 * API Client for Allergy Alert Application
 * Handles all HTTP requests and API interactions
 */

// Types for API requests and responses
export interface AllergyFormData {
  name: string;
  email: string;
  allergies: string[];
  emergencyContact?: string;
  submittedAt: string;
}

export interface MenuAnalysisRequest {
  option: 'picture' | 'text';
  timestamp: string;
  // Picture-specific fields
  fileName?: string;
  fileSize?: number;
  fileType?: string;
  imageData?: string; // base64 encoded image
  // Text-specific fields
  restaurantName?: string;
  foodName?: string;
}

export interface AllergenMatch {
  allergen: string;
  confidence: number;
  location?: string;
  severity: 'low' | 'medium' | 'high';
}

export interface MenuAnalysisResponse {
  success: boolean;
  analysisId: string;
  allergenMatches: AllergenMatch[];
  safeToEat: boolean;
  warnings: string[];
  recommendations: string[];
  processedAt: string;
}

export interface ApiError {
  error: string;
  message: string;
  code?: number;
  details?: any;
}

export type ApiResponse<T> = {
  success: true;
  data: T;
} | {
  success: false;
  error: ApiError;
};

/**
 * Base API Client Configuration
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * HTTP Client with error handling and type safety
 */
class ApiClient {
  private baseUrl: string;
  private timeout: number;

  constructor(baseUrl: string = API_BASE_URL, timeout: number = DEFAULT_TIMEOUT) {
    this.baseUrl = baseUrl;
    this.timeout = timeout;
  }

  /**
   * Generic request method with timeout and error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const url = `${this.baseUrl}${endpoint}`;
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: {
            error: 'HTTP_ERROR',
            message: `Request failed with status ${response.status}`,
            code: response.status,
            details: errorData,
          },
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: {
            error: 'TIMEOUT',
            message: 'Request timed out',
          },
        };
      }

      return {
        success: false,
        error: {
          error: 'NETWORK_ERROR',
          message: error.message || 'Network request failed',
          details: error,
        },
      };
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  /**
   * Upload file with progress tracking
   */
  async uploadFile<T>(
    endpoint: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<T>> {
    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append('file', file);
      
      // Add additional data to form
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          formData.append(key, typeof value === 'string' ? value : JSON.stringify(value));
        });
      }

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = (event.loaded / event.total) * 100;
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', async () => {
        try {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve({ success: true, data });
          } else {
            const errorData = JSON.parse(xhr.responseText).catch(() => ({}));
            resolve({
              success: false,
              error: {
                error: 'UPLOAD_ERROR',
                message: `Upload failed with status ${xhr.status}`,
                code: xhr.status,
                details: errorData,
              },
            });
          }
        } catch (error: any) {
          resolve({
            success: false,
            error: {
              error: 'PARSE_ERROR',
              message: 'Failed to parse response',
              details: error,
            },
          });
        }
      });

      xhr.addEventListener('error', () => {
        resolve({
          success: false,
          error: {
            error: 'NETWORK_ERROR',
            message: 'Upload failed due to network error',
          },
        });
      });

      xhr.addEventListener('timeout', () => {
        resolve({
          success: false,
          error: {
            error: 'TIMEOUT',
            message: 'Upload timed out',
          },
        });
      });

      xhr.timeout = this.timeout;
      xhr.open('POST', `${this.baseUrl}${endpoint}`);
      xhr.send(formData);
    });
  }
}

// Create singleton instance
const apiClient = new ApiClient();

/**
 * Allergy Alert API Functions
 */
export const allergyApi = {
  /**
   * Submit allergy form data
   */
  submitAllergyForm: async (data: AllergyFormData): Promise<ApiResponse<{ id: string }>> => {
    return apiClient.post<{ id: string }>('/allergies/submit', data);
  },

  /**
   * Get user's allergy profile
   */
  getAllergyProfile: async (userId: string): Promise<ApiResponse<AllergyFormData>> => {
    return apiClient.get<AllergyFormData>(`/allergies/profile/${userId}`);
  },

  /**
   * Update allergy profile
   */
  updateAllergyProfile: async (
    userId: string,
    data: Partial<AllergyFormData>
  ): Promise<ApiResponse<AllergyFormData>> => {
    return apiClient.put<AllergyFormData>(`/allergies/profile/${userId}`, data);
  },

  /**
   * Analyze menu for allergens (text-based)
   */
  analyzeMenuText: async (data: MenuAnalysisRequest): Promise<ApiResponse<MenuAnalysisResponse>> => {
    return apiClient.post<MenuAnalysisResponse>('/menu/analyze-text', data);
  },

  /**
   * Analyze menu image for allergens
   */
  analyzeMenuImage: async (
    file: File,
    additionalData: Omit<MenuAnalysisRequest, 'fileName' | 'fileSize' | 'fileType'>,
    onProgress?: (progress: number) => void
  ): Promise<ApiResponse<MenuAnalysisResponse>> => {
    const requestData = {
      ...additionalData,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    };

    return apiClient.uploadFile<MenuAnalysisResponse>(
      '/menu/analyze-image',
      file,
      requestData,
      onProgress
    );
  },

  /**
   * Get analysis history
   */
  getAnalysisHistory: async (userId: string): Promise<ApiResponse<MenuAnalysisResponse[]>> => {
    return apiClient.get<MenuAnalysisResponse[]>(`/menu/history/${userId}`);
  },

  /**
   * Get specific analysis result
   */
  getAnalysisResult: async (analysisId: string): Promise<ApiResponse<MenuAnalysisResponse>> => {
    return apiClient.get<MenuAnalysisResponse>(`/menu/analysis/${analysisId}`);
  },
};

/**
 * Utility functions for common operations
 */
export const apiUtils = {
  /**
   * Handle API response with error logging
   */
  handleResponse: async <T>(
    response: ApiResponse<T>,
    onSuccess?: (data: T) => void,
    onError?: (error: ApiError) => void
  ): Promise<T | null> => {
    if (response.success) {
      if (onSuccess) onSuccess(response.data);
      return response.data;
    } else {
      console.error('API Error:', response.error);
      if (onError) onError(response.error);
      return null;
    }
  },

  /**
   * Convert File to base64 string
   */
  fileToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/...;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  },

  /**
   * Validate image file
   */
  validateImageFile: (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: 'Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.',
      };
    }

    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'File size too large. Please upload an image smaller than 10MB.',
      };
    }

    return { isValid: true };
  },

  /**
   * Format API error for user display
   */
  formatErrorMessage: (error: ApiError): string => {
    switch (error.error) {
      case 'NETWORK_ERROR':
        return 'Unable to connect to the server. Please check your internet connection.';
      case 'TIMEOUT':
        return 'Request timed out. Please try again.';
      case 'HTTP_ERROR':
        if (error.code === 404) return 'The requested resource was not found.';
        if (error.code === 500) return 'Server error. Please try again later.';
        if (error.code === 429) return 'Too many requests. Please wait and try again.';
        return error.message || 'An error occurred while processing your request.';
      default:
        return error.message || 'An unexpected error occurred.';
    }
  },
};

export default apiClient;