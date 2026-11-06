/* INOX - skrypty motywu (podglad Etapu 1). Bez bibliotek. */
(function(){
  var $=function(s,c){return (c||document).querySelector(s)};
  var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
  var LANG=document.documentElement.lang||'pl';
  function sbw(){document.documentElement.style.setProperty('--sbw',(innerWidth-document.documentElement.clientWidth)+'px')}
  var mtn=document.querySelector('.mt-note');
  function mt(){if(mtn)document.documentElement.style.setProperty('--mt',mtn.offsetHeight+'px')}
  sbw();mt();addEventListener('resize',function(){sbw();mt()});
  var BASE=document.body.getAttribute('data-base')||'';
  var I=function(id){return '<svg class="ico" aria-hidden="true"><use href="#'+id+'"/></svg>'};
  var TX={
    pl:{toShop:'Przejdź do sklepu',sent:'Dziękujemy{n}. To podgląd strony - formularz zacznie wysyłać wiadomości do biura po uruchomieniu na WordPressie.',added:'Dodano do koszyka',asked:'Dodano do zapytania',empty:'Koszyk jest pusty.',ask:'cena na zapytanie',pcs:'szt.',rm:'usuń',less:'Mniej',more:'Więcej',close:'Zamknij',prev:'Poprzednie',next:'Następne',total:'Razem',gross:'brutto',orderMsg:'To makieta zamówienia. Po uruchomieniu sklepu klient przejdzie tu do płatności (Przelewy24 lub PayU), a na e-mail dostanie potwierdzenie i kolejne statusy.'},
    en:{toShop:'Go to the shop',sent:'Thank you{n}. This is a preview - the form will start sending messages after launch on WordPress.',added:'Added to cart',asked:'Added to inquiry',empty:'Your cart is empty.',ask:'price on request',pcs:'pcs',rm:'remove',less:'Less',more:'More',close:'Close',prev:'Previous',next:'Next',total:'Total',gross:'gross',orderMsg:'This is a checkout mock-up. After launch the customer will be redirected to payment and receive e-mail confirmations and status updates.'},
    de:{toShop:'Zum Shop',sent:'Vielen Dank{n}. Dies ist eine Vorschau - das Formular sendet nach dem Start auf WordPress.',added:'In den Warenkorb gelegt',asked:'Zur Anfrage hinzugefügt',empty:'Der Warenkorb ist leer.',ask:'Preis auf Anfrage',pcs:'Stk.',rm:'entfernen',less:'Weniger',more:'Mehr',close:'Schließen',prev:'Zurück',next:'Weiter',total:'Summe',gross:'brutto',orderMsg:'Dies ist ein Muster der Bestellung. Nach dem Start folgt hier die Zahlung, Bestätigungen und Statusmeldungen kommen per E-Mail.'}
  }[LANG]||{};
  var store={get:function(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}},set:function(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}};
  var zl=function(n){return n.toLocaleString(LANG==='pl'?'pl-PL':(LANG==='de'?'de-DE':'en-GB'),{minimumFractionDigits:0,maximumFractionDigits:2})+' zł'};

  /* menu telefonu */
  var burger=$('.burger'), panel=$('.panel');
  function closePanel(){panel.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.innerHTML=I('i-menu');document.body.style.overflow=''}
  if(burger&&panel){
    burger.addEventListener('click',function(){
      var o=!panel.classList.contains('open');
      if(!o){closePanel();return}
      panel.classList.add('open');burger.setAttribute('aria-expanded','true');burger.innerHTML=I('i-close');document.body.style.overflow='hidden';
    });
    $$('a',panel).forEach(function(a){a.addEventListener('click',closePanel)});
    document.addEventListener('keydown',function(e){if(e.key==='Escape'&&panel.classList.contains('open'))closePanel()});
  }

  /* dolny pasek po przewinieciu za pierwszy ekran */
  var mob=$('.mob'), hero=$('.hero,.phero,.pp');
  if(mob&&'IntersectionObserver' in window){
    if(hero){new IntersectionObserver(function(e){mob.classList.toggle('widac',!e[0].isIntersecting)},{rootMargin:'-55% 0px 0px 0px'}).observe(hero)}
    else{window.addEventListener('scroll',function(){mob.classList.toggle('widac',scrollY>400)},{passive:true})}
  }

  /* trasa rurociagu: rura wypelnia sie Argonem przy przewijaniu */
  var main=$('main');
  if(main&&document.body.classList.contains('has-pipe')){
    var pipe=document.createElement('div');pipe.className='pipe';pipe.setAttribute('aria-hidden','true');pipe.innerHTML='<i></i>';
    main.appendChild(pipe);
    var fill=$('i',pipe), nodes=$$('.node'), tick=false, h0=$('.hero,.phero',main);
    function place(){pipe.style.top=(h0?h0.offsetTop+h0.offsetHeight:0)+'px'}
    function upd(){
      tick=false;
      var r=pipe.getBoundingClientRect(), vh=innerHeight;
      var p=Math.min(1,Math.max(0,(vh*0.6-r.top)/r.height));
      fill.style.transform='scaleY('+p.toFixed(4)+')';
      nodes.forEach(function(n){n.classList.toggle('lit',n.getBoundingClientRect().top<vh*0.6)});
    }
    addEventListener('scroll',function(){if(!tick){tick=true;requestAnimationFrame(upd)}},{passive:true});
    addEventListener('resize',function(){place();upd()});place();upd();
  }

  /* kolana rur miedzy sekcjami rysuja sie przy wejsciu */
  $$('.joint').forEach(function(j){var f=$('.flow',j);if(f&&f.getTotalLength){j.style.setProperty('--len',Math.ceil(f.getTotalLength()))}});
  if('IntersectionObserver' in window){
    var jo=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('lit');jo.unobserve(e.target)}})},{rootMargin:'0px 0px -15% 0px'});
    $$('.joint').forEach(function(j){jo.observe(j)});
  } else $$('.joint').forEach(function(j){j.classList.add('lit')});

  /* lightbox */
  var lb=document.createElement('div');lb.className='lb';lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');
  lb.innerHTML='<button class="x" aria-label="'+TX.close+'">'+I('i-close')+'</button><button class="pv" aria-label="'+TX.prev+'">'+I('i-chev')+'</button><img alt=""><button class="nx" aria-label="'+TX.next+'">'+I('i-chev')+'</button><div class="cap"></div><div class="cnt"></div>';
  document.body.appendChild(lb);
  var lbList=[],lbI=0,lbImg=$('img',lb);
  function lbShow(){var b=lbList[lbI],im=$('img',b);lbImg.src=b.getAttribute('data-full')||im.currentSrc||im.src;lbImg.alt=im.alt;$('.cap',lb).textContent=im.alt;$('.cnt',lb).textContent=(lbI+1)+' / '+lbList.length}
  function lbOpen(list,i){lbList=list;lbI=i;lbShow();lb.classList.add('open');$('.x',lb).focus()}
  function lbClose(){lb.classList.remove('open')}
  $('.x',lb).onclick=lbClose;
  $('.pv',lb).onclick=function(e){e.stopPropagation();lbI=(lbI-1+lbList.length)%lbList.length;lbShow()};
  $('.nx',lb).onclick=function(e){e.stopPropagation();lbI=(lbI+1)%lbList.length;lbShow()};
  lb.addEventListener('click',function(e){if(e.target===lb)lbClose()});
  document.addEventListener('keydown',function(e){if(!lb.classList.contains('open'))return;if(e.key==='Escape')lbClose();if(e.key==='ArrowRight')$('.nx',lb).click();if(e.key==='ArrowLeft')$('.pv',lb).click()});
  $$('[data-zoom]').forEach(function(b){b.addEventListener('click',function(){lbOpen([b],0)})});

  /* karuzele: palec, mysz, strzalki, licznik */
  $$('.car').forEach(function(car){
    var tr=$('.car-track',car), items=$$('.car-track>button',car), cnt=$('.car-cnt',car), moved=false;
    if(!tr)return;
    function idx(){var w=items[0]?items[0].getBoundingClientRect().width+10:1;return Math.round(tr.scrollLeft/w)}
    function upd(){if(cnt)cnt.textContent=(Math.min(items.length,idx()+1))+' / '+items.length;var th=$$('.thumbs button',car.parentNode);th.forEach(function(t,i){t.classList.toggle('on',i===idx())})}
    tr.addEventListener('scroll',function(){requestAnimationFrame(upd)},{passive:true});upd();
    function go(d){var w=items[0].getBoundingClientRect().width+10;tr.scrollBy({left:d*w,behavior:'smooth'})}
    var pv=$('.pv',car),nx=$('.nx',car);if(pv)pv.onclick=function(){go(-1)};if(nx)nx.onclick=function(){go(1)};
    var sx=0,sl=0,down=false;
    tr.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;down=true;moved=false;sx=e.clientX;sl=tr.scrollLeft});
    addEventListener('pointermove',function(e){if(!down)return;var dx=e.clientX-sx;if(Math.abs(dx)>5){moved=true;tr.classList.add('drag')}tr.scrollLeft=sl-dx});
    addEventListener('pointerup',function(){if(!down)return;down=false;tr.classList.remove('drag');if(moved){var w=items[0].getBoundingClientRect().width+10;tr.scrollTo({left:Math.round(tr.scrollLeft/w)*w,behavior:'smooth'})}});
    items.forEach(function(b,i){b.addEventListener('click',function(e){if(moved){e.preventDefault();moved=false;return}lbOpen(items,i)})});
    $$('.thumbs button',car.parentNode).forEach(function(t,i){t.addEventListener('click',function(){var w=items[0].getBoundingClientRect().width+10;tr.scrollTo({left:i*w,behavior:'smooth'})})});
  });

  /* "zapytaj o ten typ" ustawia formularz */
  $$('[data-typ]').forEach(function(a){a.addEventListener('click',function(){var s=$('#f-typ');if(s){s.value=a.getAttribute('data-typ')}})});

  /* formularze - podglad bez wysylki */
  $$('form.form').forEach(function(f){
    f.addEventListener('submit',function(e){
      e.preventDefault();
      if(f.checkValidity&&!f.checkValidity()){f.reportValidity();return}
      var ok=$('.f-ok',f), n=(f.elements.imie&&f.elements.imie.value.trim())||'';
      ok.textContent=TX.sent.replace('{n}',n?', '+n:'');ok.classList.add('show');
    });
  });

  /* toast */
  var toast=document.createElement('div');toast.className='toast';toast.setAttribute('role','status');document.body.appendChild(toast);var tt;
  function say(t){toast.innerHTML=I('i-check')+'<span>'+t+'</span>';toast.classList.add('show');clearTimeout(tt);tt=setTimeout(function(){toast.classList.remove('show')},2300)}

  /* koszyk (makieta, pamiec przegladarki) */
  var cart=store.get('inox_cart')||[];
  function save(){store.set('inox_cart',cart);badge()}
  function badge(){var n=cart.reduce(function(a,c){return a+c.q},0);$$('.cart-btn b').forEach(function(x){x.textContent=n?n:''})}
  function line(c,i){
    return '<div class="ci"><img src="'+BASE+c.img+'" alt="" loading="lazy"><div class="lt"><b>'+c.name+'</b><span class="muted">'+(c.p?zl(c.p)+' / '+TX.pcs:TX.ask)+'</span><div class="q"><button data-a="-" data-i="'+i+'" aria-label="'+TX.less+'">'+I('i-minus')+'</button><span>'+c.q+'</span><button data-a="+" data-i="'+i+'" aria-label="'+TX.more+'">'+I('i-plus')+'</button></div></div><button class="rm" data-a="x" data-i="'+i+'">'+TX.rm+'</button></div>';
  }
  function sum(){return cart.reduce(function(a,c){return a+(c.p||0)*c.q},0)}
  function renderAll(){
    $$('[data-cart-list]').forEach(function(b){b.innerHTML=cart.length?cart.map(line).join(''):'<p class="empty">'+TX.empty+(b.hasAttribute('data-shop')?' <a href="'+b.getAttribute('data-shop')+'">'+TX.toShop+'</a>':'')+'</p>'});
    $$('[data-cart-sum]').forEach(function(b){b.textContent=zl(sum())});
    var ask=cart.some(function(c){return !c.p});$$('.ask-note').forEach(function(n){n.style.display=ask?'block':'none'});
    $$('[data-cart-mini]').forEach(function(b){b.innerHTML=cart.length?cart.map(function(c){return '<div class="sum" style="font-size:15px;font-family:var(--fb);margin:6px 0"><span>'+c.q+' x '+c.name+'</span><b>'+(c.p?zl(c.p*c.q):'-')+'</b></div>'}).join(''):'<p class="empty">'+TX.empty+'</p>'});
    shipUpd();
  }
  document.addEventListener('click',function(e){
    var t=e.target.closest('[data-cart-list] button[data-a]');if(!t)return;var i=+t.getAttribute('data-i');
    if(t.getAttribute('data-a')==='+')cart[i].q++;
    if(t.getAttribute('data-a')==='-'){cart[i].q--;if(cart[i].q<1)cart.splice(i,1)}
    if(t.getAttribute('data-a')==='x')cart.splice(i,1);
    save();renderAll();
  });
  var drawer=$('.drawer'),shade=$('.shade');
  function dOpen(){if(!drawer)return;drawer.classList.add('open');shade.classList.add('open')}
  function dClose(){if(!drawer)return;drawer.classList.remove('open');shade.classList.remove('open')}
  $$('.cart-btn').forEach(function(b){b.addEventListener('click',function(e){if(drawer){e.preventDefault();dOpen()}})});
  if(shade)shade.addEventListener('click',dClose);
  if(drawer)$('.drawer-h button',drawer).addEventListener('click',dClose);
  function addItem(o,q){
    var ex=cart.filter(function(c){return c.id===o.id})[0];
    if(ex)ex.q+=q;else cart.push({id:o.id,name:o.name,p:o.p,q:q,img:o.img});
    save();renderAll();say(o.p?TX.added:TX.asked);
  }
  $$('.add[data-id]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();addItem({id:b.dataset.id,name:b.dataset.name,p:+b.dataset.p||0,img:b.dataset.img},1)})});
  /* karta produktu */
  var pp=$('.pp-info');
  if(pp){
    var sel=$('select',pp),price=$('.price',pp),qty=$('.qty input',pp);
    function cur(){var o=sel?sel.options[sel.selectedIndex]:null;return o?{id:o.value,name:o.getAttribute('data-name'),p:+o.getAttribute('data-p')||0}:{id:pp.dataset.id,name:pp.dataset.name,p:+pp.dataset.p||0}}
    if(sel&&price)sel.addEventListener('change',function(){var c=cur();price.innerHTML=c.p?zl(c.p)+' <small>'+TX.gross+'</small>':''});
    $$('.qty button',pp).forEach(function(b){b.addEventListener('click',function(){var v=Math.max(1,(+qty.value||1)+(b.getAttribute('data-d')==='+'?1:-1));qty.value=v})});
    var bb=$('.buy .btn',pp);if(bb)bb.addEventListener('click',function(){var c=cur();c.img=pp.dataset.img;addItem(c,Math.max(1,+qty.value||1));dOpen()});
  }
  /* zamowienie: koszt dostawy */
  function shipUpd(){
    var s=$('input[name="dostawa"]:checked');var out=$('[data-ship]');var tot=$('[data-total]');
    if(!out)return;var c=s?+s.getAttribute('data-c'):0;
    out.textContent=s?(s.getAttribute('data-c')==='0'?zl(0):s.getAttribute('data-l')):'-';
    if(tot)tot.textContent=zl(sum()+(c>0?0:0))+(s&&c>0?' + '+s.getAttribute('data-l'):'');
  }
  $$('input[name="dostawa"]').forEach(function(r){r.addEventListener('change',shipUpd)});
  var ob=$('[data-order]');if(ob)ob.addEventListener('click',function(e){e.preventDefault();var m=$('.order-msg');m.style.display='block';m.textContent=TX.orderMsg});
  badge();renderAll();

  /* filtry sklepu */
  $$('.filters button').forEach(function(b){
    b.addEventListener('click',function(){
      $$('.filters button').forEach(function(x){x.classList.toggle('on',x===b);x.setAttribute('aria-pressed',x===b)});
      var k=b.getAttribute('data-f');
      $$('.prods .prod').forEach(function(p){p.style.display=(k==='all'||p.getAttribute('data-cat')===k)?'':'none'});
    });
  });

  /* baner zgod cookies */
  var ck=$('.ck'), CKK='inox_ck';
  function ckGet(){var v=store.get(CKK);if(!v||!v.t||Date.now()-v.t>365*864e5)return null;return v}
  function ckApply(v){
    $$('iframe.map').forEach(function(f){
      if(v&&!v.e){var d=document.createElement('div');d.className='map-off';d.innerHTML=f.getAttribute('data-off');f.parentNode.replaceChild(d,f)}
    });
  }
  function ckSave(a,e){var v={a:a,e:e,t:Date.now()};store.set(CKK,v);ck.classList.remove('open','more');ckApply(v)}
  if(ck){
    var v=ckGet();if(!v){ck.classList.add('open')}else ckApply(v);
    $('[data-ck="all"]',ck).onclick=function(){ckSave(true,true)};
    $('[data-ck="min"]',ck).onclick=function(){ckSave(false,false)};
    $('[data-ck="more"]',ck).onclick=function(){
      if(ck.classList.contains('more')){ckSave($('#ck-a').checked,$('#ck-e').checked)}else{ck.classList.add('more');this.textContent=this.getAttribute('data-save')}
    };
    $$('[data-ck-open]').forEach(function(b){b.addEventListener('click',function(){var v=ckGet();if(v){$('#ck-a').checked=!!v.a;$('#ck-e').checked=!!v.e}ck.classList.add('open','more');$('[data-ck="more"]',ck).textContent=$('[data-ck="more"]',ck).getAttribute('data-save')})});
  }
  $$('[data-year]').forEach(function(y){y.textContent=new Date().getFullYear()});
})();
