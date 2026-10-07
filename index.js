const {onSchedule}=require('firebase-functions/v2/scheduler');
const {initializeApp}=require('firebase-admin/app');
const {getFirestore,Timestamp}=require('firebase-admin/firestore');
const {getMessaging}=require('firebase-admin/messaging');
initializeApp();

exports.dailyClientRegistrationAlert=onSchedule({schedule:'0 21 * * *',timeZone:'America/Mexico_City',region:'us-central1'},async()=>{
  const db=getFirestore();
  const now=new Date();
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Mexico_City',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  const val=(t)=>parts.find(p=>p.type===t).value;
  const localDate=`${val('year')}-${val('month')}-${val('day')}`;
  const regs=await db.collection('clientRegistrations').where('localDate','==',localDate).get();
  if(regs.empty) return;

  const deviceSnaps=await db.collectionGroup('devices').where('enabled','==',true).get();
  const tokens=[];
  deviceSnaps.forEach(d=>{const x=d.data(); if(x.token && (x.mode==='all'||x.mode==='daily')) tokens.push(x.token);});
  if(!tokens.length) return;
  const unique=[...new Set(tokens)];
  const body=regs.size===1?'Hoy se registró 1 persona en Hervago.':`Hoy se registraron ${regs.size} personas en Hervago.`;
  for(let i=0;i<unique.length;i+=500){
    await getMessaging().sendEachForMulticast({tokens:unique.slice(i,i+500),notification:{title:'Resumen diario Hervago',body},data:{url:'/index.html',type:'daily-registration-summary'}});
  }
});
