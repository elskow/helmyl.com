interface Todo {
	id: number;
	text: string;
	completed: boolean;
}

interface Button {
	x: number;
	y: number;
	width: number;
	height: number;
	text: string;
	active?: boolean;
	hover?: boolean;
	type: 'primary' | 'secondary' | 'danger';
}

class TodoApp {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private todos: Todo[] = [];
	private filteredTodos: Todo[] = [];
	private nextId = 1;
	private currentFilter: 'all' | 'active' | 'completed' = 'all';

	// UI States
	private isTyping = false;
	private currentInput = '';
	private cursorVisible = true;
	private cursorInterval: number;
	private hoveredButton: Button | null = null;

	// Layout constants
	private readonly padding = 24;
	private readonly headerHeight = 80;
	private readonly inputHeight = 56;
	private readonly todoHeight = 56;
	private readonly buttonHeight = 44;
	private readonly fontSize = 16;
	private readonly headerFontSize = 28;

	// Colors
	private readonly colors = {
		// Primary colors
		primary: '#8b5cf6', // Purple
		primaryHover: '#7c3aed', // Darker purple

		// Danger colors
		danger: '#ef4444',
		dangerHover: '#dc2626',

		// Success colors
		success: '#10b981',
		successHover: '#059669',

		// Text colors
		text: '#f8fafc',
		lightText: '#94a3b8',
		placeholderText: '#475569',

		// Background colors
		background: '#1e293b',
		inputBg: '#0f172a',
		secondaryBg: '#334155',
		hoverBg: '#1e293b',

		// Border colors
		border: '#334155',
		activeBorder: '#8b5cf6',

		// Button colors
		buttonText: '#ffffff',
		secondary: '#1e293b',
		secondaryHover: '#334155',

		// Shadows
		shadow: 'rgba(0, 0, 0, 0.2)',
		textShadow: 'rgba(0, 0, 0, 0.4)'
	};

	constructor() {
		this.canvas = document.getElementById('todoCanvas') as HTMLCanvasElement;
		this.ctx = this.canvas.getContext('2d')!;
		this.loadTodos();
		this.setupCanvas();
		this.setupEventListeners();
		this.startCursorBlink();
		this.draw();
	}

	private setupCanvas() {
		const width = Math.min(800, window.innerWidth - 40);
		this.canvas.width = width;
		this.canvas.height = 600;

		// Set the canvas style width to match the logical width
		this.canvas.style.width = `${width}px`;
		this.canvas.style.height = '600px';

		// Reset font after canvas resize
		this.ctx.font = `${this.fontSize}px system-ui, -apple-system, sans-serif`;
	}

	private setupEventListeners() {
		window.addEventListener('resize', () => {
			this.setupCanvas();
			this.draw();
		});

		this.canvas.addEventListener('click', (e) => this.handleClick(e));

		window.addEventListener('keydown', (e) => {
			if (this.isTyping) {
				if (e.key === 'Enter') {
					this.addTodo();
				} else if (e.key === 'Backspace') {
					this.currentInput = this.currentInput.slice(0, -1);
				} else if (e.key.length === 1) {
					this.currentInput += e.key;
				}
				this.draw();
			}
		});

		this.canvas.addEventListener('mousemove', (e) => {
			const rect = this.canvas.getBoundingClientRect();
			const scale = this.canvas.width / rect.width;
			const x = (e.clientX - rect.left) * scale;
			const y = (e.clientY - rect.top) * scale;

			let found = false;

			// Check filter buttons
			this.getFilterButtons().forEach((button) => {
				if (this.isInBounds(x, y, button)) {
					this.hoveredButton = button;
					found = true;
					this.draw();
				}
			});

			// Check clear completed button
			const clearButton = this.getClearButton();
			if (this.isInBounds(x, y, clearButton)) {
				this.hoveredButton = clearButton;
				found = true;
				this.draw();
			}

			if (!found && this.hoveredButton) {
				this.hoveredButton = null;
				this.draw();
			}
		});

		this.canvas.addEventListener('mouseleave', () => {
			this.hoveredButton = null;
			this.draw();
		});
		window.addEventListener('unload', () => {
			this.cleanup();
		});
	}

	private handleClick(e: MouseEvent) {
		const rect = this.canvas.getBoundingClientRect();
		const scale = this.canvas.width / rect.width;
		const x = (e.clientX - rect.left) * scale;
		const y = (e.clientY - rect.top) * scale;

		// Check input area click
		const inputArea = {
			x: this.padding,
			y: this.headerHeight,
			width: this.canvas.width - this.padding * 2,
			height: this.inputHeight
		};

		if (this.isInBounds(x, y, inputArea)) {
			this.isTyping = true;
			this.draw();
			return;
		}

		// Check todo checkboxes
		const todoStart = this.headerHeight + this.inputHeight + this.padding;
		const clickedTodoIndex = Math.floor((y - todoStart) / this.todoHeight);

		if (clickedTodoIndex >= 0 && clickedTodoIndex < this.filteredTodos.length) {
			if (x < this.padding + 30) {
				// Checkbox area
				const todo = this.filteredTodos[clickedTodoIndex];
				todo.completed = !todo.completed;
				this.saveTodos();
				this.draw();
			}
		}

		// Check filter buttons
		this.getFilterButtons().forEach((button) => {
			if (this.isInBounds(x, y, button)) {
				this.currentFilter = button.text.toLowerCase() as any;
				this.filterTodos();
				this.draw();
			}
		});

		// Check clear completed button
		const clearButton = this.getClearButton();
		if (this.isInBounds(x, y, clearButton)) {
			this.clearCompleted();
		}
	}

	private isInBounds(
		x: number,
		y: number,
		bounds: { x: number; y: number; width: number; height: number }
	) {
		return (
			x >= bounds.x &&
			x <= bounds.x + bounds.width &&
			y >= bounds.y &&
			y <= bounds.y + bounds.height
		);
	}

	private addTodo() {
		if (this.currentInput.trim()) {
			const todo: Todo = {
				id: this.nextId++,
				text: this.currentInput.trim(),
				completed: false
			};
			this.todos.unshift(todo);
			this.saveTodos();
			this.filterTodos();
			this.currentInput = '';
			this.isTyping = false;
			this.draw();
		}
	}

	private clearCompleted() {
		this.todos = this.todos.filter((todo) => !todo.completed);
		this.saveTodos();
		this.filterTodos();
		this.draw();
	}

	private filterTodos() {
		switch (this.currentFilter) {
			case 'active':
				this.filteredTodos = this.todos.filter((todo) => !todo.completed);
				break;
			case 'completed':
				this.filteredTodos = this.todos.filter((todo) => todo.completed);
				break;
			default:
				this.filteredTodos = [...this.todos];
		}
	}

	private draw() {
		// Clear and set background
		this.ctx.fillStyle = this.colors.background;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw header
		this.ctx.fillStyle = this.colors.text;
		this.ctx.font = `bold ${this.headerFontSize}px system-ui, -apple-system, sans-serif`;
		this.ctx.textAlign = 'left';
		this.ctx.fillText('Tasks', this.padding, 50);

		// Draw components
		this.drawInput();
		this.drawTodos();
		this.drawControls();
	}

	private drawInput() {
		const inputY = this.headerHeight;

		// Input background
		this.ctx.fillStyle = this.colors.inputBg;
		this.ctx.strokeStyle = this.isTyping ? this.colors.activeBorder : 'transparent';
		this.ctx.lineWidth = 2;
		this.roundRect(
			this.padding,
			inputY,
			this.canvas.width - this.padding * 2,
			this.inputHeight,
			12
		);

		// Input text
		this.ctx.font = `${this.fontSize}px system-ui, -apple-system, sans-serif`;
		this.ctx.textAlign = 'left';

		const text = this.currentInput + (this.isTyping && this.cursorVisible ? '|' : '');
		const placeholder = 'Add a new task...';

		this.ctx.fillStyle = text ? this.colors.text : this.colors.placeholderText;
		this.ctx.fillText(
			text || (!this.isTyping ? placeholder : ''),
			this.padding + 16,
			inputY + this.inputHeight / 2 + 6,
			this.canvas.width - this.padding * 4
		);
	}

	private drawTodos() {
		const startY = this.headerHeight + this.inputHeight + this.padding;

		this.filteredTodos.forEach((todo, index) => {
			const y = startY + index * this.todoHeight;

			// Todo item background
			this.ctx.fillStyle = index % 2 === 0 ? this.colors.background : this.colors.inputBg;
			this.roundRect(this.padding, y, this.canvas.width - this.padding * 2, this.todoHeight - 8, 8);

			// Checkbox
			this.ctx.strokeStyle = todo.completed ? this.colors.success : this.colors.border;
			this.ctx.lineWidth = 2;
			this.ctx.beginPath();
			this.ctx.arc(this.padding + 20, y + this.todoHeight / 2 - 4, 8, 0, Math.PI * 2);
			this.ctx.stroke();

			if (todo.completed) {
				this.ctx.fillStyle = this.colors.success;
				this.ctx.fill();

				// Checkmark
				this.ctx.strokeStyle = '#fff';
				this.ctx.lineWidth = 2;
				this.ctx.beginPath();
				this.ctx.moveTo(this.padding + 16, y + this.todoHeight / 2 - 4);
				this.ctx.lineTo(this.padding + 20, y + this.todoHeight / 2);
				this.ctx.lineTo(this.padding + 24, y + this.todoHeight / 2 - 8);
				this.ctx.stroke();
			}

			// Todo text
			this.ctx.fillStyle = todo.completed ? this.colors.lightText : this.colors.text;
			const textX = this.padding + 44;
			const textY = y + this.todoHeight / 2;

			if (todo.completed) {
				this.ctx.save();
				this.ctx.strokeStyle = this.colors.lightText;
				this.ctx.lineWidth = 1;
				this.ctx.beginPath();
				this.ctx.moveTo(textX, textY);
				this.ctx.lineTo(textX + this.ctx.measureText(todo.text).width, textY);
				this.ctx.stroke();
				this.ctx.restore();
			}

			this.ctx.fillText(todo.text, textX, textY);
		});
	}

	private drawControls() {
		const y = this.canvas.height - this.buttonHeight - this.padding;

		// Draw filter buttons
		this.getFilterButtons().forEach((button) => {
			this.drawButton(button);
		});

		// Draw clear completed button
		this.drawButton(this.getClearButton());
	}

	private getFilterButtons(): Button[] {
		const totalWidth = this.canvas.width - this.padding * 2;
		const buttonWidth = Math.min(120, (totalWidth - 40) / 3);
		const gap = 8;
		const startX = this.canvas.width - (buttonWidth * 3 + gap * 2) - this.padding;

		return ['All', 'Active', 'Completed'].map((text, i) => ({
			x: startX + (buttonWidth + gap) * i,
			y: this.canvas.height - this.buttonHeight - this.padding,
			width: buttonWidth,
			height: this.buttonHeight,
			text,
			active: this.currentFilter === text.toLowerCase(),
			hover: false,
			type: 'secondary'
		}));
	}

	private getClearButton(): Button {
		return {
			x: this.padding,
			y: this.canvas.height - this.buttonHeight - this.padding,
			width: 140,
			height: this.buttonHeight,
			text: 'Clear Completed',
			hover: false,
			type: 'danger'
		};
	}

	private drawButton(button: Button) {
		const isHovered = this.hoveredButton === button;

		const colors = {
			primary: {
				bg: isHovered ? this.colors.primaryHover : this.colors.primary,
				text: this.colors.buttonText
			},
			secondary: {
				bg: button.active
					? isHovered
						? this.colors.primaryHover
						: this.colors.primary
					: isHovered
						? this.colors.secondaryHover
						: this.colors.secondary,
				text: this.colors.text
			},
			danger: {
				bg: isHovered ? this.colors.dangerHover : this.colors.danger,
				text: this.colors.buttonText
			}
		}[button.type];

		// Button background
		this.ctx.fillStyle = colors.bg;
		this.roundRect(button.x, button.y, button.width, button.height, 10);

		// Button text
		this.ctx.fillStyle = colors.text;
		this.ctx.font = `500 ${this.fontSize}px system-ui, -apple-system, sans-serif`;
		this.ctx.textAlign = 'center';
		this.ctx.fillText(button.text, button.x + button.width / 2, button.y + button.height / 2 + 5);
	}

	private roundRect(x: number, y: number, w: number, h: number, r: number) {
		if (w < 2 * r) r = w / 2;
		if (h < 2 * r) r = h / 2;

		this.ctx.beginPath();
		this.ctx.moveTo(x + r, y);
		this.ctx.arcTo(x + w, y, x + w, y + h, r);
		this.ctx.arcTo(x + w, y + h, x, y + h, r);
		this.ctx.arcTo(x, y + h, x, y, r);
		this.ctx.arcTo(x, y, x + w, y, r);
		this.ctx.closePath();

		// Fill first to prevent stroke overlap
		this.ctx.fill();
		if (this.ctx.strokeStyle !== 'transparent') {
			this.ctx.stroke();
		}
	}

	private startCursorBlink() {
		this.cursorInterval = window.setInterval(() => {
			if (this.isTyping) {
				this.cursorVisible = !this.cursorVisible;
				this.draw();
			}
		}, 500);
	}

	private saveTodos() {
		localStorage.setItem('todos', JSON.stringify(this.todos));
	}

	private loadTodos() {
		const saved = localStorage.getItem('todos');
		if (saved) {
			this.todos = JSON.parse(saved);
			this.nextId = Math.max(...this.todos.map((t) => t.id), 0) + 1;
			this.filteredTodos = [...this.todos];
		}
	}

	private cleanup() {
		if (this.cursorInterval) {
			clearInterval(this.cursorInterval);
		}
	}
}

new TodoApp();
