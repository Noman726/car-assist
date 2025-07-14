import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Shield, Bell, MapPin, FileText, Users } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Car className="h-8 w-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">CarAssist</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-gray-600 hover:text-blue-600 transition-colors">
              Features
            </Link>
            <Link href="#about" className="text-gray-600 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link href="/login" className="text-gray-600 hover:text-blue-600 transition-colors">
              Login
            </Link>
            <Link href="/signup">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Stop Losing Your
              <span className="text-blue-600"> Car Papers</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Tired of digging through your glove compartment for RC copies? Fed up with missing PUC renewal dates? We
              get it. Keep all your car stuff in one place and never worry about fines again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-lg px-8 py-3">
                  Start Managing Your Cars
                </Button>
              </Link>
              <Link href="/demo">
                <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                  View Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything You Need for Vehicle Management</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From document storage to emergency assistance, CarAssist has you covered
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <FileText className="h-12 w-12 text-blue-600 mb-4" />
                <CardTitle>Digital Document Storage</CardTitle>
                <CardDescription>
                  Keep your RC, PUC, insurance - everything in one spot. No more paper mess.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Bell className="h-12 w-12 text-green-600 mb-4" />
                <CardTitle>Smart Reminders</CardTitle>
                <CardDescription>
                  We'll bug you (nicely) when your PUC is about to expire or when you've got pending challans
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <MapPin className="h-12 w-12 text-red-600 mb-4" />
                <CardTitle>Emergency Mechanic Locator</CardTitle>
                <CardDescription>
                  Car broke down on the highway? Find mechanics nearby who can actually help you out
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Users className="h-12 w-12 text-purple-600 mb-4" />
                <CardTitle>Multiple Vehicle Support</CardTitle>
                <CardDescription>
                  Got multiple cars? No problem. Track your Swift, City, whatever you drive
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Shield className="h-12 w-12 text-orange-600 mb-4" />
                <CardTitle>Secure & Private</CardTitle>
                <CardDescription>
                  Your stuff stays private. We're not selling your data to anyone, promise.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 hover:border-blue-200 transition-colors">
              <CardHeader>
                <Car className="h-12 w-12 text-indigo-600 mb-4" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  Know about new fines before your friends do. Stay ahead of the RTO game.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of vehicle owners who trust CarAssist for their car management needs
          </p>
          <Link href="/signup">
            <Button size="lg" variant="secondary" className="text-lg px-8 py-3">
              Create Your Account Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-6 w-6" />
                <span className="text-xl font-bold">CarAssist</span>
              </div>
              <p className="text-gray-400">Your complete digital vehicle management solution</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Features</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Document Storage</li>
                <li>Smart Reminders</li>
                <li>Mechanic Locator</li>
                <li>Multi-car Support</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>Help Center</li>
                <li>Contact Us</li>
                <li>Privacy Policy</li>
                <li>Terms of Service</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>About Us</li>
                <li>Careers</li>
                <li>Blog</li>
                <li>Press</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 CarAssist. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
