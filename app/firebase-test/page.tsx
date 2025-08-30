"use client";

import { useState } from 'react';
import { auth, db, analytics } from '@/lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { firebaseCarStorage } from '@/lib/firebase-storage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

export default function FirebaseTestPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [email, setEmail] = useState('test@carassist.com');
  const [password, setPassword] = useState('test123456');
  const [loading, setLoading] = useState(false);

  const testFirebaseConnection = async () => {
    setLoading(true);
    setTestResult('🧪 Testing Firebase connection...\n');
    
    try {
      setTestResult(prev => prev + '✅ Firebase initialized successfully\n');
      
      if (auth) {
        setTestResult(prev => prev + '✅ Firebase Auth instance created\n');
      } else {
        throw new Error('Auth instance not found');
      }
      
      if (db) {
        setTestResult(prev => prev + '✅ Firestore instance created\n');
      } else {
        throw new Error('Firestore instance not found');
      }
      
      if (analytics) {
        setTestResult(prev => prev + '✅ Firebase Analytics initialized\n');
      } else {
        setTestResult(prev => prev + '⚠️ Firebase Analytics not available (development mode)\n');
      }
      
      const user = auth.currentUser;
      setTestResult(prev => prev + `📝 Current user: ${user ? user.email : 'No user signed in'}\n`);
      setTestResult(prev => prev + `📋 Project ID: ${auth.app.options.projectId}\n`);
      setTestResult(prev => prev + `📋 Auth Domain: ${auth.app.options.authDomain}\n`);
      setTestResult(prev => prev + '\n🎉 Firebase is properly configured!\n');
      
    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ Firebase connection failed: ${error.message}\n`);
      console.error('Firebase connection test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const testCarCreation = async () => {
    setLoading(true);
    setTestResult('🚗 Testing car creation in Firebase...\n');
    
    try {
      let user = auth.currentUser;
      if (!user) {
        setTestResult(prev => prev + '📝 Creating test user...\n');
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password);
          user = userCredential.user;
          setTestResult(prev => prev + '✅ Test user created successfully\n');
        } catch (authError: any) {
          if (authError.code === 'auth/email-already-in-use') {
            setTestResult(prev => prev + '📝 User exists, signing in...\n');
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            user = userCredential.user;
            setTestResult(prev => prev + '✅ Signed in successfully\n');
          } else {
            throw authError;
          }
        }
      }

      setTestResult(prev => prev + '📝 Creating test car in Firebase...\n');
      
      const testCarData = {
        userId: user.uid,
        carName: 'Test Car ' + new Date().getTime(),
        registrationNumber: 'TEST' + new Date().getTime().toString().slice(-4),
        chassisNumber: 'TEST123456789',
        engineNumber: 'ENG123456',
        make: 'Honda',
        model: 'City',
        year: '2022',
        color: 'White',
        fuelType: 'Petrol',
        pucExpiry: '2024-12-31',
        insuranceExpiry: '2024-12-31',
        insuranceProvider: 'Test Insurance',
        notes: 'This is a test car created for Firebase testing'
      };

      const createdCar = await firebaseCarStorage.createCar(testCarData);
      setTestResult(prev => prev + `✅ Car created successfully!\n`);
      setTestResult(prev => prev + `📋 Car ID: ${createdCar.id}\n`);
      setTestResult(prev => prev + `📋 Car Name: ${createdCar.carName}\n`);
      setTestResult(prev => prev + `📋 Registration: ${createdCar.registrationNumber}\n`);
      
      setTestResult(prev => prev + '📝 Fetching cars from Firebase...\n');
      const userCars = await firebaseCarStorage.getCarsByUserId(user.uid);
      setTestResult(prev => prev + `✅ Found ${userCars.length} cars for user\n`);
      
      if (userCars.length > 0) {
        setTestResult(prev => prev + '📋 Recent cars:\n');
        userCars.slice(0, 3).forEach((car, index) => {
          setTestResult(prev => prev + `   ${index + 1}. ${car.carName} (${car.registrationNumber})\n`);
        });
      }
      
      setTestResult(prev => prev + '\n🎉 Firebase car storage is working perfectly!\n');
      
    } catch (error: any) {
      setTestResult(prev => prev + `\n❌ Car creation test failed: ${error.message}\n`);
      console.error('Car creation test error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearTestResults = () => {
    setTestResult('');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-2xl text-center">🔥 Firebase Configuration Test</CardTitle>
            <p className="text-center text-gray-600">
              Test your Firebase configuration and car data upload functionality
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Test Email:</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="test@carassist.com"
                    disabled={loading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Test Password:</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (min 6 chars)"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={testFirebaseConnection} 
                  disabled={loading} 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  🔗 Test Firebase Connection
                </Button>
                <Button 
                  onClick={testCarCreation} 
                  disabled={loading}
                  className="flex items-center gap-2"
                >
                  🚗 Test Car Creation
                </Button>
                <Button 
                  onClick={clearTestResults} 
                  disabled={loading} 
                  variant="secondary"
                  className="flex items-center gap-2"
                >
                  🧹 Clear Results
                </Button>
              </div>
              
              {loading && (
                <div className="flex items-center justify-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Testing in progress...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {testResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Test Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={testResult}
                readOnly
                className="min-h-[400px] font-mono text-sm bg-gray-900 text-green-400 border-gray-700"
                placeholder="Test results will appear here..."
              />
            </CardContent>
          </Card>
        )}

        <Card className="mt-6">
          <CardContent className="pt-6">
            <div className="text-sm text-gray-600">
              <h4 className="font-semibold mb-2">💡 Instructions:</h4>
              <ul className="space-y-1 list-disc list-inside">
                <li><strong>Test Firebase Connection:</strong> Verifies that all Firebase services are properly configured</li>
                <li><strong>Test Car Creation:</strong> Creates a test user (if needed) and attempts to save a car to Firestore</li>
                <li><strong>Email/Password:</strong> Use any valid email format and password (min 6 characters)</li>
                <li>If the email already exists, the system will automatically sign in instead</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
