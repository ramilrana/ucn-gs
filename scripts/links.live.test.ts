// @vitest-environment node
// Live check of every published remote link. Run with `npm run check:links`; excluded from `npm test`.
import { describe, expect, it } from 'vitest';
import * as content from '../src/content/index';
import { classifyResponse, collectLinkTargets, formatLinkReport, type CheckedLink, type LinkTarget } from '../src/lib/linkTargets';

const TIMEOUT_MS = 15_000;
const CONCURRENCY = 6;

async function check(target: LinkTarget): Promise<CheckedLink> {
  try {
    const response = await fetch(target.url, {
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { 'user-agent': 'Mozilla/5.0 (compatible; ucn-gs-link-check)' },
    });
    // Only the status line matters; do not download the body.
    await response.body?.cancel();
    return { ...target, status: response.status, result: classifyResponse(response.status, response.headers.get('location')) };
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    return { ...target, status: 0, result: 'broken', detail };
  }
}

async function checkAll(targets: readonly LinkTarget[]): Promise<CheckedLink[]> {
  const results: CheckedLink[] = new Array<CheckedLink>(targets.length);
  let next = 0;
  const worker = async () => {
    for (let i = next++; i < targets.length; i = next++) {
      const target = targets[i];
      if (target) results[i] = await check(target);
    }
  };
  await Promise.all(Array.from({ length: Math.min(CONCURRENCY, targets.length) }, worker));
  return results;
}

describe('published links are reachable and public', () => {
  it('every published Drive, YouTube and external link responds', async () => {
    const targets = collectLinkTargets(content);
    const results = await checkAll(targets);
    const count = (r: CheckedLink['result']) => results.filter((x) => x.result === r).length;
    process.stdout.write(
      `\ncheck:links ${targets.length} targets: ${count('ok')} ok, ${count('redirect')} redirect, ` +
        `${count('not-public')} not-public, ${count('broken')} broken\n`,
    );

    const redirects = results.filter((x) => x.result === 'redirect');
    if (redirects.length > 0) process.stdout.write(`Redirects (not failures):\n${formatLinkReport(redirects)}\n`);

    const failures = results.filter((x) => x.result === 'not-public' || x.result === 'broken');
    expect(failures.length, `\n${formatLinkReport(failures)}\n`).toBe(0);
  });
});
