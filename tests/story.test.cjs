'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
const ctx={window:{}};vm.runInNewContext(read('data/story.js'),ctx);
const d=ctx.window.STORY_DATA;
test('新版 Word：13 情境、39 選項、27 結局、4 條通關',()=>{
 assert.equal(Object.keys(d.nodes).length,13);
 assert.equal(Object.values(d.nodes).flatMap(x=>Object.values(x.choices)).length,39);
 assert.equal(Object.keys(d.endings).length,27);
 assert.deepEqual(Array.from(d.passRoutes),['BBA','BBC','BCA','CBA']);
 assert.equal(d.start,'S0');
});
test('每項都為四字標籤，且下一節點存在',()=>{
 for(const [id,n] of Object.entries(d.nodes)){
  assert.ok(n.title&&n.scene,id);
  assert.deepEqual(Object.keys(n.choices),['A','B','C'],id);
  for(const [l,c] of Object.entries(n.choices)){
   assert.match(c.label,/^[\u3400-\u9fff]{4}$/u,id+l);
   assert.ok(c.text.length>8,id+l);
   assert.ok(d.nodes[c.next]||d.endings[c.next],id+l);
  }
 }
});
test('所有三回合結局與選項路徑同名',()=>{
 const found=new Set();
 for(const a of 'ABC')for(const b of 'ABC')for(const c of 'ABC'){
  const route=a+b+c;let id=d.start;
  for(const letter of route){assert.ok(d.nodes[id],route);id=d.nodes[id].choices[letter].next;}
  assert.equal(id,route);const o=d.endings[id];assert.ok(o&&o.positive&&o.improve,route);
  assert.equal(o.steps.length,3,route);found.add(id);
 }
 assert.equal(found.size,27);
});
test('BB2、BC2 的交叉 END 誤植依 A/B/C 語意正規化',()=>{
 assert.equal(d.nodes.BB2.choices.A.next,'BBA');
 assert.equal(d.nodes.BB2.choices.C.next,'BBC');
 assert.equal(d.nodes.BC2.choices.A.next,'BCA');
 assert.equal(d.nodes.BC2.choices.B.next,'BCB');
});
test('前端移除討論收束，仍保有國中版相同的三張回饋卡',()=>{
 const html=read('index.html'),app=read('assets/app.js');
 assert.ok(html.includes('經彩青春<span class="brand-highlight">Do</span>'));
 assert.ok(html.includes('一場月經健康與福祉的永續之旅'));
 assert.ok(!html.includes('從一場論壇討論，看見不同立場'));
 assert.ok(!html.includes('conclusion-text'));
 assert.ok(!html.includes('討論收束'));
 assert.ok(html.includes('做得好的地方')&&html.includes('可以改進的地方')&&html.includes('關卡認證'));
 assert.ok(app.includes('passRoutes.has(finished)'));
});
test('所有圖片存在且以節點 ID 精確命名',()=>{
 for(const id of Object.keys(d.nodes)){
  const p=path.join(__dirname,'../images',id+'.webp');assert.ok(fs.existsSync(p),p);
  const magic=fs.readFileSync(p).subarray(0,12);
  assert.equal(magic.toString('ascii',0,4),'RIFF');assert.equal(magic.toString('ascii',8,12),'WEBP');
 }
});
