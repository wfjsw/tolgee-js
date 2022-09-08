import { EventService } from './EventService/EventService';
import { StateService } from './StateService/StateService';
import {
  BackendDevPlugin,
  BackendPlugin,
  FinalFormatterPlugin,
  FormatterPlugin,
  ObserverPlugin,
  Options,
  TolgeeInstance,
  TolgeePlugin,
  TranslateProps,
  UiLibInterface,
} from './types';

export const Tolgee = (options?: Partial<Options>): TolgeeInstance => {
  const eventService = EventService();
  const stateService = StateService({
    eventService,
    options,
  });

  const tolgee: TolgeeInstance = Object.freeze({
    // event listeners
    on: eventService.on,
    onKeyUpdate: eventService.onKeyUpdate.listenSome,

    setFinalFormatter: (formatter: FinalFormatterPlugin | undefined) => {
      stateService.setFinalFormatter(formatter);
      return tolgee;
    },
    addFormatter: (formatter: FormatterPlugin | undefined) => {
      stateService.addFormatter(formatter);
      return tolgee;
    },
    setObserver: (observer: ObserverPlugin | undefined) => {
      stateService.setObserver(observer);
      return tolgee;
    },
    setUi: (ui: UiLibInterface | undefined) => {
      stateService.setUi(ui);
      return tolgee;
    },
    setDevBackend: (backend: BackendDevPlugin | undefined) => {
      stateService.setDevBackend(backend);
      return tolgee;
    },
    addBackend: (backend: BackendPlugin | undefined) => {
      stateService.addBackend(backend);
      return tolgee;
    },
    use: (plugin: TolgeePlugin | undefined) => {
      plugin?.(tolgee);
      return tolgee;
    },

    // state
    getLanguage: stateService.getLanguage,
    getPendingLanguage: stateService.getPendingLanguage,
    changeLanguage: stateService.changeLanguage,
    changeTranslation: stateService.changeTranslation,
    addActiveNs: stateService.addActiveNs,
    removeActiveNs: stateService.removeActiveNs,
    loadRecord: stateService.loadRecord,
    isLoaded: stateService.isLoaded,
    isInitialLoading: stateService.isInitialLoading,
    isLoading: stateService.isLoading,
    isFetching: stateService.isFetching,
    isRunning: stateService.isRunning,
    init: (options: Partial<Options>) => {
      stateService.init(options);
      return tolgee;
    },

    // other
    run: () => {
      stateService.run();
      return stateService.loadInitial();
    },
    stop: () => {
      stateService.stop();
    },
    t: (props: TranslateProps) => {
      return stateService.t(props);
    },
  });
  return tolgee;
};
