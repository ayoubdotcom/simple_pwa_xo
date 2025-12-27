const cells = Array.from(document.querySelectorAll('.cell'));
const currentPlayerEl = document.getElementById('currentPlayer');
const scoreXEl = document.getElementById('scoreX');
const scoreOEl = document.getElementById('scoreO');
const resetBtn = document.getElementById('reset');
const messageEl = document.getElementById('message');

let board = Array(9).fill('');
let current = 'X';
let scores = JSON.parse(localStorage.getItem('xo-scores') || '{"X":0,"O":0}');

function render() {
  cells.forEach((c,i)=> c.textContent = board[i]);
  currentPlayerEl.textContent = current;
  scoreXEl.textContent = scores.X;
  scoreOEl.textContent = scores.O;
}

function checkWinner(b){
  const wins = [
    [0,1,2],[3,4,5],[6,7,8],
    [0,3,6],[1,4,7],[2,5,8],
    [0,4,8],[2,4,6]
  ];
  for(const [a,b1,c] of wins){
    if(b[a] && b[a] === b[b1] && b[a] === b[c]) return b[a];
  }
  if(b.every(Boolean)) return 'draw';
  return null;
}

function showMessage(text, timeout=1500){
  messageEl.classList.remove('hidden');
  messageEl.innerHTML = `<div class="message-box">${text}</div>`;
  setTimeout(()=>{messageEl.classList.add('hidden');messageEl.innerHTML=''}, timeout);
}

function handleClick(e){
  const idx = Number(e.currentTarget.dataset.index);
  if(board[idx] || checkWinner(board)) return;
  board[idx] = current;
  const result = checkWinner(board);
  if(result){
    if(result === 'draw'){
      showMessage('Match nul');
    } else {
      scores[result]++;
      localStorage.setItem('xo-scores', JSON.stringify(scores));
      showMessage(`${result} gagne !`);
    }
    // reset for next round after short delay
    setTimeout(()=>{board = Array(9).fill(''); render();}, 700);
  } else {
    current = current === 'X' ? 'O' : 'X';
  }
  render();
}

cells.forEach(c=> c.addEventListener('click', handleClick));
resetBtn.addEventListener('click', ()=>{
  board = Array(9).fill('');
  scores = {X:0,O:0};
  localStorage.setItem('xo-scores', JSON.stringify(scores));
  render();
});

render();

// Service worker registration
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('sw.js').catch(()=>{});
}

// Basic beforeinstallprompt handling (optional)
let deferredPrompt;
const installBtn = document.getElementById('install');

window.addEventListener('beforeinstallprompt', (e)=>{
  e.preventDefault();
  deferredPrompt = e;
  if(installBtn) installBtn.classList.remove('hidden');
});

if(installBtn){
  installBtn.addEventListener('click', async ()=>{
    if(!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if(choice && choice.outcome === 'accepted'){
      showMessage('Installation acceptée — merci !');
    } else {
      showMessage("Installation refusée");
    }
    deferredPrompt = null;
    installBtn.classList.add('hidden');
  });
}
