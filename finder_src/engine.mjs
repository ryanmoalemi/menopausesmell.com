// Stateless matching. No browser APIs, analytics, network or diagnosis.
export const AREAS=[['underarms','Underarms','body'],['body_folds','Body or skin folds','folds'],['outer_groin','Outer groin skin','groin'],['vaginal_change','Vaginal odor or discharge','flower'],['urine_leakage','Urine or little leaks','drop'],['unsure',"I'm not sure",'question']];
export const SENSITIVITIES=[['fragrance','Fragrance bothers me','flower'],['reactive','Products often dry or irritate my skin','leaf'],['allergy','I have a known ingredient allergy','allergy'],['irritated','Skin is irritated or broken right now','alert'],['none','None that I know of','check'],['unsure',"I'm not sure",'question']];
export const CONCERNS={
 underarms:[['odor','The smell'],['wetness','Sweating or wetness'],['both','Both'],['unsure',"I'm not sure"]],
 body:[['odor','The smell comes back after washing'],['damp','The skin stays sweaty or damp'],['clothes','It seems to stay in my clothes'],['rash','The area is sore, broken, or has a new rash'],['unsure',"I'm not sure"]],
 intimate:[['outside','Sweat on the outside skin'],['change','Vaginal smell or discharge is new or different'],['urine','Urine or little leaks'],['symptoms','I also have itching, burning, soreness, pain or bleeding'],['unsure',"I'm not sure"]]
};
export const freshAnswers=()=>({area:null,concerns:[],sensitivities:[],allergy:'',tried:[],reasons:{},unknownProduct:'',routine:'',format:'any',aluminumFree:false});
export const concernKind=a=>a.area==='underarms'?'underarms':['vaginal_change','unsure'].includes(a.area)?'intimate':'body';
export function toggleExclusive(values,value,exclusive=['none','unsure']){
 if(values.includes(value))return values.filter(x=>x!==value);
 return exclusive.includes(value)?[value]:[...values.filter(x=>!exclusive.includes(x)),value];
}
export function changeArea(a,area){return a.area===area?a:{...a,area,concerns:[],format:'any',aluminumFree:false};}
export function careReason(a){
 if(a.concerns.some(x=>['change','symptoms'].includes(x)))return 'vaginal';
 if(a.area==='urine_leakage'||a.concerns.includes('urine'))return 'urine';
 if(a.concerns.includes('rash')||a.sensitivities.includes('irritated'))return 'skin';
 if(concernKind(a)==='intimate'&&a.concerns.includes('unsure'))return 'uncertain';
 return null;
}
export const routeAfterConcern=a=>careReason(a)?'result':'sensitivity';
export const routeAfterSensitivity=a=>careReason(a)?'result':a.sensitivities.includes('allergy')?'allergy':'tried';
export function eligibleProducts(a,catalog,preview=false){
 if(a.sensitivities.includes('allergy'))return [];
 const area=a.concerns.includes('outside')?'outer_groin':a.area;
 return catalog.filter(p=>p.candidate&&p.labelVerified&&(preview||p.publishEligible)&&p.areas.includes(area)&&!a.tried.includes(p.id)
  &&(!a.sensitivities.includes('fragrance')||p.fragranceFree===true)&&(!a.sensitivities.includes('reactive')||p.gentle===true)
  &&(a.format==='any'||a.format===p.format));
}
export function resultFor(a,catalog,preview=false){
 const care=careReason(a);if(care)return {kind:'care',reason:care};
 if(a.area==='underarms'&&a.concerns.some(x=>['wetness','both'].includes(x)))return {kind:'sweat',aluminumFree:a.aluminumFree};
 if(a.concerns.includes('clothes'))return {kind:'clothes'};
 if(a.area==='outer_groin'||a.concerns.includes('outside'))return {kind:'external'};
 if(a.concerns.includes('damp'))return {kind:'damp'};
 if(a.sensitivities.includes('allergy'))return {kind:'no-match',reason:'allergy'};
 if(a.area==='underarms'&&a.concerns.includes('unsure'))return {kind:'uncertain-underarm'};
 if(a.area==='underarms'&&!a.sensitivities.some(x=>['fragrance','reactive'].includes(x)))return {kind:'odor'};
 const products=eligibleProducts(a,catalog,preview);
 if(!products.length)return {kind:'no-match',reason:a.format==='any'?'excluded':'format'};
 const gentle=a.sensitivities.some(x=>['fragrance','reactive'].includes(x));
 products.sort((a,b)=>gentle?Number(b.gentle)-Number(a.gentle):a.order-b.order);
 return {kind:'product',primary:products[0],alternatives:products.slice(1,3),gentle};
}
export function amazonURL(product,tag='menopausewash-20'){
 const u=new URL('https://www.amazon.com/s');u.searchParams.set('k',product.amazonQuery);u.searchParams.set('tag',tag);return u.href;
}
export function validateCatalog(data){
 if(!Array.isArray(data)||!data.length)throw Error('Product data unavailable');
 const ids=new Set();
 for(const p of data){
  if(!p.id||ids.has(p.id)||!p.name||!p.variant||!p.image||!Array.isArray(p.areas))throw Error('Invalid product data');
  ids.add(p.id);
  if(p.candidate&&p.labelVerified&&(!p.ingredients||!p.source||!p.checked||!p.labelDirections))throw Error('Missing verified product context');
 }
 return data;
}
