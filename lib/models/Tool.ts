import { ObjectId } from 'mongodb';

export interface ToolDocument {
  _id?: ObjectId;
  name: string;
  slug: string;
  description: string;
  category: string;
  subcategory?: string;
  tags: string[];
  metadata: {
    version: string;
    author: string;
    license: string;
    repository?: string;
    documentation?: string;
    changelog?: string;
  };
  features: {
    aiPowered: boolean;
    realTime: boolean;
    collaborative: boolean;
    offline: boolean;
    apiAccess: boolean;
  };
  configuration: {
    isActive: boolean;
    isPublic: boolean;
    isFeatured: boolean;
    requiresAuth: boolean;
    requiresPro: boolean;
    maintenanceMode: boolean;
  };
  usage: {
    totalUsage: number;
    dailyUsage: number;
    weeklyUsage: number;
    monthlyUsage: number;
    averageRating: number;
    totalRatings: number;
  };
  performance: {
    averageResponseTime: number;
    uptime: number;
    errorRate: number;
    lastHealthCheck: Date;
  };
  ui: {
    icon: string;
    color: string;
    screenshots?: string[];
    demoUrl?: string;
  };
  dependencies: {
    external: string[];
    internal: ObjectId[];
  };
  limits: {
    dailyLimit?: number;
    monthlyLimit?: number;
    rateLimitPerMinute?: number;
    maxFileSize?: number;
  };
  timestamps: {
    createdAt: Date;
    updatedAt: Date;
    lastUsed?: Date;
    deprecatedAt?: Date;
  };
}

export interface ToolCategoryDocument {
  _id?: ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  parentCategory?: ObjectId;
  subcategories: ObjectId[];
  toolCount: number;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ToolVersionDocument {
  _id?: ObjectId;
  toolId: ObjectId;
  version: string;
  changelog: string;
  features: string[];
  bugFixes: string[];
  breakingChanges: string[];
  isStable: boolean;
  isDeprecated: boolean;
  releaseDate: Date;
  downloadCount: number;
  createdBy: ObjectId;
}