 'use strict';
/* This module deliberately reads the current inventory state only; it does not write to Supabase. */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const types=['Driver','Fairway','Hybrid','Iron','Wedge','Putter'];
const names={Driver:'Driver(s)',Fairway:'Fairway(s)',Hybrid:'Hybrid(s)',Iron:'Iron(s)',Wedge:'Wedge(s)',Putter:'Putter'};
const cell=v=>`<td>${esc(v)}</td>`;
function formRows(items){
  return types.map(type=>{
    const rows=items.filter(c=>c.club_type===type);
    // Preserve all six category rows, even if nothing in that category was selected.
    const list=rows.length?rows:[null];
    return list.map((c,i)=>`<tr class="form-row"><td class="type-cell">${i===0?names[type]:''}</td>${cell(c?.quantity??'')}${cell(c?.head_model??'')}${cell(c?.loft_set_makeup??'')}${cell(c?.shaft_model??'')}${cell(c?.grip??'')}<td class="approval-cell"><span class="in-label">In</span><span class="out-label">Out</span></td></tr>`).join('');
  }).join('');
}
function build(){
  const associate=associates.find(a=>a.associate_id===document.getElementById('associate').value);
  if(!associate){status('Select an associate before printing.',true);return false;}
  const items=clubs.filter(c=>selected.has(c.club_id));
  if(!items.length){status('Select at least one club before printing.',true);return false;}
  const date=new Intl.DateTimeFormat('en-US',{timeZone:'America/Los_Angeles',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const fullName=`${associate.first_name} ${associate.last_name}`;
  const sheet=document.getElementById('printSheet');
  sheet.innerHTML=`<div class="paper"><div class="form-heading"><div class="form-logo"><span class="pga-mark">PGA</span><strong>SUPERSTORE</strong></div><div class="form-title">Associate Club Inventory Form</div></div><table class="inventory-form"><colgroup><col style="width:11%"><col style="width:5%"><col style="width:17%"><col style="width:11%"><col style="width:24%"><col style="width:17%"><col style="width:15%"></colgroup><thead><tr><th>Club<br>Type</th><th>#</th><th>Head Model</th><th>Loft/Set<br>Makeup</th><th>Shaft Model</th><th>Grip</th><th>Check In/Check Out<br>(SLT Initials)</th></tr></thead><tbody>${formRows(items)}</tbody></table><div class="form-footer"><div class="signature-line"><b>Associate Name:</b><span class="typed">${esc(fullName)}</span></div><div class="signature-line"><b>Date:</b><span class="typed">${esc(date)}</span></div><div class="signature-line"><b>Associate Signature:</b><span class="blank"></span></div><div class="signature-line"><b>SLT Signature:</b><span class="blank"></span></div></div></div>`;
  sheet.hidden=false;
  return true;
}
function printForm(){if(!build())return;window.print();}
document.getElementById('printInventory').addEventListener('click',printForm);
window.addEventListener('afterprint',()=>{document.getElementById('printSheet').hidden=true;});
})();
