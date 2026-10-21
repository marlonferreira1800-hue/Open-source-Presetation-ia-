import { MoodTheme } from "@/types/presentation";

export const MOODS: MoodTheme[] = [
  {
    id: "corporate-midnight",
    name: "Corporate Midnight",
    category: "dark",
    colors: {
      bg: "#0B0F19",
      surface: "rgba(30, 41, 59, 0.7)",
      surfaceBorder: "rgba(255, 255, 255, 0.1)",
      primary: "#38BDF8",
      secondary: "#818CF8",
      accent: "#F472B6",
      textPrimary: "#F8FAFC",
      textSecondary: "#CBD5E1",
      textMuted: "#64748B"
    },
    fonts: {
      heading: "system-ui, -apple-system, sans-serif",
      body: "system-ui, -apple-system, sans-serif"
    }
  },
  {
    id: "minimal-clean",
    name: "Minimalist Clean",
    category: "light",
    colors: {
      bg: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceBorder: "#E2E8F0",
      primary: "#0F172A",
      secondary: "#2563EB",
      accent: "#059669",
      textPrimary: "#0F172A",
      textSecondary: "#334155",
      textMuted: "#64748B"
    },
    fonts: {
      heading: "Georgia, serif",
      body: "system-ui, -apple-system, sans-serif"
    }
  },
  {
    id: "nvidia-emerald",
    name: "NVIDIA Cyber Green",
    category: "dark",
    colors: {
      bg: "#050B05",
      surface: "rgba(10, 25, 12, 0.75)",
      surfaceBorder: "rgba(118, 185, 0, 0.25)",
      primary: "#76B900", // NVIDIA signature green
      secondary: "#A3E635",
      accent: "#38BDF8",
      textPrimary: "#FFFFFF",
      textSecondary: "#D1D5DB",
      textMuted: "#6B7280"
    },
    fonts: {
      heading: "system-ui, -apple-system, sans-serif",
      body: "system-ui, -apple-system, sans-serif"
    }
  },
  {
    id: "sunset-terracotta",
    name: "Sunset Warmth",
    category: "vibrant",
    colors: {
      bg: "#1C1917",
      surface: "rgba(41, 37, 36, 0.8)",
      surfaceBorder: "rgba(249, 115, 22, 0.2)",
      primary: "#F97316",
      secondary: "#FB923C",
      accent: "#FBBF24",
      textPrimary: "#FAFAF9",
      textSecondary: "#E7E5E4",
      textMuted: "#A8A29E"
    },
    fonts: {
      heading: "system-ui, -apple-system, sans-serif",
      body: "system-ui, -apple-system, sans-serif"
    }
  },
  {
    id: "executive-fintech",
    name: "Fintech Blue",
    category: "corporate",
    colors: {
      bg: "#0A192F",
      surface: "rgba(17, 34, 64, 0.85)",
      surfaceBorder: "rgba(100, 255, 218, 0.15)",
      primary: "#64FFDA",
      secondary: "#0070F3",
      accent: "#A78BFA",
      textPrimary: "#CCD6F6",
      textSecondary: "#8892B0",
      textMuted: "#495670"
    },
    fonts: {
      heading: "system-ui, -apple-system, sans-serif",
      body: "system-ui, -apple-system, sans-serif"
    }
  }
];

export function getMoodById(id: string): MoodTheme {
  return MOODS.find((m) => m.id === id) || MOODS[0];
}
