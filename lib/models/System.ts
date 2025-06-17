import { ObjectId } from 'mongodb';

export interface SuggestionDocument {
  _id?: ObjectId;
  userId: ObjectId;
  type: 'feature' | 'improvement' | 'bug' | 'feedback';
  category: 'tool' | 'ui' | 'performance' | 'general';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'reviewing' | 'approved' | 'rejected' | 'implemented';
  votes: {
    upvotes: number;
    downvotes: number;
    voters: ObjectId[];
  };
  implementation: {
    estimatedEffort: 'small' | 'medium' | 'large';
    assignedTo?: ObjectId;
    targetVersion?: string;
    implementationNotes?: string;
  };
  adminResponse?: {
    message: string;
    respondedBy: ObjectId;
    respondedAt: Date;
  };
  attachments: Array<{
    type: 'image' | 'file' | 'link';
    url: string;
    name: string;
  }>;
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    implementedAt?: Date;
    userAgent?: string;
    ipAddress?: string;
  };
}

export interface SystemConfigDocument {
  _id?: ObjectId;
  key: string;
  value: any;
  category: 'feature_flags' | 'limits' | 'integrations' | 'ui' | 'security';
  description: string;
  dataType: 'string' | 'number' | 'boolean' | 'object' | 'array';
  validation: {
    required: boolean;
    min?: number;
    max?: number;
    pattern?: string;
    enum?: any[];
  };
  environment: 'development' | 'staging' | 'production' | 'all';
  isActive: boolean;
  isSecret: boolean;
  lastModifiedBy: ObjectId;
  version: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationDocument {
  _id?: ObjectId;
  userId: ObjectId;
  type: 'info' | 'warning' | 'error' | 'success';
  category: 'system' | 'tool' | 'account' | 'feature';
  title: string;
  message: string;
  actionUrl?: string;
  actionText?: string;
  isRead: boolean;
  isPersistent: boolean;
  expiresAt?: Date;
  metadata: {
    source: string;
    priority: 'low' | 'medium' | 'high';
    tags: string[];
  };
  createdAt: Date;
  readAt?: Date;
}