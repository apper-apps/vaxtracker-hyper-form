import { format, formatDistance, differenceInDays, isAfter, isBefore, parseISO } from 'date-fns';

export const formatDate = (date, formatStr = 'MM/dd/yyyy') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatDateTime = (date, formatStr = 'MM/dd/yyyy HH:mm') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, formatStr);
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
};

export const getDaysUntilExpiry = (expirationDate) => {
  if (!expirationDate) return 0;
  const expDate = typeof expirationDate === 'string' ? parseISO(expirationDate) : expirationDate;
  return differenceInDays(expDate, new Date());
};

export const isExpired = (expirationDate) => {
  if (!expirationDate) return false;
  const expDate = typeof expirationDate === 'string' ? parseISO(expirationDate) : expirationDate;
  return isBefore(expDate, new Date());
};

export const isExpiringSoon = (expirationDate, days = 30) => {
  if (!expirationDate) return false;
  const expDate = typeof expirationDate === 'string' ? parseISO(expirationDate) : expirationDate;
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + days);
  return isBefore(expDate, warningDate) && isAfter(expDate, new Date());
};

export const getExpirationStatus = (expirationDate) => {
  if (isExpired(expirationDate)) {
    return { status: 'expired', color: 'red', days: Math.abs(getDaysUntilExpiry(expirationDate)) };
  }
  
  if (isExpiringSoon(expirationDate)) {
    return { status: 'expiring', color: 'orange', days: getDaysUntilExpiry(expirationDate) };
  }
  
  return { status: 'valid', color: 'green', days: getDaysUntilExpiry(expirationDate) };
};