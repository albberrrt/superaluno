// Weekly PDF Export Script
document.getElementById('exportWeekBtn').addEventListener('click', () => {
  const data = loadData();

  const wrapper = document.createElement('div');
  wrapper.style.padding = '14px';
  wrapper.style.fontFamily = 'Arial, Helvetica, sans-serif';
  wrapper.style.color = '#111';
  const title = document.createElement('h2');
  title.textContent = 'Relatório semanal';
  title.style.textAlign = 'center';
  wrapper.appendChild(title);

  // para cada dia (somente dias com cards não ausentes)
  for (let i = 1; i <= 6; i++) {
    const dayCards = data.cards.filter(c => c.day === i && !c.absent);
    if (dayCards.length === 0) continue;
    const daySection = document.createElement('div');
    const dayTitle = document.createElement('h3');
    dayTitle.textContent = `${days[i - 1]} — ${getDateForCurrentWeek(i)}`;
    dayTitle.style.margin = '8px 0';
    daySection.appendChild(dayTitle);

    dayCards.forEach(c => {
      const s = data.students.find(x => x.id === c.studentId) || { name: '(Aluno)' };
      const card = document.createElement('div');
      card.style.border = '1px solid #ddd';
      card.style.borderRadius = '8px';
      card.style.padding = '10px';
      card.style.marginBottom = '10px';
      card.style.width = '100%';
      const nameEl = document.createElement('div');
      nameEl.innerHTML = `<strong>${s.name}</strong> <div style='font-size:12px;color:#666;margin-top:6px'>${c.dateStr}</div>`;
      card.appendChild(nameEl);

      // linhas com labels e pontos em colunas horizontais
      const labels = ['Bom comportamento', 'Trouxe material didático', 'Atingiu 80% ou mais', 'Realizou projetos extras', 'Realizou atividades extras'];
      const keys = ['good', 'material', 'level', 'project', 'activity'];
      let total = 0;
      const list = document.createElement('div');
      list.style.display = 'grid';
      list.style.rowGap = '6px';
      list.style.marginTop = '8px';

      keys.forEach((k, idx) => {
        const got = c.states?.[k] ? 3 : 0;
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.style.alignItems = 'center';
        row.innerHTML = `<div style='font-size:13px'>${labels[idx]}</div><div style='font-weight:700'>${got > 0 ? got : '-'}</div>`; list.appendChild(row);
        total += got;
      });
      const foot = document.createElement('div');
      foot.style.display = 'flex';
      foot.style.justifyContent = 'space-between';
      foot.style.borderTop = '1px dashed #ddd';
      foot.style.paddingTop = '8px';
      foot.style.marginTop = '8px';
      foot.innerHTML = `<div>Total</div><div style='font-weight:800'>${total}</div>`;
      card.appendChild(list);
      card.appendChild(foot);
      daySection.appendChild(card);
    });
    wrapper.appendChild(daySection);
  }

  const opt = { margin: 0.2, filename: `Relatorio_semanal_${getDateForCurrentWeek(1)}_a_${getDateForCurrentWeek(6)}.pdf`, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 1.5 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
  html2pdf().set(opt).from(wrapper).save();
});

// exportar relatório por aluno (gera um PDF por aluno com pontuação total)
document.getElementById('exportStudentBtn').addEventListener('click', () => {
  const data = loadData();
  if (data.students.length === 0) return alert('Nenhum aluno cadastrado');

  // pedir ao usuário: exportar todos ou apenas um
  const choice = prompt('Digite o nome do aluno para exportar, ou deixe em branco para exportar TODOS:');
  const targets = choice ? data.students.filter(s => s.name.toLowerCase() === choice.toLowerCase()) : data.students;
  if (targets.length === 0) return alert('Aluno não encontrado');

  targets.forEach(s => {
    const wrapper = document.createElement('div');
    wrapper.style.padding = '14px';
    wrapper.style.fontFamily = 'Arial, Helvetica, sans-serif';
    wrapper.style.color = '#111';
    const h = document.createElement('h2');
    h.textContent = `Relatório — ${s.name}`;
    h.style.textAlign = 'center';
    wrapper.appendChild(h);

    const cards = data.cards.filter(c => c.studentId === s.id && !c.absent);
    let grandTotal = 0;
    if (cards.length === 0) {
      const empty = document.createElement('div');
      empty.textContent = 'Sem aulas nesta semana (ou todas marcadas como ausência).';
      wrapper.appendChild(empty);
    }
    cards.forEach(c => {
      const card = document.createElement('div');
      card.style.border = '1px solid #ddd';
      card.style.borderRadius = '8px';
      card.style.padding = '10px';
      card.style.marginBottom = '10px';
      card.style.width = '100%';
      card.innerHTML =
        `<div style='display:flex;justify-content:space-between;align-items:center'>
          <div>
            <strong>${s.name}</strong>
            <div style='font-size:12px;color:#666;margin-top:6px'>${c.dateStr}</div>
        </div>`;
      // details
      const labels = ['Bom comportamento', 'Trouxe material didático', 'Atingiu 80% ou mais', 'Realizou projetos extras', 'Realizou atividades extras'];
      const keys = ['good', 'material', 'level', 'project', 'activity'];
      const list = document.createElement('div');
      list.style.display = 'grid';
      list.style.rowGap = '6px';
      list.style.marginTop = '8px';

      keys.forEach((k, idx) => {
        const got = c.states?.[k] ? 3 : 0;
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'space-between';
        row.innerHTML = `<div style='font-size:13px'>${labels[idx]}</div><div style='font-weight:700'>${got > 0 ? got : '-'}</div>`; list.appendChild(row);
      });

      const foot = document.createElement('div');
      foot.style.display = 'flex';
      foot.style.justifyContent = 'space-between';
      foot.style.borderTop = '1px dashed #ddd';
      foot.style.paddingTop = '8px';
      foot.style.marginTop = '8px';
      foot.innerHTML = `<div>Total</div><div style='font-weight:800'>${getCardTotal(c)}</div>`;

      card.appendChild(list);
      card.appendChild(foot);
      wrapper.appendChild(card);
      grandTotal += getCardTotal(c);
    });
    const summary = document.createElement('div');
    summary.style.marginTop = '8px';
    summary.innerHTML = `<h3>Total do aluno: ${grandTotal} pontos</h3>`;
    wrapper.appendChild(summary);

    const studentName = s.name.replace(/\s+/g, '_');
    const currentWeek = `${getDateForCurrentWeek(1)}_a_${getDateForCurrentWeek(6)}`;
    const filename = `Relatorio_${studentName}_${currentWeek}.pdf`;
    const opt = {
      margin: 0.2,
      filename,
      image: {
        type: 'jpeg', quality: 0.95
      },
      html2canvas: {
        scale: 1.5
      },
      jsPDF: {
        unit: 'in',
        format: 'a4',
        orientation: 'portrait'
      }
    };
    html2pdf().set(opt).from(wrapper).save();
  });
});

// expose some functions used inline
window.exportStudent = function (studentId) {
  const data = loadData(); const s = data.students.find(x => x.id === studentId);
  if (!s) return alert('Aluno não encontrado'); // gerar só esse aluno

  const wrapper = document.createElement('div');
  wrapper.style.padding = '14px';
  wrapper.style.fontFamily = 'Arial, Helvetica, sans-serif';
  wrapper.style.color = '#111';
  const h = document.createElement('h2');
  h.textContent = `Relatório — ${s.name}`;
  h.style.textAlign = 'center';
  wrapper.appendChild(h); const cards = data.cards.filter(c => c.studentId === s.id && !c.absent);

  let grandTotal = 0;
  cards.forEach(c => {
    const card = document.createElement('div');
    card.style.border = '1px solid #ddd';
    card.style.borderRadius = '8px';
    card.style.padding = '10px';
    card.style.marginBottom = '10px';
    card.style.width = '100%';
    card.innerHTML = `<div style='display:flex;justify-content:space-between;align-items:center'><div><strong>${s.name}</strong><div style='font-size:12px;color:#666;margin-top:6px'>${c.dateStr}</div></div></div>`; const keys = ['good', 'material', 'level', 'project', 'activity'];
    const labels = ['Bom comportamento', 'Trouxe material didático', 'Atingiu 80% ou mais', 'Realizou projetos extras', 'Realizou atividades extras'];
    const list = document.createElement('div');
    list.style.display = 'grid';
    list.style.rowGap = '6px';
    list.style.marginTop = '8px';
    keys.forEach((k, idx) => {
      const got = c.states?.[k] ? 3 : 0;
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.innerHTML = `<div style='font-size:13px'>${labels[idx]}</div><div style='font-weight:700'>${got > 0 ? got : '-'}</div>`;
      list.appendChild(row);
    });

    const foot = document.createElement('div');
    foot.style.display = 'flex';
    foot.style.justifyContent = 'space-between';
    foot.style.borderTop = '1px dashed #ddd';
    foot.style.paddingTop = '8px';
    foot.style.marginTop = '8px';
    foot.innerHTML = `<div>Total</div><div style='font-weight:800'>${getCardTotal(c)}</div>`;

    card.appendChild(list);
    card.appendChild(foot);
    wrapper.appendChild(card); grandTotal += getCardTotal(c);
  });
  const summary = document.createElement('div');
  summary.style.marginTop = '8px';
  summary.innerHTML = `<h3>Total do aluno: ${grandTotal} pontos</h3>`;
  wrapper.appendChild(summary);
  const filename = `Relatorio_${s.name.replace(/\s+/g, '_')}_${getDateForCurrentWeek(1)}_a_${getDateForCurrentWeek(6)}.pdf`;
  const opt = { margin: 0.2, filename, image: { type: 'jpeg', quality: 0.95 }, html2canvas: { scale: 1.5 }, jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' } };
  html2pdf().set(opt).from(wrapper).save();
};