'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Copy, Check, RefreshCw, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function GlassmorphismGenerator() {
    const [blur, setBlur] = useState(16);
    const [transparency, setTransparency] = useState(0.6);
    const [saturation, setSaturation] = useState(180);
    const [borderRadius, setBorderRadius] = useState(12);
    const [copied, setCopied] = useState(false);

    const rgbaColor = `rgba(255, 255, 255, ${transparency})`;

    const cssCode = `background: ${rgbaColor};
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
backdrop-filter: blur(${blur}px) saturate(${saturation}%);
-webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
border: 1px solid rgba(255, 255, 255, 0.3);
border-radius: ${borderRadius}px;`;

    const copyToClipboard = () => {
        navigator.clipboard.writeText(cssCode);
        setCopied(true);
        toast.success('CSS copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-6xl mx-auto"
            >
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Glassmorphism Generator
                    </h1>
                    <p className="text-muted-foreground">
                        Create beautiful, frosted glass effects for your modern UI designs.
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    {/* Controls Panel */}
                    <Card className="p-6 space-y-8 bg-card/50 backdrop-blur-sm border-primary/10">
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Blur Intensity ({blur}px)</Label>
                                <Palette className="w-4 h-4 text-primary" />
                            </div>
                            <Slider
                                value={[blur]}
                                onValueChange={(val) => setBlur(val[0])}
                                max={40}
                                step={1}
                                className="py-4"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Transparency ({Math.round(transparency * 100)}%)</Label>
                                <div className="w-4 h-4 rounded-full bg-white/20 border border-white/50" />
                            </div>
                            <Slider
                                value={[transparency]}
                                onValueChange={(val) => setTransparency(val[0])}
                                max={1}
                                step={0.05}
                                className="py-4"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Saturation ({saturation}%)</Label>
                                <RefreshCw className="w-4 h-4 text-purple-400" />
                            </div>
                            <Slider
                                value={[saturation]}
                                onValueChange={(val) => setSaturation(val[0])}
                                max={200}
                                min={0}
                                step={10}
                                className="py-4"
                            />
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Border Radius ({borderRadius}px)</Label>
                                <div className="w-4 h-4 border-2 border-primary rounded-md" />
                            </div>
                            <Slider
                                value={[borderRadius]}
                                onValueChange={(val) => setBorderRadius(val[0])}
                                max={50}
                                step={1}
                                className="py-4"
                            />
                        </div>

                        <div className="pt-4">
                            <div className="relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative bg-background rounded-lg p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-sm font-medium text-muted-foreground">CSS Output</span>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={copyToClipboard}
                                            className="h-8 w-8 p-0"
                                        >
                                            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                        </Button>
                                    </div>
                                    <pre className="text-sm font-mono overflow-x-auto p-4 bg-muted/50 rounded-md text-foreground">
                                        {cssCode}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Preview Panel */}
                    <div className="relative h-[600px] rounded-xl overflow-hidden border border-border/50 bg-[#1a1a1a] shadow-2xl">
                        {/* Animated Background */}
                        <div className="absolute inset-0">
                            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
                            <motion.div
                                animate={{
                                    x: [0, 100, 0],
                                    y: [0, -50, 0],
                                    scale: [1, 1.2, 1],
                                }}
                                transition={{ duration: 10, repeat: Infinity, repeatType: "reverse" }}
                                className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-50"
                            />
                            <motion.div
                                animate={{
                                    x: [0, -70, 0],
                                    y: [0, 80, 0],
                                    scale: [1, 1.5, 1],
                                }}
                                transition={{ duration: 15, repeat: Infinity, repeatType: "reverse" }}
                                className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-3xl opacity-50"
                            />
                            <motion.div
                                animate={{
                                    x: [0, 50, 0],
                                    y: [0, 50, 0],
                                    scale: [1, 1.1, 1],
                                }}
                                transition={{ duration: 12, repeat: Infinity, repeatType: "reverse" }}
                                className="absolute top-1/2 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-40"
                            />
                        </div>

                        {/* Glass Card */}
                        <motion.div
                            drag
                            dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                            dragElastic={0.2}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                        >
                            <div
                                className="w-80 h-48 pointer-events-auto cursor-move flex flex-col items-center justify-center p-6 text-center"
                                style={{
                                    background: rgbaColor,
                                    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                                    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
                                    border: '1px solid rgba(255, 255, 255, 0.3)',
                                    borderRadius: `${borderRadius}px`,
                                    boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <h3 className="text-xl font-bold text-white mb-2" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                                    Glassmorphism
                                </h3>
                                <p className="text-white/80 text-sm">
                                    Drag me around!
                                </p>
                                <div className="mt-4 px-4 py-1 rounded-full bg-black/20 text-white text-xs border border-white/20">
                                    v1.0
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
