## Build guide
 1. Commit all code in development branch `anhht`
 2. Checkout to `release`
 3. `export` all functions in `helper.js`
 4. Uncomment the first and last line in `main.js` (Remember to `import` func in the first line if you export new in `helper.js`)
 5. Bundle all stuff using: `yarn webpack`
 6. Check to confirm everything work fine by open `demo/demo.html`
 7. Update new versioning in `package.json`
 8. Publish using: `npm publish`
 9. Enjoy the beautiful time after you created something valueable for human 😎
 10. Prepare your self for the bug list from customer/team lead/pm/co-worker