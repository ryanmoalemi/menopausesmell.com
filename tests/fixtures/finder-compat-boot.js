// Preview fixtures only. Never copied into the production finder.
const profile=location.pathname.split('/')[2];
if(profile==='legacy'){
 globalThis.structuredClone=undefined;
 Array.prototype.at=undefined;
 if(globalThis.AbortSignal)AbortSignal.timeout=undefined;
 if(globalThis.MediaQueryList)MediaQueryList.prototype.addEventListener=undefined;
}else{
 const original=window.fetch.bind(window);let failed=false;
 window.fetch=(url,options)=>{
  if(profile==='reviews-offline'&&String(url).endsWith('/reviews.json'))return Promise.reject(Error('Fixture: reviews offline'));
  if(profile==='retry'&&!failed&&String(url).endsWith('/catalog.json')){failed=true;return Promise.reject(Error('Fixture: catalog offline'));}
  return original(url,options);
 };
}
