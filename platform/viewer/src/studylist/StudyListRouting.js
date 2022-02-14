import OHIF from '@ohif/core';
import PropTypes from 'prop-types';
import React, { useContext } from 'react';
import { withRouter } from 'react-router-dom';
// Contexts
import AppContext from '../context/AppContext';
import useServer from '../customHooks/useServer';
import ConnectedStudyList from './ConnectedStudyList';

const { urlUtil: UrlUtil } = OHIF.utils;

function StudyListRouting({ match: routeMatch, location: routeLocation }) {
  const {
    project,
    location,
    dataset,
    dicomStore,
    studyInstanceUIDs,
    seriesInstanceUIDs,
  } = routeMatch.params;
  const server = useServer({ project, location, dataset, dicomStore });
  const { appConfig = {} } = useContext(AppContext);

  const filters = UrlUtil.queryString.getQueryFilters(routeLocation);

  let studyListFunctionsEnabled = true;
  if (appConfig.studyListFunctionsEnabled) {
    studyListFunctionsEnabled = appConfig.studyListFunctionsEnabled;
  }
  return (
    <ConnectedStudyList
      filters={filters}
      studyListFunctionsEnabled={studyListFunctionsEnabled}
    />
  );
}

StudyListRouting.propTypes = {
  location: PropTypes.shape({
    search: PropTypes.string,
  }).isRequired,
};

export default withRouter(StudyListRouting);
