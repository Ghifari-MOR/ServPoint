// Responsive utility functions
export const getResponsiveValues = () => {
  const width = window.innerWidth
  const isMobile = width <= 768
  const isSmallMobile = width <= 480
  const isTablet = width > 768 && width <= 1024
  
  return {
    isMobile,
    isSmallMobile,
    isTablet,
    isDesktop: width > 1024,
    
    // Spacing
    spacing: {
      xs: isSmallMobile ? 4 : 6,
      sm: isSmallMobile ? 8 : 12,
      md: isSmallMobile ? 12 : isMobile ? 16 : 20,
      lg: isSmallMobile ? 16 : isMobile ? 20 : 24,
      xl: isSmallMobile ? 20 : isMobile ? 28 : 32,
      xxl: isSmallMobile ? 32 : isMobile ? 40 : 48
    },
    
    // Font sizes
    fontSize: {
      xs: isSmallMobile ? 11 : 12,
      sm: isSmallMobile ? 13 : 14,
      base: isSmallMobile ? 14 : 15,
      md: isSmallMobile ? 15 : 16,
      lg: isSmallMobile ? 18 : isMobile ? 20 : 22,
      xl: isSmallMobile ? 22 : isMobile ? 24 : 28,
      xxl: isSmallMobile ? 26 : isMobile ? 30 : 36
    },
    
    // Paddings
    padding: {
      card: isSmallMobile ? '32px 20px' : isMobile ? '40px 28px' : '48px 40px',
      container: isMobile ? '16px' : '24px',
      input: isMobile ? '11px 14px' : '12px 16px',
      button: isMobile ? '12px' : '14px'
    },
    
    // Border radius
    borderRadius: {
      sm: isMobile ? 8 : 10,
      md: isMobile ? 10 : 12,
      lg: isMobile ? 16 : 20
    },
    
    // Icon sizes
    iconSize: {
      sm: isMobile ? 14 : 16,
      md: isMobile ? 16 : 18,
      lg: isMobile ? 20 : 24,
      xl: isMobile ? 32 : 40
    }
  }
}
