## Build guide
 1. Commit all code in development branch `anhht`
 2. Checkout to `release`
 3. Merge branch `anhht`
 4. `export` all functions in `helper.js`
 5. Uncomment the first and last line in `main.js` (Remember to `import` func in the first line if you export new in `helper.js`)
 6. Export class `PageFlySliderController` in `main.js`
 7. Export class `DOMObserver` in `observer.js`
 8. Bundle all stuff using: `yarn webpack`
 9. Check to confirm everything work fine by open `demo/demo.html`
 10. Un-export `PageFlySliderController` to window by uncomment the last line in `main.js`
 11. Update new version in `package.json`
 12. Publish using: `npm publish`
 13. Checkout to `master`, keep a copy of release