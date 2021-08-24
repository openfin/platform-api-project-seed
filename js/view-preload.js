(async () => {
  await fin.me.addListener('host-context-changed', async ({ context }) => {
    await fdc3.joinChannel(context);
  });
})();

// window.addEventListener('initialized', async () => {

//   await fdc3.joinChannel('red');
// })


console.log(`entityType: ${fin.me.entityType}`);
console.log(`isPlatform: ${fin.__internal_.isPlatform}`);
console.log(`isView ${fin.me.isView}`);
console.log(`isWindow ${fin.me.isWindow}`);
