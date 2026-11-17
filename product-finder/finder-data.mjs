import {fetchJSON} from './compat.mjs?v=988dcf978035';

// Only public editorial files. Answers never become request parameters or payloads.
export async function loadFinderData({baseURL=new URL('.',import.meta.url),fetchImpl=globalThis.fetch,timeoutMs=10000,reviewsTimeoutMs=4000,Controller=globalThis.AbortController}={}){
 const read=(name,timeout)=>fetchJSON(new URL(name,baseURL),{timeout,fetcher:fetchImpl,Controller});
 const [catalog,config,reviews]=await Promise.all([
  read('catalog.json',timeoutMs),read('config.json',timeoutMs),
  read('reviews.json',reviewsTimeoutMs).catch(()=>null)
 ]);
 return {catalog,config,reviews:reviews?.version===1&&Array.isArray(reviews.reviews)?reviews:null};
}
