// Global UI Theme Colors
// Manages the yellow-themed UI colors to match the dashboard

export const THEME_YELLOW = '#FFD700'; // Gold / Bright Yellow
export const THEME_BLACK = '#000000';
export const DARK_BG = '#121212';
export const CARD_BG = '#1E1E1E';
export const TEXT_WHITE = '#FFFFFF';
export const TEXT_GREY = '#AAAAAA';

export default {
    primary: THEME_YELLOW,
    background: THEME_BLACK,
    darkBackground: DARK_BG,
    cardBackground: CARD_BG,
    text: TEXT_WHITE,
    subText: TEXT_GREY,
};

/**
 * What it does:
 * Defines the main color palette for the application in a centralized location.
 * 
 * Why it's used:
 * 1. To ensure visual consistency (Yellow theme) across the entire app.
 * 2. To allow for easy theme updates by changing colors in a single file.
 */
