import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date input while typing (DD/MM/YYYY)
export function formatDateInput(date: string) {
  // Remove non-digits and format as DD/MM/YYYY
  const cleaned = date.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length <= 2) {
    return cleaned;
  } else if (cleaned.length <= 4) {
    return cleaned.replace(/(\d{2})(\d{0,2})/, "$1/$2");
  } else {
    return cleaned.replace(/(\d{2})(\d{2})(\d{0,4})/, "$1/$2/$3");
  }
}
