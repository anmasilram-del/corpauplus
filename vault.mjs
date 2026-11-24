const enc=new TextEncoder(),dec=new TextDecoder('utf-8',{fatal:true});
const format='pau-local-v1';
export function isVault(v){return v?.format===format}
export async function deriveVaultKey(password,salt){if(typeof password!=='string'||password.length<12)throw Error('Usa una contraseña de al menos 12 caracteres.');if(!(salt instanceof Uint8Array)||salt.length!==16)throw Error('Cabecera de cifrado inválida.');const base=await crypto.subtle.importKey('raw',enc.encode(password),'PBKDF2',false,['deriveKey']);return crypto.subtle.deriveKey({name:'PBKDF2',salt,iterations:600000,hash:'SHA-256'},base,{name:'AES-GCM',length:256},false,['encrypt','decrypt'])}
export function newSalt(){return crypto.getRandomValues(new Uint8Array(16))}
function aad(rev){if(!Number.isSafeInteger(rev)||rev<0)throw Error('Versión inválida.');return enc.encode(format+':'+rev)}
export async function seal(state,key,salt){const iv=crypto.getRandomValues(new Uint8Array(12)),revision=state.revision;const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:aad(revision)},key,enc.encode(JSON.stringify(state)));return {format,revision,salt,iv,cipher}}
export async function unseal(v,key){try{if(!isVault(v)||!(v.iv instanceof Uint8Array)||v.iv.length!==12||!(v.cipher instanceof ArrayBuffer))throw Error();const s=JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:v.iv,additionalData:aad(v.revision)},key,v.cipher)));if(s.revision!==v.revision)throw Error();return s}catch{throw Error('Contraseña incorrecta o datos dañados.')}}
