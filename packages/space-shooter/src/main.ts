import { Game } from './game/Game';

function startGame() {
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;


	canvas.width = 800;
	canvas.height = 600;

	const game = new Game(canvas);
	game.start();
}

window.addEventListener('DOMContentLoaded', () => {
	startGame();
});

document.getElementById('restartButton')?.addEventListener('click', () => {
	document.getElementById('gameOver')?.classList.add('hidden');
	startGame();
});
