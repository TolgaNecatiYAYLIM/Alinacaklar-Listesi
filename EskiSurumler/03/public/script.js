// script.js
let currentData = [];
let filteredData = [];
let selectedIndexes = new Set();
let inputRefs = [];

function renderTable(data) {
  const tbody = document.getElementById('list');
  tbody.innerHTML = '';
  inputRefs = [];

  data.forEach((item, index) => {
    const tr = document.createElement('tr');
    const globalIndex = currentData.indexOf(item);
    if (selectedIndexes.has(globalIndex)) {
      tr.classList.add('selected-row');
    }

    const tdDurum = document.createElement('td');
    const inputDurum = document.createElement('input');
    inputDurum.type = 'text';
    inputDurum.value = item.durum || '';
    tdDurum.appendChild(inputDurum);

    const tdTarih = document.createElement('td');
    const inputTarih = document.createElement('input');
    inputTarih.type = 'date';
    inputTarih.value = item.tarih || '';
    tdTarih.appendChild(inputTarih);

    const tdUrun = document.createElement('td');
    const inputUrun = document.createElement('input');
    inputUrun.type = 'text';
    inputUrun.value = item.urun || '';
    tdUrun.appendChild(inputUrun);

    const tdAdet = document.createElement('td');
    const inputAdet = document.createElement('input');
    inputAdet.type = 'text';
    inputAdet.value = item.adet || '';
    tdAdet.appendChild(inputAdet);

    const tdFiyat = document.createElement('td');
    const inputFiyat = document.createElement('input');
    inputFiyat.type = 'text';
    inputFiyat.value = item.fiyat || '';
    tdFiyat.appendChild(inputFiyat);

    const tdSelect = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = selectedIndexes.has(globalIndex);
    checkbox.onclick = () => {
      if (checkbox.checked) {
        selectedIndexes.add(globalIndex);
      } else {
        selectedIndexes.delete(globalIndex);
      }
      renderTable(filteredData);
    };
    tdSelect.appendChild(checkbox);

    tr.appendChild(tdDurum);
    tr.appendChild(tdTarih);
    tr.appendChild(tdUrun);
    tr.appendChild(tdAdet);
    tr.appendChild(tdFiyat);
    tr.appendChild(tdSelect);

    tbody.appendChild(tr);

    inputRefs[globalIndex] = { inputDurum, inputTarih, inputUrun, inputAdet, inputFiyat };
  });

  updateCounter();
}

function applyFilter() {
  const term = document.getElementById('searchBox').value.trim().toLowerCase();
  filteredData = currentData.filter(item => item.urun.toLowerCase().includes(term));
  renderTable(filteredData);
}

function saveList() {
  fetch('/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(currentData)
  }).then(() => applyFilter());
}

function moveUp() {
  const selected = [...selectedIndexes].sort((a, b) => a - b);
  for (let i = 0; i < selected.length; i++) {
    const index = selected[i];
    if (index > 0 && !selectedIndexes.has(index - 1)) {
      [currentData[index - 1], currentData[index]] = [currentData[index], currentData[index - 1]];
      selectedIndexes.delete(index);
      selectedIndexes.add(index - 1);
    }
  }
  saveList();
}

function moveDown() {
  const selected = [...selectedIndexes].sort((a, b) => b - a);
  for (let i = 0; i < selected.length; i++) {
    const index = selected[i];
    if (index < currentData.length - 1 && !selectedIndexes.has(index + 1)) {
      [currentData[index + 1], currentData[index]] = [currentData[index], currentData[index + 1]];
      selectedIndexes.delete(index);
      selectedIndexes.add(index + 1);
    }
  }
  saveList();
}

function deleteSelected() {
  currentData = currentData.filter((_, i) => !selectedIndexes.has(i));
  selectedIndexes.clear();
  saveList();
}

function editSelected() {
  selectedIndexes.forEach(index => {
    const refs = inputRefs[index];
    currentData[index] = {
      durum: refs.inputDurum.value,
      tarih: refs.inputTarih.value,
      urun: refs.inputUrun.value,
      adet: refs.inputAdet.value,
      fiyat: refs.inputFiyat.value
    };
  });
  saveList();
}

function addItem() {
  const durum = document.getElementById('newDurum').value.trim();
  const tarih = document.getElementById('newTarih').value.trim();
  const urun = document.getElementById('newUrun').value.trim();
  const adet = document.getElementById('newAdet').value.trim();
  const fiyat = document.getElementById('newFiyat').value.trim();
  if (urun !== '') {
    currentData.push({ durum, tarih, urun, adet, fiyat });
    saveList();
    document.getElementById('newDurum').value = '';
    document.getElementById('newTarih').value = '';
    document.getElementById('newUrun').value = '';
    document.getElementById('newAdet').value = '';
    document.getElementById('newFiyat').value = '';
  }
}

function exportCSV() {
  window.location.href = '/export';
}

function importCSV() {
  const fileInput = document.getElementById('csvFile');
  if (fileInput.files.length === 0) return;
  const formData = new FormData();
  formData.append('file', fileInput.files[0]);

  fetch('/import', {
    method: 'POST',
    body: formData
  })
    .then(res => res.json())
    .then(() => {
      fileInput.value = '';
      fetch('/list')
        .then(res => res.json())
        .then(data => {
          currentData = data;
          applyFilter();
        });
    });
}

function updateCounter() {
  document.getElementById('counter').textContent = `Toplam Ürün Sayısı: ${currentData.length}`;
}

fetch('/list')
  .then(res => res.json())
  .then(data => {
    currentData = data;
    applyFilter();
  });
