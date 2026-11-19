const {test}=require('node:test');
const assert=require('node:assert/strict');
const color=require('./color-adjustment.js');
const neutral={saturation:0,black:0,gamma:1,white:255};
test('neutral recipe preserves RGB values',()=>{
  for(const pixel of [[0,0,0],[255,255,255],[128,64,32],[10,220,64]])
    assert.deepEqual(color.sample(pixel,neutral),pixel);
});
test('input endpoints clip, gamma changes midtones, and alpha is not part of the RGB recipe',()=>{
  assert.deepEqual(color.sample([16,16,16],{...neutral,black:16,white:240}),[0,0,0]);
  assert.deepEqual(color.sample([240,240,240],{...neutral,black:16,white:240}),[255,255,255]);
  assert.deepEqual(color.sample([64,64,64],{...neutral,gamma:2}),[128,128,128]);
});
test('saturation and white input use the documented sRGB matrix and LUT order',()=>{
  assert.deepEqual(color.sample([120,80,40],color.DEFAULTS),[137,84,30]);
  const grey=color.sample([100,100,100],{...neutral,saturation:100});
  assert.deepEqual(grey,[100,100,100]);
});
test('bad values cannot produce invalid levels or non-finite lookup tables',()=>{
  const value=color.normalize({saturation:Infinity,black:999,gamma:-1,white:0});
  assert.deepEqual(value,{saturation:25,black:254,gamma:.1,white:255});
  const {table}=color.recipe(value);
  assert.ok(table.every(n=>Number.isFinite(n)&&n>=0&&n<=1));
  assert.equal(table.length,256);
});
