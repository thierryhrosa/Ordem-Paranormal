// Simple sheet manager using localStorage
const DEFAULT_ATTRIBUTES = ["Força","Agilidade","Intelecto","Presença","Vigor"];
const DEFAULT_SKILLS = ["Atletismo","Luta","Pontaria","Furtividade","Investigação","Ocultismo","Percepção","Medicina","Diplomacia","Sobrevivência"];

let chars = [];
let currentId = null;

function qs(id){return document.getElementById(id)}

// UI elements
const charList = qs('charList');
const newBtn = qs('newBtn');
const saveBtn = qs('saveBtn');
const duplicateBtn = qs('duplicateBtn');
const deleteBtn = qs('deleteBtn');
const exportBtn = qs('exportBtn');
const exportAllBtn = qs('exportAllBtn');
const importBtn = qs('importBtn');
const importFile = qs('importFile');
const copyBtn = qs('copyBtn');
const search = qs('search');

const inputs = {
  name:qs('name'),
  age:qs('age'),
  class:qs('class'),
  level:qs('level'),
  bio:qs('bio'),
  vidaMax:qs('vidaMax'),
  vidaNow:qs('vidaNow'),
  sanMax:qs('sanMax'),
  sanNow:qs('sanNow'),
  initiative:qs('initiative'),
  defense:qs('defense'),
  meleeDmg:qs('meleeDmg'),
  rangedDmg:qs('rangedDmg'),
  conditions:qs('conditions'),
  inventory:qs('inventory'),
  abilities:qs('abilities'),
  rituals:qs('rituals')
};

function makeDefaultChar(name='Novo Agente'){
  const attributes = {};
  DEFAULT_ATTRIBUTES.forEach(a=>attributes[a]=2);
  const skills = {};
  DEFAULT_SKILLS.forEach(s=>skills[s]=0);
  return {
    id:Date.now().toString(36),
    name,
    age:'',
    class:'',
    level:1,
    bio:'',
    attributes,
    skills,
    combat:{vida_max:18,vida_atual:18,san_max:12,san_atual:12,initiative:0,defense:10,melee:'1d6',ranged:'1d6',conditions:''},
    inventory:'',
    abilities:'',
    rituals:'',
    created: new Date().toISOString()
  };
}

function loadStorage(){
  const raw = localStorage.getItem('ordocris_chars_v1');
  if(raw){
    try{chars = JSON.parse(raw)}catch(e){chars=[]}
  } else {
    // create example
    chars = [makeDefaultChar('Agente Zero')];
    saveStorage();
  }
}

function saveStorage(){
  localStorage.setItem('ordocris_chars_v1', JSON.stringify(chars));
  renderList();
}

function renderList(filter=''){
  charList.innerHTML='';
  const filtered = chars.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
  filtered.sort((a,b)=>a.name.localeCompare(b.name));
  filtered.forEach(c=>{
    const el = document.createElement('div');
    el.className = 'char-item' + (c.id===currentId ? ' active' : '');
    el.textContent = c.name + ' • ' + (c.class || '—');
    el.onclick = ()=>{openChar(c.id);}
    charList.appendChild(el);
  });
}

function openChar(id){
  const c = chars.find(x=>x.id===id);
  if(!c) return;
  currentId = id;
  // fill inputs
  inputs.name.value = c.name;
  inputs.age.value = c.age;
  inputs.class.value = c.class;
  inputs.level.value = c.level;
  inputs.bio.value = c.bio;
  inputs.vidaMax.value = c.combat.vida_max;
  inputs.vidaNow.value = c.combat.vida_atual;
  inputs.sanMax.value = c.combat.san_max;
  inputs.sanNow.value = c.combat.san_atual;
  inputs.initiative.value = c.combat.initiative;
  inputs.defense.value = c.combat.defense;
  inputs.meleeDmg.value = c.combat.melee;
  inputs.rangedDmg.value = c.combat.ranged;
  inputs.conditions.value = c.combat.conditions;
  inputs.inventory.value = c.inventory;
  inputs.abilities.value = c.abilities;
  inputs.rituals.value = c.rituals;

  // attributes UI
  const attrBox = qs('attributes'); attrBox.innerHTML='';
  for(const k of Object.keys(c.attributes)){
    const wrap = document.createElement('div'); wrap.className='attr';
    const label = document.createElement('label'); label.textContent = k;
    const inp = document.createElement('input'); inp.value = c.attributes[k]; inp.oninput = ()=>{c.attributes[k]=parseInt(inp.value||0); saveStorage();}
    wrap.appendChild(label); wrap.appendChild(inp);
    attrBox.appendChild(wrap);
  }

  // skills UI
  const skillsBox = qs('skills'); skillsBox.innerHTML='';
  for(const k of Object.keys(c.skills)){
    const div = document.createElement('div');
    const label = document.createElement('label'); label.textContent = k;
    const inp = document.createElement('input'); inp.value = c.skills[k]; inp.oninput = ()=>{c.skills[k]=parseInt(inp.value||0); saveStorage();}
    div.appendChild(label); div.appendChild(inp);
    skillsBox.appendChild(div);
  }

  renderList(search.value);
  showStatus();
}

function showStatus(){
  qs('vidaVal').textContent = `${inputs.vidaNow.value || 0}/${inputs.vidaMax.value || 0}`;
  qs('sanVal').textContent = `${inputs.sanNow.value || 0}/${inputs.sanMax.value || 0}`;
}

function writeBack(){
  if(!currentId) return;
  const c = chars.find(x=>x.id===currentId);
  if(!c) return;
  c.name = inputs.name.value;
  c.age = inputs.age.value;
  c.class = inputs.class.value;
  c.level = inputs.level.value;
  c.bio = inputs.bio.value;
  c.inventory = inputs.inventory.value;
  c.abilities = inputs.abilities.value;
  c.rituals = inputs.rituals.value;
  c.combat.vida_max = parseInt(inputs.vidaMax.value||0);
  c.combat.vida_atual = parseInt(inputs.vidaNow.value||0);
  c.combat.san_max = parseInt(inputs.sanMax.value||0);
  c.combat.san_atual = parseInt(inputs.sanNow.value||0);
  c.combat.initiative = inputs.initiative.value;
  c.combat.defense = inputs.defense.value;
  c.combat.melee = inputs.meleeDmg.value;
  c.combat.ranged = inputs.rangedDmg.value;
  c.combat.conditions = inputs.conditions.value;
  saveStorage();
  showStatus();
}

newBtn.onclick = ()=>{
  const c = makeDefaultChar('Agente ' + (chars.length+1));
  chars.push(c);
  saveStorage();
  openChar(c.id);
}

saveBtn.onclick = ()=>{
  writeBack();
  alert('Ficha salva localmente.');
}

duplicateBtn.onclick = ()=>{
  if(!currentId) return alert('Abra uma ficha primeiro.');
  const original = chars.find(x=>x.id===currentId);
  const copy = JSON.parse(JSON.stringify(original));
  copy.id = Date.now().toString(36);
  copy.name = original.name + ' (cópia)';
  chars.push(copy);
  saveStorage();
  openChar(copy.id);
}

deleteBtn.onclick = ()=>{
  if(!currentId) return alert('Abra uma ficha primeiro.');
  if(!confirm('Excluir esta ficha?')) return;
  chars = chars.filter(x=>x.id!==currentId);
  currentId = null;
  saveStorage();
  // clear inputs
  document.querySelectorAll('input, textarea').forEach(el=>{ if(el.id!=='search') el.value=''});
  document.getElementById('attributes').innerHTML='';
  document.getElementById('skills').innerHTML='';
}

exportBtn.onclick = ()=>{
  if(!currentId) return alert('Abra uma ficha primeiro.');
  const c = chars.find(x=>x.id===currentId);
  const blob = new Blob([JSON.stringify(c, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = (c.name||'ficha') + '.json'; a.click();
  URL.revokeObjectURL(url);
}

exportAllBtn.onclick = ()=>{
  const blob = new Blob([JSON.stringify(chars, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href=url; a.download = 'ordocris_fichas.json'; a.click();
  URL.revokeObjectURL(url);
}

copyBtn.onclick = ()=>{
  if(!currentId) return alert('Abra uma ficha primeiro.');
  const c = chars.find(x=>x.id===currentId);
  navigator.clipboard.writeText(JSON.stringify(c, null, 2)).then(()=>alert('JSON copiado para a área de transferência.'));
}

importBtn.onclick = ()=> importFile.click();
importFile.onchange = (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=> {
    try{
      const data = JSON.parse(reader.result);
      if(Array.isArray(data)){
        // replace or merge? we append
        chars = chars.concat(data.map(d=>{ d.id = d.id || Date.now().toString(36)+Math.random().toString(36).slice(2); return d;}));
      } else {
        data.id = data.id || Date.now().toString(36);
        chars.push(data);
      }
      saveStorage();
      alert('Importado com sucesso.');
    }catch(err){
      alert('Arquivo inválido: ' + err);
    }
  };
  reader.readAsText(f);
  e.target.value = '';
}

search.oninput = ()=> renderList(search.value);

// auto write on field changes for convenience
document.querySelectorAll('input, textarea').forEach(el=>{
  if(el.id === 'search') return;
  el.addEventListener('change', writeBack);
  el.addEventListener('input', showStatus);
});

// init
loadStorage();
renderList();
if(chars.length) openChar(chars[0].id);
// Preenche as listas de atributos e perícias na área de rolagem
function atualizarRollSelects() {
    const attrContainer = document.getElementById("attributes");
    const skillContainer = document.getElementById("skills");

    const selA = document.getElementById("rollAtributo");
    const selP = document.getElementById("rollPericia");

    selA.innerHTML = "";
    selP.innerHTML = "";

    // Atributos (inputs)
    [...attrContainer.querySelectorAll("input")].forEach(inp => {
        const nome = inp.getAttribute("data-name");
        selA.innerHTML += `<option value="${inp.value}">${nome} (+${inp.value})</option>`;
    });

    // Perícias (inputs)
    [...skillContainer.querySelectorAll("input")].forEach(inp => {
        const nome = inp.getAttribute("data-name");
        selP.innerHTML += `<option value="${inp.value}">${nome} (+${inp.value})</option>`;
    });
}

// Chamar sempre que carregar ficha
setTimeout(atualizarRollSelects, 300);


// FUNÇÃO DE ROLAGEM
function rolarTeste() {
    const atr = parseInt(document.getElementById("rollAtributo").value);
    const per = parseInt(document.getElementById("rollPericia").value);

    const d20 = Math.floor(Math.random() * 20) + 1;
    const total = d20 + atr + per;

    let msg = `
        <p>🎲 <b>D20:</b> ${d20}</p>
        <p>📌 <b>Atributo:</b> +${atr}</p>
        <p>📌 <b>Perícia:</b> +${per}</p>
        <p>⭐ <b>Total:</b> ${total}</p>
    `;

    if (d20 === 20) msg += `<p style="color:lime"><b>🔥 SUCESSO EXTREMO!</b></p>`;
    else if (d20 === 1) msg += `<p style="color:red"><b>💀 FALHA CRÍTICA!</b></p>`;
    else if (total >= 20) msg += `<p style="color:lime">✨ Sucesso Extraordinário</p>`;
    else if (total >= 15) msg += `<p style="color:cyan">✔ Sucesso</p>`;
    else if (total >= 10) msg += `<p style="color:orange">⚠ Sucesso Parcial</p>`;
    else msg += `<p style="color:red">❌ Falha</p>`;

    document.getElementById("rollResultado").innerHTML = msg;
}
