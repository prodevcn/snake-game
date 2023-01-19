const collides = (square1, square2) =>
  square1.x == square2.x && square1.y == square2.y;

const collides_with_snake = (snake, square) =>
  snake.reduce((out, segment) => out || collides(segment, square), false);


const mod = (m, n) => ((m % n) + n) % n;

const isWallCrash = (segment, direction) => {
  if (segment.x === 0 && direction.x === -1) return true;
  else if (segment.x === 24 && direction.x === 1) return true;
  else if (segment.y === 0 && direction.y === -1) return true;
  else if (segment.y === 24 && direction.y === 1) return true;
};

class SnakeGame {
  constructor(ctx) {
    this.new_game();
    this.ctx = ctx;
    this.wallCrashed = false;
    this.crash_segment = {};
  }
  new_game() {
    this.dims = [25, 25];
    this.gamesize = 400;
    this.snake = [{ x: 5, y: 5 }];
    this.new_apple();
    this.direction = null;
    this.next_direction = null;
    this.input_queue = [];
  }
  collides_with(snake, square) {
    return snake.reduce(
      (dead, segment) => collides(segment, new_segment),
      false
    );
  }

  new_apple() {
    if (this.snake.length >= this.dims[0] * this.dims[1]) this.new_game();
    do {
      this.apple = {
        x: Math.floor(Math.random() * this.dims[0]),
        y: Math.floor(Math.random() * this.dims[1]),
      };
    } while (collides_with_snake(this.snake, this.apple));
  }
  is_dead(new_segment) {
    return collides_with_snake(this.snake.slice(1), new_segment);
  }

  step() {
    if (!this.wallCrashed) {
      this.direction = this.get_next_direction();
      if (!this.direction) return;
      const head = this.snake[this.snake.length - 1];
      let [dx, dy] = this.dims;
      const new_segment = {
        x: mod(head.x + this.direction.x, dx),
        y: mod(head.y + this.direction.y, dy),
      };

      if (isWallCrash(new_segment, this.next_direction)) {
        this.wallCrashed = true;
        this.crash_segment = new_segment;
      }

      if (this.is_dead(new_segment)) this.new_game();

      if (collides(new_segment, this.apple)) {
        this.new_apple();
      } else if (this.snake.length > 5) {
        this.snake.shift();
      }
      this.snake.push(new_segment);
      this.draw();
    }
  }

  draw() {
    this.ctx.clearRect(0, 0, this.gamesize + 11, this.gamesize + 11);
    this.ctx.fillStyle = "black";
    this.ctx.strokeStyle = "black 2px solid";
    let dimx, dimy, sx, sy;
    [dimx, dimy] = this.dims;
    sx = this.gamesize / dimx;
    sy = this.gamesize / dimy;

    this.ctx.strokeRect(10, 10, this.gamesize, this.gamesize);
    for (let segment of this.snake) {
      let { x, y } = segment;
      this.ctx.fillRect(10 + sx * x, 10 + sy * y, sx - 1, sy - 1);
    }
    this.ctx.fillStyle = "red";
    let { x, y } = this.apple;
    this.ctx.fillRect(10 + sx * x, 10 + sy * y, sx, sy);
  }

  get_next_direction() {
    if (!this.next_direction) return this.direction;
    if (!this.direction) return this.next_direction;
    let { x, y } = this.next_direction;
    if (x == this.direction.x || y == this.direction.y) return this.direction; // cannot eat self
    return this.next_direction;
  }

  keypress(event) {
    this.next_direction =
      {
        37: { x: -1, y: 0 }, // Left
        38: { x: 0, y: -1 }, // Up
        39: { x: 1, y: 0 }, // Right
        40: { x: 0, y: 1 }, // Down
      }[event.keyCode] || this.next_direction;
    if (!isWallCrash(this.crash_segment, this.next_direction)) {
      this.wallCrashed = false;
      this.crash_segment = {};
    }
  }
}
