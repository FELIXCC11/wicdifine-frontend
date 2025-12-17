const GUEST_MESSAGE_KEY = 'wicfin-guest-messages';

export function getGuestMessageCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const count = localStorage.getItem(GUEST_MESSAGE_KEY);
  return count ? parseInt(count, 10) : 0;
}

export function incrementGuestMessageCount(): number {
  if (typeof window === 'undefined') return 0;
  
  const currentCount = getGuestMessageCount();
  const newCount = currentCount + 1;
  localStorage.setItem(GUEST_MESSAGE_KEY, newCount.toString());
  return newCount;
}

export function resetGuestMessageCount(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(GUEST_MESSAGE_KEY);
}