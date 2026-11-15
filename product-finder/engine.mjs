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
export function changeArea(_previous,area){return {...freshAnswers(),area};}
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
 const care=careReason(a),support=care==='skin'?['cloth','underwear','laundry']:['cloth','underwear','bladder'];
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
 const primary=products[0],intimate=['outer_groin','vaginal_change','urine_leakage','unsure'].includes(a.area)||a.concerns.includes('outside');
 let categories;
 if(care==='skin')categories=['cloth','laundry',...(intimate?['underwear']:[])];
 else if(care==='urine')categories=['bladder','underwear','cloth'];
 else if(care)categories=['underwear','cloth'];
 else if(a.area==='underarms')categories=[category,...(a.concerns.includes('both')&&category==='antiperspirant'?['deodorant']:[]),'cleanser','cloth'];
 else categories=[category,...(a.concerns.includes('damp')?['moisture']:[]),'cleanser',...(intimate?['underwear']:[]),'cloth'];
 // Offer distinct, relevant choices. Eligibility rules apply to every card.
 const shortlist=[primary],seen=new Set([primary.id]);
 for(const c of [...new Set(categories)])for(const p of list(c)){
  if(seen.has(p.id)||shortlist.length===5)continue;
  seen.add(p.id);shortlist.push(p);
 }
 const recommendations=shortlist.map((product,index)=>({product,rank:index+1,...recommendationContext(a,product,primary,care,index),revisitsCategory:triedCategory(product),triedCategory:productApproach(product)}));
 return {kind:'product',route,primary,recommendations,alternatives:products.slice(1,3),gentle,care,allergyReview:allergyReviewNeeded(a),fallback,revisitsCategory:triedCategory(primary),triedCategory:productApproach(primary)};
}
function recommendationContext(a,p,primary,care,index){
 const category=p.category||'cleanser',sameJob=category===(primary.category||'cleanser');
 const role=index===0?'Start here':sameJob?(category==='cleanser'?(p.format==='bar'?'A bar alternative':'A liquid alternative'):'Another option to compare'):({deodorant:'An alternative for smell only',cleanser:'For the washing step',moisture:'For damp skin folds',laundry:'For your clothes and towels',bladder:'For light bladder leaks',underwear:'For a fresh, dry change',cloth:'For gentle drying'})[category];
 const reason={
  antiperspirant:'You mentioned wetness. This fragrance-free stick reduces underarm sweat and also targets odor.',
  deodorant:a.concerns.some(x=>['both','wetness'].includes(x))?(primary.category==='antiperspirant'?'An alternative if odor control is your priority. This gel does not reduce sweating; choose between it and the antiperspirant.':'You selected wetness too. This aluminum-free option targets odor only; it does not reduce sweating.'):'You mentioned underarm smell. This fragrance-free gel targets odor without adding scent.',
  cleanser:a.area==='outer_groin'||a.concerns.includes('outside')?'For gently washing the surrounding outer body skin. Keep it off the vulva and out of the vagina.':p.format==='bar'?'A bar option for the washing step on body skin. Choose one cleanser; you do not need to layer washes.':'A gentle liquid option for the washing step. Choose one cleanser rather than adding several.',
  moisture:'You mentioned damp skin folds. This fabric helps wick moisture away where skin touches skin.',
  laundry:care==='skin'?'For clothes and towels touching sensitive skin: wash without added perfume. This is laundry care, not a rash treatment.':'You said clothes hold the smell. This detergent is for the fabric, not your skin.',
  bladder:'You mentioned little leaks. These pads absorb light bladder leakage and help contain urine odor.',
  underwear:care==='vaginal'||care==='uncertain'?'A breathable, dry change for everyday comfort while you get a new intimate odor or other change checked.':'For a fresh change when underwear feels damp. Choose a comfortable fit and check the fabric blend.',
  cloth:care==='skin'?'For gently patting intact skin dry or a cool, damp compress. Do not scrub or use it as a wound dressing.':intimateArea(a)?'For gently patting the outside skin dry with a clean cloth. No scrubbing or internal use.':'For gently drying body skin after washing. A clean cloth supports the routine; it does not treat the cause of odor.'
 }[category];
 return {role,reason};
}
function intimateArea(a){return ['outer_groin','vaginal_change','urine_leakage','unsure'].includes(a.area)||a.concerns.includes('outside');}
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
