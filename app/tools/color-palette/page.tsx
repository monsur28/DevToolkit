"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ToolLayout } from "@/components/tool-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Palette, Copy, Upload, Trash2, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NextImage from "next/image"

interface Color {
  hex: string
  rgb: { r: number; g: number; b: number }
  hsl: { h: number; s: number; l: number }
  name?: string
}

export default function ColorPaletteExtractorPage() {
  const [extractedColors, setExtractedColors] = useState<Color[]>([])
  const [generatedPalette, setGeneratedPalette] = useState<Color[]>([])
  const [baseColor, setBaseColor] = useState("#3b82f6")
  const [uploadedImage, setUploadedImage] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Color utility functions
  const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result
      ? {
          r: Number.parseInt(result[1], 16),
          g: Number.parseInt(result[2], 16),
          b: Number.parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 }
  }

  const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
  }

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255
    g /= 255
    b /= 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0,
      s = 0,
      l = (max + min) / 2

    if (max === min) {
      h = s = 0
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  const generateColorPalette = () => {
    if (!isMounted) return

    const rgb = hexToRgb(baseColor)
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

    const palette: Color[] = []

    // Generate complementary and analogous colors
    const variations = [
      { h: hsl.h, s: hsl.s, l: hsl.l, name: "Base" },
      { h: (hsl.h + 180) % 360, s: hsl.s, l: hsl.l, name: "Complementary" },
      { h: (hsl.h + 30) % 360, s: hsl.s, l: hsl.l, name: "Analogous 1" },
      { h: (hsl.h - 30 + 360) % 360, s: hsl.s, l: hsl.l, name: "Analogous 2" },
      { h: hsl.h, s: Math.max(0, hsl.s - 20), l: Math.min(100, hsl.l + 20), name: "Light" },
      { h: hsl.h, s: Math.min(100, hsl.s + 20), l: Math.max(0, hsl.l - 20), name: "Dark" },
      { h: (hsl.h + 120) % 360, s: hsl.s, l: hsl.l, name: "Triadic 1" },
      { h: (hsl.h + 240) % 360, s: hsl.s, l: hsl.l, name: "Triadic 2" },
    ]

    variations.forEach(({ h, s, l, name }) => {
      // Convert HSL back to RGB
      const c = (1 - Math.abs((2 * l) / 100 - 1)) * (s / 100)
      const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
      const m = l / 100 - c / 2

      let r = 0,
        g = 0,
        b = 0

      if (h >= 0 && h < 60) {
        r = c
        g = x
        b = 0
      } else if (h >= 60 && h < 120) {
        r = x
        g = c
        b = 0
      } else if (h >= 120 && h < 180) {
        r = 0
        g = c
        b = x
      } else if (h >= 180 && h < 240) {
        r = 0
        g = x
        b = c
      } else if (h >= 240 && h < 300) {
        r = x
        g = 0
        b = c
      } else if (h >= 300 && h < 360) {
        r = c
        g = 0
        b = x
      }

      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)

      palette.push({
        hex: rgbToHex(r, g, b),
        rgb: { r, g, b },
        hsl: { h, s, l },
        name,
      })
    })

    setGeneratedPalette(palette)
    toast({
      title: "Success",
      description: "Color palette generated successfully!",
    })
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!isMounted || typeof window === "undefined") return

    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Error",
        description: "Image size must be less than 5MB",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    const reader = new FileReader()

    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        extractColorsFromImage(img)
        setUploadedImage(e.target?.result as string)
      }
      img.onerror = () => {
        setIsProcessing(false)
        toast({
          title: "Error",
          description: "Failed to load image",
          variant: "destructive",
        })
      }
      img.src = e.target?.result as string
    }

    reader.onerror = () => {
      setIsProcessing(false)
      toast({
        title: "Error",
        description: "Failed to read file",
        variant: "destructive",
      })
    }

    reader.readAsDataURL(file)
  }

  const extractColorsFromImage = (img: HTMLImageElement) => {
    if (!isMounted || typeof window === "undefined") return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    try {
      // Resize image for processing
      const maxSize = 100
      const scale = Math.min(maxSize / img.width, maxSize / img.height)
      canvas.width = img.width * scale
      canvas.height = img.height * scale

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const data = imageData.data

      const colorMap = new Map<string, number>()

      // Sample pixels and count colors
      for (let i = 0; i < data.length; i += 16) {
        // Sample every 4th pixel
        const r = data[i]
        const g = data[i + 1]
        const b = data[i + 2]
        const alpha = data[i + 3]

        if (alpha > 128) {
          // Skip transparent pixels
          // Quantize colors to reduce noise
          const qR = Math.round(r / 32) * 32
          const qG = Math.round(g / 32) * 32
          const qB = Math.round(b / 32) * 32

          const hex = rgbToHex(qR, qG, qB)
          colorMap.set(hex, (colorMap.get(hex) || 0) + 1)
        }
      }

      // Get most frequent colors
      const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([hex]) => {
          const rgb = hexToRgb(hex)
          return {
            hex,
            rgb,
            hsl: rgbToHsl(rgb.r, rgb.g, rgb.b),
          }
        })

      setExtractedColors(sortedColors)
      setIsProcessing(false)

      toast({
        title: "Success",
        description: `Extracted ${sortedColors.length} dominant colors from image!`,
      })
    } catch (error) {
      setIsProcessing(false)
      toast({
        title: "Error",
        description: "Failed to extract colors from image",
        variant: "destructive",
      })
    }
  }

  const copyColor = async (color: Color, format: "hex" | "rgb" | "hsl") => {
    if (!isMounted || typeof window === "undefined") return

    let text = ""
    switch (format) {
      case "hex":
        text = color.hex
        break
      case "rgb":
        text = `rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b})`
        break
      case "hsl":
        text = `hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`
        break
    }

    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied!",
        description: `${format.toUpperCase()} color copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const copyPalette = async (colors: Color[]) => {
    if (!isMounted || typeof window === "undefined") return

    const paletteText = colors
      .map(
        (color) =>
          `${color.name || "Color"}: ${color.hex} | rgb(${color.rgb.r}, ${color.rgb.g}, ${color.rgb.b}) | hsl(${color.hsl.h}, ${color.hsl.s}%, ${color.hsl.l}%)`,
      )
      .join("\n")

    try {
      await navigator.clipboard.writeText(paletteText)
      toast({
        title: "Copied!",
        description: "Full palette copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  const clearAll = () => {
    setExtractedColors([])
    setGeneratedPalette([])
    setUploadedImage("")
    setBaseColor("#3b82f6")
  }

  const ColorCard = ({ color, showName = false }: { color: Color; showName?: boolean }) => (
    <div className="group relative">
      <div
        className="w-full h-24 rounded-lg border-2 border-muted cursor-pointer transition-transform hover:scale-105"
        style={{ backgroundColor: color.hex }}
        onClick={() => copyColor(color, "hex")}
      />
      <div className="mt-2 space-y-1">
        {showName && color.name && <p className="text-xs font-medium text-center">{color.name}</p>}
        <div className="flex justify-center space-x-1">
          <Button onClick={() => copyColor(color, "hex")} size="sm" variant="ghost" className="h-6 px-1 text-xs">
            HEX
          </Button>
          <Button onClick={() => copyColor(color, "rgb")} size="sm" variant="ghost" className="h-6 px-1 text-xs">
            RGB
          </Button>
          <Button onClick={() => copyColor(color, "hsl")} size="sm" variant="ghost" className="h-6 px-1 text-xs">
            HSL
          </Button>
        </div>
        <p className="text-xs text-center font-mono">{color.hex}</p>
      </div>
    </div>
  )

  // Show loading state until mounted
  if (!isMounted) {
    return (
      <ToolLayout
        title="Color Palette Extractor"
        description="Extract dominant colors from images and generate harmonious color palettes"
        icon={<Palette className="h-8 w-8 text-pink-500" />}
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
      title="Color Palette Extractor"
      description="Extract dominant colors from images and generate harmonious color palettes"
      icon={<Palette className="h-8 w-8 text-pink-500" />}
    >
      <Tabs defaultValue="extract" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="extract" className="flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Extract from Image</span>
          </TabsTrigger>
          <TabsTrigger value="generate" className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Generate Palette</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="extract" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Image Color Extraction</CardTitle>
              <CardDescription>Upload an image to extract its 5-10 most prominent colors</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Upload an image to extract colors (max 5MB)</p>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="max-w-xs mx-auto"
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {isProcessing && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Extracting colors...</p>
                </div>
              )}

              {uploadedImage && (
                <div className="text-center">
                  <NextImage
                    src={uploadedImage || "/placeholder.svg"}
                    alt="Uploaded"
                    className="max-w-xs max-h-48 mx-auto rounded-lg shadow-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {extractedColors.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Extracted Colors</CardTitle>
                    <CardDescription>Dominant colors from your image</CardDescription>
                  </div>
                  <Button onClick={() => copyPalette(extractedColors)} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-4">
                  {extractedColors.map((color, index) => (
                    <ColorCard key={index} color={color} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} style={{ display: "none" }} />
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Color Palette Generator</CardTitle>
              <CardDescription>Generate harmonious color palettes from a base color</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Base Color</label>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="color"
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-16 h-10 p-1 border rounded"
                    />
                    <Input
                      value={baseColor}
                      onChange={(e) => setBaseColor(e.target.value)}
                      className="w-32 font-mono text-sm"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-6">
                  <Button onClick={generateColorPalette} className="flex items-center space-x-2">
                    <Palette className="h-4 w-4" />
                    <span>Generate Palette</span>
                  </Button>
                  <Button onClick={clearAll} variant="outline" className="flex items-center space-x-2">
                    <Trash2 className="h-4 w-4" />
                    <span>Clear</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {generatedPalette.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">Generated Palette</CardTitle>
                    <CardDescription>Harmonious colors based on color theory</CardDescription>
                  </div>
                  <Button onClick={() => copyPalette(generatedPalette)} variant="outline" size="sm">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                  {generatedPalette.map((color, index) => (
                    <ColorCard key={index} color={color} showName />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Color Theory Guide</CardTitle>
          <CardDescription>Understanding color relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Complementary Colors</h4>
                <p className="text-muted-foreground">
                  Colors opposite on the color wheel. Create high contrast and vibrant looks.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Analogous Colors</h4>
                <p className="text-muted-foreground">
                  Colors next to each other on the color wheel. Create harmonious, serene designs.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Triadic Colors</h4>
                <p className="text-muted-foreground">
                  Three colors evenly spaced on the color wheel. Vibrant yet balanced.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Monochromatic</h4>
                <p className="text-muted-foreground">
                  Different shades and tints of the same color. Clean and elegant.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </ToolLayout>
  )
}
