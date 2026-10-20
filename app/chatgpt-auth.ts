import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export type ChatGPTUser = {
  userId: string;
  email: string;
  fullName: string | null;
};

const SIGN_IN_PATH = '/signin-with-chatgpt';
const SIGN_OUT_PATH = '/signout-with-chatgpt';
const RESERVED_AUTH_PATHS = new Set([SIGN_IN_PATH, SIGN_OUT_PATH, '/callback']);

export async function getChatGPTUser(): Promise<ChatGPTUser | null> {
  const requestHeaders = await headers();
  const userId = requestHeaders.get('oai-authenticated-user-id');
  const email = requestHeaders.get('oai-authenticated-user-email');
  if (!userId || !email) return null;

  const encodedFullName = requestHeaders.get('oai-authenticated-user-full-name');
  const isEncoded = requestHeaders.get('oai-authenticated-user-full-name-encoding') === 'percent-encoded-utf-8';
  let fullName: string | null = null;
  if (encodedFullName && isEncoded) {
    try { fullName = decodeURIComponent(encodedFullName); } catch { fullName = null; }
  }

  return { userId, email, fullName };
}

export async function requireApprovedChatGPTUser(returnTo: string): Promise<ChatGPTUser> {
  const user = await getChatGPTUser();
  if (!user) redirect(chatGPTSignInPath(returnTo));

  const allowedEmails = new Set(
    (process.env.ALLOWED_EMAILS ?? '').split(',').map(normalizeEmail).filter(Boolean),
  );
  if (process.env.NODE_ENV !== 'production') allowedEmails.add('seedy@sites.test');
  if (!allowedEmails.has(normalizeEmail(user.email))) redirect('/access-denied');

  return user;
}

export function chatGPTSignInPath(returnTo: string): string {
  return `${SIGN_IN_PATH}?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

export function chatGPTSignOutPath(returnTo = '/'): string {
  return `${SIGN_OUT_PATH}?return_to=${encodeURIComponent(safeReturnPath(returnTo))}`;
}

function safeReturnPath(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//')) return '/';
  try {
    const url = new URL(value, 'https://app.local');
    if (url.origin !== 'https://app.local' || RESERVED_AUTH_PATHS.has(url.pathname)) return '/';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '/';
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLocaleLowerCase('en-US');
}
