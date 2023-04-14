
module.exports = new Promise(async (resolve, reject) => {
  const { importDelegatedModule } = await import('@module-federation/utilities/src/utils/common');
  // eslint-disable-next-line no-undef
  const currentRequest = new URLSearchParams(__resourceQuery).get('remote');
  const [containerName, url] = currentRequest.split('@');

  importDelegatedModule({
    global: containerName,
    url: url + '?' + Date.now(),
  })
    .then((remote) => {
      resolve(remote);
    })
    .catch((err) => reject(err));
});
