let context = {};

function setContext(newContext) {
  context = newContext;
}
function getContext() {
  return context;
}
export { setContext, getContext };
