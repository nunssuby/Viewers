import cornerstoneTools from 'cornerstone-tools';
import cornerstone from 'cornerstone-core';
import dcmjs from 'dcmjs';
import { api } from 'dicomweb-client';
import OHIF from '@ohif/core';
import { errorHandler } from '@ohif/core';
import getXHRRetryRequestHook from '@ohif/core/src/utils/xhrRetryRequestHook';
import Segmentation from './adapters/Cornerstone/Segmentation';
const { DicomLoaderService } = OHIF.utils;

let metaData = {};
/*
const switchSegment = document.getElementById('switchSegment');

for (let i = 1 ; i <= 255; i++) {
    const option = document.createElement("option");

    option.text = i;
    option.value = i;

    switchSegment.add(option);
}

document.getElementById("switchSegment")[0].selected = true;
*/
//document.getElementById("switchActiveLabelmap")[0].selected = true;

function changeSegment() {
  const segmentIndex = document.getElementById('switchSegment').value;
  const element = document.getElementsByClassName('viewport-element')[0];

  const { setters } = cornerstoneTools.getModule('segmentation');

  setters.activeSegmentIndex(element, segmentIndex);
}

function changeLabelmap() {
  const labelmapIndex = document.getElementById('switchActiveLabelmap').value;
  const segmentIndex = document.getElementById('switchSegment').value;
  const element = document.getElementsByClassName('viewport-element')[0];

  const { setters } = cornerstoneTools.getModule('segmentation');

  setters.activeLabelmapIndex(element, labelmapIndex);
  setters.activeSegmentIndex(element, segmentIndex);

  cornerstone.updateImage(element);
}

async function createSeg(firstImageId, element, studies, DisplaySet) {
  const globalToolStateManager =
    cornerstoneTools.globalImageIdSpecificToolStateManager;
  const toolState = globalToolStateManager.saveToolState();

  const stackToolState = cornerstoneTools.getToolState(element, 'stack');
  console.log('================================studies', studies, DisplaySet);
  const imageIds = stackToolState.data[0].imageIds;

  const segArrayBuffer = await DicomLoaderService.findDicomDataPromise(
    DisplaySet,
    studies
  );

  console.log('================================segArrayBuffer', segArrayBuffer);

  let imagePromises = [];
  for (let i = 0; i < imageIds.length; i++) {
    imagePromises.push(cornerstone.loadImage(imageIds[i]));
  }

  const segments = [];

  const { getters } = cornerstoneTools.getModule('segmentation');
  const { labelmaps3D } = getters.labelmaps3D(element);

  if (!labelmaps3D) {
    return;
  }

  for (
    let labelmapIndex = 0;
    labelmapIndex < labelmaps3D.length;
    labelmapIndex++
  ) {
    const labelmap3D = labelmaps3D[labelmapIndex];
    const labelmaps2D = labelmap3D.labelmaps2D;
    const colorLUTIndex = labelmap3D.colorLUTIndex;

    for (let i = 0; i < labelmaps2D.length; i++) {
      if (!labelmaps2D[i]) {
        continue;
      }

      const segmentsOnLabelmap = labelmaps2D[i].segmentsOnLabelmap;

      segmentsOnLabelmap.forEach(segmentIndex => {
        if (segmentIndex !== 0 && !labelmap3D.metadata[segmentIndex]) {
          labelmap3D.metadata[segmentIndex] = generateMockMetadata(
            segmentIndex,
            colorLUTIndex
          );
        }
      });
    }
  }

  console.log('-=======================labelmaps3D,', labelmaps3D);

  Promise.all(imagePromises)
    .then(async images => {
      console.log('-=======================images', images);
      const segBlob = Segmentation.generateSegmentation(
        images,
        labelmaps3D,
        segArrayBuffer
      );
      const config = {
        url: window.config.servers.dicomWeb[0].wadoRoot,
        headers: OHIF.DICOMWeb.getAuthorizationHeader(),
        errorInterceptor: errorHandler.getHTTPErrorHandler(),
        requestHooks: [getXHRRetryRequestHook()],
      };

      const dicomWeb = new api.DICOMwebClient(config);
      const options = {
        datasets: [segBlob],
      };

      await dicomWeb.storeInstances(options);
    })
    .catch(err => console.log(err));
}

function datasetToDict(dataset) {
  const fileMetaInformationVersionArray = new Uint8Array(2);
  fileMetaInformationVersionArray[1] = 1;

  const TransferSyntaxUID =
    dataset._meta.TransferSyntaxUID &&
    dataset._meta.TransferSyntaxUID.Value &&
    dataset._meta.TransferSyntaxUID.Value[0]
      ? dataset._meta.TransferSyntaxUID.Value[0]
      : '1.2.840.10008.1.2.1';

  dataset._meta = {
    MediaStorageSOPClassUID: dataset.SOPClassUID,
    MediaStorageSOPInstanceUID: dataset.SOPInstanceUID,
    ImplementationVersionName: 'dcmjs-0.0',
    TransferSyntaxUID,
    ImplementationClassUID:
      '2.25.80302813137786398554742050926734630921603366648225212145404',
    FileMetaInformationVersion: fileMetaInformationVersionArray.buffer,
  };

  const denaturalized = DicomMetaDictionary.denaturalizeDataset(dataset._meta);
  const dicomDict = new DicomDict(denaturalized);
  dicomDict.dict = DicomMetaDictionary.denaturalizeDataset(dataset);
  return dicomDict;
}

function datasetToBuffer(dataset) {
  return Buffer.from(datasetToDict(dataset).write());
}

function generateMockMetadata(segmentIndex, colorLUTIndex) {
  const { state } = cornerstoneTools.getModule('segmentation');
  const colorLutTables = state.colorLutTables[colorLUTIndex];

  // TODO -> Use colors from the cornerstoneTools LUT.
  const RecommendedDisplayCIELabValue = dicomlab2LAB(
    colorLutTables[segmentIndex]
  );

  // console.log(
  //   '-=======================RecommendedDisplayCIELabValue,',
  //   colorLutTables[segmentIndex],
  //   RecommendedDisplayCIELabValue
  // );

  return {
    SegmentedPropertyCategoryCodeSequence: {
      CodeValue: 'T-D0050',
      CodingSchemeDesignator: 'SRT',
      CodeMeaning: 'Tissue',
    },
    SegmentNumber: (segmentIndex + 1).toString(),
    SegmentLabel: 'Tissue!! ' + (segmentIndex + 1).toString(),
    SegmentAlgorithmType: 'SEMIAUTOMATIC',
    SegmentAlgorithmName: 'Slicer Prototype',
    RecommendedDisplayCIELabValue,
    SegmentedPropertyTypeCodeSequence: {
      CodeValue: 'T-D0050',
      CodingSchemeDesignator: 'SRT',
      CodeMeaning: 'Tissue',
    },
  };
}

function addMetaData(type, imageId, data) {
  metaData[imageId] = metaData[imageId] || {};
  metaData[imageId][type] = data;
}

//
// creates an array of per-frame imageIds in the form needed for cornerstone processing.
//
function getImageIds(multiframe, baseImageId) {
  const imageIds = [];
  const numFrames = Number(multiframe.NumberOfFrames);
  for (let i = 0; i < numFrames; i++) {
    let segNum;
    if (
      multiframe.PerFrameFunctionalGroupsSequence[i]
        .SegmentIdentificationSequence
    ) {
      segNum =
        multiframe.PerFrameFunctionalGroupsSequence[i]
          .SegmentIdentificationSequence.ReferencedSegmentNumber;
    }
    const imageId = baseImageId + '?frame=' + i;
    imageIds.push(imageId);
  }
  return imageIds;
}

//
// uses cornerstone caching to access a bytearray of the
// part10 dicom, then uses dcmjs to parse this
// into javascript object and populates the
// metadata for the per-frame imageIDs.
//
function loadMultiFrameAndPopulateMetadata(baseImageId) {
  return new Promise(function(resolve, reject) {
    var multiframe;
    cornerstone.loadAndCacheImage(baseImageId).then(function(image) {
      var arrayBuffer = image.data.byteArray.buffer;

      dicomData = dcmjs.data.DicomMessage.readFile(arrayBuffer);
      let dataset = dcmjs.data.DicomMetaDictionary.naturalizeDataset(
        dicomData.dict
      );
      dataset._meta = dcmjs.data.DicomMetaDictionary.namifyDataset(
        dicomData.meta
      );

      multiframe = dcmjs.normalizers.Normalizer.normalizeToDataset([dataset]);

      const numFrames = Number(multiframe.NumberOfFrames);
      for (let i = 0; i < numFrames; i++) {
        const imageId = baseImageId + '?frame=' + i;

        var functionalGroup = multiframe.PerFrameFunctionalGroupsSequence[i];
        var imagePositionArray =
          functionalGroup.PlanePositionSequence.ImagePositionPatient;

        addMetaData('imagePlane', imageId, {
          imagePositionPatient: {
            x: imagePositionArray[0],
            y: imagePositionArray[1],
            z: imagePositionArray[2],
          },
        });
      }

      resolve(multiframe);
    });
  });
}

function dicomlab2LAB(lab) {
  return [
    (lab[0] * 65535.0) / 100.0, // results in 0 <= L <= 65535
    ((lab[1] + 128) * 65535.0) / 255.0, // results in 0 <= a <= 65535
    ((lab[2] + 128) * 65535.0) / 255.0, // results in 0 <= b <= 65535
  ];
}

export default createSeg;
