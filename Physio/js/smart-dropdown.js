/**
 * Advanced Smart Dropdown System for ReviveCMS
 * True floating popup with internal search, categorization, and management.
 */

const PREDEFINED_CONDITIONS = {
  "Spine": [
    "Cervical Spondylosis",
    "Lumbar Spondylosis",
    "Lumbar Disc Herniation",
    "Sciatica",
    "Degenerative Disc Disease",
    "Spinal Stenosis",
    "Scoliosis",
    "Kyphosis"
  ],
  "Knee": [
    "Osteoarthritis",
    "ACL Tear",
    "PCL Tear",
    "Meniscus Injury",
    "Patellofemoral Syndrome"
  ],
  "Shoulder": [
    "Frozen Shoulder",
    "Rotator Cuff Tear",
    "Shoulder Impingement"
  ],
  "Hip": [
    "Hip Osteoarthritis",
    "Avascular Necrosis"
  ],
  "Trauma": [
    "Fracture",
    "Dislocation",
    "Ligament Injury",
    "Sports Injury"
  ]
};

const PREDEFINED_DIAGNOSES = [
  "Lumbar Disc Prolapse",
  "L4-L5 Disc Herniation",
  "Cervical Radiculopathy",
  "Knee Osteoarthritis Grade II",
  "ACL Rupture",
  "Rotator Cuff Tear",
  "Frozen Shoulder Stage II",
  "Post Fracture Stiffness",
  "Mechanical Back Pain",
  "Lumbar Canal Stenosis",
  "Avascular Necrosis Head of Femur",
  "Patellar Tendinitis",
  "Supraspinatus Tendinitis",
  "Colles Fracture Post-Reduction",
  "Ankle Lateral Ligament Sprain"
];

const SUGGESTION_MAPPING = {
  "Cervical Spondylosis": ["Cervical Radiculopathy", "Nerve Compression", "Reduced ROM"],
  "Lumbar Spondylosis": ["Mechanical Back Pain", "Lumbar Disc Prolapse", "Nerve Compression"],
  "Lumbar Disc Herniation": ["L4-L5 Disc Herniation", "Lumbar Disc Prolapse", "Sciatica"],
  "Sciatica": ["L4-L5 Disc Herniation", "Nerve Compression", "Lumbar Disc Prolapse"],
  "Degenerative Disc Disease": ["Mechanical Back Pain", "Lumbar Canal Stenosis"],
  "Spinal Stenosis": ["Lumbar Canal Stenosis", "Reduced ROM"],
  "Osteoarthritis": ["Knee Osteoarthritis Grade II", "Reduced ROM", "Muscle Weakness"],
  "ACL Tear": ["ACL Rupture", "Knee Osteoarthritis Grade II", "Reduced ROM"],
  "Meniscus Injury": ["Knee Osteoarthritis Grade II", "Reduced ROM"],
  "Frozen Shoulder": ["Frozen Shoulder Stage II", "Reduced ROM", "Supraspinatus Tendinitis"],
  "Rotator Cuff Tear": ["Rotator Cuff Tear", "Supraspinatus Tendinitis", "Reduced ROM"],
  "Hip Osteoarthritis": ["Avascular Necrosis Head of Femur", "Reduced ROM"],
  "Avascular Necrosis": ["Avascular Necrosis Head of Femur"],
  "Fracture": ["Colles Fracture Post-Reduction", "Post Fracture Stiffness"],
  "Ligament Injury": ["ACL Rupture", "Ankle Lateral Ligament Sprain"]
};

const STORAGE_KEY = "revivecms_custom_dropdowns_v2";

function getCustomData() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : { customConditions: [], customDiagnoses: [] };
}

function saveCustomData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// Global state
let activeDropdown = null;

class SmartSelect {
  constructor(inputId, type) {
    this.inputId = inputId;
    this.type = type; // 'condition' or 'diagnosis'
    this.inputEl = document.getElementById(inputId);
    if (!this.inputEl) return;
    
    this.initUI();
    this.attachEvents();
  }

  initUI() {
    // Hide original input, make a trigger button
    this.inputEl.style.display = 'none';
    
    this.triggerEl = document.createElement('div');
    this.triggerEl.className = 'smart-select-trigger';
    this.triggerEl.tabIndex = 0;
    this.triggerEl.innerHTML = `<span class="value-text">${this.inputEl.value || 'Select ' + (this.type === 'condition' ? 'Condition' : 'Diagnosis') + '...'}</span> <i data-lucide="chevron-down"></i>`;
    this.inputEl.parentNode.insertBefore(this.triggerEl, this.inputEl);

    // Create dropdown panel appended to body to avoid overflow issues
    this.dropdownEl = document.createElement('div');
    this.dropdownEl.className = 'smart-select-dropdown';
    this.dropdownEl.innerHTML = `
      <div class="smart-select-search">
        <i data-lucide="search"></i>
        <input type="text" placeholder="Search or add new...">
      </div>
      <div class="smart-select-list"></div>
      <div class="smart-select-footer">
        <button type="button" class="btn-manage" data-type="${this.type}">
          <i data-lucide="settings" style="width:14px;height:14px;"></i> Manage ${this.type === 'condition' ? 'Conditions' : 'Diagnoses'}
        </button>
      </div>
    `;
    document.body.appendChild(this.dropdownEl);
    
    this.searchInput = this.dropdownEl.querySelector('input');
    this.listEl = this.dropdownEl.querySelector('.smart-select-list');
    this.manageBtn = this.dropdownEl.querySelector('.btn-manage');
    
    if (window.lucide) window.lucide.createIcons();

    // Container for suggestions (Diagnoses only)
    if (this.type === 'diagnosis') {
      this.suggestionsContainer = document.createElement('div');
      this.suggestionsContainer.className = 'smart-suggestions';
      this.triggerEl.parentNode.appendChild(this.suggestionsContainer);
    }
  }

  attachEvents() {
    this.triggerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    this.triggerEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDropdown();
      }
    });

    this.searchInput.addEventListener('input', () => this.renderList(this.searchInput.value));
    
    this.searchInput.addEventListener('keydown', (e) => this.handleKeyboardNav(e));

    this.manageBtn.addEventListener('click', () => {
      this.closeDropdown();
      openManageModal(this.type);
    });

    // Listen for changes on the original input to update trigger text
    this.inputEl.addEventListener('change', () => {
      this.triggerEl.querySelector('.value-text').textContent = this.inputEl.value || 'Select ' + (this.type === 'condition' ? 'Condition' : 'Diagnosis') + '...';
      if (this.type === 'condition') updateDiagnosisSuggestions(this.inputEl.value);
    });

    // We also need to listen for when condition changes to update diagnosis suggestions
    if (this.type === 'condition') {
      this.inputEl.addEventListener('change', () => {
         const diagInput = document.getElementById('fDiagnosis');
         if (diagInput) diagInput.dispatchEvent(new Event('conditionChanged'));
      });
    }

    if (this.type === 'diagnosis') {
      this.inputEl.addEventListener('conditionChanged', () => {
         const condVal = document.getElementById('fCondition').value;
         this.renderSuggestions(condVal);
      });
    }
  }

  toggleDropdown() {
    if (this.dropdownEl.classList.contains('show')) {
      this.closeDropdown();
    } else {
      this.openDropdown();
    }
  }

  openDropdown() {
    if (activeDropdown && activeDropdown !== this) activeDropdown.closeDropdown();
    activeDropdown = this;

    // Reset layout styles for clean measurement
    this.dropdownEl.style.top = '0px';
    this.dropdownEl.style.bottom = 'auto';
    this.dropdownEl.style.maxHeight = 'none';
    this.listEl.style.maxHeight = '240px'; // default
    
    this.dropdownEl.classList.add('show');
    this.triggerEl.classList.add('active');
    this.searchInput.value = '';
    this.renderList('');
    this.searchInput.focus();

    // Measure viewport and trigger box
    const rect = this.triggerEl.getBoundingClientRect();
    this.dropdownEl.style.width = `${rect.width}px`;
    this.dropdownEl.style.left = `${rect.left + window.scrollX}px`;

    const dropdownHeight = this.dropdownEl.offsetHeight;
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;

    if (spaceBelow < dropdownHeight + 10 && spaceAbove > spaceBelow) {
      // Position above trigger if space below is limited
      this.dropdownEl.style.top = `${rect.top + window.scrollY - dropdownHeight - 4}px`;
    } else {
      // Position below trigger
      this.dropdownEl.style.top = `${rect.bottom + window.scrollY + 4}px`;
      // Cap height if it overflows the bottom of the viewport
      const availableSpaceForList = window.innerHeight - rect.bottom - 100; // room for search, footer, margins
      if (availableSpaceForList < 240) {
        this.listEl.style.maxHeight = `${Math.max(100, availableSpaceForList)}px`;
      }
    }
  }

  closeDropdown() {
    this.dropdownEl.classList.remove('show');
    this.triggerEl.classList.remove('active');
    if (activeDropdown === this) activeDropdown = null;
  }

  renderList(query) {
    this.listEl.innerHTML = '';
    query = query.toLowerCase().trim();
    
    let items = this.type === 'condition' ? this.getConditions() : this.getDiagnoses();
    this.currentListItems = [];
    let exactMatch = false;

    // Build DOM
    const fragment = document.createDocumentFragment();

    items.forEach(categoryGroup => {
      let catDiv = document.createElement('div');
      catDiv.className = 'smart-list-category';
      catDiv.textContent = categoryGroup.category;
      
      let hasMatches = false;
      const optionsFragment = document.createDocumentFragment();

      categoryGroup.options.forEach(opt => {
        if (!query || opt.toLowerCase().includes(query)) {
          hasMatches = true;
          if (query && opt.toLowerCase() === query) exactMatch = true;

          let optDiv = document.createElement('div');
          optDiv.className = 'smart-list-option';
          optDiv.innerHTML = this.highlight(opt, query);
          
          optDiv.addEventListener('click', () => this.selectOption(opt));
          
          optionsFragment.appendChild(optDiv);
          this.currentListItems.push({ el: optDiv, val: opt });
        }
      });

      if (hasMatches) {
        fragment.appendChild(catDiv);
        fragment.appendChild(optionsFragment);
      }
    });

    if (query && !exactMatch) {
      let addDiv = document.createElement('div');
      addDiv.className = 'smart-list-add';
      addDiv.innerHTML = `<i data-lucide="plus-circle" style="width:16px;height:16px;"></i> Add "${query}"`;
      addDiv.addEventListener('click', () => {
        this.addCustom(query);
        this.selectOption(query);
      });
      fragment.appendChild(addDiv);
      this.currentListItems.push({ el: addDiv, val: query, isAdd: true });
    }

    if (this.currentListItems.length === 0) {
      let emptyDiv = document.createElement('div');
      emptyDiv.className = 'smart-list-empty';
      emptyDiv.textContent = 'No results found.';
      fragment.appendChild(emptyDiv);
    }

    this.listEl.appendChild(fragment);
    if (window.lucide) window.lucide.createIcons();
    this.activeIndex = -1;
  }

  highlight(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.replace(regex, "<mark>$1</mark>");
  }

  handleKeyboardNav(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex + 1) % this.currentListItems.length;
      this.updateActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = (this.activeIndex - 1 + this.currentListItems.length) % this.currentListItems.length;
      this.updateActive();
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (this.activeIndex > -1) {
        let selected = this.currentListItems[this.activeIndex];
        if (selected.isAdd) this.addCustom(selected.val);
        this.selectOption(selected.val);
      }
    } else if (e.key === 'Escape') {
      this.closeDropdown();
      this.triggerEl.focus();
    }
  }

  updateActive() {
    this.currentListItems.forEach((item, idx) => {
      if (idx === this.activeIndex) {
        item.el.classList.add('active');
        item.el.scrollIntoView({ block: 'nearest' });
      } else {
        item.el.classList.remove('active');
      }
    });
  }

  selectOption(val) {
    this.inputEl.value = val;
    this.inputEl.dispatchEvent(new Event('change'));
    this.closeDropdown();
  }

  addCustom(val) {
    const data = getCustomData();
    if (this.type === 'condition') {
      data.customConditions.push(val);
    } else {
      data.customDiagnoses.push(val);
    }
    saveCustomData(data);
  }

  getConditions() {
    const data = getCustomData();
    let res = [];
    for (const [cat, arr] of Object.entries(PREDEFINED_CONDITIONS)) {
      res.push({ category: cat, options: arr });
    }
    if (data.customConditions.length > 0) {
      res.push({ category: "Custom Conditions", options: data.customConditions });
    }
    return res;
  }

  getDiagnoses() {
    const data = getCustomData();
    let res = [{ category: "Standard Diagnoses", options: PREDEFINED_DIAGNOSES }];
    if (data.customDiagnoses.length > 0) {
      res.push({ category: "Custom Diagnoses", options: data.customDiagnoses });
    }
    return res;
  }

  renderSuggestions(condition) {
    if (this.type !== 'diagnosis' || !this.suggestionsContainer) return;
    this.suggestionsContainer.innerHTML = '';
    if (!condition || !SUGGESTION_MAPPING[condition]) return;
    
    let html = `<span style="font-size:0.75rem; color:var(--text-muted); margin-right: 0.5rem;">✨ Suggestions:</span>`;
    SUGGESTION_MAPPING[condition].forEach(s => {
      html += `<button type="button" class="suggestion-chip">${s}</button>`;
    });
    this.suggestionsContainer.innerHTML = html;

    this.suggestionsContainer.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', () => {
        this.selectOption(chip.textContent);
      });
    });
  }

  // Allow resetting value programmatically
  setValue(val) {
    this.inputEl.value = val;
    this.inputEl.dispatchEvent(new Event('change'));
  }
}

// Close active dropdown when clicking outside
document.addEventListener('click', (e) => {
  if (activeDropdown && !activeDropdown.dropdownEl.contains(e.target) && !activeDropdown.triggerEl.contains(e.target)) {
    activeDropdown.closeDropdown();
  }
});

// Management Modal Logic
function openManageModal(type) {
  const modal = document.getElementById('manageOptionsModal');
  if (!modal) return;
  document.getElementById('manageModalTitle').textContent = `Manage ${type === 'condition' ? 'Conditions' : 'Diagnoses'}`;
  document.getElementById('manageType').value = type;
  
  // Reset inputs
  const newOptionInput = document.getElementById('newOptionInput');
  if (newOptionInput) newOptionInput.value = '';
  
  const manageSearchInput = document.getElementById('manageSearchInput');
  if (manageSearchInput) manageSearchInput.value = '';
  
  renderManageList();
  modal.classList.add('open');
  if (window.lucide) window.lucide.createIcons();
}

function closeManageModal() {
  document.getElementById('manageOptionsModal').classList.remove('open');
}

function renderManageList() {
  const type = document.getElementById('manageType').value;
  const data = getCustomData();
  const listEl = document.getElementById('manageList');
  listEl.innerHTML = '';
  
  const searchInput = document.getElementById('manageSearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';

  const customItems = type === 'condition' ? data.customConditions : data.customDiagnoses;
  const filteredItems = customItems.filter(item => !query || item.toLowerCase().includes(query));

  if (filteredItems.length === 0) {
    listEl.innerHTML = `<div style="padding:1rem; text-align:center; color:var(--text-muted); font-size:0.85rem;">No ${query ? 'matching ' : ''}custom ${type}s found.</div>`;
    return;
  }

  filteredItems.forEach((item) => {
    const index = customItems.indexOf(item);
    const row = document.createElement('div');
    row.className = 'manage-item-row';
    row.innerHTML = `
      <div class="manage-item-text">${item}</div>
      <div class="manage-item-actions">
        <button class="btn btn-ghost btn-icon btn-edit" title="Edit"><i data-lucide="edit-2"></i></button>
        <button class="btn btn-ghost btn-icon btn-delete" style="color:var(--danger)" title="Delete"><i data-lucide="trash-2"></i></button>
      </div>
    `;
    
    row.querySelector('.btn-delete').addEventListener('click', () => {
      if (confirm(`Delete "${item}"?`)) {
        if (type === 'condition') {
          data.customConditions.splice(index, 1);
        } else {
          data.customDiagnoses.splice(index, 1);
        }
        saveCustomData(data);
        renderManageList();
      }
    });
    
    row.querySelector('.btn-edit').addEventListener('click', () => {
      const newVal = prompt("Edit value:", item);
      if (newVal && newVal.trim() !== "") {
        const trimmedVal = newVal.trim();
        if (type === 'condition') {
          data.customConditions[index] = trimmedVal;
        } else {
          data.customDiagnoses[index] = trimmedVal;
        }
        saveCustomData(data);
        renderManageList();
        
        // Sync active form input triggers
        const condInput = document.getElementById('fCondition');
        const diagInput = document.getElementById('fDiagnosis');
        if (type === 'condition' && condInput && condInput.value === item) {
          condInput.value = trimmedVal;
          condInput.dispatchEvent(new Event('change'));
        }
        if (type === 'diagnosis' && diagInput && diagInput.value === item) {
          diagInput.value = trimmedVal;
          diagInput.dispatchEvent(new Event('change'));
        }
      }
    });
    
    listEl.appendChild(row);
  });
  if (window.lucide) window.lucide.createIcons();
}

document.addEventListener("DOMContentLoaded", () => {
  // Initialize Smart Selects
  const conditionSelect = new SmartSelect("fCondition", "condition");
  const diagnosisSelect = new SmartSelect("fDiagnosis", "diagnosis");
  
  // Close manage modal button
  const closeBtn = document.querySelector('#manageOptionsModal .modal-close');
  if (closeBtn) closeBtn.addEventListener('click', closeManageModal);
  const cancelBtn = document.querySelector('#manageOptionsModal [data-close-manage]');
  if (cancelBtn) cancelBtn.addEventListener('click', closeManageModal);

  // Real-time search inside Management Modal
  const manageSearchInput = document.getElementById('manageSearchInput');
  if (manageSearchInput) {
    manageSearchInput.addEventListener('input', renderManageList);
  }

  // Adding new options from Management Modal
  const btnAddOption = document.getElementById('btnAddOption');
  const newOptionInput = document.getElementById('newOptionInput');
  if (btnAddOption && newOptionInput) {
    const handleAdd = () => {
      const val = newOptionInput.value.trim();
      if (!val) return;
      
      const type = document.getElementById('manageType').value;
      const data = getCustomData();
      
      if (type === 'condition') {
        const isPredefined = Object.values(PREDEFINED_CONDITIONS).flat().some(c => c.toLowerCase() === val.toLowerCase());
        const isCustom = data.customConditions.some(c => c.toLowerCase() === val.toLowerCase());
        if (isPredefined || isCustom) {
          alert('This condition already exists.');
          return;
        }
        data.customConditions.push(val);
      } else {
        const isPredefined = PREDEFINED_DIAGNOSES.some(d => d.toLowerCase() === val.toLowerCase());
        const isCustom = data.customDiagnoses.some(d => d.toLowerCase() === val.toLowerCase());
        if (isPredefined || isCustom) {
          alert('This diagnosis already exists.');
          return;
        }
        data.customDiagnoses.push(val);
      }
      
      saveCustomData(data);
      newOptionInput.value = '';
      renderManageList();
    };

    btnAddOption.addEventListener('click', handleAdd);
    newOptionInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAdd();
      }
    });
  }

  // Hook into patient edit modal to sync triggers
  const originalEditPatient = window.editPatient;
  if (typeof originalEditPatient === 'function') {
    window.editPatient = async function(id) {
      await originalEditPatient(id);
      conditionSelect.inputEl.dispatchEvent(new Event('change'));
      diagnosisSelect.inputEl.dispatchEvent(new Event('change'));
    };
  }

  // Hook into add patient btn to clear triggers
  const addPatientBtn = document.getElementById('addPatientBtn');
  if (addPatientBtn) {
    addPatientBtn.addEventListener('click', () => {
      setTimeout(() => {
        conditionSelect.inputEl.dispatchEvent(new Event('change'));
        diagnosisSelect.inputEl.dispatchEvent(new Event('change'));
      }, 50);
    });
  }
});
