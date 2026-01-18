/**
 * Design Tokens for VocabQuest Dark Teal Theme
 * Based on Google Stitch visual design
 */

export const colors = {
    dark: {
        bg: {
            primary: '#0f2830',
            secondary: '#1a3e4f',
            card: '#1e4555',
            elevated: '#244555',
        },
        accent: {
            teal: '#1a9ba8',
            gold: '#f4c542',
            green: '#2dd4bf',
            red: '#ef4444',
        },
        text: {
            primary: '#ffffff',
            secondary: '#94a3b8',
            muted: '#64748b',
        },
        border: {
            subtle: 'rgba(255, 255, 255, 0.1)',
            emphasis: 'rgba(26, 155, 168, 0.3)',
        },
    },
} as const;

export const shadows = {
    card: '0 4px 6px rgba(0, 0, 0, 0.3)',
    glow: '0 0 20px rgba(26, 155, 168, 0.3)',
    goldGlow: '0 0 15px rgba(244, 197, 66, 0.5)',
} as const;

export const radius = {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    full: '9999px',
} as const;

export const spacing = {
    xs: '4px',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    xxl: '32px',
} as const;

export const typography = {
    fontFamily: {
        primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica", "Arial", sans-serif',
    },
    fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
    },
    fontWeight: {
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },
} as const;

export const zIndex = {
    base: 0,
    dropdown: 10,
    sticky: 20,
    fixed: 30,
    modalBackdrop: 40,
    modal: 50,
    popover: 60,
    toast: 70,
} as const;

// Utility function to get CSS variable value
export function getCSSVar(variable: string): string {
    return `var(--${variable})`;
}

// Type-safe color access
export type ColorToken = keyof typeof colors.dark;
export type AccentColor = keyof typeof colors.dark.accent;
