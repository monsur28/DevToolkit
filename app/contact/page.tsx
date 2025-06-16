"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Mail,
  Github,
  Linkedin,
  MapPin,
  Clock,
  ExternalLink,
  MessageCircle,
  Calendar,
  Globe,
  Coffee,
  Zap,
} from "lucide-react"

const contactMethods = [
  {
    icon: Mail,
    label: "Email",
    value: "monsur286512@gmail.com",
    href: "mailto:monsur286512@gmail.com",
    description: "Best for detailed discussions",
    color: "bg-red-500/10 text-red-600 border-red-200",
    iconColor: "text-red-500",
  },
  {
    icon: Github,
    label: "GitHub",
    value: "github.com/monsur28",
    href: "https://github.com/monsur28",
    description: "Check out my code and projects",
    color: "bg-gray-500/10 text-gray-700 border-gray-200 dark:text-gray-300 dark:border-gray-700",
    iconColor: "text-gray-700 dark:text-gray-300",
  },
  {
    icon: Linkedin,
    label: "LinkedIn",
    value: "linkedin.com/in/abulmonsur28",
    href: "https://www.linkedin.com/in/abulmonsur28",
    description: "Professional networking",
    color: "bg-blue-500/10 text-blue-600 border-blue-200",
    iconColor: "text-blue-600",
  },
]

const availabilityInfo = [
  {
    icon: Clock,
    title: "Response Time",
    description: "Usually within 24-48 hours",
    badge: "Fast Response",
  },
  {
    icon: Calendar,
    title: "Availability",
    description: "Monday - Friday, 9 AM - 6 PM (UTC+6)",
    badge: "Business Hours",
  },
  {
    icon: MapPin,
    title: "Location",
    description: "Bangladesh • Remote Friendly",
    badge: "Global",
  },
  {
    icon: Coffee,
    title: "Collaboration",
    description: "Open to freelance & full-time opportunities",
    badge: "Available",
  },
]

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-16 mt-20">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 blur-3xl rounded-full"></div>
              <div className="relative flex items-center justify-center mb-6">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 border border-primary/20">
                  <MessageCircle className="h-12 w-12 text-primary" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-blue-600 bg-clip-text text-transparent">
                Let&apos;s Connect
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                I&apos;m always excited to discuss new opportunities, collaborate on projects, or simply chat about
                technology and development.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="secondary" className="px-3 py-1">
                <Zap className="h-3 w-3 mr-1" />
                Quick Responder
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Globe className="h-3 w-3 mr-1" />
                Remote Ready
              </Badge>
              <Badge variant="secondary" className="px-3 py-1">
                <Coffee className="h-3 w-3 mr-1" />
                Always Learning
              </Badge>
            </div>
          </div>

          {/* Contact Methods */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactMethods.map((contact) => {
              const IconComponent = contact.icon
              return (
                <Card
                  key={contact.label}
                  className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/20"
                >
                  <CardContent className="p-6">
                    <div className="text-center space-y-4">
                      <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/10 to-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <IconComponent className={`h-8 w-8 ${contact.iconColor}`} />
                      </div>

                      <div className="space-y-2">
                        <h3 className="font-semibold text-lg">{contact.label}</h3>
                        <p className="text-sm text-muted-foreground">{contact.description}</p>
                        <p className="text-sm font-mono text-primary break-all">{contact.value}</p>
                      </div>

                      <Button
                        asChild
                        className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                        variant="outline"
                      >
                        <a
                          href={contact.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2"
                        >
                          Connect
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Availability & Info */}
          <Card className="shadow-lg border-2">
            <CardHeader className="text-center pb-6">
              <CardTitle className="text-2xl flex items-center justify-center gap-2">
                <Clock className="h-6 w-6 text-primary" />
                Availability & Info
              </CardTitle>
              <CardDescription className="text-base">Here&apos;s what you can expect when reaching out</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {availabilityInfo.map((info) => {
                  const IconComponent = info.icon
                  return (
                    <div
                      key={info.title}
                      className="flex items-start space-x-4 p-4 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="p-3 rounded-xl bg-primary/10 flex-shrink-0">
                        <IconComponent className="h-5 w-5 text-primary" />
                      </div>
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold">{info.title}</h4>
                          <Badge variant="outline" className="text-xs">
                            {info.badge}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">{info.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Call to Action */}
          <div className="text-center mt-12 p-8 rounded-2xl bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/10">
            <h3 className="text-2xl font-semibold mb-4">Ready to Start a Conversation?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Whether you have a project in mind, want to collaborate, or just want to say hello, I&apos;d love to hear from
              you. Choose your preferred method above and let&apos;s connect!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-purple-600"
              >
                <a href="mailto:monsur286512@gmail.com" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Send Email
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a
                  href="https://github.com/monsur28"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <Github className="h-4 w-4" />
                  View GitHub
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
