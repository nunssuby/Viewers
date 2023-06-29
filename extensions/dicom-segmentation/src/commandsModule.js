import cornerstoneTools from 'cornerstone-tools';
import cs from 'cornerstone-core';
import OHIF from '@ohif/core';
import { redux } from '@ohif/core';
import cloneDeep from 'lodash.clonedeep';

import DICOMSegTempCrosshairsTool from './tools/DICOMSegTempCrosshairsTool';
import TOOL_NAMES from './tools/TOOL_NAMES';
const {
  DICOM_SEG_CUSTOM_TOOL,
  DICOM_SEG_CUSTOM_TOOL_3D,
  SYNC_BRUSH_TOOL,
} = TOOL_NAMES;

const {
  drawBrushPixels,
  getDiffBetweenPixelData,
  getCircle,
  triggerLabelmapModifiedEvent,
} = cornerstoneTools.import('util/segmentationUtils');

const { setLayout, pushSeg, popSeg, resetSeg } = redux.actions;
const { studyMetadataManager } = OHIF.utils;
const { getters, setters, configuration } = cornerstoneTools.getModule(
  'segmentation'
);

const commandsModule = ({ commandsManager, servicesManager }) => {
  const { UINotificationService, LoggerService } = servicesManager.services;

  const actions = {
    undo: ({ viewports }) => {
      const enabledElements = cornerstone.getEnabledElements();
      const element = enabledElements[viewports.activeViewportIndex].element;

      const labelmap3D = getters.labelmap3D(element);

      if (labelmap3D.undo.length > 0) {
        setters.undo(element);

        // UINotificationService.show({
        //   title: 'Segmentation Back',
        //   message: 'Segmentations returned to previous state',
        //   type: 'warning',
        //   autoClose: true,
        // });
      } else {
        UINotificationService.show({
          title: 'Segmentation History Empty',
          message: 'Segmentation History Empty',
          type: 'error',
          autoClose: true,
        });
      }
    },
    redo: ({ viewports }) => {
      const enabledElements = cornerstone.getEnabledElements();
      const element = enabledElements[viewports.activeViewportIndex].element;

      const labelmap3D = getters.labelmap3D(element);

      if (labelmap3D.redo.length > 0) {
        setters.redo(element);

        // UINotificationService.show({
        //   title: 'Segmentation Back',
        //   message: 'Segmentations returned to previous state',
        //   type: 'warning',
        //   autoClose: true,
        // });
      } else {
        UINotificationService.show({
          title: 'Segmentation History Empty',
          message: 'Segmentation History Empty',
          type: 'error',
          autoClose: true,
        });
      }
    },
    eraserAll: ({ viewports }) => {
      const enabledElements = cornerstone.getEnabledElements();
      const element = enabledElements[viewports.activeViewportIndex].element;
      const labelmap3D = getters.labelmap3D(element);
      const enabledElement = cornerstone.getEnabledElement(element);

      const {
        labelmap2D,
        currentImageIdIndex,
        activeLabelmapIndex,
      } = getters.labelmap2D(element);

      const oldLabelmap2D = cloneDeep(labelmap2D);

      console.log(element, enabledElement, oldLabelmap2D);

      const action = pushSeg(labelmap3D.labelmaps2D);
      store.dispatch(action);

      const newLabelmap2D = { pixelData: [] };
      for (let i = 0; i < labelmap3D.labelmaps2D.length; i++) {
        if (!labelmap3D.labelmaps2D[i]) {
          continue;
        } else {
          for (let j = 0; j < labelmap3D.labelmaps2D[i].pixelData.length; j++) {
            labelmap3D.labelmaps2D[i].pixelData[j] = 0;
            newLabelmap2D.pixelData[j] = 0;
          }
          for (
            let j = 0;
            j < labelmap3D.labelmaps2D[i].segmentsOnLabelmap.length;
            j++
          ) {
            labelmap3D.labelmaps2D[i].segmentsOnLabelmap[j] = 0;
          }
        }
      }

      const pointerArray = [];
      const shouldErase = false;

      // drawBrushPixels(
      //   pointerArray,
      //   labelmap2D.pixelData,
      //   labelmap3D.activeSegmentIndex,
      //   enabledElement.image.columns,
      //   shouldErase
      // );

      if (configuration.storeHistory) {
                                        const previousPixelData =
                                          oldLabelmap2D.pixelData;
                                        const newPixelData =
                                          newLabelmap2D.pixelData;
                                        const operation = {
                                          imageIdIndex: currentImageIdIndex,
                                          diff: getDiffBetweenPixelData(
                                            previousPixelData,
                                            newPixelData
                                          ),
                                        };

                                        setters.pushState(element, [operation]);
                                      }

      cornerstone.updateImage(element);

      UINotificationService.show({
        title: 'Segmentation Deleted',
        message: 'Segmentations All Deleted',
        type: 'error',
        autoClose: true,
      });
    },
    eraserSelectSeg: ({ viewports }) => {
      const enabledElements = cornerstone.getEnabledElements();
      const element = enabledElements[viewports.activeViewportIndex].element;
      const { getters } = cornerstoneTools.getModule('segmentation');
      const { labelmaps3D } = getters.labelmaps3D(element);
      const labelmap3D = getters.labelmap3D(element);
      const activeSegmentIndex = getters.activeSegmentIndex(element);
      const activeLabelmapIndex = getters.activeLabelmapIndex(element);

      const { labelmap2D, currentImageIdIndex } = getters.labelmap2D(element);

      const oldLabelmap2D = cloneDeep(labelmap2D);

      const newLabelmap2D = {
        pixelData: [],
      };

      for (let i = 0; i < labelmap3D.labelmaps2D.length; i++) {
        if (!labelmap3D.labelmaps2D[i]) {
          continue;
        } else {
          for (let j = 0; j < labelmap3D.labelmaps2D[i].pixelData.length; j++) {
            if (labelmap3D.labelmaps2D[i].pixelData[j] === activeSegmentIndex) {
              labelmap3D.labelmaps2D[i].pixelData[j] = 0;
              newLabelmap2D.pixelData[j] = 0;
            }
          }
          for (
            let j = 0;
            j < labelmap3D.labelmaps2D[i].segmentsOnLabelmap.length;
            j++
          ) {
            if (
              labelmap3D.labelmaps2D[i].segmentsOnLabelmap[j] ===
              activeSegmentIndex
            ) {
              //labelmap3D.labelmaps2D[i].segmentsOnLabelmap.splice(j, 1);
              labelmap3D.labelmaps2D[i].segmentsOnLabelmap[j] = 0;
              break;
            }
          }
        }
      }

      if (configuration.storeHistory) {
        const previousPixelData = oldLabelmap2D.pixelData;
        const newPixelData = newLabelmap2D.pixelData;
        const operation = {
          imageIdIndex: currentImageIdIndex,
          diff: getDiffBetweenPixelData(previousPixelData, newPixelData),
        };

        setters.pushState(element, [operation]);
      }

      cornerstone.updateImage(element);

      UINotificationService.show({
        title: 'Segmentation Changed',
        message: 'Segmentation returned to previous state',
        type: 'success',
        autoClose: true,
      });
    },
    jumpToFirstSegment: ({ viewports }) => {
      try {
        const { activeViewportIndex, viewportSpecificData } = viewports;
        const viewport = viewportSpecificData[activeViewportIndex];
        const { StudyInstanceUID, displaySetInstanceUID } = viewport;
        const studyMetadata = studyMetadataManager.get(StudyInstanceUID);
        const firstImageId = studyMetadata.getFirstImageId(
          displaySetInstanceUID
        );

        const module = cornerstoneTools.getModule('segmentation');
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

        const toolState = cornerstoneTools.getToolState(element, 'stack');
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
      const module = cornerstoneTools.getModule('segmentation');
      module.setters.radius(5);

      cornerstoneTools.setToolActive(DICOM_SEG_CUSTOM_TOOL, {
        mouseButtonMask: 1,
      });

      const { configuration } = cornerstoneTools.getModule('segmentation');

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
      const module = cornerstoneTools.getModule('segmentation');
      module.setters.radius(5);

      cornerstoneTools.setToolActive(DICOM_SEG_CUSTOM_TOOL_3D, {
        mouseButtonMask: 1,
      });

      const { configuration } = cornerstoneTools.getModule('segmentation');

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

      // cornerstoneTools.setToolActiveForElement(viewportDIV[0], SYNC_BRUSH_TOOL, {
      //   mouseButtonMask: 1,
      // });
    },
    setTolerance: ({ tolerance }) => {
      const { configuration } = cornerstoneTools.getModule('segmentation');

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
    undo: {
      commandFn: actions.undo,
      storeContexts: ['viewports'],
      options: {},
    },
    redo: {
      commandFn: actions.redo,
      storeContexts: ['viewports'],
      options: {},
    },
    eraserAll: {
      commandFn: actions.eraserAll,
      storeContexts: ['viewports'],
      options: {},
    },
    eraserSelectSeg: {
      commandFn: actions.eraserSelectSeg,
      storeContexts: ['viewports'],
      options: {},
    },
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
