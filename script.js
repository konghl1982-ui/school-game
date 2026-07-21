const $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
const screens = $$(".screen"),
  modal = $("#modal");
let gameOverActive = false;
let teacherMode = false;
let setActive = false;
let setBlockCleared = false;
const tone = (student, teacher) => (teacherMode ? teacher : student);
function applyMode() {
  document.body.classList.toggle("teacher-mode", teacherMode);
  $("#modeToggle").textContent = teacherMode ? "학생 버전" : "선생님 버전";
  $("#heroEyebrow").textContent = tone(
    "우리끼리 게임 한 판",
    "함께 즐기는 게임입니다",
  );
  $("#heroTitle").innerHTML = tone(
    "블록 & 계단<br><span>도전해봐</span>",
    "블록 & 계단<br><span>도전해 보세요</span>",
  );
  $("#heroText").textContent = tone(
    "원하는 게임 골라봐",
    "원하는 게임을 선택해 주세요",
  );
  $("#blockCardText").textContent = tone(
    "5000점 찍기 · 목숨 2개",
    "목표 5,000점 · 목숨 2개",
  );
  $("#stairCardText").textContent = tone(
    "200계단 찍기 · 무료 부활 1번",
    "목표 200계단 · 무료 부활 1회",
  );
  $("#blockPrice").innerHTML = tone(
    "한 판 700원<br><b>클리어하면 300원 할인</b>",
    "이용료는 한 판에 700원입니다.<br><b>클리어 시 300원을 할인해 드립니다.</b>",
  );
  $("#stairPrice").innerHTML = tone(
    "한 판 800원<br><b>클리어하면 400원 할인</b>",
    "이용료는 한 판에 800원입니다.<br><b>클리어 시 400원을 할인해 드립니다.</b>",
  );
  $("#setCardTitle").textContent = tone("두 게임 세트", "두 게임 세트");
  $("#setCardText").textContent = tone(
    "원래 룰 그대로 블록 먼저 하고 무계까지 도전",
    "각 게임의 기존 규칙대로 블록 블라스트 진행 후 무한의 계단에 도전합니다",
  );
  $("#setPrice").innerHTML = tone(
    "세트 1200원<br><b>둘 다 깨면 1000원</b>",
    "세트 이용료는 1,200원입니다.<br><b>두 게임 모두 클리어 시 1,000원으로 할인됩니다.</b>",
  );
  $("#setRules").innerHTML = tone(
    "블록 놓기 +100　판 비우기 +200<br>무계 한 계단 +1<br><b>둘 다 깨면 세트 랭킹 등록</b>",
    "블록 배치 시 +100점　판을 모두 비우면 +200점<br>무한의 계단은 한 계단당 +1점<br><b>두 게임 모두 클리어하면 세트 랭킹에 등록됩니다.</b>",
  );
  $("#setStart").textContent = tone("세트 시작", "세트 시작하기");
  $("#blockStart").textContent = $("#stairStart").textContent = tone(
    "시작",
    "시작하기",
  );
  $("#blockGoal").textContent = tone("5000점 찍기", "목표 5,000점");
  $("#stairGoal").textContent = tone("200계단 찍기", "목표 200계단");
  $("#blockRestart").textContent = $("#stairRestart").textContent = tone(
    "다시 하기",
    "다시 시작",
  );
  $("#blockGuide").textContent = tone(
    "밑에 블록 끌어서 판에 놓으면 됨",
    "아래 블록을 끌어서 판 위에 놓아 주세요",
  );
  $("#currentStairLabel").textContent = tone("지금 계단", "현재 계단");
  $("#turnLabel").textContent = tone("방향 바꾸기", "방향 전환");
  $("#climbLabel").textContent = tone("올라가기", "올라가기");
  $("#keyHelp").textContent = tone(
    "키보드 ← 방향 바꾸기　→ 올라가기",
    "키보드: ← 방향 전환 · → 올라가기",
  );
}
$("#modeToggle").onclick = () => {
  teacherMode = !teacherMode;
  applyMode();
};
function show(id) {
  screens.forEach((s) => s.classList.toggle("active", s.id === id));
  closeModal();
}
function openModal(title, html) {
  $("#modalTitle").textContent = title;
  $("#modalBody").innerHTML = html;
  modal.classList.add("show");
  modal.setAttribute("aria-hidden", "false");
}
function closeModal() {
  gameOverActive = false;
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}
$("#closeModal").onclick = closeModal;
modal.onclick = (e) => {
  if (e.target === modal) closeModal();
};
$$(".home-btn").forEach((b) => (b.onclick = () => show("home")));
$$("[data-start]").forEach(
  (b) =>
    (b.onclick = () =>
      b.dataset.start === "block"
        ? ((setActive = false), startBlock(), show("blockGame"))
        : b.dataset.start === "stairs"
          ? ((setActive = false), startStairs(), show("stairsGame"))
          : startSet()),
);
$$("[data-restart]").forEach(
  (b) =>
    (b.onclick = () =>
      b.dataset.restart === "block" ? startBlock() : startStairs()),
);
$$("[data-rank]").forEach(
  (b) => (b.onclick = () => showRanking(b.dataset.rank)),
);

function ranks(game) {
  return JSON.parse(localStorage.getItem("schoolRanks_" + game) || "[]");
}
function showRanking(game) {
  const names = ranks(game);
  openModal(
    game === "block"
      ? tone("블록 블라스트 깬 사람", "블록 블라스트 클리어 기록")
      : game === "stairs"
        ? tone("무한의 계단 깬 사람", "무한의 계단 클리어 기록")
        : tone("세트 둘 다 깬 사람", "두 게임 세트 클리어 기록"),
    names.length
      ? `<ol class="rank-list">${names.map((n, i) => `<li>${teacherMode ? `${i + 1}.` : `${i + 1}등`} ${safe(n)}</li>`).join("")}</ol>`
      : tone(
          "<p>아직 깬 사람 없음<br>너가 도전 ㄱㄱ</p>",
          "<p>아직 클리어한 기록이 없습니다.<br>첫 기록에 도전해 보세요.</p>",
        ),
  );
}
function safe(t) {
  const d = document.createElement("div");
  d.textContent = t;
  return d.innerHTML;
}
function cleared(game) {
  if (setActive) {
    if (game === "block") {
      setBlockCleared = true;
      showSetNext(true, tone("블록 클리어", "블록 블라스트를 클리어했습니다"));
    } else {
      showSetResult(true);
    }
    return;
  }
  openModal(
    tone("오 깼네 ㅊㅋㅊㅋ", "🎉 목표를 달성하셨습니다"),
    `<div class="confetti">🏆</div><p>${tone("랭킹에 이름 남겨봐", "축하합니다. 랭킹에 이름을 남겨 보세요.")}</p><form class="name-form" id="nameForm"><input id="winnerName" maxlength="10" required placeholder="이름"><button>${tone("등록", "등록하기")}</button></form>`,
  );
  setTimeout(() => {
    $("#nameForm").onsubmit = (e) => {
      e.preventDefault();
      const name = $("#winnerName").value.trim();
      if (!name) return;
      const list = ranks(game);
      list.push(name);
      localStorage.setItem("schoolRanks_" + game, JSON.stringify(list));
      showRanking(game);
    };
  }, 0);
}
function failed(game, msg) {
  if (setActive) {
    if (game === "block") showSetNext(false, msg);
    else showSetResult(false, msg);
    return;
  }
  openModal(
    "게임 오버",
    `<p>${msg}</p><div class="result-actions"><button id="again">${tone("다시 하기", "다시 도전")}</button><button class="ghost" id="goHome">게임 선택</button></div>`,
  );
  gameOverActive = true;
  setTimeout(() => {
    $("#again").onclick = () => {
      closeModal();
      game === "block" ? startBlock() : startStairs();
    };
    $("#goHome").onclick = () => show("home");
  }, 0);
}
function startSet() {
  setActive = true;
  setBlockCleared = false;
  startBlock();
  show("blockGame");
}
function showSetNext(blockSuccess, message) {
  setBlockCleared = blockSuccess;
  openModal(
    tone("블록 게임 끝", "블록 블라스트 종료"),
    `<p>${message}</p><p>${tone("이제 무계 시작", "이제 무한의 계단을 진행해 주세요")}</p><div class="result-actions"><button id="nextSetGame">${tone("무계 시작", "무한의 계단 시작")}</button><button class="ghost" id="endSet">${tone("세트 끝내기", "세트 종료")}</button></div>`,
  );
  setTimeout(() => {
    $("#nextSetGame").onclick = () => {
      closeModal();
      startStairs();
      show("stairsGame");
    };
    $("#endSet").onclick = () => {
      setActive = false;
      show("home");
    };
  }, 0);
}
function showSetResult(stairSuccess, message = "") {
  const bothSuccess = setBlockCleared && stairSuccess;
  const title = tone(
    bothSuccess ? "둘 다 깸 ㅊㅋㅊㅋ" : "세트 끝",
    bothSuccess ? "세트 클리어를 축하합니다" : "세트가 종료되었습니다",
  );
  const priceText = tone(
    bothSuccess
      ? "둘 다 성공해서 1200원에서 1000원 할인"
      : "하나 이상 실패해서 세트 1200원",
    bothSuccess
      ? "두 게임을 모두 클리어하여 1,200원에서 1,000원으로 할인됩니다."
      : "두 게임 중 하나 이상을 클리어하지 못해 세트 이용료는 1,200원입니다.",
  );
  const resultAction = bothSuccess
    ? `<p>${tone("세트 랭킹에 이름 남겨봐", "세트 랭킹에 이름을 남겨 주세요.")}</p><form class="name-form" id="setNameForm"><input id="setWinnerName" maxlength="10" required placeholder="이름"><button>${tone("등록", "등록하기")}</button></form>`
    : `<div class="result-actions"><button id="finishSet">${tone("선택 화면", "게임 선택 화면")}</button></div>`;
  openModal(
    title,
    `${message ? `<p>${message}</p>` : ""}<div class="confetti">${bothSuccess ? "🏆" : "🎮"}</div><p><b>${priceText}</b></p>${resultAction}`,
  );
  setTimeout(() => {
    if (bothSuccess) {
      $("#setNameForm").onsubmit = (e) => {
        e.preventDefault();
        const name = $("#setWinnerName").value.trim();
        if (!name) return;
        const list = ranks("set");
        list.push(name);
        localStorage.setItem("schoolRanks_set", JSON.stringify(list));
        setActive = false;
        showRanking("set");
      };
    } else {
      $("#finishSet").onclick = () => {
        setActive = false;
        show("home");
      };
    }
  }, 0);
}
window.addEventListener("keydown", (e) => {
  if ((e.key === "r" || e.key === "R") && gameOverActive) {
    e.preventDefault();
    show("home");
  }
});

// BLOCK GAME
const shapes = [
  [[0, 0]],
  [
    [0, 0],
    [0, 1],
  ],
  [
    [0, 0],
    [1, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 1],
    [1, 0],
    [1, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [1, 1],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [2, 1],
  ],
  [
    [0, 0],
    [0, 1],
    [0, 2],
    [0, 3],
  ],
  [
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
  ],
];
let board, blockScore, lives, currentPieces, selectedPiece, blockWon;
function startBlock() {
  board = Array.from({ length: 8 }, () => Array(8).fill(0));
  blockScore = 0;
  lives = 2;
  selectedPiece = null;
  blockWon = false;
  makePieces();
  renderBlock();
}
function makePieces() {
  currentPieces = Array.from({ length: 3 }, () => ({
    shape: shapes[Math.floor(Math.random() * shapes.length)],
    used: false,
    color: ["#5267ff", "#ff6e91", "#46d7ac", "#ffad47"][
      Math.floor(Math.random() * 4)
    ],
  }));
}
function renderBlock() {
  const el = $("#blockBoard");
  el.innerHTML = "";
  board.forEach((row, r) =>
    row.forEach((v, c) => {
      const cell = document.createElement("div");
      cell.className = "cell" + (v ? " filled" : "");
      if (v) cell.style.background = v;
      cell.onmouseenter = () => preview(r, c);
      cell.onmouseleave = clearPreview;
      cell.onclick = () => placeBlock(r, c);
      el.appendChild(cell);
    }),
  );
  $("#blockScore").textContent = blockScore.toLocaleString();
  $("#blockLives").textContent = "❤️".repeat(lives) + "🖤".repeat(2 - lives);
  renderPieces();
}
function renderPieces() {
  const box = $("#pieces");
  box.innerHTML = "";
  currentPieces.forEach((p, i) => {
    if (p.used) return;
    const maxR = Math.max(...p.shape.map((x) => x[0])),
      maxC = Math.max(...p.shape.map((x) => x[1]));
    const el = document.createElement("div");
    el.className = "piece" + (selectedPiece === i ? " selected" : "");
    el.style.gridTemplateColumns = `repeat(${maxC + 1},20px)`;
    for (let r = 0; r <= maxR; r++)
      for (let c = 0; c <= maxC; c++) {
        const m = document.createElement("i");
        m.className =
          "mini" + (p.shape.some((x) => x[0] === r && x[1] === c) ? " on" : "");
        if (m.classList.contains("on")) m.style.background = p.color;
        el.appendChild(m);
      }
    el.onpointerdown = (e) => beginDrag(e, i, maxC + 1);
    box.appendChild(el);
  });
}
function beginDrag(e, i, cols) {
  e.preventDefault();
  selectedPiece = i;
  const p = currentPieces[i];
  const ghost = document.createElement("div");
  ghost.className = "drag-ghost";
  ghost.style.gridTemplateColumns = `repeat(${cols},28px)`;
  const maxR = Math.max(...p.shape.map((x) => x[0]));
  const maxC = Math.max(...p.shape.map((x) => x[1]));
  for (let r = 0; r <= maxR; r++)
    for (let c = 0; c <= maxC; c++) {
      const m = document.createElement("i");
      m.className =
        "mini" + (p.shape.some((x) => x[0] === r && x[1] === c) ? " on" : "");
      if (m.classList.contains("on")) m.style.background = p.color;
      ghost.appendChild(m);
    }
  document.body.appendChild(ghost);
  const move = (ev) => {
    ghost.style.left = ev.clientX + "px";
    ghost.style.top = ev.clientY + "px";
    dragPreview(ev.clientX, ev.clientY);
  };
  const up = (ev) => {
    window.removeEventListener("pointermove", move);
    window.removeEventListener("pointerup", up);
    ghost.remove();
    clearPreview();
    const pos = dragCell(ev.clientX, ev.clientY);
    if (pos) placeBlock(pos.r, pos.c);
    else {
      $("#blockGuide").textContent = tone(
        "판에 놓으면 됨",
        "블록을 판 위에 놓아 주세요.",
      );
      selectedPiece = null;
      renderPieces();
    }
  };
  move(e);
  window.addEventListener("pointermove", move);
  window.addEventListener("pointerup", up);
}
function dragCell(x, y) {
  const rect = $("#blockBoard").getBoundingClientRect();
  if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom)
    return null;
  const size = rect.width / 8;
  return {
    r: Math.max(0, Math.min(7, Math.floor((y - rect.top) / size))),
    c: Math.max(0, Math.min(7, Math.floor((x - rect.left) / size))),
  };
}
function dragPreview(x, y) {
  clearPreview();
  const pos = dragCell(x, y);
  if (pos) preview(pos.r, pos.c);
}
function fits(shape, r, c) {
  return shape.every(
    ([dr, dc]) => r + dr < 8 && c + dc < 8 && !board[r + dr][c + dc],
  );
}
function preview(r, c) {
  if (selectedPiece === null) return;
  const p = currentPieces[selectedPiece];
  const ok = fits(p.shape, r, c);
  p.shape.forEach(([dr, dc]) => {
    const cell = $("#blockBoard").children[(r + dr) * 8 + c + dc];
    if (cell) cell.classList.add(ok ? "preview" : "bad");
  });
}
function clearPreview() {
  $$("#blockBoard .cell").forEach((c) => c.classList.remove("preview", "bad"));
}
function placeBlock(r, c) {
  if (selectedPiece === null) {
    $("#blockGuide").textContent = tone(
      "일단 밑에 블록부터 고르면 됨",
      "먼저 아래 블록을 선택해 주세요.",
    );
    return;
  }
  const p = currentPieces[selectedPiece];
  if (!fits(p.shape, r, c)) {
    selectedPiece = null;
    $("#blockGuide").textContent = tone(
      "이 자리는 못 놓음 딴 데 ㄱㄱ",
      "이 자리에는 놓을 수 없습니다. 다른 자리에 놓아 주세요.",
    );
    renderBlock();
    return;
  }
  p.shape.forEach(([dr, dc]) => (board[r + dr][c + dc] = p.color));
  p.used = true;
  blockScore += 100;
  clearLines();
  if (board.every((row) => row.every((v) => !v))) {
    blockScore += 200;
    $("#blockGuide").textContent = tone(
      "판 다 비움 +200점",
      "판을 모두 비웠습니다. +200점",
    );
  } else
    $("#blockGuide").textContent = tone(
      "오 성공 +100점",
      "블록 놓기에 성공했습니다. +100점",
    );
  selectedPiece = null;
  if (blockScore >= 5000 && !blockWon) {
    blockWon = true;
    renderBlock();
    setTimeout(() => cleared("block"), 300);
    return;
  }
  if (currentPieces.every((x) => x.used)) makePieces();
  renderBlock();
  if (!hasAnyMove()) {
    loseBlockLife();
  }
}
function loseBlockLife() {
  lives--;
  if (!lives) {
    renderBlock();
    setTimeout(
      () =>
        failed(
          "block",
          tone(
            `놓을 자리 없어서 목숨 다 씀 최종 ${blockScore.toLocaleString()}점`,
            `놓을 자리가 없어 목숨을 모두 사용했습니다. 최종 점수는 ${blockScore.toLocaleString()}점입니다.`,
          ),
        ),
      300,
    );
    return;
  }
  board = Array.from({ length: 8 }, () => Array(8).fill(0));
  selectedPiece = null;
  makePieces();
  renderBlock();
  $("#blockGuide").textContent = tone(
    "놓을 자리 없어서 목숨 하나 줄음 점수 그대로 새 판 시작",
    "놓을 자리가 없어 목숨이 1개 줄었습니다. 점수는 유지하고 새 판으로 시작합니다.",
  );
}
function clearLines() {
  const rows = [],
    cols = [];
  for (let r = 0; r < 8; r++) if (board[r].every(Boolean)) rows.push(r);
  for (let c = 0; c < 8; c++) if (board.every((row) => row[c])) cols.push(c);
  rows.forEach((r) => board[r].fill(0));
  cols.forEach((c) => board.forEach((row) => (row[c] = 0)));
}
function hasAnyMove() {
  return currentPieces
    .filter((p) => !p.used)
    .some((p) => {
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) if (fits(p.shape, r, c)) return true;
      return false;
    });
}

// INFINITE STAIRS
const canvas = $("#stairsCanvas"),
  ctx = canvas.getContext("2d");
let stairs, playerStep, facing, stairScore, stairsPlaying;
let visualStep = 0,
  stairRaf = 0,
  cameraWorldX = 0,
  cameraY = 470;
let timeLeft = 100,
  gaugeRaf = 0,
  gaugeLast = 0,
  reviveUsed = false;
function startStairs() {
  // 첫 계단은 캐릭터가 처음 바라보는 오른쪽에 고정한다.
  // 따라서 게임 시작 직후에는 방향 전환 없이 바로 올라갈 수 있다.
  stairs = [0, 1];
  for (let i = 2; i < 520; i++)
    stairs.push(stairs[i - 1] + (Math.random() < 0.5 ? -1 : 1));
  playerStep = 0;
  visualStep = 0;
  cameraWorldX = 0;
  cameraY = 470;
  cancelAnimationFrame(stairRaf);
  stairRaf = 0;
  facing = 1;
  stairScore = 0;
  stairsPlaying = true;
  timeLeft = 100;
  reviveUsed = false;
  $("#timeGaugeFill").style.transform = "scaleX(1)";
  cancelAnimationFrame(gaugeRaf);
  gaugeLast = performance.now();
  gaugeRaf = requestAnimationFrame(updateTimeGauge);
  $("#stairScore").textContent = 0;
  drawStairs();
}
function stairAction(turn) {
  if (!stairsPlaying) return;
  let nextFacing = turn ? -facing : facing;
  const needed = stairs[playerStep + 1] - stairs[playerStep];
  if (nextFacing !== needed) {
    stairsPlaying = false;
    drawStairs();
    setTimeout(
      () =>
        handleStairFailure(
          tone(
            `${stairScore}계단에서 방향 잘못 누름`,
            `${stairScore}계단에서 방향을 잘못 선택했습니다.`,
          ),
        ),
      180,
    );
    return;
  }
  facing = nextFacing;
  playerStep++;
  stairScore++;
  timeLeft = Math.min(100, timeLeft + 7);
  $("#stairScore").textContent = stairScore;
  animateStairMove();
  if (stairScore >= 200) {
    stairsPlaying = false;
    setTimeout(() => cleared("stairs"), 250);
  }
}
function updateTimeGauge(now) {
  if (!stairsPlaying) return;
  const dt = Math.min(100, now - gaugeLast);
  gaugeLast = now;
  timeLeft = Math.max(0, timeLeft - (dt / 10000) * 100);
  $("#timeGaugeFill").style.transform = `scaleX(${timeLeft / 100})`;
  drawStairs();
  if (timeLeft <= 0) {
    stairsPlaying = false;
    handleStairFailure(
      tone(
        `시간 끝 ${stairScore}계단까지 올라감`,
        `시간이 끝났습니다. ${stairScore}계단까지 올라갔습니다.`,
      ),
    );
    return;
  }
  gaugeRaf = requestAnimationFrame(updateTimeGauge);
}
function handleStairFailure(message) {
  if (!reviveUsed) {
    openModal(
      tone("무료 부활 남음", "무료 부활 기회"),
      `<div class="confetti">⚡</div><p>${message}</p><p>${tone("한 판에 한 번 무료 부활 가능", "한 판에 한 번 무료 부활을 사용할 수 있습니다.")}</p><div class="result-actions"><button id="freeRevive">${tone("부활", "부활하기")}</button><button class="ghost" id="giveUp">${tone("그만하기", "그만하기")}</button></div>`,
    );
    setTimeout(() => {
      $("#freeRevive").onclick = () => {
        reviveUsed = true;
        timeLeft = 60;
        $("#timeGaugeFill").style.transform = "scaleX(.6)";
        stairsPlaying = true;
        gaugeLast = performance.now();
        closeModal();
        gaugeRaf = requestAnimationFrame(updateTimeGauge);
        drawStairs();
      };
      $("#giveUp").onclick = () =>
        failed(
          "stairs",
          tone(
            `${stairScore}계단까지 올라감`,
            `${stairScore}계단까지 올라갔습니다.`,
          ),
        );
    }, 0);
    return;
  }
  failed("stairs", message);
}
function animateStairMove() {
  // 연타해도 애니메이션을 다시 시작하지 않고 최신 위치를 부드럽게 따라간다.
  if (stairRaf) return;
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(40, now - last);
    last = now;
    const follow = 1 - Math.exp(-dt / 34);
    visualStep += (playerStep - visualStep) * follow;
    const characterWorldX = stairWorldX(visualStep);
    const cameraFollowX = 1 - Math.exp(-dt / 95);
    cameraWorldX += (characterWorldX - cameraWorldX) * cameraFollowX;
    const wantedCameraY = Math.max(470, visualStep * 54 + 250);
    const cameraFollowY = 1 - Math.exp(-dt / 70);
    cameraY += (wantedCameraY - cameraY) * cameraFollowY;
    drawStairs(visualStep, 0);
    if (
      Math.abs(playerStep - visualStep) > 0.002 ||
      Math.abs(characterWorldX - cameraWorldX) > 0.002 ||
      Math.abs(wantedCameraY - cameraY) > 0.05
    )
      stairRaf = requestAnimationFrame(frame);
    else {
      visualStep = playerStep;
      stairRaf = 0;
      drawStairs(visualStep, 0);
    }
  };
  stairRaf = requestAnimationFrame(frame);
}
function stairWorldX(step) {
  const low = Math.max(0, Math.floor(step));
  const high = Math.min(stairs.length - 1, Math.ceil(step));
  return stairs[low] + (stairs[high] - stairs[low]) * (step - low);
}
$("#turnBtn").onclick = () => stairAction(true);
$("#climbBtn").onclick = () => stairAction(false);
window.addEventListener("keydown", (e) => {
  if (!$("#stairsGame").classList.contains("active")) return;
  if (e.key === "ArrowLeft") {
    e.preventDefault();
    stairAction(true);
  }
  if (e.key === "ArrowRight") {
    e.preventDefault();
    stairAction(false);
  }
});
function drawStairs(viewStep = visualStep, hop = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  const sky = ctx.createLinearGradient(0, 0, 0, 570);
  sky.addColorStop(0, "#42ade9");
  sky.addColorStop(0.65, "#ccefff");
  sky.addColorStop(1, "#e9f4d5");
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, 480, 570);
  ctx.fillStyle = "#ffffffaa";
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.arc(32 + i * 76, 58 + (i % 2) * 25, 23, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "#7890a8";
  for (let i = 0; i < 9; i++) {
    const h = 75 + (i % 4) * 34;
    ctx.fillStyle = "#7890a8";
    ctx.fillRect(i * 58, 390 - h, 48, h);
    ctx.fillStyle = "#e9f7ff";
    for (let y = 402 - h; y < 375; y += 22)
      for (let x = i * 58 + 8; x < i * 58 + 42; x += 17)
        ctx.fillRect(x, y, 7, 10);
  }
  ctx.fillStyle = "#72bf54";
  ctx.fillRect(0, 390, 480, 180);
  // 게임 화면 안쪽에 고정되는 시간 게이지
  ctx.save();
  ctx.fillStyle = "#ffffffdd";
  ctx.strokeStyle = "#18213b";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.roundRect(54, 18, 372, 38, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#18213b";
  ctx.font = "900 14px Noto Sans KR";
  ctx.textAlign = "left";
  ctx.fillText("TIME", 68, 43);
  ctx.fillStyle = "#d9dde5";
  ctx.beginPath();
  ctx.roundRect(116, 29, 294, 16, 8);
  ctx.fill();
  const gaugeWidth = Math.max(0, 294 * (timeLeft / 100));
  if (gaugeWidth > 0) {
    ctx.fillStyle =
      timeLeft > 55 ? "#49d98e" : timeLeft > 25 ? "#ffd84d" : "#f04444";
    ctx.beginPath();
    ctx.roundRect(116, 29, gaugeWidth, 16, Math.min(8, gaugeWidth / 2));
    ctx.fill();
  }
  ctx.restore();
  const stepY = 54,
    stepX = 58;
  const viewX = stairWorldX(viewStep);
  const centerX = 240 - cameraWorldX * stepX;
  for (
    let i = Math.max(0, Math.floor(viewStep) - 2);
    i < Math.min(stairs.length, Math.ceil(viewStep) + 9);
    i++
  ) {
    const x = centerX + stairs[i] * stepX,
      y = cameraY - i * stepY;
    // 입체적인 돌계단: 윗면, 앞면, 옆면을 따로 그린다.
    ctx.strokeStyle = "#3d4650";
    ctx.lineWidth = 3;
    ctx.fillStyle =
      i === playerStep
        ? "#d9c76d"
        : i === playerStep + 1
          ? "#8fe0ef"
          : "#aeb5b7";
    ctx.beginPath();
    ctx.moveTo(x - 52, y);
    ctx.lineTo(x + 38, y);
    ctx.lineTo(x + 52, y + 11);
    ctx.lineTo(x - 38, y + 11);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle =
      i === playerStep
        ? "#a89445"
        : i === playerStep + 1
          ? "#4e9daf"
          : "#747d80";
    ctx.beginPath();
    ctx.moveTo(x - 38, y + 11);
    ctx.lineTo(x + 52, y + 11);
    ctx.lineTo(x + 52, y + 34);
    ctx.lineTo(x - 38, y + 34);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.strokeStyle = "#596164";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 20, y + 12);
    ctx.lineTo(x - 20, y + 33);
    ctx.moveTo(x + 17, y + 12);
    ctx.lineTo(x + 17, y + 33);
    ctx.stroke();
  }
  const climbHop = Math.sin((viewStep % 1) * Math.PI) * 12;
  const px = 240 + (viewX - cameraWorldX) * stepX,
    py = cameraY - viewStep * stepY - 45 - hop - climbHop;
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(facing, 1);
  ctx.strokeStyle = "#172038";
  ctx.lineWidth = 3;
  // 얼굴과 귀
  ctx.fillStyle = "#f0b27d";
  ctx.beginPath();
  ctx.arc(0, -27, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(-18, -26, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // 머리카락, 눈, 코, 미소
  ctx.fillStyle = "#2b211c";
  ctx.beginPath();
  ctx.arc(-2, -34, 17, Math.PI, 0);
  ctx.lineTo(15, -32);
  ctx.lineTo(6, -42);
  ctx.lineTo(-15, -39);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#172038";
  ctx.beginPath();
  ctx.arc(7, -28, 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#8a4d38";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(15, -23);
  ctx.lineTo(20, -20);
  ctx.lineTo(14, -18);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(7, -18, 7, 0.15, 1.2);
  ctx.stroke();
  // 정장 몸통, 셔츠, 넥타이
  ctx.strokeStyle = "#172038";
  ctx.lineWidth = 3;
  ctx.fillStyle = "#243b67";
  ctx.beginPath();
  ctx.roundRect(-19, -8, 38, 43, 6);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.moveTo(-9, -6);
  ctx.lineTo(0, 14);
  ctx.lineTo(9, -6);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "#dc3d45";
  ctx.beginPath();
  ctx.moveTo(0, -2);
  ctx.lineTo(-4, 17);
  ctx.lineTo(0, 24);
  ctx.lineTo(4, 17);
  ctx.closePath();
  ctx.fill();
  // 걷는 팔과 다리, 구두
  ctx.strokeStyle = "#243b67";
  ctx.lineWidth = 9;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(-16, 1);
  ctx.lineTo(-29, 15);
  ctx.moveTo(16, 2);
  ctx.lineTo(29, -6);
  ctx.stroke();
  ctx.strokeStyle = "#1c2947";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(-9, 32);
  ctx.lineTo(-17, 49);
  ctx.moveTo(9, 32);
  ctx.lineTo(20, 45);
  ctx.stroke();
  ctx.strokeStyle = "#191919";
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(-18, 49);
  ctx.lineTo(-28, 49);
  ctx.moveTo(20, 45);
  ctx.lineTo(29, 45);
  ctx.stroke();
  ctx.lineCap = "butt";
  ctx.restore();
  ctx.fillStyle = "#18213b";
  ctx.font = "900 16px Noto Sans KR";
  ctx.textAlign = "center";
  ctx.fillText(facing === 1 ? "지금 오른쪽 봄 →" : "← 지금 왼쪽 봄", 240, 535);
}
function roundRect(x, y, w, h, r, fill, stroke) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fill) ctx.fill();
  if (stroke) ctx.stroke();
}

startBlock();
applyMode();
show("home");
