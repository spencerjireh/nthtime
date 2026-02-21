// Shim for packages (monaco-vim, monaco-emacs) that import 'monaco-editor' directly.
// @monaco-editor/react loads the full Monaco API onto window.monaco at runtime,
// so we re-export that global instead of bundling Monaco's AMD internals.
if (typeof self !== 'undefined' && self.monaco) {
  module.exports = self.monaco;
} else {
  module.exports = {};
}
