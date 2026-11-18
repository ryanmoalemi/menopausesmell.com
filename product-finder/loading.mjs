import {reviewsForProduct, featuredReviews} from './reviews.mjs?v=4cfc2c1ec21f';

export const DEFAULT_STAGE_MS = 3200;
const categories = {
  cleanser:'body washes and cleansers', deodorant:'odor-control products',
  antiperspirant:'sweat-control products', moisture:'moisture-control products',
  laundry:'laundry products for odor', bladder:'bladder-leak products',
  underwear:'underwear options', cloth:'soft washcloths', rinse:'rinsing options',
  barrier:'skin-protection products', vaginal_moisturizer:'vaginal moisturizers',
  lubricant:'personal lubricants', probiotic:'supplement options'
};
const list = value => Array.isArray(value) ? value : [];
export function canCelebrate(result) {
  return result?.kind === 'product' && !!result.primary &&
    list(result.recommendations).length > 0 && !result.care && !result.allergyReview;
}
export function concernPhrase(a) {
  const c=list(a.concerns);
  if (a.area==='urine_leakage'||c.includes('urine')) return 'bladder leaks';
  if (c.includes('dryness')) return 'vaginal dryness';
  if (c.includes('friction')) return 'comfort during intimacy';
  if (a.area==='underarms') {
    if(c.includes('both')) return 'underarm odor and sweating';
    if(c.includes('wetness')) return 'underarm sweating';
    return 'underarm odor';
  }
  if(c.includes('chafe')) return 'skin rubbing and chafing';
  if(c.includes('damp')) return a.area==='body_folds'?'damp skin folds':'damp body skin';
  if(a.area==='outer_groin'||c.includes('outside')) return 'outer-skin care';
  if(c.includes('clothes')) return 'body odor and odor in clothes';
  return 'body odor';
}
export function matchedExperiences(a,result,data,now=Date.now()) {
  const seen=new Set();
  return list(result?.recommendations).filter(x=>x.section!=='optional').flatMap(({product})=>
    featuredReviews(reviewsForProduct(a,product,data,now).filter(r=>r.matchedTags.length>0),2)
  ).filter(r=>{const key=r.sourceUrl+'|'+r.quote;if(seen.has(key))return false;seen.add(key);return true;});
}
export function loadingSteps(a,result,data,now=Date.now()) {
  const topic=concernPhrase(a), matched=matchedExperiences(a,result,data,now);
  const s=list(a.sensitivities), allergies=list(a.allergies);
  const tried=list(a.tried).some(id=>id!=='unknown');
  let personal='Putting your main concern first in your recommendations.';
  if(allergies.length) personal=tried?'Checking ingredient restrictions and products you already tried.':'Checking your picks against your ingredient restrictions.';
  else if(s.includes('fragrance')) personal=tried?'Checking fragrance preferences and products already tried.':'Checking your picks against your fragrance preferences.';
  else if(s.includes('reactive')) personal=tried?'Considering sensitive skin and products you already tried.':'Considering your sensitive-skin preferences.';
  else if(tried) personal='Leaving out the exact products you said did not work.';
  else if(list(a.triedCategories).some(id=>id!=='nothing')) personal='Considering the approaches you have already tried.';
  const category=categories[result?.primary?.category||'cleanser']||'product options';
  return [
    {label:matched.length?'REAL EXPERIENCES':'YOUR STARTING POINT',icon:matched.length?'chat':'search',text:matched.length?'Using relevant experiences from our saved Reddit research.':`Matching options to your ${topic} needs.`,status:'Making it personal'},
    {label:'AMAZON PRODUCT OPTIONS',icon:'bag',text:`Comparing ${category} in our researched shortlist.`,status:'Finding your fit'},
    {label:'MATCHED TO YOU',icon:'leaf',text:personal,status:'Checking the details'},
    {label:'YOUR NEXT STEP',icon:'spark',text:`Putting together your picks for ${topic}…`,status:'Your picks are almost ready!'}
  ];
}
export function timeline(elapsed,stageMs=DEFAULT_STAGE_MS) {
  if(!Number.isFinite(stageMs)||stageMs<=0)throw new RangeError('stageMs must be positive');
  const t=Math.max(0,elapsed), done=t>=stageMs*4;
  const index=Math.min(3,Math.floor(t/stageMs));
  return {index,progress:done?1:(t-index*stageMs)/stageMs,done};
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const paths={
 chat:'<path d="M4 5h24v17H14l-7 6v-6H4z"/><path d="M9 11h14M9 16h10"/>',
 search:'<circle cx="14" cy="14" r="9"/><path d="m21 21 8 8"/>',
 bag:'<path d="M7 11h18l2 18H5z"/><path d="M11 12V8a5 5 0 0 1 10 0v4M11 20q5 6 10 0"/>',
 leaf:'<path d="M16 29V17M16 21C5 22 3 16 3 9c8-1 13 3 13 12ZM16 17C15 7 21 3 29 3c0 9-4 14-13 14Z"/>',
 spark:'<path d="m16 3 4 9 9 4-9 4-4 9-4-9-9-4 9-4Z"/>'
};
const icon=name=>`<svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.spark}</svg>`;
export function loadingMarkup(steps) {
  return `<section class="mw-loading" aria-labelledby="mw-loading-title" aria-busy="true">
    <button type="button" class="mw-loading-back" data-action="back">‹ Back</button>
    <div class="mw-loading-hero" aria-hidden="true">${icon('spark')}<span>✦</span></div>
    <p class="mw-loading-eyebrow">A LITTLE CLARITY. A NEXT STEP.</p>
    <h1 id="mw-loading-title" tabindex="-1">Your picks are taking shape.</h1>
    <p class="mw-loading-status" role="status" aria-live="polite" aria-atomic="true"></p>
    <ol class="mw-loading-steps" aria-label="Preparing your recommendations">${steps.map((s,i)=>`<li class="mw-loading-step${i===3?' mw-finale':''}">
      <div class="mw-step-icon">${icon(s.icon)}<span>${i+1}</span></div>
      <div class="mw-step-copy"><p>${esc(s.label)}</p><h2>${esc(s.text)}</h2><div class="mw-step-track" aria-hidden="true"><span></span></div></div>
      ${i===3?'<div class="mw-sparkles" aria-hidden="true"><i>✦</i><i>✧</i><i>✦</i></div>':''}
    </li>`).join('')}</ol>
  </section>`;
}

// The result already exists. These stages present the actual matching work,
// rather than initiating remote searches with sensitive questionnaire answers.
export function createRecommendationReveal({root,stageMs=DEFAULT_STAGE_MS,clock=()=>performance.now(),requestFrame=cb=>requestAnimationFrame(cb),cancelFrame=id=>cancelAnimationFrame(id),documentRef=globalThis.document,windowRef=globalThis.window,isPaused=()=>documentRef?.hidden}={}) {
  timeline(0,stageMs);
  let frame=null,generation=0,active=false,removeVisibility=()=>{};
  function cancel(){generation++;active=false;if(frame!==null)cancelFrame(frame);frame=null;removeVisibility();removeVisibility=()=>{};root?.classList.remove('mw-reveal');}
  function start({steps,onReady}) {
    cancel();const id=generation;active=true;
    root.innerHTML=loadingMarkup(steps);
    const rows=[...root.querySelectorAll('.mw-loading-step')],status=root.querySelector('.mw-loading-status');
    let elapsed=0,last=clock(),prior=-1;
    const visibility=()=>{last=clock();};
    documentRef?.addEventListener('visibilitychange',visibility);
    removeVisibility=()=>documentRef?.removeEventListener('visibilitychange',visibility);
    function paint(state) {
      if(state.index!==prior){
        rows.forEach((row,i)=>{row.classList.toggle('is-active',i===state.index);row.classList.toggle('is-done',i<state.index);if(i===state.index)row.setAttribute('aria-current','step');else row.removeAttribute('aria-current');});
        status.textContent=`${state.index+1} of 4 · ${steps[state.index].status}`;prior=state.index;
      }
      rows.forEach((row,i)=>row.querySelector('.mw-step-track span').style.transform=`scaleX(${i<state.index?1:i===state.index?state.progress:0})`);
    }
    paint(timeline(0,stageMs));
    windowRef?.scrollTo({top:0,behavior:'instant'});
    root.querySelector('h1')?.focus({preventScroll:true});
    function tick(){
      if(!active||id!==generation)return;
      const now=clock();if(!isPaused())elapsed+=Math.max(0,now-last);last=now;
      const state=timeline(elapsed,stageMs);paint(state);
      if(state.done){active=false;frame=null;removeVisibility();removeVisibility=()=>{};root.querySelector('.mw-loading')?.setAttribute('aria-busy','false');onReady();return;}
      frame=requestFrame(tick);
    }
    frame=requestFrame(tick);
  }
  return {start,cancel,get active(){return active;}};
}
