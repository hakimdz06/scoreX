const API_BASE = 'https://scorex-api.onrender.com';

let refreshTimer = null;
const REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutes

let currentMode = 'live';

/* =========================
   SPORTS
========================= */

async function loadSportsCatalog(){

  try{

    const r = await fetch(`${API_BASE}/api/sports`);
    const d = await r.json();

    const sports = Array.isArray(d)
      ? d
      : (d.sports || []);

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
        <button
          data-sport="${slug}"
          class="${i === 0 ? 'active' : ''}"
        >
          <span class="ico">
            ${icon[slug] || '🏅'}
          </span>
          ${name}
        </button>
      `;

    }).join('');

    box.querySelectorAll('button').forEach(button => {

      button.addEventListener('click', () => {

        box.querySelectorAll('button')
          .forEach(x => x.classList.remove('active'));

        button.classList.add('active');

        loadCurrentMode();

      });

    });

    setupTabs();

    loadCurrentMode();

    if(refreshTimer){
      clearInterval(refreshTimer);
    }

    refreshTimer = setInterval(() => {
      loadCurrentMode();
    }, REFRESH_INTERVAL);

  }catch(e){

    const source = document.getElementById('dataSource');

    if(source){
      source.textContent =
        'Serveur ScoreX indisponible';
    }

  }

}

/* =========================
   ONGLETS
========================= */

function setupTabs(){

  const buttons = document.querySelectorAll('button');

  buttons.forEach(button => {

    const text = button.textContent.trim().toLowerCase();

    if(
      text.includes('en direct') ||
      text.includes('à venir') ||
      text.includes('a venir') ||
      text.includes('résultats') ||
      text.includes('resultats')
    ){

      button.addEventListener('click', () => {

        if(
          text.includes('en direct')
        ){
          currentMode = 'live';
        }

        if(
          text.includes('à venir') ||
          text.includes('a venir')
        ){
          currentMode = 'upcoming';
        }

        if(
          text.includes('résultats') ||
          text.includes('resultats')
        ){
          currentMode = 'results';
        }

        buttons.forEach(b => {

          const t = b.textContent
            .trim()
            .toLowerCase();

          if(
            t.includes('en direct') ||
            t.includes('à venir') ||
            t.includes('a venir') ||
            t.includes('résultats') ||
            t.includes('resultats')
          ){
            b.classList.remove('active');
          }

        });

        button.classList.add('active');

        loadCurrentMode();

      });

    }

  });

}

/* =========================
   MODE ACTUEL
========================= */

function loadCurrentMode(){

  if(currentMode === 'upcoming'){
    return loadUpcoming();
  }

  if(currentMode === 'results'){
    return loadResults();
  }

  return loadRealScores();

}

/* =========================
   SPORT SÉLECTIONNÉ
========================= */

function getSelectedSport(){

  return document.querySelector(
    '#sports button.active'
  )?.dataset?.sport || 'football';

}

/* =========================
   LIVE
========================= */

async function loadRealScores(){

  const selected = getSelectedSport();

  const source =
    document.getElementById('dataSource');

  try{

    if(source){
      source.textContent =
        'Actualisation des scores…';
    }

    const r = await fetch(
      `${API_BASE}/api/live?sport=${encodeURIComponent(selected)}`
    );

    const data = await r.json();

    if(data.error){

      showError(
        'Erreur API-SPORTS'
      );

      return;
    }

    const matches = normalizeMatches(
      data.response || [],
      selected,
      'live'
    );

    if(!matches.length){

      showEmpty(
        'Aucun match en direct actuellement.'
      );

      if(source){
        source.textContent =
          `API-SPORTS · ${selected}`;
      }

      return;
    }

    renderMatches(
      matches,
      selected,
      'live'
    );

    if(source){
      source.textContent =
        `Données live · API-SPORTS · ${selected}`;
    }

  }catch(e){

    showError(
      'Impossible de charger les scores.'
    );

  }

}

/* =========================
   À VENIR
========================= */

async function loadUpcoming(){

  const selected = getSelectedSport();

  const source =
    document.getElementById('dataSource');

  try{

    if(source){
      source.textContent =
        'Chargement des matchs à venir…';
    }

    const date = getLocalDate();

    const r = await fetch(
      `${API_BASE}/api/upcoming?sport=${encodeURIComponent(selected)}&date=${date}`
    );

    const data = await r.json();

    if(data.error){

      showError(
        'Erreur API-SPORTS'
      );

      return;
    }

    let matches = normalizeMatches(
      data.response || [],
      selected,
      'upcoming'
    );

    matches = matches.filter(
      m => m.isUpcoming
    );

    if(!matches.length){

      showEmpty(
        'Aucun match à venir pour le moment.'
      );

      if(source){
        source.textContent =
          `API-SPORTS · ${selected}`;
      }

      return;
    }

    renderMatches(
      matches,
      selected,
      'upcoming'
    );

    if(source){
      source.textContent =
        `Matchs à venir · API-SPORTS · ${selected}`;
    }

  }catch(e){

    showError(
      'Impossible de charger les matchs à venir.'
    );

  }

}

/* =========================
   RÉSULTATS
========================= */

async function loadResults(){

  const selected = getSelectedSport();

  const source =
    document.getElementById('dataSource');

  try{

    if(source){
      source.textContent =
        'Chargement des résultats…';
    }

    const date = getLocalDate();

    const r = await fetch(
      `${API_BASE}/api/results?sport=${encodeURIComponent(selected)}&date=${date}`
    );

    const data = await r.json();

    if(data.error){

      showError(
        'Erreur API-SPORTS'
      );

      return;
    }

    let matches = normalizeMatches(
      data.response || [],
      selected,
      'results'
    );

    matches = matches.filter(
      m => m.isFinished
    );

    if(!matches.length){

      showEmpty(
        'Aucun résultat disponible aujourd’hui.'
      );

      if(source){
        source.textContent =
          `API-SPORTS · ${selected}`;
      }

      return;
    }

    renderMatches(
      matches,
      selected,
      'results'
    );

    if(source){
      source.textContent =
        `Résultats · API-SPORTS · ${selected}`;
    }

  }catch(e){

    showError(
      'Impossible de charger les résultats.'
    );

  }

}

/* =========================
   NORMALISATION
========================= */

function normalizeMatches(items, sport, mode){

  return items.map(item => {

    /* FOOTBALL */

    if(sport === 'football'){

      const fixture =
        item.fixture || {};

      const league =
        item.league || {};

      const teams =
        item.teams || {};

      const goals =
        item.goals || {};

      const status =
        fixture.status || {};

      const short =
        status.short || '';

      const finishedStatuses = [
        'FT',
        'AET',
        'PEN'
      ];

      const upcomingStatuses = [
        'TBD',
        'NS'
      ];

      return {

        league:
          league.name ||
          'Football',

        time:
          mode === 'upcoming'
            ? formatKickoff(fixture.date)
            : mode === 'results'
              ? 'Terminé'
              : formatStatus(status),

        home:
          teams.home?.name ||
          'Équipe domicile',

        away:
          teams.away?.name ||
          'Équipe extérieur',

        homeScore:
          goals.home ?? 0,

        awayScore:
          goals.away ?? 0,

        isFinished:
          finishedStatuses.includes(short),

        isUpcoming:
          upcomingStatuses.includes(short)

      };

    }

    /* BASKETBALL */

    if(sport === 'basketball'){

      const teams =
        item.teams || {};

      const scores =
        item.scores || {};

      const status =
        item.status || {};

      const short =
        status.short || '';

      const finished =
        ['FT','AOT','AET'].includes(short);

      return {

        league:
          item.league?.name ||
          'Basketball',

        time:
          mode === 'upcoming'
            ? formatKickoff(item.date)
            : mode === 'results'
              ? 'Terminé'
              : formatStatus(status),

        home:
          teams.home?.name ||
          'Équipe domicile',

        away:
          teams.away?.name ||
          'Équipe extérieur',

        homeScore:
          scores.home?.total ??
          scores.home ??
          0,

        awayScore:
          scores.away?.total ??
          scores.away ??
          0,

        isFinished:
          finished,

        isUpcoming:
          !finished &&
          (
            short === 'NS' ||
            short === 'TBD'
          )

      };

    }

    /* AUTRES SPORTS */

    const teams =
      item.teams || {};

    const status =
      item.status || {};

    const short =
      status.short || '';

    const finishedStatuses = [
      'FT',
      'AET',
      'FINAL',
      'FINISHED'
    ];

    return {

      league:
        item.league?.name ||
        item.league?.country ||
        sport,

      time:
        mode === 'upcoming'
          ? formatKickoff(item.date)
          : mode === 'results'
            ? 'Terminé'
            : formatStatus(status),

      home:
        teams.home?.name ||
        item.home?.name ||
        'Équipe 1',

      away:
        teams.away?.name ||
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
        0,

      isFinished:
        finishedStatuses.includes(short),

      isUpcoming:
        short === 'NS' ||
        short === 'TBD'

    };

  });

}

/* =========================
   AFFICHAGE
========================= */

function renderMatches(matches, sport, mode){

  const container =
    document.getElementById('matches');

  if(!container) return;

  container.innerHTML =
    matches.map(m => `

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

          <b>
            ${escapeHtml(String(m.awayScore))}
          </b>

          ${
            mode === 'live'
              ? '<div class="live">LIVE</div>'
              : ''
          }

        </div>

      </div>

    `).join('');

}

/* =========================
   UTILITAIRES
========================= */

function getLocalDate(){

  const now = new Date();

  const year =
    now.getFullYear();

  const month =
    String(now.getMonth() + 1)
      .padStart(2,'0');

  const day =
    String(now.getDate())
      .padStart(2,'0');

  return `${year}-${month}-${day}`;

}

function formatKickoff(date){

  if(!date) return 'À venir';

  const d = new Date(date);

  if(isNaN(d.getTime())){
    return 'À venir';
  }

  return d.toLocaleTimeString(
    'fr-FR',
    {
      hour: '2-digit',
      minute: '2-digit'
    }
  );

}

function formatStatus(status){

  if(!status){
    return 'LIVE';
  }

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

function showEmpty(message){

  const container =
    document.getElementById('matches');

  if(container){

    container.innerHTML =
      `<div class="empty">
        ${escapeHtml(message)}
      </div>`;

  }

}

function showError(message){

  const source =
    document.getElementById('dataSource');

  if(source){
    source.textContent =
      'Flux live indisponible';
  }

  showEmpty(message);

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

window.addEventListener(
  'load',
  loadSportsCatalog
);
