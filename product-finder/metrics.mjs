// Only generic funnel counts cross into the isolated measurement frame.
// Never pass answers, product IDs/names, links, DOM text, or campaign query strings.
export function countEvent(name,step){
 if(!['finder_open','finder_start','finder_step','finder_complete','finder_product_click'].includes(name))return null;
 if(name==='finder_step')return Number.isInteger(step)&&step>=1&&step<=4?{type:'finder-count',name,step}:null;
 return {type:'finder-count',name};
}
export function createMetrics(config){
 if(config.preview||!config.measurement_id||navigator.globalPrivacyControl||navigator.doNotTrack==='1')return ()=>{};
 const frame=document.createElement('iframe');
 frame.hidden=true;frame.title='Aggregate site measurement';frame.sandbox='allow-scripts';frame.referrerPolicy='no-referrer';
 frame.src='./metrics.html';
 const queue=[];let ready=false;
 window.addEventListener('message',event=>{
  if(event.source!==frame.contentWindow||event.data!=='finder-count-ready')return;
  ready=true;for(const entry of queue.splice(0))frame.contentWindow.postMessage(entry,'*');
 });
 document.body.append(frame);
 return (name,step)=>{
  const event=countEvent(name,step);if(!event)return;
  if(ready)frame.contentWindow.postMessage(event,'*');else if(queue.length<30)queue.push(event);
 };
}
