// Small reusable debounce - delays calling fn until `wait` ms after the
// last call. Used for search input so we don't fire an API request per keystroke.
function debounce(fn, wait = 350) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
window.debounce = debounce;
