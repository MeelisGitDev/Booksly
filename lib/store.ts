import { promises as fs } from 'node:fs';
import path from 'node:path';
import type {Store} from './types';
import {initialState} from './seed';
const file = path.join(process.cwd(),'data','state.json');
/**
 * Read the legacy local JSON store. If the file does not exist, return fresh sample data; other file or JSON errors propagate to the caller. Current API routes use readSupabaseStore instead.
 */
export async function readStore():Promise<Store> { try {return JSON.parse(await fs.readFile(file,'utf8')) as Store;} catch(e:any) {if(e.code!=='ENOENT') throw e; return initialState();} }
/**
 * Write a Store to the legacy data/state.json file, creating its directory if needed. This overwrites the local file; it does not update Supabase and is not used by current API routes.
 */
export async function writeStore(s:Store) {await fs.mkdir(path.dirname(file),{recursive:true});await fs.writeFile(file,JSON.stringify(s,null,2));}
