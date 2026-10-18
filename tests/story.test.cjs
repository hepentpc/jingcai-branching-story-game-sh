"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const vm=require("node:vm");
const code=fs.readFileSync(require("node:path").join(__dirname,"../data/story.js"),"utf8");
const context={window:{}};
vm.runInNewContext(code,context);
const story=context.window.STORY_DATA;
const letters=["A","B","C"];
test("雙通關審議稿：13 情境、39 選項、27 結局",()=>{
 assert.equal(Object.keys(story.nodes).length,13);
 assert.equal(Object.values(story.nodes).flatMap(n=>Object.values(n.choices)).length,39);
 assert.equal(Object.keys(story.endings).length,27);
 assert.equal(story.start,"S0");
 assert.equal(story.edition,"高中版");
 assert.deepEqual(Array.from(story.passRoutes),["AAB","CBA"]);
});
test("選項均使用四字行為標籤，節點跳轉完整",()=>{
 for(const [id,node] of Object.entries(story.nodes)){
  assert.ok(node.title&&node.scene&&node.core,id);
  assert.deepEqual(Object.keys(node.choices),["A","B","C"],id);
  for(const [letter,choice] of Object.entries(node.choices)){
   assert.match(choice.label,/^[\u3400-\u9fff]{4}$/u,id+letter);
   assert.ok(choice.text.length>5,id+letter);
   assert.ok(story.nodes[choice.next]||story.endings[choice.next],id+letter);
  }
 }
});
test("27 條路徑精確映射，討論收束及雙向回饋完整",()=>{
 const seen=new Set();
 for(const a of letters)for(const b of letters)for(const c of letters){
  const route=a+b+c;let id=story.start;const steps=[];
  for(const letter of route){assert.ok(story.nodes[id],route);const ch=story.nodes[id].choices[letter];steps.push(ch.label);id=ch.next;}
  assert.equal(id,route);
  const end=story.endings[id];
  assert.ok(end&&end.conclusion&&end.positive&&end.improve,route);
  assert.deepEqual(Array.from(end.steps),steps,route);
  seen.add(id);
 }
 assert.equal(seen.size,27);
});
test("首頁與結局頁包含必要區塊且不挪用國小版劇情影片",()=>{
 const h=fs.readFileSync(require("node:path").join(__dirname,"../index.html"),"utf8");
 const a=fs.readFileSync(require("node:path").join(__dirname,"../assets/app.js"),"utf8");
 assert.match(h,/經彩青春/);assert.match(h,/協奏曲/);assert.match(h,/國高中|高中/);
 assert.match(h,/conclusion-text/);assert.match(h,/image-placeholder/);
 assert.ok(!h.includes("gemini_generated_video_9aa4eba3.mp4"));
 assert.ok(a.includes("ending.conclusion"));
});
