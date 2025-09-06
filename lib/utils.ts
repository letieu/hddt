import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function endOfMonth(date: Date) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const result = new Date(y, m + 1, 0);
  return result.setHours(23, 59, 59, 999);
}

export function startOfDay(date: Date) {
  return new Date(date).setHours(0, 0, 0, 0);
}

export function endOfDay(date: Date) {
  return new Date(date).setHours(23, 59, 59, 999);
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
