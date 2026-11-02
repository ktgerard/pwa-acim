'use strict';
const $ = id => document.getElementById(id);
const order = ['Driver','Fairway','Hybrid','Iron','Wedge','Putter'];
let client, associates = [], clubs = [], selected = new Set(), requestId = 0;
let allAssociates = [], allClubs = [];
let headCatalog = [];
const show = (id, visible) => { $(id).hidden = !visible; };
const status = (message, error = false) => { $('message').textContent = message; $('message').className = 'notice' + (error ? ' error' : ''); };
const fmt = a => `${a.last_name}, ${a.first_name}${a.employee_number ? ` (${a.employee_number})` : ''}`;
const sortClubs = (a,b) => order.indexOf(a.club_type)-order.indexOf(b.club_type) || a.sort_order-b.sort_order || a.head_model.localeCompare(b.head_model);
function renderAssociates() {
 const term = $('search').value.trim().toLocaleLowerCase(); const previous = $('associate').value;
 const matching = associates.filter(a => `${a.last_name}, ${a.first_name} ${a.first_name} ${a.last_name} ${a.employee_number || ''}`.toLocaleLowerCase().includes(term));
 $('associate').replaceChildren(new Option('Choose an associate',''), ...matching.map(a => new Option(fmt(a)+(a.active_flag?'':' [inactive]'),a.associate_id)));
 if (matching.some(a => a.associate_id === previous)) $('associate').value = previous;
 else { $('associate').value = ''; clearClubs(); }
}
function clearClubs() { allClubs=[];$('clubAdmin').replaceChildren();clubs=[]; selected.clear(); $('employeeMeta').textContent=''; $('clubs').replaceChildren(); const p=document.createElement('p');p.className='muted';p.textContent='Select an associate to view saved clubs.';$('clubs').append(p); count(); }
function count(){ $('selectionCount').textContent = `${selected.size} selected`; }
function renderClubs(){ const root=$('clubs');root.replaceChildren();if(!clubs.length){const p=document.createElement('p');p.className='muted';p.textContent='No active clubs are stored for this associate.';root.append(p);count();return;}
 for(const c of clubs){const label=document.createElement('label');label.className='club';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=selected.has(c.club_id);checkbox.addEventListener('change',()=>{if(checkbox.checked)selected.add(c.club_id);else selected.delete(c.club_id);count();});const info=document.createElement('span');const title=document.createElement('strong');title.textContent=`${c.club_type} · ${c.head_model}`;const details=document.createElement('small');details.textContent=[`Qty ${c.quantity}`,c.loft_set_makeup,c.shaft_model,c.grip].filter(Boolean).join(' · ');info.append(title,details);label.append(checkbox,info);root.append(label);}count(); }
async function loadAssociates(){status('Loading associates…');const {data,error}=await client.from('acim_associates').select('associate_id,first_name,last_name,employee_number,active_flag').order('last_name').order('first_name');if(error){status(`Unable to load associates: ${error.message}`,true);return;}allAssociates=data||[];associates=allAssociates.filter(a=>$('includeInactive').checked||a.active_flag);renderAssociates();status(`${allAssociates.filter(a=>a.active_flag).length} active associates available.`);}
async function loadClubs(){const id=$('associate').value;const token=++requestId;clearClubs();if(!id)return;const a=associates.find(a=>a.associate_id===id);$('employeeMeta').textContent=a?fmt(a):'';status('Loading inventory…');const {data,error}=await client.from('acim_clubs').select('club_id,club_type,quantity,head_model,loft_set_makeup,shaft_model,grip,sort_order,active_flag').eq('associate_id',id);if(token!==requestId)return;if(error){status(`Unable to load inventory: ${error.message}`,true);return;}allClubs=(data||[]).sort(sortClubs);clubs=allClubs.filter(c=>c.active_flag);renderClubs();renderClubAdmin();status(`${clubs.length} active inventory records loaded.`);}
async function sessionView(){const {data:{session},error}=await client.auth.getSession();if(error)status(error.message,true);const signed=!!session;show('loginPanel',!signed);show('inventoryPanel',signed);$('accountLabel').textContent=signed?session.user.email||'Service desk':'';if(signed)await loadAssociates();else{associates=[];clearClubs();status('Sign in to view the shared inventory.');}}
async function start(){const cfg=window.ACIM_CONFIG||{};if(!cfg.supabaseUrl?.startsWith('https://')||cfg.supabaseUrl.includes('YOUR_PROJECT')||!cfg.supabasePublishableKey||cfg.supabasePublishableKey.includes('YOUR_PUBLISHABLE')){status('Configuration required: edit config.js with the Supabase project URL and publishable key.',true);return;}if(!window.supabase){status('Supabase library did not load. Check network connectivity.',true);return;}client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 $('loginForm').addEventListener('submit',async e=>{e.preventDefault();status('Signing in…');const {error}=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){status(`Sign-in failed: ${error.message}`,true);return;}$('password').value='';await sessionView();});
 $('signOut').addEventListener('click',async()=>{const {error}=await client.auth.signOut();if(error)status(error.message,true);else await sessionView();});$('search').addEventListener('input',renderAssociates);$('associate').addEventListener('change',loadClubs);wireManagement();$('selectAll').addEventListener('click',()=>{selected=new Set(clubs.map(c=>c.club_id));renderClubs();});$('clearAll').addEventListener('click',()=>{selected.clear();renderClubs();});
 try {const r=await fetch('./data/heads.json',{cache:'no-store'});if(!r.ok)throw Error('HTTP '+r.status);headCatalog=await r.json();}catch(e){status('Head reference unavailable; manual club entry remains available: '+e.message,true);}
 await sessionView();if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
}
start().catch(e=>status(`Startup failed: ${e.message}`,true));

function field(name,label,value='',type='text',required=false){const l=document.createElement('label');l.textContent=label;const el=document.createElement('input');el.name=name;el.type=type;el.value=value??'';el.required=required;l.append(el);return l;}
function choice(name,label,values,current){const l=document.createElement('label');l.textContent=label;const el=document.createElement('select');el.name=name;for(const v of values)el.add(new Option(v,v));el.value=current||values[0];l.append(el);return l;}
function editor(title,fields,save){$('editorTitle').textContent=title;$('editorFields').replaceChildren(...fields);$('editorForm').onsubmit=async e=>{e.preventDefault();const button=$('saveEditor');button.disabled=true;try{await save(Object.fromEntries(new FormData(e.target).entries()));$('editor').close();}catch(err){status('Save failed: '+err.message,true);}finally{button.disabled=false;}};$('editor').showModal();}
function editAssociate(a){editor(a?'Edit associate':'Add associate',[field('first_name','First name',a?.first_name,'text',true),field('last_name','Last name',a?.last_name,'text',true),field('employee_number','Employee number (optional)',a?.employee_number)],async values=>{values.first_name=values.first_name.trim();values.last_name=values.last_name.trim();values.employee_number=values.employee_number.trim()||null;const query=a?client.from('acim_associates').update(values).eq('associate_id',a.associate_id):client.from('acim_associates').insert(values).select('associate_id').single();const {data,error}=await query;if(error)throw error;const id=a?.associate_id||data.associate_id;await loadAssociates();$('search').value='';renderAssociates();$('associate').value=id;await loadClubs();status('Associate saved.');});}
async function toggleAssociate(){const a=allAssociates.find(x=>x.associate_id===$('associate').value);if(!a)return status('Select an associate first.',true);if(!confirm(`${a.active_flag?'Deactivate':'Restore'} ${fmt(a)}?`))return;const {error}=await client.from('acim_associates').update({active_flag:!a.active_flag}).eq('associate_id',a.associate_id);if(error)return status(error.message,true);$('includeInactive').checked=true;await loadAssociates();$('associate').value=a.associate_id;await loadClubs();status('Associate status updated.');}
function selectField(label, values, value, onChange){
 const wrap=document.createElement('label');wrap.textContent=label;
 const sel=document.createElement('select');sel.add(new Option('Select…',''));
 values.forEach(v=>sel.add(new Option(String(v),String(v))));sel.value=String(value??'');
 sel.addEventListener('change',()=>onChange(sel.value));wrap.append(sel);return {wrap,sel};
}
function editClub(c){
 const id=$('associate').value;if(!id)return status('Select an associate before adding a club.',true);
 const type=choice('club_type','Club type',order,c?.club_type);
 const quantity=field('quantity','Quantity',c?.quantity??1,'number',true);
 const head=field('head_model','Head model (editable)',c?.head_model,'text',true);
 const loft=field('loft_set_makeup','Loft / set makeup',c?.loft_set_makeup);
 const shaft=field('shaft_model','Shaft model',c?.shaft_model);
 const grip=field('grip','Grip',c?.grip);
 const sort=field('sort_order','Sort order',c?.sort_order??0,'number',true);
 const catalog=document.createElement('div');catalog.className='catalog';
 const heading=document.createElement('strong');heading.textContent='FIS HeadDB reference';catalog.append(heading);
 const note=document.createElement('p');note.className='muted';note.textContent='Choose a head to fill the description, or type a model manually. Reference data comes from the included CRG snapshot.';catalog.append(note);
 const older=document.createElement('label');older.className='inline-check';const check=document.createElement('input');check.type='checkbox';check.checked=false;older.append(check,document.createTextNode(' Include models before 2015'));catalog.append(older);
 const filters=document.createElement('div');catalog.append(filters);
 const selectedId=document.createElement('input');selectedId.type='hidden';selectedId.name='head_id';selectedId.value=c?.head_id||'';catalog.append(selectedId);
 let state={type:c?.club_type||'Driver',oem:'',model:'',year:'',variant:''};
 const unique=(arr)=>[...new Set(arr)].filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b),undefined,{numeric:true}));
 function draw(){
  const base=headCatalog.filter(h=>h.type===state.type&&(check.checked||h.year>=2015));
  const oems=unique(base.map(h=>h.oem));if(!oems.includes(state.oem))state.oem='';
  const models=unique(base.filter(h=>h.oem===state.oem).map(h=>h.model));if(!models.includes(state.model))state.model='';
  const years=unique(base.filter(h=>h.oem===state.oem&&h.model===state.model).map(h=>h.year));if(!years.map(String).includes(String(state.year)))state.year='';
  const variants=unique(base.filter(h=>h.oem===state.oem&&h.model===state.model&&String(h.year)===String(state.year)).map(h=>h.variant));if(!variants.includes(state.variant))state.variant='';
  filters.replaceChildren();
  const make=(label,vals,key)=>{const f=selectField(label,vals,state[key],v=>{state[key]=v;draw();});filters.append(f.wrap);};
  make('OEM',oems,'oem');make('Model',models,'model');make('Release year',years,'year');make('Variant',variants,'variant');
  const match=base.find(h=>h.oem===state.oem&&h.model===state.model&&String(h.year)===String(state.year)&&h.variant===state.variant);
  if(match){selectedId.value=match.id;head.querySelector('input').value=[match.oem,match.model,match.variant!=='Standard'?match.variant:''].filter(Boolean).join(' ');}
 }
 type.querySelector('select').addEventListener('change',e=>{state={type:e.target.value,oem:'',model:'',year:'',variant:''};selectedId.value='';draw();});
 check.addEventListener('change',()=>{selectedId.value='';draw();});
 head.querySelector('input').addEventListener('input',()=>{selectedId.value='';});
 catalog.addEventListener('change',e=>{if(e.target.tagName==='SELECT')selectedId.value='';});
 if(c?.head_id){const match=headCatalog.find(h=>h.id===c.head_id);if(match){state={type:match.type,oem:match.oem,model:match.model,year:String(match.year),variant:match.variant};check.checked=match.year<2015;}}
 draw();
 editor(c?'Edit club':'Add club',[type,catalog,quantity,head,loft,shaft,grip,sort],async v=>{
  v.quantity=Number(v.quantity);v.sort_order=Number(v.sort_order);v.head_model=v.head_model.trim();v.head_id=v.head_id||null;
  if(!Number.isInteger(v.quantity)||v.quantity<1||v.quantity>99)throw Error('Quantity must be 1–99.');
  if(!Number.isInteger(v.sort_order))throw Error('Sort order must be an integer.');
  if(!v.head_model)throw Error('Head model is required.');
  const query=c?client.from('acim_clubs').update(v).eq('club_id',c.club_id):client.from('acim_clubs').insert({...v,associate_id:id});
  const {error}=await query;if(error)throw error;await loadClubs();status('Club saved.');
 });
}
async function toggleClub(c){if(!confirm(`${c.active_flag?'Deactivate':'Restore'} ${c.club_type} · ${c.head_model}?`))return;const {error}=await client.from('acim_clubs').update({active_flag:!c.active_flag}).eq('club_id',c.club_id);if(error)return status(error.message,true);await loadClubs();status('Club status updated.');}
function renderClubAdmin(){const root=$('clubAdmin');root.replaceChildren();const list=allClubs.filter(c=>$('includeInactiveClubs').checked||c.active_flag);if(!list.length){const p=document.createElement('p');p.className='muted';p.textContent='No clubs to manage for the selected associate.';root.append(p);return;}for(const c of list){const r=document.createElement('div');r.className='admin-item'+(c.active_flag?'':' inactive');const t=document.createElement('div');const strong=document.createElement('strong');strong.textContent=`${c.club_type} · ${c.head_model}${c.active_flag?'':' [inactive]'}`;const meta=document.createElement('div');meta.className='muted';meta.textContent=`Qty ${c.quantity} · ${[c.loft_set_makeup,c.shaft_model,c.grip].filter(Boolean).join(' · ')}`;t.append(strong,meta);const actions=document.createElement('div');actions.className='toolbar';const edit=document.createElement('button');edit.className='secondary';edit.textContent='Edit';edit.onclick=()=>editClub(c);const toggle=document.createElement('button');toggle.className='secondary';toggle.textContent=c.active_flag?'Deactivate':'Restore';toggle.onclick=()=>toggleClub(c);actions.append(edit,toggle);r.append(t,actions);root.append(r);}}
function wireManagement(){$('cancelEditor').onclick=()=>$('editor').close();$('newAssociate').onclick=()=>editAssociate(null);$('editAssociate').onclick=()=>{const a=allAssociates.find(x=>x.associate_id===$('associate').value);if(a)editAssociate(a);else status('Select an associate first.',true);};$('toggleAssociate').onclick=toggleAssociate;$('newClub').onclick=()=>editClub(null);$('includeInactive').onchange=()=>{associates=allAssociates.filter(a=>$('includeInactive').checked||a.active_flag);renderAssociates();};$('includeInactiveClubs').onchange=renderClubAdmin;}
