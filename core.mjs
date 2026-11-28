const plain=s=>typeof s==='string'&&s.trim().length>0;
const norm=s=>s.normalize('NFC').trim().toLocaleLowerCase('es').replace(/\s+/g,' ');
export function validatePlan(plan){
 if(!plan||!plain(plan.guide)||!Array.isArray(plan.items)||!plan.items.length||plan.items.length>150)throw Error('Guía o apartados inválidos');
 if(plan.conflicts!==undefined&&(!Array.isArray(plan.conflicts)||plan.conflicts.some(x=>!plain(x))))throw Error('Conflictos de guía inválidos');const ids=new Set();let max=0;
 for(const i of plan.items){if(!plain(i.id)||ids.has(i.id)||!plain(i.name)||!plain(i.criteria)||!Number.isFinite(i.max)||i.max<=0||Math.abs(i.max*100-Math.round(i.max*100))>1e-6||!['normal','map'].includes(i.kind))throw Error('Apartado de rúbrica inválido');if(i.kind==='map'&&(!Array.isArray(i.accepted)||!i.accepted.length||i.accepted.some(x=>!plain(x))))throw Error('Cada localización necesita topónimos aceptados');ids.add(i.id);max+=Math.round(i.max*100)}
 if(max!==1000)throw Error('La rúbrica debe sumar exactamente 10 puntos');return plan;
}
export function validateResult(plan,raw){
 validatePlan(plan);if(!raw||!Array.isArray(raw.items)||raw.items.length!==plan.items.length||!Array.isArray(raw.errors)||!Array.isArray(raw.flags))throw Error('Respuesta de IA incompleta');
 const byId=new Map(raw.items.map(i=>[i.id,i]));if(byId.size!==plan.items.length)throw Error('Apartados duplicados');
 if(raw.flags.some(f=>!plain(f)))throw Error('Avisos inválidos');const flags=[...raw.flags];const items=plan.items.map(p=>{const i=byId.get(p.id);if(!i||!Number.isFinite(i.points)||i.points<0||i.points>p.max||!plain(i.reason)||typeof i.review!=='boolean')throw Error('Puntuación o justificación inválida: '+p.name);let points=Math.round(i.points*100)/100;let review=i.review===true;let reason=i.reason;
 if(p.kind==='map'){if(typeof i.written!=='string'||!['correct','incorrect','uncertain'].includes(i.location))throw Error('Falta evidencia cartográfica: '+p.name);if(i.location==='uncertain'||review){points=0;review=true;flags.push('Revisar localización o lectura: '+p.name)}else{const matches=p.accepted.some(a=>a.normalize('NFC').trim()===i.written.normalize('NFC').trim());points=i.location==='correct'&&matches?p.max:0;reason=i.location==='incorrect'?'Localización incorrecta. '+i.reason:!matches?'Topónimo no coincide con las variantes admitidas. '+i.reason:'Localización y topónimo correctos. '+i.reason} }
 if(i.improvement!==undefined&&(typeof i.improvement!=='string'||i.improvement.length>2000))throw Error('Punto de mejora inválido: '+p.name);return {id:p.id,name:p.name,kind:p.kind,max:p.max,points,reason,...(i.improvement?.trim()?{improvement:i.improvement.trim()}:{}),written:i.written||'',location:i.location||'',review};});
 const errors=raw.errors.map(e=>{if(!plain(e.wrong)||!plain(e.right)||typeof e.confirmed!=='boolean'||typeof e.map!=='boolean'||!byId.has(e.itemId))throw Error('Falta ortográfica sin evidencia válida');const p=plan.items.find(i=>i.id===e.itemId);return {wrong:e.wrong,right:e.right,confirmed:e.confirmed&&e.wrong.normalize('NFC').trim()!==e.right.normalize('NFC').trim(),map:p.kind==='map',itemId:e.itemId};});
 return {items,errors,flags};
}
export function calculate(items,errors=[]){if(!Array.isArray(items)||!items.length||!Array.isArray(errors))throw Error('Sin apartados o faltas inválidas');let total=0,max=0;for(const i of items){if(!Number.isFinite(i.points)||!Number.isFinite(i.max)||i.max<=0||i.points<0||i.points>i.max)throw Error('Puntuación inválida');total+=Math.round(i.points*100);max+=Math.round(i.max*100)}if(max!==1000)throw Error('La rúbrica debe sumar 10 puntos');const unique=new Set(errors.filter(e=>e&&e.confirmed===true&&e.map===false&&plain(e.wrong)).map(e=>norm(e.wrong)));const penalty=Math.min(100,Math.max(0,unique.size-2)*10);return {total:total/100,penalty:penalty/100,final:Math.max(0,total-penalty)/100}}
export function csvCell(value){let s=String(value??'');if(/^[\s\uFEFF]*[=+@-]|^[\t\r\n]/u.test(s))s="'"+s;return '"'+s.replaceAll('"','""')+'"'}
export function nextCode(records){return 'EX-'+String(Math.max(0,...records.map(r=>Number(r.code.split('-').pop())||0))+1).padStart(4,'0')}
export function validateBackup(data){if(!data||!Array.isArray(data.exams)||!Array.isArray(data.records))throw Error('Copia inválida');const ids=new Set();for(const e of data.exams){if(!plain(e.id)||ids.has(e.id)||!plain(e.title)||!e.materials||!['model','content','rubric'].every(k=>Array.isArray(e.materials[k])&&e.materials[k].length&&e.materials[k].every(f=>plain(f.name)&&typeof f.data==='string'&&f.data.startsWith('data:'))))throw Error('Prueba inválida en copia');if(e.plan)validatePlan(e.plan);ids.add(e.id)}const codes=new Set();for(const r of data.records){if(!/^EX-\d{4,}$/.test(r.code)||codes.has(r.code)||!ids.has(r.examId)||!r.result||!r.grade)throw Error('Registro inválido en copia');const g=calculate(r.result.items,r.result.errors);if(['total','penalty','final'].some(k=>g[k]!==r.grade[k]))throw Error('Nota incoherente en copia');codes.add(r.code)}return data}

// La nota oficial es una decisión docente explícita, nunca derivada de la técnica.
export function officialGrade(grade){const value=grade?.official;if(value==null)return null;if(!Number.isInteger(value)||value<0||value>10)throw Error('Calificación docente inválida.');return value;}
export function assignOfficial(grade,value){if(!grade||!Number.isFinite(grade.final)||grade.final<0||grade.final>10)throw Error('Nota técnica inválida.');if(typeof value!=='string'&&typeof value!=='number')throw Error('Selecciona una nota entera de 0 a 10.');if(typeof value==='string'&&!/^(?:[0-9]|10)$/.test(value))throw Error('Selecciona una nota entera de 0 a 10.');const n=Number(value);if(!Number.isInteger(n)||n<0||n>10)throw Error('Selecciona una nota entera de 0 a 10.');return {...grade,official:n};}
export function officialLabel(grade){const n=officialGrade(grade);return n===null?'Pendiente':String(n);}
export function exactLabel(grade){return grade.final.toFixed(2).replace('.',',');}

// Local identity only: never infer a name from the ordinal of an unnumbered PDF.
export function localStudentName(state,record){
 if(typeof record.localName==='string')return record.localName;
 const e=state.exams.find(x=>x.id===record.examId),n=e?.numbering;
 const c=state.classes?.find(x=>x.id===e?.classId);
 if(!n||!c||!record.code)return '';
 const p=`${String(n.topic).padStart(2,'0')}-${n.subject}${n.group}-${String(n.test).padStart(2,'0')}-`;
 if(!record.code.startsWith(p)||!/^\d{2}$/.test(record.code.slice(p.length)))return '';
 const number=Number(record.code.slice(p.length));
 return number>=1&&number<=n.count?c.students.find(s=>s.number===number)?.name||'':'';
}
export function cleanLocalName(value){if(typeof value!=='string'||value.length>180||/[\u0000-\u001f\u007f]/.test(value))throw Error('Nombre no válido (máximo 180 caracteres).');return value.trim().normalize('NFC');}
export function validateLocalNames(state){const seen=new Set();for(const r of [...state.pending,...state.records]){if(r.localName!==undefined)cleanLocalName(r.localName);const name=localStudentName(state,r);if(!name)continue;const key=JSON.stringify([r.examId,name.normalize('NFC').trim().toLocaleLowerCase('es').replace(/\s+/g,' ')]);if(seen.has(key))throw Error('Nombre repetido en la misma prueba: '+name+'. Comprueba la identificación.');seen.add(key);}return state;}
