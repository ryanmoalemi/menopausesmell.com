// Stateless matching. No browser APIs, analytics, network or diagnosis.
export const AREAS=[['underarms','Underarms','body'],['body_folds','Body or skin folds','folds'],['outer_groin','Outer groin skin','groin'],['vaginal_change','Vaginal odor or discharge','flower'],['urine_leakage','Urine or little leaks','drop'],['unsure',"I'm not sure",'question']];
export const SENSITIVITIES=[['none','No allergies','check'],['fragrance','Fragrance bothers me','flower'],['reactive','Products often dry or irritate my skin','leaf'],['allergy','I have an ingredient allergy','allergy'],['irritated','Skin is irritated or broken right now','alert']];
export const CONCERNS={
 underarms:[['odor','The smell'],['wetness','Sweating or wetness'],['both','Both'],['unsure',"I'm not sure"]],
 body:[['odor','The smell comes back after washing'],['damp','The skin stays sweaty or damp'],['clothes','It seems to stay in my clothes'],['chafe','Skin rubs or chafes, but is not broken'],['rash','The area is sore, broken, or has a new rash'],['unsure',"I'm not sure"]],
 intimate:[['outside','Sweat on the outside skin'],['change','Vaginal smell or discharge is new or different'],['urine','Urine or little leaks'],['dryness','Vaginal dryness during the day'],['friction','Dryness or friction during sex'],['symptoms','I also have itching, burning, soreness, pain or bleeding'],['unsure',"I'm not sure"]]
};
export const ALLERGENS=[['fragrance','Fragrance'],['aluminum','Aluminum'],['propylene_glycol','Propylene glycol'],['lanolin','Lanolin'],['silver','Silver'],['adhesive','Adhesives'],['latex','Latex'],['other','Something else / not sure']];
export const freshAnswers=()=>({area:null,concerns:[],sensitivities:[],allergies:[],triedCategories:[],tried:[],reasons:{},unknownProduct:'',routine:'',format:'any',aluminumFree:false});
// Broad approaches people describe in menopause discussions, not brand recall.
export const TRIED_CATEGORIES={
 soap:['Bar soap','soap','peach'],body_wash:['Body wash','bottle','sage'],deodorant:['Deodorant','deodorant','lilac'],antiperspirant:['Antiperspirant','shield','blue'],
 acid:['Acid toner','drop','peach'],antibacterial:['Antibacterial wash','bottle','blue'],powder:['Body powder','powder','gold'],laundry:['Laundry changes','clothes','lilac'],
 underwear:['Different underwear','groin','sage'],probiotics:['Probiotics','capsule','peach'],pads:['Pads or liners','pad','lilac'],pelvic_floor:['Pelvic floor exercises','body','blue'],
 leak_underwear:['Leak-proof underwear','groin','blue'],vaginal_moisturizer:['Vaginal moisturizer','drop','lilac'],lubricant:['Lubricant','drop','peach'],barrier:['Barrier ointment','shield','gold'],rinse:['Water rinsing','drop','blue'],
 routine:['Home remedies','leaf','sage'],nothing:['Nothing yet','spark','gold']
};
export function triedOptions(a){
 if(hasLeaks(a)||a.concerns.some(x=>['dryness','friction'].includes(x))){
  const choices=[];
  if(hasLeaks(a))choices.push('pads','leak_underwear','pelvic_floor');
  if(a.concerns.includes('dryness'))choices.push('vaginal_moisturizer');
  if(a.concerns.includes('friction'))choices.push('lubricant');
  if(a.concerns.includes('outside'))choices.push('body_wash');
  return [...choices,'underwear','routine','nothing'];
 }
 if(['vaginal_change','unsure'].includes(a.area)&&!a.concerns.includes('outside'))return ['soap','body_wash','probiotics','pads','underwear','routine','nothing'];
 if(a.concerns.includes('clothes'))return ['soap','body_wash','deodorant','laundry','underwear','routine','nothing'];
 if(a.concerns.includes('chafe'))return ['barrier','powder','body_wash','underwear','routine','nothing'];
 if(a.area==='underarms')return ['soap','body_wash','deodorant','antiperspirant','acid','antibacterial','routine','nothing'];
 return ['soap','body_wash','deodorant','powder','antibacterial','underwear','routine','nothing'];
}
export function productApproach(p){const c=p.category||'cleanser';return p.approach||(c==='cleanser'?(p.format==='bar'?'soap':'body_wash'):({bladder:'pads',underwear:'underwear',laundry:'laundry',probiotic:'probiotics',cloth:'cloth',moisture:'moisture'})[c]||c);}
export const hasLeaks=a=>a.area==='urine_leakage'||a.concerns.includes('urine');
export const hasSkinWarning=a=>a.concerns.includes('rash')||a.sensitivities.includes('irritated');
export const hasIntimateWarning=a=>a.concerns.some(x=>['change','symptoms'].includes(x));
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
 const care=careReason(a),intimate=intimateArea(a),skin=hasSkinWarning(a),warning=hasIntimateWarning(a);
 // A care note and a shopping need can coexist. Evaluate each job separately.
 if(category==='bladder'&&(!hasLeaks(a)||skin))return [];
 if(category==='rinse'&&!intimate)return [];
 if(category==='barrier'&&(!((hasLeaks(a)&&intimate)||a.concerns.includes('chafe'))||skin||warning))return [];
 if(category==='vaginal_moisturizer'&&(!a.concerns.includes('dryness')||skin||warning))return [];
 if(category==='lubricant'&&(!a.concerns.includes('friction')||skin||warning))return [];
 if(skin&&!['cloth','underwear','laundry','rinse'].includes(category))return [];
 if((warning||care==='uncertain')&&!['cloth','underwear','bladder','rinse'].includes(category))return [];
 if(care==='urine'&&!['cloth','underwear','bladder','rinse','barrier','vaginal_moisturizer','lubricant'].includes(category))return [];
 if(intimate&&['vaginal_change','unsure'].includes(a.area)&&category==='cleanser'&&!a.concerns.includes('outside'))return [];
 const area=category==='cleanser'&&a.concerns.includes('outside')?'outer_groin':a.area;
 return catalog.filter(p=>(p.category||'cleanser')===category&&(p.candidate||p.browseEligible)&&p.labelVerified&&(preview||p.publishEligible)&&p.areas.includes(area)&&!a.tried.includes(p.id)
  &&ingredientCompatible(a,p)&&(!a.sensitivities.includes('fragrance')||p.fragranceFree===true)&&(!(a.sensitivities.includes('reactive')||(category==='cleanser'&&a.concerns.includes('chafe')))||p.gentle===true)
  &&(!a.aluminumFree||p.aluminumFree!==false)&&(category!=='cleanser'||a.format==='any'||a.format===p.format));
}
export function resultFor(a,catalog,preview=false){
 const care=careReason(a),aluminumAvoid=a.aluminumFree||(a.sensitivities.includes('allergy')&&a.allergies?.includes('aluminum'));
 let route='wash',category='cleanser';
 if(hasLeaks(a)&&!hasSkinWarning(a)){route='leaks';category='bladder';}
 else if(care){
  if(care==='urine'){route='leaks';category='bladder';}
  else if(care==='skin'){route='comfort-skin';category='cloth';}
  else{route='comfort-intimate';category='underwear';}
 }else if(a.concerns.includes('dryness')){route='dryness';category='vaginal_moisturizer';}
 else if(a.concerns.includes('friction')){route='friction';category='lubricant';}
 else if(a.area==='underarms'){
  if(a.concerns.some(x=>['wetness','both'].includes(x))){route=aluminumAvoid?'odor-only':'sweat';category=aluminumAvoid?'deodorant':'antiperspirant';}
  else{route=a.concerns.includes('unsure')?'odor-unsure':'odor';category='deodorant';}
 }
 else if(a.concerns.includes('chafe')&&!a.concerns.includes('damp')){route='chafe';category='barrier';}
 else if(a.area==='outer_groin'||a.concerns.includes('outside'))route='external';
 else if(a.concerns.includes('damp')){route='damp';category='moisture';}
 else if(a.concerns.includes('chafe')){route='chafe';category='barrier';}
 else if(a.concerns.includes('clothes'))route='body-clothes';
 const gentle=a.sensitivities.some(x=>['fragrance','reactive'].includes(x));
 const triedCategory=p=>(a.triedCategories||[]).includes(productApproach(p));
 const list=category=>eligibleProducts(a,catalog,preview,category).filter(p=>p.candidate).sort((x,y)=>Number(triedCategory(x))-Number(triedCategory(y))||(gentle?Number(y.gentle)-Number(x.gentle):0)||x.order-y.order);
 let products=list(category),fallback=false;
 if(!products.length){
  const alternatives=care?['rinse','underwear','cloth']:a.area==='underarms'?['deodorant','cleanser','cloth']:['cleanser','underwear','cloth'];
  for(const next of alternatives){
   if(next===category)continue;
   const options=list(next);
   if(options.length){products=options;category=next;route=({deodorant:'odor-fallback',cleanser:'wash-fallback',rinse:'rinse-fallback',underwear:'comfort-fallback',cloth:'cloth-fallback'})[next];fallback=true;break;}
  }
 }
 if(!products.length)return {kind:'no-match',reason:'excluded'};
 const primary=products[0],intimate=['outer_groin','vaginal_change','urine_leakage','unsure'].includes(a.area)||a.concerns.includes('outside');
 let categories=[],support=[];
 if(hasLeaks(a))categories.push('bladder');
 if(a.concerns.includes('dryness'))categories.push('vaginal_moisturizer');
 if(a.concerns.includes('friction'))categories.push('lubricant');
 if(intimate&&(care||a.concerns.includes('outside')))categories.push('rinse');
 if(hasLeaks(a)||a.concerns.includes('chafe'))categories.push('barrier');
 if(care==='skin'){if(!intimate)categories.push('laundry');support=intimate?['underwear','cloth']:['cloth'];}
 else if(care){support=['underwear','cloth'];}
 else if(a.area==='underarms'){categories.push(category,...(a.concerns.includes('both')&&category==='antiperspirant'?['deodorant']:[]),'cleanser');support=['cloth'];}
 else if(!a.concerns.some(x=>['dryness','friction'].includes(x))||a.concerns.some(x=>['outside','odor','damp','clothes','chafe'].includes(x))){
  categories.push(category,...(a.concerns.includes('damp')?['moisture']:[]),'cleanser');support=[...(a.concerns.includes('clothes')?['laundry']:[]),...(intimate?['underwear']:[]),'cloth'];
 }
 // Cover distinct selected needs before adding alternate formulas, then comfort extras.
 const shortlist=[primary],seen=new Set([primary.id]);
 const add=p=>{if(p&&!seen.has(p.id)&&shortlist.length<5){seen.add(p.id);shortlist.push(p);}};
 const jobs=[...new Set([category,...categories])];
 for(const c of jobs)add(list(c)[0]);
 for(const c of jobs)for(const p of list(c))add(p);
 for(const c of support)for(const p of list(c))add(p);
 const recommendations=shortlist.map((product,index)=>({product,rank:index+1,...recommendationContext(a,product,primary,care,index),revisitsCategory:triedCategory(product),triedCategory:productApproach(product)}));
 return {kind:'product',route,primary,recommendations,alternatives:products.slice(1,3),gentle,care,allergyReview:allergyReviewNeeded(a),fallback,revisitsCategory:triedCategory(primary),triedCategory:productApproach(primary)};
}
function recommendationContext(a,p,primary,care,index){
 const category=p.category||'cleanser',sameJob=category===(primary.category||'cleanser');
 const role=index===0?'Start here':sameJob?(category==='cleanser'?(p.format==='bar'?'Prefer a bar?':'Prefer a liquid wash?'):category==='vaginal_moisturizer'?'Another moisturizer to compare':category==='bladder'?(p.format==='disposable_underwear'?'Prefer absorbent underwear?':'Prefer a light pad?'):'Another option for the same need'):({deodorant:'For smell, without sweat control',cleanser:'For washing your skin',moisture:'For damp skin folds',laundry:hasSkinWarning(a)?'For your clothes and towels':'Then, refresh the clothes holding odor',bladder:'For bladder leaks',underwear:'For a fresh, dry change',cloth:'For drying without rubbing',rinse:'For a gentle water rinse',barrier:'For protecting outside skin',vaginal_moisturizer:'For everyday vaginal dryness',lubricant:'For less friction during sex'})[category];
 const bodyPlace=a.area==='underarms'?'underarm':a.area==='outer_groin'||a.concerns.includes('outside')?'outer-groin':'body';
 const odor=a.concerns.some(x=>['odor','both','clothes'].includes(x));
 let reason={
  'mirai-unscented-bar':a.concerns.includes('clothes')&&!a.concerns.includes('odor')?'Start with body-odor care, even when you notice the smell in your clothes. This fragrance-free persimmon bar is a cleanser to compare with your usual soap.':odor?(a.area==='underarms'?'For your underarm smell, this fragrance-free persimmon bar is a cleanser to compare with your usual soap. It washes off rather than staying on like deodorant.':`You wash, but the smell comes back. This fragrance-free persimmon bar is a different cleanser to try for your ${bodyPlace==='body'?'body':bodyPlace+' skin'}.`):`For cleaning ${bodyPlace==='body'?(a.concerns.includes('damp')?'sweaty body skin':'your body skin'):'your '+bodyPlace+' skin'}, this persimmon bar is an option without added fragrance. It cleans the skin but does not reduce sweating.`,
  'vanicream-gentle-body-wash':bodyPlace==='outer-groin'?'For sweat on your outer groin skin, this fragrance-free wash keeps cleansing simple. Use it on surrounding body skin; plain water is enough for the vulva.':`For ${odor?bodyPlace+' odor':a.concerns.includes('damp')?'sweaty body skin':'your body skin'}, this mild liquid wash is a choice if you want to clean up without added perfume.`,
  'vanicream-antiperspirant':a.concerns.includes('both')?'You want help with both underarm smell and wetness. This fragrance-free stick reduces sweat and also controls odor.':'Underarm wetness is your main concern. This antiperspirant reduces sweating, which a body wash or regular deodorant cannot do.',
  'vanicream-deodorant':a.concerns.some(x=>['both','wetness'].includes(x))?'If you want to focus on underarm smell, this fragrance-free gel is an aluminum-free alternative. It does not reduce sweating.':'You want help with underarm smell. This fragrance-free gel targets odor without adding perfume or aluminum.',
  'interdry-fabric':'Your skin folds stay damp. This soft fabric sits between touching skin to wick moisture away, including under breasts or an abdominal fold.',
  'tide-free-gentle':hasSkinWarning(a)?'With sore skin, the clothes and towels touching it matter too. This fragrance-free detergent is an option for that laundry; it is not a rash treatment.':'After choosing your body-care option, address the smell left in your clothes. This fragrance-free detergent cleans fabric; it does not control odor on your skin.',
  'poise-light-pads':(a.triedCategories||[]).includes('pads')?'Pads or liners have not helped enough. If yours were period liners, these are designed specifically for light urine leaks. Compare absorbency and fit with what you already use.':'You mentioned little urine leaks. These thin pads absorb light bladder leakage inside your own underwear and help contain urine odor.',
  'depend-silhouette':(a.triedCategories||[]).includes('pads')?'Pads or liners have not worked for you. This pull-on underwear offers fuller leak coverage in a different format, with no added scent.':'For the urine leaks you selected, this pull-on underwear is an alternative to a pad. It offers fuller coverage if a light pad is not enough.',
  'frida-peri-bottle':hasLeaks(a)?'For freshening up after a leak, use this bottle to rinse the outside skin with plain lukewarm water. It lets you clean up gently without adding a scented wash.':hasIntimateWarning(a)?'You mentioned an intimate change or discomfort. This bottle lets you rinse the outside skin gently with plain water while you get the cause checked.':a.concerns.includes('outside')?'For sweat on your outer intimate skin, a gentle water rinse can be enough. This angled bottle makes that easier without another cleanser.':'While you work out where the intimate smell comes from, this bottle gives you a gentle way to rinse the outside skin with plain water.',
  'vaseline-original':hasLeaks(a)?'Leaks can leave outside skin in contact with urine. A thin layer of this plain petrolatum can help protect intact skin after gentle cleaning and drying.':'You selected rubbing or chafing on unbroken skin. This plain, fragrance-free jelly forms a protective layer on the outside skin where it rubs.',
  'revaree-original':'For the dryness you feel during the day, these hormone-free inserts offer regular vaginal moisture. They contain hyaluronic acid and are used at bedtime.',
  'replens-moisturizer':'For the daytime dryness you mentioned, this hormone-free gel offers a different format from a solid insert. It comes in prefilled, single-use applicators.',
  'uberlube':'You selected dryness or friction during sex. This unscented silicone lubricant adds slip when you need it, helping reduce rubbing during intimacy.',
  'hanes-cotton-briefs':hasLeaks(a)?'A fresh pair is useful after a leak or when underwear feels damp. These cotton-rich briefs are regular underwear, so pair them with a pad if you need absorption.':a.concerns.includes('outside')?'For the sweat you notice on outside skin, breathable underwear gives you a dry change when your current pair gets damp.':hasIntimateWarning(a)?'With an intimate change or discomfort, breathable underwear is a simple comfort choice while you get it checked. Choose a comfortable fit that does not rub.':'While you work out what is causing the intimate smell, breathable underwear is a simple comfort choice. These briefs do not treat the cause.',
  'utopia-washcloths':hasSkinWarning(a)?'Your skin is sore or irritated, so rubbing can make things worse. Use a clean, soft cloth to pat intact skin dry or for a cool compress.':hasLeaks(a)?'After rinsing off a leak, gently pat the outside skin dry with a clean cloth. These are washable, so use a fresh one each time.':a.concerns.includes('damp')?'You said your skin folds stay damp. These soft cotton cloths help you pat the folds dry gently after washing.':intimateArea(a)?'After a gentle water rinse, use a clean cloth to pat the outside skin dry without rubbing. Nothing goes inside the vagina.':a.concerns.includes('chafe')?'Where skin rubs, gentle drying avoids more friction. Use a fresh, soft cloth to pat the area dry after washing.':`After washing your ${bodyPlace==='body'?'body':bodyPlace+'s'}, use a fresh cloth to pat skin dry before getting dressed${a.area==='underarms'?' or applying an underarm product':''}. These soft cotton cloths are washable for daily use.`
 }[p.id]||p.fact;
 if(a.sensitivities.includes('reactive')&&p.gentle&&['cleanser','deodorant','vaginal_moisturizer'].includes(category))reason+=' You said products can dry or irritate your skin, so a simple, fragrance-free formula takes priority.';
 else if(a.sensitivities.includes('fragrance')&&p.fragranceFree&&!/fragrance|perfume|scent/.test(reason))reason+=' It also fits your preference to avoid fragrance.';
 return {role,reason};
}
function intimateArea(a){return ['outer_groin','vaginal_change','urine_leakage','unsure'].includes(a.area)||a.concerns.includes('outside');}
const joinNatural=items=>items.length<2?items[0]||'':items.slice(0,-1).join(', ')+' and '+items.at(-1);
export function selectedConcernText(a){
 if(a.area==='urine_leakage')return 'little bladder leaks';
 const labels={odor:a.area==='underarms'?'underarm smell':'odor that returns after washing',wetness:'underarm wetness',both:'underarm smell and wetness',damp:'skin that stays sweaty or damp',clothes:'smell lingering in your clothes',chafe:'skin rubbing or chafing',rash:'sore skin or a new rash',outside:'sweat on the outside skin',change:'a change in vaginal smell or discharge',urine:'little bladder leaks',dryness:'vaginal dryness during the day',friction:'dryness or friction during sex',symptoms:'discomfort or other intimate symptoms',unsure:'a smell you are not sure about'};
 return joinNatural(a.concerns.map(c=>labels[c]).filter(Boolean));
}
export function resultIntro(a,r){
 const both=a.concerns.includes('both'),mixed=hasLeaks(a)&&a.concerns.some(x=>['outside','change','symptoms','dryness','friction'].includes(x));
 const shown=new Set(r.recommendations.map(x=>x.product.category||'cleanser'));
 let title={sweat:both?'For underarm smell and wetness.':'For underarms that stay wet.',odor:'For underarm smell that bothers you.','odor-only':'Odor options without aluminum.','odor-unsure':'Not sure if it is sweat or smell?','odor-fallback':'Another way to tackle underarm smell.','wash-fallback':'A wash to compare with your usual one.','comfort-fallback':'A fresh change for everyday comfort.','cloth-fallback':'A gentler way to wash and dry.','rinse-fallback':'Freshen up with a gentle water rinse.',leaks:mixed?'Leak protection and gentler intimate care.':'For little leaks and the smell they leave.','comfort-intimate':'Gentle care while you check the change.','comfort-skin':'Give sore skin a gentler routine.','body-clothes':'Body-odor care first. Fresher clothes next.',damp:'For skin folds that stay damp.',external:'For sweat on your outer groin skin.',dryness:'More comfort when you feel dry.',friction:'Less friction, more comfortable intimacy.',chafe:'Protect the skin where it rubs.',wash:'For body odor that keeps coming back.'}[r.route];
 if(r.route==='wash'&&a.concerns.includes('unsure'))title='A simple start for body odor.';
 if(r.route==='odor-fallback'&&a.concerns.includes('wetness'))title='An option for underarm odor, rather than sweat.';
 const focus={sweat:'Start with sweat control, then compare options for washing and odor.',odor:'Compare a leave-on deodorant with the washing options below.','odor-only':'These picks avoid aluminum. They can help with smell, but will not reduce sweating.','odor-unsure':'These picks focus on odor. Choose wetness instead if reducing sweat is your priority.','odor-fallback':'Your earlier product is excluded; these picks cover other parts of your routine.','wash-fallback':'The products you ruled out are excluded. Compare the remaining option with yours.','comfort-fallback':'These are comfort choices, rather than a treatment for the cause.','cloth-fallback':'These picks focus on gentle cleaning and drying.','rinse-fallback':'A water rinse is an option without adding another cleanser.',leaks:mixed?'Compare leak protection and ways to freshen up gently.':'Compare a light pad, absorbent underwear and gentle cleanup options.','comfort-intimate':'These picks help with outside-skin comfort while you arrange a check.','comfort-skin':'These picks keep cleaning, drying and clothing care gentle.','body-clothes':'Start with a body cleanser. Laundry care comes afterward for odor left in fabric.',damp:'Start with moisture control where skin touches skin.',external:'Start with a gentle rinse; the optional cleanser is for surrounding body skin.',dryness:a.concerns.includes('friction')?'Compare regular moisturizers for daytime dryness and a lubricant for intimacy.':'Compare regular vaginal moisturizers for the dryness you selected.',friction:'A lubricant can reduce rubbing during sex. Persistent pain needs a separate check.',chafe:'A plain barrier is an option for unbroken outside skin.',wash:a.sensitivities.includes('reactive')?'Compare gentle, fragrance-free washes that suit skin prone to dryness or irritation.':'Compare the bar and liquid formulas below to find a wash you would like to try.'}[r.route];
 let tailoredFocus=focus;
 if(r.route==='wash')tailoredFocus=r.gentle?'These choices keep your preference for gentle, fragrance-free care in mind.':'Compare the cleanser options below, then choose the formula you prefer.';
 if(r.route==='leaks')tailoredFocus=mixed?'These choices cover your leaks and gentle cleanup.':'Choose the leak protection and cleanup options that suit your day.';
 if(r.route==='sweat'&&!shown.has('cleanser'))tailoredFocus='This antiperspirant focuses on reducing underarm sweat.';
 if(r.route==='odor'&&!shown.has('cleanser'))tailoredFocus='This leave-on deodorant focuses on underarm smell.';
 if(r.route==='external')tailoredFocus='Compare gentle ways to clean the outside skin without adding perfume.';
 if(r.fallback)tailoredFocus='These options fit the product and ingredient choices you made. '+({deodorant:'This deodorant focuses on smell and does not reduce sweating.',cleanser:'Compare this cleanser with the formula you have already tried.',rinse:'A plain-water rinse keeps cleanup gentle.',underwear:'A fresh, breathable change is an option for comfort.',cloth:'Gentle drying is one part of your daily care.'}[r.primary.category||'cleanser']||'');
 let description=`You mentioned ${selectedConcernText(a)||'body odor'}. ${tailoredFocus}`;
 if((a.triedCategories||[]).includes('soap')&&(r.primary.category||'cleanser')==='cleanser'&&r.primary.format==='liquid')description+=' Since bar soap has not helped, a liquid wash comes first.';
 if((a.triedCategories||[]).includes('pads')&&r.primary.format==='disposable_underwear')description+=' Since pads have not worked, absorbent underwear comes first.';
 return {title,description};
}
export function careMessage(a){
 const notes=[];
 if(hasIntimateWarning(a))notes.push('Get new vaginal odor, discharge, itching, burning or pain checked. Bleeding after menopause needs prompt medical advice. These products do not treat the cause.');
 if(hasSkinWarning(a))notes.push('Avoid scrubbing or adding active products to sore or broken skin. Get a new, persistent or worsening rash checked.');
 if(hasLeaks(a))notes.push(hasIntimateWarning(a)?'For ongoing leaks, ask about pelvic floor care too.':'For new or bothersome leaks, ask about pelvic floor care and treatment options. Painful urination, blood in urine or fever needs prompt medical advice.');
 if(!notes.length&&a.concerns.some(x=>['dryness','friction'].includes(x)))notes.push('If dryness or discomfort persists, ask about vaginal estrogen and other treatments. Stop any product that irritates.');
 if(!notes.length&&careReason(a)==='uncertain')notes.push('A new or persistent intimate smell is worth getting checked, especially with pain, itching, discharge or bleeding.');
 return notes.join(' ');
}
export function historyMessage(a,item){
 const type=productApproach(item.product),tried=a.triedCategories||[];
 if(item.revisitsCategory)return `You have already tried ${TRIED_CATEGORIES[type]?.[0].toLowerCase()||'this type of product'} without the result you wanted. Compare the formula and format with yours before trying another.`;
 if(type==='leak_underwear'&&tried.includes('pads'))return 'You said pads or liners have not helped. This changes the format to absorbent underwear.';
 if(type==='body_wash'&&tried.includes('soap'))return 'You said bar soap has not helped. This gives you a liquid formula to compare.';
 if(type==='soap'&&tried.includes('body_wash'))return 'You said body wash has not helped. This gives you a bar formula to compare.';
 return '';
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
