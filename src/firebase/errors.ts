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
    const baseMessage = `Firestore Permission Error: Operation '${context.operation}' on path '${context.path}' was denied.`;
    const details = originalError?.message ? ` Details: ${originalError.message}` : '';
    super(`${baseMessage}${details}`);

    this.name = 'FirestorePermissionError';
    this.context = context;
    this.originalError = originalError;
    Object.setPrototypeOf(this, FirestorePermissionError.prototype);
  }
}
