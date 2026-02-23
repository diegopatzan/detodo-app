import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | object | null | undefined) {
  if (amount === null || amount === undefined) return 'Q 0.00';
  
  // Handle Prisma Decimal
  const value = typeof amount === 'object' && 'toNumber' in amount 
    ? (amount as { toNumber: () => number }).toNumber() 
    : Number(amount);

  if (isNaN(value)) return 'Q 0.00';

  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
  }).format(value);
}
