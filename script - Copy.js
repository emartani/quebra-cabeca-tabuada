const images = Array.from({ length: 10 }, (_, i) => `https://picsum.photos/300?random=${i+1}`);
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
const soundVitoria = new Audio("https://actions.google.com/sounds/v1/cartoon/slide_whistle_to_drum_hit.ogg");

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
        cell.style.backgroundPosition = `-${col * 100}px -${row * 100}px`;
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
          soundVitoria.play();
          alert("🎉 Quebra-cabeça completo!");
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

    // Imagem recortada na posição do índice
    const img = document.createElement("img");
    img.src = imgURL;
    const row = Math.floor(index / 3);
    const col = index % 3;
    img.style.objectFit = "none";
    img.style.objectPosition = `-${col * 100}px -${row * 100}px`;

    // Rótulo da conta
    const label = document.createElement("div");
    label.className = "label";
    label.textContent = q;

    piece.appendChild(img);
    piece.appendChild(label);

    // Drag & Drop: envia resultado e índice do recorte
    piece.addEventListener("dragstart", e => {
      // guarda referência para podermos removê-la no drop
      window.draggedPiece = piece;
      e.dataTransfer.setData("text/plain", String(a));
      e.dataTransfer.setData("pieceIndex", String(index));
    });

    // limpa referência caso o arraste termine sem drop
    piece.addEventListener("dragend", () => {
      window.draggedPiece = null;
    });

    piecesDiv.appendChild(piece);
  });
}

    startBtn.addEventListener("click", () => {
      const level = levelSelect.value;
      startGame(level);
    });

    restartBtn.addEventListener("click", () => {
      const level = levelSelect.value;
      startGame(level);
    });
