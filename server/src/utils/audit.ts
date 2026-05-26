import { db } from '../db';
import { auditLogs } from '../db/schema';

/**
 * Logs an administrative action to the audit_logs table.
 * @param admin The username or identifier of the administrator performing the action.
 * @param action The type of action (e.g., 'UPDATE', 'LOGIN', 'DELETE').
 * @param target The entity or resource being acted upon (e.g., 'faq', 'user_login').
 * @param details Additional JSON-serializable details about the action.
 */
export const logAudit = async (admin: string, action: string, target: string, details: any) => {
  try {
    await db.insert(auditLogs).values({
      timestamp: new Date().toISOString(),
      admin,
      action,
      target,
      details
    });
  } catch (e) {
    console.error("Failed to log audit event:", e);
  }
};
