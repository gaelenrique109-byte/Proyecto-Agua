// Conectamos los elementos HTML con el JS
const game = document.getElementById('game');       // Área donde ocurre el juego
const valde = document.getElementById('valde');     // El balde que atrapa gotas
const scoreDisplay = document.getElementById('score'); // Muestra puntos y fallos

// Botones de control
const startBtn = document.getElementById('startBtn');               // Botón azul para iniciar juego
const abrirInstruccionesBtn = document.getElementById('abrirInstrucciones'); // Botón verde para abrir instrucciones
const cerrarInstruccionesBtn = document.getElementById('cerrarInstrucciones'); // Botón rojo para cerrar instrucciones

// Ventanas de interfaz
const instrucciones = document.getElementById('instrucciones'); // Caja de instrucciones
const gameOverModal = document.getElementById('gameOverModal'); // Modal que aparece al perder
const retryBtn = document.getElementById('retryBtn');           // Botón para reintentar
const closeBtn = document.getElementById('closeBtn');           // Botón para cerrar el modal
//  Carga del sonido sonido de atrapada
const sonidoGota = new Audio('./sonidos/sonido-gota.mp3');


// Variables que guardan el estado del juego
let puntos = 0;             // Puntos acumulados
let fallos = 0;             // Fallos cometidos
let intervaloGotas = null;  // Intervalo que genera gotas cada cierto tiempo
let gotasActivas = [];      // Lista de gotas que están cayendo
let juegoActivo = false;    // Indica si el juego está en marcha

// Mueve el balde con el mouse
game.addEventListener('mousemove', (e) => {
  if (!juegoActivo) return;
  const gameRect = game.getBoundingClientRect();//Obtiene las coordenadas y dimensiones del área de juego en la pantalla
  const mouseX = e.clientX - gameRect.left;
  // e.clientX → posición horizontal del cursor en la ventana
  // Se resta gameRect.left para convertir esa posición a coordenadas relativas del área de juego
  //Calcula las posiciones 
  moverValde(mouseX);
});

// Mueve el balde con el dedo (pantalla táctil)
game.addEventListener('touchmove', (e) => {
  if (!juegoActivo) return; //Para que el juego no haga nada si es que esta inactivo
  const gameRect = game.getBoundingClientRect();
  //Obtiene las coordenadas y dimensiones del área de juego en la pantalla
  const touchX = e.touches[0].clientX - gameRect.left;
  moverValde(touchX);
  //Llama a la función que mueve el balde a esa posición
});

// Calcula la nueva posición del balde y lo mantiene dentro del área
function moverValde(posX) {
  const valdeWidth = valde.offsetWidth;
  //Calcula la posicion
  let nuevaPos = posX - valdeWidth / 2;
  //Asegura que nunca pase del borde derecho o izquierdo
  nuevaPos = Math.max(0, Math.min(nuevaPos, game.offsetWidth - valdeWidth));
  valde.style.left = nuevaPos + 'px';
}

// Centra el balde al inicio o al reiniciar
function resetValde() {
  valde.style.left = (game.offsetWidth / 2 - valde.offsetWidth / 2) + 'px'; //Calcula la resolucion de la pantalla para qeu siempre quede en medio
}

//La funcion de creacion de gotas
function crearGota() {
  const gota = document.createElement('img'); // Crea una nueva imagen

  // Decide si es una gota buena o un objeto contaminante
  if (Math.random() > 0.8) {
    gota.src = './imagenes/Grifo.png'; // Imagen de basura (objeto que resta puntos)
    gota.dataset.tipo = 'mala';
  } else {
    gota.src = './imagenes/gotita de agua.png'; // Imagen de gota buena
    gota.dataset.tipo = 'buena';
  }

  // Posición inicial aleatoria
  gota.classList.add('gota');
  gota.style.left = Math.floor(Math.random() * (game.offsetWidth - 30)) + 'px';
  game.appendChild(gota);

  // Movimiento hacia abajo
  let top = 0;
  const intervalo = setInterval(() => {
    top += 5; // Cada ciclo baja 5 píxeles
    gota.style.top = top + 'px'; //Actualiza la posicion de la gotita

    // Detecta si la gota entra al balde 
    const valdeRect = valde.getBoundingClientRect(); // Hitbox del balde
    const gotaRect = gota.getBoundingClientRect(); // Hitbox de la gota

    if (
      gotaRect.bottom >= valdeRect.top + valdeRect.height / 2 &&
      gotaRect.left < valdeRect.right &&
      gotaRect.right > valdeRect.left
    ) {
      // Si es mala, resta puntos; si es agua, suma
      if (gota.dataset.tipo === 'mala') {
        puntos -= 2;
      } else {
        puntos++;
        sonidoGota.currentTime = 0; // Reinicia el sonido si ya se estaba reproduciendo
        sonidoGota.play();// Reproduce el sonido

      }

      // Actualiza el marcador
      scoreDisplay.textContent = `Puntos: ${puntos} | Fallos: ${fallos}/3`;
      gota.remove(); // Elimina la gota
      clearInterval(intervalo); // Detiene su movimiento
    }

    // Si la gota buena pasa sin atrapar, cuenta como fallo
    if (top > game.offsetHeight - 30) {
      if (gota.dataset.tipo === 'buena') { //Detecta si la gotita que no paso por el valde es buena
        fallos++; //Suma a los fallos
      }
      scoreDisplay.textContent = `Puntos: ${puntos} | Fallos: ${fallos}/3`;
      gota.remove(); //Elimina la gota que este abajo para que no se quede al final
      clearInterval(intervalo); //Detiene su movimiento

      // Si se acumulan 3 fallos, termina el juego
      if (fallos >= 3) terminarJuego();
    }
  }, 50);

  // Guarda la gota activa (gotas que se van creando)
  gotasActivas.push({ elemento: gota, intervalo });
}

// Elimina todas las gotas activas del juego
function detenerGotas() {
   //Recorre la lista de gotas activas (cada gota tiene su elemento y su intervalo de movimiento)
  gotasActivas.forEach(({ elemento, intervalo }) => {
    clearInterval(intervalo); //Elimina el intervalo que hacia que las gotitas fueran hacia abajo 
    if (elemento && elemento.parentNode) elemento.remove();
  });
  gotasActivas = [];
}


// Inicia el juego
function iniciarJuego() {
  detenerGotas(); // Limpia gotas anteriores en la pantalla
  if (intervaloGotas) clearInterval(intervaloGotas);

  // Reinicia puntos y fallos despues de la partida
  puntos = 0;
  fallos = 0;
  scoreDisplay.textContent = `Puntos: ${puntos} | Fallos: ${fallos}/3`;//Elimina el registro 
  resetValde(); //Resetea el valde para que aparesca en el inicio

  juegoActivo = true;
  intervaloGotas = setInterval(crearGota, 1500); // Crea gotas cada 1.5 segundos
  startBtn.style.display = 'none'; // Oculta el botón de iniciar
}

// Termina el juego y muestra el modal
function terminarJuego() {
  if (intervaloGotas) clearInterval(intervaloGotas); // Detiene el intervalo que estaba generando nuevas gotas
  detenerGotas();// Elimina todas las gotas que aún estaban cayendo
  juegoActivo = false;//Cambia el estado del juego a inactivo para que no caigan gotas
  const mensaje = gameOverModal.querySelector('p'); // Busca el <p> dentro del modal para mostrar un mensaje
  mensaje.textContent = `💧 ¡Juego terminado! Hiciste un total de ${puntos} puntos. ¿Quieres reintentar la partida?`; 
  // Actualiza el texto del modal con los puntos obtenidos en la partida
  gameOverModal.style.display = 'flex';// Muestra el modal en pantalla o ventana emergente de fin del juego
}

// Botón para iniciar el juego 
startBtn.addEventListener('click', iniciarJuego);//Evento para cuando el jugador quiera jugar de click y iniciel el juego

// Botón para reintentar después de perder
retryBtn.addEventListener('click', () => {
  gameOverModal.style.display = 'none'; // Oculta el modal de juego terminado
  iniciarJuego();
});

// Botón para cerrar el modal
closeBtn.addEventListener('click', () => {
  detenerGotas();                               //Elimina todas las gotas activas que estén cayendo
  if (intervaloGotas) clearInterval(intervaloGotas); //Detiene que se genera mas gotas nuevas gotas
  gameOverModal.style.display = 'none';         // Oculta la ventana modal de "Juego terminado"
  resetValde();                                 // Centra el balde de nuevo en el área de juego
  juegoActivo = false;                          // Marca que el juego ya no está en marcha
  startBtn.style.display = 'block';             // Vuelve a mostrar el botón azul de "Iniciar Juego"
});

// Botón para cerrar instrucciones
cerrarInstruccionesBtn.addEventListener('click', () => {
  instrucciones.style.display = 'none'; //Oculta la ventana de instrcciones
  abrirInstruccionesBtn.disabled = false; //Hace que el boton instrucciones vuelva
});

// Botón para abrir instrucciones
abrirInstruccionesBtn.addEventListener('click', () => {
  instrucciones.style.display = 'block';// Hace que aparesca el cuadrito
  abrirInstruccionesBtn.disabled = true; //Hace que desaparesca el boton instrcciones por mientras que estan las instrucciones
});

// Estado inicial al cargar la página
window.addEventListener('load', () => {
  resetValde(); // Centra el balde para que aparesca centrado cuando apenas entras
  instrucciones.style.display = 'none'; // Oculta instrucciones al inicio
  abrirInstruccionesBtn.disabled = false; //Activa el botón de abrir instrucciones para que se pueda usar
});
