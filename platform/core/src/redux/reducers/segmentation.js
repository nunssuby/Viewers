import cloneDeep from 'lodash.clonedeep';

const defaultState = {
  segData: [],
};

const segmentation = (state = defaultState, action) => {
  switch (action.type) {
    case 'PUSH_SEG': {
      const segData = cloneDeep(state.segData);
      segData.push(cloneDeep(action.data));
      return { ...state, segData };
    }
    case 'POP_SEG': {
      let segData = state.segData;
      segData.pop();
      return { ...state, segData };
    }
    case 'RESET_SEG': {
      let segData = [];
      return { ...state, segData };
    }
    default:
      return state;
  }
};

export default segmentation;
