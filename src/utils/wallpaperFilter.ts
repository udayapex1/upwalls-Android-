/**
 * Filter wallpapers to only include mobile-appropriate ones
 * Mobile wallpapers are typically portrait orientation (height > width)
 * This filter uses category and other metadata to determine if a wallpaper is mobile-appropriate
 */
export const filterMobileWallpapers = (wallpapers: any[]): any[] => {
  return wallpapers.filter((wallpaper: any) => {
    // Check category for mobile indicators
    const category = (wallpaper.category || '').toLowerCase();
    const title = (wallpaper.title || '').toLowerCase();
    
    // Exclude if explicitly desktop/landscape/wide
    if (
      category.includes('desktop') || 
      category.includes('landscape') ||
      category.includes('wide') ||
      category.includes('horizontal') ||
      title.includes('desktop') ||
      title.includes('landscape') ||
      title.includes('wide')
    ) {
      console.log(`Excluding wallpaper (desktop/landscape): ${wallpaper.title || wallpaper._id}`);
      return false;
    }
    
    // Include if category/title explicitly suggests mobile
    if (
      category.includes('mobile') || 
      category.includes('phone') || 
      category.includes('portrait') ||
      category.includes('vertical') ||
      title.includes('mobile') ||
      title.includes('phone') ||
      title.includes('portrait')
    ) {
      return true;
    }
    
    // By default, include all wallpapers (assume they're mobile-friendly)
    // Most wallpapers in a mobile app are likely mobile-appropriate
    return true;
  });
};

