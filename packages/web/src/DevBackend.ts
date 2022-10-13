import { BackendDevInterface, TolgeePlugin } from '@tolgee/core';
import { getApiKeyType, getProjectIdFromApiKey } from './tools/decodeApiKey';

const DevBackendCreator = (): BackendDevInterface => ({
  getRecord({ apiUrl, apiKey, language, namespace, projectId }) {
    if (namespace) {
      return undefined;
    }
    const pId = getProjectIdFromApiKey(apiKey) ?? projectId;
    const url =
      pId !== undefined
        ? `${apiUrl}/v2/projects/${pId}/translations/${language}`
        : `${apiUrl}/v2/projects/translations/${language}`;

    if (getApiKeyType(apiKey) === 'tgpat' && projectId === undefined) {
      throw new Error("You need to specify 'projectId' when using PAT key");
    }
    return fetch(url, {
      headers: {
        'X-API-Key': apiKey || '',
        'Content-Type': 'application/json',
      },
    }).then((r) => {
      if (r.ok) {
        return r.json().then((data) => data[language]);
      } else {
        throw new Error(r.statusText);
      }
    });
  },
});

export const DevBackend = (): TolgeePlugin => (tolgee, tools) => {
  tools.setDevBackend(DevBackendCreator());
  return tolgee;
};
