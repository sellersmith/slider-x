// class DOMObserver {
export default class DOMObserver {
  constructor() {
    this.elems = new Map();
    this.watch();
  }
  observe(elem, callback) {
    if (typeof callback !== 'function') {
      throw 'Callback must be a function'
    }
    const rect = elem.getBoundingClientRect();
    this.elems.set(elem, { rect, callback });
    callback()
  }
  unobserve(elem) {
    this.elems.delete(elem);
  }
  watch() {
    requestAnimationFrame(() => {
      this.elems.forEach((value, key) => {
        const nr = key.getBoundingClientRect();
        if (nr.width !== value.rect.width || nr.height !== value.rect.height) {
          value.callback();
          value.rect = nr
        }
        this.watch();
      });
    });
  }
}