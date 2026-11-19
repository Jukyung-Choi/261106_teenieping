/* Shared sRGB color recipe used by the live demo and file-export tooling.
   This is an RGB matrix saturation preview, not Photoshop's HSL implementation. */
(function(root) {
  'use strict';
  const ALGORITHM = 'srgb-matrix-levels-v1';
  const DEFAULTS = Object.freeze({saturation:25,black:0,gamma:1,white:240});
  const finite = (value,fallback) => value !== '' && Number.isFinite(Number(value)) ? Number(value) : fallback;
  const clamp = (n,lo,hi) => Math.max(lo,Math.min(hi,n));
  function normalize(input={}) {
    const black = Math.round(clamp(finite(input.black,DEFAULTS.black),0,254));
    return {
      saturation:Math.round(clamp(finite(input.saturation,DEFAULTS.saturation),-100,100)),
      black,
      gamma:Math.round(clamp(finite(input.gamma,DEFAULTS.gamma),.1,3)*100)/100,
      white:Math.round(clamp(finite(input.white,DEFAULTS.white),black+1,255)),
    };
  }
  function recipe(input) {
    const settings = normalize(input);
    const factor = 1 + settings.saturation/100;
    const table = Array.from({length:256},(_,index) => Number(
      Math.pow(clamp((index-settings.black)/(settings.white-settings.black),0,1),1/settings.gamma).toFixed(7)
    ));
    return {settings,factor,table};
  }
  function sample(rgb,input) {
    const {factor,table} = recipe(input);
    const luminance = .213*rgb[0]+.715*rgb[1]+.072*rgb[2];
    return rgb.map(channel => {
      const value = clamp(luminance+(channel-luminance)*factor,0,255);
      const low = Math.floor(value), high = Math.min(255,low+1);
      return Math.round((table[low]+(table[high]-table[low])*(value-low))*255);
    });
  }
  const api={ALGORITHM,DEFAULTS,normalize,recipe,sample};
  if(typeof module!=='undefined' && module.exports) module.exports=api;
  else root.TeeniepingColor=api;
})(typeof globalThis==='object'?globalThis:this);
