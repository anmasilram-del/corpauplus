import assert from 'node:assert/strict';
import {isVault,deriveVaultKey,newSalt,seal,unseal} from './vault.mjs';
let count=0;async function test(n,f){await f();console.log('OK · '+n);count++}
const password='docente-ficticio-2026',salt=newSalt(),key=await deriveVaultKey(password,salt),state={revision:1,exams:[{title:'Material confidencial'}],pending:[{photos:['imagen ficticia']}],records:[{grade:8}],next:2};let v;
await test('contraseña corta rechazada',()=>assert.rejects(deriveVaultKey('1234',salt)));
await test('sal inválida rechazada',()=>assert.rejects(deriveVaultKey(password,new Uint8Array(8))));
await test('clave no exportable',()=>assert.equal(key.extractable,false));
await test('cifrado y recuperación íntegra',async()=>{v=await seal(state,key,salt);assert.ok(isVault(v));assert.deepEqual(await unseal(v,key),state)});
await test('registro cifrado no contiene datos de prueba en claro',()=>{assert.deepEqual(Object.keys(v).sort(),['cipher','format','iv','revision','salt']);assert.ok(!new TextDecoder().decode(v.cipher).includes('Material confidencial'))});
await test('contraseña incorrecta rechazada',async()=>assert.rejects(unseal(v,await deriveVaultKey('otra-contraseña-2026',salt))));
await test('alteración del cifrado rechazada',async()=>{const c=v.cipher.slice(0);new Uint8Array(c)[0]^=1;await assert.rejects(unseal({...v,cipher:c},key))});
await test('alteración de revisión rechazada',()=>assert.rejects(unseal({...v,revision:2},key)));
await test('alteración del nonce rechazada',async()=>{const iv=v.iv.slice();iv[0]^=1;await assert.rejects(unseal({...v,iv},key))});
await test('nonce distinto en cada guardado',async()=>assert.notDeepEqual((await seal(state,key,salt)).iv,v.iv));
await test('lectura con clave derivada de nuevo',async()=>assert.deepEqual(await unseal(structuredClone(v),await deriveVaultKey(password,salt)),state));
await test('registro antiguo reconocido como no cifrado',()=>assert.equal(isVault(state),false));
console.log(`${count}/${count} pruebas de cifrado superadas.`);
