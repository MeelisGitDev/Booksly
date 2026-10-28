export type Status = 'READY' | 'NEEDS_CUSTOMER' | 'NEEDS_ACCOUNTANT' | 'APPROVED';
export type Transaction = {
 id:string; provider:'Stripe'|'Airwallex'; ref:string; merchant:string; date:string; amount:number; currency:string;
 kind:string; category:string; evidence:string; status:Status; reason?:string; customerAnswer?:string;
 version:number; reconciliation?:string; isTransfer?:boolean; audit:{at:string; actor:string; action:string}[];
};
export type Store = { transactions:Transaction[]; updatedAt:string };
