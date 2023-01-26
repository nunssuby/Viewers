const TOOLBAR_BUTTON_TYPES = {
  COMMAND: 'command',
};

const definitions = [
  {
    id: 'Debug Info',
    label: 'Debug Info',
    icon: 'cog',
    //
    type: TOOLBAR_BUTTON_TYPES.COMMAND,
    commandName: 'openDebugInfoModal',
    context: 'ACTIVE_VIEWPORT::CORNERSTONE',
  },
];

export default {
  definitions,
  defaultContext: 'ACTIVE_VIEWPORT::CORNERSTONE',
};
