'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, RefreshCw, Copy, Check, Palette, Layers } from 'lucide-react';
import { toast } from 'sonner';

// --- Blob Generation Logic ---
const createBlob = (complexity: number, contrast: number, seed: number) => {
    const points = [];
    const count = 3 + complexity;
    const angleStep = (Math.PI * 2) / count;

    // Pseudo-random generator based on seed
    const random = (i: number) => {
        const x = Math.sin(seed + i * 12.34) * 10000;
        return x - Math.floor(x);
    };

    for (let i = 0; i < count; i++) {
        const angle = i * angleStep;
        // Contrast defines how much the radius varies
        const radius = 100 + (random(i) - 0.5) * contrast * 1.5;
        const x = 250 + Math.cos(angle) * radius;
        const y = 250 + Math.sin(angle) * radius;
        points.push({ x, y });
    }

    // Smooth SVG Path using cubic bezier curves
    // Catmull-Rom like smoothing
    const d = points.reduce((acc, point, i, a) => {
        if (i === 0) return `M ${point.x},${point.y}`;

        // Calculate control points
        // Simplify: just use simple smoothing for now or average
        // Better: use the midpoint strategy for quadratic curves
        const prev = a[i - 1];
        const midX = (prev.x + point.x) / 2;
        const midY = (prev.y + point.y) / 2;

        // For the first point, we just move there, but to make it smooth circular, 
        // we need to handle the Wrap around. 
        // Actually, a simpler strategy for blobs is "Midpoint Smoothing"
        return `${acc} Q ${prev.x},${prev.y} ${midX},${midY}`;
    }, '');

    // Close the loop
    const p0 = points[0];
    const last = points[points.length - 1];
    const midX = (last.x + p0.x) / 2;
    const midY = (last.y + p0.y) / 2;

    // This simple Quad bezier approach needs to start from a midpoint to be perfectly smooth at closure
    // Let's refine: Start at midpoint between 0 and 1.

    let path = `M ${(points[0].x + points[1].x) / 2},${(points[0].y + points[1].y) / 2}`;
    for (let i = 1; i < points.length; i++) {
        const p = points[i];
        const next = points[(i + 1) % points.length];
        const midX = (p.x + next.x) / 2;
        const midY = (p.y + next.y) / 2;
        path += ` Q ${p.x},${p.y} ${midX},${midY}`;
    }
    // Close with the last curve
    const p = points[0];
    const next = points[1];
    const midX2 = (p.x + next.x) / 2;
    const midY2 = (p.y + next.y) / 2;
    path += ` Q ${p.x},${p.y} ${midX2},${midY2}`;

    return path + ' Z';
};

// --- Wave Generation Logic ---
const createWave = (layers: number, amplitude: number, frequency: number, seed: number) => {
    return Array.from({ length: layers }).map((_, i) => {
        const offset = i * 20;
        const phase = seed + i * 2;
        let d = `M 0,300`; // Start low

        const steps = 20;
        for (let x = 0; x <= steps; x++) {
            const xPos = (x / steps) * 500;
            const normX = x / steps;
            const yPos = 250 + Math.sin(normX * frequency * Math.PI * 2 + phase) * amplitude + offset;
            d += ` L ${xPos},${yPos}`;
        }

        d += ` L 500,500 L 0,500 Z`; // Close bottom
        return { d, opacity: 1 - (i * 0.2) };
    });
};


export default function SVGShapeGenerator() {
    const [activeTab, setActiveTab] = useState('blob');

    // Blob State
    const [complexity, setComplexity] = useState(5);
    const [contrast, setContrast] = useState(50);
    const [blobSeed, setBlobSeed] = useState(1);
    const [fillColor, setFillColor] = useState('#6366f1');
    const [useGradient, setUseGradient] = useState(true);

    // Wave State
    const [layers, setLayers] = useState(3);
    const [amplitude, setAmplitude] = useState(30);
    const [frequency, setFrequency] = useState(2);
    const [waveSeed, setWaveSeed] = useState(1);

    const [copied, setCopied] = useState(false);

    // Generate Blob
    const blobPath = useMemo(() => createBlob(complexity, contrast, blobSeed), [complexity, contrast, blobSeed]);

    // Generate Wave
    const waves = useMemo(() => createWave(layers, amplitude, frequency, waveSeed), [layers, amplitude, frequency, waveSeed]);

    // Generate SVG Code
    const getSvgCode = () => {
        if (activeTab === 'blob') {
            return `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${fillColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${adjustColor(fillColor, 40)};stop-opacity:1" />
    </linearGradient>
  </defs>
  <path d="${blobPath}" fill="${useGradient ? 'url(#grad1)' : fillColor}" />
</svg>`;
        } else {
            return `<svg viewBox="0 0 500 500" xmlns="http://www.w3.org/2000/svg">
  ${waves.map((w, i) => `<path d="${w.d}" fill="${fillColor}" opacity="${w.opacity}" />`).join('\n  ')}
</svg>`;
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(getSvgCode());
        setCopied(true);
        toast.success('SVG code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Simple color adjuster for gradient (lighten)
    const adjustColor = (color: string, amount: number) => {
        // Very basic placeholder, in real app use a lib
        return color;
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl relative">
                            <Layers className="w-10 h-10 text-primary" />
                            <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-pink-500 to-violet-500 bg-clip-text text-transparent">
                        SVG Shape Generator
                    </h1>
                    <p className="text-muted-foreground">
                        Generate organic blobs and waves for your designs.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">

                    {/* Controls */}
                    <Card className="p-6 bg-card border-border/50">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2 mb-8">
                                <TabsTrigger value="blob">Blob</TabsTrigger>
                                <TabsTrigger value="wave">Wave</TabsTrigger>
                            </TabsList>

                            <TabsContent value="blob" className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Complexity ({complexity})</Label>
                                    </div>
                                    <Slider value={[complexity]} onValueChange={(v) => setComplexity(v[0])} min={2} max={15} step={1} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Randomness ({contrast})</Label>
                                    </div>
                                    <Slider value={[contrast]} onValueChange={(v) => setContrast(v[0])} min={10} max={100} step={1} />
                                </div>
                                <div className="pt-4">
                                    <Button variant="outline" onClick={() => setBlobSeed(Math.random() * 100)} className="w-full gap-2">
                                        <RefreshCw className="w-4 h-4" /> Randomize Shape
                                    </Button>
                                </div>
                            </TabsContent>

                            <TabsContent value="wave" className="space-y-6">
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Layers ({layers})</Label>
                                    </div>
                                    <Slider value={[layers]} onValueChange={(v) => setLayers(v[0])} min={1} max={5} step={1} />
                                </div>
                                <div className="space-y-4">
                                    <div className="flex justify-between">
                                        <Label>Amplitude ({amplitude})</Label>
                                    </div>
                                    <Slider value={[amplitude]} onValueChange={(v) => setAmplitude(v[0])} min={10} max={100} step={1} />
                                </div>
                                <div className="pt-4">
                                    <Button variant="outline" onClick={() => setWaveSeed(Math.random() * 100)} className="w-full gap-2">
                                        <RefreshCw className="w-4 h-4" /> Randomize Wave
                                    </Button>
                                </div>
                            </TabsContent>

                            {/* Common Appearance Controls */}
                            <div className="mt-8 pt-8 border-t space-y-6">
                                <h3 className="font-medium flex items-center gap-2">
                                    <Palette className="w-4 h-4" /> Appearance
                                </h3>
                                <div className="flex items-center gap-4">
                                    <Input
                                        type="color"
                                        value={fillColor}
                                        onChange={(e) => setFillColor(e.target.value)}
                                        className="w-16 h-10 p-1"
                                    />
                                    <div className="flex-1">
                                        <Label>Color</Label>
                                        <p className="text-xs text-muted-foreground">Base fill color</p>
                                    </div>
                                </div>
                            </div>
                        </Tabs>
                    </Card>

                    {/* Preview */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-full aspect-square bg-muted/20 border border-border/50 rounded-xl overflow-hidden flex items-center justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')]">
                            <svg viewBox="0 0 500 500" className="w-full h-full drop-shadow-2xl transition-all duration-500">
                                <defs>
                                    <linearGradient id="previewGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor={fillColor} />
                                        <stop offset="100%" stopColor={fillColor} stopOpacity="0.6" />
                                    </linearGradient>
                                </defs>

                                {activeTab === 'blob' && (
                                    <motion.path
                                        d={blobPath}
                                        fill={useGradient ? "url(#previewGrad)" : fillColor}
                                        initial={{ scale: 0.8 }}
                                        animate={{ d: blobPath, scale: 1 }}
                                        transition={{ type: "spring", stiffness: 50, damping: 15 }}
                                    />
                                )}

                                {activeTab === 'wave' && (
                                    <>
                                        {waves.map((w, i) => (
                                            <motion.path
                                                key={i}
                                                d={w.d}
                                                fill={fillColor}
                                                opacity={w.opacity}
                                                initial={{ y: 50, opacity: 0 }}
                                                animate={{ y: 0, opacity: w.opacity, d: w.d }}
                                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                            />
                                        ))}
                                    </>
                                )}
                            </svg>
                        </div>

                        <div className="mt-6 flex gap-4 w-full">
                            <Button onClick={copyToClipboard} size="lg" className="flex-1 gap-2">
                                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                {copied ? "Copied!" : "Copy SVG Code"}
                            </Button>
                        </div>

                        <div className="mt-4 p-4 bg-muted/50 rounded-lg w-full text-xs font-mono overflow-hidden text-muted-foreground whitespace-nowrap text-ellipsis">
                            {getSvgCode().slice(0, 50)}...
                        </div>
                    </div>

                </div>
            </motion.div>
        </div>
    );
}
