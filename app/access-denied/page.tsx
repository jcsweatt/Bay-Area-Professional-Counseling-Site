import { chatGPTSignInPath, chatGPTSignOutPath } from '../chatgpt-auth';

export const dynamic = 'force-dynamic';

export default function AccessDeniedPage() {
  return (
    <main className="auth-page">
      <section className="auth-panel" aria-labelledby="access-denied-title">
        <p className="eyebrow">Private redesign preview</p>
        <h1 id="access-denied-title">This account isn’t on the access list.</h1>
        <p>
          These redesign pages are available to the approved account only. Sign
          out of ChatGPT, then choose the account that has access.
        </p>
        <nav className="auth-actions" aria-label="ChatGPT account actions">
          <a href={chatGPTSignOutPath('/')} target="_top">Sign out and choose another account</a>
          <a className="secondary" href={chatGPTSignInPath('/')} target="_top">Sign in with ChatGPT</a>
        </nav>
      </section>
    </main>
  );
}
