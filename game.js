const game = document.getElementById('game');
const valde = document.getElementById('valde');
const scoreDisplay = document.getElementById('score');
const startBtn = document.getElementById('startBtn');
const gameOverModal = document.getElementById('gameOverModal');
const retryBtn = document.getElementById('retryBtn');
const closeBtn = document.getElementById('closeBtn');

let puntos = 0;
let fallos = 0;
let intervaloGotas;
let gotasActivas = [];
let juegoActivo = false;

// 🖱️ Movimiento con el mouse 
game.addEventListener('mousemove', (e) => {
  if (!juegoActivo) return;

  const gameRect = game.getBoundingClientRect();
  const mouseX = e.clientX - gameRect.left;
  const valdeWidth = valde.offsetWidth;
  let nuevaPos = mouseX - valdeWidth / 2;

  nuevaPos = Math.max(0, Math.min(nuevaPos, game.offsetWidth - valdeWidth));
  valde.style.left = nuevaPos + 'px';
});

// 💧 Crear gotas (buenas y malas)
function crearGota() {
  const gota = document.createElement('img');

  // 🔹 Probabilidad de que sea mala
  if (Math.random() > 0.8) { // 20% de probabilidad
    gota.src = 'img/gotaMala.png'; // 💧 imagen de gota mala
    gota.dataset.tipo = 'mala';
  } else {
    gota.src = './imagenes/gotita de agua.png'; // 💧 imagen de gota normal
    gota.dataset.tipo = 'buena';
  }

  gota.classList.add('gota');
  gota.style.left = Math.floor(Math.random() * 370) + 'px';
  game.appendChild(gota);

  let top = 0;
  const intervalo = setInterval(() => {
    top += 5;
    gota.style.top = top + 'px';

    if (top > 570) {
      const valdeLeft = valde.offsetLeft;
      const gotaLeft = gota.offsetLeft;

      if (Math.abs(valdeLeft - gotaLeft) < valde.offsetWidth) {
        // ✅ Atrapar gota
        if (gota.dataset.tipo === 'mala') {
          puntos -= 2; // penaliza solo si la atrapas
        } else {
          puntos++; // buena suma puntos
        }
      } else {
        // ❌ Solo cuenta como fallo si era una gota buena
        if (gota.dataset.tipo === 'buena') {
          fallos++;
        }
      }

      scoreDisplay.textContent = `Puntos: ${puntos} | Fallos: ${fallos}/3`;
      gota.remove();
      clearInterval(intervalo);

      if (fallos >= 3) {
        clearInterval(intervaloGotas);
        detenerGotas();
        juegoActivo = false;

        // 📝 Mostrar mensaje con el total de puntos
        const mensaje = gameOverModal.querySelector('p');
        mensaje.textContent = `💧 ¡Juego terminado! Hiciste un total de ${puntos} puntos. ¿Quieres reintentar la partida?`;

        gameOverModal.style.display = 'flex';
      }
    }
  }, 50);

  gotasActivas.push({ elemento: gota, intervalo });
}

// 🧹 Detener y eliminar todas las gotas activas
function detenerGotas() {
  gotasActivas.forEach(({ elemento, intervalo }) => {
    clearInterval(intervalo);
    elemento.remove();
  });
  gotasActivas = [];
}

// 🪣 Volver Valde al centro
function resetValde() {
  valde.style.left = '160px'; // ajusta según el tamaño del balde
}

// ▶️ Iniciar juego
startBtn.addEventListener('click', () => {
  detenerGotas();
  puntos = 0;
  fallos = 0;
  scoreDisplay.textContent = `Puntos: ${puntos} | Fallos: ${fallos}/3`;
  resetValde();
  juegoActivo = true;
  intervaloGotas = setInterval(crearGota, 1500);
  startBtn.style.display = 'none';
});

// 🔄 Reintentar
retryBtn.addEventListener('click', () => {
  detenerGotas();
  gameOverModal.style.display = 'none';
  puntos = 0;
  fallos = 0;
  scoreDisplay.textContent = `Puntos: ${puntos} | Fallos: ${fallos}/3`;
  resetValde();
  juegoActivo = true;
  intervaloGotas = setInterval(crearGota, 1500);
});

// ❌ Cerrar
closeBtn.addEventListener('click', () => {
  detenerGotas();
  gameOverModal.style.display = 'none';
  resetValde();
  juegoActivo = false;
  startBtn.style.display = 'block';
});