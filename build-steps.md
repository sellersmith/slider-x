## Build guide
 1. Commit all code in development branch `native`
 2. Checkout to `master`
 3. Merge branch `native` into `master`
 4. `export` all functions in `helper.js`
 5. Uncomment the first and last line in `main.js` (Remember to `import` func in the first line if you export new in `helper.js`)
 6. Export class `SliderX` in `main.js`
 7. Export class `DOMObserver` in `observer.js`
 8. Bundle all stuff using: `yarn webpack`
 9. Check to confirm everything work fine by open `demo/demo.html`
 10. Update new version in `package.json`
 11. Publish using: `npm publish`
 12. Checkout to `master`, keep a copy of release
