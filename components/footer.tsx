"use client"

import type React from "react"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Wrench, Github, Linkedin, Mail, Send, Heart, ExternalLink, ArrowUp, Code, Sparkles } from "lucide-react"
import Image from "next/image"

const footerLinks = {
  tools: [
    { name: "JSON Formatter", href: "/tools/json-formatter" },
    { name: "JWT Decoder", href: "/tools/jwt-decoder" },
    { name: "Base64 Encoder", href: "/tools/base64" },
    { name: "UUID Generator", href: "/tools/uuid-generator" },
    { name: "Regex Tester", href: "/tools/regex-tester" },
    { name: "View All Tools", href: "/tools" },
  ],
  company: [
    { name: "About Project", href: "/about" },
    { name: "Contact Us", href: "/contact" },
    { name: "Contribute", href: "/about#contribute" },
    { name: "GitHub", href: "https://github.com/monsur28", external: true },
  ],
  resources: [
    { name: "Documentation", href: "#" },
    { name: "API Reference", href: "#" },
    { name: "Changelog", href: "/about#changelog" },
    { name: "Support", href: "/contact" },
  ],
}

const socialLinks = [
  {
    name: "GitHub",
    href: "https://github.com/monsur28",
    icon: Github,
    color: "hover:text-gray-900 dark:hover:text-white",
    bgColor: "hover:bg-gray-100 dark:hover:bg-gray-800",
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/in/abulmonsur28",
    icon: Linkedin,
    color: "hover:text-gray-900 dark:hover:text-white",
    bgColor: "hover:bg-gray-100 dark:hover:bg-gray-800",
  },
  {
    name: "Email",
    href: "mailto:monsur286512@gmail.com",
    icon: Mail,
    color: "hover:text-gray-900 dark:hover:text-white",
    bgColor: "hover:bg-gray-100 dark:hover:bg-gray-800",
  },
]

export function Footer() {
  const [email, setEmail] = useState("")
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const { toast } = useToast()

  const logoSrc = `https://res.cloudinary.com/dg8w1kluo/image/upload/v1750086960/DevToolkit_vpwgql.png`

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      })
      return
    }

    setIsSubscribing(true)

    setTimeout(() => {
      toast({
        title: "Success!",
        description: "Thank you for subscribing to our newsletter!",
      })
      setEmail("")
      setIsSubscribing(false)
    }, 1000)
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-black text-gray-900 dark:text-white overflow-hidden border-t border-gray-200 dark:border-gray-800">
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 via-gray-200/30 to-gray-100/50 dark:from-gray-900/50 dark:via-gray-800/30 dark:to-gray-900/50 animate-gradient-x" />

        {/* Dynamic mesh gradient */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: `radial-gradient(circle at ${(mousePosition.x / window.innerWidth) * 100}% ${(mousePosition.y / window.innerHeight) * 100}%, rgba(0, 0, 0, 0.1) 0%, transparent 50%)`,
          }}
        />

        {/* Single glowing orb */}
        <div className="absolute top-1/3 right-1/3 w-48 h-48 bg-gradient-to-r from-gray-300/20 to-gray-400/20 dark:from-gray-700/20 dark:to-gray-600/20 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      <div className="relative z-10">
        {/* Decorative top border */}
        <div className="h-1 bg-gradient-to-r from-transparent via-gray-400 dark:via-gray-600 to-transparent" />

        {/* Main Footer Content */}
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
            {/* Enhanced Brand Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="group">
                <Link
                  href="/"
                  className="flex items-center space-x-3 group-hover:scale-105 transition-transform duration-300"
                >
                  <div className="relative h-12 w-40">
                    <Image
                      src={logoSrc || "/placeholder.svg"}
                      alt="DevToolkit Logo"
                      fill
                      className="object-contain rounded-full group-hover:brightness-110 transition-all duration-300"
                      sizes="160px"
                    />
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-gray-400/20 to-gray-500/20 dark:from-gray-600/20 dark:to-gray-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                  </div>
                </Link>
              </div>

              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-base">
                  Empowering developers with beautiful, fast, and reliable tools.
                </p>
                <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
                  <span>Built with</span>
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>for the developer community</span>
                </div>
              </div>

              {/* Enhanced Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => {
                  const IconComponent = social.icon
                  return (
                    <Link
                      key={social.name}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:scale-110 hover:border-gray-300 dark:hover:border-gray-600 ${social.color} ${social.bgColor}`}
                    >
                      <IconComponent className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-gray-200/20 to-gray-300/20 dark:from-gray-700/20 dark:to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                      <span className="sr-only">{social.name}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Enhanced Links Sections */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Code className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Popular Tools</h3>
                </div>
                <ul className="space-y-3">
                  {footerLinks.tools.map((link, index) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-sm"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-700 dark:group-hover:bg-gray-300 transition-colors duration-200 mr-3" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Company</h3>
                </div>
                <ul className="space-y-3">
                  {footerLinks.company.map((link, index) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        target={link.external ? "_blank" : undefined}
                        rel={link.external ? "noopener noreferrer" : undefined}
                        className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-sm"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-700 dark:group-hover:bg-gray-300 transition-colors duration-200 mr-3" />
                        {link.name}
                        {link.external && (
                          <ExternalLink className="h-3 w-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Wrench className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Resources</h3>
                </div>
                <ul className="space-y-3">
                  {footerLinks.resources.map((link, index) => (
                    <li key={link.name}>
                      <Link
                        href={link.href}
                        className="group flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all duration-200 text-sm"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <span className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600 group-hover:bg-gray-700 dark:group-hover:bg-gray-300 transition-colors duration-200 mr-3" />
                        {link.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Enhanced Newsletter Section */}
            <div className="lg:col-span-1 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Send className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Stay Updated</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                  Get notified about new tools, features, and developer resources.
                </p>
              </div>

              <form onSubmit={handleSubscribe} className="space-y-3">
                <div className="relative group">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-white/80 dark:bg-gray-800/80 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:border-gray-500 dark:focus:border-gray-400 focus:ring-gray-500/20 dark:focus:ring-gray-400/20 transition-all duration-300 group-hover:bg-white dark:group-hover:bg-gray-800"
                  />
                  <div className="absolute inset-0 rounded-md bg-gradient-to-r from-gray-200/20 to-gray-300/20 dark:from-gray-700/20 dark:to-gray-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl -z-10" />
                </div>
                <Button
                  type="submit"
                  disabled={isSubscribing}
                  className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-gray-500/25 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  {isSubscribing ? (
                    <div className="flex items-center relative z-10">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                      Subscribing...
                    </div>
                  ) : (
                    <div className="flex items-center relative z-10">
                      <Send className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:translate-x-1" />
                      Subscribe
                    </div>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Enhanced Bottom Bar */}
        <div className="border-t border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <span>© 2025 DevToolkit.</span>
                  <span>Made with</span>
                  <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                  <span>for developers worldwide.</span>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                  <span>•</span>
                  <span>Open Source</span>
                  <span>•</span>
                  <span>MIT License</span>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors duration-200"
                >
                  Terms of Service
                </Link>
                <Button
                  onClick={scrollToTop}
                  variant="ghost"
                  size="sm"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 group"
                >
                  <ArrowUp className="h-4 w-4 mr-1 transition-transform duration-300 group-hover:-translate-y-1" />
                  Back to top
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes gradient-x {
          0%, 100% {
            transform: translateX(0%);
          }
          50% {
            transform: translateX(-100%);
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        .animate-gradient-x {
          animation: gradient-x 15s ease infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
      `}</style>
    </footer>
  )
}
