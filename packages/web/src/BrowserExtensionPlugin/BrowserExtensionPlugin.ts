import type { TolgeePlugin } from '@tolgee/core';
import { ObserverOptions } from '../types';
import { Handshaker } from '../tools/extension';
import { loadInContextLib } from './loadInContextLib';

export const API_KEY_LOCAL_STORAGE = '__tolgee_apiKey';
export const API_URL_LOCAL_STORAGE = '__tolgee_apiUrl';

function getCredentials() {
  const apiKey = sessionStorage.getItem(API_KEY_LOCAL_STORAGE) || undefined;
  const apiUrl = sessionStorage.getItem(API_URL_LOCAL_STORAGE) || undefined;

  if (!apiKey || !apiUrl) {
    return undefined;
  }

  return {
    apiKey,
    apiUrl,
  };
}

function clearSessionStorage() {
  sessionStorage.removeItem(API_KEY_LOCAL_STORAGE);
  sessionStorage.removeItem(API_URL_LOCAL_STORAGE);
}

function onDocumentReady(callback: () => void) {
  // in case the document is already rendered
  if (document.readyState !== 'loading') {
    Promise.resolve().then(() => {
      callback();
    });
  }
  // modern browsers
  else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callback);
  }
}

export type BrowserExtensionProps = {
  noReload?: boolean;
};

let BrowserExtensionPlugin: (
  options?: Partial<ObserverOptions>
) => TolgeePlugin = () => (tolgee) => tolgee;

if (typeof window !== 'undefined') {
  BrowserExtensionPlugin =
    (options?: Partial<ObserverOptions>): TolgeePlugin =>
    (tolgee) => {
      const handshaker = Handshaker();
      const getConfig = () =>
        ({
          // prevent extension downloading ui library
          uiPresent: true,
          uiVersion: undefined,
          // tolgee mode
          mode: tolgee.isDev() ? 'development' : 'production',
          // pass credentials
          config: {
            apiUrl: tolgee.getInitialOptions().apiUrl || '',
            apiKey: tolgee.getInitialOptions().apiKey || '',
          },
        } as const);

      const getTolgeePlugin = async (): Promise<TolgeePlugin> => {
        const InContextTools = await loadInContextLib(
          process.env.TOLGEE_UI_VERSION || 'rc'
        );
        return (tolgee) => {
          const credentials = getCredentials()!;
          tolgee.use(InContextTools({ credentials, ...options }));
          return tolgee;
        };
      };

      tolgee.on('running', ({ value: isRunning }) => {
        if (isRunning) {
          onDocumentReady(() => {
            handshaker.update(getConfig()).catch(clearSessionStorage);
          });
        }
      });

      const credentials = getCredentials();
      if (credentials) {
        getTolgeePlugin()
          .then((plugin) => {
            tolgee.use(plugin);
          })
          .catch(() => {
            // eslint-disable-next-line no-console
            console.error('Tolgee: Failed to load in-context tools');
          });
      }

      return tolgee;
    };
}

export { BrowserExtensionPlugin };
