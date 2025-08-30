// Local storage utilities for data management (replacing Firebase for now)

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  createdAt: string;
}

export interface Car {
  id: string;
  userId: string;
  carName: string;
  registrationNumber: string;
  chassisNumber: string;
  engineNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  fuelType: string;
  pucExpiry: string;
  insuranceExpiry: string;
  insuranceProvider: string;
  notes: string;
  rcBookUrl?: string; // URL to uploaded RC book file
  insuranceUrl?: string; // URL to uploaded insurance file
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  carId: string;
  userId: string;
  type: 'rc' | 'insurance' | 'puc' | 'license' | 'other';
  name: string;
  expiryDate?: string;
  file?: File | string; // For now, we'll store base64 or file path
  uploadedAt: string;
  updatedAt: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

// Storage keys
const STORAGE_KEYS = {
  AUTH_STATE: 'carassist_auth_state',
  USERS: 'carassist_users',
  CARS: 'carassist_cars',
  DOCUMENTS: 'carassist_documents',
  NOTIFICATIONS: 'carassist_notifications'
};

// Auth functions
export const authStorage = {
  setAuthState: (authState: AuthState): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEYS.AUTH_STATE, JSON.stringify(authState));
    }
  },

  getAuthState: (): AuthState => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_STATE);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return { isAuthenticated: false, user: null };
  },

  clearAuthState: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.AUTH_STATE);
    }
  }
};

// User functions
export const userStorage = {
  createUser: (userData: Omit<User, 'id' | 'createdAt'>): User => {
    const user: User = {
      ...userData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      const users = userStorage.getAllUsers();
      users.push(user);
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }

    return user;
  },

  getAllUsers: (): User[] => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.USERS);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return [];
  },

  getUserByEmail: (email: string): User | null => {
    const users = userStorage.getAllUsers();
    return users.find(user => user.email === email) || null;
  },

  getUserById: (id: string): User | null => {
    const users = userStorage.getAllUsers();
    return users.find(user => user.id === id) || null;
  }
};

// Car functions
export const carStorage = {
  createCar: (carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>): Car => {
    const car: Car = {
      ...carData,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      const cars = carStorage.getAllCars();
      cars.push(car);
      localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
    }

    return car;
  },

  getAllCars: (): Car[] => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.CARS);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return [];
  },

  getCarsByUserId: (userId: string): Car[] => {
    const cars = carStorage.getAllCars();
    return cars.filter(car => car.userId === userId);
  },

  getCarById: (id: string): Car | null => {
    const cars = carStorage.getAllCars();
    return cars.find(car => car.id === id) || null;
  },

  updateCar: (id: string, updates: Partial<Car>): Car | null => {
    if (typeof window !== 'undefined') {
      const cars = carStorage.getAllCars();
      const carIndex = cars.findIndex(car => car.id === id);
      
      if (carIndex !== -1) {
        cars[carIndex] = {
          ...cars[carIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(cars));
        return cars[carIndex];
      }
    }
    return null;
  },

  deleteCar: (id: string): boolean => {
    if (typeof window !== 'undefined') {
      const cars = carStorage.getAllCars();
      const filteredCars = cars.filter(car => car.id !== id);
      
      if (filteredCars.length !== cars.length) {
        localStorage.setItem(STORAGE_KEYS.CARS, JSON.stringify(filteredCars));
        return true;
      }
    }
    return false;
  }
};

// Document functions
export const documentStorage = {
  createDocument: (docData: Omit<Document, 'id' | 'uploadedAt' | 'updatedAt'>): Document => {
    const document: Document = {
      ...docData,
      id: generateId(),
      uploadedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      const documents = documentStorage.getAllDocuments();
      documents.push(document);
      localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
    }

    return document;
  },

  getAllDocuments: (): Document[] => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.DOCUMENTS);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return [];
  },

  getDocumentsByCarId: (carId: string): Document[] => {
    const documents = documentStorage.getAllDocuments();
    return documents.filter(doc => doc.carId === carId);
  },

  getDocumentsByUserId: (userId: string): Document[] => {
    const documents = documentStorage.getAllDocuments();
    return documents.filter(doc => doc.userId === userId);
  },

  updateDocument: (id: string, updates: Partial<Document>): Document | null => {
    if (typeof window !== 'undefined') {
      const documents = documentStorage.getAllDocuments();
      const docIndex = documents.findIndex(doc => doc.id === id);
      
      if (docIndex !== -1) {
        documents[docIndex] = {
          ...documents[docIndex],
          ...updates,
          updatedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(documents));
        return documents[docIndex];
      }
    }
    return null;
  },

  deleteDocument: (id: string): boolean => {
    if (typeof window !== 'undefined') {
      const documents = documentStorage.getAllDocuments();
      const filteredDocs = documents.filter(doc => doc.id !== id);
      
      if (filteredDocs.length !== documents.length) {
        localStorage.setItem(STORAGE_KEYS.DOCUMENTS, JSON.stringify(filteredDocs));
        return true;
      }
    }
    return false;
  }
};

// Notification functions
export interface Notification {
  id: string;
  userId: string;
  type: 'expiry' | 'fine' | 'reminder' | 'info';
  title: string;
  message: string;
  carId?: string;
  documentId?: string;
  isRead: boolean;
  createdAt: string;
  expiryDate?: string;
}

export const notificationStorage = {
  createNotification: (notifData: Omit<Notification, 'id' | 'createdAt'>): Notification => {
    const notification: Notification = {
      ...notifData,
      id: generateId(),
      createdAt: new Date().toISOString()
    };

    if (typeof window !== 'undefined') {
      const notifications = notificationStorage.getAllNotifications();
      notifications.push(notification);
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    }

    return notification;
  },

  getAllNotifications: (): Notification[] => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (stored) {
        return JSON.parse(stored);
      }
    }
    return [];
  },

  getNotificationsByUserId: (userId: string): Notification[] => {
    const notifications = notificationStorage.getAllNotifications();
    return notifications.filter(notif => notif.userId === userId);
  },

  markAsRead: (id: string): boolean => {
    if (typeof window !== 'undefined') {
      const notifications = notificationStorage.getAllNotifications();
      const notifIndex = notifications.findIndex(notif => notif.id === id);
      
      if (notifIndex !== -1) {
        notifications[notifIndex].isRead = true;
        localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
        return true;
      }
    }
    return false;
  }
};

// Utility function to generate unique IDs
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Authentication utilities
export const authUtils = {
  login: async (email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Built-in demo credentials
    const demoCreds: Record<string, { password: string; fullName: string; phone: string }> = {
      'test@test.com': { password: 'test123', fullName: 'Test User', phone: '0000000000' },
      'demo@demo.com': { password: 'demo123', fullName: 'Demo User', phone: '0000000000' },
      'user@example.com': { password: 'password', fullName: 'Example User', phone: '0000000000' }
    };

    const normalizedEmail = email.toLowerCase();
    let user = userStorage.getUserByEmail(normalizedEmail);

    // If no user exists, check demo credentials and auto-create the user
    if (!user) {
      const demo = demoCreds[normalizedEmail];
      if (demo && demo.password === password) {
        user = userStorage.createUser({
          fullName: demo.fullName,
          email: normalizedEmail,
          phone: demo.phone
        });
      }
    }

    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // In a real app, verify password securely. For demo users we checked above;
    // for registered users, accept any non-empty password to keep the flow simple.
    if (!demoCreds[normalizedEmail] && !password) {
      return { success: false, error: 'Invalid password' };
    }

    const authState: AuthState = {
      isAuthenticated: true,
      user
    };

    authStorage.setAuthState(authState);
    return { success: true, user };
  },

  register: async (userData: {
    fullName: string;
    email: string;
    phone: string;
    password: string;
  }): Promise<{ success: boolean; user?: User; error?: string }> => {
    // Check if user already exists
    const existingUser = userStorage.getUserByEmail(userData.email);
    
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    // Create new user
    const user = userStorage.createUser({
      fullName: userData.fullName,
      email: userData.email,
      phone: userData.phone
    });

    const authState: AuthState = {
      isAuthenticated: true,
      user
    };

    authStorage.setAuthState(authState);
    
    return { success: true, user };
  },

  logout: (): void => {
    authStorage.clearAuthState();
  },

  getCurrentUser: (): User | null => {
    const authState = authStorage.getAuthState();
    return authState.user;
  },

  isAuthenticated: (): boolean => {
    const authState = authStorage.getAuthState();
    return authState.isAuthenticated;
  }
};

// Document expiry checker
export const checkDocumentExpiry = (userId: string): Notification[] => {
  const documents = documentStorage.getDocumentsByUserId(userId);
  const cars = carStorage.getCarsByUserId(userId);
  const notifications: Notification[] = [];
  const today = new Date();
  const thirtyDaysFromNow = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));

  // Check document expiries
  documents.forEach(doc => {
    if (doc.expiryDate) {
      const expiryDate = new Date(doc.expiryDate);
      const car = cars.find(c => c.id === doc.carId);
      
      if (expiryDate <= thirtyDaysFromNow) {
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        notifications.push({
          id: generateId(),
          userId,
          type: 'expiry',
          title: `${doc.type.toUpperCase()} expiring soon!`,
          message: `${car?.carName || 'Your car'}'s ${doc.type} expires in ${daysUntilExpiry} days`,
          carId: doc.carId,
          documentId: doc.id,
          isRead: false,
          createdAt: new Date().toISOString(),
          expiryDate: doc.expiryDate
        });
      }
    }
  });

  // Check car compliance expiries (PUC, Insurance)
  cars.forEach(car => {
    if (car.pucExpiry) {
      const pucDate = new Date(car.pucExpiry);
      if (pucDate <= thirtyDaysFromNow) {
        const daysUntilExpiry = Math.ceil((pucDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        notifications.push({
          id: generateId(),
          userId,
          type: 'expiry',
          title: 'PUC expiring soon!',
          message: `${car.carName}'s PUC expires in ${daysUntilExpiry} days`,
          carId: car.id,
          isRead: false,
          createdAt: new Date().toISOString(),
          expiryDate: car.pucExpiry
        });
      }
    }

    if (car.insuranceExpiry) {
      const insuranceDate = new Date(car.insuranceExpiry);
      if (insuranceDate <= thirtyDaysFromNow) {
        const daysUntilExpiry = Math.ceil((insuranceDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        notifications.push({
          id: generateId(),
          userId,
          type: 'expiry',
          title: 'Insurance expiring soon!',
          message: `${car.carName}'s insurance expires in ${daysUntilExpiry} days`,
          carId: car.id,
          isRead: false,
          createdAt: new Date().toISOString(),
          expiryDate: car.insuranceExpiry
        });
      }
    }
  });

  return notifications;
};
