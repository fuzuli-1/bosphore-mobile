import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppUtil {

  // Generates a UUID v4 compatible with crypto.randomUUID()
static generateUUID(): string {
  // Use native method if available
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  // Fallback implementation using crypto.getRandomValues()
  // Based on https://stackoverflow.com/a/2117523
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (crypto.getRandomValues(new Uint32Array(1))[0] * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
}
