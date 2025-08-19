/* Estrutura em localStorage:
    
*/

const uid = (n = 6) => Math.random().toString(36).slice(2, 2 + n);
const STORAGE_KEY = 'school_weekly_v1';
const THEME_KEY = 'school_theme_v1';
const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

const deleteIcon = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3" viewBox="0 0 16 16">
    <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
  </svg>`;
const exportIcon =
  `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-file-earmark-arrow-down" viewBox="0 0 16 16">
    <path d="M8.5 6.5a.5.5 0 0 0-1 0v3.793L6.354 9.146a.5.5 0 1 0-.708.708l2 2a.5.5 0 0 0 .708 0l2-2a.5.5 0 0 0-.708-.708L8.5 10.293z"/>
    <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2M9.5 3A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z"/>
  </svg>`;
const addIcon =
  `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
  </svg>`;

// ✨ Main Functions
function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { students: [], cards: [] }
  } catch (e) {
    return { students: [], cards: [] }
  }
}
function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function formatDate(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`
}

function getMondayOfThisWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = (day === 0 ? -6 : 1 - day);
  const mon = new Date(now);
  mon.setDate(now.getDate() + diff);
  mon.setHours(0, 0, 0, 0);
  return mon;
}
function getDateForCurrentWeek(weekDay) {
  const mon = getMondayOfThisWeek();
  const date = new Date(mon);
  date.setDate(mon.getDate() + (weekDay - 1));
  return formatDate(date);
}

// initialize columns
const board = document.getElementById('board');
function makeColumns() {
  board.innerHTML = '';
  for (let i = 1; i <= 6; i++) {
    const col = document.createElement('div');
    col.className = 'column';
    col.dataset.day = i;
    const header = document.createElement('div');
    header.className = 'col-header';
    const title = document.createElement('div');
    title.className = 'title';
    title.textContent = days[i - 1];
    const subtitle = document.createElement('div');
    subtitle.className = 'date small';
    subtitle.id = 'colDate_' + i;
    subtitle.textContent = getDateForCurrentWeek(i);
    header.appendChild(title);
    header.appendChild(subtitle);
    const cardsWrap = document.createElement('div');
    cardsWrap.className = 'cards';
    cardsWrap.dataset.day = i;
    col.appendChild(header);
    col.appendChild(cardsWrap);

    // drag/drop
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over') });
    col.addEventListener('dragleave', e => { col.classList.remove('over') });
    col.addEventListener('drop', e => { e.preventDefault(); col.classList.remove('over'); const cardId = e.dataTransfer.getData('text/card'); if (cardId) moveCardToDay(cardId, Number(col.dataset.day)) });
    board.appendChild(col);
  }
}

// render students list
function renderStudents() {
  const data = loadData();
  const list = document.getElementById('studentsList');
  list.innerHTML = '';
  data.students.forEach(student => {
    const { id, name, days } = student;
    const p = document.createElement('div');
    p.className = 'student-pill';
    p.innerHTML = `<div style="min-width:0"><strong>${name}</strong><div class="small">${days.map(day => days[day - 1]).join(', ')}</div></div><div style='display:flex;gap:6px;align-items:center'><button class='ghost small' data-id='${id}' onclick='createCardsForStudent("${id}")'>${addIcon}</button><button class='ghost small' data-id='${id}' onclick='exportStudent("${id}")'>${exportIcon}</button><button class='ghost small' data-id='${id}' onclick='deleteStudent("${id}")'>${deleteIcon}</button></div>`;
    list.appendChild(p);
  });
}

// create card object (data.dateStr: default para a data desta semana)
function createCard(studentId, day, dateStr = null, provisional = false) {
  const data = loadData();
  const card = {
    id: uid(8),
    studentId,
    day,
    dateStr: dateStr || getDateForCurrentWeek(day),
    states: { good: false, material: false, level: false, project: false, activity: false },
    provisional: !!provisional,
    absent: false
  };
  data.cards.push(card);
  saveData(data);
  renderBoard();
  return card;
}

// create cards for a student for their scheduled days (replaces existing regular cards for that student)
function createCardsForStudent(studentId) {
  const data = loadData();
  const student = data.students.find(student => student.id === studentId);
  if (!student) return;
  data.cards = data.cards.filter(card => !(card.studentId === studentId && !card.provisional));
  student.days.forEach(d => {
    data.cards.push({
      id: uid(8),
      studentId,
      day: d,
      dateStr: getDateForCurrentWeek(d),
      states: { good: false, material: false, level: false, project: false, activity: false },
      provisional: false,
      absent: false
    });
  });
  saveData(data);
  renderBoard();
  renderStudents();
}

function deleteStudent(id) { if (!confirm('Remover aluno e seus cards?')) return; const data = loadData(); data.students = data.students.filter(s => s.id !== id); data.cards = data.cards.filter(c => c.studentId !== id); saveData(data); renderStudents(); renderBoard(); }

// render board with cards
function renderBoard() {
  const data = loadData();
  makeColumns();
  data.cards.forEach(card => {
    const wrap = board.querySelector('.cards[data-day="' + card.day + '"]');
    if (!wrap) return;
    const tpl = document.getElementById('cardTemplate');
    const el = tpl.content.firstElementChild.cloneNode(true);
    el.dataset.id = card.id; el.classList.add('fade-in');
    el.querySelector('.studentName').textContent = (data.students.find(s => s.id === card.studentId) || {
      name: '(Aluno?)'
    }).name;
    el.querySelector('.cardDate').textContent = card.dateStr;
    if (card.absent) el.querySelector('.markAbsent').textContent = 'Ausente ✓';
    if (card.provisional) {
      const b = document.createElement('span');
      b.textContent = ' Provisório';
      b.className = 'small';
      b.style.opacity = 0.8;
      el.querySelector('.studentName').appendChild(b);
    }

    // checkbox wiring
    const map = [['chk-good', 'good'], ['chk-material', 'material'], ['chk-level', 'level'], ['chk-project', 'project'], ['chk-activity', 'activity']];
    map.forEach(([cls, prop], idx) => {
      const cb = el.querySelector('.' + cls); const cbNo = el.querySelector('.chk-no-' + (prop)); cb.checked = !!card.states[prop]; cbNo && (cbNo.checked = false);
      function update() { if (cb.checked) { card.states[prop] = true; cbNo && (cbNo.checked = false); } else { card.states[prop] = false; } updatePointsDisplay(el, card); saveData(data); }
      cb.addEventListener('change', update); if (cbNo) cbNo.addEventListener('change', () => { if (cbNo.checked) { cb.checked = false; card.states[prop] = false; } update(); });
    });
    updatePointsDisplay(el, card);

    // absent toggle
    el.querySelector('.markAbsent').addEventListener('click', () => { card.absent = !card.absent; el.querySelector('.markAbsent').textContent = card.absent ? 'Ausente ✓' : 'Ausente'; saveData(data); updatePointsDisplay(el, card); });

    // delete
    el.querySelector('.delCard').addEventListener('click', () => { if (confirm('Remover card?')) { const d = loadData(); d.cards = d.cards.filter(c => c.id !== card.id); saveData(d); renderBoard(); } });

    // drag
    el.addEventListener('dragstart', e => { e.dataTransfer.setData('text/card', card.id); el.classList.add('dragging'); });
    el.addEventListener('dragend', e => { el.classList.remove('dragging'); });

    wrap.appendChild(el);
  });
}

function updatePointsDisplay(el, card) { const ptsEls = el.querySelectorAll('.points'); const keys = ['good', 'material', 'level', 'project', 'activity']; let total = 0; keys.forEach((k, i) => { const p = card.states[k] ? 3 : 0; ptsEls[i].textContent = card.absent ? '-' : (p > 0 ? String(p) : '-'); total += (card.absent ? 0 : p); }); el.querySelector('.totalPoints').textContent = card.absent ? '0' : String(total); }

// move card to day
function moveCardToDay(cardId, day) { const data = loadData(); const c = data.cards.find(x => x.id === cardId); if (!c) return; c.day = day; c.provisional = c.provisional || true; c.dateStr = getDateForCurrentWeek(day); saveData(data); renderBoard(); }

function showAddModal() { const name = prompt('Nome do aluno'); if (!name) return; const daysStr = prompt('Dias (1=Segunda ... 6=Sábado). Separe por vírgula para múltiplos. Ex: 1,3'); if (!daysStr) return; const daysArr = daysStr.split(',').map(s => Number(s.trim())).filter(n => n >= 1 && n <= 6); if (daysArr.length === 0) return alert('Nenhum dia válido fornecido'); const data = loadData(); const id = uid(8); data.students.push({ id, name, days: daysArr }); daysArr.forEach(d => data.cards.push({ id: uid(8), studentId: id, day: d, dateStr: getDateForCurrentWeek(d), states: { good: false, material: false, level: false, project: false, activity: false }, provisional: false, absent: false })); saveData(data); renderStudents(); renderBoard(); }

// create card via student list button
window.createCardsForStudent = createCardsForStudent;
window.deleteStudent = deleteStudent;

function getCardTotal(card) {
  const keys = ['good', 'material', 'level', 'project', 'activity'];
  let total = 0;
  keys.forEach(key => { total += card.absent ? 0 : (card.states?.[key] ? 3 : 0); });
  return total;
}

// reset week: remove provisional cards, reset states and set dates to this week's dates
document.getElementById('resetWeekBtn').addEventListener('click', () => {
  if (!confirm('Resetar semana: limpar pontos, mover datas para a semana atual e remover cards provisórios?')) return;
  const data = loadData();
  data.cards = data.cards.filter(card => !card.provisional);
  data.cards.forEach(card => {
    card.states = {
      good: false,
      material: false,
      level: false,
      project: false,
      activity: false
    };
    card.absent = false;
    card.dateStr = getDateForCurrentWeek(card.day);
  });
  saveData(data);
  renderBoard();
});

// save button (local)
// adicionando botao de salvar no header não necessário, mas mantido para compatibilidade

// persistir tema
document.getElementById('themeToggle').addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark');
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
});

// Pesquisa & filtro
document.getElementById('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const data = loadData();
  const list = document.getElementById('studentsList');
  list.innerHTML = '';
  data.students.filter(s => s.name.toLowerCase().includes(q)).forEach(s => {
    const p = document.createElement('div');
    p.className = 'student-pill';
    p.innerHTML = `<div style="min-width:0"><strong>${s.name}</strong><div class="small">${s.days.map(d => days[d - 1]).join(', ')}</div></div><div style='display:flex;gap:6px;align-items:center'><button class='ghost small' data-id='${s.id}' onclick='createCardsForStudent("${s.id}")'>${addIcon}</button><button class='ghost small' data-id='${s.id}' onclick='exportStudent("${s.id}")'>${exportIcon}</button><button class='ghost small' data-id='${s.id}' onclick='deleteStudent("${s.id}")'>${deleteIcon}</button></div>`;
    list.appendChild(p);
  });
});

// add adhoc card
document.getElementById('addStudentBtn').addEventListener('click', () => { showAddModal(); });

// Modal logic
const studentModal = document.getElementById('studentModal');
const modalStudentName = document.getElementById('modalStudentName');
const modalDays = document.getElementById('modalDays');
const modalError = document.getElementById('modalError');
const modalCreateBtn = document.getElementById('modalCreateBtn');
const modalCancelBtn = document.getElementById('modalCancelBtn');

function showAddModal() {
  modalStudentName.value = '';
  modalError.textContent = '';
  modalDays.querySelectorAll('input[type=checkbox]').forEach(cb => cb.checked = false);
  studentModal.classList.add('active');
  modalStudentName.focus();
}

function hideAddModal() {
  studentModal.classList.remove('active');
}

modalCancelBtn.onclick = hideAddModal;

modalCreateBtn.onclick = function () {
  const name = sanitize(modalStudentName.value.trim());
  if (!name) {
    modalError.textContent = 'Nome obrigatório.';
    modalStudentName.focus();
    return;
  }
  const daysArr = Array.from(modalDays.querySelectorAll('input[type=checkbox]:checked')).map(cb => Number(cb.value));
  if (daysArr.length === 0) {
    modalError.textContent = 'Selecione pelo menos um dia.';
    return;
  }
  const data = loadData();
  if (data.students.some(s => s.name.toLowerCase() === name.toLowerCase())) {
    modalError.textContent = 'Já existe um aluno com esse nome.';
    return;
  }
  const id = uid(8);
  data.students.push({ id, name, days: daysArr });
  daysArr.forEach(d => data.cards.push({
    id: uid(8),
    studentId: id,
    day: d,
    dateStr: getDateForCurrentWeek(d),
    states: {
      wasGood: false,
      bringMaterial: false,
      completedLevel: false,
      didExtraProjects: false,
      didExtraActivities: false
    },
    provisional: false,
    absent: false
  }));
  saveData(data);
  renderStudents();
  renderBoard();
  hideAddModal();
};

// Close modal on ESC
document.addEventListener('keydown', function (e) {
  if (studentModal.classList.contains('active') && e.key === 'Escape') hideAddModal();
});

// Prevent modal click propagation
studentModal.addEventListener('click', function (e) {
  if (e.target === studentModal) hideAddModal();
});

// Replace prompt-based add student with modal
document.getElementById('addStudentBtn').onclick = showAddModal;

// Sanitize text for display (basic XSS prevention)
function sanitize(str) {
  return String(str).replace(/[<>&"']/g, function (c) {
    return ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;'
    })[c];
  });
}

// Use sanitize in renderStudents
function renderStudents() {
  const data = loadData();
  const list = document.getElementById('studentsList');
  list.innerHTML = '';
  data.students.forEach(s => {
    const p = document.createElement('div');
    p.className = 'student-pill';
    p.innerHTML =
      `<div style="min-width:0"><strong>${sanitize(s.name)}</strong><div class="small">${s.days.map(d => days[d - 1]).join(', ')}</div></div>
      <div style='display:flex;gap:6px;align-items:center'>
        <button class='ghost small' data-id='${s.id}' onclick='createCardsForStudent("${s.id}")'>${addIcon}</button>
        <button class='ghost small' data-id='${s.id}' onclick='exportStudent("${s.id}")'>${exportIcon}</button>
        <button class='ghost small' data-id='${s.id}' onclick='deleteStudent("${s.id}")'>${deleteIcon}</button>
      </div>`;
    list.appendChild(p);
  });
}

// Use sanitize in search
document.getElementById('searchInput').addEventListener('input', (e) => {
  const q = e.target.value.toLowerCase();
  const data = loadData();
  const list = document.getElementById('studentsList');
  list.innerHTML = '';
  data.students.filter(s => s.name.toLowerCase().includes(q)).forEach(s => {
    const p = document.createElement('div');
    p.className = 'student-pill';
    p.innerHTML =
      `<div style="min-width:0"><strong>${sanitize(s.name)}</strong><div class="small">${s.days.map(d => days[d - 1]).join(', ')}</div></div>
      <div style='display:flex;gap:6px;align-items:center'>
        <button class='ghost small' data-id='${s.id}' onclick='createCardsForStudent("${s.id}")'>
          ${addIcon}
        </button>
        <button class='ghost small' data-id='${s.id}' onclick='exportStudent("${s.id}")'>
          ${exportIcon}
        </button>
        <button class='ghost small' data-id='${s.id}' onclick='deleteStudent("${s.id}")'>
          ${deleteIcon}
        </button>
      </div>`;
    list.appendChild(p);
  });
});

document.getElementById('filterDay').addEventListener('change', (e) => {
  const v = e.target.value;
  const cols = document.querySelectorAll('.column');
  cols.forEach(c => {
    if (v === 'all') c.style.display = 'block';
    else if (c.dataset.day === v) c.style.display = 'block';
    else c.style.display = 'none';
  });
});

// seed inicial (apenas se não existir nada salvo)

(function seed() {
  const d = loadData(); if (d.students.length === 0) {
    d.students = [
      { id: 's1', name: 'Tio Igor', days: [1] },
      { id: 's2', name: 'John Doe', days: [1, 2] }
    ];
    d.cards = [];
    d.students.forEach(s => s.days.forEach(day => d.cards.push({
      id: uid(8),
      studentId: s.id,
      day,
      dateStr: getDateForCurrentWeek(day),
      states: {
        good: false,
        material: false,
        level: false,
        project: false,
        activity: false
      },
      provisional: false,
      absent: false
    }))
    );
    saveData(d);
  }

  // aplicar tema salvo
  const theme = localStorage.getItem(THEME_KEY) || 'light';
  if (theme === 'dark') document.body.classList.add('dark');
  renderStudents();
  renderBoard();
})();

//dropdown
const toggleBtn = document.getElementById('dropdownToggle');
const menu = document.getElementById('dropdownMenu');

toggleBtn.addEventListener('click', () => {
  menu.classList.toggle('active');
});
document.querySelector("html").addEventListener('click', (e) => {
  if (e.target !== toggleBtn) {
    menu.classList.remove('active');
    document.getElementById('dropdown-content').classList.add('fadeout')
  }
})
