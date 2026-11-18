const {test} = require('node:test');
const assert = require('node:assert/strict');
const {Game, CARE_MS, RANK_MS} = require('./policy-engine.js');
const now = Date.UTC(2026,10,18,1);
const catalog = [{id:'a',maxXp:100},{id:'b',maxXp:200}];
const make = (extra={}) => new Game(catalog,{now,initialIds:['a','b'],initialRatio:.3,...extra});
const near = (actual,expected) => assert.ok(Math.abs(actual-expected)<1e-5, `${actual} != ${expected}`);

test('new players earn Soul only from actual restored XP',()=>{
  const game=make();
  assert.equal(game.soulTotal(),0);
  assert.equal(game.touch('a',now),15);
  assert.equal(game.soulTotal(),15);
  game.setRatio(95,now);
  near(game.touch('a',now),5);
  assert.equal(game.soulTotal(),20);
  assert.equal(game.touch('a',now),0);
  assert.equal(game.touch('unknown',now),0);
  assert.equal(game.soulTotal(),20);
});

test('time, rank ticks and offline reload reduce care but never Soul',()=>{
  const game=make();
  game.charge(now,0);
  near(game.soulTotal(),210);
  game.advance(now+CARE_MS/2);
  near(game.total(now+CARE_MS/2),195);
  near(game.soulTotal(),210);
  const restored=make({saved:JSON.parse(game.serialize()),now:now+CARE_MS*10});
  near(restored.total(now+CARE_MS*10),90);
  near(restored.soulTotal(),210);
  restored.advance(now+CARE_MS*11);
  near(restored.soulTotal(),210);
  assert.ok(restored.state.rankingScore>0);
});

test('free and paid bulk charge add exact recovery; full charge adds nothing',()=>{
  const game=make();
  for(let i=0;i<4;i++) {
    game.setRatio(30,now);
    const result=game.charge(now,i<3?0:1);
    assert.equal(result.ok,true);
    near(result.xp,210);
    near(game.soulTotal(),210*(i+1));
  }
  assert.equal(game.state.gems,1199);
  assert.equal(game.state.freeUsed,3);
  assert.equal(game.charge(now,1).reason,'full');
  near(game.soulTotal(),840);
});

test('failed charges and quotes cannot earn Soul or consume balances',()=>{
  const game=make();
  game.quote(now); game.quote(now);
  assert.equal(game.charge(now,1).reason,'changed');
  assert.equal(game.soulTotal(),0);
  assert.equal(game.state.freeUsed,0);
  game.state.freeUsed=3; game.state.gems=0;
  assert.equal(game.charge(now,1).reason,'gems');
  assert.equal(game.soulTotal(),0);
  assert.equal(game.state.gems,0);
});

test('demo, removal, acquisition and pause/resume never create or remove Soul',()=>{
  const game=make(); game.touch('a',now);
  game.setRatio(100,now); game.setRatio(30,now);
  game.setOwned([],now);
  near(game.soulTotal(),15);
  game.acquire('a',now); game.acquire('a',now);
  near(game.soulTotal(),15);
  game.pause(now); game.resume(now+CARE_MS);
  near(game.soulTotal(),15);
});

test('existing peak migrates once, preserving claims and genuine saved zero',()=>{
  const old=make();
  old.setRatio(100,now); old.advance(now);
  const saved=JSON.parse(old.serialize());
  delete saved.cumulativeSoul;
  saved.claimed=[1,2];
  const migrated=make({saved,now:now+CARE_MS*3});
  near(migrated.soulTotal(),300);
  assert.deepEqual(migrated.state.claimed,[1,2]);
  migrated.touch('a',now+CARE_MS*3);
  const reloaded=make({saved:JSON.parse(migrated.serialize()),now:now+CARE_MS*4});
  near(reloaded.soulTotal(),315);
  const zeroSaved=JSON.parse(old.serialize());
  zeroSaved.cumulativeSoul=0;
  assert.equal(make({saved:zeroSaved}).soulTotal(),0);
});

test('Soul has no character-capacity ceiling and remains above rewards after decay',()=>{
  const game=make();
  for(let i=0;i<30;i++) {game.setRatio(30,now);game.charge(now);}
  near(game.soulTotal(),6300);
  assert.ok(game.soulTotal()>game.maxTotal());
  game.advance(now+CARE_MS*2);
  near(game.soulTotal(),6300);
  assert.ok(game.soulTotal()>=5000);
});

test('ranking still integrates character care, independently of cumulative Soul',()=>{
  const game=make(); game.charge(now,0);
  game.advance(now+RANK_MS);
  near(game.state.rankingScore,90+210*(1-RANK_MS/CARE_MS));
  near(game.soulTotal(),210);
});
