import {csvCell} from './core.mjs';
export const ALL='__all__';
function target(state,id){
 if(id===ALL)return ()=>true;
 if(typeof id!=='string'||!state.exams.some(e=>e.id===id))throw Error('Selecciona una prueba existente.');
 return x=>x.examId===id;
}
export function cleanupSummary(state,id){
 const match=target(state,id),exams=state.exams.filter(e=>id===ALL||e.id===id),pending=state.pending.filter(match),records=state.records.filter(match);
 return {exams:exams.length,materials:exams.reduce((n,e)=>n+Object.values(e.materials||{}).reduce((a,files)=>a+files.length,0),0),pending:pending.length,pages:pending.reduce((n,p)=>n+p.photos.length,0),records:records.length};
}
export function exportGrades(state,id=ALL){
 const match=target(state,id);
 return '\ufeff'+[['Código','Prueba','Inicial','Ortografía','Final'],...state.records.filter(match).map(r=>[r.code,state.exams.find(e=>e.id===r.examId)?.title,r.grade.total.toFixed(2).replace('.',','),r.grade.penalty.toFixed(2).replace('.',','),r.grade.final.toFixed(2).replace('.',',')])].map(row=>row.map(csvCell).join(';')).join('\r\n');
}
export function cleanupState(state,id,{keepMaterials=false,acknowledged=false,allowPending=false,confirmation=''}={}){
 const match=target(state,id),summary=cleanupSummary(state,id);
 if(!acknowledged||confirmation.trim()!=='BORRAR')throw Error('Confirma que has guardado las notas necesarias y escribe BORRAR.');
 if(summary.pending&&!allowPending)throw Error('Hay exámenes pendientes. Termina de corregirlos o autoriza expresamente su eliminación.');
 // Conserva la numeración y revisión, así como los datos ajenos al ámbito escogido.
 return {...state,exams:keepMaterials?state.exams:state.exams.filter(e=>id!==ALL&&e.id!==id),pending:state.pending.filter(p=>!match(p)),records:state.records.filter(r=>!match(r))};
}
