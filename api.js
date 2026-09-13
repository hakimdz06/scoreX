const API_BASE = 'https://scorex-api.onrender.com';

let refreshTimer = null;
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

async function loadSportsCatalog(){
  try{
    const r = await fetch(`${API_BASE}/api/sports`);
    const d = await r.json();

    const sports = Array.isArray(d) ? d : (d.sports || []);
    if(!sports.length) return;

    const aliases = {
      football: 'Football',
      basketball: 'Basket',
      baseball: 'Baseball',
      formula1: 'F1',
      handball: 'Handball',
      hockey: 'Hockey',
      rugby: 'Rugby',
      volleyball: 'Volleyball',
      americanFootball: 'Football US',
      mma: 'MMA'
    };

    const icon = {
      football: '⚽',
      basketball: '🏀',
      baseball: '⚾',
      formula1: '🏎️',
      handball: '🤾',
      hockey: '🏒',
      rugby: '🏉',
      volleyball: '🏐',
      americanFootball: '🏈',
      mma: '🥊'
    };

    const box = document.getElementById('sports');

    box.innerHTML = sports.map((s,i) => {
      const slug = s.slug || s.id;
      const name = aliases[slug] || s.name || slug;

      return `
        <button data-sport="${slug}" class="${i===0?'active':''}">
          <span class="ico">${icon[slug] || '🏅'}</span>${name}
        </button>
      `;
    }).join('');

    box.querySelectorAll('button').forEach(b =>
      b.addEventListener('click', () => {
        box.querySelectorAll('button')
          .forEach(x => x.classList.remove('active'));

        b.classList.add('active');
        loadRealScores();
      })
    );

    loadRealScores();

    // Actualisation automatique toutes les 15 minutes
    if(refreshTimer) clearInterval(refreshTimer);

    refreshTimer = setInterval(() => {
      loadRealScores();
    }, REFRESH_INTERVAL);

  }catch(e){
    document.getElementById('dataSource').textContent =
      'Serveur ScoreX indisponible';
  }
}

async function loadRealScores(){

  const selected =
    document.querySelector('#sports button.active')
      ?.dataset?.sport || 'football';

  const source = document.getElementById('dataSource');

  try{

    source.textContent = 'Actualisation des scores…';

    const r = await fetch(
      `${API_BASE}/api/live?sport=${encodeURIComponent(selected)}`
    );

    const data = await r.json();

    if(data.error){
      source.textContent = 'Erreur API-SPORTS';
      return;
    }

    const matches = normalizeMatches(data.response || [], selected);

    if(!matches.length){
      document.getElementById('matches').innerHTML =
        '<div class="empty">Aucun match en direct actuellement.</div>';

      source.textContent = `API-SPORTS · ${selected}`;
      return;
    }

    renderRealMatches(matches, selected);

    source.textContent =
      `Données live · API-SPORTS · ${selected}`;

  }catch(e){

    source.textContent = 'Flux live indisponible';

    document.getElementById('matches').innerHTML =
      '<div class="empty">Impossible de charger les scores.</div>';
  }
}

function normalizeMatches(items, sport){

  return items.map(item => {

    /* FOOTBALL */
    if(sport === 'football'){

      const fixture = item.fixture || {};
      const league = item.league || {};
      const teams = item.teams || {};
      const goals = item.goals || {};

      return {
        league: league.name || 'Football',
        time: formatStatus(fixture.status),
        home: teams.home?.name || 'Équipe domicile',
        away: teams.away?.name || 'Équipe extérieur',
        homeScore: goals.home ?? 0,
        awayScore: goals.away ?? 0
      };
    }

    /* BASKETBALL */
    if(sport === 'basketball'){

      const teams = item.teams || {};
      const scores = item.scores || {};

      return {
        league: item.league?.name || 'Basketball',
        time: formatStatus(item.status),
        home: teams.home?.name || 'Équipe domicile',
        away: teams.away?.name || 'Équipe extérieur',
        homeScore: scores.home?.total ?? scores.home ?? 0,
        awayScore: scores.away?.total ?? scores.away ?? 0
      };
    }

    /* AUTRES SPORTS */
    const teams = item.teams || {};

    return {
      league: item.league?.name || item.league?.country || sport,

      time: formatStatus(item.status),

      home:
        teams.home?.name ||
        item.teams?.home?.name ||
        item.home?.name ||
        'Équipe 1',

      away:
        teams.away?.name ||
        item.teams?.away?.name ||
        item.away?.name ||
        'Équipe 2',

      homeScore:
        item.goals?.home ??
        item.scores?.home?.total ??
        item.scores?.home ??
        0,

      awayScore:
        item.goals?.away ??
        item.scores?.away?.total ??
        item.scores?.away ??
        0
    };
  });
}

function formatStatus(status){

  if(!status) return 'LIVE';

  if(status.elapsed != null){
    return `${status.elapsed}'`;
  }

  if(status.short){
    return status.short;
  }

  if(status.long){
    return status.long;
  }

  return 'LIVE';
}

function renderRealMatches(matches, sport){

  const c = document.getElementById('matches');

  c.innerHTML = matches.map(m => `
    <div class="league">
      ${escapeHtml(m.league || sport)}
    </div>

    <div class="match real-match">

      <div class="time red">
        ${escapeHtml(m.time)}
      </div>

      <div class="team">
        ${escapeHtml(m.home)}
      </div>

      <div class="score">
        ${escapeHtml(String(m.homeScore))}
      </div>

      <div class="team">
        ${escapeHtml(m.away)}
      </div>

      <div>
        <b>${escapeHtml(String(m.awayScore))}</b>
        <div class="live">LIVE</div>
      </div>

    </div>
  `).join('');
}

function escapeHtml(value){

  return String(value).replace(
    /[&<>'"]/g,
    c => ({
      '&':'&amp;',
      '<':'&lt;',
      '>':'&gt;',
      "'":'&#39;',
      '"':'&quot;'
    }[c])
  );
}

window.addEventListener('load', loadSportsCatalog);
