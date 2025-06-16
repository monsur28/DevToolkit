"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Key, Copy, RefreshCw, Trash2, Shield, Eye, EyeOff, Sparkles, Zap } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"

interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  excludeAmbiguous: boolean
}

export default function PasswordGeneratorPage() {
  const [password, setPassword] = useState("")
  const [passwords, setPasswords] = useState<string[]>([])
  const [showPassword, setShowPassword] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [options, setOptions] = useState<PasswordOptions>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    excludeAmbiguous: false,
  })
  const { toast } = useToast()

  const characterSets = {
    uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lowercase: "abcdefghijklmnopqrstuvwxyz",
    numbers: "0123456789",
    symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
    similar: "il1Lo0O",
    ambiguous: "{}[]()/\\'\"`~,;.<>",
  }

  const generatePassword = (): string => {
    if (typeof window === "undefined") {
      return ""
    }

    let charset = ""

    if (options.includeUppercase) charset += characterSets.uppercase
    if (options.includeLowercase) charset += characterSets.lowercase
    if (options.includeNumbers) charset += characterSets.numbers
    if (options.includeSymbols) charset += characterSets.symbols

    if (options.excludeSimilar) {
      charset = charset
        .split("")
        .filter((char) => !characterSets.similar.includes(char))
        .join("")
    }

    if (options.excludeAmbiguous) {
      charset = charset
        .split("")
        .filter((char) => !characterSets.ambiguous.includes(char))
        .join("")
    }

    if (charset === "") {
      throw new Error("At least one character type must be selected")
    }

    let result = ""
    const crypto = window.crypto
    const randomValues = new Uint32Array(options.length)
    crypto.getRandomValues(randomValues)

    for (let i = 0; i < options.length; i++) {
      result += charset.charAt(randomValues[i] % charset.length)
    }

    return result
  }

  const calculatePasswordStrength = (pwd: string) => {
    let score = 0
    const feedback: string[] = []

    if (pwd.length >= 12) score += 25
    else if (pwd.length >= 8) score += 15
    else feedback.push("Use at least 8 characters")

    const charTypes = {
      lowercase: /[a-z]/.test(pwd),
      uppercase: /[A-Z]/.test(pwd),
      numbers: /[0-9]/.test(pwd),
      symbols: /[^a-zA-Z0-9]/.test(pwd),
    }

    const typesCount = Object.values(charTypes).filter(Boolean).length
    score += typesCount * 15

    if (!charTypes.lowercase) feedback.push("Add lowercase letters")
    if (!charTypes.uppercase) feedback.push("Add uppercase letters")
    if (!charTypes.numbers) feedback.push("Add numbers")
    if (!charTypes.symbols) feedback.push("Add special characters")

    if (/(.)\1{2,}/.test(pwd)) {
      score -= 10
      feedback.push("Avoid repeated characters")
    }

    if (/123|abc|qwe|password/i.test(pwd)) {
      score -= 15
      feedback.push("Avoid common sequences or words")
    }

    if (pwd.length >= 16) score += 10

    score = Math.max(0, Math.min(100, score))

    let label = "Very Weak"
    let colorClass = "text-red-500"
    let bgColorClass = "from-red-500 to-red-600"

    if (score >= 80) {
      label = "Very Strong"
      colorClass = "text-emerald-500"
      bgColorClass = "from-emerald-500 to-green-600"
    } else if (score >= 60) {
      label = "Strong"
      colorClass = "text-cyan-500"
      bgColorClass = "from-cyan-500 to-teal-600"
    } else if (score >= 40) {
      label = "Medium"
      colorClass = "text-amber-500"
      bgColorClass = "from-amber-500 to-orange-600"
    } else if (score >= 20) {
      label = "Weak"
      colorClass = "text-orange-500"
      bgColorClass = "from-orange-500 to-red-600"
    }

    return { score, label, colorClass, bgColorClass, feedback }
  }

  const handleGenerate = async () => {
    setIsGenerating(true)
    try {
      // Add a small delay for animation effect
      await new Promise((resolve) => setTimeout(resolve, 300))
      const newPassword = generatePassword()
      if (newPassword) {
        setPassword(newPassword)
        toast({
          title: "✨ Success",
          description: "Secure password generated!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate password",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const generateMultiple = async () => {
    setIsGenerating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))
      const newPasswords = Array.from({ length: 10 }, () => generatePassword()).filter(Boolean)
      if (newPasswords.length > 0) {
        setPasswords(newPasswords)
        toast({
          title: "🚀 Success",
          description: "10 secure passwords generated!",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate passwords",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "📋 Copied!",
        description: "Password copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const clear = () => {
    setPassword("")
    setPasswords([])
    toast({
      title: "🧹 Cleared",
      description: "All passwords cleared",
    })
  }

  const updateOption = (key: keyof PasswordOptions, value: boolean | number) => {
    setOptions((prev) => ({ ...prev, [key]: value }))
  }

  const strength = password ? calculatePasswordStrength(password) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
            <Key className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent mb-3">
            Password Generator
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Generate ultra-secure passwords with advanced customization and real-time strength analysis
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 max-w-7xl mx-auto">
          {/* Options Panel */}
          <div className="space-y-6">
            <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-cyan-500 to-teal-600 rounded-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Password Options</CardTitle>
                    <CardDescription>Customize your security preferences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                {/* Length Slider */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-semibold">Password Length</label>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-violet-600 dark:text-violet-400">{options.length}</span>
                      <span className="text-xs text-slate-500">characters</span>
                    </div>
                  </div>
                  <Slider
                    value={[options.length]}
                    onValueChange={(value) => updateOption("length", value[0])}
                    min={4}
                    max={128}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>4</span>
                    <span>128</span>
                  </div>
                </div>

                {/* Character Types */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Zap className="h-4 w-4 text-amber-500" />
                    Character Types
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { key: "includeUppercase", label: "Uppercase Letters", desc: "A-Z", icon: "🔤" },
                      { key: "includeLowercase", label: "Lowercase Letters", desc: "a-z", icon: "🔡" },
                      { key: "includeNumbers", label: "Numbers", desc: "0-9", icon: "🔢" },
                      { key: "includeSymbols", label: "Special Characters", desc: "!@#$%^&*", icon: "🔣" },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Checkbox
                          id={item.key}
                          checked={options[item.key as keyof PasswordOptions] as boolean}
                          onCheckedChange={(checked) => updateOption(item.key as keyof PasswordOptions, !!checked)}
                          className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={item.key}
                            className="text-sm font-medium cursor-pointer flex items-center gap-2"
                          >
                            <span>{item.icon}</span>
                            {item.label}
                          </label>
                          <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Advanced Options */}
                <div className="space-y-4">
                  <h4 className="text-sm font-semibold flex items-center gap-2">
                    <Shield className="h-4 w-4 text-emerald-500" />
                    Advanced Security
                  </h4>
                  <div className="space-y-3">
                    {[
                      { key: "excludeSimilar", label: "Exclude Similar Characters", desc: "Avoid i, l, 1, L, o, 0, O" },
                      {
                        key: "excludeAmbiguous",
                        label: "Exclude Ambiguous Characters",
                        desc: "Avoid {}[]()/'\"~,;.<>",
                      },
                    ].map((item) => (
                      <div
                        key={item.key}
                        className="flex items-center space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Checkbox
                          id={item.key}
                          checked={options[item.key as keyof PasswordOptions] as boolean}
                          onCheckedChange={(checked) => updateOption(item.key as keyof PasswordOptions, !!checked)}
                          className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                        />
                        <div className="flex-1">
                          <label htmlFor={item.key} className="text-sm font-medium cursor-pointer">
                            {item.label}
                          </label>
                          <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 h-12"
                  >
                    {isGenerating ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4 mr-2" />
                    )}
                    Generate Password
                  </Button>
                  <Button
                    onClick={generateMultiple}
                    disabled={isGenerating}
                    variant="outline"
                    className="flex-1 border-2 hover:bg-slate-50 dark:hover:bg-slate-800 h-12"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Generate 10
                  </Button>
                  <Button
                    onClick={clear}
                    variant="outline"
                    className="border-2 hover:bg-red-50 hover:border-red-200 hover:text-red-600 dark:hover:bg-red-950 h-12 px-6"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="space-y-6">
            {/* Main Password Display */}
            <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
              <CardHeader className="pb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                      <Key className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Your Secure Password</CardTitle>
                      <CardDescription>Ready to use and copy</CardDescription>
                    </div>
                  </div>
                  {password && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setShowPassword(!showPassword)}
                        size="sm"
                        variant="ghost"
                        className="hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        onClick={() => copyToClipboard(password)}
                        size="sm"
                        className="bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white"
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {password ? (
                  <div className="space-y-6">
                    {/* Password Display */}
                    <div className="relative">
                      <div className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700 rounded-2xl border-2 border-slate-200 dark:border-slate-600">
                        <Input
                          value={password}
                          readOnly
                          type={showPassword ? "text" : "password"}
                          className="font-mono text-lg bg-transparent border-none p-0 h-auto focus-visible:ring-0 text-center"
                        />
                      </div>
                    </div>

                    {/* Strength Analysis */}
                    {strength && (
                      <div className="space-y-4 p-6 bg-gradient-to-r from-slate-50/50 to-white/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-600">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">Security Strength</span>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${strength.bgColorClass}`}></div>
                            <span className={`text-sm font-bold ${strength.colorClass}`}>{strength.label}</span>
                          </div>
                        </div>

                        <div className="relative">
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                            <div
                              className={`h-3 rounded-full bg-gradient-to-r ${strength.bgColorClass} transition-all duration-700 ease-out shadow-sm`}
                              style={{ width: `${strength.score}%` }}
                            />
                          </div>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-white drop-shadow-sm">{strength.score}%</span>
                          </div>
                        </div>

                        {strength.feedback.length > 0 && strength.score < 80 && (
                          <div className="space-y-2 pt-2">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                              💡 Suggestions for improvement:
                            </p>
                            <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                              {strength.feedback.map((item, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-full mb-6">
                      <Key className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-400 mb-2">Ready to Generate</h3>
                    <p className="text-slate-500 dark:text-slate-500">
                      Click the generate button to create your secure password
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Multiple Passwords */}
            {passwords.length > 0 && (
              <Card className="border-0 shadow-xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-lg">
                      <Shield className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">Password Collection</CardTitle>
                      <CardDescription>Multiple secure options to choose from</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {passwords.map((pwd, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-white dark:from-slate-800 dark:to-slate-700 rounded-xl border border-slate-200 dark:border-slate-600 hover:shadow-md transition-all duration-200"
                      >
                        <span className="font-mono text-sm flex-1 mr-4">
                          {showPassword ? pwd : "•".repeat(pwd.length)}
                        </span>
                        <Button
                          onClick={() => copyToClipboard(pwd)}
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity hover:bg-slate-100 dark:hover:bg-slate-600"
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
