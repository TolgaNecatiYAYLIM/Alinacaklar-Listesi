// script.js
let currentData = [];
let filteredData = [];
let selectedIndex = null;
let inputRefs = [];

function renderTable(data) {
  const tbody = document.getElementById('list');
  tbody.innerHTML = '';
  inputRefs = [];

  data.forEach((item, index) => {
    const tr = document.createElement('tr');
    const globalIndex = currentData.indexOf(item);
    if (globalIndex === selectedIndex) {
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

    const tdSelect = document.createElement('td');
    const checkbox = document.createElement('input');
    checkbox.type = 'radio';
    checkbox.name = 'selectedRow';
    checkbox.checked = globalIndex === selectedIndex;
    checkbox.onclick = () => {
      selectedIndex = globalIndex;
      renderTable(filteredData);
    };
    tdSelect.appendChild(checkbox);

    tr.appendChild(tdDurum);
    tr.appendChild(tdTarih);
    tr.appendChild(tdUrun);
    tr.appendChild(tdAdet);
    tr.appendChild(tdSelect);

    tbody.appendChild(tr);

    inputRefs[globalIndex] = { inputDurum, inputTarih, inputUrun, inputAdet };
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
  if (selectedIndex > 0) {
    [currentData[selectedIndex - 1], currentData[selectedIndex]] = [currentData[selectedIndex], currentData[selectedIndex - 1]];
    selectedIndex--;
    saveList();
  }
}

function moveDown() {
  if (selectedIndex < currentData.length - 1) {
    [currentData[selectedIndex + 1], currentData[selectedIndex]] = [currentData[selectedIndex], currentData[selectedIndex + 1]];
    selectedIndex++;
    saveList();
  }
}

function deleteSelected() {
  if (selectedIndex !== null) {
    currentData.splice(selectedIndex, 1);
    selectedIndex = null;
    saveList();
  }
}

function editSelected() {
  if (selectedIndex !== null) {
    const refs = inputRefs[selectedIndex];
    currentData[selectedIndex] = {
      durum: refs.inputDurum.value,
      tarih: refs.inputTarih.value,
      urun: refs.inputUrun.value,
      adet: refs.inputAdet.value
    };
    saveList();
  }
}

function addItem() {
  const durum = document.getElementById('newDurum').value.trim();
  const tarih = document.getElementById('newTarih').value.trim();
  const urun = document.getElementById('newUrun').value.trim();
  const adet = document.getElementById('newAdet').value.trim();
  if (urun !== '') {
    currentData.push({ durum, tarih, urun, adet });
    saveList();
    document.getElementById('newDurum').value = '';
    document.getElementById('newTarih').value = '';
    document.getElementById('newUrun').value = '';
    document.getElementById('newAdet').value = '';
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
