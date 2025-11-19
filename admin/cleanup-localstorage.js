/**
 * Cleanup Script - Remove old localStorage auth data
 * Run this in browser console to clean up old auth storage
 */

// Clear old auth storage
localStorage.removeItem('maya-auth-storage');
localStorage.removeItem('auth-storage');

console.log('✅ Old auth localStorage data cleared!');
console.log('🔄 Please refresh the page to use httpOnly cookies only.');