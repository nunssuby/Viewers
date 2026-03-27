import React from 'react';
import PropTypes from 'prop-types';
import { utils, user } from '@ohif/core';
import AppContext from '../context/AppContext';
//
import ConnectedViewerRetrieveStudyData from '../connectedComponents/ConnectedViewerRetrieveStudyData';
import useServer from '../customHooks/useServer';
import useQuery from '../customHooks/useQuery';
import { useContext } from 'react';
const { urlUtil: UrlUtil } = utils;

const getConfiguredServerByKey = (appConfig, serverKey) => {
  if (!serverKey || !appConfig || !appConfig.servers || !appConfig.servers.dicomWeb) {
    return null;
  }

  return (
    appConfig.servers.dicomWeb.find(server => server.id === serverKey) ||
    appConfig.servers.dicomWeb.find(server => server.viewerKey === serverKey) ||
    null
  );
};

/**
 * Get array of seriesUIDs from param or from queryString
 * @param {*} seriesInstanceUIDs
 * @param {*} location
 */
const getSeriesInstanceUIDs = (seriesInstanceUIDs, routeLocation) => {
  const queryFilters = UrlUtil.queryString.getQueryFilters(routeLocation);
  const querySeriesUIDs = queryFilters && queryFilters['seriesInstanceUID'];
  const _seriesInstanceUIDs = seriesInstanceUIDs || querySeriesUIDs;

  return UrlUtil.paramString.parseParam(_seriesInstanceUIDs);
};

function ViewerRouting({ match: routeMatch, location: routeLocation }) {
  const {
    project,
    location,
    dataset,
    dicomStore,
    serverKey,
    studyInstanceUIDs,
    seriesInstanceUIDs,
  } = routeMatch.params;

  const { appConfig = {} } = useContext(AppContext);

  // Set the user's default authToken for outbound DICOMWeb requests.
  // Is only applied if target server does not set `requestOptions` property.
  //
  // See: `getAuthorizationHeaders.js`
  let query = useQuery();
  const authToken = query.get('token');

  if (authToken) {
    user.getAccessToken = () => authToken;
  }

  const routeServer = getConfiguredServerByKey(appConfig, serverKey);
  const server = routeServer || useServer({ project, location, dataset, dicomStore });
  const studyUIDs = UrlUtil.paramString.parseParam(studyInstanceUIDs);
  const seriesUIDs = getSeriesInstanceUIDs(seriesInstanceUIDs, routeLocation);

  if (serverKey && !routeServer) {
    return <div>Unknown PACS server key: {serverKey}</div>;
  }

  if (server && studyUIDs) {
    return (
      <ConnectedViewerRetrieveStudyData
        server={server}
        studyInstanceUIDs={studyUIDs}
        seriesInstanceUIDs={seriesUIDs}
      />
    );
  }

  return null;
}

ViewerRouting.propTypes = {
  match: PropTypes.shape({
    params: PropTypes.shape({
      studyInstanceUIDs: PropTypes.string.isRequired,
      seriesInstanceUIDs: PropTypes.string,
      serverKey: PropTypes.string,
      dataset: PropTypes.string,
      dicomStore: PropTypes.string,
      location: PropTypes.string,
      project: PropTypes.string,
    }),
  }),
  location: PropTypes.any,
};

export default ViewerRouting;
