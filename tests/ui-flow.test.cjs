'use strict';
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx={window:{}};vm.runInNewContext(read('data/story.js'),ctx);const d=ctx.window.STORY_DATA;
function el(){const classes=new Set();return {hidden:false,disabled:false,src:'',dataset:{},style:{},innerHTML:'',textContent:'',attributes:{},handlers:{},
 classList:{contains:k=>classes.has(k),toggle:(k,v)=>{let on=v===undefined?!classes.has(k):v;on?classes.add(k):classes.delete(k)}},
 addEventListener(n,f){this.handlers[n]=f},setAttribute(n,v){this.attributes[n]=v},closest(){return this.card},scrollIntoView(){},focus(){}}}
function harness(){
 const ids='intro game ending header-reset start-btn back-btn again-btn rethink-btn confirm-btn scene-title scene-narrative scene-chip scene-number scene-image image-placeholder choices step-fraction progress-fill route-trail ending-title ending-intro ending-code journey-steps confirm-actions feedback-section feedback-heading positive-text improve-text status-text status-icon brand-link'.split(' ');
 const elems=Object.fromEntries(ids.map(k=>[k,el()]));elems['status-text'].card=el();
 const guideSlides=[0,1,2].map(el),guidePicks=[0,1,2].map((_,i)=>{const x=el();x.dataset.guide=String(i);return x});
 const document={handlers:{},getElementById:id=>elems[id]||null,querySelector:()=>null,
  querySelectorAll:q=>q==='[data-guide-slide]'?guideSlides:q==='[data-guide]'?guidePicks:[],addEventListener(n,f){this.handlers[n]=f}};
 const window={STORY_DATA:d,scrollTo(){}};
 vm.runInNewContext(read('assets/app.js'),{window,document,console},{filename:'assets/app.js'});
 const click=id=>elems[id].handlers.click();
 const choose=l=>document.handlers.keydown({key:l,altKey:false,ctrlKey:false,metaKey:false,repeat:false,target:{tagName:'BODY',isContentEditable:false},preventDefault(){}});
 return {elems,click,choose,guideSlides,guidePicks};
}
test('首頁能開始遊戲，第一幕讀取 S0.webp 且三選項存在',()=>{
 const g=harness(),e=g.elems;
 assert.equal(e.intro.hidden,false);g.click('start-btn');
 assert.equal(e.game.hidden,false);
 assert.equal(e['scene-title'].textContent,d.nodes.S0.title);
 assert.equal(e['scene-image'].src,'./images/S0.webp');
 assert.ok(e.choices.innerHTML.includes('形式正義'));
});
test('27 條路徑都能走完且送出才揭露成功／未通關及雙向回饋',()=>{
 for(const a of 'ABC')for(const b of 'ABC')for(const c of 'ABC'){
  const route=a+b+c,g=harness(),e=g.elems;g.click('start-btn');
  for(const l of route)g.choose(l);
  assert.equal(e.ending.hidden,false,route);
  assert.equal(e['ending-code'].dataset.route,route);
  assert.equal(e['feedback-section'].hidden,true,route);
  g.click('confirm-btn');
  assert.equal(e['feedback-section'].hidden,false,route);
  assert.equal(e['positive-text'].textContent,d.endings[route].positive,route);
  assert.equal(e['improve-text'].textContent,d.endings[route].improve,route);
  assert.equal(e['status-text'].card.classList.contains('passed'),d.passRoutes.includes(route),route);
  if(d.passRoutes.includes(route)){
   assert.equal(e['status-text'].textContent,'恭喜你成功通關！\n獲得【經彩青春Do密碼】2599\n意義：愛我久久',route);
  }else{
   assert.equal(e['status-text'].textContent,'沒有過關，繼續加油，重新開啟另一個旅程，獲得通關密碼！',route);
  }
  assert.equal(e['ending-intro'].textContent,'看看你做得好的地方，還有哪些地方可以做得更好。',route);
  const html=e['journey-steps'].innerHTML;
  for (const description of Object.values(d.nodes).flatMap(n=>Object.values(n.choices).map(x=>x.text))){
   assert.ok(!html.includes(description), route);
  }
  assert.ok(!html.includes('journey-desc'),route);
  assert.equal((html.match(/class="journey-label"/g)||[]).length,3,route);
  g.click('again-btn');assert.equal(e.intro.hidden,false,route);
 }
});
test('確認前可以返回第三次選擇重選',()=>{
 const g=harness();g.click('start-btn');for(const l of 'BBA')g.choose(l);
 assert.equal(g.elems['ending-code'].dataset.route,'BBA');
 g.click('rethink-btn');assert.equal(g.elems.game.hidden,false);
 assert.equal(g.elems['scene-title'].textContent,d.nodes.BB2.title);
 g.choose('C');assert.equal(g.elems['ending-code'].dataset.route,'BBC');
});
test('遊戲內上一頁按鈕與圖片代碼吻合',()=>{
 const g=harness();g.click('start-btn');g.choose('A');g.choose('C');
 assert.equal(g.elems['scene-image'].src,'./images/AC2.webp');
 g.click('back-btn');assert.equal(g.elems['scene-image'].src,'./images/A1.webp');
});
