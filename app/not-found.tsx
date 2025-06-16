"use client"

import React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Home, ArrowLeft, Search, Code, Palette, Key, Calendar, FileText, Hash, Zap, RefreshCw } from "lucide-react"

const popularTools = [
  {
    name: "Password Generator",
    description: "Generate secure passwords",
    href: "/tools/password-generator",
    icon: Key,
    color: "text-blue-500",
  },
  {
    name: "Base64 Encoder/Decoder",
    description: "Encode and decode Base64 strings",
    href: "/tools/base64",
    icon: Code,
    color: "text-green-500",
  },
  {
    name: "Color Palette Extractor",
    description: "Extract colors from images",
    href: "/tools/color-palette",
    icon: Palette,
    color: "text-pink-500",
  },
  {
    name: "Cron Generator",
    description: "Build cron expressions visually",
    href: "/tools/cron-generator",
    icon: Calendar,
    color: "text-amber-500",
  },
  {
    name: "JSON Formatter",
    description: "Format and validate JSON",
    href: "/tools/json-formatter",
    icon: FileText,
    color: "text-purple-500",
  },
  {
    name: "Hash Generator",
    description: "Generate MD5, SHA hashes",
    href: "/tools/hash-generator",
    icon: Hash,
    color: "text-orange-500",
  },
]

const quickLinks = [
  { name: "Home", href: "/", icon: Home },
  { name: "About", href: "/about", icon: FileText },
  { name: "Contact", href: "/contact", icon: Zap },
]

export default function NotFound() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const goBack = () => {
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/")
    }
  }

  const handleRefresh = () => {
    if (typeof window !== "undefined") {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8 mt-20">
        {/* 404 Animation */}
        <div
          className={`transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="relative">
            <h1 className="text-9xl md:text-[12rem] font-bold text-primary/20 select-none">404</h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-bounce">
                <Search className="h-16 w-16 md:h-20 md:w-20 text-primary" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div
          className={`space-y-6 transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground">Oops! Page Not Found</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The page you&apos;re looking for seems to have vanished into the digital void. Don&apos;t worry, even the best
              developers get lost sometimes!
            </p>
          </div>

          {/* Search Bar */}
          <Card className="max-w-md mx-auto">
            <CardContent className="p-4">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search for tools..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={goBack} variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button asChild className="flex items-center gap-2">
              <Link href="/">
                <Home className="h-4 w-4" />
                Go Home
              </Link>
            </Button>
            <Button onClick={handleRefresh} variant="outline" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Popular Tools */}
        <div
          className={`transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Popular Developer Tools</CardTitle>
              <CardDescription>Maybe one of these is what you were looking for?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {popularTools.map((tool) => {
                  const IconComponent = tool.icon
                  return (
                    <Link
                      key={tool.name}
                      href={tool.href}
                      className="group p-4 rounded-lg border border-border hover:border-primary/50 transition-all duration-200 hover:shadow-md hover:-translate-y-1"
                    >
                      <div className="flex items-start gap-3">
                        <IconComponent className={`h-5 w-5 ${tool.color} flex-shrink-0 mt-0.5`} />
                        <div className="text-left">
                          <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                            {tool.name}
                          </h3>
                          <p className="text-xs text-muted-foreground mt-1">{tool.description}</p>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Links */}
        <div
          className={`transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="flex justify-center gap-6">
            {quickLinks.map((link) => {
              const IconComponent = link.icon
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  <IconComponent className="h-4 w-4" />
                  {link.name}
                </Link>
              )
            })}
          </div>
        </div>

        {/* Fun Message */}
        <div
          className={`transition-all duration-1000 delay-800 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
        >
          <div className="text-xs text-muted-foreground space-y-2">
            <p>💡 Pro tip: Check the URL for typos, or use the search above to find what you need.</p>
            <p className="font-mono">Error 404: Awesome page not found, but awesome tools still available! 🚀</p>
          </div>
        </div>
      </div>
    </div>
  )
}