(()=>{
const $=id=>document.getElementById(id),root=document.documentElement;
const MAX_CHECKS=6;
const fresh=()=>({cash:0,lead:0,heat:0,chk:0});
let S=fresh();
try{const saved=localStorage.getItem('bdt1');if(saved)S=Object.assign(fresh(),JSON.parse(saved))}catch(e){}
S.chk=Math.min(MAX_CHECKS,Math.max(0,Math.floor(Number(S.chk)||0)));

function log(message,type){
  const list=$('log'),item=document.createElement('li');
  item.textContent=message;
  if(type)item.className=type;
  list.prepend(item);
  while(list.children.length>3)list.lastChild.remove();
}

const slider=$('leadSlider');
function cerealUI(){
  const level=Number(slider.value);
  $('leadPct').textContent=level+'%';
  $('leadMargin').textContent='$'+(1+.03*level).toFixed(2);
  $('leadSays').textContent=level<20?'"fully safe"':level<60?'"within tolerance"':'"totally fine, trust us"';
}
function leadWarn(){
  const level=S.lead;
  $('leadWarn').textContent=level<25?'':level<50?'The belt smells faintly sweet.':level<75?
    'The room is turning yellow-green. Your hands feel slow.':'You can taste metal. A recall letter is being typed.';
}
function pressNote(){
  const heat=S.heat;
  $('pressNote').textContent=heat<30?'The bank is friendly. The bank is also a federal institution.':
    heat<60?'A teller made a phone call.':heat<85?'A plain sedan has been parked outside for hours.':'You hear helicopters.';
}
function addPrintedCheck(){
  const image=document.createElement('img');
  image.className='chk';
  image.src='media/blankcheck.png';
  image.alt='Printed blank check';
  $('tray').appendChild(image);
}
function raid(){
  S.cash=Math.floor(S.cash*.25);
  S.chk=0;
  S.heat=25;
  $('tray').innerHTML='';
  $('raid').classList.add('on');
  setTimeout(()=>$('raid').classList.remove('on'),1800);
  log('Federal raid. Cash seized down to a quarter.','bad');
}

slider.oninput=cerealUI;
$('runLine').onclick=()=>{
  const level=Number(slider.value);
  S.cash+=10*(1+.03*level);
  S.lead+=level*.12;
  if(S.lead>=100){
    S.cash*=.4;
    S.lead=30;
    log('RECALL. Boxes pulled from 40 states. Cash down 60%.','bad');
  }else log('Sold 10 boxes at $'+(1+.03*level).toFixed(2)+' margin.');
};
$('printChk').onclick=()=>{
  if(S.chk>=MAX_CHECKS){log('You can only print 6 checks at once. Cash some first.');return}
  S.chk++;
  S.heat++;
  addPrintedCheck();
};
$('cashChk').onclick=()=>{
  if(!S.chk){log('Nothing to cash. Print some first.');return}
  const count=S.chk;
  S.cash+=40*count;
  S.heat+=9*count;
  S.chk=0;
  $('tray').innerHTML='';
  log('Cashed '+count+' blank check'+(count>1?'s':'')+' for $'+40*count+'.','good');
  if(S.heat>=100)raid();
};

function tick(){
  const dt=.1;
  S.heat=Math.max(0,S.heat-.5*dt);
  S.lead=Math.max(0,S.lead-.25*dt);
  $('sCash').textContent='$'+Math.floor(S.cash);
  $('chkN').textContent=S.chk;
  $('mSus').style.width=Math.min(100,S.heat)+'%';
  $('mLead').style.width=Math.min(100,S.lead)+'%';
  root.style.setProperty('--fog',Math.min(1,S.lead/100));
  cerealUI();
  leadWarn();
  pressNote();
}

function save(){
  try{localStorage.setItem('bdt1',JSON.stringify(S))}catch(e){}
}

if(S.chk)for(let i=0;i<S.chk;i++)addPrintedCheck();
cerealUI();
log('Welcome. Start anywhere.');
setInterval(tick,100);
setInterval(save,5000);
})();
