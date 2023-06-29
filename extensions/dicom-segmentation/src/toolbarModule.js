const TOOLBAR_BUTTON_TYPES = {
  COMMAND: 'command',
  SET_TOOL_ACTIVE: 'setToolActive',
  BUILT_IN: 'builtIn',
};

const definitions = [
  {
    id: 'SegDropdown',
    label: 'Segmentation',
    icon: 'ellipse-circle',
    buttons: [
      // {
      //   id: 'SegMpr',
      //   label: 'mprDrow',
      //   icon: 'sun',
      //   //
      //   type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
      //   commandName: 'mprDrow',
      //   commandOptions: {},
      // },
      {
        id: 'SegTempCrosshairs',
        label: 'Custom',
        icon: 'dot-circle',
        //
        type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
        commandName: 'customDrow',
        commandOptions: {},
      },
      // {
      //   id: 'SegTempCrosshairs3D',
      //   label: 'Custom3D',
      //   icon: 'lung',
      //   //
      //   type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
      //   commandName: 'customDrow3D',
      //   commandOptions: {},
      // },
      {
        id: 'Brush',
        label: 'Brush',
        icon: 'brush',
        //
        type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
        commandName: 'setToolActive',
        commandOptions: { toolName: 'Brush' },
      },
      {
        id: 'RectangleScissors',
        label: 'Rectangle',
        icon: 'square-o',
        //
        type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
        commandName: 'setToolActive',
        commandOptions: { toolName: 'RectangleScissors' },
      },
      {
        id: 'CircleScissors',
        label: 'Circle',
        icon: 'circle-o',
        //
        type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
        commandName: 'setToolActive',
        commandOptions: { toolName: 'CircleScissors' },
      },

      {
        id: 'FreehandScissors',
        label: 'Freehand',
        icon: 'palette',
        //
        type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
        commandName: 'setToolActive',
        commandOptions: { toolName: 'FreehandScissors' },
      },
      {
        id: 'SphericalBrush',
        label: 'Spherical',
        icon: 'sphere',
        //
        type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
        commandName: 'setToolActive',
        commandOptions: { toolName: 'SphericalBrush' },
      },
      {
        id: 'CorrectionScissors',
        label: 'Scissors',
        icon: 'scissors',
        //
        type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
        commandName: 'setToolActive',
        commandOptions: { toolName: 'CorrectionScissors' },
      },
      {
        id: 'BrushEraser',
        label: 'Eraser',
        icon: 'eraser',
        //
        type: TOOLBAR_BUTTON_TYPES.SET_TOOL_ACTIVE,
        commandName: 'setToolActive',
        commandOptions: { toolName: 'BrushEraser' },
      },
      {
        id: 'BrushEraserSelect',
        label: 'EraserAll',
        icon: 'trash',
        //
        type: TOOLBAR_BUTTON_TYPES.COMMAND,
        commandName: 'eraserSelectSeg',
      },
      // {
      //   id: 'BrushEraserAll',
      //   label: 'EraserAll',
      //   icon: 'trash',
      //   //
      //   type: TOOLBAR_BUTTON_TYPES.COMMAND,
      //   commandName: 'eraserAll',
      // },
      {
        id: 'Undo',
        label: 'Undo',
        icon: 'reset',
        //
        type: TOOLBAR_BUTTON_TYPES.COMMAND,
        commandName: 'undo',
      },
      {
        id: 'Redo',
        label: 'Redo',
        icon: 'rotate',
        //
        type: TOOLBAR_BUTTON_TYPES.COMMAND,
        commandName: 'redo',
      },
    ],
  },
];

export default {
  definitions,
  defaultContext: 'ACTIVE_VIEWPORT::CORNERSTONE',
};
