// External
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Provider } from 'react-redux';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { hot } from 'react-hot-loader/root';

import OHIFCornerstoneExtension from '@ohif/extension-cornerstone';
import i18n from '@ohif/i18n';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router-dom';
import Compose from './routes/Mode/Compose';


import {
  DialogProvider,
  Modal,
  ModalProvider,
  SnackbarProvider,
  ThemeWrapper,
  ViewportDialogProvider,
  ViewportGridProvider,
  CineProvider,
  UserAuthenticationProvider,
} from '@ohif/ui';


import {
  CommandsManager,
  ExtensionManager,
  ServicesManager,
  HotkeysManager,
  UINotificationService,
  UIModalService,
  UIDialogService,
  LoggerService,
  MeasurementService,
  utils,
  redux as reduxOHIF,
} from '@ohif/core';

import i18n from '@ohif/i18n';

// TODO: This should not be here
//import './config';
import { setConfiguration } from './config';

/** Utils */
import {
  getUserManagerForOpenIdConnectClient,
  initWebWorkers,
} from './utils/index.js';

/** Extensions */
import { GenericViewerCommands, MeasurementsPanel } from './appExtensions';

/** Viewer */
import OHIFStandaloneViewer from './OHIFStandaloneViewer';
import Login from './Login';

/** Store */
import { getActiveContexts } from './store/layout/selectors.js';
import store from './store';

/** Contexts */
import WhiteLabelingContext from './context/WhiteLabelingContext';
import UserManagerContext from './context/UserManagerContext';
import { AppProvider, useAppContext, CONTEXTS } from './context/AppContext';

/** ~~~~~~~~~~~~~ Application Setup */
const commandsManagerConfig = {
  getAppState: () => store.getState(),
  getActiveContexts: () => getActiveContexts(store.getState()),
};

/** Managers */
const commandsManager = new CommandsManager(commandsManagerConfig);
const servicesManager = new ServicesManager();
const hotkeysManager = new HotkeysManager(commandsManager, servicesManager);
let extensionManager;
/** ~~~~~~~~~~~~~ End Application Setup */

// TODO[react] Use a provider when the whole tree is React
window.store = store;

window.ohif = window.ohif || {};
window.ohif.app = {
  commandsManager,
  hotkeysManager,
  servicesManager,
  extensionManager,
};

class App extends Component {
  static propTypes = {
    config: PropTypes.oneOfType([
      PropTypes.func,
      PropTypes.shape({
        routerBasename: PropTypes.string.isRequired,
        oidc: PropTypes.array,
        whiteLabeling: PropTypes.shape({
          createLogoComponentFn: PropTypes.func,
        }),
        extensions: PropTypes.array,
      }),
    ]).isRequired,
    defaultExtensions: PropTypes.array,
  };

  static defaultProps = {
    config: {
      showStudyList: true,
      oidc: [],
      extensions: [],
    },
    defaultExtensions: [],
  };

  _appConfig;
  _userManager;

  constructor(props) {
    super(props);

    const { config, defaultExtensions } = props;

    const appDefaultConfig = {
      showStudyList: true,
      cornerstoneExtensionConfig: {
        hideHandles: true,
        tools: {
          ArrowAnnotate: {
            configuration: {
              getTextCallback: (callback, eventDetails) =>
                callback(prompt('Enter your custom annotation')),
            },
          },
        },
      },
      extensions: [],
      routerBasename: '/',
    };

    this._appConfig = {
      ...appDefaultConfig,
      ...(typeof config === 'function' ? config({ servicesManager }) : config),
    };

    const {
      servers,
      hotkeys: appConfigHotkeys,
      cornerstoneExtensionConfig,
      extensions,
      oidc,
    } = this._appConfig;

    setConfiguration(this._appConfig);

    this.initUserManager(oidc);
    _initServices([
      UINotificationService,
      UIModalService,
      UIDialogService,
      MeasurementService,
      LoggerService,
    ]);
    _initExtensions(
      [...defaultExtensions, ...extensions],
      cornerstoneExtensionConfig,
      this._appConfig
    );

    /*
     * Must run after extension commands are registered
     * if there is no hotkeys from localStorage set up from config.
     */
    _initHotkeys(appConfigHotkeys);
    _initServers(servers);
    initWebWorkers();
  }

  render() {
    const { whiteLabeling, routerBasename } = this._appConfig;
    const {
      UINotificationService,
      UIDialogService,
      UIModalService,
      MeasurementService,
      LoggerService,
    } = servicesManager.services;
    console.log('Login')
    console.log(<Login></Login>)
    if (this._userManager) {
      return (
        <ErrorBoundary context="App">
          <Provider store={store}>
            <AppProvider config={this._appConfig}>
              <I18nextProvider i18n={i18n}>
                <OidcProvider store={store} userManager={this._userManager}>
                  <UserManagerContext.Provider value={this._userManager}>
                    <Router basename={routerBasename}>
                      <WhiteLabelingContext.Provider value={whiteLabeling}>
                        <LoggerProvider service={LoggerService}>
                          <SnackbarProvider service={UINotificationService}>
                            <DialogProvider service={UIDialogService}>
                              <ModalProvider
                                modal={OHIFModal}
                                service={UIModalService}
                              >
                                <Switch>
                                  <Route exact path="/login" component={<Login />} />
                                  <Route path="/" component={<OHIFStandaloneViewer userManager={this._userManager}/>} />
                                </Switch>
                              </ModalProvider>
                            </DialogProvider>
                          </SnackbarProvider>
                        </LoggerProvider>
                      </WhiteLabelingContext.Provider>
                    </Router>
                  </UserManagerContext.Provider>
                </OidcProvider>
              </I18nextProvider>
            </AppProvider>
          </Provider>
        </ErrorBoundary>
      );
    }

    return (
      <ErrorBoundary context="App">
        <Provider store={store}>
          <AppProvider config={this._appConfig}>
            <I18nextProvider i18n={i18n}>
              <Router basename={routerBasename}>
                <WhiteLabelingContext.Provider value={whiteLabeling}>
                  <LoggerProvider service={LoggerService}>
                    <SnackbarProvider service={UINotificationService}>
                      <DialogProvider service={UIDialogService}>
                        <ModalProvider
                          modal={OHIFModal}
                          service={UIModalService}
                        >
                          <Switch>
                            <Route exact path="/login" component={Login} />
                            <Route path="/" component={OHIFStandaloneViewer} />
                          </Switch>
                        </ModalProvider>
                      </DialogProvider>
                    </SnackbarProvider>
                  </LoggerProvider>
                </WhiteLabelingContext.Provider>
              </Router>
            </I18nextProvider>
          </AppProvider>
        </Provider>
      </ErrorBoundary>
    );

// Viewer Project
// TODO: Should this influence study list?
import { AppConfigProvider } from '@state';
import createRoutes from './routes';
import appInit from './appInit.js';
import OpenIdConnectRoutes from './utils/OpenIdConnectRoutes';

let commandsManager, extensionManager, servicesManager, hotkeysManager;

function App({ config, defaultExtensions, defaultModes }) {
  const [init, setInit] = useState(null);
  useEffect(() => {
    const run = async () => {
      appInit(config, defaultExtensions, defaultModes)
        .then(setInit)
        .catch(console.error);
    };

    run();
  }, []);

  if (!init) {
    return null;

  }

  // Set above for named export
  commandsManager = init.commandsManager;
  extensionManager = init.extensionManager;
  servicesManager = init.servicesManager;
  hotkeysManager = init.hotkeysManager;

  // Set appConfig
  const appConfigState = init.appConfig;
  const {
    routerBasename,
    modes,
    dataSources,
    oidc,
    showStudyList,
  } = appConfigState;

  const {
    UIDialogService,
    UIModalService,
    UINotificationService,
    UIViewportDialogService,
    ViewportGridService,
    CineService,
    UserAuthenticationService,
    customizationService,
  } = servicesManager.services;

  const providers = [
    [AppConfigProvider, { value: appConfigState }],
    [UserAuthenticationProvider, { service: UserAuthenticationService }],
    [I18nextProvider, { i18n }],
    [ThemeWrapper],
    [ViewportGridProvider, { service: ViewportGridService }],
    [ViewportDialogProvider, { service: UIViewportDialogService }],
    [CineProvider, { service: CineService }],
    [SnackbarProvider, { service: UINotificationService }],
    [DialogProvider, { service: UIDialogService }],
    [ModalProvider, { service: UIModalService, modal: Modal }],
  ];
  const CombinedProviders = ({ children }) =>
    Compose({ components: providers, children });

  let authRoutes = null;

  // Should there be a generic call to init on the extension manager?
  customizationService.init(extensionManager);

  // Use config to create routes
  const appRoutes = createRoutes({
    modes,
    dataSources,
    extensionManager,
    servicesManager,
    commandsManager,
    hotkeysManager,
    routerBasename,
    showStudyList,
  });

  if (oidc) {
    authRoutes = (
      <OpenIdConnectRoutes
        oidc={oidc}
        routerBasename={routerBasename}
        UserAuthenticationService={UserAuthenticationService}
      />
    );
  }

  return (
    <CombinedProviders>
      <BrowserRouter basename={routerBasename}>
        {authRoutes}
        {appRoutes}
      </BrowserRouter>
    </CombinedProviders>
  );
}

App.propTypes = {
  config: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({
      routerBasename: PropTypes.string.isRequired,
      oidc: PropTypes.array,
      whiteLabeling: PropTypes.object,
      extensions: PropTypes.array,
    }),
  ]).isRequired,
  /* Extensions that are "bundled" or "baked-in" to the application.
   * These would be provided at build time as part of they entry point. */
  defaultExtensions: PropTypes.array,
};

App.defaultProps = {
  config: {
    /**
     * Relative route from domain root that OHIF instance is installed at.
     * For example:
     *
     * Hosted at: https://ohif.org/where-i-host-the/viewer/
     * Value: `/where-i-host-the/viewer/`
     * */
    routerBaseName: '/',
    /**
     *
     */
    showLoadingIndicator: true,
    showStudyList: true,
    oidc: [],
    extensions: [],
  },
  defaultExtensions: [],
};

export default App;

export { commandsManager, extensionManager, servicesManager };
