// Árbol de carpetas cifrado; la raíz se representa con parentId=null.
export const PAU='pau';
export const pauFolders=[['pau-q1','Pregunta 1 · Teoría y noticia'],['pau-q2','Pregunta 2 · Práctica obligatoria'],['pau-q3','Pregunta 3 · Prácticas A y B'],['pau-q4','Pregunta 4 · Conceptos A y B'],['pau-general','Modelos completos y criterios generales']];
// Add the PAU structure without replacing existing folders or documents.
export function ensurePAUFolders(lib){const out=lib.map(f=>({...f,parentId:f.parentId||null}));if(!out.some(f=>f.id===PAU))out.push({id:PAU,title:'Material PAU',parentId:null,files:[]});for(const [id,title] of pauFolders){if(!out.some(f=>f.id===id||f.parentId===PAU&&f.title.toLocaleLowerCase('es')===title.toLocaleLowerCase('es')))out.push({id,title,parentId:PAU,files:[]})}return validateLibrary(out)}
const kinds=['content','rubric','model','instructions','solution'];
const same=(a,b)=>a.kind===b.kind&&a.name===b.name&&a.data===b.data;
export function folderPath(lib,id){const names=[],seen=new Set();while(id){if(seen.has(id))throw Error('Ciclo en carpetas.');seen.add(id);const f=lib.find(x=>x.id===id);if(!f)throw Error('Carpeta no encontrada.');names.unshift(f.title);id=f.parentId||null;}return names.join(' / ')}
export function validateLibrary(lib){if(!Array.isArray(lib))throw Error('Repositorio inválido');const ids=new Set();for(const folder of lib){if(typeof folder.id!=='string'||ids.has(folder.id)||typeof folder.title!=='string'||!folder.title.trim()||!Array.isArray(folder.files))throw Error('Carpeta inválida');ids.add(folder.id);for(const f of folder.files)if(!kinds.includes(f.kind)||typeof f.name!=='string'||typeof f.data!=='string'||!/^data:[^,]*;base64,/.test(f.data))throw Error('Archivo de repositorio inválido');}for(const f of lib)folderPath(lib,f.id);return lib}
export function migrateLibrary(state){let lib=state.library;if(lib===undefined){lib=[{id:PAU,title:'Material PAU',files:[]}];for(const exam of state.exams){const id=exam.numbering?'topic-'+String(exam.numbering.topic).padStart(2,'0'):'recovered';let folder=lib.find(f=>f.id===id);if(!folder){folder={id,title:exam.numbering?'Tema '+String(exam.numbering.topic).padStart(2,'0'):'Material recuperado (clasificar)',files:[]};lib.push(folder)}for(const kind of kinds)for(const f of exam.materials[kind]||[]){const entry={...f,kind};if(!folder.files.some(x=>same(x,entry)))folder.files.push(entry)}}}lib=lib.map(f=>({...f,parentId:f.parentId||null}));lib=ensurePAUFolders(lib);return {...state,library:lib,classes:state.classes||[]}}
function titleCheck(lib,title,parentId,ignore){title=String(title).trim();if(!title||title.length>100)throw Error('Nombre de carpeta (1–100 caracteres).');if(parentId&&!lib.some(f=>f.id===parentId))throw Error('Carpeta superior inexistente.');if(lib.some(f=>f.id!==ignore&&(f.parentId||null)===(parentId||null)&&f.title.toLocaleLowerCase('es')===title.toLocaleLowerCase('es')))throw Error('Ya existe ese nombre dentro de esta carpeta.');return title}
export function addFolder(lib,title,parentId=null){return validateLibrary([...lib,{id:crypto.randomUUID(),title:titleCheck(lib,title,parentId),parentId,files:[]}])}
export function renameFolder(lib,id,title){const f=lib.find(x=>x.id===id);if(!f)throw Error('Carpeta inexistente.');return validateLibrary(lib.map(x=>x.id===id?{...x,title:titleCheck(lib,title,f.parentId,id)}:x))}
export function addLibraryFiles(lib,id,files){if(!lib.some(f=>f.id===id))throw Error('Selecciona una carpeta.');return validateLibrary(lib.map(f=>{if(f.id!==id)return f;const next=[...f.files];for(const file of files)if(!next.some(x=>same(x,file)))next.push(file);return {...f,files:next}}))}
export function moveFile(lib,from,index,to){if(from===to)throw Error('Elige otra carpeta.');const f=lib.find(x=>x.id===from)?.files[index];if(!f)throw Error('Archivo inexistente.');return addLibraryFiles(lib,to,[f]).map(x=>x.id===from?{...x,files:x.files.filter((_,i)=>i!==index)}:x)}
export function attachMaterials(materials,entries,{skipModel=false}={}){const out=structuredClone(materials);for(const f of entries){if(skipModel&&f.kind==='model')continue;const kind=['instructions','solution'].includes(f.kind)?'rubric':f.kind;if(!out[kind])throw Error('Tipo inválido');const name=f.kind==='instructions'?'Instrucciones — '+f.name:f.kind==='solution'?'Solucionario — '+f.name:f.name;if(!out[kind].some(x=>x.name===name&&x.data===f.data))out[kind].push({name,data:f.data,...(f.sourcePath?{sourcePath:f.sourcePath}:{}),...(['instructions','solution'].includes(f.kind)?{instruction:true,role:f.kind}:{})})}return out}

export const materialLabels={content:'Tema y otros contenidos',rubric:'Rúbrica y criterios de evaluación',solution:'Solucionario',model:'Examen original / modelo',instructions:'Instrucciones de corrección'};
export function folderMaterials(lib,id,includePAU=false){validateLibrary(lib);if(!lib.some(f=>f.id===id))throw Error('Selecciona una carpeta.');const roots=new Set([id,...(includePAU&&lib.some(f=>f.id===PAU)?[PAU]:[])]);const selected=lib.filter(f=>{let current=f;while(current){if(roots.has(current.id))return true;current=lib.find(x=>x.id===current.parentId)}return false});return selected.flatMap(f=>f.files.map((file,index)=>({file,folderId:f.id,index,path:folderPath(lib,f.id)})))}
export function hasRubric(materials){return !!materials.rubric?.some(f=>!f.instruction&&!['solution','instructions'].includes(f.role))}
export function materialManifest(exam){return Object.entries(exam.materials||{}).flatMap(([kind,files])=>files.map(f=>({kind:f.role||(f.instruction?'instructions':kind),name:f.name,data:f.data,sourcePath:f.sourcePath})));}
export function manifestText(exam){return materialManifest(exam).map(f=>`${materialLabels[f.kind]||f.kind}: ${f.name}${f.sourcePath?' ['+f.sourcePath+']':''}`).join('\n')||'Sin materiales';}
export function safeFileName(name){return String(name).replace(/[\\/:*?"<>|\x00-\x1f]/g,'_').replace(/^\.+/,'_').slice(0,160).trim()||'archivo'}
export function packEntries(exam,prompt,pending=null,includeMaterials=true){const files=[],used=new Set(['00-instrucciones.txt']),mappings=[];const add=(original,data,kind)=>{const base=safeFileName(original);let name=base,n=2;while(used.has(name.toLocaleLowerCase('es')))name=`${n++}-${base}`;used.add(name.toLocaleLowerCase('es'));const match=/^data:[^,]*;base64,([A-Za-z0-9+/=]+)$/.exec(data);if(!match)throw Error('Archivo local inválido: '+original);files.push({name,data:match[1]});if(name!==original)mappings.push(`${name} = ${original} (${kind})`)};if(includeMaterials)for(const f of materialManifest(exam))add(f.name,f.data,materialLabels[f.kind]||f.kind);if(pending)pending.photos.forEach((s,i)=>add(`${pending.code}-P${String(i+1).padStart(2,'0')}.jpg`,s,'página del examen'));const text=prompt+(mappings.length?'\n\nCorrespondencia de nombres del paquete (usa el nombre original al referenciar figuras):\n'+mappings.join('\n'):'');if(files.length>1000||files.reduce((sum,f)=>sum+Math.ceil(f.data.length*3/4),new TextEncoder().encode(text).length)>200*1024*1024)throw Error('Paquete superior a 200 MB o 1000 archivos. Descarga los documentos individualmente.');return [['00-instrucciones.txt',text],...files.map(f=>[f.name,Uint8Array.from(atob(f.data),c=>c.charCodeAt(0))])];}

// Vista de biblioteca: orden natural, conteos y filtros sin modificar el almacén.
const natural=new Intl.Collator('es',{numeric:true,sensitivity:'base'});
const searchKey=s=>String(s??'').normalize('NFD').replace(/\p{M}/gu,'').toLocaleLowerCase('es');
export const libraryKinds=['content','rubric','solution','model','instructions'];
export function browseFolders(lib,parentId=null,query=''){
 const q=searchKey(query).trim(); const matches=lib.filter(f=>q?searchKey(folderPath(lib,f.id)).includes(q):(f.parentId||null)===parentId);
 return matches.sort((a,b)=>(a.id===PAU?-1:b.id===PAU?1:natural.compare(q?folderPath(lib,a.id):a.title,q?folderPath(lib,b.id):b.title))).map(f=>{
  const ids=new Set([f.id]);let previous=-1;while(previous!==ids.size){previous=ids.size;for(const x of lib)if(ids.has(x.parentId))ids.add(x.id)}
  return {id:f.id,title:f.title,path:folderPath(lib,f.id),direct:f.files.length,total:lib.reduce((n,x)=>n+(ids.has(x.id)?x.files.length:0),0),children:lib.filter(x=>x.parentId===f.id).length,pau:(()=>{let x=f;while(x){if(x.id===PAU)return true;x=lib.find(y=>y.id===x.parentId)}return false})()};
 });
}
export function browseFiles(folder,kind='all',query=''){
 const q=searchKey(query).trim();return (folder?.files||[]).map((file,index)=>({file,index})).filter(({file})=>(kind==='all'||file.kind===kind)&&searchKey(file.name).includes(q)).sort((a,b)=>libraryKinds.indexOf(a.file.kind)-libraryKinds.indexOf(b.file.kind)||natural.compare(a.file.name,b.file.name));
}

// v13.1 — required material roles are independent of the file extension or filename.
export function correctionType(exam){return exam?.correctionType==='task'?'task':'exam';}
export function requiredRoles(exam){return correctionType(exam)==='task'?['model','rubric']:['content','instructions','rubric'];}
export function missingRoles(exam){const m=materialManifest(exam);return requiredRoles(exam).filter(k=>!m.some(f=>f.kind===k&&f.data));}
export function correctionRoleLabel(kind,exam){return kind==='model'?(correctionType(exam)==='task'?'Enunciado de la tarea':'Enunciado del examen'):materialLabels[kind]||kind;}
export function archiveReferenceFiles(lib,folderId,title,entries){
 let next=lib;let id=folderId;
 if(!id){const name=String(title||'Material docente').trim().slice(0,100)||'Material docente';const old=next.find(f=>!f.parentId&&f.title.toLocaleLowerCase('es')===name.toLocaleLowerCase('es'));if(old)id=old.id;else{next=addFolder(next,name);id=next.at(-1).id;}}
 const clean=entries.map(({kind,name,data})=>({kind,name,data}));next=addLibraryFiles(next,id,clean);
 return {library:next,folderId:id,entries:clean.map(f=>({...f,sourcePath:folderPath(next,id)}))};
}

// Recover references that older drafts kept only inside a test. Never copy student scans.
export function archiveUnlinkedReferences(lib,exam,folderId=null){
 let library=lib;const updated=structuredClone(exam.materials);const linked=[];
 for(const [bucket,files] of Object.entries(updated))for(const f of files){
  if(f.sourcePath)continue;
  const kind=f.role||(f.instruction?'instructions':bucket),name=kind==='instructions'?f.name.replace(/^Instrucciones — /,''):kind==='solution'?f.name.replace(/^Solucionario — /,''):f.name;
  let folder=library.find(x=>x.files.some(z=>z.kind===kind&&z.name===name&&z.data===f.data));
  if(!folder){const a=archiveReferenceFiles(library,folderId,exam.title,[{kind,name,data:f.data}]);library=a.library;folder=library.find(x=>x.id===a.folderId);}
  f.sourcePath=folderPath(library,folder.id);linked.push({kind,name,data:f.data,sourcePath:f.sourcePath,folderId:folder.id});
 }
 return {library,materials:updated,linked};
}
