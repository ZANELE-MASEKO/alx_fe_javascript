
const LOCAL_STORAGE_KEY = "dynamicQuoteGenerator.quotes";
const SESSION_LAST_INDEX_KEY = "dynamicQuoteGenerator.lastShownIndex";

let quotes = [
  { text: "The best way to predict the future is to create it.", category: "Motivation" },
  { text: "In the middle of difficulty lies opportunity.", category: "Inspiration" },
  { text: "Happiness depends upon ourselves.", category: "Philosophy" },
];


const quoteDisplay = document.getElementById("quoteDisplay");
const newQuoteBtn = document.getElementById("newQuote");
const controlsContainer = document.getElementById("controls");


function saveQuotes() {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.error("Failed to save quotes to localStorage:", err);
    alert("Could not save quotes — localStorage error.");
  }
}

function loadQuotes() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return false;
    quotes = parsed.filter(q => q && typeof q.text === "string" && typeof q.category === "string");
    return true;
  } catch (err) {
    console.error("Failed to load quotes from localStorage:", err);
    return false;
  }
}

function saveLastShownIndex(idx) {
  try { sessionStorage.setItem(SESSION_LAST_INDEX_KEY, String(idx)); } catch (e) { /* ignore */ }
}
function loadLastShownIndex() {
  try {
    const raw = sessionStorage.getItem(SESSION_LAST_INDEX_KEY);
    if (raw == null) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : null;
  } catch (e) { return null; }
}

function showQuoteByIndex(index) {
  quoteDisplay.innerHTML = "";
  if (!quotes.length) {
    const msg = document.createElement("p");
    msg.textContent = "No quotes available. Add one below!";
    quoteDisplay.appendChild(msg);
    return;
  }
  const q = quotes[index];
  const textEl = document.createElement("p");
  textEl.textContent = `"${q.text}"`;

  const catEl = document.createElement("span");
  catEl.textContent = `— ${q.category}`;

  quoteDisplay.appendChild(textEl);
  quoteDisplay.appendChild(catEl);

  saveLastShownIndex(index); 
}

function showRandomQuote() {
  if (!quotes.length) {
    showQuoteByIndex(0);
    return;
  }

  const last = loadLastShownIndex();
  let idx;
  if (last === null) {
    idx = Math.floor(Math.random() * quotes.length);
  } else {
    
    if (quotes.length === 1) idx = 0;
    else {
      do { idx = Math.floor(Math.random() * quotes.length); } while (idx === last);
    }
  }
  showQuoteByIndex(idx);
}


function addQuoteFromForm(textInputEl, categoryInputEl) {
  const newText = textInputEl.value.trim();
  const newCategory = categoryInputEl.value.trim();

  if (!newText || !newCategory) {
    alert("Please fill in both fields.");
    return;
  }

  
  quotes.push({ text: newText, category: newCategory });
  saveQuotes();

  
  textInputEl.value = "";
  categoryInputEl.value = "";

  
  showQuoteByIndex(quotes.length - 1);

  
  setTimeout(() => alert("Quote added and saved."), 50);
}


function createAddQuoteForm() {
  // Container
  const container = document.createElement("div");
  container.id = "addQuoteForm";
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.gap = "8px";
  container.style.marginTop = "14px";
  container.style.alignItems = "center";


  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";
  textInput.style.padding = "8px";
  textInput.style.width = "260px";
  textInput.style.borderRadius = "6px";
  textInput.style.border = "1px solid #ccc";

  const catInput = document.createElement("input");
  catInput.id = "newQuoteCategory";
  catInput.type = "text";
  catInput.placeholder = "Enter quote category";
  catInput.style.padding = "8px";
  catInput.style.width = "260px";
  catInput.style.borderRadius = "6px";
  catInput.style.border = "1px solid #ccc";


  const addBtn = document.createElement("button");
  addBtn.textContent = "Add Quote";
  addBtn.className = "small";
  addBtn.style.marginTop = "4px";
  addBtn.addEventListener("click", () => addQuoteFromForm(textInput, catInput));


  container.appendChild(textInput);
  container.appendChild(catInput);
  container.appendChild(addBtn);

  
  controlsContainer.insertAdjacentElement("afterend", container);
}


function exportQuotesToJson() {
  try {
    const dataStr = JSON.stringify(quotes, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    const filename = `quotes_${new Date().toISOString().slice(0,19).replace(/[:T]/g,"-")}.json`;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Export failed.");
  }
}


function importFromJsonFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (!Array.isArray(imported)) throw new Error("JSON must be an array of quote objects.");

     
      const valid = imported.filter(it => it && typeof it.text === "string" && typeof it.category === "string");
      if (!valid.length) {
        alert("No valid quotes found in file.");
        return;
      }

    
      const existingSet = new Set(quotes.map(q => `${q.text}|||${q.category}`));
      let addedCount = 0;
      valid.forEach(q => {
        const key = `${q.text}|||${q.category}`;
        if (!existingSet.has(key)) {
          quotes.push({ text: q.text, category: q.category });
          existingSet.add(key);
          addedCount++;
        }
      });

      if (addedCount > 0) {
        saveQuotes();
        alert(`${addedCount} quote(s) imported and saved.`);
        
        showQuoteByIndex(quotes.length - 1);
      } else {
        alert("No new quotes were added (duplicates skipped).");
      }
    } catch (err) {
      console.error("Import failed:", err);
      alert("Failed to import quotes — invalid JSON format.");
    } finally {
    
      event.target.value = "";
    }
  };

  reader.readAsText(file);
}


function createImportExportControls() {
  
  const exportBtn = document.createElement("button");
  exportBtn.textContent = "Export JSON";
  exportBtn.className = "small";
  exportBtn.addEventListener("click", exportQuotesToJson);

 
  const fileInput = document.createElement("input");
  fileInput.type = "file";
  fileInput.accept = ".json,application/json";
  fileInput.id = "importFile";
  fileInput.style.display = "none";
  fileInput.addEventListener("change", importFromJsonFile);

  
  const importBtn = document.createElement("button");
  importBtn.textContent = "Import JSON";
  importBtn.className = "small";
  importBtn.addEventListener("click", () => fileInput.click());

  
  controlsContainer.appendChild(importBtn);
  controlsContainer.appendChild(exportBtn);
  document.body.appendChild(fileInput);
}


function init() {
  
  loadQuotes();


  createAddQuoteForm();
  createImportExportControls();

  newQuoteBtn.addEventListener("click", showRandomQuote);

  
  const lastIdx = loadLastShownIndex();
  if (lastIdx !== null && lastIdx >= 0 && lastIdx < quotes.length) {
    showQuoteByIndex(lastIdx);
  } else {
    
    showRandomQuote();
  }
}


init();
