"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, RefreshCw, AlertTriangle, Chrome, Globe, Monitor } from "lucide-react"

interface LocationPermissionHelperProps {
  onRetry: () => void
  onDismiss: () => void
}

export function LocationPermissionHelper({ onRetry, onDismiss }: LocationPermissionHelperProps) {
  const detectBrowser = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    if (userAgent.includes('chrome') && !userAgent.includes('edg')) return 'chrome'
    if (userAgent.includes('firefox')) return 'firefox'
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'safari'
    if (userAgent.includes('edg')) return 'edge'
    return 'other'
  }

  const browser = detectBrowser()

  const instructions = {
    chrome: {
      icon: <Chrome className="h-4 w-4" />,
      steps: [
        "Look for the location icon (🌍) in the address bar, left of the URL",
        "Click on it and select 'Allow' from the dropdown",
        "If no icon appears, click the lock icon → Site settings → Location → Allow",
        "Alternatively: Chrome menu → Settings → Privacy and security → Site Settings → Location"
      ]
    },
    firefox: {
      icon: <Globe className="h-4 w-4" />,
      steps: [
        "Look for the location icon in the address bar",
        "Click on it and select 'Allow' from the permissions panel",
        "If blocked: Click the shield icon → Permissions → Location → Allow",
        "Or go to: Firefox menu → Settings → Privacy & Security → Permissions → Location"
      ]
    },
    safari: {
      icon: <Monitor className="h-4 w-4" />,
      steps: [
        "Look for the location icon in the address bar",
        "Click on it and select 'Allow'",
        "If blocked: Safari menu → Settings for This Website → Location → Allow",
        "Or: Safari menu → Settings → Websites → Location → Allow for this site"
      ]
    },
    edge: {
      icon: <Settings className="h-4 w-4" />,
      steps: [
        "Look for the location icon in the address bar",
        "Click on it and select 'Allow'",
        "If blocked: Click the lock icon → Permissions → Location → Allow",
        "Or: Edge menu → Settings → Site permissions → Location"
      ]
    },
    other: {
      icon: <Settings className="h-4 w-4" />,
      steps: [
        "Look for a location or GPS icon in your browser's address bar",
        "Click on it and select 'Allow' or 'Always allow'",
        "Check your browser's privacy or security settings for location permissions",
        "Look for site permissions or location settings in your browser menu"
      ]
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertTriangle className="h-5 w-5" />
          Location Access Needed
        </CardTitle>
        <CardDescription className="text-orange-700">
          We need your location to find nearby mechanics. It looks like location access was previously denied.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Tabs defaultValue={browser} className="w-full">
            <TabsList className="grid grid-cols-4 w-full mb-4">
              <TabsTrigger value="chrome" className="flex items-center gap-1 text-xs">
                <Chrome className="h-3 w-3" />
                Chrome
              </TabsTrigger>
              <TabsTrigger value="firefox" className="flex items-center gap-1 text-xs">
                <Globe className="h-3 w-3" />
                Firefox
              </TabsTrigger>
              <TabsTrigger value="safari" className="flex items-center gap-1 text-xs">
                <Monitor className="h-3 w-3" />
                Safari
              </TabsTrigger>
              <TabsTrigger value="other" className="flex items-center gap-1 text-xs">
                <Settings className="h-3 w-3" />
                Other
              </TabsTrigger>
            </TabsList>

            {Object.entries(instructions).map(([browserKey, instruction]) => (
              <TabsContent key={browserKey} value={browserKey}>
                <Alert>
                  {instruction.icon}
                  <AlertDescription>
                    <strong>How to enable location in {browserKey === 'other' ? 'your browser' : browserKey}:</strong>
                    <ol className="mt-2 ml-4 space-y-1 list-decimal text-sm">
                      {instruction.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </AlertDescription>
                </Alert>
              </TabsContent>
            ))}
          </Tabs>

          <Alert className="bg-blue-50 border-blue-200">
            <Settings className="h-4 w-4" />
            <AlertDescription className="text-blue-800">
              <strong>Quick tip:</strong> After enabling location access, you may need to refresh this page for the changes to take effect.
            </AlertDescription>
          </Alert>
          
          <div className="flex gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onRetry}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const urls = {
                  chrome: 'https://support.google.com/chrome/answer/142065',
                  firefox: 'https://support.mozilla.org/en-US/kb/does-firefox-share-my-location-websites',
                  safari: 'https://support.apple.com/guide/safari/websites-ibrw1074/mac',
                  edge: 'https://support.microsoft.com/en-us/microsoft-edge/location-and-privacy-in-microsoft-edge-31b5d154-0b1b-90ef-e389-7c7d4ffe7b1',
                  other: 'https://support.google.com/chrome/answer/142065'
                }
                window.open(urls[browser as keyof typeof urls], '_blank')
              }}
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              <Settings className="h-4 w-4 mr-2" />
              Browser Help
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={onDismiss}
              className="text-orange-700 hover:bg-orange-100"
            >
              Dismiss
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
