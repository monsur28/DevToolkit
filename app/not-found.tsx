'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, Compass } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] overflow-hidden relative">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                        x: [0, 50, 0],
                        y: [0, -50, 0],
                    }}
                    transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-1/4 -left-1/4 w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[100px]"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5, 1],
                        opacity: [0.2, 0.4, 0.2],
                        x: [0, -70, 0],
                        y: [0, 80, 0],
                    }}
                    transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                    className="absolute -bottom-1/4 -right-1/4 w-[600px] h-[600px] bg-blue-600/20 rounded-full blur-[100px]"
                />
            </div>

            <div className="relative z-10 text-center px-4">
                {/* Glitchy 404 Text */}
                <div className="relative mb-8">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[150px] font-black leading-none bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 select-none"
                    >
                        404
                    </motion.h1>
                    <motion.div
                        animate={{
                            opacity: [0, 0.5, 0],
                            x: [-5, 5, -5]
                        }}
                        transition={{ duration: 0.2, repeat: Infinity, repeatDelay: 3 }}
                        className="absolute inset-0 text-[150px] font-black leading-none text-white mix-blend-overlay select-none pointer-events-none"
                    >
                        404
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="space-y-6 max-w-md mx-auto"
                >
                    <h2 className="text-3xl font-bold text-white">
                        Page Not Found
                    </h2>
                    <p className="text-muted-foreground text-lg">
                        Oops! It looks like you've ventured into the void. The page you're looking for doesn't exist or has been moved.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button asChild size="lg" className="gap-2 group">
                            <Link href="/">
                                <Home className="w-4 h-4 group-hover:-translate-y-1 transition-transform" />
                                Go Home
                            </Link>
                        </Button>
                        <Button asChild variant="outline" size="lg" className="gap-2 group">
                            <Link href="/tools">
                                <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                                Explore Tools
                            </Link>
                        </Button>
                    </div>
                </motion.div>
            </div>

            {/* Decorative Grid */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        </div>
    );
}
