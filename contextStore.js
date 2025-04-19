let context = {};

function setContext(newContext) {
  context = newContext;
}
function getContext() {
  return context;
}
export { setContext, getContext };
// to make the ai remember the path it work in
