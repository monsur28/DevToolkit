'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Terminal,
    ChevronRight,
    Copy,
    Check,
    Command,
    GitBranch,
    RotateCcw,
    Save,
    UploadCloud,
    Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { toast } from 'sonner';

type GitCommand = {
    id: string;
    category: 'Configuration' | 'Create & Branch' | 'Changes' | 'Undo' | 'Remote';
    situation: string;
    command: string;
    note?: string;
};

const gitCommands: GitCommand[] = [
    // Configuration
    { id: 'config-user', category: 'Configuration', situation: 'Set my username globally', command: 'git config --global user.name "Your Name"' },
    { id: 'config-email', category: 'Configuration', situation: 'Set my email globally', command: 'git config --global user.email "you@example.com"' },

    // Create & Branch
    { id: 'init', category: 'Create & Branch', situation: 'Initialize a new repository', command: 'git init' },
    { id: 'clone', category: 'Create & Branch', situation: 'Clone a repository', command: 'git clone <repo_url>' },
    { id: 'new-branch', category: 'Create & Branch', situation: 'Create a new branch', command: 'git branch <branch_name>' },
    { id: 'switch-branch', category: 'Create & Branch', situation: 'Switch to a branch', command: 'git checkout <branch_name>' },
    { id: 'new-switch', category: 'Create & Branch', situation: 'Create and switch to a new branch', command: 'git checkout -b <branch_name>' },
    { id: 'delete-branch', category: 'Create & Branch', situation: 'Delete a local branch', command: 'git branch -d <branch_name>' },

    // Changes
    { id: 'status', category: 'Changes', situation: 'Check status of changes', command: 'git status' },
    { id: 'add-all', category: 'Changes', situation: 'Stage all changes', command: 'git add .' },
    { id: 'commit', category: 'Changes', situation: 'Commit staged changes', command: 'git commit -m "Commit message"' },
    { id: 'amend', category: 'Changes', situation: 'Modify the last commit message', command: 'git commit --amend' },
    { id: 'stash', category: 'Changes', situation: 'Stash local changes', command: 'git stash' },
    { id: 'stash-pop', category: 'Changes', situation: 'Apply stashed changes', command: 'git stash pop' },

    // Undo
    { id: 'undo-commit-soft', category: 'Undo', situation: 'Undo last commit (keep changes)', command: 'git reset --soft HEAD~1', note: 'Moves changes back to staging area' },
    { id: 'undo-commit-hard', category: 'Undo', situation: 'Undo last commit (delete changes)', command: 'git reset --hard HEAD~1', note: 'WARNING: Destructive action' },
    { id: 'discard-file', category: 'Undo', situation: 'Discard changes in a file', command: 'git checkout -- <file_name>' },

    // Remote
    { id: 'remote-add', category: 'Remote', situation: 'Connect to a remote repo', command: 'git remote add origin <url>' },
    { id: 'push', category: 'Remote', situation: 'Push changes to remote', command: 'git push origin <branch_name>' },
    { id: 'pull', category: 'Remote', situation: 'Pull changes from remote', command: 'git pull' },
    { id: 'fetch', category: 'Remote', situation: 'Fetch changes without merging', command: 'git fetch' },
];

const categories = Array.from(new Set(gitCommands.map(c => c.category)));

export default function GitExplorer() {
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCommand, setSelectedCommand] = useState<GitCommand | null>(null);
    const [copied, setCopied] = useState(false);

    const filteredCommands = gitCommands.filter(cmd => {
        const matchesCategory = selectedCategory === 'all' || cmd.category === selectedCategory;
        const matchesSearch = cmd.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cmd.command.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleCopy = () => {
        if (selectedCommand) {
            navigator.clipboard.writeText(selectedCommand.command);
            setCopied(true);
            toast.success('Command copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl mx-auto"
            >
                <div className="text-center mb-12">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-primary/10 rounded-xl relative">
                            <Terminal className="w-10 h-10 text-primary" />
                            <div className="absolute inset-0 bg-primary/20 rounded-xl animate-pulse" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-500 bg-clip-text text-transparent">
                        Git Command Explorer
                    </h1>
                    <p className="text-muted-foreground">
                        Find the right Git command for any situation instantly.
                    </p>
                </div>

                <div className="grid md:grid-cols-[1fr,1.5fr] gap-8 h-[600px]">
                    {/* Sidebar - Command Selection */}
                    <Card className="flex flex-col h-full bg-card/50 backdrop-blur-sm border-border/50 overflow-hidden">
                        <div className="p-4 border-b space-y-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    placeholder="I want to..."
                                    className="pl-9"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Category" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
                            {filteredCommands.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground text-sm">
                                    No commands found matching "{searchQuery}"
                                </div>
                            ) : (
                                filteredCommands.map(cmd => (
                                    <button
                                        key={cmd.id}
                                        onClick={() => setSelectedCommand(cmd)}
                                        className={`w-full text-left px-4 py-3 rounded-md text-sm transition-all flex items-center justify-between group ${selectedCommand?.id === cmd.id
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : 'hover:bg-muted/50 text-muted-foreground'
                                            }`}
                                    >
                                        <span>{cmd.situation}</span>
                                        <ChevronRight className={`w-4 h-4 transition-transform ${selectedCommand?.id === cmd.id ? 'opacity-100 translate-x-1' : 'opacity-0 -translate-x-2 group-hover:opacity-50 group-hover:translate-x-0'}`} />
                                    </button>
                                ))
                            )}
                        </div>
                    </Card>

                    {/* Main Area - Terminal Output */}
                    <div className="h-full">
                        <AnimatePresence mode="wait">
                            {selectedCommand ? (
                                <motion.div
                                    key={selectedCommand.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="h-full flex flex-col"
                                >
                                    <Card className="flex-1 bg-[#1e1e1e] border-none shadow-2xl overflow-hidden flex flex-col font-mono text-sm relative">
                                        {/* Terminal Header */}
                                        <div className="flex items-center px-4 py-3 bg-[#2d2d2d] border-b border-[#3d3d3d]">
                                            <div className="flex spacing-x-2 gap-2">
                                                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                            </div>
                                            <div className="ml-4 text-xs text-muted-foreground">bash — 80x24</div>
                                        </div>

                                        {/* Terminal Body */}
                                        <div className="flex-1 p-6 text-green-400 font-mono relative">
                                            <div className="mb-4 text-muted-foreground select-none">
                                                # {selectedCommand.situation}
                                            </div>
                                            <div className="flex items-start gap-3 text-lg">
                                                <span className="text-blue-400 select-none">$</span>
                                                <span className="break-all">{selectedCommand.command}</span>
                                            </div>

                                            {selectedCommand.note && (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.5 }}
                                                    className="mt-8 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded text-yellow-500 text-xs flex items-start gap-2"
                                                >
                                                    <span className="text-base">⚠️</span>
                                                    {selectedCommand.note}
                                                </motion.div>
                                            )}

                                            {/* Blinking Cursor */}
                                            <motion.div
                                                animate={{ opacity: [0, 1, 0] }}
                                                transition={{ repeat: Infinity, duration: 0.8 }}
                                                className="w-2.5 h-5 bg-green-400 mt-4 inline-block"
                                            />
                                        </div>

                                        {/* Copy Button */}
                                        <div className="absolute top-16 right-4">
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="text-muted-foreground hover:text-white hover:bg-white/10"
                                                onClick={handleCopy}
                                            >
                                                {copied ? (
                                                    <Check className="w-4 h-4 text-green-400" />
                                                ) : (
                                                    <div className="flex items-center gap-2">
                                                        <Copy className="w-4 h-4" />
                                                        <span className="text-xs">Copy</span>
                                                    </div>
                                                )}
                                            </Button>
                                        </div>
                                    </Card>
                                </motion.div>
                            ) : (
                                <div className="h-full flex items-center justify-center text-center p-8 text-muted-foreground bg-muted/10 rounded-xl border border-dashed border-muted">
                                    <div className="max-w-xs">
                                        <Command className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <h3 className="text-lg font-medium mb-2">Select a scenario</h3>
                                        <p className="text-sm">Choose what you want to achieve from the list on the left to generate the correct Git command.</p>
                                    </div>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
