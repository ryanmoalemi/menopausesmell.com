// Runs in a sandbox without allow-same-origin: cannot read the questionnaire DOM,
// cookies, storage, referrer or parent URL. Receives only an allowlisted count.
const measurementId='__MEASUREMENT_ID__';
if(/^G-[A-Z0-9]+$/.test(measurementId)){
 window.dataLayer=[];
 function gtag(){window.dataLayer.push(arguments);}
 gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
 gtag('set','ads_data_redaction',true);
 gtag('js',new Date());
 const context={send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:'https://menopausewash.com/product-finder/',page_referrer:'',page_title:'Product finder'};
 gtag('config',measurementId,context);
 const tag=document.createElement('script');tag.async=true;tag.src='https://www.googletagmanager.com/gtag/js?id='+measurementId;document.head.append(tag);
 window.addEventListener('message',event=>{
  if(event.source!==window.parent||event.data?.type!=='finder-count')return;
  const {name,step}=event.data;
  if(!['finder_open','finder_start','finder_step','finder_complete','finder_product_click'].includes(name))return;
  const params={...context,send_to:measurementId};
  if(name==='finder_step'){
   if(!Number.isInteger(step)||step<1||step>4)return;
   params.step_number=step;
  }
  gtag('event',name,params);
 });
 window.parent.postMessage('finder-count-ready','*');
}
