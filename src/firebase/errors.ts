'use client';
export type SecurityRuleContext = {
  path: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  requestResourceData?: any;
};

// This is a custom error that we can throw when a user doesn't have
// permission to perform an action.
export class FirestorePermissionError extends Error {
  context: SecurityRuleContext;
  originalError?: any;
  constructor(context: SecurityRuleContext, originalError?: any) {
    // Pass the original error message directly for more clarity
    super(originalError?.message || `Firestore Permission Error: Operation '${context.operation}' on path '${context.path}' was denied.`);

    this.name = 'FirestorePermissionError';
    this.context = context;
    this.originalError = originalError;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
