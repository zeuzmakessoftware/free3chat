import { v4 as uuidv4 } from 'uuid';

// Function to get or create an anonymous ID
export function getAnonymousId(): string {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return '';
  }
  
  // Try to get the anonymous ID from localStorage
  let anonymousId = localStorage.getItem('anonymousId');
  
  // If it doesn't exist, create a new one and store it
  if (!anonymousId) {
    anonymousId = uuidv4();
    localStorage.setItem('anonymousId', anonymousId);
  }
  
  return anonymousId;
}
