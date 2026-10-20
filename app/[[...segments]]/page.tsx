import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import pages from '../../content/legacy-pages.json';
import { chatGPTSignOutPath, requireApprovedChatGPTUser } from '../chatgpt-auth';

export const dynamic = 'force-dynamic';

type PageRecord = {
  title: string;
  description: string;
  bodyClass: string;
  styles: string[];
  headScripts: ScriptRecord[];
  bodySegments: Array<{ type: 'html'; value: string } | { type: 'script'; value: string }>;
};

type ScriptRecord = { src?: string; async?: boolean; defer?: boolean; value?: string };
const pageRegistry = pages as Record<string, PageRecord>;

function routePath(segments?: string[]): string {
  if (!segments?.length) return '/';
  const path = `/${segments.join('/')}`;
  return path.endsWith('.html') ? path : `${path}/`;
}

function pageForPath(path: string): PageRecord | undefined {
  return pageRegistry[path] ?? pageRegistry[path.replace(/\/$/, '') + '/'];
}

export async function generateMetadata({ params }: { params: Promise<{ segments?: string[] }> }): Promise<Metadata> {
  const { segments } = await params;
  const path = routePath(segments);
  if (['/signin-with-chatgpt', '/signout-with-chatgpt', '/callback'].includes(path)) notFound();
  await requireApprovedChatGPTUser(path);
  const page = pageForPath(path);
  if (!page) return { title: 'Page not found | Bay Area Professional Counseling' };
  return {
    title: page.title,
    description: page.description,
    robots: { index: false, follow: false },
  };
}

export default async function RedesignPage({ params }: { params: Promise<{ segments?: string[] }> }) {
  const { segments } = await params;
  const path = routePath(segments);
  if (['/signin-with-chatgpt', '/signout-with-chatgpt', '/callback'].includes(path)) notFound();

  await requireApprovedChatGPTUser(path);
  const page = pageForPath(path);
  if (!page) notFound();

  return (
    <>
      {page.styles.map((href) => <link key={href} rel="stylesheet" href={href} />)}
      {page.headScripts.map((script, index) => <ScriptElement key={`${script.src ?? 'inline'}-${index}`} script={script} />)}
      <nav className="chatgpt-account-controls" aria-label="ChatGPT account controls">
        <a href={chatGPTSignOutPath(path)} target="_top">Sign out</a>
      </nav>
      <div className={page.bodyClass || undefined}>
        {page.bodySegments.map((segment, index) => segment.type === 'script'
          ? <script key={`body-script-${index}`} dangerouslySetInnerHTML={{ __html: segment.value }} />
          : <div key={`html-${index}`} style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: segment.value }} />)}
      </div>
    </>
  );
}

function ScriptElement({ script }: { script: ScriptRecord }) {
  if (script.src) return <script src={script.src} async={script.async} defer={script.defer} />;
  return <script dangerouslySetInnerHTML={{ __html: script.value ?? '' }} />;
}
