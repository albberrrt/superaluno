const milisecondsInWeek = 604800000; // 7 * 24 * 60 * 60 * 1000
const state = {
  year: new Date().getFullYear(),
  week: getISOWeek(new Date()),
}

function getISOWeek(date) {
  const temp = new Date(date.valueOf());
  // Set to nearest Thursday: current date + 3 - (current day + 6) % 7
  const dayNumber = (date.getDay() + 6) % 7;
  temp.setDate(temp.getDate() - dayNumber + 3);
  const firstThursday = temp.valueOf();

  temp.setMonth(0, 1);

  if (temp.getDay() !== 4) {
    temp.setMonth(0, 1 + ((4 - temp.getDay() + 7) % 7));
  }

  const ISOweek = 1 + Math.ceil((firstThursday - temp) / milisecondsInWeek);
  return ISOweek;
}

function getMondayOfISOWeek(week, year) {
  // Validate week and year
  const simple = new Date(year, 0, 1 + (week - 1) * 7);
  // Adjust to the first Monday of the week
  const dayOfWeek = simple.getDay();
  const ISOweekStart = simple;
  // If the first day of the week is not Monday, adjust to the previous or next Monday
  if (dayOfWeek <= 4) {
    ISOweekStart.setDate(simple.getDate() - dayOfWeek + 1);
  } else {
    ISOweekStart.setDate(simple.getDate() + 8 - dayOfWeek);
  }
  return ISOweekStart;
}

function updateWeekLabel() {
  document.getElementById('current-week-label').innerText = `Semana ${state.week} de ${state.year}`;
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
    cardDate.setDate(monday.getDate() + (card.date - 1));
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
  console.log(`Semana atual: ${state.week}, Ano: ${state.year}`);
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