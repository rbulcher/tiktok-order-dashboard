import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
	return twMerge(clsx(inputs));
}

export function normalizeComponentName(name) {
	// Remove plurals and convert to lowercase for consistent matching
	return name.toLowerCase().replace(/s$/, "");
}
