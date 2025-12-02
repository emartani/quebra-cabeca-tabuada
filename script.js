// Use the 10 local images from the `images/` folder named `1.jpg` .. `10.jpg`
const images = Array.from({ length: 10 }, (_, i) => `images/${i+1}.jpg`);
let imgURL = "";
let score = 0;
let correctCount = 0;

const board = document.getElementById("board");
const piecesDiv = document.getElementById("pieces");
const scoreDiv = document.getElementById("score");
const restartBtn = document.getElementById("restart");
const startBtn = document.getElementById("start");
const levelSelect = document.getElementById("level");

const soundAcerto = new Audio("https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg");
const soundErro = new Audio("https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg");

function generateOperations(level) {
  let min = 2, max = 5;
  if (level === "easy") max = 3;
  if (level === "hard") max = 10;

  const operations = [];
  while (operations.length < 9) {
    const a = Math.floor(Math.random() * (max - min + 1)) + min;
    const b = Math.floor(Math.random() * 10) + 1;
    const result = a * b;
    if (!operations.some(op => op.a === result)) {
      operations.push({ q: `${a} × ${b}`, a: result });
    }
  }
  return operations;
}

// Inicia uma partida
function startGame(level) {
  // Reset
  board.innerHTML = "";
  piecesDiv.innerHTML = "";
  score = 0;
  correctCount = 0;
  scoreDiv.textContent = "Pontuação: " + score;

  // Escolhe imagem aleatória
  imgURL = images[Math.floor(Math.random() * images.length)];

  // Gera operações
  const operations = generateOperations(level);

  // Cria células do tabuleiro (mostram os resultados e começam em branco)
  operations.forEach((op, index) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = op.a;
    cell.dataset.answer = op.a;
    cell.dataset.index = index;

    // Drag & Drop alvo
    cell.addEventListener("dragover", e => e.preventDefault());
    cell.addEventListener("drop", e => {
      const draggedAnswer = e.dataTransfer.getData("text/plain");
      const pieceIndex = parseInt(e.dataTransfer.getData("pieceIndex"), 10);

      if (draggedAnswer === cell.dataset.answer && !cell.classList.contains("correct")) {
        // Acerto
        cell.classList.add("correct");
        cell.textContent = "";
        const row = Math.floor(pieceIndex / 3);
        const col = pieceIndex % 3;
        cell.style.backgroundImage = `url(${imgURL})`;
        cell.style.backgroundSize = '300% 300%';
        cell.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
        correctCount++;
        score += 10;
        soundAcerto.play();
        scoreDiv.textContent = "Pontuação: " + score;

        // Remover a peça da área inferior (container `#pieces`) ao acertar
        if (window.draggedPiece && window.draggedPiece.parentElement) {
          window.draggedPiece.parentElement.removeChild(window.draggedPiece);
          window.draggedPiece = null;
        }

          if (correctCount === 9) {
            triggerVictoryEffect();
          }
      } else {
        // Erro
        score -= 5;
        soundErro.play();
        scoreDiv.textContent = "Pontuação: " + score;
      }
    });

    board.appendChild(cell);
  });

  // Embaralha a ordem das peças (conta + recorte da imagem)
  const shuffled = [...operations].map((op, i) => ({ ...op, index: i }))
    .sort(() => Math.random() - 0.5);

  // Cria peças com imagem recortada + rótulo da conta
  shuffled.forEach(({ q, a, index }) => {
    const piece = document.createElement("div");
    piece.className = "piece";
    piece.draggable = true;
    piece.dataset.answer = a;     // resultado correto
    piece.dataset.index = index;  // recorte da imagem (0..8)

    // Use background-image so the slice scales correctly with responsive sizes
    const row = Math.floor(index / 3);
    const col = index % 3;
    piece.style.backgroundImage = `url(${imgURL})`;
    piece.style.backgroundSize = '300% 300%';
    piece.style.backgroundPosition = `${col * 50}% ${row * 50}%`;

    // Rótulo da conta
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = q;

    piece.appendChild(label);

    // Drag & Drop: envia resultado e índice do recorte
    piece.addEventListener("dragstart", e => {
      // guarda referência para podermos removê-la no drop
      window.draggedPiece = piece;
      e.dataTransfer.setData("text/plain", String(a));
      e.dataTransfer.setData("pieceIndex", String(index));
    });

    // Touch support: create a draggable ghost and handle touchmove/touchend
    piece.addEventListener("touchstart", e => {
      e.preventDefault();
      const touch = e.touches[0];
      window.draggedPiece = piece;

      // create ghost element to follow the finger
      const ghost = piece.cloneNode(true);
      ghost.classList.add("drag-ghost");
      document.body.appendChild(ghost);
      window.dragGhost = ghost;

      // initial position
      const w = ghost.offsetWidth / 2;
      const h = ghost.offsetHeight / 2;
      ghost.style.position = "fixed";
      ghost.style.left = (touch.clientX - w) + "px";
      ghost.style.top = (touch.clientY - h) + "px";
      ghost.style.zIndex = 9999;
    }, { passive: false });

    // Global handlers: move ghost with touch and finish on touchend
    // NOTE: these are idempotent; they check for window.dragGhost existence.
    document.addEventListener("touchmove", e => {
      if (!window.dragGhost) return;
      e.preventDefault();
      const t = e.touches[0];
      const w = window.dragGhost.offsetWidth / 2;
      const h = window.dragGhost.offsetHeight / 2;
      window.dragGhost.style.left = (t.clientX - w) + "px";
      window.dragGhost.style.top = (t.clientY - h) + "px";
    }, { passive: false });

    document.addEventListener("touchend", e => {
      if (!window.dragGhost) return;
      const t = e.changedTouches[0];
      // determine drop target
      const el = document.elementFromPoint(t.clientX, t.clientY);
      let cell = el;
      while (cell && !cell.classList.contains("cell")) cell = cell.parentElement;

      const draggedAnswer = window.draggedPiece ? window.draggedPiece.dataset.answer : null;
      const pieceIndex = window.draggedPiece ? parseInt(window.draggedPiece.dataset.index, 10) : null;

      if (cell && draggedAnswer === cell.dataset.answer && !cell.classList.contains("correct")) {
        // Acerto (same logic as drop)
        cell.classList.add("correct");
        cell.textContent = "";
        const row = Math.floor(pieceIndex / 3);
        const col = pieceIndex % 3;
        cell.style.backgroundImage = `url(${imgURL})`;
        cell.style.backgroundSize = '300% 300%';
        cell.style.backgroundPosition = `${col * 50}% ${row * 50}%`;
        correctCount++;
        score += 10;
        soundAcerto.play();
        scoreDiv.textContent = "Pontuação: " + score;

        if (window.draggedPiece && window.draggedPiece.parentElement) {
          window.draggedPiece.parentElement.removeChild(window.draggedPiece);
          window.draggedPiece = null;
        }

        if (correctCount === 9) {
          triggerVictoryEffect();
        }
      } else {
        // Erro
        score -= 5;
        soundErro.play();
        scoreDiv.textContent = "Pontuação: " + score;
      }

      // cleanup ghost
      if (window.dragGhost && window.dragGhost.parentElement) {
        window.dragGhost.parentElement.removeChild(window.dragGhost);
      }
      window.dragGhost = null;
      window.draggedPiece = null;
    });

    // limpa referência caso o arraste termine sem drop
    piece.addEventListener("dragend", () => {
      window.draggedPiece = null;
    });

    piecesDiv.appendChild(piece);
  });
}

// Visual victory effect (no audio)
function triggerVictoryEffect() {
  // add a class to the board for CSS animations
  board.classList.add('victory');
  // create small confetti particles
  createConfetti(20);
  // remove effect after 2.5s
  setTimeout(() => {
    board.classList.remove('victory');
    const confs = document.querySelectorAll('.confetti');
    confs.forEach(c => c.remove());
  }, 2500);
}

function createConfetti(count = 20) {
  const colors = ['#ff6f61','#ffd54f','#81c784','#4fc3f7','#b39ddb'];
  const rect = board.getBoundingClientRect();
  for (let i = 0; i < count; i++) {
    const conf = document.createElement('div');
    conf.className = 'confetti';
    const size = Math.floor(Math.random() * 10) + 6;
    conf.style.width = size + 'px';
    conf.style.height = size + 'px';
    conf.style.background = colors[Math.floor(Math.random() * colors.length)];
    // random position inside board
    const left = rect.left + Math.random() * rect.width;
    conf.style.left = left + 'px';
    conf.style.top = (rect.top + 10) + 'px';
    // random rotation
    conf.style.transform = `rotate(${Math.random()*360}deg)`;
    document.body.appendChild(conf);
    // trigger animation via CSS; each confetti will animate upwards/fade
  }
}

    startBtn.addEventListener("click", () => {
      const level = levelSelect.value;
      startGame(level);
    });

    restartBtn.addEventListener("click", () => {
      const level = levelSelect.value;
      startGame(level);
    });
