# MongoDB Database Schema Documentation

## Overview
This document outlines the comprehensive MongoDB database schema for the DevToolkit application, designed to handle user management, tool inventory, analytics, and system configuration.

## Collections Structure

### 1. Users Collection
**Purpose**: Store user profiles, authentication data, preferences, and usage information.

```javascript
{
  _id: ObjectId,
  email: "user@example.com",
  password: "hashed_password",
  profile: {
    firstName: "John",
    lastName: "Doe",
    avatar: "https://example.com/avatar.jpg",
    bio: "Full-stack developer",
    website: "https://johndoe.com",
    location: "San Francisco, CA"
  },
  preferences: {
    theme: "dark", // "light" | "dark" | "system"
    language: "en",
    timezone: "America/Los_Angeles",
    notifications: {
      email: true,
      push: true,
      marketing: false
    },
    privacy: {
      profileVisibility: "private", // "public" | "private"
      showActivity: false
    }
  },
  authentication: {
    isVerified: true,
    verificationToken: "uuid",
    verificationTokenExpiry: ISODate,
    resetToken: "uuid",
    resetTokenExpiry: ISODate,
    lastPasswordChange: ISODate,
    failedLoginAttempts: 0,
    lockedUntil: ISODate
  },
  role: "user", // "user" | "admin" | "moderator"
  subscription: {
    plan: "pro", // "free" | "pro" | "enterprise"
    status: "active", // "active" | "cancelled" | "expired"
    startDate: ISODate,
    endDate: ISODate,
    features: ["ai_tools", "unlimited_usage", "priority_support"]
  },
  usage: {
    dailyCount: 25,
    monthlyCount: 450,
    totalCount: 2500,
    dailyLimit: 100,
    monthlyLimit: 2000,
    lastResetDate: ISODate,
    lastUsageDate: ISODate
  },
  status: {
    isActive: true,
    isSuspended: false,
    suspensionReason: "violation_of_terms",
    lastLogin: ISODate,
    lastActivity: ISODate
  },
  metadata: {
    createdAt: ISODate,
    updatedAt: ISODate,
    createdBy: ObjectId,
    source: "web", // "web" | "api" | "admin"
    ipAddress: "192.168.1.1",
    userAgent: "Mozilla/5.0..."
  }
}
```

**Indexes**:
- `{ email: 1 }` (unique)
- `{ verificationToken: 1 }` (sparse)
- `{ resetToken: 1 }` (sparse)
- `{ role: 1 }`
- `{ "subscription.plan": 1 }`
- `{ "status.isActive": 1 }`
- `{ "metadata.createdAt": 1 }`

### 2. Sessions Collection
**Purpose**: Manage user sessions and device tracking.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  sessionToken: "jwt_token",
  deviceInfo: {
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1",
    location: "San Francisco, CA",
    deviceType: "desktop", // "desktop" | "mobile" | "tablet"
    browser: "Chrome",
    os: "macOS"
  },
  isActive: true,
  expiresAt: ISODate,
  createdAt: ISODate,
  lastAccessedAt: ISODate
}
```

**Indexes**:
- `{ userId: 1 }`
- `{ sessionToken: 1 }` (unique)
- `{ expiresAt: 1 }` (TTL index)

### 3. Tools Collection
**Purpose**: Store tool metadata, configuration, and performance metrics.

```javascript
{
  _id: ObjectId,
  name: "AI SQL Query Generator",
  slug: "ai-sql-query-generator",
  description: "Generate SQL queries from natural language",
  category: "ai-powered",
  subcategory: "database",
  tags: ["sql", "ai", "database", "query"],
  metadata: {
    version: "2.1.0",
    author: "DevToolkit Team",
    license: "MIT",
    repository: "https://github.com/devtoolkit/sql-generator",
    documentation: "https://docs.devtoolkit.com/sql-generator",
    changelog: "Added support for complex joins"
  },
  features: {
    aiPowered: true,
    realTime: false,
    collaborative: false,
    offline: false,
    apiAccess: true
  },
  configuration: {
    isActive: true,
    isPublic: true,
    isFeatured: true,
    requiresAuth: true,
    requiresPro: false,
    maintenanceMode: false
  },
  usage: {
    totalUsage: 15420,
    dailyUsage: 234,
    weeklyUsage: 1680,
    monthlyUsage: 7200,
    averageRating: 4.7,
    totalRatings: 156
  },
  performance: {
    averageResponseTime: 850, // milliseconds
    uptime: 99.95,
    errorRate: 0.02,
    lastHealthCheck: ISODate
  },
  ui: {
    icon: "database",
    color: "#3B82F6",
    screenshots: ["https://example.com/screenshot1.jpg"],
    demoUrl: "https://demo.devtoolkit.com/sql-generator"
  },
  dependencies: {
    external: ["@google/generative-ai", "sql-formatter"],
    internal: [ObjectId] // References to other tools
  },
  limits: {
    dailyLimit: 50,
    monthlyLimit: 1000,
    rateLimitPerMinute: 10,
    maxFileSize: 5242880 // 5MB in bytes
  },
  timestamps: {
    createdAt: ISODate,
    updatedAt: ISODate,
    lastUsed: ISODate,
    deprecatedAt: ISODate
  }
}
```

**Indexes**:
- `{ slug: 1 }` (unique)
- `{ category: 1 }`
- `{ "features.aiPowered": 1 }`
- `{ "configuration.isActive": 1 }`
- `{ "configuration.isFeatured": 1 }`
- `{ tags: 1 }`

### 4. Usage Analytics Collection
**Purpose**: Track detailed usage patterns and performance metrics.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  toolId: ObjectId,
  sessionId: ObjectId,
  usage: {
    startTime: ISODate,
    endTime: ISODate,
    duration: 2340, // milliseconds
    inputSize: 1024, // bytes
    outputSize: 2048, // bytes
    success: true,
    errorMessage: "API rate limit exceeded"
  },
  context: {
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1",
    referrer: "https://google.com",
    location: {
      country: "US",
      region: "CA",
      city: "San Francisco"
    }
  },
  performance: {
    responseTime: 850,
    memoryUsage: 45.2, // MB
    cpuUsage: 12.5 // percentage
  },
  metadata: {
    version: "2.1.0",
    features: ["ai_generation", "syntax_highlighting"],
    customData: {
      queryComplexity: "medium",
      tableCount: 3
    }
  },
  timestamp: ISODate
}
```

**Indexes**:
- `{ userId: 1, timestamp: 1 }`
- `{ toolId: 1, timestamp: 1 }`
- `{ timestamp: 1 }` (TTL index - 1 year)
- `{ "usage.success": 1 }`

### 5. System Analytics Collection
**Purpose**: Store aggregated daily analytics and trends.

```javascript
{
  _id: ObjectId,
  date: "2024-01-15", // YYYY-MM-DD format
  metrics: {
    users: {
      total: 15420,
      active: 8750,
      new: 234,
      verified: 14890,
      premium: 3200
    },
    tools: {
      totalUsage: 45680,
      uniqueUsers: 7890,
      averageSessionDuration: 4.5, // minutes
      mostUsedTools: [
        {
          toolId: ObjectId,
          toolName: "JSON Formatter",
          usageCount: 5670
        }
      ]
    },
    performance: {
      averageResponseTime: 650,
      errorRate: 0.015,
      uptime: 99.98,
      peakConcurrentUsers: 450
    },
    engagement: {
      pageViews: 125000,
      bounceRate: 0.25,
      averageSessionDuration: 8.5,
      returnUserRate: 0.68
    }
  },
  trends: {
    userGrowth: 0.05, // 5% growth
    usageGrowth: 0.12,
    performanceChange: -0.02 // 2% improvement
  },
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes**:
- `{ date: 1 }` (unique)
- `{ "metrics.users.total": 1 }`
- `{ createdAt: 1 }`

### 6. Suggestions Collection
**Purpose**: Store user feedback, feature requests, and bug reports.

```javascript
{
  _id: ObjectId,
  userId: ObjectId,
  type: "feature", // "feature" | "improvement" | "bug" | "feedback"
  category: "tool", // "tool" | "ui" | "performance" | "general"
  title: "Add dark mode to SQL generator",
  description: "It would be great to have a dark mode option...",
  priority: "medium", // "low" | "medium" | "high" | "critical"
  status: "approved", // "pending" | "reviewing" | "approved" | "rejected" | "implemented"
  votes: {
    upvotes: 45,
    downvotes: 2,
    voters: [ObjectId] // Array of user IDs who voted
  },
  implementation: {
    estimatedEffort: "medium", // "small" | "medium" | "large"
    assignedTo: ObjectId,
    targetVersion: "2.2.0",
    implementationNotes: "Will be included in the next UI overhaul"
  },
  adminResponse: {
    message: "Great suggestion! We'll include this in the next release.",
    respondedBy: ObjectId,
    respondedAt: ISODate
  },
  attachments: [
    {
      type: "image", // "image" | "file" | "link"
      url: "https://example.com/mockup.png",
      name: "Dark mode mockup"
    }
  ],
  metadata: {
    createdAt: ISODate,
    updatedAt: ISODate,
    implementedAt: ISODate,
    userAgent: "Mozilla/5.0...",
    ipAddress: "192.168.1.1"
  }
}
```

**Indexes**:
- `{ userId: 1 }`
- `{ status: 1 }`
- `{ type: 1 }`
- `{ priority: 1 }`
- `{ "votes.upvotes": 1 }`

### 7. System Configuration Collection
**Purpose**: Store application settings, feature flags, and configuration parameters.

```javascript
{
  _id: ObjectId,
  key: "ai_rate_limit_per_minute",
  value: 10,
  category: "limits", // "feature_flags" | "limits" | "integrations" | "ui" | "security"
  description: "Maximum AI API calls per minute per user",
  dataType: "number", // "string" | "number" | "boolean" | "object" | "array"
  validation: {
    required: true,
    min: 1,
    max: 100,
    pattern: null,
    enum: null
  },
  environment: "production", // "development" | "staging" | "production" | "all"
  isActive: true,
  isSecret: false,
  lastModifiedBy: ObjectId,
  version: 3,
  createdAt: ISODate,
  updatedAt: ISODate
}
```

**Indexes**:
- `{ key: 1 }` (unique)
- `{ category: 1 }`
- `{ environment: 1 }`
- `{ isActive: 1 }`

## Relationships and Access Patterns

### Primary Relationships
1. **Users → Sessions**: One-to-many (user can have multiple active sessions)
2. **Users → Usage Analytics**: One-to-many (user generates multiple usage records)
3. **Users → Suggestions**: One-to-many (user can submit multiple suggestions)
4. **Users → Activity Logs**: One-to-many (user generates multiple activity logs)
5. **Tools → Usage Analytics**: One-to-many (tool can have multiple usage records)
6. **Tools → Tool Categories**: Many-to-one (tools belong to categories)

### Common Access Patterns
1. **User Dashboard**: Fetch user profile, recent activity, usage statistics
2. **Tool Analytics**: Aggregate usage data by tool, time period, user segments
3. **Admin Dashboard**: System-wide analytics, user management, suggestion review
4. **Real-time Monitoring**: Current active users, system performance, error rates

## Data Backup and Recovery Strategy

### Backup Schedule
- **Full Backup**: Daily at 2 AM UTC
- **Incremental Backup**: Every 6 hours
- **Point-in-time Recovery**: Enabled with 7-day retention

### Backup Storage
- **Primary**: MongoDB Atlas automated backups
- **Secondary**: AWS S3 cross-region replication
- **Archive**: Monthly snapshots retained for 1 year

### Recovery Procedures
1. **Database Corruption**: Restore from latest full backup
2. **Data Loss**: Point-in-time recovery to specific timestamp
3. **Disaster Recovery**: Cross-region failover with <15 minute RTO

## Security and Privacy Considerations

### Data Encryption
- **At Rest**: AES-256 encryption for all collections
- **In Transit**: TLS 1.3 for all database connections
- **Application Level**: Sensitive fields (passwords, tokens) additionally encrypted

### Access Control
- **Authentication**: SCRAM-SHA-256 with strong passwords
- **Authorization**: Role-based access control (RBAC)
- **Network Security**: IP whitelisting and VPC isolation

### Privacy Compliance
- **GDPR**: User data export/deletion capabilities
- **Data Retention**: Automated cleanup of expired sessions and logs
- **Anonymization**: PII removal from analytics after aggregation

### Monitoring and Alerting
- **Performance**: Query performance monitoring with slow query alerts
- **Security**: Failed authentication attempts and suspicious activity detection
- **Capacity**: Storage and connection limit monitoring
- **Availability**: Uptime monitoring with automated failover

This schema provides a robust foundation for the DevToolkit application with proper indexing, relationships, and scalability considerations built in from the start.