/* 經彩青春Do｜高中版分支互動遊戲：三次選擇、兩階段結尾及回饋。 */
(() => {
  'use strict';
  const story = window.STORY_DATA;
  const $ = id => document.getElementById(id);
  const dom = {
    intro:$('intro'),game:$('game'),ending:$('ending'),reset:$('header-reset'),start:$('start-btn'),back:$('back-btn'),again:$('again-btn'),rethink:$('rethink-btn'),confirm:$('confirm-btn'),
    sceneTitle:$('scene-title'),sceneText:$('scene-narrative'),sceneChip:$('scene-chip'),sceneNumber:$('scene-number'),sceneImage:$('scene-image'),imagePlaceholder:$('image-placeholder'),
    choices:$('choices'),step:$('step-fraction'),fill:$('progress-fill'),trail:$('route-trail'),endingTitle:$('ending-title'),endingIntro:$('ending-intro'),
    code:$('ending-code'),journey:$('journey-steps'),confirmActions:$('confirm-actions'),feedbackSection:$('feedback-section'),feedbackHeading:$('feedback-heading'),
    positive:$('positive-text'),improve:$('improve-text'),status:$('status-text'),statusIcon:$('status-icon')
  };
  if (!story || !story.nodes || !story.endings) {
    const intro = document.querySelector('.guide-intro');
    if (intro) intro.textContent = '遊戲資料載入失敗，請重新整理頁面。';
    dom.start.disabled = true;
    return;
  }
  const passRoutes = new Set(story.passRoutes || []);
  const letters=['A','B','C'];
  let trail=[], current=story.start, finished=null, confirmed=false;
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  function show(page){
    ['intro','game','ending'].forEach(v=>{dom[v].hidden=v!==page;});
    dom.reset.hidden=page==='intro';
    if(typeof window.scrollTo==='function') window.scrollTo({top:0,behavior:'instant'});
  }
  function focus(el){if(el?.focus) el.focus({preventScroll:true});}
  function cover(){trail=[];current=story.start;finished=null;confirmed=false;show('intro');}
  function start(){trail=[];current=story.start;finished=null;confirmed=false;renderScene();}
  function showSceneMedia(sceneId){
    const img=dom.sceneImage,placeholder=dom.imagePlaceholder;
    img.hidden=true;placeholder.hidden=false;
    img.alt=story.nodes[sceneId].title+'情境插圖';
    img.dataset.scene=sceneId;
    img.onload=()=>{if(img.dataset.scene===sceneId && current===sceneId && !dom.game.hidden){img.hidden=false;placeholder.hidden=true;}};
    img.onerror=()=>{if(img.dataset.scene===sceneId){img.hidden=true;placeholder.hidden=false;}};
    // index.html 所在目錄的 images/S0.webp 等檔案，名稱大小寫敏感。
    img.src='./images/'+sceneId+'.webp';
  }
  function renderScene(){
    const node=story.nodes[current];
    if(!node) throw Error('找不到情境：'+current);
    const n=trail.length+1;
    dom.sceneChip.textContent='情境 '+n;
    dom.sceneNumber.textContent=String(n);
    dom.sceneTitle.textContent=node.title;
    dom.sceneText.textContent=node.scene;
    dom.step.innerHTML=String(n).padStart(2,'0')+' <span>/ 03</span>';
    dom.fill.style.width=(n/3*100)+'%';
    dom.back.disabled=trail.length===0;
    dom.trail.textContent=trail.length?'你選了：'+trail.map(t=>t.letter).join(' → '):'從這裡開始';
    dom.choices.innerHTML=letters.map(letter=>{
      const item=node.choices[letter];
      return '<button class="choice" data-choice="'+letter+'" type="button"><span class="choice-letter">'+letter+'</span><span class="choice-body"><strong>'+escapeHtml(item.label)+'</strong><span>'+escapeHtml(item.text)+'</span></span><span class="choice-arrow" aria-hidden="true">→</span></button>';
    }).join('');
    show('game');showSceneMedia(current);focus(dom.sceneTitle);
  }
  function choose(letter){
    if(dom.game.hidden || !letters.includes(letter) || finished)return;
    const option=story.nodes[current]?.choices[letter];
    if(!option)return;
    trail.push({from:current,letter,label:option.label,text:option.text});
    if(story.endings[option.next]){finished=option.next;confirmed=false;renderEnding();}
    else if(story.nodes[option.next]){current=option.next;renderScene();}
    else throw Error('找不到下一節點：'+option.next);
  }
  function renderEnding(){
    const ending=story.endings[finished];
    if(!ending||trail.length!==3) throw Error('結局或選擇次數不正確');
    dom.code.textContent='路徑 '+finished;dom.code.dataset.route=finished;
    // Use the actual played choices; never mismatch Word outcome summary with A/B/C routing.
    dom.journey.innerHTML=trail.map(t=>'<li><span class="journey-label">'+escapeHtml(t.label)+'</span></li>').join('');
    dom.positive.textContent=ending.positive;
    dom.improve.textContent=ending.improve;
    dom.confirmActions.hidden=confirmed;dom.feedbackSection.hidden=!confirmed;
    dom.endingIntro.textContent=confirmed?'看看你做得好的地方，還有哪些地方可以做得更好。':'先看看自己的三次選擇。想清楚後，再按下確定選擇。';
    const passed=passRoutes.has(finished);
    const card=dom.status.closest('.feedback-card');
    card.classList.toggle('passed',passed);card.classList.toggle('retry',!passed);
    dom.statusIcon.textContent=passed?'★':'↻';
    // 通關密碼依使用者指定，與國中版本一致；僅在成功通關時顯示。
    dom.status.textContent=passed?'恭喜你成功通關！\n獲得【經彩青春Do密碼】2599\n意義：愛我久久':'沒有過關，繼續加油，重新開啟另一個旅程，獲得通關密碼！';
    show('ending');focus(confirmed?dom.feedbackHeading:dom.endingTitle);
  }
  function rethink(){
    if(!finished||confirmed||trail.length!==3)return;
    const last=trail.pop();current=last.from;finished=null;confirmed=false;renderScene();
  }
  function confirm(){
    if(!finished||confirmed||trail.length!==3)return;
    confirmed=true;renderEnding();
    if(dom.feedbackSection.scrollIntoView) dom.feedbackSection.scrollIntoView({behavior:'smooth',block:'start'});
    focus(dom.feedbackHeading);
  }
  dom.start.addEventListener('click',start);
  dom.reset.addEventListener('click',cover);
  dom.again.addEventListener('click',cover);
  dom.back.addEventListener('click',()=>{if(!trail.length)return;const last=trail.pop();current=last.from;finished=null;confirmed=false;renderScene();});
  dom.rethink.addEventListener('click',rethink);
  dom.confirm.addEventListener('click',confirm);
  $('brand-link').addEventListener('click',event=>{event.preventDefault();cover();});
  dom.choices.addEventListener('click',e=>{const button=e.target.closest('button[data-choice]');if(button)choose(button.dataset.choice);});
  document.addEventListener('keydown',e=>{
    const active=e.target;
    if(e.altKey||e.ctrlKey||e.metaKey||e.repeat||active?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(active?.tagName))return;
    if(!dom.game.hidden){const key=e.key.toUpperCase();if(letters.includes(key)){e.preventDefault();choose(key);}}
  });
  const guideSlides=[...document.querySelectorAll('[data-guide-slide]')];
  const guidePicks=[...document.querySelectorAll('[data-guide]')];
  function setGuide(i){guideSlides.forEach((el,j)=>{const on=i===j;el.classList.toggle('is-active',on);el.setAttribute('aria-hidden',String(!on));});guidePicks.forEach((el,j)=>{const on=i===j;el.classList.toggle('is-active',on);el.setAttribute('aria-pressed',String(on));});}
  guidePicks.forEach(el=>el.addEventListener('click',()=>setGuide(Number(el.dataset.guide))));
  cover();
})();
