// ============================================
// AUDIT LOG MODEL
// Safe mock/fallback as the audit_logs table is not part of the manufacturing schema.
// ============================================

exports.create = async (logData) => {
    console.log("[AuditLog]:", JSON.stringify(logData));
    return true;
};
