/**
 * Material 3 Breakpoints
 * 
 * These constants define the standard Material 3 screen size breakpoints.
 * They are used to ensure consistent responsive behavior across components,
 * especially in scenarios where CSS variables might not be suitable (e.g., media queries).
 */

export const M3Breakpoints = {
    /** Compact: < 600px */
    COMPACT: '600px',
    
    /** Medium: 600px - 839px (Phone in landscape, Tablet portrait) */
    MEDIUM: '600px',
    
    /** Expanded: 840px - 1199px (Tablet landscape, Desktop) */
    EXPANDED: '840px',
    
    /** Large: 1200px - 1599px (Desktop) */
    LARGE: '1200px',
    
    /** Extra-large: 1600px+ (Ultra-wide) */
    EXTRA_LARGE: '1600px'
};
