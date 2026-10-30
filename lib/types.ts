/** The four classification states understood by the UI; database status names are mapped in supabase-store.ts. */
export type Status = 'READY' | 'NEEDS_CUSTOMER' | 'NEEDS_ACCOUNTANT' | 'APPROVED';
/** UI transaction shape. Optional fields may be absent; version identifies the proposal used when submitting an action. */
export type Transaction = {
 id:string; provider:'Stripe'|'Airwallex'; ref:string; merchant:string; date:string; amount:number; currency:string;
 kind:string; category:string; evidence:string; status:Status; reason?:string; customerAnswer?:string;
 version:number; reconciliation?:string; isTransfer?:boolean; audit:{at:string; actor:string; action:string}[];
};
/** API snapshot of visible transactions. updatedAt is the snapshot creation time, not a database row modification time. */
export type Store = { transactions:Transaction[]; updatedAt:string };
