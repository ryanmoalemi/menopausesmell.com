// Bounded same-origin reads without AbortSignal.timeout, which older WebViews lack.
// Review failures are optional; catalog/config failures show a retryable error.
export async function fetchJSON(url,{timeout=10000,fetcher=fetch,Controller=globalThis.AbortController}={}){
 const controller=typeof Controller==='function'?new Controller():null;
 let timer;
 try{
  return await Promise.race([
   Promise.resolve().then(()=>fetcher(url,{cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',...(controller?{signal:controller.signal}:{})})).then(response=>{
    if(!response.ok)throw Error('Product data unavailable');
    return response.json();
   }),
   new Promise((_,reject)=>{timer=setTimeout(()=>{reject(Error('Product data timed out'));controller?.abort();},timeout);})
  ]);
 }finally{clearTimeout(timer);}
}
