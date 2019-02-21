## Build guide
 1. Commit all code in development branch `anhht`
 2. Checkout to `release`
 3. Merge branch `anhht`
 4. `export` all functions in `helper.js`
 5. Uncomment the first and last line in `main.js` (Remember to `import` func in the first line if you export new in `helper.js`)
 6. Export class `PageFlySliderController` in `main.js`
 7. Bundle all stuff using: `yarn webpack`
 8. Check to confirm everything work fine by open `demo/demo.html`
 9. Update new version in `package.json`
 10. Publish using: `npm publish`
 11. Checkout to `master`, keep a copy of release
 12. Prepare your self for the bug list from customer/team lead/pm/co-worker