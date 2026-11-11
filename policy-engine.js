/* Local prototype rules. Production time, payments and rankings must be
   committed by the ZEPETO server; this module deliberately makes no API calls. */
(function (root) {
  'use strict';
  const CARE_MS = 2 * 60 * 60 * 1000;
  const RANK_MS = 10 * 60 * 1000;
  const BASE_RATIO = 0.30;
  const EPS = 1e-7;
  const round = n => Math.round(n * 1e6) / 1e6;
  const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const dayFormatters = new Map();
  function dayKey(at, timeZone) {
    if (!dayFormatters.has(timeZone)) dayFormatters.set(timeZone,new Intl.DateTimeFormat('en-CA', { timeZone, year:'numeric', month:'2-digit', day:'2-digit' }));
    return dayFormatters.get(timeZone).format(at);
  }
  class Game {
    constructor(catalog, { now = Date.now(), saved = null, initialIds = [], initialRatio = 1, timeZone = 'Asia/Seoul' } = {}) {
      this.catalog = new Map(catalog.map(p => [p.id, { ...p }]));
      this.timeZone = timeZone;
      this.pausedAt = null;
      this.state = { version:1, species:{}, lastRankAt:now, lastAt:now,
        rankingScore:0, peakSoul:0, gems:1200, dailyDay:dayKey(now,timeZone),
        freeUsed:0, claimed:[], positions:{}, view:null };
      if (saved && saved.version === 1 && Number.isFinite(saved.lastAt) && saved.lastAt <= now + 60000) {
        this.state.lastRankAt = Number.isFinite(saved.lastRankAt) ? Math.min(now, saved.lastRankAt) : now;
        this.state.lastAt = Math.min(now, saved.lastAt);
        this.state.rankingScore = Math.max(0, Number(saved.rankingScore) || 0);
        this.state.peakSoul = Math.max(0, Number(saved.peakSoul) || 0);
        this.state.gems = Math.max(0, Math.floor(Number(saved.gems) || 0));
        this.state.dailyDay = typeof saved.dailyDay === 'string' ? saved.dailyDay : this.state.dailyDay;
        this.state.freeUsed = clamp(Math.floor(Number(saved.freeUsed) || 0),0,3);
        this.state.claimed = Array.isArray(saved.claimed) ? [...new Set(saved.claimed.filter(Number.isInteger))] : [];
        this.state.positions = saved.positions && typeof saved.positions === 'object' ? saved.positions : {};
        this.state.view = saved.view && Number.isFinite(saved.view.x) && Number.isFinite(saved.view.y) ? saved.view : null;
        for (const [id, entry] of Object.entries(saved.species || {})) {
          const item = this.catalog.get(id);
          if (!item || !Number.isFinite(entry.acquiredAt)) continue;
          const lots = (Array.isArray(entry.lots) ? entry.lots : []).filter(lot =>
            Number.isFinite(lot.amount) && lot.amount > 0 && Number.isFinite(lot.at) && lot.at <= now + 60000
          ).map(lot => ({ amount:Math.min(item.maxXp * .7,lot.amount), at:lot.at }));
          this.state.species[id] = { acquiredAt:Math.min(now,entry.acquiredAt), lots };
        }
      } else {
        for (const id of new Set(initialIds)) this._add(id,now,initialRatio);
      }
      this.advance(now);
    }
    at(now) { return this.pausedAt === null ? Math.max(this.state.lastAt,now) : this.pausedAt; }
    ownedIds() { return [...this.catalog.keys()].filter(id => !!this.state.species[id]); }
    _add(id, now, ratio = 1) {
      const item = this.catalog.get(id);
      if (!item || this.state.species[id]) return false;
      const care = item.maxXp * (clamp(ratio,BASE_RATIO,1) - BASE_RATIO);
      this.state.species[id] = { acquiredAt:now, lots:care > EPS ? [{ amount:care,at:now }] : [] };
      return true;
    }
    current(id, now) {
      const item = this.catalog.get(id), entry = this.state.species[id];
      if (!item || !entry) return 0;
      const at = this.at(now);
      const care = entry.lots.reduce((sum,lot) => sum + lot.amount * clamp(1-(at-lot.at)/CARE_MS,0,1),0);
      return Math.min(item.maxXp,item.maxXp*BASE_RATIO + care);
    }
    total(now) { return this.ownedIds().reduce((sum,id) => sum + this.current(id,now),0); }
    capacity() { return this.ownedIds().reduce((sum,id) => sum + this.catalog.get(id).maxXp,0); }
    maxTotal() { return [...this.catalog.values()].reduce((sum,item) => sum + item.maxXp,0); }
    advance(now) {
      const at = this.at(now), start = this.state.lastRankAt;
      const ticks = Math.max(0,Math.floor((at-start)/RANK_MS));
      if (ticks) {
        let increment = 0;
        for (const [id, entry] of Object.entries(this.state.species)) {
          const item = this.catalog.get(id);
          const first = Math.max(1,Math.ceil((entry.acquiredAt-start)/RANK_MS));
          if (first <= ticks) increment += item.maxXp*BASE_RATIO*(ticks-first+1);
          for (const lot of entry.lots) {
            const lo = Math.max(first,Math.ceil((lot.at-start)/RANK_MS));
            const hi = Math.min(ticks,Math.floor((lot.at+CARE_MS-start)/RANK_MS));
            if (lo > hi) continue;
            const count = hi-lo+1;
            increment += lot.amount * (count*(1-(start-lot.at)/CARE_MS) - RANK_MS/CARE_MS*(lo+hi)*count/2);
          }
        }
        this.state.rankingScore = round(this.state.rankingScore + Math.max(0,increment));
        this.state.lastRankAt += ticks*RANK_MS;
      }
      this.state.lastAt = at;
      this.state.peakSoul = Math.max(this.state.peakSoul,this.total(at));
      for (const entry of Object.values(this.state.species)) entry.lots = entry.lots.filter(lot => lot.at+CARE_MS > at);
      const day = dayKey(now,this.timeZone);
      if (day !== this.state.dailyDay) { this.state.dailyDay = day; this.state.freeUsed = 0; }
      return this.total(at);
    }
    acquire(id, now) {
      this.advance(now);
      const added = this._add(id,this.at(now));
      this.state.peakSoul = Math.max(this.state.peakSoul,this.total(now));
      return { added, duplicate:!added && this.catalog.has(id) };
    }
    touch(id, now) {
      this.advance(now);
      const item = this.catalog.get(id), entry = this.state.species[id];
      if (!item || !entry) return 0;
      const added = Math.min(15,Math.max(0,item.maxXp-this.current(id,now)));
      if (added > EPS) entry.lots.push({ amount:added,at:this.at(now) });
      this.state.peakSoul = Math.max(this.state.peakSoul,this.total(now));
      return added > EPS ? added : 0;
    }
    quote(now) {
      this.advance(now);
      const targets = this.ownedIds().map(id => ({ id, missing:Math.max(0,this.catalog.get(id).maxXp-this.current(id,now)) })).filter(p=>p.missing>EPS);
      return { targets, count:targets.length, xp:targets.reduce((sum,p)=>sum+p.missing,0), after:this.capacity(), cost:this.state.freeUsed<3?0:1, freeLeft:Math.max(0,3-this.state.freeUsed), day:this.state.dailyDay };
    }
    charge(now, expectedCost) {
      const quote = this.quote(now);
      if (!quote.count) return { ok:false,reason:'full' };
      if (expectedCost !== undefined && expectedCost !== quote.cost) return { ok:false,reason:'changed' };
      if (this.state.gems < quote.cost) return { ok:false,reason:'gems' };
      for (const target of quote.targets) this.state.species[target.id].lots.push({ amount:target.missing,at:this.at(now) });
      if (quote.cost === 0) this.state.freeUsed += 1;
      else this.state.gems -= quote.cost;
      this.state.peakSoul = Math.max(this.state.peakSoul,this.total(now));
      return { ok:true, ...quote };
    }
    setRatio(percent, now) {
      this.advance(now);
      const ratio = clamp(Number(percent)/100,BASE_RATIO,1);
      for (const id of this.ownedIds()) {
        const care = this.catalog.get(id).maxXp*(ratio-BASE_RATIO);
        this.state.species[id].lots = care>EPS ? [{ amount:care,at:this.at(now) }] : [];
      }
    }
    setOwned(ids, now) {
      this.advance(now);
      const selected = new Set(ids);
      for (const id of this.ownedIds()) if (!selected.has(id)) delete this.state.species[id];
      for (const id of selected) this._add(id,this.at(now));
    }
    pause(now) { this.advance(now); this.pausedAt = this.at(now); }
    resume(now) {
      if (this.pausedAt === null) return;
      const delay = Math.max(0,now-this.pausedAt);
      for (const entry of Object.values(this.state.species)) {
        entry.acquiredAt += delay;
        for (const lot of entry.lots) lot.at += delay;
      }
      this.state.lastRankAt += delay;
      this.state.lastAt += delay;
      this.pausedAt = null;
      this.advance(now);
    }
    serialize() { return JSON.stringify(this.state); }
  }
  const api = { Game, CARE_MS, RANK_MS, BASE_RATIO, dayKey };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.TeeniepingPolicy = api;
})(typeof globalThis === 'object' ? globalThis : this);
