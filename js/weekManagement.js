const state = {
  year: new Date().getFullYear(),
  week: getISOWeek(new Date()),
}

function updateWeekLabel() {
  const weekLabel = document.getElementById('current-week-label');
  weekLabel.innerText = `Semana ${state.week}`;
  weekLabel.dataset.week = state.week;
  weekLabel.dataset.year = state.year;
}

function setWeek(week, year) {
  if (week < 1 || week > 53 || year < 1970) {
    throw new Error('Invalid week or year');
  }
  state.week = week;
  state.year = year;
  updateWeekLabel();

  const monday = getMondayOfISOWeek(week, year);

  const data = loadData();
  data.cards.forEach(card => {
    const cardDate = new Date(monday);
    cardDate.setDate(monday.getDate() + (card.day - 1));
    card.dateStr = formatDate(cardDate);
  })
  saveData(data);
  renderBoard();
}

function prevWeek() {
  if (state.week === 1) {
    state.week = 52;
    state.year -= 1;
  } else {
    state.week -= 1;
  }
  setWeek(state.week, state.year);
}

function nextWeek() {
  if (state.week === 52) {
    state.week = 1;
    state.year += 1;
  } else {
    state.week += 1;
  }
  setWeek(state.week, state.year);
}

// Inicialização
updateWeekLabel();