export function getExpiryDate() {
  const retentionPeriod = process.env.RETENTION_PERIOD_DAYS ?? 30;
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() - retentionPeriod);
  return expiryDate;
}
