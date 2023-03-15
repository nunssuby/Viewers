import csTools from 'cornerstone-tools';
import cs from 'cornerstone-core';
import OHIF from '@ohif/core';
import { redux } from '@ohif/core';

import DICOMSegTempCrosshairsTool from './tools/DICOMSegTempCrosshairsTool';
import TOOL_NAMES from './tools/TOOL_NAMES';
const {
  DICOM_SEG_CUSTOM_TOOL,
  DICOM_SEG_CUSTOM_TOOL_3D,
  SYNC_BRUSH_TOOL,
} = TOOL_NAMES;

const { setLayout } = redux.actions;
const { studyMetadataManager } = OHIF.utils;

const commandsModule = ({ commandsManager, servicesManager }) => {
  const { UINotificationService, LoggerService } = servicesManager.services;

  const actions = {
    jumpToFirstSegment: ({ viewports }) => {
      try {
        const { activeViewportIndex, viewportSpecificData } = viewports;
        const viewport = viewportSpecificData[activeViewportIndex];
        const { StudyInstanceUID, displaySetInstanceUID } = viewport;
        const studyMetadata = studyMetadataManager.get(StudyInstanceUID);
        const firstImageId = studyMetadata.getFirstImageId(
          displaySetInstanceUID
        );

        const module = csTools.getModule('segmentation');
        const brushStackState = module.state.series[firstImageId];
        const { labelmaps3D, activeLabelmapIndex } = brushStackState;
        const { labelmaps2D } = labelmaps3D[activeLabelmapIndex];

        const firstLabelMap2D = labelmaps2D.find(value => !!value);
        const firstSegment = firstLabelMap2D.segmentsOnLabelmap[0];
        const segmentNumber = firstSegment;

        const validIndexList = [];
        labelmaps2D.forEach((labelMap2D, index) => {
          if (labelMap2D.segmentsOnLabelmap.includes(segmentNumber)) {
            validIndexList.push(index);
          }
        });

        const avg = array => array.reduce((a, b) => a + b) / array.length;
        const average = avg(validIndexList);
        const closest = validIndexList.reduce((prev, curr) => {
          return Math.abs(curr - average) < Math.abs(prev - average)
            ? curr
            : prev;
        });

        const enabledElements = cs.getEnabledElements();
        const element = enabledElements[activeViewportIndex].element;

        const toolState = csTools.getToolState(element, 'stack');
        if (!toolState) return;

        const imageIds = toolState.data[0].imageIds;
        const imageId = imageIds[closest];
        const frameIndex = imageIds.indexOf(imageId);
        const SOPInstanceUID = cs.metaData.get('SOPInstanceUID', imageId);

        cs.getEnabledElements().forEach(enabledElement => {
          cs.updateImage(enabledElement.element);
        });

        DICOMSegTempCrosshairsTool.addCrosshair(
          element,
          imageId,
          segmentNumber
        );

        cs.getEnabledElements().forEach(enabledElement => {
          cs.updateImage(enabledElement.element);
        });

        const refreshViewports = false;

        commandsManager.runCommand('jumpToImage', {
          StudyInstanceUID,
          SOPInstanceUID,
          frameIndex,
          activeViewportIndex,
          refreshViewports,
        });
      } catch (error) {
        console.log('Error in moving to the first segment slice');
      }
    },
    customDrow: () => {
      const module = csTools.getModule('segmentation');
      module.setters.radius(5);

      csTools.setToolActive(DICOM_SEG_CUSTOM_TOOL, { mouseButtonMask: 1 });

      const { configuration } = csTools.getModule('segmentation');

      if (configuration.segsTolerance === undefined) {
        configuration.segsTolerance = 250;
      }

      UINotificationService.show({
        title: 'Segmentation tools',
        message:
          'Segmentation MagicTool Selected! \ntolerance value : ' +
          configuration.segsTolerance,
        type: 'success',
        autoClose: true,
      });
    },

    customDrow3D: () => {
      const module = csTools.getModule('segmentation');
      module.setters.radius(5);

      csTools.setToolActive(DICOM_SEG_CUSTOM_TOOL_3D, { mouseButtonMask: 1 });

      const { configuration } = csTools.getModule('segmentation');

      if (configuration.segsTolerance === undefined) {
        configuration.segsTolerance = 250;
      }

      UINotificationService.show({
        title: 'Segmentation tools3D',
        message:
          'Segmentation MagicTool Selected! \ntolerance value : ' +
          configuration.segsTolerance,
        type: 'success',
        autoClose: true,
      });
    },

    mprDrow: () => {
      // const numRows = 1;
      // const numColumns = 3;

      // const displaySet =
      //   viewports.viewportSpecificData[viewports.activeViewportIndex];

      // const viewportPropsArray = [
      //   {
      //     //Axial
      //     orientation: {
      //       sliceNormal: [0, 0, 1],
      //       viewUp: [0, -1, 0],
      //     },
      //   },
      //   {
      //     // Sagittal
      //     orientation: {
      //       sliceNormal: [1, 0, 0],
      //       viewUp: [0, 0, 1],
      //     },
      //   },
      //   {
      //     // Coronal
      //     orientation: {
      //       sliceNormal: [0, 1, 0],
      //       viewUp: [0, 0, 1],
      //     },
      //   },
      // ];

      // const newViewports = [];
      // const numViewports = numRows * numColumns;

      // if (viewportPropsArray && viewportPropsArray.length !== numViewports) {
      //   reject(
      //     new Error(
      //       'viewportProps is supplied but its length is not equal to numViewports'
      //     )
      //   );
      // }

      // const viewportSpecificData = {};

      // for (let i = 0; i < numViewports; i++) {
      //   newViewports.push({});
      //   viewportSpecificData[i] = displaySet;
      //   viewportSpecificData[i].plugin = 'rt';
      // }

      // const apis = [];
      // newViewports.forEach((viewport, index) => {
      //   apis[index] = null;
      //   const viewportProps = viewportPropsArray[index];
      //   newViewports[index] = Object.assign({}, newViewports[index], {
      //     vtk: {
      //       mode: 'mpr',
      //       ...viewportProps,
      //     },
      //   });
      // });

      // const layout = {
      //   numRows,
      //   numColumns,
      //   viewports: newViewports,
      // };

      // console.log(
      //   '=================================viewportSpecificData',
      //   layout,
      //   viewportSpecificData
      // );

      // const action = setViewportLayoutAndData(layout, viewportSpecificData);

      // window.store.dispatch(action);

      const viewportProps = [
        {
          //Axial
          plugin: 'vtk',
          orientation: {
            sliceNormal: [0, 0, 1],
            viewUp: [0, -1, 0],
          },
        },
        {
          // Sagittal
          plugin: 'vtk',
          orientation: {
            sliceNormal: [1, 0, 0],
            viewUp: [0, 0, 1],
          },
        },
        {
          // Coronal
          plugin: 'vtk',
          orientation: {
            sliceNormal: [0, 1, 0],
            viewUp: [0, 0, 1],
          },
        },
        {
          // Coronal
          plugin: 'vtk',
          orientation: {
            sliceNormal: [0, 1, 0],
            viewUp: [0, 0, 1],
          },
        },
      ];

      const viewports = [{ plugin: 'cornerstone' }, { plugin: 'cornerstone' }];

      const layout = {
        numRows: 1,
        numColumns: 2,
        viewports: viewports,
      };

      const action = setLayout(layout);

      window.store.dispatch(action);

      console.log(viewports);
      const viewportDIV = Array.from(
        document.getElementsByClassName('viewport-container')
      );

      console.log(viewportDIV);

      // csTools.setToolActiveForElement(viewportDIV[0], SYNC_BRUSH_TOOL, {
      //   mouseButtonMask: 1,
      // });
    },
    setTolerance: ({ tolerance }) => {
      const { configuration } = csTools.getModule('segmentation');

      if (configuration.segsTolerance + tolerance > 0) {
        configuration.segsTolerance =
          Math.floor(configuration.segsTolerance) + tolerance;

        UINotificationService.show({
          title: 'Segmentation tolerance Change.',
          message: 'tolerance value : ' + configuration.segsTolerance,
          type: 'success',
          autoClose: true,
        });
      }
    },
  };

  const definitions = {
    jumpToFirstSegment: {
      commandFn: actions.jumpToFirstSegment,
      storeContexts: ['viewports'],
      options: {},
    },
    customDrow: {
      commandFn: actions.customDrow,
      storeContexts: ['viewports'],
      options: {},
    },
    customDrow3D: {
      commandFn: actions.customDrow3D,
      storeContexts: ['viewports'],
      options: {},
    },
    mprDrow: {
      commandFn: actions.mprDrow,
      storeContexts: ['viewports'],
      options: {},
    },

    toleranceUp: {
      commandFn: actions.setTolerance,
      storeContexts: ['viewports'],
      options: { tolerance: +5 },
    },
    toleranceDown: {
      commandFn: actions.setTolerance,
      storeContexts: ['viewports'],
      options: { tolerance: -5 },
    },
    toleranceLargeUp: {
      commandFn: actions.setTolerance,
      storeContexts: ['viewports'],
      options: { tolerance: +25 },
    },
    toleranceLargeDown: {
      commandFn: actions.setTolerance,
      storeContexts: ['viewports'],
      options: { tolerance: -25 },
    },
  };

  return {
    definitions,
    defaultContext: 'VIEWER',
  };
};

export default commandsModule;
