(function(){
  'use strict';

  const REVEAL=86;
  let openRow=null;

  const style=document.createElement('style');
  style.textContent=`
    .swipe-shop-row{position:relative;overflow:hidden;padding:0!important;border-top:1px solid var(--line);min-height:54px;touch-action:pan-y;background:transparent}
    .swipe-shop-row .swipe-delete{position:absolute;inset:0 0 0 auto;width:${REVEAL}px;border:0;background:#b42318;color:#fff;font-weight:900;font-size:13px;display:flex;align-items:center;justify-content:center;z-index:0;cursor:pointer}
    .swipe-shop-row .swipe-front{position:relative;z-index:1;display:flex;justify-content:space-between;align-items:center;gap:10px;width:100%;min-height:54px;padding:11px 0;background:linear-gradient(160deg,rgba(20,34,46,.99),rgba(15,27,37,.99));transform:translateX(0);transition:transform .18s ease;will-change:transform}
    .swipe-shop-row.swipe-open .swipe-front{transform:translateX(-${REVEAL}px)}
    .swipe-shop-row .shopname{padding-left:1px}
    .swipe-shop-row .shopqty{padding-right:2px}
  `;
  document.head.appendChild(style);

  function closeRow(row){
    if(!row)return;
    row.classList.remove('swipe-open');
    const front=row.querySelector('.swipe-front');
    if(front)front.style.transform='';
    if(openRow===row)openRow=null;
  }

  function findItem(row){
    try{
      const group=row.closest('.shopgroup');
      const category=group?.querySelector('h3')?.textContent.trim()||'';
      const name=row.querySelector('.shopname span')?.textContent.trim()||'';
      const qty=row.querySelector('.shopqty')?.childNodes?.[0]?.textContent?.trim()||'';
      if(typeof state==='undefined'||!Array.isArray(state.shopping))return null;
      return state.shopping.find(x=>x.category===category&&x.name===name&&(String(x.qty||'').trim()===qty||!qty)) ||
             state.shopping.find(x=>x.category===category&&x.name===name) || null;
    }catch(e){return null}
  }

  function enhance(row){
    if(row.dataset.swipeReady==='1')return;
    const item=findItem(row);
    if(!item)return;
    row.dataset.swipeReady='1';
    row.classList.add('swipe-shop-row');

    const children=[...row.childNodes];
    const front=document.createElement('div');
    front.className='swipe-front';
    children.forEach(n=>front.appendChild(n));

    const del=document.createElement('button');
    del.type='button';
    del.className='swipe-delete';
    del.textContent='Slett';
    del.setAttribute('aria-label','Slett '+item.name);
    del.addEventListener('click',function(e){
      e.preventDefault();e.stopPropagation();
      if(typeof removeShopItem==='function')removeShopItem(item.id);
    });

    row.appendChild(del);
    row.appendChild(front);

    let startX=0,currentX=0,dragging=false,wasOpen=false;
    row.addEventListener('touchstart',function(e){
      if(!e.touches||!e.touches.length)return;
      if(openRow&&openRow!==row)closeRow(openRow);
      startX=e.touches[0].clientX;
      currentX=startX;
      dragging=true;
      wasOpen=row.classList.contains('swipe-open');
      front.style.transition='none';
    },{passive:true});

    row.addEventListener('touchmove',function(e){
      if(!dragging||!e.touches||!e.touches.length)return;
      currentX=e.touches[0].clientX;
      let dx=currentX-startX+(wasOpen?-REVEAL:0);
      dx=Math.max(-REVEAL,Math.min(0,dx));
      front.style.transform=`translateX(${dx}px)`;
    },{passive:true});

    row.addEventListener('touchend',function(){
      if(!dragging)return;
      dragging=false;
      front.style.transition='';
      let dx=currentX-startX+(wasOpen?-REVEAL:0);
      if(dx<-REVEAL*0.42){
        row.classList.add('swipe-open');
        front.style.transform='';
        openRow=row;
      }else{
        closeRow(row);
      }
    });

    row.addEventListener('click',function(e){
      if(row.classList.contains('swipe-open')&&!e.target.closest('.swipe-delete')){
        closeRow(row);
      }
    });
  }

  function scan(){document.querySelectorAll('#shop .shoprow').forEach(enhance)}
  const observer=new MutationObserver(scan);
  observer.observe(document.body,{childList:true,subtree:true});
  scan();
})();
