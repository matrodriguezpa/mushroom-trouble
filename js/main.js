// Punto de entrada: conecta los módulos. No contiene lógica de juego.
// Los <script type="module"> se ejecutan con el DOM ya parseado, por eso no hace falta DOMContentLoaded.

import { loadCards } from './data/cardsLoader.js';
import { initStartScreen, setCardsReady, showLoadError } from './ui/startScreen.js';
import { initGameControls } from './ui/gameControls.js';
import { initStackModal } from './ui/views/stackModalView.js';
import { initBoardEvents, startGame } from './ui/gameController.js';

let cardsDb = null;

initStartScreen({ onStart: (config) => startGame({ cardsDb, ...config }) });
initGameControls();
initBoardEvents();
initStackModal();

loadCards()
    .then((cards) => {
        cardsDb = cards;
        setCardsReady(true);
    })
    .catch((err) => {
        console.error(err);
        showLoadError(`No se pudieron cargar las cartas: ${err.message}`);
    });
