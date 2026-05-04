# Flashly — High-Fidelity Prototype

A browser-based flashcard study tool. No accounts, no server, no database — decks live in the browser's `localStorage` so they persist between visits.

**Team:** Alexander Okonkwo, Ethan Juniper, Jayden Briones, Ayomide Hakeem
**Course:** CS 2450 — Stage 5: High-Fidelity Prototype

## How to Run

The prototype is plain HTML/CSS/JavaScript. No build step.

**Option 1 — open the file directly**

Double-click `index.html`. It will open in your default browser.

**Option 2 — local web server (recommended)**

From this directory:

```bash
python3 -m http.server 8765
```

Then visit http://localhost:8765 in any modern browser (Chrome, Safari, Firefox, Edge).

To stop the server: `Ctrl+C` in the terminal, or `kill $(lsof -ti :8765)`.

## What's Implemented

The prototype fully supports two core user tasks:

### Task 1 — Study a deck

- From the **Decks** screen, click any deck (or its **Study** button).
- The card shows the front; **click the card** or press **Space** to flip.
- Use **Again / Good / Easy** to rate and advance, or **← Prev / Next →** to navigate manually (arrow keys also work).
- **Shuffle** randomizes the order; **Reset** clears progress for the deck.
- A progress bar reflects position within the deck; rated cards count toward "seen" on the deck card.

### Task 2 — Create and edit a deck

- From the **Decks** screen, click **+ New deck**, name it, and you're dropped into the editor.
- Add cards with **+ Add card**; edits to front/back save automatically (no submit button needed).
- Open any existing deck's **Edit** button to add, change, or delete cards, or rename the deck.
- **Delete deck** removes it after confirmation.

### Bonus — Import / Export

`Import` and `Export` in the top right round-trip the entire library as JSON, supporting the proposal's "portability" requirement.

## File Structure

```
demo/
├── index.html      Markup and view structure (Decks / Study / Edit)
├── styles.css      Visual design (Cal Poly Pomona green & gold theme)
├── app.js          State, routing, study logic, persistence, import/export
└── README.md       This file
```

## Design Notes

- **Mock data:** four pre-seeded decks (Biology, Data Structures, Spanish, US History) load on first run so the app is immediately demonstrable.
- **Persistence:** all changes are written to `localStorage` under the key `flashly:v1`. Clear it from devtools to reset to the seeded mock decks.
- **Theme:** Cal Poly Pomona green (`#1E4D2B`) and gold (`#FFC72C`).
- **Feedback:** toast notifications confirm shuffle/reset/import/export/delete; the active screen is highlighted in the top nav; cards animate on flip.
- **Error handling:** invalid JSON imports are rejected with an alert; deck deletion requires confirmation; empty decks display a placeholder rather than a blank screen.

## Known Scope Limits (intentional)

This is a prototype, not a finished product. Per the assignment:

- No backend, accounts, or sync.
- Spaced-repetition scheduling is simplified to a "seen count" rather than a full SRS algorithm.
- The third proposal task (rich import workflows / spaced-repetition tuning) is out of scope for Stage 5.
