import type {Store,Transaction,Status} from './types';
const entries: Array<[string,'Stripe'|'Airwallex',string,string,number,string,string,Status,string,string?,boolean?]> = [
 ['tx01','Stripe','pi_3QX1001','Customer order #1042',250,'Customer payment','Sales revenue','READY','Invoice INV-1042'],
 ['tx02','Airwallex','awx_2002','AWS',-142.50,'Supplier payment','Software expense','NEEDS_CUSTOMER','Missing invoice','Please upload the AWS invoice or explain why it is unavailable.'],
 ['tx03','Airwallex','awx_2003','NOVA GLOBAL',-320,'Supplier payment','Unclassified','NEEDS_CUSTOMER','No evidence','What was this payment for?'],
 ['tx04','Stripe','pi_3QX1004','Customer order #1043',1000,'Customer payment','Sales revenue','READY','Invoice INV-1043'],
 ['tx05','Stripe','fee_3QX1004','Stripe processing fee',-30,'Processing fee','Payment processing fees','READY','Stripe fee statement'],
 ['tx06','Airwallex','awx_payout_970','Stripe settlement',970,'Transfer / payout','Internal transfer','READY','Matched Stripe settlement',undefined,true],
 ['tx07','Airwallex','awx_2007','Figma',-28,'Supplier payment','Software expense','READY','Invoice FIG-2201'],
 ['tx08','Airwallex','awx_2008','Unknown FX charge',-13.40,'Fee','Bank charges','NEEDS_ACCOUNTANT','Provider statement'],
 ['tx09','Stripe','re_3QX1009','Refund order #1008',-75,'Customer refund','Sales returns','READY','Refund confirmation'],
 ['tx10','Airwallex','awx_2010','Google Workspace',-19.20,'Supplier payment','Software expense','READY','Invoice GW-2210'],
 ['tx11','Stripe','pi_3QX1011','Customer order #1044',425,'Customer payment','Sales revenue','READY','Invoice INV-1044'],
 ['tx12','Airwallex','awx_2012','Cross-border services',-860,'Supplier payment','Professional services','NEEDS_ACCOUNTANT','Supplier invoice']
];
/**
 * Create a fresh set of 12 sample transactions and their simulated import audit events. Returns a Store; this helper does not write to Supabase or to disk.
 */
export function initialState():Store { return {updatedAt:new Date().toISOString(),transactions:entries.map(/** Convert one sample-data tuple into a typed Transaction, using its position to choose the demo date. */ (r,i):Transaction=>({
 id:r[0],provider:r[1],ref:r[2],merchant:r[3],date:`2026-10-${String(11+i).padStart(2,'0')}`,amount:r[4],currency:'SGD',kind:r[5],category:r[6],status:r[7],evidence:r[8],reason:r[9],isTransfer:r[10],version:1,
 reconciliation:r[0]==='tx04'||r[0]==='tx05'||r[0]==='tx06'?'SETTLEMENT-1043':undefined,
 audit:[{at:'2026-10-28T08:00:00.000Z',actor:'Demo importer',action:'Source record imported'},{at:'2026-10-28T08:00:02.000Z',actor:'Rules engine',action:'Classification proposal prepared (simulated)'}]
 }))}; }
