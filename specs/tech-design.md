
# Technical Design: Student CRM

This document outlines the technical data model for the Student CRM application, based on the initial analysis of the provided CSV data.

## Data Model

The data model is designed to be normalized, separating distinct concepts into their own entities to ensure data integrity and scalability.

```typescript
/**
 * Represents a student or member of the studio.
 * A member is uniquely identified by their phone number.
 */
interface Member {
  id: string; // Unique identifier (e.g., phone number)
  name: string;
  phoneNumber: string;
  createdAt: Date;
}

/**
 * Represents a type of membership plan offered by the studio.
 */
interface MembershipPlan {
  id: string; // Unique identifier for the plan (e.g., 'gz-kids-capoeira')
  name: string; // e.g., "广州儿童巴西战舞"
  targetAudience: 'adult' | 'child'; // Derived from the name
}

/**
 * Represents a specific membership instance held by a member.
 * This is the central object that is created, activated, and modified.
 */
interface Membership {
  id: string; // Unique ID for this specific membership instance
  memberId: string; // Foreign key to Member
  planId: string; // Foreign key to MembershipPlan
  status: 'active' | 'inactive' | 'deleted' | 'expired';
  activationDate?: Date;
  expirationDate?: Date;
  remainingClasses?: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Represents a single log entry from the CSV, detailing an operation
 * performed on a membership.
 */
interface OperationLog {
  id: string; // Unique ID for the log entry
  membershipId: string; // The membership that was affected
  operator: string; // Who performed the action (e.g., "系统自动", "Jessica老师")
  timestamp: Date; // The time the operation was recorded
  type: 'purchase' | 'activation' | 'edit' | 'deletion'; // The type of operation
  effectiveDate?: Date; // The date the operation takes effect (e.g., card activation date)
  details: string; // A description of what changed
  reason: string; // The reason for the change
  amount: number; // Monetary value of the transaction
}
```
