
/**
 * Utility functions for authentication flows
 */

// Define consistent storage keys
export const CODE_VERIFIER_KEY = 'palm_reader.auth.code_verifier';
export const LAST_USED_VERIFIER_KEY = 'palm_reader.auth.last_used_verifier';
export const SUPABASE_CODE_VERIFIER_KEY = 'supabase.auth.code_verifier';

/**
 * Generates a secure random string for PKCE
 */
export const generateSecureString = (length: number): string => {
  const array = new Uint8Array(length);
  window.crypto.getRandomValues(array);
  return Array.from(array, byte => 
    ('0' + (byte & 0xFF).toString(16)).slice(-2)
  ).join('');
};

/**
 * Generates a code verifier (64 bytes = 128 hex chars) for PKCE flow
 */
export const generateCodeVerifier = (): string => {
  return generateSecureString(64);
};

/**
 * Stores a code verifier in all possible storage locations for maximum compatibility
 */
export const storeCodeVerifier = (codeVerifier: string): void => {
  localStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);
  localStorage.setItem(SUPABASE_CODE_VERIFIER_KEY, codeVerifier);
  localStorage.setItem(LAST_USED_VERIFIER_KEY, codeVerifier);
  
  console.log("Stored code verifier:", codeVerifier.substring(0, 10) + "...");
  console.log("Verifier length:", codeVerifier.length);
};

/**
 * Generates and stores a fresh code verifier
 */
export const generateAndStoreCodeVerifier = (): string | null => {
  try {
    const codeVerifier = generateCodeVerifier();
    storeCodeVerifier(codeVerifier);
    return codeVerifier;
  } catch (error) {
    console.error("Error generating code verifier:", error);
    return null;
  }
};

/**
 * Generates a code challenge from a code verifier
 */
export const generateCodeChallenge = async (codeVerifier: string): Promise<string> => {
  // Calculate the code challenge (SHA-256 hash of the code verifier)
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', encodedData);
  
  // Convert the digest to a base64url string
  const base64Digest = btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return base64Digest;
};

/**
 * Stores password reset information for debugging and recovery
 */
export const storePasswordResetInfo = (
  email: string, 
  codeVerifier: string, 
  redirectUrl: string, 
  codeChallenge: string
): void => {
  localStorage.setItem('passwordResetEmail', email);
  
  localStorage.setItem('passwordResetInfo', JSON.stringify({
    email,
    timestamp: new Date().toISOString(),
    verifier: codeVerifier.substring(0, 10) + "...",
    verifierLength: codeVerifier.length,
    fullVerifier: codeVerifier,
    redirectUrl,
    challengePreview: codeChallenge.substring(0, 10) + "..."
  }));
};

/**
 * Mark password reset as requested for later verification
 */
export const markPasswordResetRequested = (): void => {
  localStorage.setItem('passwordResetRequested', 'true');
  localStorage.setItem('passwordResetTimestamp', new Date().toISOString());
};
