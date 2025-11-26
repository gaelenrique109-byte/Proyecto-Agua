// Elementos principales
const game = document.getElementById('game');
const valde = document.getElementById('valde');
const scoreDisplay = document.getElementById('score');

// Botones UI
const startBtn = document.getElementById('startBtn');
const abrirInstruccionesBtn = document.getElementById('abrirInstrucciones');
const cerrarInstruccionesBtn = document.getElementById('cerrarInstrucciones');

// Instrucciones y modal
const instrucciones = document.getElementById('instrucciones');
const gameOverModal = document.getElementById('gameOverModal');
const retryBtn = document.getElementById('retryBtn');
const closeBtn = document.getElementById('closeBtn');

// Estado del juego
let puntos = 0;
let fallos = 0;
let intervaloGotas = null;
let gotasActivas = [];
let juegoActivo = false;

// -----------------------------
// Controles de movimiento
// -----------------------------

// Movimiento con mouse
game.addEventListener('mousemove', (e) => {
  if (!juegoActivo) return;
  const gameRect = game.getBoundingClientRect();
  const mouseX = e.clientX - gameRect.left;
  moverValde(mouseX);
});

// Movimiento con touch (móvil)
game.addEventListener('touchmove', (e) => {
  if (!juegoActivo) return;
  const gameRect = game.getBoundingClientRect();
  const touchX = e.touches[0].clientX - gameRect.left;
  moverValde(touchX);
});

// Mover balde dentro de límites
function moverValde(posX) {
  const valdeWidth = valde.offsetWidth;
  let nuevaPos = posX - valdeWidth / 2;
  nuevaPos = Math.max(0, Math.min(nuevaPos, game.offsetWidth - valdeWidth));
  valde.style.left = nuevaPos + 'px';
}

// Centrar balde
function resetValde() {
  valde.style.left = (game.offsetWidth / 2 - valde.offsetWidth / 2) + 'px';
}

// -----------------------------
// Lógica de gotas
// -----------------------------

function crearGota() {
  const gota = document.createElement('img');

  // 20% mala, 80% buena
  if (Math.random() > 0.8) {
    gota.src = 'img/gotaMala.png';
    gota.dataset.tipo = 'mala';
  } else {
    gota.src = './imagenes/gotita de agua.png';
    gota.dataset.tipo = 'buena';
  }

  gota.classList.add('gota');
  gota.style.left = Math.floor(Math.random() * (game.offsetWidth - 30)) + 'px';
  game.appendChild(gota);

  let top = 0;
  const intervalo = setInterval(() => {
    top += 5;
    gota.style.top = top + 'px';

    // 🔹 Detectar colisión en cada paso con margen extra
    const valdeRect = valde.getBoundingClientRect();
    const gotaRect = gota.getBoundingClientRect();
    if (
        gotaRect.bottom >= valdeRect.top + valdeRect.height / 2 && 
        gotaRect.left < valdeRect.right &&
        gotaRect.right > valdeRect.left)
     {
      // Colisión detectada
      if (gota.dataset.tipo === 'mala') {
        puntos -= 2;
      } else {
        puntos++;
      }

      scoreDisplay.textContent = `Puntos: ${puntos} | Fallos: ${fallos}/3`;
      gota.remove();
      clearInterval(intervalo);
    }

    // 🔹 Si la gota pasa el área de juego sin atrapar
    if (top > game.offsetHeight - 30) {
      if (gota.dataset.tipo === 'buena') {
        fallos++;
      }
      scoreDisplay.textContent = `Puntos: ${puntos} | Fallos: ${fallos}/3`;
      gota.remove();
      clearInterval(intervalo);

      if (fallos >= 3) terminarJuego();
    }
  }, 50);

  gotasActivas.push({ elemento: gota, intervalo });
}

// Detener y limpiar gotas
function detenerGotas() {
  gotasActivas.forEach(({ elemento, intervalo }) => {
    clearInterval(intervalo);
    if (elemento && elemento.parentNode) elemento.remove();
  });
  gotasActivas = [];
}

// -----------------------------
// Ciclo de juego (inicio/fin)
// -----------------------------

function iniciarJuego() {
  detenerGotas();
  if (intervaloGotas) clearInterval(intervaloGotas);

  puntos = 0;
  fallos = 0;
  scoreDisplay.textContent = `Puntos: ${puntos} | Fallos: ${fallos}/3`;
  resetValde();

  juegoActivo = true;
  intervaloGotas = setInterval(crearGota, 1500);
  startBtn.style.display = 'none';
}

function terminarJuego() {
  if (intervaloGotas) clearInterval(intervaloGotas);
  detenerGotas();
  juegoActivo = false;

  const mensaje = gameOverModal.querySelector('p');
  mensaje.textContent = `💧 ¡Juego terminado! Hiciste un total de ${puntos} puntos. ¿Quieres reintentar la partida?`;

  gameOverModal.style.display = 'flex';
}

// -----------------------------
// Eventos UI
// -----------------------------

// Iniciar juego
startBtn.addEventListener('click', iniciarJuego);

// Reintentar
retryBtn.addEventListener('click', () => {
  gameOverModal.style.display = 'none';
  iniciarJuego();
});

// Cerrar modal
closeBtn.addEventListener('click', () => {
  detenerGotas();
  if (intervaloGotas) clearInterval(intervaloGotas);
  gameOverModal.style.display = 'none';
  resetValde();
  juegoActivo = false;
  startBtn.style.display = 'block';
});

// Cerrar instrucciones (arriba)
cerrarInstruccionesBtn.addEventListener('click', () => {
  instrucciones.style.display = 'none';
  abrirInstruccionesBtn.disabled = false; // reactivar botón
});

// Abrir instrucciones (botón al lado de iniciar)
abrirInstruccionesBtn.addEventListener('click', () => {
  instrucciones.style.display = 'block';
  abrirInstruccionesBtn.disabled = true; // desactivar mientras están abiertas
});

// Estado inicial
window.addEventListener('load', () => {
  resetValde();
  instrucciones.style.display = 'none'; // ocultas al inicio
  abrirInstruccionesBtn.disabled = false;
});
