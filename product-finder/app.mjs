import {AREAS,SENSITIVITIES,ALLERGENS,CONCERNS,TRIED_CATEGORIES,triedOptions,productApproach,freshAnswers,concernKind,toggleExclusive,changeArea,careReason,routeAfterConcern,routeAfterSensitivity,resultFor,eligibleProducts,amazonURL,validateCatalog,finderPath,resultIntro,careMessage,historyMessage,allergyReviewNeeded} from './engine.mjs?v=0f32e7c9a720';
import {reviewsForProduct,featuredReviews,REVIEW_TAG_LABELS} from './reviews.mjs?v=4cfc2c1ec21f';
import {createMetrics} from './metrics.mjs?v=62388ea05da2';
let measure=()=>{},started=false;
const root=document.querySelector('#finder'),dialog=document.querySelector('#finder-dialog'),dialogContent=document.querySelector('#dialog-content'),announcer=document.querySelector('#announcer');
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let answers=freshAnswers(),step='area',catalog=null,config=null,reviewData=null,failed=false,editing=false,notice='',reduced=systemMotion.matches,opener=null,trail=[];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<img class="icon" src="./assets/icons/${n}.svg" alt="" aria-hidden="true">`;
const areaLabel=()=>AREAS.find(x=>x[0]===answers.area)?.[1]||'Not chosen';
const concernLabels={odor:'Odor',wetness:'Wetness',both:'Odor and wetness',damp:'Damp skin',clothes:'Clothes hold odor',rash:'Sore or broken skin',outside:'Outside skin',change:'New vaginal change',urine:'Urine or leaks',symptoms:'Intimate discomfort',dryness:'Daytime dryness',friction:'Friction during sex',chafe:'Rubbing / chafing',unsure:'Not sure'};
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
 if(done)return '<div class="result-progress">'+icon('check')+' Your answers are complete</div>';
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
  question('Where do you notice the smell?',`<p class="helper">Tap an area or the body outline.</p><div class="area-grid"><div class="body-pillar">${body(true)}</div><fieldset class="choices"><legend class="sr-only">Choose the area where you notice the smell</legend>${AREAS.map(([v,l,i])=>choice('area',v,l,{art:i,checked:answers.area===v})).join('')}</fieldset></div>${footer(!!answers.area)}`,'area-screen','<div class="finder-introduction"><p class="intro-title">Stop guessing what to try for menopause odor.</p><p>Find a starting product, see why it fits, and skip formulas that already failed. Matched to your concern and skin needs.</p></div>');
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
  }).join('')}</fieldset><p class="category-hint">${answers.triedCategories.filter(x=>x!=='nothing').length?answers.triedCategories.filter(x=>x!=='nothing').length+' selected · We’ll keep these in mind.':'Select all that apply.'}</p>${answers.triedCategories.some(x=>x!=='nothing')?`<div class="exact-tried"><button id="exact-tried-search" class="text-link" data-action="search">${selectedProducts().length?'Edit products to exclude':'Know the exact product? Exclude it here'} ${icon('chevron')}</button><p>${selectedProducts().length?esc(selectedProducts().map(p=>shortName(p)).join(', '))+' will not be recommended again.':'Optional. Choose the exact formula so we don’t suggest it again.'}</p>${answers.tried.includes('unknown')?'<p>Exact formula not found. Compare any result with the product you tried.</p>':''}</div>`:''}${footer(!!answers.triedCategories.length,'Find my match')}`,'tried-screen category-screen');
 }else if(step==='result')renderResult();
 if(focus){window.scrollTo({top:0,behavior:'instant'});document.querySelector('h1')?.focus({preventScroll:true});}
 else if(restoreId)document.getElementById(restoreId)?.focus({preventScroll:true});
}
function next(){
 if(step==='sensitivity'&&answers.sensitivities.includes('allergy')&&!answers.allergies.length){openAllergens();return;}
 if(!started){measure('finder_start');started=true;}
 measure('finder_step',finderPath(answers).indexOf(step)+1);
 notice='';rememberStep();
 if(step==='area')step=answers.area==='urine_leakage'?'sensitivity':'concern';
 else if(step==='concern')step=routeAfterConcern(answers);
 else if(step==='sensitivity')step=routeAfterSensitivity(answers);
 else if(step==='tried')step='result';
 if(editing&&step==='sensitivity'&&answers.sensitivities.length)step=routeAfterSensitivity(answers);
 if(editing&&step==='tried'&&answers.triedCategories.length)step='result';
 if(step==='result'){measure('finder_complete');editing=false;announcer.textContent='Your next step is ready. You can edit your answers.';}
 render({focus:true});
}
function rememberStep(){trail.push({step,resultAnswers:step==='result'?structuredClone(answers):null});}
function back(){
 const previous=trail.pop();
 if(!previous||previous.step==='area'){startOver();return;}
 notice='';step=previous.step;if(previous.resultAnswers)answers=previous.resultAnswers;editing=false;render({focus:true});
}
const categoryNames={cleanser:'Cleansing option',antiperspirant:'For sweat control',deodorant:'For odor control',moisture:'For damp skin folds',laundry:'For clothes holding odor',probiotic:'Optional supplement',bladder:'Bladder leak protection',underwear:'Everyday comfort',cloth:'Gentle drying',rinse:'Plain-water rinsing',barrier:'Outside-skin protection',vaginal_moisturizer:'Regular vaginal moisture',lubricant:'Comfort during intimacy'};
function amazonButton(p){if(allergyReviewNeeded(answers))return '<p class="restricted-note">Your allergy still needs an ingredient check before you choose this product.</p>';return `<a class="btn result-buy" href="${esc(amazonURL(p,config.tracking_id))}" target="_blank" rel="sponsored noopener noreferrer" aria-label="Shop ${esc(p.name+' '+p.variant)} on Amazon">${p.exactListingVerified?'View on Amazon':'Find on Amazon'} ${icon('arrow')}</a>`;}
function commerceNote(p){return `<p class="commerce-note">As an Amazon Associate I earn from qualifying purchases.${p.exactListingVerified?'':' Opens an Amazon search.'}</p>`;}
function productCard(p,{compact=false,buy=true,match=null}={}){
 const category=p.category||'cleanser';
 return `<article class="shop-card tone-${category} ${compact?'compact-shop-card':''}"><div class="shop-photo ${p.photoStyle==='lifestyle'?'lifestyle-photo':''}"><span class="photo-label">${esc(categoryNames[category])}</span><img src="${p.image}" alt="${esc(p.name+' '+p.variant)}" width="600" height="600"></div><div class="shop-copy"><p class="eyebrow">${esc(categoryNames[category])}</p><h2>${esc(p.name)}</h2><p class="shop-variant">${esc(p.variant)}</p>${match?matchDetails(p,match):''}<p class="shop-fit">${esc(p.fact)}</p>${p.benefits?.length?`<ul class="product-benefits" aria-label="Product benefits">${p.benefits.map(b=>`<li>${esc(b)}</li>`).join('')}</ul>`:''}<p class="shop-caution">${esc(p.caveat)}</p>${match?reviewPanel(p):''}${buy?amazonButton(p):'<p class="restricted-note">Review the ingredients with your pharmacist before choosing this product.</p>'}<div class="product-more">${match&&!allergyReviewNeeded(answers)?`<button class="match-why" data-action="match-why" data-value="${p.id}" aria-label="Why this fits your answers">Why this fits ${icon('chevron')}</button>`:''}<button class="product-details" data-action="details" data-value="${p.id}">${['bladder','underwear','cloth','moisture','rinse'].includes(category)?'Materials &amp; how to use':'Ingredients &amp; how to use'}</button></div>${buy&&!allergyReviewNeeded(answers)?commerceNote(p):''}</div></article>`;
}
function reviewSnippet(r){
 const topics=r.matchedTags.slice(0,2).map(t=>REVIEW_TAG_LABELS[t]);
 return `<figure class="review-snippet">${topics.length?`<div class="review-topic">${icon('spark')}<span>Discusses ${esc(topics.join(' · '))}</span></div>`:''}<blockquote>“${esc(r.quote)}”</blockquote><figcaption><strong>${esc(r.author?'u/'+r.author:'Reddit commenter')}</strong><span>${esc(r.community)}</span><button data-action="review-source" data-value="${esc(r.id)}">Source &amp; context</button></figcaption><p class="review-scope">${esc(r.productScopeNote||'Product named in the comment.')}</p></figure>`;
}
function reviewPanel(p){
 const matches=reviewsForProduct(answers,p,reviewData);
 const featured=featuredReviews(matches);
 if(!featured.length)return '';
 return `<section class="matched-reviews" aria-label="Selected positive experience with ${esc(p.name)}"><div class="review-heading"><h3>Selected positive experience</h3></div><div class="review-snippets">${featured.map(reviewSnippet).join('')}</div><div class="review-footer"><p>Individual results vary.</p></div></section>`;
}
function showReviewSource(id){
 const r=reviewData?.reviews.find(x=>x.id===id);if(!r)return;
 const date=d=>new Date(d+'T00:00:00Z').toLocaleDateString('en-US',{year:'numeric',month:'short',day:'numeric',timeZone:'UTC'});
 openDialog('About this experience',`<p><strong>${esc(r.author?'u/'+r.author:'Reddit commenter')}</strong> in ${esc(r.community)}${r.postedAt?' · '+date(r.postedAt):''}</p><blockquote class="source-quote">“${esc(r.quote)}”</blockquote><p>${esc(r.context||'A personal report, not a clinical finding.')}</p><p>${esc(r.productScopeNote)}</p><p class="small-note">Text checked ${date(r.checkedAt)}. ${r.sourceLocator==='comment_permalink'?'Source identifies the individual comment.':'Source identifies the thread containing this excerpt.'} No verified-purchase status or endorsement of this site is implied.</p><p class="source-address">${esc(r.sourceUrl)}</p><button class="btn" data-action="close">Back to my picks</button>`);
}
function approaches(){
 const types=answers.area==='underarms'?[['deodorants','Deodorants','bottle'],['antiperspirants','Antiperspirants','shield'],['cleansers','Body washes','bottle'],['home','At-home care','leaf']]:[['cleansers','Gentle cleansers','bottle'],['moisture','Moisture care','leaf'],['probiotics','Probiotics','capsule'],['home','At-home care','leaf']];
 return `<section class="approaches"><h2>Compare another approach</h2><div class="approach-grid">${types.filter(([id])=>id==='home'||eligibleProducts(answers,catalog,config.preview,({deodorants:'deodorant',antiperspirants:'antiperspirant',cleansers:'cleanser',moisture:'moisture',probiotics:'probiotic'})[id]).length).map(([id,label,i])=>`<button class="approach-card" data-action="approach" data-value="${id}">${icon(i)}<span>${label}${icon('chevron')}</span></button>`).join('')}</div></section>`;
}
function resultFooter(){return '<footer class="result-footer"><button data-action="start-over">Start over</button><button data-action="disclosure">Affiliate disclosure</button><button data-action="privacy">About your answers</button></footer>';}
function matchDetails(p,r){
 if(allergyReviewNeeded(answers))return `<div class="match-details"><p class="match-reason">${esc(p.fact)}</p></div>`;
 const badges=[];
 if(p.fragranceFree)badges.push(['flower','Fragrance-free']);
 if(p.aluminumFree===true)badges.push(['leaf','Aluminum-free']);
 if((answers.triedCategories||[]).some(x=>x!=='nothing')&&!r.revisitsCategory)badges.push(['spark','Another approach']);
 if(r.revisitsCategory)badges.push(['bottle','Compare with yours']);
 if(!badges.length)badges.push(['check',categoryNames[p.category||'cleanser']]);
 return `<div class="match-details"><p class="match-reason">${esc(r.reason.split(/(?<=\.)\s/)[0])}</p><div class="match-badges">${badges.slice(0,2).map(([i,t])=>`<span>${icon(i)}${t}</span>`).join('')}</div>${historyMessage(answers,r)?`<p class="match-history">${esc(historyMessage(answers,r))}</p>`:''}</div>`;
}
function personalContext(r){return historyMessage(answers,r);}
function renderResult(){
 const r=resultFor(answers,catalog,config.preview);
 if(r.kind!=='product'){renderState(r);return;}
 const note=careMessage(answers);
 const allergyNames=ALLERGENS.filter(([id])=>id!=='other'&&answers.allergies.includes(id)).map(([,name])=>name.toLowerCase()).join(', ');
 const allergyNote=r.allergyReview?`${allergyNames?`Your ${allergyNames} restriction is included, but another allergy is still unidentified.`:'You mentioned an ingredient allergy, but have not identified it here.'} These are product details to review, not confirmed matches. Check the exact label with a pharmacist before choosing.`:answers.sensitivities.includes('allergy')?`You need to avoid ${allergyNames}. These picks passed that ingredient filter using the labels we checked. Confirm the current label before use.`:'';
 const copy=r.allergyReview?{title:'Check your allergy before choosing.',description:'Review the product ingredients below, or edit your answers to identify the ingredient you need to avoid.'}:resultIntro(answers,r);
 const main=r.recommendations.filter(x=>x.section!=='optional'),extra=r.recommendations.filter(x=>x.section==='optional');
 const card=(item,index,optional=false)=>`<li class="recommendation-item" data-product="${esc(item.product.id)}" data-section="${item.section}"><div class="pick-heading"><span class="pick-number">${optional?'+':index+1}</span><strong>${r.allergyReview?'Product to review':item.section==='alternative'?'Alternative: '+esc(item.role):optional?'Optional: '+esc(item.role):r.care&&item.section==='primary'&&['cloth','underwear','rinse'].includes(item.product.category)?'Optional comfort item':esc(item.role)}</strong></div>${item.section==='alternative'?`<p class="choice-instruction">${item.product.category==='deodorant'&&r.primary.category==='antiperspirant'?'Choose this for odor control if you prefer to skip aluminum. It will not reduce sweat.':'Choose this instead of the first option for the same need.'}</p>`:''}${productCard(item.product,{match:item,buy:!r.allergyReview})}</li>`;
 root.innerHTML=`<div class="result-layout numbered-results ${r.care?'has-care':''}">${progress()}<div class="step-content result-main"><section class="result-intro"><div class="result-heading-row"><p class="reveal-badge">${icon('spark')} ${r.allergyReview?'Ingredient review needed':'Matched to your answers'}</p><div class="result-nav"><button class="result-back" data-action="back" aria-label="Back to questions">${icon('arrow')} Back</button><button class="edit-button" data-action="edit">Edit answers</button></div></div><h1 tabindex="-1">${esc(copy.title)}</h1><p class="result-reason">${esc(copy.description)}</p>${chips()}</section>${allergyNote?`<aside class="care-note"><strong>About your allergy</strong><p>${esc(allergyNote)}</p></aside>`:''}${note?`<aside class="care-note"><strong>${r.care?'Before choosing a product':'Keep in mind'}</strong><p>${esc(note)}</p></aside>`:''}<div class="shortlist-intro"><p>${r.allergyReview?'Compatibility has not been confirmed.':'Start with one product. Extras are optional.'}</p></div>${r.route==='sweat'||r.route==='odor-only'?`<label class="choice multi aluminum-choice"><input id="aluminum-preference" type="checkbox" name="aluminum" ${answers.aluminumFree?'checked':''}><span class="choice-label">I prefer aluminum-free options</span><span class="mark">${icon('check')}</span></label>`:''}<ol class="recommendation-list" aria-label="${r.allergyReview?'Products for ingredient review':'Recommended products'}">${main.map((item,i)=>card(item,i)).join('')}</ol>${extra.length?`<details class="optional-extras"><summary>${extra.length} optional ${extra.length===1?'extra':'extras'} for your routine</summary><p class="extras-note">Only add what you need. If you already have suitable underwear or a soft, clean cloth, use those.</p><ul class="recommendation-list">${extra.map((item,i)=>card(item,i,true)).join('')}</ul></details>`:''}</div>${resultFooter()}</div>`;
}
function renderState(r){
 const sweat=r.reason==='sweat';
 root.innerHTML=`<section class="state-result">${progress()}<div class="step-content"><h1 tabindex="-1">${sweat?'No other sweat-control match.':'You’ve ruled out these options.'}</h1><p class="helper">${sweat?'We do not have another antiperspirant that fits these answers. A wash or ordinary deodorant will not replace sweat control. Your previous product stays excluded.':'We won’t recommend something you said did not work or contains an ingredient you need to avoid.'}</p>${chips()}<button class="btn" data-action="edit">Review my choices</button></div><div class="result-actions">${backButton()}</div>${resultFooter()}</section>`;
}
function openAllergens(){
 openDialog('What do you need to avoid?',`<p class="helper">Choose what you know. We’ll filter the products, then you can check the current label before buying.</p><fieldset class="choices allergen-choices"><legend class="sr-only">Ingredients to avoid</legend>${ALLERGENS.map(([v,l])=>choice('allergens',v,l,{multi:true,checked:answers.allergies.includes(v)})).join('')}</fieldset><button class="btn" data-action="allergens-done">Use these choices</button>`);
}
function startOver(){
 if(dialog.open)closeDialog();
 answers=freshAnswers();started=false;step='area';trail=[];editing=false;notice='';opener=null;dialogContent.innerHTML='';
 announcer.textContent='Started over. All previous answers cleared.';render({focus:true});
}
function triedNotes(){
 openDialog('What didn’t work?',`<p class="helper">Optional. The selected products are already excluded from your recommendations.</p>${selectedProducts().map(p=>`<section class="failure-details"><h3>${esc(shortName(p))}</h3><fieldset class="choices"><legend class="sr-only">Why ${esc(p.name)} did not help</legend>${[['odor',"Didn't help the smell"],['sweat',"Didn't help the sweating"],['irritated','Irritated my skin'],['disliked',"Didn't like the scent or texture"]].map(([v,l])=>choice('reason-'+p.id,v,l,{multi:true,checked:(answers.reasons[p.id]||[]).includes(v)})).join('')}</fieldset></section>`).join('')}<button class="btn" data-action="close">Done</button>`);
}
function openDialog(title,html){opener=document.activeElement;dialogContent.innerHTML=`<div class="dialog-header"><h2 id="dialog-title">${title}</h2><button class="close-dialog" data-action="close" aria-label="${title==='Your answers'?'Close answer editor':'Close dialog'}">${icon('close')}</button></div>${html}`;dialog.showModal();}
function closeDialog(){dialog.close();opener?.focus({preventScroll:true});}
function openEditor(){
 const values=[['area','Your area',areaLabel()],['concern','Your concern',answers.concerns.map(x=>concernLabels[x]).join(', ')||'Not chosen'],['sensitivity','Sensitivities',answers.sensitivities.map(x=>sensitivityLabels[x]).join(', ')||'Not chosen'],['tried','Already tried',[...answers.triedCategories.map(x=>TRIED_CATEGORIES[x]?.[0]).filter(Boolean),...selectedProducts().map(p=>shortName(p))].join(', ')||'Not chosen']];
 openDialog('Your answers',`<p class="helper">Choose an answer to change. Going back to your area clears all answers.</p>${values.map(([s,l,v])=>`<button class="edit-row" data-action="edit-step" data-value="${s}"><span><small>${l}</small><strong>${esc(v)}</strong></span>${icon('chevron')}</button>`).join('')}<button class="btn" data-action="close">Back to my result</button>`);
}
function openSearch(){openDialog('Find a product you tried',`<p class="helper">Match the product and formula. A wash and a deodorant are different products.</p><label class="sr-only" for="product-search">Search products</label><input type="search" class="plain-input" id="product-search" placeholder="Search by brand or product" autocomplete="off"><div class="search-results">${catalog.map(p=>productChoice(p,true)).join('')}</div><button class="text-link" data-action="unknown-product">I can't find the exact one</button><button class="btn" data-action="search-done">Done</button>`);document.querySelector('#product-search').focus();}
function details(id){
 const p=catalog.find(x=>x.id===id);if(!p)return;
 const excluded=!eligibleProducts(answers,catalog,config.preview,p.category||'cleanser').some(x=>x.id===id);
 openDialog('Product details',`<div class="details-product"><img src="${p.image}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><p class="small-note">${esc(p.variant)}</p></div></div><p>${esc(p.caveat)}</p><h3 class="field-label">${['bladder','underwear','cloth','moisture','rinse'].includes(p.category)?'Materials':'Ingredients'}</h3><p class="ingredients">${esc(p.ingredients||'Current ingredients are not verified.')}</p><p class="small-note">${esc(p.labelDirections||'Check the current product label for use and warnings.')}</p><p class="small-note">Check the label on the product you buy. Formulas and packaging can change.</p>${excluded?'<p class="restricted-note">This item is not a personalized match for your current answers.</p>':amazonButton(p)}${excluded||allergyReviewNeeded(answers)?'':commerceNote(p)}<button class="btn secondary" data-action="close">Back to my result</button>`);
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
function privacy(){openDialog('About your answers','<p class="helper">Your selections stay in memory in this browser tab. Refreshing or closing the page clears them.</p><p>We do not send your answers, product names or ingredient choices to analytics or advertising services. We count generic finder visits, steps, completions and shopping clicks using isolated, cookieless Google Analytics. Global Privacy Control and Do Not Track disable these counts. This finder loads fonts and product data from this site.</p><p class="small-note">Amazon links contain only a product identifier or search and our affiliate tag. Hosting providers and websites you choose to visit have their own privacy practices.</p><button class="btn" data-action="close">Got it</button>');}
function updateMotion(){document.documentElement.classList.toggle('reduce-motion',reduced);document.querySelectorAll('[data-action="motion"],#menu-motion').forEach(b=>{b.setAttribute('aria-pressed',String(reduced));b.textContent=reduced?'Motion reduced':'Reduce motion';});}
function toggleMotion(){reduced=systemMotion.matches||!reduced;updateMotion();announcer.textContent=reduced?'Reduced motion enabled.':'Standard motion enabled.';}
function setArea(area){notice='';answers=changeArea(answers,area);}
function handleChange(e){
 const t=e.target;if(!(t instanceof HTMLInputElement))return;
 if(t.name==='area')setArea(t.value);
 else if(t.name==='concerns')answers.concerns=concernKind(answers)==='underarms'?[t.value]:toggleExclusive(answers.concerns,t.value,['unsure']);
 else if(t.name==='sensitivities'){answers.sensitivities=toggleExclusive(answers.sensitivities,t.value);if(!answers.sensitivities.includes('allergy'))answers.allergies=[];}
 else if(t.name==='tried-category'){answers.triedCategories=toggleExclusive(answers.triedCategories,t.value,['nothing']);if(answers.triedCategories.includes('nothing')){answers.tried=[];answers.reasons={};answers.unknownProduct='';}}
 else if(t.name==='allergens'){answers.allergies=toggleExclusive(answers.allergies,t.value,[]);return;}
 else if(t.name==='tried'){
  answers.tried=toggleExclusive(answers.tried,t.value,['nothing','unknown']);
  const selected=catalog.find(p=>p.id===t.value);if(selected&&answers.tried.includes(t.value)){answers.triedCategories=answers.triedCategories.filter(x=>x!=='nothing');const type=productApproach(selected);if(TRIED_CATEGORIES[type]&&!answers.triedCategories.includes(type))answers.triedCategories.push(type);}
  for(const id of Object.keys(answers.reasons))if(!answers.tried.includes(id))delete answers.reasons[id];
  if(!answers.tried.includes('unknown'))answers.unknownProduct='';
  if(dialog.open){dialog.querySelectorAll('input[name="tried"]').forEach(x=>x.checked=answers.tried.includes(x.value));return;}
 }else if(t.name.startsWith('reason-')){const id=t.name.slice(7);answers.reasons[id]=toggleExclusive(answers.reasons[id]||[],t.value,[]);return;}
 else if(t.name==='aluminum'){answers.aluminumFree=t.checked;render({restoreId:t.id});return;}
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
 else if(a==='search')openSearch();else if(a==='search-done'){closeDialog();render({restoreId:'exact-tried-search'});}
 else if(a==='unknown-product'){answers.unknownProduct=document.querySelector('#product-search').value.trim().slice(0,160);if(!answers.tried.includes('unknown'))answers.tried.push('unknown');closeDialog();render({restoreId:'exact-tried-search'});}
 else if(a==='routine'){answers.tried=toggleExclusive(answers.tried,'routine',['nothing','unknown']);render();if(answers.tried.includes('routine'))openDialog('At-home remedy or routine',`<p class="helper">Add a note if you want. This stays in your browser tab.</p><label for="routine-detail">What did you try? (optional)</label><textarea class="plain-input" id="routine-detail" maxlength="240" rows="3">${esc(answers.routine)}</textarea><button class="btn" data-action="routine-done">Done</button>`);}
 else if(a==='routine-done'){answers.routine=document.querySelector('#routine-detail').value.trim();closeDialog();render();}
 else if(a==='general-browse')browseProductDetails();
 else if(a==='match-why'){const r=resultFor(answers,catalog,config.preview),item=r.recommendations?.find(x=>x.product.id===v);if(!item)return;openDialog('Why this was selected for you',`<h3>${esc(item.product.name)}</h3>${chips({all:true})}<p>${esc(item.reason)}</p>${personalContext(item)?`<p>${esc(personalContext(item))}</p>`:''}<p class="small-note">${esc(item.product.caveat)}</p><button class="btn" data-action="close">Back to my picks</button>`);}
 else if(a==='review-source')showReviewSource(v);
 else if(a==='tried-notes')triedNotes();
 else if(a==='clarify'){answers.concerns=[v];render({focus:true});}
 else if(a==='care-notes')careNotes();else if(a==='disclosure')disclosure();
 else if(a==='details')details(v);else if(a==='approach')approach(v);else if(a==='privacy')privacy();else if(a==='retry')load();
}
function renderError(){root.innerHTML='<section class="state-result"><h1 tabindex="-1">Your result could not load.</h1><p class="helper">Your answers are still here.</p><button class="btn" data-action="retry">Try again</button></section>';}
async function load(){
 try{
  const [a,b,reviews]=await Promise.all([fetch('./catalog.json',{cache:'no-store'}),fetch('./config.json',{cache:'no-store'}),fetch('./reviews.json',{cache:'no-store',signal:AbortSignal.timeout(4000)}).then(r=>r.ok?r.json():null).catch(()=>null)]);
  reviewData=reviews?.version===1&&Array.isArray(reviews.reviews)?reviews:null;
  if(!a.ok||!b.ok)throw Error('Unavailable');catalog=validateCatalog(await a.json());config=await b.json();
  if(config.tracking_id!=='menopausewash-20')throw Error('Invalid configuration');failed=false;measure=createMetrics(config);measure('finder_open');render();
 }catch{failed=true;renderError();}
}
document.addEventListener('click',e=>{if(e.target.closest('a.result-buy'))measure('finder_product_click');});
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
