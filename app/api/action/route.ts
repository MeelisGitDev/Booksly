import {NextResponse} from 'next/server';
import {readStore,writeStore} from '../../../lib/store';
import {initialState} from '../../../lib/seed';
export const dynamic='force-dynamic';
export async function POST(req:Request){
 try {
  const b=await req.json();
  if(b.action==='reset'){const fresh=initialState();await writeStore(fresh);return NextResponse.json(fresh);}
  const store=await readStore(); const t=store.transactions.find(x=>x.id===b.id);
  if(!t) return NextResponse.json({error:'Transaction not found'},{status:404});
  if(!Number.isInteger(b.version)||b.version!==t.version) return NextResponse.json({error:'This proposal changed. Refresh before acting.'},{status:409});
  let actor='';let action='';
  if(b.action==='customer_answer'){
   if(t.status!=='NEEDS_CUSTOMER') throw Error('This transaction does not need customer input');
   if(typeof b.answer!=='string'||b.answer.trim().length<5||b.answer.length>1000) throw Error('Please provide a meaningful answer (5–1000 characters)');
   t.customerAnswer=b.answer.trim();t.status='NEEDS_ACCOUNTANT';actor='Customer (demo)';action='Customer clarification received; routed to accountant';
  } else if(b.action==='approve'){
   if(t.status!=='READY'&&t.status!=='NEEDS_ACCOUNTANT') throw Error('Customer input is required before review');
   if(t.status==='NEEDS_ACCOUNTANT' && !t.customerAnswer && t.id!=='tx08' && t.id!=='tx12') throw Error('Missing customer clarification');
   if(t.category==='Unclassified') throw Error('An accountant must assign a category before approval');
   t.status='APPROVED';actor='Accountant (demo)';action='Classification proposal approved — NOT posted or exported';
  } else if(b.action==='reclassify'){
   if(t.status==='APPROVED') throw Error('Approved records cannot be silently edited');
   const allowed=['Software expense','Professional services','Travel expense','Office expense','Sales revenue','Payment processing fees','Internal transfer','Bank charges','Sales returns'];
   if(!allowed.includes(b.category)) throw Error('Invalid classification');
   t.category=b.category;t.status='READY';actor='Accountant (demo)';action=`Classification corrected to ${b.category}`;
  } else throw Error('Unsupported action');
  t.version++;t.audit.push({at:new Date().toISOString(),actor,action});store.updatedAt=new Date().toISOString();await writeStore(store);
  return NextResponse.json(store);
 } catch(e:any) {return NextResponse.json({error:e.message||'Unexpected error'},{status:400});}
}
