"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Car, ArrowLeft, FileText, Upload, Trash2, AlertCircle, Calendar, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { withAuth } from "@/lib/with-auth"
import { carStorage, documentStorage, Car as CarType, Document } from "@/lib/storage"

function DocumentsPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [car, setCar] = useState<CarType | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const [newDocument, setNewDocument] = useState({
    type: "",
    name: "",
    expiryDate: "",
    file: null as File | null
  })

  useEffect(() => {
    if (user && id) {
      const carData = carStorage.getCarById(id as string)
      if (carData && carData.userId === user.id) {
        setCar(carData)
        const carDocs = documentStorage.getDocumentsByCarId(id as string)
        setDocuments(carDocs)
      } else {
        router.push('/dashboard')
      }
      setLoading(false)
    }
  }, [user, id, router])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setNewDocument(prev => ({ ...prev, file, name: file.name }))
    }
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    
    if (!user || !car || !newDocument.type || !newDocument.name) {
      setError("Please fill in all required fields")
      return
    }

    setIsUploading(true)

    try {
      // For demo purposes, we'll store a reference to the file
      // In a real app, you'd upload to a file storage service
      const docData = {
        carId: car.id,
        userId: user.id,
        type: newDocument.type as any,
        name: newDocument.name,
        expiryDate: newDocument.expiryDate || undefined,
        file: newDocument.file ? `file_${Date.now()}` : undefined // Mock file reference
      }

      const createdDoc = documentStorage.createDocument(docData)
      setDocuments(prev => [...prev, createdDoc])
      
      // Reset form
      setNewDocument({ type: "", name: "", expiryDate: "", file: null })
      setIsDialogOpen(false)
    } catch (err) {
      console.error("Error uploading document:", err)
      setError("Failed to upload document. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDeleteDocument = (docId: string) => {
    if (documentStorage.deleteDocument(docId)) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId))
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getDocumentTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'rc': 'Registration Certificate (RC)',
      'insurance': 'Insurance Policy',
      'puc': 'PUC Certificate',
      'license': 'Driving License',
      'other': 'Other Document'
    }
    return types[type] || type
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!car) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Car className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Car not found</h1>
          <Link href="/dashboard">
            <Button>Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/car/${car.id}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Car Details
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold text-gray-900">Documents - {car.carName}</span>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header with Upload Button */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
              <p className="text-gray-600">Upload and manage your vehicle documents</p>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <form onSubmit={handleUpload}>
                  <DialogHeader>
                    <DialogTitle>Upload New Document</DialogTitle>
                    <DialogDescription>
                      Add a new document for {car.carName}
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    {error && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
                        <AlertCircle className="h-4 w-4" />
                        <span className="text-sm">{error}</span>
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="documentType">Document Type</Label>
                      <Select 
                        value={newDocument.type} 
                        onValueChange={(value) => setNewDocument(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select document type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rc">Registration Certificate (RC)</SelectItem>
                          <SelectItem value="insurance">Insurance Policy</SelectItem>
                          <SelectItem value="puc">PUC Certificate</SelectItem>
                          <SelectItem value="license">Driving License</SelectItem>
                          <SelectItem value="other">Other Document</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentName">Document Name</Label>
                      <Input
                        id="documentName"
                        placeholder="Enter document name"
                        value={newDocument.name}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiryDate">Expiry Date (Optional)</Label>
                      <Input
                        id="expiryDate"
                        type="date"
                        value={newDocument.expiryDate}
                        onChange={(e) => setNewDocument(prev => ({ ...prev, expiryDate: e.target.value }))}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="documentFile">Upload File (Optional)</Label>
                      <Input
                        id="documentFile"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      <p className="text-sm text-gray-500">
                        Supported formats: Images (JPG, PNG) and PDF files
                      </p>
                    </div>
                  </div>
                  
                  <DialogFooter className="flex gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDialogOpen(false)}
                      disabled={isUploading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isUploading}>
                      {isUploading ? "Uploading..." : "Upload Document"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Documents Grid */}
          {documents.length === 0 ? (
            <Card className="text-center py-16">
              <CardContent>
                <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents uploaded</h3>
                <p className="text-gray-600 mb-6">
                  Keep your vehicle documents safe and organized. Upload your RC, insurance, PUC, and other important documents.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Your First Document
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6">
              {documents.map((doc) => (
                <Card key={doc.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{doc.name}</h3>
                          <p className="text-gray-600">{getDocumentTypeLabel(doc.type)}</p>
                          <p className="text-sm text-gray-500">
                            Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {doc.expiryDate && (
                          <div className="text-right">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              <span className="text-sm text-gray-600">Expires</span>
                            </div>
                            <p className="font-medium">{doc.expiryDate}</p>
                            <p className={`text-sm font-medium ${
                              getDaysUntilExpiry(doc.expiryDate) <= 0 
                                ? 'text-red-600' 
                                : getDaysUntilExpiry(doc.expiryDate) <= 30 
                                ? 'text-orange-600' 
                                : 'text-green-600'
                            }`}>
                              {getDaysUntilExpiry(doc.expiryDate) <= 0 
                                ? 'Expired' 
                                : getDaysUntilExpiry(doc.expiryDate) <= 30 
                                ? `${getDaysUntilExpiry(doc.expiryDate)} days left`
                                : 'Valid'
                              }
                            </p>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-2">
                          {doc.file && (
                            <Button variant="outline" size="sm">
                              <FileText className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Expiry Warning */}
                    {doc.expiryDate && getDaysUntilExpiry(doc.expiryDate) <= 30 && getDaysUntilExpiry(doc.expiryDate) > 0 && (
                      <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-orange-600" />
                          <p className="text-sm font-medium text-orange-800">
                            This document expires in {getDaysUntilExpiry(doc.expiryDate)} days
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Expired Warning */}
                    {doc.expiryDate && getDaysUntilExpiry(doc.expiryDate) <= 0 && (
                      <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <p className="text-sm font-medium text-red-800">
                            This document has expired
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Document Types Info */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle>Document Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Essential Documents</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Registration Certificate (RC)</li>
                    <li>• Insurance Policy</li>
                    <li>• PUC Certificate</li>
                    <li>• Driving License</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Additional Documents</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Service Records</li>
                    <li>• Purchase Invoice</li>
                    <li>• Loan Documents</li>
                    <li>• Other Permits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default withAuth(DocumentsPage)
