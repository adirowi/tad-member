let selectedCSVData = null;

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
  fetchRecords();
  setupCSVHandlers();
});

// Alerts helper
function showAlert(type, message) {
  const errorAlert = document.getElementById('alert-error');
  const successAlert = document.getElementById('alert-success');
  
  errorAlert.style.display = 'none';
  successAlert.style.display = 'none';

  if (type === 'danger') {
    errorAlert.textContent = message;
    errorAlert.style.display = 'block';
  } else if (type === 'success') {
    successAlert.textContent = message;
    successAlert.style.display = 'block';
  }
}

// Fetch Records
async function fetchRecords() {
  const tbody = document.getElementById('records-tbody');
  try {
    const response = await fetch('/api/mimin/records');
    const data = await response.json();

    if (!response.ok) throw new Error(data.error || 'Failed to fetch records.');

    if (data.records.length === 0) {
      tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">No records found. Add some above!</td></tr>`;
      return;
    }

    tbody.innerHTML = data.records.map(rec => `
      <tr data-id="${rec.id}">
        <td><strong>${escapeHtml(rec.nickname)}</strong></td>
        <td>${escapeHtml(rec.phone_number)}</td>
        <td class="truncate"><a href="${escapeHtml(rec.pdf_url)}" target="_blank" class="nav-link" style="margin-top:0;">${escapeHtml(rec.pdf_url)}</a></td>
        <td>
          <button class="btn btn-secondary delete-btn" style="padding: 0.25rem 0.5rem; font-size: 0.8rem; color: var(--danger); border-color: #fecaca;" onclick="deleteRecord(${rec.id})">
            Delete
          </button>
        </td>
      </tr>
    `).join('');

  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--danger);">${escapeHtml(error.message)}</td></tr>`;
  }
}

// Add Record Manually
document.getElementById('add-record-form').addEventListener('submit', async function (e) {
  e.preventDefault();

  const nickname = document.getElementById('new-nickname').value.trim();
  const phone = document.getElementById('new-phone').value.trim();
  const url = document.getElementById('new-url').value.trim();
  const btn = document.getElementById('add-btn');
  const spinner = document.getElementById('add-spinner');

  btn.disabled = true;
  spinner.style.display = 'inline-block';

  try {
    const response = await fetch('/api/mimin/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, phone_number: phone, pdf_url: url }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to save record.');

    showAlert('success', 'Record added successfully!');
    document.getElementById('add-record-form').reset();
    fetchRecords();

  } catch (error) {
    showAlert('danger', error.message);
  } finally {
    btn.disabled = false;
    spinner.style.display = 'none';
  }
});

// Delete Record
async function deleteRecord(id) {
  if (!confirm('Are you sure you want to delete this record?')) return;

  try {
    const response = await fetch(`/api/mimin/records?id=${id}`, {
      method: 'DELETE',
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to delete record.');

    showAlert('success', 'Record deleted successfully!');
    fetchRecords();

  } catch (error) {
    showAlert('danger', error.message);
  }
}

// CSV Handlers
function setupCSVHandlers() {
  const dropzone = document.getElementById('csv-dropzone');
  const fileInput = document.getElementById('csv-file-input');
  const importBtn = document.getElementById('import-btn');

  dropzone.addEventListener('click', () => fileInput.click());

  dropzone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, () => dropzone.classList.remove('dragover'));
  });

  dropzone.addEventListener('drop', (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleCSVFile(files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      handleCSVFile(e.target.files[0]);
    }
  });

  importBtn.addEventListener('click', async () => {
    if (!selectedCSVData || selectedCSVData.length === 0) return;

    const spinner = document.getElementById('import-spinner');
    importBtn.disabled = true;
    spinner.style.display = 'inline-block';

    try {
      const response = await fetch('/api/mimin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ records: selectedCSVData }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to import CSV data.');

      showAlert('success', `Import successful! Added ${data.count} records.`);
      
      // Reset state
      selectedCSVData = null;
      dropzone.querySelector('p').innerHTML = `Drag & drop your CSV file here or <span style="color: var(--primary); font-weight: 600;">browse</span>`;
      importBtn.disabled = true;
      fetchRecords();

    } catch (error) {
      showAlert('danger', error.message);
    } finally {
      importBtn.disabled = false;
      spinner.style.display = 'none';
    }
  });
}

function handleCSVFile(file) {
  const dropzone = document.getElementById('csv-dropzone');
  const importBtn = document.getElementById('import-btn');

  if (!file.name.endsWith('.csv')) {
    showAlert('danger', 'Please upload a valid CSV file.');
    return;
  }

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const text = e.target.result;
      selectedCSVData = parseCSV(text);
      
      if (selectedCSVData.length === 0) {
        throw new Error('The CSV file is empty or has no data rows.');
      }

      dropzone.querySelector('p').innerHTML = `Selected file: <strong>${escapeHtml(file.name)}</strong> (${selectedCSVData.length} records found)`;
      importBtn.disabled = false;
      showAlert('success', 'CSV parsed successfully! Click "Import CSV Data" to commit changes.');
    } catch (err) {
      showAlert('danger', err.message);
      selectedCSVData = null;
      importBtn.disabled = true;
    }
  };
  reader.readAsText(file);
}

// Lightweight, resilient, vanilla CSV Parser
function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  if (lines.length < 2) return [];

  // Parse headers
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^"|"$/g, ''));
  
  const nickIndex = headers.indexOf('nickname');
  const phoneIndex = headers.indexOf('phone_number');
  const urlIndex = headers.indexOf('pdf_url');

  if (nickIndex === -1 || phoneIndex === -1 || urlIndex === -1) {
    throw new Error('CSV headers must include "nickname", "phone_number", and "pdf_url" (case-insensitive).');
  }

  const records = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue; // Skip empty rows

    // Simple robust cell splitting considering quotes (e.g., if URLs contain commas, although typical Drive URLs don't)
    const cells = [];
    let currentCell = '';
    let inQuotes = false;

    for (let charIndex = 0; charIndex < line.length; charIndex++) {
      const char = line[charIndex];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    if (cells.length < Math.max(nickIndex, phoneIndex, urlIndex) + 1) {
      continue; // Skip malformed rows
    }

    const nickname = cells[nickIndex];
    const phone_number = cells[phoneIndex];
    const pdf_url = cells[urlIndex];

    if (!nickname || !phone_number || !pdf_url) {
      continue; // Skip lines with empty fields
    }

    records.push({ nickname, phone_number, pdf_url });
  }

  return records;
}

// Helper: Escape HTML to prevent XSS
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
