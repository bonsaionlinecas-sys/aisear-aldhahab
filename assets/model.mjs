export const numeric=value=>{
 const s=String(value).trim().replace(/[٠-٩]/g,c=>String(c.charCodeAt(0)-1632)).replace(/[۰-۹]/g,c=>String(c.charCodeAt(0)-1776)).replace(/٫/g,'.');
 if(!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(s))throw Error('أدخل أرقاماً موجبة واضحة دون فواصل آلاف أو رموز عملات.');
 const n=Number(s);if(!Number.isFinite(n))throw Error('القيمة غير صالحة.');return n;
};
const ratio=(a,b)=>b?a/b:null;
export const calculate=(tool,v)=>{
 for(const n of Object.values(v))if(typeof n==='number'&&(!Number.isFinite(n)||n<0))throw Error('يجب أن تكون القيم أرقاماً غير سالبة.');
 let values,note='';
 switch(tool){
 case'points':{const n=v.wins+v.draws+v.losses,p=v.wins*3+v.draws;values=[p,ratio(p,n),n?p/(n*3)*100:null];note=n?`المباريات الملعوبة: ${n}. الكفاءة نسبة النقاط إلى الحد الأقصى الممكن.`:'لا توجد مباريات: معدل النقاط والكفاءة غير معرّفين.';break;}
 case'record':values=[v.wins+v.draws+v.losses,v.wins*3+v.draws,v.gf-v.ga];note='نموذج نقاط ٣–١–٠، قبل أي خصم إداري. لا يحدد مركز الفريق أو معيار كسر التعادل.';break;
 case'shots':if(v.on>v.shots||v.goals>v.on)throw Error('راجع الأعداد: الأهداف ≤ التسديدات على المرمى ≤ إجمالي التسديدات.');values=[v.shots?v.on/v.shots*100:null,v.shots?v.goals/v.shots*100:null,v.on-v.goals];note=v.shots?'الفرق الأخير عدد على المرمى دون هدف؛ لا ينسب تلقائياً إلى الحارس.':'لا توجد تسديدات؛ نسبتا الدقة والتحويل غير معرّفتين.';break;
 case'target':{const need=Math.max(0,v.target-v.points),max=v.points+3*v.remaining;values=[need,max,need?ratio(need,v.remaining):0];if(!need)note='الرصيد الحالي وصل إلى الهدف المدخل أو تجاوزه.';else if(v.target>max)note='الهدف غير ممكن ضمن هذا الرصيد وعدد المباريات. هذا حد حسابي، وليس توقعاً.';else{let w=Math.max(0,Math.ceil((need-v.remaining)/2)),d=Math.max(0,need-3*w),l=v.remaining-w-d;note=`مثال بأقل عدد انتصارات: ${w} فوز، ${d} تعادل، ${l} خسارة. الرصيد النهائي: ${v.points+3*w+d}. هذا سيناريو وليس توقعاً.`;}break;}
 case'rounds':{const t=v.teams,l=v.legs;values=[(t-1)*l,t*(t-1)*l/2,(t%2?t:t-1)*l];note=t%2?'عدد الفرق فردي: لكل فريق جولات راحة. عدد الجولات يختلف عن مباريات الفريق.':'نموذج دائري منتظم بعدد زوجي من الفرق؛ لا يحدد المواعيد أو الملاعب.';break;}
 case'homeaway':if(v.homepoints>v.homegames*3||v.awaypoints>v.awaygames*3)throw Error('لا يمكن أن تتجاوز النقاط ثلاثة أضعاف المباريات في هذا النموذج.');{const h=ratio(v.homepoints,v.homegames),a=ratio(v.awaypoints,v.awaygames);values=[h,a,h===null||a===null?null:h-a];note=h===null||a===null?'لا يمكن حساب فرق المعدل عندما يكون أحد المقامين صفراً.':'الفرق = معدل داخل الأرض ناقص معدل خارج الأرض. يصف المدخلات ولا يثبت سبب الفارق.';break;}
 case'invoice':{const metal=v.weight*v.price,subtotal=metal+v.weight*v.work,total=subtotal*(1+v.tax/100);values=[metal,total,total/v.weight];note=`المصنعية الإجمالية: ${(v.weight*v.work).toFixed(2)} ريال. الرسم المدخل: ${(total-subtotal).toFixed(2)} ريال على المجموع قبل الرسم. ليست فتوى ضريبية.`;break;}
 case'karat':values=[v.weight*v.karat/24,v.price*v.karat/24,v.weight*v.price*v.karat/24];note=`نقاء اسمي ${(v.karat/24*100).toFixed(4)}٪. الحساب يستعمل مرجع عيار ٢٤ ولا يشمل المصنعية والرسوم.`;break;
 case'scrap':{const metal=v.weight*v.price,net=metal*(1-v.discount/100)-v.fee;if(net<0)throw Error('الرسوم تتجاوز القيمة المتبقية بعد الخصم. راجع العرض والمدخلات.');values=[metal,net,net/v.weight];note=`إجمالي الفرق عن المرجع: ${(metal-net).toFixed(2)} ريال. الخصم المدخل افتراضك، وليس نسبة سوق ثابتة.`;break;}
 case'budget':if(v.fee>=v.budget)throw Error('يجب أن تتجاوز الميزانية الرسوم الثابتة حتى يبقى مبلغ لشراء الذهب.');values=[(v.budget-v.fee)/(v.price+v.work),v.price+v.work,v.budget-v.fee];note='وزن كسري نظري قبل أي تكاليف غير مدخلة. لا تقرّبه إلى الأعلى عند الشراء بميزانية ثابتة.';break;
 case'premium':{const pure=v.weight*v.purity/1000,metal=pure*v.price,premium=v.offer-metal;values=[metal,premium/metal*100,v.offer/pure];note=`الذهب الخالص المحسوب: ${pure.toFixed(4)} جرام. الفرق النقدي عن المرجع: ${premium.toFixed(2)} ريال. النسبة محسوبة على قيمة المعدن.`;break;}
 case'ounce':{const oz=v.ounce*v.fx,g=oz/31.1034768;values=[oz,g,g*v.karat/24];note='المعامل الثابت: ١ أونصة ترويسية = ٣١٫١٠٣٤٧٦٨ جراماً. الناتج قيمة معدن نظرية بلا مصنعية.';break;}
 case'compare':{const a=v.weight*(v.price+v.worka)+v.feea,b=v.weight*(v.price+v.workb)+v.feeb;values=[a,b,Math.abs(a-b)];note=a===b?'العرضان متساويان في التكلفة ضمن المدخلات.':`العرض ${a<b?'أ':'ب'} أقل تكلفة في النموذج. تكلفة الجرام: أ ${(a/v.weight).toFixed(2)} ريال، ب ${(b/v.weight).toFixed(2)} ريال. لا يقيّم الحساب جودة القطعة.`;break;}
 case'netweight':if(v.other>=v.gross)throw Error('يجب أن يكون وزن الأجزاء غير الذهبية أقل من الوزن الإجمالي.');{const net=v.gross-v.other;values=[net,net*v.karat/24,net*v.price];note='سعر الجرام المدخل يخص عيار السبيكة نفسه؛ لا نخصم العيار مرة ثانية من القيمة. لا يشمل الناتج قيمة الأحجار.';break;}
 default:throw Error('أداة حساب غير معروفة.');
 }
 if(values.some(n=>n!==null&&!Number.isFinite(n)))throw Error('تعذر حساب نتيجة صالحة. راجع الأرقام.');
 return{values,note};
};
export const formScore=outcomes=>{
 if(outcomes.length!==5||outcomes.some(v=>!['W','D','L'].includes(v)))throw Error('اختر خمس نتائج صحيحة.');
 const wins=outcomes.filter(x=>x==='W').length,draws=outcomes.filter(x=>x==='D').length,points=wins*3+draws;
 return{values:[points,points/5,points/15*100],note:`${wins} فوز، ${draws} تعادل، ${5-wins-draws} خسارة. وصف لخمس نتائج مدخلة فقط.`};
};
export const riyadhInstant=(date,time)=>{
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^\d{2}:\d{2}$/.test(time))throw Error('اختر تاريخاً ووقتاً صالحين.');
 const instant=new Date(date+'T'+time+':00+03:00');
 if(!Number.isFinite(+instant))throw Error('الموعد غير صالح.');
 const [yy,mm,dd]=date.split('-').map(Number),[hh,mi]=time.split(':').map(Number),check=new Date(+instant+3*3600000);
 if(check.getUTCFullYear()!==yy||check.getUTCMonth()+1!==mm||check.getUTCDate()!==dd||hh>23||mi>59)throw Error('راجع التاريخ والوقت.');
 return instant;
};
export const makeCalendar=(instant,title)=>{
 const stamp=d=>d.toISOString().replaceAll('-','').replaceAll(':','').replace(/\.\d{3}/,'');
 const esc=s=>s.replace(/[\r\n]/g,' ').replaceAll('\\','\\\\').replaceAll(';','\\;').replaceAll(',','\\,').slice(0,160);
 return['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//aldawriu-alsueudiu//Match Planner//AR','CALSCALE:GREGORIAN','BEGIN:VEVENT','UID:'+stamp(instant)+'-manual@aldawriu-alsueudiu','DTSTAMP:'+stamp(new Date()),'DTSTART:'+stamp(instant),'DTEND:'+stamp(new Date(+instant+2*3600000)),'SUMMARY:'+esc(title||'موعد مباراة'),'DESCRIPTION:'+esc('موعد يدوي غير متصل بجدول مباشر. المدة ساعتان تقديريتان. راجع الناشر قبل المباراة.'),'END:VEVENT','END:VCALENDAR',''].join('\r\n');
};
