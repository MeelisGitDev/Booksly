import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {Store} from './types';
import {initialState} from './seed';
const file = path.join(process.cwd(),'data','state.json');
export async function readStore():Promise<Store> { try {return JSON.parse(await fs.readFile(file,'utf8')) as Store;} catch(e:any) {if(e.code!=='ENOENT') throw e; return initialState();} }
export async function writeStore(s:Store) {await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(s,null,2));}
