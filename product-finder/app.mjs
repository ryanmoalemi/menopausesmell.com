import {AREAS,SENSITIVITIES,CONCERNS,freshAnswers,concernKind,toggleExclusive,changeArea,careReason,routeAfterConcern,routeAfterSensitivity,resultFor,amazonURL,validateCatalog} from './engine.mjs?v=a4ed4632fc67';
const root=document.querySelector('#finder'),dialog=document.querySelector('#finder-dialog'),dialogContent=document.querySelector('#dialog-content'),announcer=document.querySelector('#announcer');
const systemMotion=matchMedia('(prefers-reduced-motion: reduce)');
let answers=freshAnswers(),step='area',catalog=null,config=null,failed=false,editing=false,notice='',reduced=systemMotion.matches,opener=null;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icon=n=>`<img class="icon" src="./assets/icons/${n}.svg" alt="" aria-hidden="true">`;
const areaLabel=()=>AREAS.find(x=>x[0]===answers.area)?.[1]||'Not chosen';
const concernLabels={odor:'Odor',wetness:'Wetness',both:'Odor and wetness',damp:'Damp skin',clothes:'Clothes hold odor',rash:'Sore or broken skin',outside:'Outside skin',change:'New vaginal change',urine:'Urine or leaks',symptoms:'Other symptoms',unsure:'Not sure'};
const sensitivityLabels={fragrance:'Avoid fragrance',reactive:'Dry / reactive skin',allergy:'Ingredient allergy',irritated:'Irritated skin now',none:'None known',unsure:'Not sure'};
const selectedProducts=()=>catalog?.filter(p=>answers.tried.includes(p.id))||[];
const shortName=p=>({'lume-unscented-wash':'Lume wash','mirai-unscented-bar':'Mirai soap','vanicream-gentle-body-wash':'Vanicream wash','uro-capsules':'URO capsules','uro-gummies':'URO gummies'}[p.id]||p.name);
function chips({all=false,compact=false}={}){
 const values=answers.area?[[areaLabel(),'']]:[];
 if(!compact)answers.concerns.forEach(x=>values.push([concernLabels[x],'concern']));
 answers.sensitivities.filter(x=>!['none','unsure'].includes(x)).forEach(x=>values.push([sensitivityLabels[x],'']));
 if(all)selectedProducts().forEach(p=>values.push([shortName(p)+' tried','']));
 return `<div class="chips">${values.map(([t,c])=>`<span class="chip ${c}">${icon('check')}${esc(t)}</span>`).join('')}</div>`;
}
function body(interactive=false){
 const kind=({underarms:'underarms',body_folds:'folds',outer_groin:'groin',vaginal_change:'intimate',urine_leakage:'intimate'})[answers.area]||'neutral';
 return `<div class="body-picture"><img class="body-art" src="./assets/illustrations/body-${kind}.svg" alt="" aria-hidden="true">${interactive?'<button class="hotspot hotspot-upper" data-action="hotspot" data-value="underarms" aria-label="Choose underarms on body outline"></button><button class="hotspot hotspot-middle" data-action="hotspot" data-value="body_folds" aria-label="Choose body or skin folds on body outline"></button><button class="hotspot hotspot-pelvic" data-action="pelvic" aria-label="Choose the source around the groin or intimate area"></button>':''}</div>`;
}
function progress(){
 const stage=['area','concern'].includes(step)?0:['sensitivity','allergy'].includes(step)?1:2;
 return `<ol class="progress" aria-label="Finder stages">${['Your concern','Sensitivities','Already tried'].map((t,i)=>`<li class="${i===stage?'current':i<stage?'done':''}" ${i===stage?'aria-current="step"':''}><span class="stage-label">${t}${i<stage?icon('check'):''}</span></li>`).join('')}</ol>`;
}
function choice(group,value,label,{multi=false,art='',checked=false}={}){
 const help=value==='body_folds'?'Body skin, including under breasts and other skin folds':value==='outer_groin'?'Sweat on surrounding outer skin, separate from vaginal changes':label;
 return `<label class="choice ${multi?'multi':''}" for="${group}-${value}"><input id="${group}-${value}" type="${multi?'checkbox':'radio'}" name="${group}" value="${esc(value)}" aria-label="${esc(help)}" ${checked?'checked':''}>${art?icon(art):''}<span class="choice-label">${esc(label)}</span><span class="mark">${icon('check')}</span></label>`;
}
function footer(enabled,label='Continue'){return `<div class="question-footer">${step==='area'?'':'<button class="btn secondary back" data-action="back">Back</button>'}<button class="btn primary" data-action="next" ${enabled?'':'disabled'}><span class="btn-label">${label}</span>${icon('arrow')}</button></div>`;}
function question(title,content,cls='',intro=''){root.innerHTML=`<section class="question-wrap ${cls}">${intro}${progress()}${notice?`<p class="inline-notice" role="status">${esc(notice)}</p>`:''}<h1 id="question-heading" tabindex="-1">${title}</h1>${content}</section>`;}
function summary(){return `<div class="concern-summary">${body()}<div><p class="summary-label">Your concern</p>${chips()}<p class="small-note">Only the answers you choose appear here.</p></div></div>`;}
function productChoice(p,search=false){
 const prefix=search?'search':'tried';
 return `<label class="choice multi ${search?'search-choice':'product-choice'}" for="${prefix}-${p.id}"><input id="${prefix}-${p.id}" type="checkbox" name="tried" value="${p.id}" ${answers.tried.includes(p.id)?'checked':''} aria-label="${esc(p.name+' '+p.variant)}"><span class="photo-well ${p.id==='mirai-unscented-bar'?'tactile':''}"><img class="product-image" src="${p.image}" alt="${esc(p.name+' '+p.variant)}"></span><span class="choice-label">${esc(p.name)}<span class="variant">${esc(p.variant)}</span></span><span class="mark">${icon('check')}</span></label>`;
}
function render({focus=false,restoreId=null}={}){
 if(failed){renderError();return;}
 if(step==='area'){
  question('Where do you<br class="mobile-break"> notice the smell?',`<p class="helper">Choose one area to start.</p><div class="area-grid"><div class="body-pillar">${body(true)}</div><fieldset class="choices"><legend class="sr-only">Choose the area where you notice the smell</legend>${AREAS.map(([v,l,i])=>choice('area',v,l,{art:i,checked:answers.area===v})).join('')}</fieldset></div>${answers.area?chips():''}<p class="diagram-helper">Tap a label or the body outline.</p>${footer(!!answers.area)}`,'area-screen','<div class="finder-introduction"><p class="intro-title">Find care and products for menopause odor.</p><p>Tell us about the smell, your skin, and what you’ve tried. Get care tips and product options based on your answers.</p></div>');
 }else if(step==='concern'){
  const kind=concernKind(answers),under=kind==='underarms';
  question(under?'Smell, sweating,<br>or both?':'Which sounds closest?',`${under?'':`<p class="helper">${kind==='intimate'?'These need different next steps.':'For '+esc(areaLabel().toLowerCase())+'. Select all that apply.'}</p>`}${summary()}<fieldset class="choices"><legend class="sr-only">${under?'Smell, sweating, or both?':'Which sounds closest?'}</legend>${CONCERNS[kind].map(([v,l])=>choice('concerns',v,l,{multi:!under,checked:answers.concerns.includes(v)})).join('')}</fieldset><p class="small-note">${kind==='intimate'?'A highlight shows what you selected, not a diagnosis.':'You can change your answers later.'}</p>${footer(!!answers.concerns.length)}`,'concern-screen');
 }else if(step==='sensitivity'){
  question('Anything to avoid?',`<p class="helper">Select all that apply.</p>${chips()}<fieldset class="choices"><legend class="sr-only">Sensitivities and ingredients to avoid</legend>${SENSITIVITIES.map(([v,l,i])=>choice('sensitivities',v,l,{multi:true,art:i,checked:answers.sensitivities.includes(v)})).join('')}</fieldset><p class="small-note">Current irritation has its own care route.</p>${footer(!!answers.sensitivities.length)}`,'sensitivity-screen');
 }else if(step==='allergy'){
  question('Which ingredient do you need to avoid?',`<p class="helper">Enter the ingredient name if you know it.</p><label class="field-label" for="allergy-detail">Ingredient name</label><input id="allergy-detail" class="plain-input" type="text" maxlength="160" autocomplete="off" value="${esc(answers.allergy)}" placeholder="For example, an ingredient on your label"><div class="state-box gold">${icon('shield')}<p>We cannot confirm an allergy-safe match without the ingredient and verified product labels.</p></div><button class="text-link" data-action="allergy-unknown">I'm not sure</button><br><button class="text-link" data-action="general-browse">Browse without allergy screening</button>${footer(!!answers.allergy.trim(),'Use this ingredient')}`,'allergy-screen');
 }else if(step==='tried'){
  const displayed=[...catalog.slice(0,3),...selectedProducts().filter(p=>!catalog.slice(0,3).some(x=>x.id===p.id))];
  const details=selectedProducts().map(p=>`<details class="failure-details"><summary><strong>${esc(shortName(p))} selected</strong>Why did it not help? (optional)</summary><fieldset class="choices"><legend class="sr-only">Why ${esc(p.name)} did not help</legend>${[['odor',"Didn't help the smell"],['sweat',"Didn't help the sweating"],['irritated','Irritated my skin'],['disliked',"Didn't like the scent or texture"]].map(([v,l])=>choice('reason-'+p.id,v,l,{multi:true,checked:(answers.reasons[p.id]||[]).includes(v)})).join('')}</fieldset></details>`).join('');
  question("What have you tried that didn't help?",`<p class="helper">Choose the exact product when you can.</p><fieldset class="picker-grid"><legend class="sr-only">Products that did not help</legend>${displayed.map(p=>productChoice(p)).join('')}<button class="search-card" data-action="search"><span class="search-icon">${icon('search')}</span><strong>Find another<br>product</strong><small>Wash, deodorant or other</small></button></fieldset>${details}${answers.unknownProduct?`<p class="other-product-note">${esc(answers.unknownProduct)}<br>Exact formula not identified. No specific product is excluded for this answer.</p>`:''}<div class="previous-extras">${choice('tried','nothing','Nothing yet',{multi:true,checked:answers.tried.includes('nothing')})}${choice('tried','unknown','Not sure what',{multi:true,checked:answers.tried.includes('unknown')})}</div><button class="routine-button" data-action="routine" aria-pressed="${answers.tried.includes('routine')}">${answers.tried.includes('routine')?'✓ ':''}At-home remedy or routine change</button>${answers.tried.includes('routine')?`<p class="small-note">Selected${answers.routine?': '+esc(answers.routine):''}</p>`:''}${footer(!!answers.tried.length,'See my next step')}`,'tried-screen');
 }else if(step==='result')renderResult();
 if(focus){window.scrollTo({top:0,behavior:'instant'});document.querySelector('h1')?.focus({preventScroll:true});}
 else if(restoreId)document.getElementById(restoreId)?.focus({preventScroll:true});
}
function next(){
 notice='';
 if(step==='area')step=answers.area==='urine_leakage'?'result':'concern';
 else if(step==='concern')step=routeAfterConcern(answers);
 else if(step==='sensitivity')step=routeAfterSensitivity(answers);
 else if(step==='allergy'||step==='tried')step='result';
 if(editing&&!careReason(answers)&&step==='sensitivity'&&answers.sensitivities.length)step=routeAfterSensitivity(answers);
 if(editing&&step==='tried'&&answers.tried.length)step='result';
 if(step==='result'){editing=false;announcer.textContent='Your next step is ready. You can edit your answers.';}
 render({focus:true});
}
function back(){notice='';step=step==='concern'?'area':step==='sensitivity'?'concern':'sensitivity';render({focus:true});}
function amazonButton(p){return `<a class="btn result-buy" href="${esc(amazonURL(p,config.tracking_id))}" target="_blank" rel="sponsored noopener noreferrer" aria-label="Find ${esc(p.name+' '+p.variant)} on Amazon">Find this ${p.format==='bar'?'soap':'wash'} on Amazon</a>`;}
function sidebar(){return `<aside class="answer-sidebar" aria-label="Your answer summary"><div class="answer-panel"><h2>Your answers</h2>${body()}${chips({all:true})}<button class="btn secondary" data-action="edit">Edit answers</button><p class="small-note">Change an answer at any point. Your other choices stay with you.</p></div><button class="text-link" data-action="another">Check another area ${icon('chevron')}</button></aside>`;}
function approaches(){return `<section class="approaches"><h2>Explore other approaches</h2><div class="approach-grid">${[['deodorants','Deodorants','bottle'],['antiperspirants','Antiperspirants','shield'],['probiotics','Probiotics','capsule'],['home','At-home care','leaf']].map(([id,label,i])=>`<button class="approach-card" data-action="approach" data-value="${id}">${icon(i)}<span>${label}${icon('chevron')}</span></button>`).join('')}</div><p class="small-note">Optional comparisons. Not every approach is appropriate for every concern.</p></section>`;}
function resultFooter(){return '<footer class="result-footer"><span>A useful starting point, not a diagnosis.</span><a href="/affiliate-disclosure/">Affiliate disclosure</a><button data-action="privacy">About your answers</button></footer>';}
function renderResult(){
 const r=resultFor(answers,catalog,config.preview);
 if(r.kind!=='product'){renderState(r);return;}
 const p=r.primary,reactive=answers.sensitivities.includes('reactive'),prior=selectedProducts();
 const title=r.gentle?'Start with gentler cleansing.':'Keep the washing step simple.';
 const reason=reactive?'You said body products can irritate your skin. Keep the washing step simple.':answers.sensitivities.includes('fragrance')?'You want to avoid fragrance. Start with a simple rinse-off cleanser.':'A rinse-off cleanser is one part of your routine. Start with a format that fits your skin.';
 const priorText=prior.length?`Your previously tried ${shortName(prior[0])} is not repeated.`:'For external body skin. Rinse off after washing.';
 root.innerHTML=`<div class="result-layout">${sidebar()}<div class="result-main"><section class="result-intro"><div class="result-heading-row"><p class="eyebrow">Your next step</p><button class="edit-button" data-action="edit">Edit answers</button></div><h1 tabindex="-1">${title}</h1><p class="result-reason">${reason}</p>${chips({compact:true})}</section><article class="result-card"><div class="result-photo"><img src="${p.image}" alt="${esc(p.name+' '+p.variant)}"></div><div class="product-intro"><p class="eyebrow">Cleansing option</p><h2>${p.id==='vanicream-gentle-body-wash'?'Vanicream<br class="mobile-break"> Gentle Body Wash':esc(p.name)}</h2><p>A simple rinse-off cleanser for the washing step.</p></div><div class="product-facts"><p class="fact-item">${icon('check')}${esc(p.fact)}</p><p class="fact-item desktop-fact">${icon('check')}${esc(priorText)}</p></div><p class="caveat">${icon('alert')}${esc(p.caveat)}</p><button class="product-details" data-action="details" data-value="${p.id}">Ingredients and product details</button>${amazonButton(p)}</article>${amazonButton(p)}<p class="commerce-note">Opens Amazon search results. Check the exact product before buying.</p><p class="commerce-note">We may earn a commission from purchases.</p><section class="result-more"><h2>Why this starting point</h2><div class="reason-list"><div class="reason-item">${icon('check')}<div><strong>Your skin needs come first.</strong><p>${reactive?'You selected dry or reactive skin.':answers.sensitivities.includes('fragrance')?'You selected fragrance sensitivity.':'This is a cleansing option for external body skin.'}</p></div></div><div class="reason-item">${icon('check')}<div><strong>${prior.length?'Your previous choice is remembered.':'One step at a time.'}</strong><p>${prior.length?esc(`The ${shortName(prior[0])} you selected is not repeated.`):'Washing and sweat control do different jobs.'}</p></div></div></div><div class="free-step"><h2>A step that costs nothing</h2><p>Keep your routine simple and dry the area well after washing.</p></div></section>${r.alternatives.length?`<section class="result-more alternatives"><h2>Another cleansing option</h2><div class="alternative-list">${r.alternatives.map(x=>`<article class="alternative"><img src="${x.image}" alt="${esc(x.name+' '+x.variant)}"><div><h3>${esc(x.name)}</h3><p>${esc(x.caveat)}</p><button data-action="details" data-value="${x.id}">Compare ingredients and details</button></div></article>`).join('')}</div></section>`:''}${approaches()}<button class="text-link mobile-another" data-action="another">Check another area ${icon('chevron')}</button></div>${resultFooter()}</div>`;
}
function renderState(r){
 let title='',reason='',callout='',text='',art='shield',link='/body-odor/',label='Read the care guide',foot='',extra='',eyebrow='Your next step';
 if(r.kind==='care'){
  eyebrow='A useful next step';title='Start with care, not another product.';art='book';callout='Get advice on the change.';text='The useful next step is to get advice from a qualified clinician rather than guess at a product.';link='/appointment-checklist/';label='Prepare for an appointment';foot='This finder cannot tell you what is causing the change.';
  reason={vaginal:answers.concerns.includes('change')?'You said your vaginal smell or discharge is new or different.':'You selected itching, burning, soreness, pain or bleeding.',skin:'You selected skin that is sore, irritated, broken or has a new rash.',urine:'You selected urine or little leaks. A wash does not address leakage.',uncertain:'You are not sure where the smell is coming from. Different sources need different care.'}[r.reason];
  if(r.reason==='skin'){callout='Give irritated skin attention.';text='Avoid adding a stronger cleanser or acid to sore or broken skin. Get advice from a qualified clinician if it is new, persistent or worsening.';}
  if(r.reason==='urine'){callout='A different kind of care.';text='Discuss new or bothersome leakage with a qualified clinician. If you have painful urination, blood in your urine, fever or feel unwell, get medical advice promptly.';}
  if(r.reason==='uncertain'){title='First, work out the source.';callout='You do not need to guess.';text='Start with the guide to outside skin, vaginal changes and urine or leakage. If the change is new or persistent, ask a qualified clinician.';link='/odor-and-menopause/';label='Help me understand the difference';}
 }else if(r.kind==='no-match'){
  eyebrow='Your restrictions stay in place';title='No confirmed match yet.';reason=r.reason==='allergy'?'We cannot confirm a product fits your ingredient restriction with the information available.':r.reason==='format'?'We do not have a confirmed option in your chosen format that also fits your answers.':'The available options do not fit your answers and the products you have already tried.';callout='Nothing was quietly added back.';text='Your restrictions and products that did not help stay excluded.';foot=r.reason==='allergy'?'Browsing is not personalized allergy screening.':'You can change your answers or browse general product information.';
 }else if(r.kind==='sweat'){
  title='Start with sweat control.';reason='You said dampness is part of the problem. Antiperspirants are the category to compare for sweat control.';callout='A wash is not sweat control.';text='Different product. Different job.';link='/underarm-products/';label='Read the sweat-control guide';extra='<p class="small-note">Exact product options need verification before we can show a shortlist.</p>';foot='No wash or supplement is substituted here.';
  if(r.aluminumFree)extra+='<p class="restricted-note">Aluminum-free deodorants can target odor, but they are not the same as antiperspirants for reducing sweat.</p>';
 }else if(r.kind==='odor'||r.kind==='uncertain-underarm'){
  title=r.kind==='odor'?'Separate odor control from washing.':'Start by separating sweat from odor.';reason=r.kind==='odor'?'You selected underarm smell. A deodorant targets odor; a cleanser handles the washing step.':'You are not sure whether smell or wetness is the main problem. These are different jobs.';callout='Choose the job you need.';text='Deodorants target odor. Antiperspirants reduce sweating. A stronger wash is not automatically the next step.';label='Read the underarm guide';link='/underarm-products/';extra='<p class="small-note">A personalized deodorant shortlist is not available yet.</p>';
 }else if(r.kind==='external'){
  title='Keep outside-skin care gentle.';reason='You selected sweat on outer skin. That is different from a vaginal change.';callout='Outside only. No special wash needed.';text='Use water for gentle vulva care and dry thoroughly. Do not wash inside the vagina or use scented products around it.';label='Read the gentle-care guide';link='/gentle-care/';foot='New or persistent vaginal changes need advice, not a stronger wash.';
 }else if(r.kind==='clothes'){
  title='Start with the clothes holding odor.';reason='You said the smell seems to stay in your clothes.';art='clothes';callout='Try a clothes-care step first.';text='Follow the garment care label, wash regularly and dry clothes fully. Changing a skin product may not address odor left in fabric.';label='Read the body-odor guide';
 }else if(r.kind==='damp'){
  title='Start with keeping the area dry.';reason='You said the skin stays sweaty or damp.';art='leaf';callout='Drying is part of the routine.';text='Dry the folds gently after washing and change damp clothing. Underarm antiperspirant directions do not automatically apply to skin folds or groin skin.';label='Read the skin-care guide';
 }
 root.innerHTML=`<section class="state-result"><div class="result-heading-row"><p class="eyebrow">${eyebrow}</p></div><h1 tabindex="-1">${title}</h1><p class="helper">${reason}</p>${chips()}<div class="state-box ${r.kind==='no-match'?'gold':''}">${icon(art)}<h2>${callout}</h2><p>${text}</p></div>${extra}${r.kind==='no-match'?'<button class="btn" data-action="edit">Review my restrictions</button><button class="btn secondary" data-action="general-browse">Browse product information</button>':`<a class="btn" href="${link}" target="_blank" rel="noopener noreferrer">${label}</a><button class="btn secondary" data-action="edit">Edit answers</button>`}${r.kind==='sweat'?`<label class="choice multi"><input id="aluminum-preference" type="checkbox" name="aluminum" ${answers.aluminumFree?'checked':''}><span class="choice-label">I prefer aluminum-free options</span><span class="mark">${icon('check')}</span></label>`:''}<p class="small-note">${foot}</p>${['care','no-match'].includes(r.kind)?'':approaches()}<button class="text-link" data-action="another">Check another area ${icon('chevron')}</button>${resultFooter()}</section>`;
}
function openDialog(title,html){opener=document.activeElement;dialogContent.innerHTML=`<div class="dialog-header"><h2 id="dialog-title">${title}</h2><button class="close-dialog" data-action="close" aria-label="${title==='Your answers'?'Close answer editor':'Close dialog'}">${icon('close')}</button></div>${html}`;dialog.showModal();}
function closeDialog(){dialog.close();opener?.focus({preventScroll:true});}
function openEditor(){
 const values=[['area','Your area',areaLabel()],['concern','Your concern',answers.concerns.map(x=>concernLabels[x]).join(', ')||'Not chosen'],['sensitivity','Sensitivities',answers.sensitivities.map(x=>sensitivityLabels[x]).join(', ')||'Not chosen'],['tried','Already tried',selectedProducts().map(shortName).join(', ')||(answers.tried.includes('nothing')?'Nothing yet':answers.tried.includes('unknown')?'Not sure what':answers.tried.includes('routine')?'At-home routine':'Not chosen')]];
 openDialog('Your answers',`<p class="helper">Change an answer without starting over.</p>${values.map(([s,l,v])=>`<button class="edit-row" data-action="edit-step" data-value="${s}"><span><small>${l}</small><strong>${esc(v)}</strong></span>${icon('chevron')}</button>`).join('')}<button class="btn" data-action="close">Back to my result</button>`);
}
function openSearch(){openDialog('Find a product you tried',`<p class="helper">Match the product and formula. A wash and a deodorant are different products.</p><label class="sr-only" for="product-search">Search products</label><input type="search" class="plain-input" id="product-search" placeholder="Search by brand or product" autocomplete="off"><div class="search-results">${catalog.map(p=>productChoice(p,true)).join('')}</div><button class="text-link" data-action="unknown-product">I can't find the exact one</button><button class="btn" data-action="search-done">Done</button>`);document.querySelector('#product-search').focus();}
function details(id){
 const p=catalog.find(x=>x.id===id);if(!p)return;
 const excluded=answers.tried.includes(id)||answers.sensitivities.includes('allergy');
 openDialog('Product details',`<div class="details-product"><img src="${p.image}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><p class="small-note">${esc(p.variant)}</p></div></div><p>${esc(p.caveat)}</p><h3 class="field-label">Ingredients</h3><p class="ingredients">${esc(p.ingredients||'Current ingredients are not verified.')}</p><p class="small-note">${esc(p.labelDirections||'Check the current product label for use and warnings.')}</p><p class="small-note">Check the label on the product you buy. Formulas and packaging can change.</p>${excluded?'<p class="restricted-note">This item is not a personalized match for your current answers.</p>':amazonButton(p)}<p class="commerce-note">Opens Amazon search results. Check the formula, size and seller before buying. As an Amazon Associate I earn from qualifying purchases.</p><button class="btn secondary" data-action="close">Back to my result</button>`);
}
function approach(id){
 const c={deodorants:['Compare deodorants','Deodorants target odor. Antiperspirants target sweating. They are different product types.','/underarm-products/','Read the underarm guide'],antiperspirants:['Compare antiperspirants','For sweating, compare products labeled antiperspirant. A wash or an aluminum-free deodorant is not a substitute for sweat control.','/underarm-products/','Read the sweat-control guide'],probiotics:['Explore probiotics','Oral probiotics are a separate comparison, not an automatic answer to new vaginal odor. Capsules and gummies have different labels; one product’s reviews do not apply to the other.','/probiotics/','Read the probiotic comparison'],home:['At-home options','Keep your routine simple, gently dry skin after washing and change damp clothes. Avoid layering strong products. If the change persists, get advice.','/body-odor/','Read the routine guide']}[id];
 openDialog(c[0],`<p class="helper">${c[1]}</p>${chips({all:true})}<p class="restricted-note">Your current answers stay here. The guide is general information, not personalized screening for your allergies or previous products.</p><a class="btn" href="${c[2]}" target="_blank" rel="noopener noreferrer">${c[3]}</a>${id==='home'?'<p class="small-note">You do not need to buy something to try these steps.</p>':''}<button class="btn secondary" data-action="close">Back to my result</button>`);
}
function privacy(){openDialog('About your answers','<p class="helper">Your selections stay in memory in this browser tab. Refreshing or closing the page clears them.</p><p>We do not send finder answers to analytics, advertising services or Amazon. This finder loads its fonts and product data from this site.</p><p class="small-note">Amazon links contain the product search and affiliate tag only. Hosting providers and websites you choose to visit have their own privacy practices.</p><button class="btn" data-action="close">Got it</button>');}
function updateMotion(){document.documentElement.classList.toggle('reduce-motion',reduced);document.querySelectorAll('[data-action="motion"],#menu-motion').forEach(b=>{b.setAttribute('aria-pressed',String(reduced));b.textContent=reduced?'Motion reduced':'Reduce motion';});}
function toggleMotion(){reduced=systemMotion.matches||!reduced;updateMotion();announcer.textContent=reduced?'Reduced motion enabled.':'Standard motion enabled.';}
function setArea(area){if(answers.area&&answers.area!==area)notice='Your area changed. Please choose the concern for this area. Your other answers are kept.';answers=changeArea(answers,area);}
function handleChange(e){
 const t=e.target;if(!(t instanceof HTMLInputElement))return;
 if(t.name==='area')setArea(t.value);
 else if(t.name==='concerns')answers.concerns=concernKind(answers)==='underarms'?[t.value]:toggleExclusive(answers.concerns,t.value,['unsure']);
 else if(t.name==='sensitivities'){answers.sensitivities=toggleExclusive(answers.sensitivities,t.value);if(!answers.sensitivities.includes('allergy'))answers.allergy='';}
 else if(t.name==='tried'){
  answers.tried=toggleExclusive(answers.tried,t.value,['nothing','unknown']);
  for(const id of Object.keys(answers.reasons))if(!answers.tried.includes(id))delete answers.reasons[id];
  if(!answers.tried.includes('unknown'))answers.unknownProduct='';
  if(dialog.open){dialog.querySelectorAll('input[name="tried"]').forEach(x=>x.checked=answers.tried.includes(x.value));return;}
 }else if(t.name.startsWith('reason-')){const id=t.name.slice(7);answers.reasons[id]=toggleExclusive(answers.reasons[id]||[],t.value,[]);return;}
 else if(t.name==='aluminum')answers.aluminumFree=t.checked;
 else return;
 render({restoreId:t.id});
}
function handleAction(e){
 const b=e.target.closest('[data-action]');if(!b)return;const a=b.dataset.action,v=b.dataset.value;
 if(a==='next')next();else if(a==='back')back();else if(a==='edit')openEditor();else if(a==='close')closeDialog();else if(a==='motion')toggleMotion();
 else if(a==='hotspot'){setArea(v);render({restoreId:'area-'+v});announcer.textContent=areaLabel()+' selected.';}
 else if(a==='pelvic')openDialog('Which area do you mean?',`<p class="helper">Choose the source. The outline alone cannot tell the difference.</p>${AREAS.filter(x=>['outer_groin','vaginal_change','urine_leakage'].includes(x[0])).map(([id,l])=>`<button class="edit-row" data-action="pelvic-choice" data-value="${id}">${l}${icon('chevron')}</button>`).join('')}`);
 else if(a==='pelvic-choice'){setArea(v);closeDialog();render({restoreId:'area-'+v});}
 else if(a==='edit-step'){closeDialog();step=v;editing=true;if(step==='concern'&&answers.area==='urine_leakage')step='area';render({focus:true});}
 else if(a==='another'){step='area';editing=false;notice='Choose another area. Compatible preferences and previous products stay selected.';render({focus:true});}
 else if(a==='search')openSearch();else if(a==='search-done'){closeDialog();render({restoreId:selectedProducts()[0]?'tried-'+selectedProducts()[0].id:null});}
 else if(a==='unknown-product'){answers.unknownProduct=document.querySelector('#product-search').value.trim().slice(0,160);answers.tried=['unknown'];answers.reasons={};closeDialog();render({restoreId:'tried-unknown'});}
 else if(a==='routine'){answers.tried=toggleExclusive(answers.tried,'routine',['nothing','unknown']);render();if(answers.tried.includes('routine'))openDialog('At-home remedy or routine',`<p class="helper">Add a note if you want. This stays in your browser tab.</p><label for="routine-detail">What did you try? (optional)</label><textarea class="plain-input" id="routine-detail" maxlength="240" rows="3">${esc(answers.routine)}</textarea><button class="btn" data-action="routine-done">Done</button>`);}
 else if(a==='routine-done'){answers.routine=document.querySelector('#routine-detail').value.trim();closeDialog();render();}
 else if(a==='allergy-unknown'){answers.allergy='';step='result';render({focus:true});}
 else if(a==='general-browse')openDialog('Browse product information','<p class="helper">Your restrictions stay in place. Browsing does not mean a product has passed allergy screening.</p><a class="btn secondary" href="/ingredient-labels/" target="_blank" rel="noopener noreferrer">Read ingredient labels</a><a class="btn secondary" href="/external-washes/" target="_blank" rel="noopener noreferrer">Browse the wash comparison</a><button class="btn" data-action="close">Keep my answers</button>');
 else if(a==='details')details(v);else if(a==='approach')approach(v);else if(a==='privacy')privacy();else if(a==='retry')load();
}
function renderError(){root.innerHTML='<section class="state-result"><h1 tabindex="-1">Your result could not load.</h1><p class="helper">Your answers are still here.</p><button class="btn" data-action="retry">Try again</button><a class="btn secondary" href="/external-washes/">Browse comparisons</a></section>';}
async function load(){
 try{
  const [a,b]=await Promise.all([fetch('./catalog.json',{cache:'no-store'}),fetch('./config.json',{cache:'no-store'})]);
  if(!a.ok||!b.ok)throw Error('Unavailable');catalog=validateCatalog(await a.json());config=await b.json();
  if(config.tracking_id!=='menopausewash-20')throw Error('Invalid configuration');failed=false;render();
 }catch{failed=true;renderError();}
}
root.addEventListener('change',handleChange);root.addEventListener('click',handleAction);dialog.addEventListener('change',handleChange);dialog.addEventListener('click',handleAction);
root.addEventListener('input',e=>{if(e.target.id==='allergy-detail'){answers.allergy=e.target.value;root.querySelector('[data-action="next"]').disabled=!answers.allergy.trim();}});
dialog.addEventListener('input',e=>{if(e.target.id==='product-search'){const q=e.target.value.toLowerCase().trim(),found=catalog.filter(p=>(p.name+' '+p.variant).toLowerCase().includes(q));dialog.querySelector('.search-results').innerHTML=found.length?found.map(p=>productChoice(p,true)).join(''):'<p>No exact product found. You can continue without guessing the formula.</p>';}});
dialog.addEventListener('keydown',e=>{if(e.key!=='Tab')return;const c=[...dialog.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(x=>!x.disabled&&x.getClientRects().length),first=c[0],last=c.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus();}});
dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
const menuToggle=document.querySelector('#menu-toggle'),menu=document.querySelector('#finder-menu');
function closeMenu(){menu.hidden=true;menuToggle.setAttribute('aria-expanded','false');}
menuToggle.addEventListener('click',()=>{menu.hidden=!menu.hidden;menuToggle.setAttribute('aria-expanded',String(!menu.hidden));});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!menu.hidden){closeMenu();menuToggle.focus();}});
document.addEventListener('click',e=>{if(!menu.hidden&&!e.target.closest('#finder-menu')&&!e.target.closest('#menu-toggle'))closeMenu();});
document.querySelector('#menu-motion').addEventListener('click',toggleMotion);document.querySelector('#menu-privacy').addEventListener('click',()=>{closeMenu();privacy();});
systemMotion.addEventListener('change',e=>{if(e.matches){reduced=true;updateMotion();}});updateMotion();load();
