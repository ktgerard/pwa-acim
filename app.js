'use strict';
const $ = id => document.getElementById(id);
const order = ['Driver','Fairway','Hybrid','Iron','Wedge','Putter'];
let client, associates = [], clubs = [], selected = new Set(), requestId = 0;
const show = (id, visible) => { $(id).hidden = !visible; };
const status = (message, error = false) => { $('message').textContent = message; $('message').className = 'notice' + (error ? ' error' : ''); };
const fmt = a => `${a.last_name}, ${a.first_name}${a.employee_number ? ` (${a.employee_number})` : ''}`;
const sortClubs = (a,b) => order.indexOf(a.club_type)-order.indexOf(b.club_type) || a.sort_order-b.sort_order || a.head_model.localeCompare(b.head_model);
function renderAssociates() {
 const term = $('search').value.trim().toLocaleLowerCase(); const previous = $('associate').value;
 const matching = associates.filter(a => `${a.last_name}, ${a.first_name} ${a.first_name} ${a.last_name} ${a.employee_number || ''}`.toLocaleLowerCase().includes(term));
 $('associate').replaceChildren(new Option('Choose an associate',''), ...matching.map(a => new Option(fmt(a),a.associate_id)));
 if (matching.some(a => a.associate_id === previous)) $('associate').value = previous;
 else { $('associate').value = ''; clearClubs(); }
}
function clearClubs() { clubs=[]; selected.clear(); $('employeeMeta').textContent=''; $('clubs').replaceChildren(); const p=document.createElement('p');p.className='muted';p.textContent='Select an associate to view saved clubs.';$('clubs').append(p); count(); }
function count(){ $('selectionCount').textContent = `${selected.size} selected`; }
function renderClubs(){ const root=$('clubs');root.replaceChildren();if(!clubs.length){const p=document.createElement('p');p.className='muted';p.textContent='No active clubs are stored for this associate.';root.append(p);count();return;}
 for(const c of clubs){const label=document.createElement('label');label.className='club';const checkbox=document.createElement('input');checkbox.type='checkbox';checkbox.checked=selected.has(c.club_id);checkbox.addEventListener('change',()=>{if(checkbox.checked)selected.add(c.club_id);else selected.delete(c.club_id);count();});const info=document.createElement('span');const title=document.createElement('strong');title.textContent=`${c.club_type} · ${c.head_model}`;const details=document.createElement('small');details.textContent=[`Qty ${c.quantity}`,c.loft_set_makeup,c.shaft_model,c.grip].filter(Boolean).join(' · ');info.append(title,details);label.append(checkbox,info);root.append(label);}count(); }
async function loadAssociates(){status('Loading associates…');const {data,error}=await client.from('acim_associates').select('associate_id,first_name,last_name,employee_number').eq('active_flag',true).order('last_name').order('first_name');if(error){status(`Unable to load associates: ${error.message}`,true);return;}associates=data||[];renderAssociates();status(`${associates.length} active associates available.`);}
async function loadClubs(){const id=$('associate').value;const token=++requestId;clearClubs();if(!id)return;const a=associates.find(a=>a.associate_id===id);$('employeeMeta').textContent=a?fmt(a):'';status('Loading inventory…');const {data,error}=await client.from('acim_clubs').select('club_id,club_type,quantity,head_model,loft_set_makeup,shaft_model,grip,sort_order').eq('associate_id',id).eq('active_flag',true);if(token!==requestId)return;if(error){status(`Unable to load inventory: ${error.message}`,true);return;}clubs=(data||[]).sort(sortClubs);renderClubs();status(`${clubs.length} inventory records loaded.`);}
async function sessionView(){const {data:{session},error}=await client.auth.getSession();if(error)status(error.message,true);const signed=!!session;show('loginPanel',!signed);show('inventoryPanel',signed);$('accountLabel').textContent=signed?session.user.email||'Service desk':'';if(signed)await loadAssociates();else{associates=[];clearClubs();status('Sign in to view the shared inventory.');}}
async function start(){const cfg=window.ACIM_CONFIG||{};if(!cfg.supabaseUrl?.startsWith('https://')||cfg.supabaseUrl.includes('YOUR_PROJECT')||!cfg.supabasePublishableKey||cfg.supabasePublishableKey.includes('YOUR_PUBLISHABLE')){status('Configuration required: edit config.js with the Supabase project URL and publishable key.',true);return;}if(!window.supabase){status('Supabase library did not load. Check network connectivity.',true);return;}client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabasePublishableKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
 $('loginForm').addEventListener('submit',async e=>{e.preventDefault();status('Signing in…');const {error}=await client.auth.signInWithPassword({email:$('email').value.trim(),password:$('password').value});if(error){status(`Sign-in failed: ${error.message}`,true);return;}$('password').value='';await sessionView();});
 $('signOut').addEventListener('click',async()=>{const {error}=await client.auth.signOut();if(error)status(error.message,true);else await sessionView();});$('search').addEventListener('input',renderAssociates);$('associate').addEventListener('change',loadClubs);$('selectAll').addEventListener('click',()=>{selected=new Set(clubs.map(c=>c.club_id));renderClubs();});$('clearAll').addEventListener('click',()=>{selected.clear();renderClubs();});
 await sessionView();if('serviceWorker' in navigator)navigator.serviceWorker.register('./service-worker.js').catch(()=>{});
}
start().catch(e=>status(`Startup failed: ${e.message}`,true));
