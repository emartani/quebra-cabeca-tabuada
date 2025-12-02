# AI Coding Agent Instructions - Quebra-Cabeça da Tabuada

## Project Overview
Educational puzzle game that teaches multiplication (tabuada) through drag-and-drop gameplay. Players match multiplication operation labels to correct numerical answers, revealing a hidden image as they progress.

**Language:** Portuguese-BR (UI strings, comments, and variable names use Portuguese)

## Architecture & Core Flow

### Game Loop (script.js)
1. **Level Selection** → **Game Start** → **Drag-and-Drop Verification** → **Scoring & Image Reveal** → **Victory Check**
2. **Key Components:**
   - `generateOperations(level)`: Creates 9 unique multiplication problems (a × b = result) with difficulty tiers
   - `startGame(level)`: Initializes board cells, shuffles answer pieces, sets up drag-and-drop listeners
   - **Two-way Data Transfer:** Pieces carry both numeric answer and image slice index for validation

### Data Structure Pattern
```javascript
// Operations array structure
operations = [
  { q: "2 × 3", a: 6 },      // q = question display, a = numeric answer
  // ...
];

// Each piece stores TWO critical values:
piece.dataset.answer = a;     // numeric answer (for drag validation)
piece.dataset.index = index;  // image tile position (for background reveal)
```

### Image Tiling System
- 3×3 grid (9 tiles) of 100×100px each = 300×300px images
- Row/Col calculation: `row = Math.floor(index / 3); col = index % 3`
- **CSS Trick:** `objectPosition: -${col * 100}px -${row * 100}px` clips image on pieces; `backgroundPosition` on cells
- Shuffled pieces show correct tiles but in randomized positions

## Critical Developer Patterns

### Drag-and-Drop Validation
```javascript
// Drop listener validates TWO conditions:
1. draggedAnswer === cell.dataset.answer  // numeric match
2. !cell.classList.contains("correct")    // not already solved
// On success: reveal image tile, increment score, play sound
```

### Responsive Design (style.css)
- **Desktop:** 100×100px cells/pieces in 320px container
- **Mobile (<600px):** 80×80px with adjusted font sizes
- Uses `@media (max-width: 600px)` breakpoint for scaling

### Difficulty Levels (script.js)
```javascript
easy:   max = 3   (2-3 multiplication table)
medium: max = 5   (2-5 multiplication table)  // default
hard:   max = 10  (2-10 multiplication table)
```

## Audio Integration
- **Success:** soundAcerto (wood plank flick)
- **Error:** soundErro (clang and wobble)
- **Victory:** soundVitoria (slide whistle)
- Sources: Google Actions cartoon sound library (HTTPS URLs)

## Key UI Elements
- Game title & instructions: `<h1>` + descriptive paragraph
- Level selector: `<select id="level">` with 3 difficulty options
- Score display: `<div id="score">` updates on each action
- Board: `.grid` (3×3 CSS Grid)
- Pieces container: `#pieces` (flexbox with inline-block items)

## Common Modifications

### Adding Difficulty Levels
- Adjust `generateOperations()` `max` variable
- Add `<option>` to level selector in `index.html`
- Add condition check: `if (level === "yourLevel") max = X;`

### Changing Image Source
- Replace `images` array (line 1) with new URLs or local paths
- Must be square, 300×300px minimum

### Adjusting Score Mechanics
- Success: `score += 10` (line ~57)
- Error: `score -= 5` (line ~65)
- Tile size: `100px` in cells and pieces (impacts row/col calculations)

### Localizing to Another Language
- Update HTML strings in `index.html`
- Modify Portuguese variable descriptions/comments in `script.js`
- Adjust puzzle concept (tabuada = multiplication table; can adapt to other math)

## Testing Checklist
- [ ] All 3 difficulty levels generate unique operations
- [ ] Dragging correct answer highlights cell and reveals image
- [ ] Dragging incorrect answer deducts score but doesn't solve
- [ ] Victory alert triggers after 9 correct placements
- [ ] Image tiles align correctly (no overlap/misalignment)
- [ ] Responsive layout works on mobile (<600px width)
- [ ] Audio plays on success/error (check browser autoplay policy)
- [ ] Restart button clears board and resets score to 0

## Notes for Agents
- **No build process:** Static HTML/CSS/JS, runs directly in browser
- **No dependencies:** Pure vanilla JavaScript, no frameworks
- **External dependencies:** Remote images (picsum.photos) and audio URLs
- **Browser compatibility:** Modern features (CSS Grid, Drag & Drop, CSS object-position)
- **Portuguese context:** Comments and strings intentionally in Portuguese per project context
