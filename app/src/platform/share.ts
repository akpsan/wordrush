/** Share a line of text with a link: the system share sheet where there is one, else the clipboard. */
export type ShareOutcome = 'shared' | 'copied' | 'failed';

export async function shareText(text: string, url: string): Promise<ShareOutcome> {
  if (typeof navigator.share === 'function' && matchMedia('(pointer: coarse)').matches) {
    try {
      await navigator.share({ text, url });
      return 'shared';
    } catch (e) {
      // Closing the share sheet isn't a failure worth reporting.
      if (e instanceof DOMException && e.name === 'AbortError') return 'shared';
    }
  }
  try {
    await navigator.clipboard.writeText(`${text}\n${url}`);
    return 'copied';
  } catch {
    return 'failed';
  }
}
