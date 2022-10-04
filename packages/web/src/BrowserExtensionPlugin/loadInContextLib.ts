import type { InContextTools } from '../InContextTools';
import {
  IN_CONTEXT_FILE,
  IN_CONTEXT_UMD_NAME,
  IN_CONTEXT_EXPORT_NAME,
} from './constants';

function injectScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.addEventListener('load', () => resolve());
    script.addEventListener('error', (e) => reject(e.error));
    document.body.appendChild(script);
  });
}

let injectPromise = null as any as Promise<typeof InContextTools>;

export function loadInContextLib(version?: string) {
  if (!injectPromise) {
    injectPromise = injectScript(
      `https://unpkg.com/@tolgee/web@${
        version || 'latest'
      }/dist/${IN_CONTEXT_FILE}`
    ).then(() => {
      // @ts-ignore
      return window[IN_CONTEXT_UMD_NAME][IN_CONTEXT_EXPORT_NAME];
    });
  }
  return injectPromise;
}
