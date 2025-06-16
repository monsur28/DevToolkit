"use client"

import { useState, useEffect } from "react"
import { ToolLayout } from "@/components/tool-layout"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Key, Copy, Trash2, ArrowRight, ArrowLeft } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function Base64Page() {
  const [input, setInput] = useState("")
  const [output, setOutput] = useState("")
  const [isMounted, setIsMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const encode = () => {
    if (typeof window === "undefined") return

    try {
      const encoded = btoa(input)
      setOutput(encoded)
      toast({
        title: "Success",
        description: "Text encoded to Base64 successfully",
      })
    } catch (err) {
      toast({
        title: "Encoding Error",
        description: "Failed to encode the input text. Make sure the text contains only valid characters.",
        variant: "destructive",
      })
    }
  }

  const decode = () => {
    if (typeof window === "undefined") return

    try {
      const decoded = atob(input)
      setOutput(decoded)
      toast({
        title: "Success",
        description: "Base64 decoded successfully",
      })
    } catch (err) {
      toast({
        title: "Decoding Error",
        description: "Invalid Base64 string. Please check your input.",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async () => {
    if (typeof window === "undefined" || !output) return

    try {
      await navigator.clipboard.writeText(output)
      toast({
        title: "Copied!",
        description: "Result copied to clipboard",
      })
    } catch (err) {
      toast({
        title: "Copy Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const clear = () => {
    setInput("")
    setOutput("")
  }

  const swap = () => {
    const temp = input
    setInput(output)
    setOutput(temp)
  }

  // Show loading state until mounted to prevent hydration issues
  if (!isMounted) {
    return (
      <ToolLayout
        title="Base64 Encoder/Decoder"
        description="Encode text to Base64 or decode Base64 strings back to readable text"
        icon={<Key className="h-8 w-8 text-green-500" />}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      </ToolLayout>
    )
  }

  return (
    <ToolLayout
      title="Base64 Encoder/Decoder"
      description="Encode text to Base64 or decode Base64 strings back to readable text"
      icon={<Key className="h-8 w-8 text-green-500" />}
    >
      <Tabs defaultValue="encode" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="encode" className="flex items-center space-x-2">
            <ArrowRight className="h-4 w-4" />
            <span>Encode</span>
          </TabsTrigger>
          <TabsTrigger value="decode" className="flex items-center space-x-2">
            <ArrowLeft className="h-4 w-4" />
            <span>Decode</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="encode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">Text to Encode</label>
              <Textarea
                placeholder="Enter text to encode to Base64..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[300px]"
              />
              <div className="flex gap-2">
                <Button onClick={encode} disabled={!input.trim()} className="flex items-center space-x-2">
                  <ArrowRight className="h-4 w-4" />
                  <span>Encode</span>
                </Button>
                <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Base64 Output</label>
                {output && (
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Base64 encoded text will appear here..."
                value={output}
                readOnly
                className="min-h-[300px] font-mono text-sm bg-muted"
              />
              {output && (
                <Button onClick={swap} variant="outline" size="sm">
                  Use as Input
                </Button>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="decode" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <label className="text-sm font-medium">Base64 to Decode</label>
              <Textarea
                placeholder="Enter Base64 string to decode..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="min-h-[300px] font-mono text-sm"
              />
              <div className="flex gap-2">
                <Button onClick={decode} disabled={!input.trim()} className="flex items-center space-x-2">
                  <ArrowLeft className="h-4 w-4" />
                  <span>Decode</span>
                </Button>
                <Button onClick={clear} variant="outline" className="flex items-center space-x-2">
                  <Trash2 className="h-4 w-4" />
                  <span>Clear</span>
                </Button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Decoded Text</label>
                {output && (
                  <Button onClick={copyToClipboard} size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Decoded text will appear here..."
                value={output}
                readOnly
                className="min-h-[300px] bg-muted"
              />
              {output && (
                <Button onClick={swap} variant="outline" size="sm">
                  Use as Input
                </Button>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </ToolLayout>
  )
}
