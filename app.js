
// Check if user is logged in
if (localStorage.getItem('pft_logged_in') !== 'true') {
  window.location.href = 'login.html';
}

// Global variables
var currentType = 'income';

var DEFAULT_CATEGORIES = [
  { name: 'Salary',        type: 'income'  },
  { name: 'Food',          type: 'expense' },
  { name: 'Transport',     type: 'expense' },
  { name: 'Utilities',     type: 'expense' },
  { name: 'Entertainment', type: 'expense' },
  { name: 'Health',        type: 'expense' },
  { name: 'Shopping',      type: 'expense' },
  { name: 'Others',        type: 'both'    }
];

// Formats number into pesos
function formatCurrency(amount) {
  return '₱' + parseFloat(amount).toFixed(2);
}

// Returns all saved transactions from storage
function getTransactions() {
  var data = localStorage.getItem('pft_transactions');
  return data ? JSON.parse(data) : [];
}

// Saves the transactions array to storage
function saveTransactions(list) {
  localStorage.setItem('pft_transactions', JSON.stringify(list));
}

// Returns saved categories, or defaults if none is saved
function getCategories() {
  var saved = localStorage.getItem('pft-categories');
  return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
}

// Saves the categories array to storage
function saveCategories(cats) {
  localStorage.setItem('pft-categories', JSON.stringify(cats));
}


//  HOME PAGE & ADD TRANSACTION PAGE

// ── Income / Expense toggle buttons ──
var btnIncome  = document.getElementById('btn-income');
var btnExpense = document.getElementById('btn-expense');

// Switches the active button between Income and Expense
function setType(type) {
  currentType = type;
  if (btnIncome)  btnIncome.classList.toggle('active',  type === 'income');
  if (btnExpense) btnExpense.classList.toggle('active', type === 'expense');
}

if (btnIncome)  btnIncome.addEventListener('click',  function() { setType('income'); });
if (btnExpense) btnExpense.addEventListener('click', function() { setType('expense'); });


// ── Add Transaction modal (Home Page) ──
var modal     = document.getElementById('modal');
var openBtn   = document.getElementById('open-modal-btn');
var closeBtn  = document.getElementById('close-modal-btn');
var cancelBtn = document.getElementById('cancel-btn');

// Shows the add transaction modal
function openModal()  { modal.style.display = 'flex'; }

// Hides the add transaction modal
function closeModal() { modal.style.display = 'none'; }

if (openBtn)   openBtn.addEventListener('click',   openModal);
if (closeBtn)  closeBtn.addEventListener('click',  closeModal);
if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

// Close modal when clicking outside the box
window.addEventListener('click', function(e) {
  if (modal && e.target === modal) closeModal();
});


// ── Frontend / Backend info modals (Home Page) ──
var modalFrontend    = document.getElementById('modal-frontend');
var modalBackend     = document.getElementById('modal-backend');
var btnOpenFrontend  = document.getElementById('open-frontend-btn');
var btnCloseFrontend = document.getElementById('close-frontend-btn');
var btnOpenBackend   = document.getElementById('open-backend-btn');
var btnCloseBackend  = document.getElementById('close-backend-btn');

if (btnOpenFrontend)  btnOpenFrontend.addEventListener('click',  function() { modalFrontend.style.display = 'flex'; });
if (btnCloseFrontend) btnCloseFrontend.addEventListener('click', function() { modalFrontend.style.display = 'none'; });
if (btnOpenBackend)   btnOpenBackend.addEventListener('click',   function() { modalBackend.style.display  = 'flex'; });
if (btnCloseBackend)  btnCloseBackend.addEventListener('click',  function() { modalBackend.style.display  = 'none'; });

// Close info modals when clicking outside
window.addEventListener('click', function(e) {
  if (modalFrontend && e.target === modalFrontend) modalFrontend.style.display = 'none';
  if (modalBackend  && e.target === modalBackend)  modalBackend.style.display  = 'none';
});


// Date input: auto-fill with today's date (Add Transaction part)
var dateInput = document.getElementById('date');
if (dateInput) dateInput.valueAsDate = new Date();


// Category dropdown: fill from saved or default categories (Add Transaction part)
var categorySelect = document.getElementById('category');
if (categorySelect) {
  categorySelect.innerHTML = '<option value="">Select category</option>';

  getCategories().forEach(function(cat) {
    var opt = document.createElement('option');
    opt.value = opt.textContent = cat.name;
    categorySelect.appendChild(opt);
  });
}


// Save button: validate and save a new transaction (Add Transaction part)
var saveBtn = document.getElementById('save-btn');
if (saveBtn) {
  saveBtn.addEventListener('click', function() {

    // Read values from the form fields
    var amount    = document.getElementById('amount').value;
    var category  = document.getElementById('category').value;
    var date      = document.getElementById('date').value;
    var descField = document.getElementById('desc');
    var err       = document.getElementById('error');
    var desc      = descField ? descField.value.trim() : '';

    // Validate — stop if any field is missing or invalid
    if (!amount || parseFloat(amount) <= 0) { err.textContent = 'Please enter a valid amount.'; return; }
    if (!category)                           { err.textContent = 'Please select a category.';   return; }
    if (!date)                               { err.textContent = 'Please select a date.';       return; }

    err.textContent = '';

    // Build the new transaction object
    var newTransaction = {
      id:       Date.now(),
      type:     currentType,
      amount:   parseFloat(amount),
      category: category,
      desc:     desc,
      date:     date
    };

    // Add to the list and save to storage
    var list = getTransactions();
    list.push(newTransaction);
    saveTransactions(list);

    console.log('Transaction saved:', newTransaction);

    // Reset the form fields
    document.getElementById('amount').value = '';
    if (descField) descField.value = '';
    if (dateInput) dateInput.valueAsDate = new Date();
    setType('income');

    // Close the modal if on home page, otherwise go to dashboard
    if (modal) { closeModal(); } else { window.location.href = 'dashboard.html'; }

    alert('Transaction saved!');
  });
}

//  DASHBOARD PAGE

// Show total income, expense, and balance
var balanceEl = document.getElementById('balance');
var incomeEl  = document.getElementById('income');
var expenseEl = document.getElementById('expense');
var tableBody = document.getElementById('transactionTable');
var emptyRow  = document.getElementById('empty-row');

if (balanceEl) {
  var list         = getTransactions();
  var totalIncome  = 0;
  var totalExpense = 0;

  // Add up all income and expense amounts
  list.forEach(function(t) {
    if (t.type === 'income') totalIncome  += t.amount;
    else                     totalExpense += t.amount;
  });

  // Display the totals on the page
  incomeEl.textContent  = formatCurrency(totalIncome);
  expenseEl.textContent = formatCurrency(totalExpense);
  balanceEl.textContent = formatCurrency(totalIncome - totalExpense);

  // Transaction history
  if (list.length > 0) {
    if (emptyRow) emptyRow.style.display = 'none';

    // Sort newest first, then build one row per transaction
    list.slice().sort(function(a, b) { return b.id - a.id; }).forEach(function(t) {
      var color       = t.type === 'income' ? '#2e7d32' : '#c0392b';
      var description = t.desc ? t.desc : '—';

      var tr = document.createElement('tr');
      tr.innerHTML =
        '<td>' + t.date + '</td>' +
        '<td style="color:' + color + '; font-weight:600; text-transform:capitalize;">' + t.type + '</td>' +
        '<td>' + t.category + '</td>' +
        '<td>' + description + '</td>' +
        '<td style="font-weight:700;">' + formatCurrency(t.amount) + '</td>' +
        '<td><button class="del-btn" onclick="deleteTransaction(' + t.id + ')">Delete</button></td>';
      tableBody.appendChild(tr);
    });
  }
}

// Delete button on each transaction row (Dashboard)
function deleteTransaction(id) {
  if (!confirm('Delete this transaction?')) return;

  // Keep all transactions except the one being deleted
  saveTransactions(getTransactions().filter(function(t) { return t.id !== id; }));
  window.location.reload();
}

//  MENU PAGE

// Logout card click (Menu Page)
var logoutCard = document.getElementById('logout-card');
if (logoutCard) {
  logoutCard.addEventListener('click', function(e) {
    e.preventDefault();
    menuOpenModal('modal-logout');
  });
}

// Popup notification (Menu Page) ──
function showPopup(message) {
  var popup = document.getElementById('pft-popup');
  if (!popup) return;
  popup.textContent = message;
  popup.classList.toggle('show', true);
  setTimeout(function() { popup.classList.toggle('show', false); }, 2600);
}

// Opens a menu modal and loads its content
function menuOpenModal(id) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('open', true);

  // Load the right content depending on which modal was opened
  switch (id) {
    case 'modal-summary':    menuRenderSummary();    break;
    case 'modal-categories': menuRenderCategories(); break;
  }
}

// Closes a menu modal by its id
function menuCloseModal(id) {
  var el = document.getElementById(id);
  if (el) el.classList.toggle('open', false);
}

// Close any menu modal when clicking the overlay background
document.querySelectorAll('.menu-modal-overlay').forEach(function(overlay) {
  overlay.addEventListener('click', function(e) {
    if (e.target === this) this.classList.toggle('open', false);
  });
});

// Displays the list of categories inside the modal
function menuRenderCategories() {
  var cats = getCategories();
  var list = document.getElementById('cat-list');
  if (!list) return;

  if (cats.length === 0) {
    list.innerHTML = '<div class="sum-empty">No categories yet.</div>';
    return;
  }

  var html = '';
  cats.forEach(function(cat, i) {
    html +=
      '<div class="cat-item">' +
        '<span>' + cat.name + '</span>' +
        '<div style="display:flex;align-items:center;gap:4px;">' +
          '<span class="cat-badge">' + cat.type + '</span>' +
          '<button class="cat-del" onclick="menuDeleteCategory(' + i + ')" title="Remove">🗑</button>' +
        '</div>' +
      '</div>';
  });

  list.innerHTML = html;
}

// Adds a new category from the input fields
function menuAddCategory() {
  var nameInput = document.getElementById('cat-input');
  var typeInput = document.getElementById('cat-type');
  if (!nameInput || !typeInput) return;

  var name = nameInput.value.trim();
  var type = typeInput.value;

  if (!name) { showPopup('⚠️ Enter a category name'); return; }

  var cats = getCategories();

  // Check if the category name already exists
  var exists = cats.filter(function(c) {
    return c.name.toLowerCase() === name.toLowerCase();
  });

  if (exists.length > 0) { showPopup('⚠️ Category already exists'); return; }

  cats.push({ name: name, type: type });
  saveCategories(cats);
  nameInput.value = '';
  menuRenderCategories();
  showPopup('✅ "' + name + '" added');
}

// Removes a category by its position in the list
function menuDeleteCategory(index) {
  var cats    = getCategories();
  var removed = cats[index];
  cats.splice(index, 1);
  saveCategories(cats);
  menuRenderCategories();
  showPopup('🗑 "' + removed.name + '" removed');
}


// Monthly Summary modal (Menu Page to Summary)
var yearSelect = document.getElementById('sum-year');
if (yearSelect) {
  var today       = new Date();
  var currentYear = today.getFullYear();

  // Fill the year dropdown from current year down to 5 years ago
  for (var y = currentYear; y >= currentYear - 5; y--) {
    var yearOpt = document.createElement('option');
    yearOpt.value = yearOpt.textContent = y;
    yearSelect.appendChild(yearOpt);
  }

  var monthSelect = document.getElementById('sum-month');
  if (monthSelect) {
    monthSelect.value = today.getMonth();
    monthSelect.addEventListener('change', menuRenderSummary);
  }
  yearSelect.addEventListener('change', menuRenderSummary);
}

// ── Monthly Summary modal: display income, expense, and transactions (Menu Page to Summary) ──
function menuRenderSummary() {
  var monthEl = document.getElementById('sum-month');
  var yearEl  = document.getElementById('sum-year');
  if (!monthEl || !yearEl) return;

  var selectedMonth = parseInt(monthEl.value);
  var selectedYear  = parseInt(yearEl.value);

  // Load all transactions from storage
  var raw = localStorage.getItem('pft_transactions');
  var all = raw ? JSON.parse(raw) : [];

  // Keep only transactions from the selected month and year
  var filtered = all.filter(function(t) {
    var d = new Date(t.date);
    return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
  });

  // Add up the totals
  var income = 0, expense = 0;
  filtered.forEach(function(t) {
    if (t.type === 'income') income  += Number(t.amount);
    else                     expense += Number(t.amount);
  });

  var balance = income - expense;

  // Show the totals
  var incEl = document.getElementById('sum-income');
  var expEl = document.getElementById('sum-expense');
  var balEl = document.getElementById('sum-balance');

  if (incEl) incEl.textContent = '₱' + income.toLocaleString('en-PH',  { minimumFractionDigits: 2 });
  if (expEl) expEl.textContent = '₱' + expense.toLocaleString('en-PH', { minimumFractionDigits: 2 });
  if (balEl) {
    balEl.textContent = (balance < 0 ? '-' : '') + '₱' + Math.abs(balance).toLocaleString('en-PH', { minimumFractionDigits: 2 });
    balEl.className   = 's-val s-balance' + (balance < 0 ? ' s-expense' : '');
  }

  var listEl = document.getElementById('sum-list');
  if (!listEl) return;

  if (filtered.length === 0) {
    listEl.innerHTML = '<div class="sum-empty">No transactions for this period.</div>';
    return;
  }

  // Sort newest first and build the transaction list HTML
  var html = '';
  filtered.slice().sort(function(a, b) { return b.id - a.id; }).forEach(function(t) {
    var sign     = t.type === 'income' ? '+'   : '-';
    var amtClass = t.type === 'income' ? 'inc' : 'exp';
    var label    = t.desc ? t.desc : t.category;

    html +=
      '<div class="sum-item">' +
        '<div>' +
          '<div>' + label + '</div>' +
          '<div class="si-meta">' + t.category + ' · ' + t.date + '</div>' +
        '</div>' +
        '<div class="si-amt ' + amtClass + '">' +
          sign + '₱' + Number(t.amount).toLocaleString('en-PH', { minimumFractionDigits: 2 }) +
        '</div>' +
      '</div>';
  });

  listEl.innerHTML = html;
}


// Logout modal (Menu Page to Logout) ──
function menuConfirmLogout() {
  localStorage.removeItem('pft_logged_in');
  localStorage.removeItem('pft_current_user');
  window.location.href = 'login.html';
}
