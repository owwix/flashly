// Flashly — local-only flashcard demo
// Storage: localStorage under key "flashly:v1"

const STORAGE_KEY = "flashly:v1";

const MOCK_DECKS = [
  {
    id: "deck-bio-101",
    name: "Biology 101 — Cell Structure",
    description: "Core organelles and their functions.",
    cards: [
      { front: "What is the powerhouse of the cell?", back: "Mitochondria — they produce ATP via cellular respiration.", seen: 0 },
      { front: "Function of the nucleus?", back: "Stores DNA and controls gene expression and cell activities.", seen: 0 },
      { front: "What does the ribosome do?", back: "Synthesizes proteins by translating mRNA.", seen: 0 },
      { front: "Role of the Golgi apparatus?", back: "Modifies, sorts, and packages proteins for secretion or use within the cell.", seen: 0 },
      { front: "Plant cells have what that animal cells lack?", back: "Cell wall, chloroplasts, and a large central vacuole.", seen: 0 },
      { front: "What is endoplasmic reticulum (ER)?", back: "A network of membranes; rough ER makes proteins, smooth ER makes lipids.", seen: 0 },
    ],
  },
  {
    id: "deck-cs-data-structures",
    name: "Data Structures — Big-O",
    description: "Time complexity for common operations.",
    cards: [
      { front: "Average lookup time in a hash table?", back: "O(1)", seen: 0 },
      { front: "Worst-case search in a balanced BST?", back: "O(log n)", seen: 0 },
      { front: "Insertion at the end of a dynamic array (amortized)?", back: "O(1) amortized — occasional O(n) on resize.", seen: 0 },
      { front: "Binary search precondition?", back: "The array must be sorted.", seen: 0 },
      { front: "Linked list random access?", back: "O(n) — must traverse from the head.", seen: 0 },
      { front: "What does a stack model?", back: "LIFO — last in, first out.", seen: 0 },
      { front: "What does a queue model?", back: "FIFO — first in, first out.", seen: 0 },
    ],
  },
  {
    id: "deck-spanish-basics",
    name: "Spanish — Everyday Phrases",
    description: "Common greetings and useful phrases.",
    cards: [
      { front: "Hello", back: "Hola", seen: 0 },
      { front: "Thank you", back: "Gracias", seen: 0 },
      { front: "Good morning", back: "Buenos días", seen: 0 },
      { front: "How are you?", back: "¿Cómo estás?", seen: 0 },
      { front: "Excuse me", back: "Disculpe", seen: 0 },
      { front: "I don't understand", back: "No entiendo", seen: 0 },
      { front: "Where is the bathroom?", back: "¿Dónde está el baño?", seen: 0 },
    ],
  },
  {
    id: "deck-history-us",
    name: "US History — Founding Era",
    description: "Key dates and figures from the late 1700s.",
    cards: [
      { front: "Year the Declaration of Independence was signed?", back: "1776", seen: 0 },
      { front: "First U.S. President?", back: "George Washington (1789–1797)", seen: 0 },
      { front: "Author of most of the Declaration?", back: "Thomas Jefferson", seen: 0 },
      { front: "Year the Constitution was ratified?", back: "1788 (took effect 1789)", seen: 0 },
      { front: "First 10 amendments are called?", back: "The Bill of Rights", seen: 0 },
    ],
  },
];

// ---------- State ----------
let state = load();
let currentDeckId = null;
let studyOrder = [];
let studyIndex = 0;
let flipped = false;

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = { decks: structuredClone(MOCK_DECKS) };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to load state, reseeding:", err);
    const seeded = { decks: structuredClone(MOCK_DECKS) };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid(prefix = "deck") {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function getDeck(id) {
  return state.decks.find((d) => d.id === id);
}

// ---------- View routing ----------
const views = {
  decks: document.getElementById("view-decks"),
  study: document.getElementById("view-study"),
  edit: document.getElementById("view-edit"),
};
const navButtons = document.querySelectorAll(".nav-btn");

function showView(name) {
  Object.entries(views).forEach(([k, el]) => el.classList.toggle("active", k === name));
  navButtons.forEach((btn) => btn.classList.toggle("active", btn.dataset.view === name));
}

navButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    if (btn.dataset.view === "study" && currentDeckId) startStudy(currentDeckId);
    else if (btn.dataset.view === "edit" && currentDeckId) openEditor(currentDeckId);
    else showView(btn.dataset.view);
  });
});

document.querySelectorAll(".back-to-decks").forEach((btn) =>
  btn.addEventListener("click", () => {
    renderDecks();
    showView("decks");
  })
);

// ---------- Decks view ----------
const deckGrid = document.getElementById("deck-grid");

function renderDecks() {
  deckGrid.innerHTML = "";
  if (state.decks.length === 0) {
    deckGrid.innerHTML = `
      <div class="empty" style="grid-column: 1 / -1;">
        <h3>No decks yet</h3>
        <p>Create your first deck to get started.</p>
      </div>`;
    return;
  }
  state.decks.forEach((deck) => {
    const total = deck.cards.length;
    const seen = deck.cards.filter((c) => c.seen > 0).length;
    const pct = total ? Math.round((seen / total) * 100) : 0;
    const el = document.createElement("div");
    el.className = "deck-card";
    el.innerHTML = `
      <div>
        <h3></h3>
        <p></p>
      </div>
      <div class="deck-progress"><div style="width:${pct}%"></div></div>
      <div class="deck-meta">
        <span>${total} card${total === 1 ? "" : "s"} · ${pct}% seen</span>
        <div class="deck-actions">
          <button class="ghost edit-btn">Edit</button>
          <button class="primary study-btn">Study</button>
        </div>
      </div>`;
    el.querySelector("h3").textContent = deck.name;
    el.querySelector("p").textContent = deck.description || "";
    el.querySelector(".study-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      startStudy(deck.id);
    });
    el.querySelector(".edit-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openEditor(deck.id);
    });
    el.addEventListener("click", () => startStudy(deck.id));
    deckGrid.appendChild(el);
  });
}

document.getElementById("new-deck-btn").addEventListener("click", () => {
  const name = prompt("Name your new deck:", "New deck");
  if (!name) return;
  const deck = { id: uid("deck"), name: name.trim(), description: "", cards: [] };
  state.decks.unshift(deck);
  save();
  openEditor(deck.id);
});

// ---------- Study view ----------
const cardEl = document.getElementById("flashcard");
const frontText = document.getElementById("card-front-text");
const backText = document.getElementById("card-back-text");
const studyDeckName = document.getElementById("study-deck-name");
const studyProgress = document.getElementById("study-progress");
const progressFill = document.getElementById("progress-fill");

function startStudy(deckId) {
  const deck = getDeck(deckId);
  if (!deck) return;
  currentDeckId = deckId;
  studyOrder = deck.cards.map((_, i) => i);
  studyIndex = 0;
  flipped = false;
  studyDeckName.textContent = deck.name;
  navButtons.forEach((b) => {
    if (b.dataset.view === "study" || b.dataset.view === "edit") b.disabled = false;
  });
  if (deck.cards.length === 0) {
    frontText.textContent = "This deck has no cards yet.";
    backText.textContent = "Add some in the editor.";
    studyProgress.textContent = "0 / 0";
    progressFill.style.width = "0%";
  } else {
    renderCard();
  }
  showView("study");
}

function renderCard() {
  const deck = getDeck(currentDeckId);
  if (!deck || deck.cards.length === 0) return;
  const card = deck.cards[studyOrder[studyIndex]];
  frontText.textContent = card.front;
  backText.textContent = card.back;
  flipped = false;
  cardEl.classList.remove("flipped");
  studyProgress.textContent = `${studyIndex + 1} / ${studyOrder.length}`;
  const pct = ((studyIndex + 1) / studyOrder.length) * 100;
  progressFill.style.width = pct + "%";
}

function flipCard() {
  flipped = !flipped;
  cardEl.classList.toggle("flipped", flipped);
}

function nextCard() {
  const deck = getDeck(currentDeckId);
  if (!deck || deck.cards.length === 0) return;
  if (studyIndex < studyOrder.length - 1) {
    studyIndex++;
    renderCard();
  } else {
    toast("End of deck — looping to start");
    studyIndex = 0;
    renderCard();
  }
}

function prevCard() {
  if (studyIndex > 0) {
    studyIndex--;
    renderCard();
  }
}

function shuffleDeck() {
  for (let i = studyOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [studyOrder[i], studyOrder[j]] = [studyOrder[j], studyOrder[i]];
  }
  studyIndex = 0;
  renderCard();
  toast("Shuffled");
}

function resetProgress() {
  const deck = getDeck(currentDeckId);
  if (!deck) return;
  deck.cards.forEach((c) => (c.seen = 0));
  save();
  studyIndex = 0;
  studyOrder = deck.cards.map((_, i) => i);
  renderCard();
  toast("Progress reset");
}

cardEl.addEventListener("click", flipCard);
document.getElementById("next-btn").addEventListener("click", nextCard);
document.getElementById("prev-btn").addEventListener("click", prevCard);
document.getElementById("shuffle-btn").addEventListener("click", shuffleDeck);
document.getElementById("reset-btn").addEventListener("click", resetProgress);

document.querySelectorAll(".rate").forEach((btn) => {
  btn.addEventListener("click", () => {
    const deck = getDeck(currentDeckId);
    if (!deck || deck.cards.length === 0) return;
    const card = deck.cards[studyOrder[studyIndex]];
    card.seen = (card.seen || 0) + 1;
    save();
    nextCard();
  });
});

document.addEventListener("keydown", (e) => {
  if (!views.study.classList.contains("active")) return;
  const tag = (e.target.tagName || "").toLowerCase();
  if (tag === "input" || tag === "textarea") return;
  if (e.code === "Space") { e.preventDefault(); flipCard(); }
  else if (e.code === "ArrowRight") nextCard();
  else if (e.code === "ArrowLeft") prevCard();
});

// ---------- Editor view ----------
const editDeckName = document.getElementById("edit-deck-name");
const cardsList = document.getElementById("cards-list");

function openEditor(deckId) {
  const deck = getDeck(deckId);
  if (!deck) return;
  currentDeckId = deckId;
  editDeckName.value = deck.name;
  navButtons.forEach((b) => {
    if (b.dataset.view === "study" || b.dataset.view === "edit") b.disabled = false;
  });
  renderCardsEditor();
  showView("edit");
}

function renderCardsEditor() {
  const deck = getDeck(currentDeckId);
  cardsList.innerHTML = "";
  if (!deck) return;
  if (deck.cards.length === 0) {
    cardsList.innerHTML = `<div class="empty"><h3>No cards yet</h3><p>Add your first card below.</p></div>`;
    return;
  }
  deck.cards.forEach((card, idx) => {
    const row = document.createElement("div");
    row.className = "card-row";
    row.innerHTML = `
      <textarea placeholder="Front (question)"></textarea>
      <textarea placeholder="Back (answer)"></textarea>
      <button class="delete" title="Delete card">✕</button>`;
    const [frontTa, backTa] = row.querySelectorAll("textarea");
    frontTa.value = card.front;
    backTa.value = card.back;
    frontTa.addEventListener("input", () => { card.front = frontTa.value; save(); });
    backTa.addEventListener("input", () => { card.back = backTa.value; save(); });
    row.querySelector(".delete").addEventListener("click", () => {
      deck.cards.splice(idx, 1);
      save();
      renderCardsEditor();
    });
    cardsList.appendChild(row);
  });
}

editDeckName.addEventListener("input", () => {
  const deck = getDeck(currentDeckId);
  if (!deck) return;
  deck.name = editDeckName.value;
  save();
});

document.getElementById("add-card-btn").addEventListener("click", () => {
  const deck = getDeck(currentDeckId);
  if (!deck) return;
  deck.cards.push({ front: "", back: "", seen: 0 });
  save();
  renderCardsEditor();
  const rows = cardsList.querySelectorAll(".card-row");
  rows[rows.length - 1]?.querySelector("textarea")?.focus();
});

document.getElementById("study-from-edit").addEventListener("click", () => startStudy(currentDeckId));

document.getElementById("delete-deck-btn").addEventListener("click", () => {
  const deck = getDeck(currentDeckId);
  if (!deck) return;
  if (!confirm(`Delete deck "${deck.name}"? This can't be undone.`)) return;
  state.decks = state.decks.filter((d) => d.id !== currentDeckId);
  currentDeckId = null;
  save();
  navButtons.forEach((b) => {
    if (b.dataset.view === "study" || b.dataset.view === "edit") b.disabled = true;
  });
  renderDecks();
  showView("decks");
  toast("Deck deleted");
});

// ---------- Import / Export ----------
document.getElementById("export-btn").addEventListener("click", () => {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `flashly-export-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast("Exported");
});

const importInput = document.getElementById("import-file");
document.getElementById("import-btn").addEventListener("click", () => importInput.click());
importInput.addEventListener("change", async (e) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    if (!data || !Array.isArray(data.decks)) throw new Error("Invalid file format");
    state = data;
    save();
    renderDecks();
    showView("decks");
    toast(`Imported ${data.decks.length} deck${data.decks.length === 1 ? "" : "s"}`);
  } catch (err) {
    alert("Could not import file: " + err.message);
  }
  importInput.value = "";
});

// ---------- Toast ----------
const toastEl = document.getElementById("toast");
let toastTimer = null;
function toast(msg) {
  toastEl.textContent = msg;
  toastEl.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toastEl.hidden = true), 1800);
}

// ---------- Init ----------
renderDecks();
showView("decks");
