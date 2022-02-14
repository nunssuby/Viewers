import { connect } from 'react-redux';

import StudyListRoute from './StudyListRoute.js';

const isActive = a => a.active === true;

const mapStateToProps = state => {
  const activeServer = state.servers.servers.find(isActive);
  console.log(state);

  return {
    server: activeServer,
    user: state.oidc.user,
  };
};

const ConnectedStudyList = connect(
  mapStateToProps,
  null
)(StudyListRoute);

export default ConnectedStudyList;
