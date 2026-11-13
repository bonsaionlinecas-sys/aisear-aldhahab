import {calculate,numeric,formScore,riyadhInstant,makeCalendar} from './model.mjs';
const form=document.querySelector('#calculator-form'),error=document.querySelector('#form-error'),result=document.querySelector('#result'),note=document.querySelector('#result-note');
const fmt=(n,i)=>n===null?'—':new Intl.NumberFormat('ar-SA',{maximumFractionDigits:form.dataset.topic==='gold'&&i===0&&['karat','budget','netweight'].includes(form.dataset.tool)?4:2}).format(n);
let calendarInstant=null;
function render(r){r.values.forEach((n,i)=>{const el=document.querySelector(`[data-result="${i}"]`);if(el)el.textContent=fmt(n,i);});note.textContent=r.note;result.hidden=false;error.textContent='';error.hidden=true;document.querySelector('#result-state').textContent='نتيجة مدخلاتك';}
function run(event){event?.preventDefault();try{
 if(!form.reportValidity())return;
 const tool=form.dataset.tool;
 if(tool==='timezone'){
  calendarInstant=riyadhInstant(form.elements.date.value,form.elements.time.value);
  const zone=form.elements.zone.value;
  const value=new Intl.DateTimeFormat('ar-SA-u-ca-gregory',{timeZone:zone,weekday:'long',year:'numeric',month:'long',day:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(calendarInstant);
  document.querySelector('[data-time-result]').textContent=value;
  note.textContent='الموعد وفق المنطقة الزمنية المختارة. ملف التقويم لا يتحدث تلقائياً عند تأجيل المباراة.';
  document.querySelector('#calendar-download').disabled=false;
  result.hidden=false;error.hidden=true;error.textContent='';document.querySelector('#result-state').textContent='موعدك المحوّل';return;
 }
 if(tool==='form'){render(formScore([...form.querySelectorAll('select')].map(x=>x.value)));return;}
 const values={};for(const input of form.querySelectorAll('input[data-number]')){
  const n=numeric(input.value),min=Number(input.dataset.min),max=Number(input.dataset.max);
  if(n<min||n>max)throw Error(`راجع «${input.labels[0].textContent}»: القيمة بين ${min} و${max}.`);
  if(input.dataset.integer==='true'&&!Number.isInteger(n))throw Error('عدد المباريات والنتائج يجب أن يكون عدداً صحيحاً.');values[input.name]=n;
 }
 render(calculate(tool,values));
 }catch(e){result.hidden=true;error.hidden=false;error.textContent=e.message;calendarInstant=null;const download=document.querySelector('#calendar-download');if(download)download.disabled=true;}
}
form.addEventListener('submit',run);
form.addEventListener('reset',()=>{requestAnimationFrame(()=>{run();document.querySelector('#result-state').textContent='مثال تعليمي';});});
if(form.dataset.tool==='timezone'){
 form.elements.date.value=new Date().toISOString().slice(0,10);
 document.querySelector('#calendar-download').addEventListener('click',()=>{
  run();if(!calendarInstant||!error.hidden)return;
  const blob=new Blob([makeCalendar(calendarInstant,form.elements.match.value)],{type:'text/calendar;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='match.ics';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
 });
 form.addEventListener('input',()=>{calendarInstant=null;document.querySelector('#calendar-download').disabled=true;});
}
document.querySelector('#print-page').addEventListener('click',()=>window.print());
const menu=document.querySelector('#menu-toggle'),nav=document.querySelector('#page-nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-expanded',String(!open));nav.classList.toggle('is-open',!open);});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('is-open');menu.setAttribute('aria-expanded','false');}));
run();document.querySelector('#result-state').textContent='مثال تعليمي';
