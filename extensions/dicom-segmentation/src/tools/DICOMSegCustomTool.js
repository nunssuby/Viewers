import cornerstoneTools, {
  importInternal,
  getToolState,
  toolColors,
  getModule,
  globalImageIdSpecificToolStateManager,
  csTools,
} from 'cornerstone-tools';
import cornerstone from 'cornerstone-core';
import TOOL_NAMES from './TOOL_NAMES';

const { DICOM_SEG_CUSTOM_TOOL } = TOOL_NAMES;
const { getters } = getModule('segmentation');

// Cornerstone 3rd party dev kit imports
const BaseBrushTool = importInternal('base/BaseBrushTool');

const MouseCursor = importInternal('tools/cursors/MouseCursor');

const { probeCursor } = MouseCursor;

const {
  drawBrushPixels,
  getDiffBetweenPixelData,
  getCircle,
  triggerLabelmapModifiedEvent,
} = cornerstoneTools.import('util/segmentationUtils');

/**
 * @class RTStructDisplayTool - Renders RTSTRUCT data in a read only manner (i.e. as an overlay).
 * @extends cornerstoneTools.BaseTool
 */
export default class DICOMSegCustomTool extends BaseBrushTool {
  constructor(props = {}) {
    const defaultProps = {
      name: DICOM_SEG_CUSTOM_TOOL,
      supportedInteractionTypes: ['Mouse', 'Touch', 'MouseWheel'],
      configuration: { alwaysEraseOnClick: false },
      mixins: ['renderBrushMixin'],
      svgCursor: probeCursor,
    };

    const initialProps = Object.assign(defaultProps, props);

    super(initialProps);

    this.touchDragCallback = this._paint.bind(this);
    this.point = [];
  }

  activeCallback(element) {}

  mouseWheelCallback(evt) {
    const { element, viewport, spinY } = evt.detail;

    const { configuration } = getModule('segmentation');

    let addTolerance = spinY;

    if(this._isCtrlDown(evt.detail.detail)){
      addTolerance = addTolerance * 5;
    }

    if(this._isAltDown(evt.detail.detail)){
      addTolerance = addTolerance * 10;
    }

    let tolerance = configuration.segsTolerance + Math.round(addTolerance);

    if (this.point != [] && tolerance > 0) {
      if (spinY > 0) {
        this._paintToleranceUp(evt, tolerance, this.point);
      } else {
        this._paintToleranceDown(
          evt,
          tolerance,
          configuration.segsTolerance,
          this.point
        );
      }
      configuration.segsTolerance = tolerance;
    }
  }

  _paint(evt) {
    const { configuration } = getModule('segmentation');
    const eventData = evt.detail;
    const element = eventData.element;
    const image = eventData.image;
    const { x, y } = eventData.currentPoints.image;

    if (x < 0 || x > image.columns || y < 0 || y > image.rows) {
      return;
    }

    this.point = [x, y];

    if (configuration.segsTolerance === undefined) {
      configuration.segsTolerance = 250;
    }

    let pointerArray = [];

    const { labelmap2D, labelmap3D, shouldErase } = this.paintEventData;

    const stats = {};

    if (x >= 0 && y >= 0 && x < image.columns && y < image.rows) {
      stats.sp = cornerstone.getStoredPixels(element, x, y, 1, 1)[0];
      stats.mo = stats.sp * image.slope + image.intercept;
    }

    const Tolerance = configuration.segsTolerance;

    pointerArray = this._magicwand(
      image,
      Math.floor(x),
      Math.floor(y),
      Tolerance,
      stats.mo,
      element
    );

    // Draw / Erase the active color.
    drawBrushPixels(
      pointerArray,
      labelmap2D.pixelData,
      labelmap3D.activeSegmentIndex,
      image.columns,
      shouldErase
    );

    cornerstone.updateImage(evt.detail.element);
  }

  _paintToleranceUp(evt, tolerance, point) {
    const eventData = evt.detail;
    const element = eventData.element;
    const image = eventData.image;
    const x = point[0];
    const y = point[1];

    if (x < 0 || x > image.columns || y < 0 || y > image.rows) {
      return;
    }

    let pointerArray = [];

    const { labelmap2D, labelmap3D, shouldErase } = this.paintEventData;

    const stats = {};

    if (x >= 0 && y >= 0 && x < image.columns && y < image.rows) {
      stats.sp = cornerstone.getStoredPixels(element, x, y, 1, 1)[0];
      stats.mo = stats.sp * image.slope + image.intercept;
    }

    pointerArray = this._magicwand(
      image,
      Math.floor(x),
      Math.floor(y),
      tolerance,
      stats.mo,
      element
    );

    drawBrushPixels(
      pointerArray,
      labelmap2D.pixelData,
      labelmap3D.activeSegmentIndex,
      image.columns,
      shouldErase
    );

    cornerstone.updateImage(evt.detail.element);
  }

  _paintToleranceDown(evt, tolerance, preTolerance, point) {
    const eventData = evt.detail;
    const element = eventData.element;
    const image = eventData.image;
    const x = point[0];
    const y = point[1];

    if (x < 0 || x > image.columns || y < 0 || y > image.rows) {
      return;
    }

    let pointerArray = [];
    let prePointerArray = [];

    const { labelmap2D, labelmap3D, shouldErase } = this.paintEventData;

    const stats = {};

    if (x >= 0 && y >= 0 && x < image.columns && y < image.rows) {
      stats.sp = cornerstone.getStoredPixels(element, x, y, 1, 1)[0];
      stats.mo = stats.sp * image.slope + image.intercept;
    }

    pointerArray = this._magicwand(
      image,
      Math.floor(x),
      Math.floor(y),
      tolerance,
      stats.mo,
      element
    );

    prePointerArray = this._magicwand(
      image,
      Math.floor(x),
      Math.floor(y),
      preTolerance,
      stats.mo,
      element
    );

    drawBrushPixels(
      prePointerArray,
      labelmap2D.pixelData,
      labelmap3D.activeSegmentIndex,
      image.columns,
      true
    );

    drawBrushPixels(
      pointerArray,
      labelmap2D.pixelData,
      labelmap3D.activeSegmentIndex,
      image.columns,
      false
    );

    cornerstone.updateImage(evt.detail.element);
  }

  _magicwand(image, px, py, Tolerance, base, element, except = []) {
    var c,
      x,
      newY,
      el,
      xr,
      xl,
      dy,
      dyl,
      dyr,
      checkY,
      mo,
      w = image.width,
      h = image.height,
      maxX = -1,
      minX = w + 1,
      maxY = -1,
      minY = h + 1,
      result = new Array(),
      visited = [];

    var stack = [{ y: py, left: px - 1, right: px + 1, dir: 1 }]; // first scanning line
    do {
      el = stack.shift(); // get line for scanning
      checkY = false;

      for (x = el.left + 1; x < el.right; x++) {
        dy = el.y;

        if (visited[dy * w + x] === 1) continue; // check whether the point has been visited
        if (except.filter(p => p[0] == x && p[1] == dy).length > 0) continue;

        // compare the color of the sample

        if (x >= 0 && dy >= 0 && x < image.columns && dy < image.rows) {
          mo =
            cornerstone.getStoredPixels(element, x, dy, 1, 1)[0] * image.slope +
            image.intercept;

          if (mo > base + Tolerance || mo < base - Tolerance) continue;

          checkY = true; // if the color of the new point(x,y) is similar to the sample color need to check minmax for Y

          result.push([x, dy]);
        }
        visited[dy * w + x] = 1; // mark a new point as visited

        xl = x - 1;
        // walk to left side starting with the left neighbor
        while (xl > -1) {
          dyl = dy * w + xl;

          if (visited[dyl] === 1) break; // check whether the point has been visited
          if (except.filter(p => p[0] == xl && p[1] == dy).length > 0) break;

          if (xl >= 0 && dy >= 0 && xl < image.columns && dy < image.rows) {
            mo =
              cornerstone.getStoredPixels(element, xl, dy, 1, 1)[0] *
                image.slope +
              image.intercept;

            if (mo > base + Tolerance || mo < base - Tolerance) break;

            result.push([xl, dy]);
          }
          visited[dyl] = 1;
          xl--;
        }
        xr = x + 1;
        // walk to right side starting with the right neighbor
        while (xr < w) {
          dyr = dy * w + xr;

          if (visited[dyr] === 1) break; // check whether the point has been visited
          if (except.filter(p => p[0] == xr && p[1] == dy).length > 0) break;

          if (xr >= 0 && dy >= 0 && xr < image.columns && dy < image.rows) {
            mo =
              cornerstone.getStoredPixels(element, xr, dy, 1, 1)[0] *
                image.slope +
              image.intercept;

            if (mo > base + Tolerance || mo < base - Tolerance) break;

            result.push([xr, dy]);
          }
          visited[dyr] = 1;
          xr++;
        }

        // check minmax for X
        if (xl < minX) minX = xl + 1;
        if (xr > maxX) maxX = xr - 1;

        newY = el.y - el.dir;
        if (newY >= 0 && newY < h) {
          // add two scanning lines in the opposite direction (y - dir) if necessary
          if (xl < el.left)
            stack.push({ y: newY, left: xl, right: el.left, dir: -el.dir }); // from "new left" to "current left"
          if (el.right < xr)
            stack.push({ y: newY, left: el.right, right: xr, dir: -el.dir }); // from "current right" to "new right"
        }
        newY = el.y + el.dir;
        if (newY >= 0 && newY < h) {
          // add the scanning line in the direction (y + dir) if necessary
          if (xl < xr)
            stack.push({ y: newY, left: xl, right: xr, dir: el.dir }); // from "new left" to "new right"
        }
      }
      // check minmax for Y if necessary
      if (checkY) {
        if (el.y < minY) minY = el.y;
        if (el.y > maxY) maxY = el.y;
      }
    } while (stack.length > 0);

    return result;
  }

  _isCtrlDown(eventData) {
    return (eventData.event && eventData.event.ctrlKey) || eventData.ctrlKey;
  }

  _isAltDown(eventData) {
    return (eventData.event && eventData.event.altKey) || eventData.altKey;
  }
}
