class MazeGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.player = { x: 1, y: 1 };
        this.maze = [];
        this.startTime = null;
        this.timerInterval = null;
        this.isGameActive = false;
        
        // Agregar listener para el redimensionamiento
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    resizeCanvas() {
        if (!this.width || !this.height) return;
        
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calcular el tamaño de celda que mejor se ajuste al contenedor
        const cellSizeWidth = Math.floor(containerWidth / this.width);
        const cellSizeHeight = Math.floor(containerHeight / this.height);
        this.cellSize = Math.min(cellSizeWidth, cellSizeHeight);
        
        // Actualizar dimensiones del canvas
        this.canvas.width = this.width * this.cellSize;
        this.canvas.height = this.height * this.cellSize;
        
        // Redibujar el laberinto
        if (this.isGameActive) {
            this.drawMaze();
        }
    }

    initializeMaze(difficulty) {
        const sizes = {
            easy: { width: 15, height: 15 },
            medium: { width: 20, height: 20 },
            hard: { width: 25, height: 25 }
        };

        const size = sizes[difficulty];
        this.width = size.width;
        this.height = size.height;
        
        this.maze = Array(this.height).fill().map(() => Array(this.width).fill(1));
        this.generateMaze(1, 1);
        
        // Set start and end positions
        this.maze[1][1] = 0;
        this.maze[this.height - 2][this.width - 2] = 2;
        this.player = { x: 1, y: 1 };
        
        // Resize canvas to fit the container
        this.resizeCanvas();
    }

    generateMaze(x, y) {
        const directions = [
            [0, -2], // Up
            [2, 0],  // Right
            [0, 2],  // Down
            [-2, 0]  // Left
        ];
        
        for (let i = directions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [directions[i], directions[j]] = [directions[j], directions[i]];
        }

        for (const [dx, dy] of directions) {
            const newX = x + dx;
            const newY = y + dy;
            
            if (newX > 0 && newX < this.width - 1 && 
                newY > 0 && newY < this.height - 1 && 
                this.maze[newY][newX] === 1) {
                
                this.maze[newY][newX] = 0;
                this.maze[y + dy/2][x + dx/2] = 0;
                this.generateMaze(newX, newY);
            }
        }
    }

    drawMaze() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cell = this.maze[y][x];
                
                if (cell === 1) { // Wall
                    this.ctx.fillStyle = `hsl(215, 30%, ${20 + Math.sin(Date.now() / 1000 + x + y) * 10}%)`;
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                } else if (cell === 2) { // End
                    this.ctx.fillStyle = '#27ae60';
                    this.ctx.fillRect(x * this.cellSize, y * this.cellSize, this.cellSize, this.cellSize);
                }
            }
        }

        // Draw player with glow effect
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = "#e74c3c";
        this.ctx.fillStyle = "#e74c3c";
        this.ctx.beginPath();
        this.ctx.arc(
            this.player.x * this.cellSize + this.cellSize/2,
            this.player.y * this.cellSize + this.cellSize/2,
            this.cellSize/3,
            0,
            Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }

    movePlayer(dx, dy) {
        if (!this.isGameActive) return;
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (newX >= 0 && newX < this.width && 
            newY >= 0 && newY < this.height && 
            this.maze[newY][newX] !== 1) {
            
            this.player.x = newX;
            this.player.y = newY;

            if (this.maze[newY][newX] === 2) {
                this.endGame();
            }
        }
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Date.now() - this.startTime;
            const seconds = Math.floor(elapsed / 1000);
            const minutes = Math.floor(seconds / 60);
            document.getElementById('timer').textContent = 
                `${minutes.toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
        }, 100);
    }

    endGame() {
        this.isGameActive = false;
        clearInterval(this.timerInterval);
        const elapsed = Date.now() - this.startTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        document.getElementById('finalTime').textContent = 
            `¡Completado en ${minutes}:${(seconds % 60).toString().padStart(2, '0')}!`;
    }

    update() {
        this.drawMaze();
        if (this.isGameActive) {
            requestAnimationFrame(() => this.update());
        }
    }
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const game = new MazeGame(document.getElementById('maze'));

    // Initialize button event listeners
    document.getElementById('easyBtn').addEventListener('click', () => startGame('easy'));
    document.getElementById('mediumBtn').addEventListener('click', () => startGame('medium'));
    document.getElementById('hardBtn').addEventListener('click', () => startGame('hard'));

    function startGame(difficulty) {
        document.getElementById('finalTime').textContent = '';
        document.getElementById('timer').textContent = '00:00';
        game.initializeMaze(difficulty);
        game.isGameActive = true;
        game.startTimer();
        game.update();
    }

    // Initialize keyboard controls
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();
        if (key === 'arrowup' || key === 'w') game.movePlayer(0, -1);
        if (key === 'arrowdown' || key === 's') game.movePlayer(0, 1);
        if (key === 'arrowleft' || key === 'a') game.movePlayer(-1, 0);
        if (key === 'arrowright' || key === 'd') game.movePlayer(1, 0);
    });
});