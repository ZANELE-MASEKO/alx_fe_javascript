const LOCAL_STORAGE_KEY = "dynamicQuoteGenerator.quotes";
const LAST_CATEGORY_KEY = "dynamicQuoteGenerator.lastCategory";
const SERVER_URL = "https://jsonplaceholder.typicode.com/posts";
const SYNC_INTERVAL = 30000;

let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", category: "Philosophy" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportQuotes");
const importInput = document.getElementById("importFile");
const categoryFilter = document.getElementById("categoryFilter");

let syncMessage = document.getElementById("syncMessage");
if (!syncMessage) {
  syncMessage = document.createElement("div");
  syncMessage.id = "syncMessage";
  syncMessage.style.color = "green";
  syncMessage.style.marginTop = "10px";
  document.body.appendChild(syncMessage);
}

function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) quotes = JSON.parse(data);
}

function showRandomQuote() {
  const filtered = getFilteredQuotes();
  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes available for this category.";
    return;
  }
  const index = Math.floor(Math.random() * filtered.length);
  const q = filtered[index];
  quoteDisplay.innerHTML = `"${q.text}" — ${q.category}`;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();
  if (!text || !category) {
    alert("Please fill in both fields.");
    return;
  }
  quotes.push({ text, category });
  saveQuotes();
  populateCategories();
  alert("Quote added!");
}

function createAddQuoteForm() {
  const container = document.createElement("div");
  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.placeholder = "Enter a new quote";
  const catInput = document.createElement("input");
  catInput.id = "newQuoteCategory";
  catInput.placeholder = "Enter quote category";
  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.onclick = addQuote;
  container.appendChild(textInput);
  container.appendChild(catInput);
  container.appendChild(addBtn);
  document.body.appendChild(container);
}

function exportToJsonFile() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (event) {
    const importedQuotes = JSON.parse(event.target.result);
    quotes.push(...importedQuotes);
    saveQuotes();
    populateCategories();
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

function populateCategories() {
  const categories = [...new Set(quotes.map(q => q.category))];
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';
  categories.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    categoryFilter.appendChild(option);
  });
  const savedCategory = localStorage.getItem(LAST_CATEGORY_KEY);
  if (savedCategory && [...categoryFilter.options].some(opt => opt.value === savedCategory)) {
    categoryFilter.value = savedCategory;
  }
}

function filterQuotes() {
  const selectedCategory = categoryFilter.value;
  localStorage.setItem(LAST_CATEGORY_KEY, selectedCategory);
  const filtered = selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
  if (!filtered.length) {
    quoteDisplay.textContent = "No quotes found in this category.";
    return;
  }
  const randomIndex = Math.floor(Math.random() * filtered.length);
  const q = filtered[randomIndex];
  quoteDisplay.innerHTML = `"${q.text}" — ${q.category}`;
}

function getFilteredQuotes() {
  const selectedCategory = categoryFilter.value;
  return selectedCategory === "all" ? quotes : quotes.filter(q => q.category === selectedCategory);
}

async function fetchQuotesFromServer() {
  try {
    const response = await fetch(SERVER_URL);
    const data = await response.json();
    return data.map(post => ({
      text: post.title,
      category: post.body || "Uncategorized"
    }));
  } catch (err) {
    console.error("Failed to fetch server quotes:", err);
    return [];
  }
}

async function postQuoteToServer(quote) {
  try {
    await fetch(SERVER_URL, {
      method: "POST",
      body: JSON.stringify({ title: quote.text, body: quote.category }),
      headers: { "Content-Type": "application/json; charset=UTF-8" }
    });
  } catch (err) {
    console.error("Failed to post quote to server:", err);
  }
}

async function syncQuotes() {
  const serverQuotes = await fetchQuotesFromServer();
  let updated = 0;
  serverQuotes.forEach(sq => {
    const localIndex = quotes.findIndex(lq => lq.text === sq.text);
    if (localIndex === -1) {
      quotes.push(sq);
      updated++;
    } else {
      quotes[localIndex] = sq;
      updated++;
    }
  });
  if (updated > 0) {
    saveQuotes();
    populateCategories();
    filterQuotes();
    syncMessage.textContent = `${updated} quote(s) synced from server`;
    setTimeout(() => (syncMessage.textContent = ""), 5000);
  }
}

function startAutoSync() {
  syncQuotes();
  setInterval(syncQuotes, SYNC_INTERVAL);
}

function init() {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportToJsonFile);
  importInput.addEventListener("change", importFromJsonFile);
  const savedCategory = localStorage.getItem(LAST_CATEGORY_KEY);
  if (savedCategory) {
    categoryFilter.value = savedCategory;
    filterQuotes();
  } else {
    showRandomQuote();
  }
  startAutoSync();
}

init();
