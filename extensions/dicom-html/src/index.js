import React from 'react';
import { version } from '../package.json';
import OHIFDicomHtmlSopClassHandler from './OHIFDicomHtmlSopClassHandler.js';

const Component = React.lazy(() => {
  return import('./OHIFDicomHtmlViewport');
});

const OHIFDicomHtmlViewport = props => {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <Component {...props} />
    </React.Suspense>
  );
};

export default {
  /**
   * Only required property. Should be a unique value across all extensions.
   */
  id: 'html',
  version,

  getViewportModule() {
    //console.log('11');
    return OHIFDicomHtmlViewport;
  },
  getSopClassHandlerModule() {
    //console.log('12');
    return OHIFDicomHtmlSopClassHandler;
  },
};
