import { Game } from './game/Game';

function startGame() {
	const canvas = document.getElementById('gameCanvas') as HTMLCanvasElement;

	// Set fixed size for predictable gameplay
	canvas.width = 800;
	canvas.height = 600;

	const game = new Game(canvas);
	game.start(); // Add this line to start the game loop
}

// Start game when page is fully loaded
window.addEventListener('DOMContentLoaded', () => {
	startGame();
});

// Handle restart button
document.getElementById('restartButton')?.addEventListener('click', () => {
	document.getElementById('gameOver')?.classList.add('hidden'); // Hide game over screen
	startGame();
});
