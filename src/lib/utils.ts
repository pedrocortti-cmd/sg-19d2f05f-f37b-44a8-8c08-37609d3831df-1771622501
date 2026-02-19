import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Formato de moneda paraguaya (Gs. con punto como separador de miles)
// Usa formato fijo para evitar errores de hidratación SSR
export function formatCurrency(amount: number): string {
  return `Gs. ${amount.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
}
