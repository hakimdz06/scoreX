async function loadSportsCatalog(){
 try{const r=await fetch('/api/sports'); const d=await r.json(); if(!d.sports?.length)return;
   const aliases={basketball:'Basket',football:'Football',tennis:'Tennis','ice-hockey':'Hockey','motorsport':'F1','american-football':'Am. football','table-tennis':'Table tennis'};
   const box=document.getElementById('sports');
   const icon={football:'⚽',tennis:'🎾',basketball:'🏀',motorsport:'🏎️',rugby:'🏉',mma:'🥊',boxing:'🥊','ice-hockey':'🏒',volleyball:'🏐',handball:'🤾',baseball:'⚾',golf:'⛳',cycling:'🚴',darts:'🎯',esports:'🎮',cricket:'🏏'};
   box.innerHTML=d.sports.map((s,i)=>`<button data-sport="${s.slug}" class="${i===0?'active':''}"><span class="ico">${icon[s.slug]||'🏅'}</span>${aliases[s.slug]||s.name||s.slug}</button>`).join('');
   box.querySelectorAll('button').forEach(b=>b.addEventListener('click',async()=>{box.querySelectorAll('button').forEach(x=>x.classList.remove('active'));b.classList.add('active');loadRealScores()}));
   loadRealScores();
 }catch(e){document.getElementById('dataSource').textContent='Mode démonstration';}
}
async function loadRealScores(){
 const selected=document.querySelector('#sports button.active')?.dataset?.sport||'football';
 try{const r=await fetch(`/api/live?sport=${encodeURIComponent(selected)}`); const data=await r.json();
   if(data.source==='demo'||!data.matches?.length){document.getElementById('dataSource').textContent='Mode démonstration · ajoutez SPORTSAPI_TOKEN'; return;}
   renderRealMatches(data.matches,selected); document.getElementById('dataSource').textContent=`Données live · sportsapi.app · ${selected}`;
 }catch(e){document.getElementById('dataSource').textContent='Flux live indisponible';}
}
function renderRealMatches(matches,sport){const c=document.getElementById('matches'); c.innerHTML=matches.map(m=>`<div class="league">${escapeHtml(m.league||sport)}</div><div class="match real-match"><div class="time red">${escapeHtml(m.time)}</div><div class="team">${escapeHtml(m.home)}</div><div class="score">${escapeHtml(String(m.homeScore))}</div><div class="team">${escapeHtml(m.away)}</div><div><b>${escapeHtml(String(m.awayScore))}</b><div class="live">LIVE</div></div></div>`).join('')}
function escapeHtml(value){return String(value).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
window.addEventListener('load',loadSportsCatalog);
