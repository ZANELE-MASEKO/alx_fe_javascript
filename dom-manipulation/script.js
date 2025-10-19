const LOCAL_STORAGE_KEY = "dynamicQuoteGenerator.quotes";
const SESSION_LAST_INDEX_KEY = "dynamicQuoteGenerator.lastShownIndex";

let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", category: "Philosophy" },
];

const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const exportBtn = document.getElementById("exportQuotes");
const importInput = document.getElementById("importFile");

function saveQuotes() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
}

function loadQuotes() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (data) quotes = JSON.parse(data);
}

function showQuoteByIndex(index) {
  quoteDisplay.innerHTML = "";
  if (!quotes.length) {
    quoteDisplay.textContent = "No quotes available. Add one below!";
    return;
  }
  const q = quotes[index];
  quoteDisplay.innerHTML = `"${q.text}" — ${q.category}`;
  sessionStorage.setItem(SESSION_LAST_INDEX_KEY, index);
}

function showRandomQuote() {
  if (!quotes.length) return;
  const index = Math.floor(Math.random() * quotes.length);
  showQuoteByIndex(index);
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
    alert("Quotes imported successfully!");
  };
  fileReader.readAsText(event.target.files[0]);
}

function init() {
  loadQuotes();
  createAddQuoteForm();
  newQuoteBtn.addEventListener("click", showRandomQuote);
  exportBtn.addEventListener("click", exportToJsonFile);
  importInput.addEventListener("change", importFromJsonFile);
  showRandomQuote();
}

init();
