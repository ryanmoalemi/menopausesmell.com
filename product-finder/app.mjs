import {AREAS,SENSITIVITIES,ALLERGENS,CONCERNS,TRIED_CATEGORIES,triedOptions,productApproach,freshAnswers,concernKind,toggleExclusive,changeArea,careReason,routeAfterConcern,routeAfterSensitivity,resultFor,eligibleProducts,amazonURL,validateCatalog,finderPath} from './engine.mjs?v=25738faafac4';
const root=document.querySelector('#finder'),dialog=document.querySelector('#finder-dialog'),dialogContent=document.querySelector('#dialog-content'),announcer=document.querySelector('#announcer');
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let answers=freshAnswers(),step='area',catalog=null,config=null,failed=false,editing=false,notice='',reduced=systemMotion.matches,opener=null,trail=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<img class="icon" src="./assets/icons/${n}.svg" alt="" aria-hidden="true">`;
const areaLabel=()=>AREAS.find(x=>x[0]===answers.area)?.[1]||'Not chosen';
const concernLabels={odor:'Odor',wetness:'Wetness',both:'Odor and wetness',damp:'Damp skin',clothes:'Clothes hold odor',rash:'Sore or broken skin',outside:'Outside skin',change:'New vaginal change',urine:'Urine or leaks',symptoms:'Other symptoms',unsure:'Not sure'};
const sensitivityLabels={fragrance:'Avoid fragrance',reactive:'Dry / reactive skin',allergy:'Ingredient allergy',irritated:'Irritated skin now',none:'No allergies',unsure:'Not sure'};
const selectedProducts=()=>catalog?.filter(p=>answers.tried.includes(p.id))||[];
const shortName=p=>({'lume-unscented-wash':'Lume wash','mirai-unscented-bar':'Mirai soap','vanicream-gentle-body-wash':'Vanicream wash','uro-capsules':'URO capsules','uro-gummies':'URO gummies'}[p.id]||p.name);
function chips({all=false,compact=false}={}){
 const values=answers.area?[[areaLabel(),'']]:[];
 if(!compact)answers.concerns.forEach(x=>values.push([concernLabels[x],'concern']));
 answers.sensitivities.filter(x=>!['none','unsure'].includes(x)).forEach(x=>values.push([sensitivityLabels[x],'']));
 if(all){answers.triedCategories.filter(x=>x!=='nothing').forEach(x=>values.push([TRIED_CATEGORIES[x]?.[0]+' tried','']));selectedProducts().forEach(p=>values.push([shortName(p)+' tried','']));}
 return `<div class="chips">${values.map(([t,c])=>`<span class="chip ${c}">${icon('check')}${esc(t)}</span>`).join('')}</div>`;
}
function body(interactive=false){
 const kind=({underarms:'underarms',body_folds:'folds',outer_groin:'groin',vaginal_change:'intimate',urine_leakage:'intimate'})[answers.area]||'neutral';
 return `<div class="body-picture"><img class="body-art" src="./assets/illustrations/body-${kind}.svg" alt="" aria-hidden="true">${interactive?'<button class="hotspot hotspot-upper" data-action="hotspot" data-value="underarms" aria-label="Choose underarms on body outline"></button><button class="hotspot hotspot-middle" data-action="hotspot" data-value="body_folds" aria-label="Choose body or skin folds on body outline"></button><button class="hotspot hotspot-pelvic" data-action="pelvic" aria-label="Choose the source around the groin or intimate area"></button>':''}</div>`;
}
function progress(){
 const path=finderPath(answers),done=step==='result',current=done?path.length:Math.max(0,path.indexOf(step));
 const labels={area:['Area','body'],concern:['Concern','drop'],sensitivity:['Skin','leaf'],tried:['Tried','bottle']};
 return `<div class="journey-progress"><div class="progress-caption"><strong>${done?'Your match is ready':current===0?'Let’s find your starting point':current===path.length-1?'One last step':'Making it personal'}</strong><span>${done?'Answers complete':`${current+1} of ${path.length}`}</span></div><ol class="progress" aria-label="${done?'Completed finder steps':`Question ${current+1} of ${path.length}`}">${path.map((id,i)=>`<li class="${i===current?'current':i<current?'done':''}" ${i===current?'aria-current="step"':''}><span class="step-track"></span><span class="step-node">${icon(i<current?'check':labels[id][1])}</span><span class="stage-label">${labels[id][0]}</span></li>`).join('')}</ol></div>`;
}
function backButton(){return `<button class="btn secondary back" data-action="back" ${!trail.length&&step==='area'?'disabled aria-label="Back, you are at the first question"':''}>${icon('arrow')}<span>Back</span></button>`;}
function choice(group,value,label,{multi=false,art='',checked=false}={}){
 const help=value==='body_folds'?'Body skin, including under breasts and other skin folds':value==='outer_groin'?'Sweat on surrounding outer skin, separate from vaginal changes':label;
 return `<label class="choice ${multi?'multi':''}" for="${group}-${value}"><input id="${group}-${value}" type="${multi?'checkbox':'radio'}" name="${group}" value="${esc(value)}" aria-label="${esc(help)}" ${checked?'checked':''}>${art?icon(art):''}<span class="choice-label">${esc(label)}</span><span class="mark">${icon('check')}</span></label>`;
}
function footer(enabled,label='Continue'){return `<div class="question-footer">${backButton()}<button class="btn primary" data-action="next" ${enabled?'':'disabled'}><span class="btn-label">${label}</span>${icon('arrow')}</button></div>`;}
function question(title,content,cls='',intro=''){
 const split=content.lastIndexOf('<div class="question-footer">');
 root.innerHTML=`<section class="question-wrap ${cls}">${intro}${progress()}<div class="step-content">${notice?`<p class="inline-notice" role="status">${esc(notice)}</p>`:''}<h1 id="question-heading" tabindex="-1">${title}</h1>${content.slice(0,split)}</div>${content.slice(split)}</section>`;
}
function summary(){return `<div class="concern-summary">${body()}<div><p class="summary-label">Your starting point</p>${chips()}</div></div>`;}
function productChoice(p,search=false){
 const prefix=search?'search':'tried';
 return `<label class="choice multi ${search?'search-choice':'product-choice'}" for="${prefix}-${p.id}"><input id="${prefix}-${p.id}" type="checkbox" name="tried" value="${p.id}" ${answers.tried.includes(p.id)?'checked':''} aria-label="${esc(p.name+' '+p.variant)}"><span class="photo-well ${p.id==='mirai-unscented-bar'?'tactile':''}"><img class="product-image" src="${p.image}" alt="${esc(p.name+' '+p.variant)}"></span><span class="choice-label">${esc(p.name)}<span class="variant">${esc(p.variant)}</span></span><span class="mark">${icon('check')}</span></label>`;
}
function render({focus=false,restoreId=null}={}){
 if(failed){renderError();return;}
 if(step==='area'){
  question('Where do you notice the smell?',`<p class="helper">Tap an area or the body outline.</p><div class="area-grid"><div class="body-pillar">${body(true)}</div><fieldset class="choices"><legend class="sr-only">Choose the area where you notice the smell</legend>${AREAS.map(([v,l,i])=>choice('area',v,l,{art:i,checked:answers.area===v})).join('')}</fieldset></div>${footer(!!answers.area)}`,'area-screen','<div class="finder-introduction"><p class="intro-title">Stop guessing what to try for menopause odor.</p><p>Get product recommendations matched to your odor concern, skin sensitivities and what hasn’t worked for you.</p></div>');
 }else if(step==='concern'){
  const kind=concernKind(answers),under=kind==='underarms';
  const [title,help]=({
   underarms:['Smell, sweating, or both?',''],
   body_folds:['Body odor, dampness, or irritation?','Think about your body skin and skin folds. Select all that apply.'],
   outer_groin:['What’s bothering you around your groin?','Think about the outer skin and skin creases. Select all that apply.'],
   vaginal_change:['What’s changed in your intimate area?','Choose any changes in smell, discharge, comfort or bladder leaks.'],
   unsure:['What have you noticed about the smell?','Choose what you recognize. Select all that apply.']
  })[answers.area];
  question(title,`${help?`<p class="helper">${help}</p>`:''}${summary()}<fieldset class="choices"><legend class="sr-only">${title}</legend>${CONCERNS[kind].map(([v,l])=>choice('concerns',v,l,{multi:!under,checked:answers.concerns.includes(v)})).join('')}</fieldset>${footer(!!answers.concerns.length)}`,'concern-screen');
 }else if(step==='sensitivity'){
  question('Any allergies or sensitive skin?',`<p class="helper">Select all that apply.</p>${chips()}<fieldset class="choices"><legend class="sr-only">Sensitivities and ingredients to avoid</legend>${SENSITIVITIES.map(([v,l,i])=>choice('sensitivities',v,l,{multi:true,art:i,checked:answers.sensitivities.includes(v)})).join('')}</fieldset>${answers.sensitivities.includes('allergy')?`<button class="allergy-picker" data-action="allergens">${icon('shield')}<span>${answers.allergies.length?esc(answers.allergies.map(x=>ALLERGENS.find(y=>y[0]===x)?.[1]).join(', ')):'Choose the ingredient(s) to avoid'}</span>${icon('chevron')}</button>`:''}${footer(!!answers.sensitivities.length)}`,'sensitivity-screen');
 }else if(step==='tried'){
  question("What hasn’t worked for you?",`<p class="helper">Select anything you’ve tried that hasn’t helped.</p><fieldset class="category-picker"><legend class="sr-only">Types of products or routines you have tried</legend>${triedOptions(answers).map(id=>{
   const [label,art,tone]=TRIED_CATEGORIES[id];return `<label class="category-tile tone-${tone}" for="category-${id}"><input type="checkbox" id="category-${id}" name="tried-category" value="${id}" ${answers.triedCategories.includes(id)?'checked':''}><span class="category-art">${icon(art)}</span><span class="category-label">${label}</span><span class="mark">${icon('check')}</span></label>`;
  }).join('')}</fieldset><p class="category-hint">${answers.triedCategories.filter(x=>x!=='nothing').length?answers.triedCategories.filter(x=>x!=='nothing').length+' selected · We’ll keep these in mind.':'Select all that apply.'}</p>${footer(!!answers.triedCategories.length,'Find my match')}`,'tried-screen category-screen');
 }else if(step==='result')renderResult();
 if(focus){window.scrollTo({top:0,behavior:'instant'});document.querySelector('h1')?.focus({preventScroll:true});}
 else if(restoreId)document.getElementById(restoreId)?.focus({preventScroll:true});
}
function next(){
 if(step==='sensitivity'&&answers.sensitivities.includes('allergy')&&!answers.allergies.length){openAllergens();return;}
 notice='';rememberStep();
 if(step==='area')step=answers.area==='urine_leakage'?'sensitivity':'concern';
 else if(step==='concern')step=routeAfterConcern(answers);
 else if(step==='sensitivity')step=routeAfterSensitivity(answers);
 else if(step==='tried')step='result';
 if(editing&&step==='sensitivity'&&answers.sensitivities.length)step=routeAfterSensitivity(answers);
 if(editing&&step==='tried'&&answers.triedCategories.length)step='result';
 if(step==='result'){editing=false;announcer.textContent='Your next step is ready. You can edit your answers.';}
 render({focus:true});
}
function rememberStep(){trail.push({step,resultAnswers:step==='result'?structuredClone(answers):null});}
function back(){
 const previous=trail.pop();
 if(!previous||previous.step==='area'){startOver();return;}
 notice='';step=previous.step;if(previous.resultAnswers)answers=previous.resultAnswers;editing=false;render({focus:true});
}
const categoryNames={cleanser:'Cleansing option',antiperspirant:'For sweat control',deodorant:'For odor control',moisture:'For damp skin folds',laundry:'For clothes holding odor',probiotic:'Optional supplement',bladder:'For light bladder leaks',underwear:'Everyday comfort',cloth:'For gentle skin care'};
function amazonButton(p){return `<a class="btn result-buy" href="${esc(amazonURL(p,config.tracking_id))}" target="_blank" rel="sponsored noopener noreferrer" aria-label="Shop ${esc(p.name+' '+p.variant)} on Amazon">Buy on Amazon ${icon('arrow')}</a>`;}
function commerceNote(p){return `<p class="commerce-note">As an Amazon Associate I earn from qualifying purchases.${p.exactListingVerified?'':' Opens an Amazon search.'}</p>`;}
function productCard(p,{compact=false,buy=true,match=null}={}){
 const category=p.category||'cleanser';
 return `<article class="shop-card tone-${category} ${compact?'compact-shop-card':''}"><div class="shop-photo ${p.photoStyle==='lifestyle'?'lifestyle-photo':''}"><span class="photo-label">${esc(categoryNames[category])}</span><img src="${p.image}" alt="${esc(p.name+' '+p.variant)}" width="600" height="600"></div><div class="shop-copy"><p class="eyebrow">${esc(categoryNames[category])}</p><h2>${esc(p.name)}</h2><p class="shop-variant">${esc(p.variant)}</p>${match?matchDetails(p,match):''}<p class="shop-fit">${esc(p.fact)}</p>${buy?amazonButton(p):'<p class="restricted-note">Review the ingredients with your pharmacist before choosing this product.</p>'}<button class="product-details" data-action="details" data-value="${p.id}">Ingredients &amp; how to use</button><p class="shop-caution">${esc(p.caveat)}</p>${buy?commerceNote(p):''}</div></article>`;
}
function approaches(){
 const types=answers.area==='underarms'?[['deodorants','Deodorants','bottle'],['antiperspirants','Antiperspirants','shield'],['cleansers','Body washes','bottle'],['home','At-home care','leaf']]:[['cleansers','Gentle cleansers','bottle'],['moisture','Moisture care','leaf'],['probiotics','Probiotics','capsule'],['home','At-home care','leaf']];
 return `<section class="approaches"><h2>Compare another approach</h2><div class="approach-grid">${types.filter(([id])=>id==='home'||eligibleProducts(answers,catalog,config.preview,({deodorants:'deodorant',antiperspirants:'antiperspirant',cleansers:'cleanser',moisture:'moisture',probiotics:'probiotic'})[id]).length).map(([id,label,i])=>`<button class="approach-card" data-action="approach" data-value="${id}">${icon(i)}<span>${label}${icon('chevron')}</span></button>`).join('')}</div></section>`;
}
function resultFooter(){return '<footer class="result-footer"><button data-action="start-over">Start over</button><button data-action="disclosure">Affiliate disclosure</button><button data-action="privacy">About your answers</button></footer>';}
function matchDetails(p,r){
 const badges=[];
 if(p.fragranceFree)badges.push(['flower','Fragrance-free']);
 if(p.aluminumFree===true)badges.push(['leaf','Aluminum-free']);
 if((answers.triedCategories||[]).some(x=>x!=='nothing')&&!r.revisitsCategory)badges.push(['spark','Another approach']);
 if(r.revisitsCategory)badges.push(['bottle','Formula to compare']);
 if(!badges.length)badges.push(['check',categoryNames[p.category||'cleanser']]);
 return `<div class="match-details"><p class="match-mini-title">${icon('spark')} Your first option</p><div class="match-badges">${badges.slice(0,2).map(([i,t])=>`<span>${icon(i)}${t}</span>`).join('')}</div>${r.revisitsCategory?`<p class="match-history">You’ve tried ${esc(TRIED_CATEGORIES[r.triedCategory]?.[0].toLowerCase()||'this type')}. Compare this formula with yours.</p>`:''}<button class="match-why" data-action="match-why">Why this fits your answers ${icon('chevron')}</button></div>`;
}
function personalContext(r){
 const tried=answers.triedCategories.filter(x=>x!=='nothing').map(x=>TRIED_CATEGORIES[x]?.[0].toLowerCase()).filter(Boolean);
 if(!tried.length)return '';
 if(r.revisitsCategory){const label=TRIED_CATEGORIES[r.triedCategory]?.[0].toLowerCase()||'this type';return `You’ve tried ${label}. Compare this formula with yours before buying; we don’t know which one you used.`;}
 const before=tried.length>2?tried.slice(0,2).join(', ')+' and more':tried.join(' and ');
 const after=({antiperspirant:'sweat control',deodorant:'leave-on odor control',cleanser:r.primary.format==='bar'?'a bar instead':'a rinse-off wash',moisture:'wicking moisture away',laundry:'the clothes holding odor',bladder:'absorbing light bladder leaks',underwear:'a fresh, breathable change',cloth:'gentle skin care'})[r.primary.category||'cleanser'];
 return `You’ve tried ${before}. This option focuses on ${after}.`;
}
function renderResult(){
 const r=resultFor(answers,catalog,config.preview);
 if(r.kind!=='product'){renderState(r);return;}
 const p=r.primary;
 const careNotes={urine:'For new or bothersome leaks, see a clinician. Painful urination, blood in urine or fever needs prompt medical advice.',vaginal:'Get new odor, discharge, itching, burning, pain or bleeding checked. Comfort items do not treat the cause.',skin:'Avoid scrubbing or adding actives to irritated skin. Get advice for broken skin or a new, persistent or worsening rash.',uncertain:'If the smell is new, persistent or comes with other symptoms, a clinician can help identify the cause.'};
 const notes=[r.care?careNotes[r.care]:'',r.allergyReview?'Your allergy isn’t fully identified here. Check the exact label with a pharmacist before using this option.':answers.sensitivities.includes('allergy')?'We filtered the ingredients you selected using the labels we checked. Recheck the exact label before use.':''].filter(Boolean);
 const copy={
  sweat:['Start with sweat control.','You chose '+(answers.concerns.includes('both')?'smell and wetness.':'underarm wetness.')+' Start with a fragrance-free antiperspirant for sweat control.','An option for the wetness you described.','Use on dry underarms and follow the label. If sweating is new, severe or persistent, speak with a clinician.'],
  odor:['Start with odor control.','You said the smell is the problem. This fragrance-free deodorant targets underarm odor without adding another scent.','A simple option for the smell you described.','Apply a small amount to clean underarms. This is deodorant, so it will not stop sweating.'],
  'odor-only':['An aluminum-free option for smell.','You’re avoiding aluminum. This deodorant can help with smell, but it will not reduce the wetness you selected.','Fits your aluminum-free preference.','Dry your underarms well and change damp clothes. For less sweating, you would need a different type of product.'],
  'odor-unsure':['Start with a simple deodorant.','You’re unsure whether it’s smell or sweat. This fragrance-free gel is an option for smell; it does not reduce wetness.'],
  'odor-fallback':['Try a different part of your routine.','We left out the products and ingredients you ruled out. This deodorant is an option for smell, but it does not reduce sweating.'],
  'wash-fallback':['A fresh option for washing.','Your earlier choices are excluded. This cleanser fits the washing part of your routine; it does not stop sweating.'],
  'comfort-fallback':['An everyday comfort option.','We left out the products you ruled out. Breathable underwear gives you a fresh change when things feel damp. It does not treat the cause of odor.'],
  'cloth-fallback':['Keep your next step gentle.','With your earlier choices ruled out, a clean cotton cloth is a simple option for gently patting intact skin dry.'],
  leaks:['Help for little leaks.','These fragrance-free pads absorb the light bladder leaks you described and help contain odor.'],
  'comfort-intimate':['A fresh, comfortable change.','For intimate odor or a change you’re unsure about, breathable cotton underwear is a comfort option while you get the cause checked.'],
  'comfort-skin':['A softer next step for your skin.','You said your skin is sore or irritated. A clean cotton cloth with cool water can comfort intact skin without adding another scented product.'],
  clothes:['Give the clothes a fresh start.','You said the smell seems to stay in your clothes. Try a fragrance-free laundry detergent before adding more products to your skin.','For the fabric holding onto the smell.','Use the amount on the bottle, follow the garment care label, and dry clothes fully.'],
  damp:['Help damp skin folds stay dry.','You said the skin stays sweaty or damp. For areas where skin touches skin, this fabric helps move moisture away.','For damp folds, including under the breasts.','Start with clean, dry skin and follow the fabric instructions. Change damp clothing, too.'],
  external:['Keep outside-skin care gentle.','For sweat on outer groin skin, start gently. If you want a rinse-off cleanser for that outer body skin, this fragrance-free option fits.','An optional cleanser for outer body skin.','Water is enough for vulva care. Keep this cleanser off the vulva and out of the vagina. Dry the surrounding skin gently.'],
  wash:[r.gentle?'A gentle wash to start with.':'A washing option that fits.','You said the smell comes back after washing.'+(r.gentle?' A fragrance-free cleanser keeps the washing step gentle.':' This rinse-off option is a place to start for body skin.'),'For the washing part of your routine.','Rinse well and gently pat dry. A cleanser alone may not solve persistent odor.']
 }[r.route];
 root.innerHTML=`<div class="result-layout ${r.care?'has-care':''}">${progress()}<div class="step-content result-main"><section class="result-intro"><div class="result-heading-row"><p class="reveal-badge">${icon('spark')} Selected for you</p><button class="edit-button" data-action="edit">Edit answers</button></div><h1 tabindex="-1">${copy[0]}</h1><p class="result-reason">${copy[1]}</p>${chips()}</section>${productCard(p,{match:r})}${notes.length?`<aside class="care-note"><strong>A quick note</strong><p>${notes.map(esc).join(' ')}</p></aside>`:''}</div><div class="result-actions">${backButton()}<button class="btn secondary" data-action="more-options">${r.alternatives.length?'Compare options':'Other options'} ${icon('chevron')}</button></div>${resultFooter()}</div>`;
}
function renderState(){
 root.innerHTML=`<section class="state-result">${progress()}<div class="step-content"><h1 tabindex="-1">You’ve ruled out these options.</h1><p class="helper">We won’t recommend something you said did not work or contains an ingredient you need to avoid.</p>${chips()}<button class="btn" data-action="edit">Review my choices</button></div><div class="result-actions">${backButton()}<button class="btn secondary" data-action="start-over">Start over</button></div>${resultFooter()}</section>`;
}
function openAllergens(){
 openDialog('What do you need to avoid?',`<p class="helper">Choose what you know. We’ll filter the products, then you can check the current label before buying.</p><fieldset class="choices allergen-choices"><legend class="sr-only">Ingredients to avoid</legend>${ALLERGENS.map(([v,l])=>choice('allergens',v,l,{multi:true,checked:answers.allergies.includes(v)})).join('')}</fieldset><button class="btn" data-action="allergens-done">Use these choices</button>`);
}
function startOver(){
 if(dialog.open)closeDialog();
 answers=freshAnswers();step='area';trail=[];editing=false;notice='';opener=null;dialogContent.innerHTML='';
 announcer.textContent='Started over. All previous answers cleared.';render({focus:true});
}
function triedNotes(){
 openDialog('What didn’t work?',`<p class="helper">Optional. The selected products are already excluded from your recommendations.</p>${selectedProducts().map(p=>`<section class="failure-details"><h3>${esc(shortName(p))}</h3><fieldset class="choices"><legend class="sr-only">Why ${esc(p.name)} did not help</legend>${[['odor',"Didn't help the smell"],['sweat',"Didn't help the sweating"],['irritated','Irritated my skin'],['disliked',"Didn't like the scent or texture"]].map(([v,l])=>choice('reason-'+p.id,v,l,{multi:true,checked:(answers.reasons[p.id]||[]).includes(v)})).join('')}</fieldset></section>`).join('')}<button class="btn" data-action="close">Done</button>`);
}
function moreOptions(){
 const r=resultFor(answers,catalog,config.preview);
 openDialog('Explore your options',`${r.route==='sweat'||r.route==='odor-only'?`<label class="choice multi aluminum-choice"><input id="aluminum-preference" type="checkbox" name="aluminum" ${answers.aluminumFree?'checked':''}><span class="choice-label">I prefer aluminum-free options</span><span class="mark">${icon('check')}</span></label>`:''}${r.alternatives?.length?`<h3>Another option that fits</h3>${r.alternatives.map(p=>productCard(p,{compact:true})).join('')}`:''}${approaches()}<button class="text-link" data-action="another">Start over ${icon('chevron')}</button><button class="btn secondary" data-action="close">Back to my result</button>`);
}
function openDialog(title,html){opener=document.activeElement;dialogContent.innerHTML=`<div class="dialog-header"><h2 id="dialog-title">${title}</h2><button class="close-dialog" data-action="close" aria-label="${title==='Your answers'?'Close answer editor':'Close dialog'}">${icon('close')}</button></div>${html}`;dialog.showModal();}
function closeDialog(){dialog.close();opener?.focus({preventScroll:true});}
function openEditor(){
 const values=[['area','Your area',areaLabel()],['concern','Your concern',answers.concerns.map(x=>concernLabels[x]).join(', ')||'Not chosen'],['sensitivity','Sensitivities',answers.sensitivities.map(x=>sensitivityLabels[x]).join(', ')||'Not chosen'],['tried','Already tried',answers.triedCategories.map(x=>TRIED_CATEGORIES[x]?.[0]).filter(Boolean).join(', ')||'Not chosen']];
 openDialog('Your answers',`<p class="helper">Choose an answer to change. Going back to your area clears all answers.</p>${values.map(([s,l,v])=>`<button class="edit-row" data-action="edit-step" data-value="${s}"><span><small>${l}</small><strong>${esc(v)}</strong></span>${icon('chevron')}</button>`).join('')}<button class="btn" data-action="close">Back to my result</button>`);
}
function openSearch(){openDialog('Find a product you tried',`<p class="helper">Match the product and formula. A wash and a deodorant are different products.</p><label class="sr-only" for="product-search">Search products</label><input type="search" class="plain-input" id="product-search" placeholder="Search by brand or product" autocomplete="off"><div class="search-results">${catalog.map(p=>productChoice(p,true)).join('')}</div><button class="text-link" data-action="unknown-product">I can't find the exact one</button><button class="btn" data-action="search-done">Done</button>`);document.querySelector('#product-search').focus();}
function details(id){
 const p=catalog.find(x=>x.id===id);if(!p)return;
 const excluded=!eligibleProducts(answers,catalog,config.preview,p.category||'cleanser').some(x=>x.id===id);
 openDialog('Product details',`<div class="details-product"><img src="${p.image}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><p class="small-note">${esc(p.variant)}</p></div></div><p>${esc(p.caveat)}</p><h3 class="field-label">Ingredients</h3><p class="ingredients">${esc(p.ingredients||'Current ingredients are not verified.')}</p><p class="small-note">${esc(p.labelDirections||'Check the current product label for use and warnings.')}</p><p class="small-note">Check the label on the product you buy. Formulas and packaging can change.</p>${excluded?'<p class="restricted-note">This item is not a personalized match for your current answers.</p>':amazonButton(p)}${excluded?'':commerceNote(p)}<button class="btn secondary" data-action="close">Back to my result</button>`);
}
function approach(id){
 if(id==='home'){
  openDialog('Simple steps at home','<div class="free-step"><h3>Keep it gentle</h3><p>Wash body skin gently, rinse well, and pat it dry. Use water for vulva care and never wash inside the vagina.</p></div><div class="free-step"><h3>Change what stays damp</h3><p>Change sweaty clothing and dry skin folds gently. Let clothes dry fully before wearing them again.</p></div><div class="free-step"><h3>Try one change at a time</h3><p>Avoid layering acids, harsh washes and deodorants. Stop a product that irritates your skin.</p></div><button class="btn" data-action="close">Back to my result</button>');return;
 }
 const [category,title,description]={
  deodorants:['deodorant','Compare deodorant','For underarm smell. These do not reduce sweating.'],
  antiperspirants:['antiperspirant','Compare sweat control','For underarm wetness. Antiperspirants contain aluminum.'],
  cleansers:['cleanser','Compare gentle cleansers','For the washing step on external body skin.'],
  moisture:['moisture','Compare moisture care','For damp areas where skin touches skin.'],
  probiotics:['probiotic','Considering a probiotic?','An optional oral supplement to compare. This is not a treatment for new vaginal odor, infection, underarm odor or sweating.']
 }[id];
 const options=eligibleProducts(answers,catalog,config.preview,category).slice(0,3);
 openDialog(title,`<p class="helper">${description}</p>${options.length?options.map(p=>productCard(p,{compact:true})).join(''):`<div class="state-box gold"><h3>No option fits these answers.</h3><p>${answers.aluminumFree&&category==='antiperspirant'?'You selected aluminum-free. We have kept that preference in place.':'Your body area, sensitivities and products you have already tried are still included.'}</p></div>`}<button class="btn secondary" data-action="close">Back to my result</button>`);
}
function browseProductDetails(){
 const review=catalog.filter(p=>p.labelVerified&&(p.candidate||p.browseEligible)&&!answers.tried.includes(p.id));
 openDialog('Product photos & ingredients',`<p class="helper">These are product details to review, not allergy-screened recommendations.</p><div class="ingredient-review">${review.map(p=>`<button class="ingredient-product" data-action="details" data-value="${p.id}"><img src="${p.image}" alt=""><span><strong>${esc(p.name)}</strong><small>${esc(p.variant)}</small><span>Review ingredients ${icon('chevron')}</span></span></button>`).join('')}</div><button class="btn secondary" data-action="close">Keep my answers</button>`);
}
function careNotes(){openDialog('What to tell your clinician',`<p class="helper">You can use this short summary when you ask for advice.</p>${chips({all:true})}<ul class="care-list"><li>When the smell, discharge, rash or leakage started.</li><li>Any pain, burning, itching, bleeding or fever.</li><li>Products or medicines you recently started, and any allergies.</li><li>What you have already tried and whether it irritated your skin.</li></ul><button class="btn" data-action="close">Back to my result</button>`);}
function disclosure(){openDialog('About Amazon links','<p>As an Amazon Associate I earn from qualifying purchases.</p><p>Product choices are filtered using the answers you give. We do not take payment to change your answers or include a product you have ruled out.</p><p>Check the current product label, formula, pack size, seller and price on Amazon before ordering.</p><button class="btn" data-action="close">Back to the finder</button>');}
function privacy(){openDialog('About your answers','<p class="helper">Your selections stay in memory in this browser tab. Refreshing or closing the page clears them.</p><p>We do not send finder answers to analytics, advertising services or Amazon. This finder loads its fonts and product data from this site.</p><p class="small-note">Amazon links contain only a product identifier or search and our affiliate tag. Hosting providers and websites you choose to visit have their own privacy practices.</p><button class="btn" data-action="close">Got it</button>');}
function updateMotion(){document.documentElement.classList.toggle('reduce-motion',reduced);document.querySelectorAll('[data-action="motion"],#menu-motion').forEach(b=>{b.setAttribute('aria-pressed',String(reduced));b.textContent=reduced?'Motion reduced':'Reduce motion';});}
function toggleMotion(){reduced=systemMotion.matches||!reduced;updateMotion();announcer.textContent=reduced?'Reduced motion enabled.':'Standard motion enabled.';}
function setArea(area){notice='';answers=changeArea(answers,area);}
function handleChange(e){
 const t=e.target;if(!(t instanceof HTMLInputElement))return;
 if(t.name==='area')setArea(t.value);
 else if(t.name==='concerns')answers.concerns=concernKind(answers)==='underarms'?[t.value]:toggleExclusive(answers.concerns,t.value,['unsure']);
 else if(t.name==='sensitivities'){answers.sensitivities=toggleExclusive(answers.sensitivities,t.value);if(!answers.sensitivities.includes('allergy'))answers.allergies=[];}
 else if(t.name==='tried-category'){answers.triedCategories=toggleExclusive(answers.triedCategories,t.value,['nothing']);}
 else if(t.name==='allergens'){answers.allergies=toggleExclusive(answers.allergies,t.value,[]);return;}
 else if(t.name==='tried'){
  answers.tried=toggleExclusive(answers.tried,t.value,['nothing','unknown']);
  for(const id of Object.keys(answers.reasons))if(!answers.tried.includes(id))delete answers.reasons[id];
  if(!answers.tried.includes('unknown'))answers.unknownProduct='';
  if(dialog.open){dialog.querySelectorAll('input[name="tried"]').forEach(x=>x.checked=answers.tried.includes(x.value));return;}
 }else if(t.name.startsWith('reason-')){const id=t.name.slice(7);answers.reasons[id]=toggleExclusive(answers.reasons[id]||[],t.value,[]);return;}
 else if(t.name==='aluminum'){answers.aluminumFree=t.checked;render();moreOptions();return;}
 else return;
 render({restoreId:t.id});
}
function handleAction(e){
 const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,v=b.dataset.value;
 if(a==='next')next();else if(a==='back')back();else if(a==='edit')openEditor();else if(a==='close')closeDialog();else if(a==='motion')toggleMotion();
 else if(a==='hotspot'){setArea(v);render({restoreId:'area-'+v});announcer.textContent=areaLabel()+' selected.';}
 else if(a==='pelvic')openDialog('Which area do you mean?',`<p class="helper">Choose the source. The outline alone cannot tell the difference.</p>${AREAS.filter(x=>['outer_groin','vaginal_change','urine_leakage'].includes(x[0])).map(([id,l])=>`<button class="edit-row" data-action="pelvic-choice" data-value="${id}">${l}${icon('chevron')}</button>`).join('')}`);
 else if(a==='pelvic-choice'){setArea(v);closeDialog();render({restoreId:'area-'+v});}
 else if(a==='edit-step'){
  if(v==='area'||(v==='concern'&&answers.area==='urine_leakage')){startOver();return;}
  closeDialog();rememberStep();step=v;editing=true;render({focus:true});
 }
 else if(a==='another'||a==='start-over')startOver();
 else if(a==='allergens')openAllergens();
 else if(a==='allergens-done'){if(!answers.allergies.length)answers.allergies=['other'];closeDialog();render();}
 else if(a==='search')openSearch();else if(a==='search-done'){closeDialog();render({restoreId:selectedProducts()[0]?'tried-'+selectedProducts()[0].id:null});}
 else if(a==='unknown-product'){answers.unknownProduct=document.querySelector('#product-search').value.trim().slice(0,160);answers.tried=['unknown'];answers.reasons={};closeDialog();render({restoreId:'tried-unknown'});}
 else if(a==='routine'){answers.tried=toggleExclusive(answers.tried,'routine',['nothing','unknown']);render();if(answers.tried.includes('routine'))openDialog('At-home remedy or routine',`<p class="helper">Add a note if you want. This stays in your browser tab.</p><label for="routine-detail">What did you try? (optional)</label><textarea class="plain-input" id="routine-detail" maxlength="240" rows="3">${esc(answers.routine)}</textarea><button class="btn" data-action="routine-done">Done</button>`);}
 else if(a==='routine-done'){answers.routine=document.querySelector('#routine-detail').value.trim();closeDialog();render();}
 else if(a==='general-browse')browseProductDetails();
 else if(a==='match-why'){const r=resultFor(answers,catalog,config.preview);openDialog('Why this was selected for you',`${chips({all:true})}<p>${esc(r.primary.fact)}</p>${personalContext(r)?`<p>${esc(personalContext(r))}</p>`:''}<p class="small-note">${esc(r.primary.caveat)}</p><button class="btn" data-action="close">Back to my match</button>`);}
 else if(a==='tried-notes')triedNotes();else if(a==='more-options')moreOptions();
 else if(a==='clarify'){answers.concerns=[v];render({focus:true});}
 else if(a==='care-notes')careNotes();else if(a==='disclosure')disclosure();
 else if(a==='details')details(v);else if(a==='approach')approach(v);else if(a==='privacy')privacy();else if(a==='retry')load();
}
function renderError(){root.innerHTML='<section class="state-result"><h1 tabindex="-1">Your result could not load.</h1><p class="helper">Your answers are still here.</p><button class="btn" data-action="retry">Try again</button></section>';}
async function load(){
 try{
  const [a,b]=await Promise.all([fetch('./catalog.json',{cache:'no-store'}),fetch('./config.json',{cache:'no-store'})]);
  if(!a.ok||!b.ok)throw Error('Unavailable');catalog=validateCatalog(await a.json());config=await b.json();
  if(config.tracking_id!=='menopausewash-20')throw Error('Invalid configuration');failed=false;render();
 }catch{failed=true;renderError();}
}
root.addEventListener('change',handleChange);root.addEventListener('click',handleAction);dialog.addEventListener('change',handleChange);dialog.addEventListener('click',handleAction);
dialog.addEventListener('input',e=>{if(e.target.id==='product-search'){const q=e.target.value.toLowerCase().trim(),found=catalog.filter(p=>(p.name+' '+p.variant).toLowerCase().includes(q));dialog.querySelector('.search-results').innerHTML=found.length?found.map(p=>productChoice(p,true)).join(''):'<p>No exact product found. You can continue without guessing the formula.</p>';}});
dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const c=[...dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(x=>!x.disabled&&x.getClientRects().length),first=c[0],last=c.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}});
dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
const menuToggle=document.querySelector('#menu-toggle'),menu=document.querySelector('#finder-menu');
function closeMenu(){menu.hidden=true;menuToggle.setAttribute('aria-expanded','false');}
menuToggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuToggle.setAttribute('aria-expanded',String(!menu.hidden));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuToggle.focus();}});
document.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest('#finder-menu')&&!e.target.closest('#menu-toggle'))closeMenu();});
document.querySelector('#menu-reset').addEventListener('click',()=>{closeMenu();startOver();});
document.querySelector('#menu-privacy').addEventListener('click',()=>{closeMenu();privacy();});
systemMotion.addEventListener('change',e=>{if(e.matches){reduced=true;updateMotion();}});updateMotion();load();
