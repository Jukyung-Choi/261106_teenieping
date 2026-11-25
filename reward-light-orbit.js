(() => {
  const canvas=document.getElementById('rewardLightOrbit');
  const context=canvas.getContext('2d');
  const width=393,height=852,travel=700,tail=1000;
  let frame=0,start=0;
  const tau=Math.PI*2;
  // Screenshot arrows: upper-right entry, left/bottom/right/top wrap, lower-left exit.
  const segments=[
    [320,56,250,78,218,104],
    [135,184,84,246,82,350],
    [78,420,69,473,95,490],
    [128,519,218,513,257,490],
    [282,470,320,444,316,400],
    [307,327,294,264,257,255],
    [227,248,194,244,171,251],
    [119,268,69,286,38,326],
    [-24,390,-67,516,-82,661],
    [-96,772,-86,804,-64,814],
  ];
  const samples=[{x:371,y:49,distance:0}];
  let anchor={x:371,y:49},length=0;
  for(const [x1,y1,x2,y2,x3,y3] of segments) {
    for(let i=1;i<=48;i++) {
      const t=i/48,u=1-t;
      const x=u*u*u*anchor.x+3*u*u*t*x1+3*u*t*t*x2+t*t*t*x3;
      const y=u*u*u*anchor.y+3*u*u*t*y1+3*u*t*t*y2+t*t*t*y3;
      const previous=samples[samples.length-1];
      length+=Math.hypot(x-previous.x,y-previous.y);
      samples.push({x,y,distance:length});
    }
    anchor={x:x3,y:y3};
  }
  function point(progress) {
    const distance=Math.max(0,Math.min(1,progress))*length;
    let low=1,high=samples.length-1;
    while(low<high) { const middle=(low+high)>>1;if(samples[middle].distance<distance)low=middle+1;else high=middle; }
    const a=samples[low-1],b=samples[low];
    const fraction=(distance-a.distance)/(b.distance-a.distance||1);
    return {x:a.x+(b.x-a.x)*fraction,y:a.y+(b.y-a.y)*fraction};
  }
  function glow(x,y,radius,color,alpha) {
    const gradient=context.createRadialGradient(x,y,0,x,y,radius);
    gradient.addColorStop(0,`rgba(255,255,255,${alpha})`);
    gradient.addColorStop(.18,`rgba(${color},${alpha*.9})`);
    gradient.addColorStop(1,`rgba(${color},0)`);
    context.fillStyle=gradient;context.beginPath();context.arc(x,y,radius,0,tau);context.fill();
  }
  function stop() {
    cancelAnimationFrame(frame);frame=0;
    canvas.hidden=true;
    context?.clearRect(0,0,width,height);
  }
  function draw(timestamp) {
    const elapsed=timestamp-start;
    if (elapsed>=travel+tail||document.getElementById('rewardReceivedLayer').hidden||document.hidden) {stop();return;}
    context.clearRect(0,0,width,height);
    context.globalCompositeOperation='lighter';
    // A comet with two interlaced pink/cyan ribbons follows the entry, single wrap, and exit once.
    for (let i=110;i>=0;i--) {
      const age=i*7,sample=elapsed-age;
      if (sample<0||sample>travel) continue;
      const p=point(sample/travel);
      const strength=Math.pow(1-i/111,1.15)*Math.min(1,elapsed/100);
      const fade=elapsed>travel?Math.max(0,1-(elapsed-travel)/tail):1;
      const spread=Math.sin(sample*.023)*2.5;
      glow(p.x,p.y+spread,7,'255,105,218',strength*.43*fade);
      glow(p.x+2,p.y-spread,6,'91,224,255',strength*.48*fade);
    }
    // Sparkling stardust remains on the swept path for one second.
    for(let i=0;i<140;i++) {
      const born=i/140*travel,age=elapsed-born;
      if(age<0||age>1000) continue;
      const p=point(born/travel);
      const drift=age/1000;
      const x=p.x+Math.sin(i*2.4)*(3+drift*11);
      const y=p.y+Math.cos(i*1.7)*(3+drift*9);
      const color=i%2?'255,128,223':'111,235,255';
      const twinkle=.35+.65*Math.pow(Math.sin(age*.015+i*1.7),2);
      const alpha=Math.pow(1-drift,.85)*twinkle;
      glow(x,y,i%4===0?7:3.5,color,alpha*.9);
      if(i%4===0) {
        const radius=(2.3+(i%3)*.55)*(.6+.4*twinkle);
        context.fillStyle=`rgba(255,255,255,${alpha})`;
        context.beginPath();
        context.moveTo(x,y-radius*1.5);context.lineTo(x+radius*.3,y-radius*.3);
        context.lineTo(x+radius,y);context.lineTo(x+radius*.3,y+radius*.3);
        context.lineTo(x,y+radius*1.5);context.lineTo(x-radius*.3,y+radius*.3);
        context.lineTo(x-radius,y);context.lineTo(x-radius*.3,y-radius*.3);
        context.closePath();context.fill();
      }
    }
    if(elapsed<travel) {
      const p=point(elapsed/travel);
      glow(p.x,p.y,17,'255,115,222',.7);
      glow(p.x+3,p.y-2,12,'111,235,255',.85);
      context.fillStyle='white';context.beginPath();context.arc(p.x+1,p.y-1,2.1,0,tau);context.fill();
    }
    frame=requestAnimationFrame(draw);
  }
  function play() {
    stop();
    if(!context||matchMedia('(prefers-reduced-motion: reduce)').matches||document.getElementById('gameScreen').classList.contains('is-lite-mode')) return;
    const ratio=Math.min(devicePixelRatio||1,1.5);
    canvas.width=Math.round(width*ratio);canvas.height=Math.round(height*ratio);
    context.setTransform(ratio,0,0,ratio,0,0);
    canvas.hidden=false;start=performance.now();frame=requestAnimationFrame(draw);
  }
  document.addEventListener('visibilitychange',()=>{if(document.hidden) stop();});
  window.TeeniepingRewardOrbit={play,stop};
})();
