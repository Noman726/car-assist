// Firebase storage utilities for data management
import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from './firebase';
import { Car, Document, User } from './storage';

// Type definitions with Firebase timestamps
export interface FirebaseCar extends Omit<Car, 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FirebaseDocument extends Omit<Document, 'uploadedAt' | 'updatedAt'> {
  uploadedAt: Timestamp;
  updatedAt: Timestamp;
}

// Helper function to convert Firestore timestamps to ISO strings
const convertTimestampsToStrings = (data: any) => {
  const converted = { ...data };
  if (converted.createdAt && converted.createdAt.toDate) {
    converted.createdAt = converted.createdAt.toDate().toISOString();
  }
  if (converted.updatedAt && converted.updatedAt.toDate) {
    converted.updatedAt = converted.updatedAt.toDate().toISOString();
  }
  if (converted.uploadedAt && converted.uploadedAt.toDate) {
    converted.uploadedAt = converted.uploadedAt.toDate().toISOString();
  }
  return converted;
};

// File upload utilities
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

// Car functions with Firebase
export const firebaseCarStorage = {
  createCar: async (
    carData: Omit<Car, 'id' | 'createdAt' | 'updatedAt'>, 
    files?: { rcBook?: File; insurance?: File }
  ): Promise<Car> => {
    try {
      const carDataWithFiles: any = { ...carData };
      
      // Upload files if provided
      if (files?.rcBook) {
        const rcBookPath = `cars/${carData.userId}/${Date.now()}_rcbook_${files.rcBook.name}`;
        carDataWithFiles.rcBookUrl = await uploadFile(files.rcBook, rcBookPath);
      }
      
      if (files?.insurance) {
        const insurancePath = `cars/${carData.userId}/${Date.now()}_insurance_${files.insurance.name}`;
        carDataWithFiles.insuranceUrl = await uploadFile(files.insurance, insurancePath);
      }

      const docRef = await addDoc(collection(db, 'cars'), {
        ...carDataWithFiles,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Get the created document to return with proper formatting
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return convertTimestampsToStrings({
          id: docSnap.id,
          ...data
        });
      }
      
      throw new Error('Failed to create car document');
    } catch (error) {
      console.error('Error creating car:', error);
      throw error;
    }
  },

  getAllCars: async (): Promise<Car[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'cars'));
      const cars: Car[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cars.push(convertTimestampsToStrings({
          id: doc.id,
          ...data
        }));
      });
      
      return cars;
    } catch (error) {
      console.error('Error getting cars:', error);
      throw error;
    }
  },

  getCarsByUserId: async (userId: string): Promise<Car[]> => {
    try {
      const q = query(
        collection(db, 'cars'), 
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const cars: Car[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        cars.push(convertTimestampsToStrings({
          id: doc.id,
          ...data
        }));
      });
      
      // Sort by createdAt in JavaScript instead of in the query
      cars.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // desc order
      });
      
      return cars;
    } catch (error) {
      console.error('Error getting cars by user ID:', error);
      throw error;
    }
  },

  getCarById: async (id: string): Promise<Car | null> => {
    try {
      const docRef = doc(db, 'cars', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return convertTimestampsToStrings({
          id: docSnap.id,
          ...data
        });
      }
      
      return null;
    } catch (error) {
      console.error('Error getting car by ID:', error);
      throw error;
    }
  },

  updateCar: async (id: string, updates: Partial<Omit<Car, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Car | null> => {
    try {
      const docRef = doc(db, 'cars', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Get the updated document
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return convertTimestampsToStrings({
          id: docSnap.id,
          ...data
        });
      }
      
      return null;
    } catch (error) {
      console.error('Error updating car:', error);
      throw error;
    }
  },

  deleteCar: async (id: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'cars', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting car:', error);
      throw error;
    }
  }
};

// Document functions with Firebase
export const firebaseDocumentStorage = {
  createDocument: async (docData: Omit<Document, 'id' | 'uploadedAt' | 'updatedAt'>): Promise<Document> => {
    try {
      const docRef = await addDoc(collection(db, 'documents'), {
        ...docData,
        uploadedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Get the created document to return with proper formatting
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return convertTimestampsToStrings({
          id: docSnap.id,
          ...data
        });
      }
      
      throw new Error('Failed to create document');
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  getDocumentsByCarId: async (carId: string): Promise<Document[]> => {
    try {
      const q = query(
        collection(db, 'documents'), 
        where('carId', '==', carId)
      );
      
      const querySnapshot = await getDocs(q);
      const documents: Document[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push(convertTimestampsToStrings({
          id: doc.id,
          ...data
        }));
      });
      
      // Sort by uploadedAt in JavaScript instead of in the query
      documents.sort((a, b) => {
        const dateA = new Date(a.uploadedAt || 0).getTime();
        const dateB = new Date(b.uploadedAt || 0).getTime();
        return dateB - dateA; // desc order
      });
      
      return documents;
    } catch (error) {
      console.error('Error getting documents by car ID:', error);
      throw error;
    }
  },

  getDocumentsByUserId: async (userId: string): Promise<Document[]> => {
    try {
      const q = query(
        collection(db, 'documents'), 
        where('userId', '==', userId)
      );
      
      const querySnapshot = await getDocs(q);
      const documents: Document[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        documents.push(convertTimestampsToStrings({
          id: doc.id,
          ...data
        }));
      });
      
      // Sort by uploadedAt in JavaScript instead of in the query
      documents.sort((a, b) => {
        const dateA = new Date(a.uploadedAt || 0).getTime();
        const dateB = new Date(b.uploadedAt || 0).getTime();
        return dateB - dateA; // desc order
      });
      
      return documents;
    } catch (error) {
      console.error('Error getting documents by user ID:', error);
      throw error;
    }
  },

  updateDocument: async (id: string, updates: Partial<Omit<Document, 'id' | 'uploadedAt' | 'updatedAt'>>): Promise<Document | null> => {
    try {
      const docRef = doc(db, 'documents', id);
      await updateDoc(docRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Get the updated document
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return convertTimestampsToStrings({
          id: docSnap.id,
          ...data
        });
      }
      
      return null;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  deleteDocument: async (id: string): Promise<boolean> => {
    try {
      const docRef = doc(db, 'documents', id);
      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  }
};

// User profile functions (optional - for storing additional user data in Firestore)
export const firebaseUserStorage = {
  createUserProfile: async (userData: User): Promise<User> => {
    try {
      const docRef = doc(db, 'users', userData.id);
      await setDoc(docRef, {
        ...userData,
        createdAt: serverTimestamp()
      });
      
      return userData;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  },

  getUserProfile: async (userId: string): Promise<User | null> => {
    try {
      const docRef = doc(db, 'users', userId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  },

  updateUserProfile: async (userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> => {
    try {
      const docRef = doc(db, 'users', userId);
      await updateDoc(docRef, updates);
      
      // Get the updated document
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt
        } as User;
      }
      
      return null;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }
};
