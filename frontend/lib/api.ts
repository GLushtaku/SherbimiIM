const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface User {
  id: string;
  email: string;
  name: string;
  phoneNumber: string;
  role: string;
  createdAt: string;
  businessProfile?: {
    id: string;
    companyName?: string;
    businessLicense?: string;
    taxId?: string;
    yearsInBusiness?: number;
    emergencyContact?: string;
    alternatePhone?: string;
    acceptsWalkIns?: boolean;
    appointmentRequired?: boolean;
    maxBookingsPerDay?: number;
  };
  clientProfile?: {
    id: string;
    dateOfBirth?: string;
    gender?: string;
    emergencyContact?: string;
    preferredContact?: string;
    notificationPreferences?: Record<string, unknown>;
    totalBookings?: number;
    loyaltyPoints?: number;
  };
}

export interface Business {
  id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
  businessId: string;
  categoryId?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  business?: {
    id: string;
    name: string;
    city?: string;
    address?: string;
    phoneNumber?: string;
    website?: string;
  };
  category?: {
    id: string;
    name: string;
    description?: string;
    icon?: string;
  };
  employeeServices?: {
    employee: {
      id: string;
      name: string;
      position?: string;
      avatar?: string;
    };
  }[];
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  services?: number;
  businessCount?: number;
  createdAt: string;
  updatedAt: string;
}
export interface Employee {
  id: string;
  name: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  position?: string;
  isActive?: boolean;
  businessId: string;
  business?: {
    id: string;
    name: string;
  };
  employeeServices?: Array<{
    service: {
      id: string;
      name: string;
      price?: number;
      durationMinutes?: number;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}
export interface Booking {
  id: string;
  clientId: string;
  serviceId: string;
  employeeId: string;
  start: string;
  end: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Related data
  client?: {
    id: string;
    name: string;
    email: string;
    phoneNumber?: string;
  };
  service?: {
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
  };
  employee?: {
    id: string;
    name: string;
    position: string;
  };
}

export interface CreateBookingData {
  serviceId: string;
  employeeId: string;
  start: string;
  end: string;
  notes?: string;
}

export interface UpdateBookingData {
  start?: string;
  end?: string;
  status?: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
}

export interface AvailabilityCheck {
  serviceId: string;
  employeeId: string;
  date: string;
}

export interface AvailabilityResponse {
  availableSlots: string[];
  reservedSlots: string[];
  allSlots?: {
    time: string;
    available: boolean;
  }[];
}

export interface Author {
  id: string;
  name: string;
  surname: string;
  email: string;
  books?: Book[];
  createdAt: string;
  updatedAt: string;
}

export interface Book {
  id: string;
  name: string;
  authorId: string;
  author?: Author;
}

export interface PlatformStats {
  businesses: number;
  clients: number;
  totalUsers: number;
  categories: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalServices: number;
  completionRate: number;
  averageBookingsPerBusiness: number;
  averageServicesPerBusiness: number;
}

export interface DashboardStats {
  totalBookings: number;
  totalServices: number;
  totalEmployees: number;
  recentBookings: number;
  monthlyBookings: number;
  bookingsGrowth: number;
  servicesGrowth: number;
}

// API Error class
export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

// Base API client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // Important for session-based auth
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
          if (response.status === 401) {
            errorMessage = "Email ose fjalëkalimi janë gabim";
          } else if (response.status === 403) {
            errorMessage = "Nuk keni të drejta për të kryer këtë veprim";
          } else if (response.status === 400) {
            errorMessage = "Të dhënat e dërguara nuk janë të vlefshme";
          } else if (response.status === 500) {
            errorMessage = "Gabim në server";
          }
        }

        throw new ApiError(response.status, errorMessage);
      }

      // Handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        0,
        `Gabim në lidhje: ${
          error instanceof Error ? error.message : "Gabim i panjohur"
        }`
      );
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }

  // POST request
  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

// Create API client instance
const apiClient = new ApiClient(API_BASE_URL || "");

//Authentication API

export const authApi = {
  //Register new user
  register: (userData: {
    email: string;
    password: string;
    name: string;
    role: "CLIENT" | "BUSINESS";
  }) => apiClient.post<{ user: User }>("/auth/register", userData),

  // Login user
  login: (credentials: { email: string; password: string; userType: string }) =>
    apiClient.post<{ user: User }>("/auth/login", credentials),

  // Logout user
  logout: () => apiClient.post("/auth/logout"),

  // Get current user
  getCurrentUser: () => apiClient.get<{ user: User }>("/auth/me"),

  // Update user profile
  updateProfile: (profileData: {
    name?: string;
    phoneNumber?: string;
    profileData?: {
      businessProfile?: {
        companyName?: string;
        businessLicense?: string;
        taxId?: string;
        yearsInBusiness?: number;
        emergencyContact?: string;
        alternatePhone?: string;
        acceptsWalkIns?: boolean;
        appointmentRequired?: boolean;
        maxBookingsPerDay?: number;
      };
      clientProfile?: {
        dateOfBirth?: string;
        gender?: string;
        emergencyContact?: string;
        preferredContact?: string;
        notificationPreferences?: Record<string, unknown>;
      };
    };
  }) =>
    apiClient.put<{ message: string; user: User }>(
      "/auth/profile",
      profileData
    ),

  // Update password
  updatePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
  }) => apiClient.put<{ message: string }>("/auth/password", passwordData),
};

// Business API
export const businessApi = {
  // Public endpoints (no authentication required)
  getAllBusinesses: () => publicApiClient.get<Business[]>("/businesses"),
  getBusinessById: (id: string) =>
    publicApiClient.get<Business>(`/businesses/${id}`),
};

// Public API client for services (no authentication required)
class PublicApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      // No credentials for public endpoints
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;

        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch {
          // If response is not JSON, use default message
          if (response.status === 400) {
            errorMessage = "Të dhënat e dërguara nuk janë të vlefshme";
          } else if (response.status === 500) {
            errorMessage = "Gabim në server";
          }
        }

        throw new ApiError(response.status, errorMessage);
      }

      // Handle empty responses
      const text = await response.text();
      return text ? JSON.parse(text) : ({} as T);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        0,
        `Gabim në lidhje: ${
          error instanceof Error ? error.message : "Gabim i panjohur"
        }`
      );
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "GET" });
  }
}

// Create public API client instance
const publicApiClient = new PublicApiClient(API_BASE_URL || "");

//Service API
export const serviceApi = {
  // Public endpoints (no authentication required)
  getAllServices: () =>
    publicApiClient.get<{ services: Service[] }>("/services"),
  getServiceById: (id: string) =>
    publicApiClient.get<Service>(`/services/${id}`),

  // Protected endpoints (authentication required)
  getBusinessServices: () =>
    apiClient.get<{ services: Service[] }>("/services/business"),
  createService: (service: Partial<Service>) =>
    apiClient.post<Service>("/services", service),
  updateService: (id: string, service: Partial<Service>) =>
    apiClient.put<Service>(`/services/${id}`, service),
  deleteService: (id: string) => apiClient.delete<Service>(`/services/${id}`),
};

// Category API
export const categoryApi = {
  // Public endpoints (no authentication required)
  getAllCategories: () =>
    publicApiClient.get<{ categories: Category[] }>("/categories"),

  getCategoryByName: (name: string) =>
    publicApiClient.get<Category>(`/categories/${name}`),

  // Protected endpoints (authentication required)
  createCategory: (categoryData: { name: string; description?: string }) =>
    apiClient.post<Category>("/categories/create", categoryData),
};

//Employe API {require bussines authentication}
export const employeeApi = {
  // Get all employees
  getAllEmployees: () => apiClient.get<{ employees: Employee[] }>("/employees"),

  // Get employee by ID
  getEmployeeById: (id: string) => apiClient.get<Employee>(`/employees/${id}`),

  // Create employee
  createEmployee: (employeeData: {
    name: string;
    email: string;
    phoneNumber?: string;
    position?: string;
    isActive?: boolean;
  }) => apiClient.post<Employee>("/employees", employeeData),

  // Update employee
  updateEmployee: (
    id: string,
    employeeData: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      position?: string;
      isActive?: boolean;
    }
  ) => apiClient.put<Employee>(`/employees/${id}`, employeeData),

  // Delete employee
  deleteEmployee: (id: string) => apiClient.delete(`/employees/${id}`),

  // Assign service to employee
  assignServiceToEmployee: (employeeId: string, serviceId: string) =>
    apiClient.post(`/employees/${employeeId}/services`, { serviceId }),

  // Remove service from employee
  removeServiceFromEmployee: (employeeId: string, serviceId: string) =>
    apiClient.delete(`/employees/${employeeId}/services/${serviceId}`),
};

// Booking API (requires client authentication)
export const bookingApi = {
  // Get all bookings
  getAllBookings: (params?: { date?: string; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.append("date", params.date);
    if (params?.limit) searchParams.append("limit", params.limit.toString());

    const queryString = searchParams.toString();
    return apiClient.get<Booking[]>(
      `/bookings${queryString ? `?${queryString}` : ""}`
    );
  },

  // Get booking by ID
  getBookingById: (id: string) => apiClient.get<Booking>(`/bookings/${id}`),

  // Create new booking
  createBooking: (data: CreateBookingData) =>
    apiClient.post<Booking>("/bookings", data),

  // Update booking
  updateBooking: (id: string, data: UpdateBookingData) =>
    apiClient.put<Booking>(`/bookings/${id}`, data),

  // Delete booking
  deleteBooking: (id: string) => apiClient.delete(`/bookings/${id}`),

  // Check availability
  checkAvailability: (data: AvailabilityCheck) =>
    apiClient.post<AvailabilityResponse>("/bookings/availability", data),
};

// Author API
export const authorApi = {
  // Create author
  createAuthor: (authorData: {
    name: string;
    surname: string;
    email: string;
    books?: Array<{
      title: string;
      isbn?: string;
      publishedDate?: string;
      description?: string;
    }>;
  }) => apiClient.post<Author>("/authors", authorData),

  // Get all authors
  getAllAuthors: () => apiClient.get<Author[]>("/authors"),

  // Get author by ID
  getAuthorById: (id: string) => apiClient.get<Author>(`/authors/${id}`),

  // Update author
  updateAuthor: (
    id: string,
    authorData: {
      name?: string;
      surname?: string;
      email?: string;
      books?: Array<{
        title: string;
        isbn?: string;
        publishedDate?: string;
        description?: string;
      }>;
    }
  ) => apiClient.put<Author>(`/authors/${id}`, authorData),

  // Delete author
  deleteAuthor: (id: string) => apiClient.delete(`/authors/${id}`),
};

// Book API
export const bookApi = {
  // Get all books
  getAllBooks: () => apiClient.get<Book[]>("/books"),

  // Create book
  createBook: (bookData: { title: string; authorId: string }) =>
    apiClient.post<Book>("/books", bookData),

  // Get book by ID
  getBookById: (id: string) => apiClient.get<Book>(`/books/${id}`),

  // Update book
  updateBook: (id: string, bookData: { name: string; authorId: string }) =>
    apiClient.put<Book>(`/books/${id}`, bookData),

  // Delete book
  deleteBook: (id: string) => apiClient.delete(`/books/${id}`),
};

// Stats API
export const statsApi = {
  // Public endpoints (no authentication required)
  getPlatformStats: () =>
    publicApiClient.get<{ stats: PlatformStats }>("/stats"),

  // Protected endpoints (authentication required)
  getDashboardStats: () =>
    apiClient.get<{ stats: DashboardStats }>("/stats/dashboard"),
};

export { apiClient };
