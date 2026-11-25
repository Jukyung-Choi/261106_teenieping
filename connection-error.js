(() => {
  const layer=document.getElementById('connectionErrorLayer');
  const retry=document.getElementById('connectionErrorRetry');
  const message=document.getElementById('connectionErrorMessage');
  let previousFocus=null, previousInert=false, inertSiblings=[], request=null;
  const defaultMessage='인터넷 연결을 확인 한 후<br>다시 시도해 주세요.';
  function show() {
    if (!layer.hidden) return;
    previousFocus=document.activeElement;
    previousInert=layer.inert;
    layer.inert=false;
    inertSiblings=[...gameScreen.children].filter(el=>el!==layer&&!el.inert);
    inertSiblings.forEach(el=>{el.inert=true;});
    message.innerHTML=tr(defaultMessage);
    retry.disabled=false;
    retry.textContent=tr('다시 시도');
    layer.hidden=false;
    retry.focus({preventScroll:true});
  }
  function dismiss() {
    if (layer.hidden) return;
    request?.abort();request=null;
    layer.hidden=true;
    layer.inert=previousInert;
    inertSiblings.forEach(el=>{el.inert=false;});inertSiblings=[];
    if (previousFocus?.isConnected&&!previousFocus.closest('[inert]')) previousFocus.focus({preventScroll:true});
  }
  async function reconnect() {
    if (request||layer.hidden) return;
    const controller=new AbortController();request=controller;
    retry.disabled=true;retry.textContent=tr('연결 확인 중…');
    const timeout=setTimeout(()=>controller.abort(),8000);
    try {
      // This prototype checks its own host, not a payment/reward server.
      const url=new URL('assets/connection-error/health.json',location.href);
      url.searchParams.set('t',String(Date.now()));
      const response=await fetch(url,{cache:'no-store',signal:controller.signal});
      if (!response.ok||(await response.json()).ok!==true) throw new Error('unreachable');
      if (request!==controller||layer.hidden) return;
      request=null;dismiss();showToast(tr('다시 연결됐어요'));
    } catch {
      if (request!==controller||layer.hidden) return;
      message.textContent=tr('아직 연결할 수 없어요. 잠시 후 다시 시도해 주세요.');
    } finally {
      clearTimeout(timeout);
      if (request===controller) {
        request=null;retry.disabled=false;retry.textContent=tr('다시 시도');
        if (document.activeElement===document.body) retry.focus({preventScroll:true});
      }
    }
  }
  retry.addEventListener('click',reconnect);
  document.getElementById('demoConnectionPreview').addEventListener('click',show);
  document.addEventListener('keydown',event=>{
    if (layer.hidden) return;
    if (event.key==='Escape') { event.preventDefault();event.stopImmediatePropagation();dismiss(); }
    if (event.key==='Tab') {
      const buttons=[retry].filter(el=>!el.disabled);
      if (!buttons.length) { event.preventDefault();return; }
      const first=buttons[0],last=buttons[buttons.length-1];
      if (event.shiftKey&&document.activeElement===first) {event.preventDefault();last.focus();}
      else if (!event.shiftKey&&document.activeElement===last) {event.preventDefault();first.focus();}
    }
  },true);
  window.addEventListener('offline',show);
  window.addEventListener('online',()=>{if(!layer.hidden) reconnect();});
  window.TeeniepingConnection={show,retry:reconnect,close:dismiss};
  if (navigator.onLine===false) show();
})();
