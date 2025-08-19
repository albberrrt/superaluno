const uid = (n = 6) => Math.random().toString(36).slice(2, 2 + n);
const STORAGE_KEY = 'school_weekly_v1';
const THEME_KEY = 'school_theme_v1';
const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

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

const timestamp = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = String(now.getFullYear()).slice(-2);
  return `${day}-${month}-${year}`;
}

function exportData() {
  const data = loadData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `superaluno_${timestamp()}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importData(file) {
  const reader = new FileReader();

  reader.onload = function (event) {
    try {
      const data = JSON.parse(event.target.result);
      if (data && data.students && data.cards) {
        saveData(data);
        alert('Dados importados com sucesso!');
        location.reload();
      } else {
        alert('Formato de dados inválido.');
      }
    } catch (e) {
      alert('Erro ao importar dados: ' + e.message);
    }
  };
  reader.readAsText(file);
}