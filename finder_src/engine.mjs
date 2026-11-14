// Stateless matching. No browser APIs, analytics, network or diagnosis.
export const AREAS=[['underarms','Underarms','body'],['body_folds','Body or skin folds','folds'],['outer_groin','Outer groin skin','groin'],['vaginal_change','Vaginal odor or discharge','flower'],['urine_leakage','Urine or little leaks','drop'],['unsure',"I'm not sure",'question']];
export const SENSITIVITIES=[['none','No allergies','check'],['fragrance','Fragrance bothers me','flower'],['reactive','Products often dry or irritate my skin','leaf'],['allergy','I have an ingredient allergy','allergy'],['irritated','Skin is irritated or broken right now','alert']];
export const CONCERNS={
 underarms:[['odor','The smell'],['wetness','Sweating or wetness'],['both','Both'],['unsure',"I'm not sure"]],
 body:[['odor','The smell comes back after washing'],['damp','The skin stays sweaty or damp'],['clothes','It seems to stay in my clothes'],['rash','The area is sore, broken, or has a new rash'],['unsure',"I'm not sure"]],
 intimate:[['outside','Sweat on the outside skin'],['change','Vaginal smell or discharge is new or different'],['urine','Urine or little leaks'],['symptoms','I also have itching, burning, soreness, pain or bleeding'],['unsure',"I'm not sure"]]
};
export const ALLERGENS=[['fragrance','Fragrance'],['aluminum','Aluminum'],['propylene_glycol','Propylene glycol'],['lanolin','Lanolin'],['silver','Silver'],['adhesive','Adhesives'],['latex','Latex'],['other','Something else / not sure']];
export const freshAnswers=()=>({area:null,concerns:[],sensitivities:[],allergies:[],triedCategories:[],tried:[],reasons:{},unknownProduct:'',routine:'',format:'any',aluminumFree:false});
// Broad approaches people describe in menopause discussions, not brand recall.
export const TRIED_CATEGORIES={
 soap:['Bar soap','soap','peach'],body_wash:['Body wash','bottle','sage'],deodorant:['Deodorant','deodorant','lilac'],antiperspirant:['Antiperspirant','shield','blue'],
 acid:['Acid toner','drop','peach'],antibacterial:['Antibacterial wash','bottle','blue'],powder:['Body powder','powder','gold'],laundry:['Laundry changes','clothes','lilac'],
 underwear:['Different underwear','groin','sage'],probiotics:['Probiotics','capsule','peach'],pads:['Pads or liners','pad','lilac'],pelvic_floor:['Pelvic floor exercises','body','blue'],
 routine:['Home remedies','leaf','sage'],nothing:['Nothing yet','spark','gold']
};
export function triedOptions(a){
 if(a.area==='urine_leakage'||a.concerns.includes('urine'))return ['pads','underwear','body_wash','pelvic_floor','routine','nothing'];
 if(['vaginal_change','unsure'].includes(a.area)&&!a.concerns.includes('outside'))return ['soap','body_wash','probiotics','pads','underwear','routine','nothing'];
 if(a.concerns.includes('clothes'))return ['soap','body_wash','deodorant','laundry','underwear','routine','nothing'];
 if(a.area==='underarms')return ['soap','body_wash','deodorant','antiperspirant','acid','antibacterial','routine','nothing'];
 return ['soap','body_wash','deodorant','powder','antibacterial','underwear','routine','nothing'];
}
export function productApproach(p){const c=p.category||'cleanser';return c==='cleanser'?(p.format==='bar'?'soap':'body_wash'):({bladder:'pads',underwear:'underwear',laundry:'laundry',probiotic:'probiotics',cloth:'cloth',moisture:'moisture'})[c]||c;}
export const concernKind=a=>a.area==='underarms'?'underarms':['vaginal_change','unsure'].includes(a.area)?'intimate':'body';
export function toggleExclusive(values,value,exclusive=['none','unsure']){
 if(values.includes(value))return values.filter(x=>x!==value);
 return exclusive.includes(value)?[value]:[...values.filter(x=>!exclusive.includes(x)),value];
}
export function changeArea(a,area){return a.area===area?a:{...a,area,concerns:[],triedCategories:[],format:'any',aluminumFree:false};}
export function careReason(a){
 if(a.concerns.some(x=>['change','symptoms'].includes(x)))return 'vaginal';
 if(a.concerns.includes('rash')||a.sensitivities.includes('irritated'))return 'skin';
 if(a.area==='urine_leakage'||a.concerns.includes('urine'))return 'urine';
 if(concernKind(a)==='intimate'&&a.concerns.includes('unsure'))return 'uncertain';
 return null;
}
export const routeAfterConcern=()=> 'sensitivity';
export const routeAfterSensitivity=()=> 'tried';
// Progress reflects only the questions actually asked. Leakage needs no odor question.
export function finderPath(a){return a.area==='urine_leakage'?['area','sensitivity','tried']:['area','concern','sensitivity','tried'];}
export function allergyReviewNeeded(a){return a.sensitivities.includes('allergy')&&(!a.allergies?.length||a.allergies.includes('other'));}
export function ingredientCompatible(a,p){
 const restrictions=a.sensitivities.includes('allergy')?(a.allergies||[]):[];
 return restrictions.filter(x=>x!=='other').every(x=>(p.excludesIngredients||[]).includes(x));
}
export function eligibleProducts(a,catalog,preview=false,category='cleanser'){
 const care=careReason(a),support=['cloth','underwear','bladder'];
 if(care&&!support.includes(category))return [];
 if(care==='skin'&&category==='bladder')return [];
 if(care&&care!=='urine'&&category==='bladder')return [];
 const area=a.concerns.includes('outside')&&!care?'outer_groin':a.area;
 return catalog.filter(p=>(p.category||'cleanser')===category&&(p.candidate||p.browseEligible)&&p.labelVerified&&(preview||p.publishEligible)&&(category==='probiotic'||p.areas.includes(area))&&!a.tried.includes(p.id)
  &&ingredientCompatible(a,p)&&(!a.sensitivities.includes('fragrance')||p.fragranceFree===true)&&(!a.sensitivities.includes('reactive')||p.gentle===true)
  &&(!a.aluminumFree||p.aluminumFree!==false)&&(category!=='cleanser'||a.format==='any'||a.format===p.format));
}
export function resultFor(a,catalog,preview=false){
 const care=careReason(a),aluminumAvoid=a.aluminumFree||(a.sensitivities.includes('allergy')&&a.allergies?.includes('aluminum'));
 let route='wash',category='cleanser';
 if(care){
  if(care==='urine'){route='leaks';category='bladder';}
  else if(care==='skin'){route='comfort-skin';category='cloth';}
  else{route='comfort-intimate';category='underwear';}
 }else if(a.area==='underarms'){
  if(a.concerns.some(x=>['wetness','both'].includes(x))){route=aluminumAvoid?'odor-only':'sweat';category=aluminumAvoid?'deodorant':'antiperspirant';}
  else{route=a.concerns.includes('unsure')?'odor-unsure':'odor';category='deodorant';}
 }else if(a.concerns.includes('clothes')){route='clothes';category='laundry';}
 else if(a.area==='outer_groin'||a.concerns.includes('outside'))route='external';
 else if(a.concerns.includes('damp')){route='damp';category='moisture';}
 const gentle=a.sensitivities.some(x=>['fragrance','reactive'].includes(x));
 const triedCategory=p=>(a.triedCategories||[]).includes(productApproach(p));
 const list=category=>eligibleProducts(a,catalog,preview,category).filter(p=>p.candidate).sort((x,y)=>Number(triedCategory(x))-Number(triedCategory(y))||(gentle?Number(y.gentle)-Number(x.gentle):0)||x.order-y.order);
 let products=list(category),fallback=false;
 if(!products.length){
  const alternatives=care?['underwear','cloth']:a.area==='underarms'?['deodorant','cleanser','cloth']:['cleanser','underwear','cloth'];
  for(const next of alternatives){
   if(next===category)continue;
   const options=list(next);
   if(options.length){products=options;category=next;route=({deodorant:'odor-fallback',cleanser:'wash-fallback',underwear:'comfort-fallback',cloth:'cloth-fallback'})[next];fallback=true;break;}
  }
 }
 if(!products.length)return {kind:'no-match',reason:'excluded'};
 return {kind:'product',route,primary:products[0],alternatives:products.slice(1,3),gentle,care,allergyReview:allergyReviewNeeded(a),fallback,revisitsCategory:triedCategory(products[0]),triedCategory:productApproach(products[0])};
}
export function amazonURL(product,tag='menopausewash-20'){
 if(product.exactListingVerified&&/^B[A-Z0-9]{9}$/.test(product.asin||'')){
  const u=new URL('https://www.amazon.com/dp/'+product.asin);u.searchParams.set('tag',tag);return u.href;
 }
 const u=new URL('https://www.amazon.com/s');u.searchParams.set('k',product.amazonQuery);u.searchParams.set('tag',tag);return u.href;
}
export function validateCatalog(data){
 if(!Array.isArray(data)||!data.length)throw Error('Product data unavailable');
 const ids=new Set();
 for(const p of data){
  if(!p.id||ids.has(p.id)||!p.name||!p.variant||!p.image||!Array.isArray(p.areas))throw Error('Invalid product data');
  ids.add(p.id);
  if((p.candidate||p.browseEligible)&&p.labelVerified&&(!p.ingredients||!p.source||!p.checked||!p.labelDirections))throw Error('Missing verified product context');
 }
 return data;
}
