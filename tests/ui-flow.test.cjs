"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const read=x=>fs.readFileSync(path.join(__dirname,"..",x),"utf8");
const storyCtx={window:{}};
vm.runInNewContext(read("data/story.js"),storyCtx);
const story=storyCtx.window.STORY_DATA;
function fakeElement(){
 const classes=new Set();
 return {hidden:false,disabled:false,src:"",dataset:{},style:{},innerHTML:"",textContent:"",attributes:{},
  handlers:{},classList:{contains:k=>classes.has(k),toggle:(k,v)=>{const ok=v===undefined?!classes.has(k):v;if(ok)classes.add(k);else classes.delete(k)}},
  addEventListener(k,fn){this.handlers[k]=fn},setAttribute(k,v){this.attributes[k]=v},
  closest(){return this.card},focus(){},scrollIntoView(){},querySelector(){return null}
 };
}
function harness(){
 const ids=["intro","game","ending","header-reset","start-btn","back-btn","again-btn","rethink-btn","confirm-btn",
 "scene-title","scene-narrative","scene-chip","scene-number","scene-image","image-placeholder","choices",
 "step-fraction","progress-fill","route-trail","ending-title","ending-intro","ending-code",
 "journey-steps","confirm-actions","feedback-section","feedback-heading","conclusion-text",
 "positive-text","improve-text","status-text","status-icon","brand-link"];
 const el=Object.fromEntries(ids.map(id=>[id,fakeElement()]));
 el["status-text"].card=fakeElement();
 const slides=[0,1,2].map(fakeElement),picks=[0,1,2].map((_,i)=>{const e=fakeElement();e.dataset.guide=String(i);return e;});
 const document={handlers:{},getElementById(id){return el[id]??null;},
  querySelectorAll(q){return q==="[data-guide-slide]"?slides:q==="[data-guide]"?picks:[];},
  addEventListener(k,fn){this.handlers[k]=fn}};
 const window={STORY_DATA:story,scrollTo(){},matchMedia(){return {matches:true}},setInterval(){}};
 vm.runInNewContext(read("assets/app.js"),{window,document,console},{filename:"assets/app.js"});
 const click=id=>el[id].handlers.click();
 const choose=l=>document.handlers.keydown({key:l,altKey:false,ctrlKey:false,metaKey:false,repeat:false,
  target:{tagName:"BODY",isContentEditable:false},preventDefault(){}});
 return {el,click,choose};
}
test("起始畫面與素材佔位正常",()=>{
 const g=harness();
 assert.equal(g.el.intro.hidden,false);
 g.click("start-btn");
 assert.equal(g.el.game.hidden,false);
 assert.equal(g.el["scene-title"].textContent,story.nodes.S0.title);
 assert.equal(g.el["scene-image"].src,"./images/S0.webp");
 assert.equal(g.el["image-placeholder"].hidden,false);
});
test("27 條路徑均能選擇、確認、顯示討論收束與雙向回饋",()=>{
 for(const a of "ABC")for(const b of "ABC")for(const c of "ABC"){
  const route=a+b+c,g=harness(),e=g.el;
  g.click("start-btn");
  for(const l of route)g.choose(l);
  assert.equal(e.ending.hidden,false,route);
  assert.equal(e["ending-code"].dataset.route,route);
  assert.equal(e["feedback-section"].hidden,true,route);
  g.click("confirm-btn");
  assert.equal(e["feedback-section"].hidden,false,route);
  assert.equal(e["conclusion-text"].textContent,story.endings[route].conclusion,route);
  assert.equal(e["positive-text"].textContent,story.endings[route].positive,route);
  assert.equal(e["improve-text"].textContent,story.endings[route].improve,route);
  assert.equal(e["status-text"].card.classList.contains("passed"),route==="AAB"||route==="CBA",route);
  g.click("again-btn");
  assert.equal(e.intro.hidden,false,route);
 }
});
test("最後確認前可以回到第三次選擇修正",()=>{
 const g=harness();g.click("start-btn");
 for(const l of "AAB")g.choose(l);
 assert.equal(g.el["ending-code"].dataset.route,"AAB");
 g.click("rethink-btn");
 assert.equal(g.el.game.hidden,false);
 assert.equal(g.el["scene-title"].textContent,story.nodes.AA2.title);
 g.choose("A");
 assert.equal(g.el["ending-code"].dataset.route,"AAA");
});
