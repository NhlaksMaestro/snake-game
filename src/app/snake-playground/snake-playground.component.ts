import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener
} from '@angular/core';
import { Snake } from '../models/snake.model';
import { Food } from '../models/food.model';
import { Obstacle } from 'src/app/models/obstacle.model';
import { Posion } from '../models/poison.model';

@Component({
  selector: 'app-snake-playground',
  templateUrl: './snake-playground.component.html',
  styleUrls: ['./snake-playground.component.css'],
  // tslint:disable-next-line:use-host-property-decorator
  host: {
    '(document:keydown)': 'onDocumenKeydown($event)',
    '(window:resize)': 'resizeGame($event)',
    '(window:orientationchange)': 'resizeGame($event)'
  }
})
export class SnakePlaygroundComponent implements OnInit {
  food: Food;
  snake: Snake;
  posion: Posion;
  obstacle: Obstacle;
  obstaclesList: Array<Obstacle>;
  count: number;
  grid: number;
  rafID: number;
  intervalID: number;
  counterTimer: number;
  counterDownValue: number;
  framesPerSecond: number;
  start: number;
  frameDuration: number;
  timestamp: number;

  @ViewChild('snakeGameCanvas')
  canvas: ElementRef<HTMLCanvasElement>;
  public context: CanvasRenderingContext2D;

  constructor() {}

  ngOnInit() {
    this.startUp();
  }
  loop(): any {
    requestAnimationFrame(this.loop.bind(this));
    if (this.rafID === null || undefined) {
      return;
    }
    // if (this.timestamp >= this.start) {
    //   console.log("this.timestamp  === ", this.timestamp );
    //   console.log("this.start  === ", this.start );
      // this.drawGrid();
      // slow game loop to 15 fps instead of 60 - 60/15 = 4
      if (++this.count < 5) {
        return;
      }
      // this.context = this.context;
      this.count = 0;
      this.context.clearRect(
        0,
        0,
        this.canvas.nativeElement.width,
        this.canvas.nativeElement.height
      );
      this.snake.x += this.snake.dx;
      this.snake.y += this.snake.dy;
      this.horizontalSnakePosition();
      this.verticalSnakePosition();
      // keep track of where snake has been. front of the array is always the head
      this.snake.cells.unshift({ x: this.snake.x, y: this.snake.y });
      // remove cells as we move away from them
      this.removeCells();
      // draw food
      if (this.intervalID === 0) {
        if (this.counterDownValue === 0) {
          this.intervalID = setInterval(this.drawPosion.bind(this), 0);
        } else {
          this.counterDownValue++;
        }
      } else {
        if (this.counterDownValue === this.counterTimer) {
          this.stopShowingPoison();
        } else {
          this.counterDownValue++;
        }
      }
      this.drawFood();
      // draw obstacles
      this.drawObstacles();
      // console.log('obstaclesList ==== ', this.obstaclesList);
      // console.log('this.food === ', this.food);
      // draw snake
      this.drawSnake();
      this.start = this.timestamp + this.frameDuration;

   // }
  }
  stopShowingPoison() {
    clearInterval(this.intervalID);
    this.intervalID = 0;
    this.counterDownValue = -100;
  }
  drawGrid() {
    let h = 0,
      w = 0;
    if (this.canvas.nativeElement.clientHeight % this.grid !== 0) {
      h =
        this.canvas.nativeElement.clientHeight -
        (this.canvas.nativeElement.clientHeight % this.grid);
    } else {
      h = this.canvas.nativeElement.clientHeight;
    }
    if (this.canvas.nativeElement.clientWidth % this.grid !== 0) {
      w =
        this.canvas.nativeElement.clientWidth -
        (this.canvas.nativeElement.clientWidth % this.grid);
    } else {
      w = this.canvas.nativeElement.clientWidth;
    }
    for (let y = 0; y < h; y += this.grid) {
      this.context.moveTo(0, y);
      this.context.lineTo(w, y);
    }
    for (let x = 0; x < w; x += this.grid) {
      this.context.moveTo(x, 0);
      this.context.lineTo(x, h);
    }
    // console.log('this.canvas.nativeElement.clientWidth', this.canvas.nativeElement.clientWidth);
    // console.log('this.canvas.nativeElement.clientHeight', this.canvas.nativeElement.clientHeight);
    this.context.strokeStyle = '#ddd';
    this.context.stroke();
  }
  pause(): void {
    cancelAnimationFrame(this.rafID);
  }
  getRandomGridCoordinate(min, max): number {
    return Math.floor(Math.random() * (max - min)) + min;
  }
  horizontalSnakePosition(): void {
    if (this.snake.x < 0) {
      this.snake.x = this.canvas.nativeElement.width - this.grid;
    } else if (this.snake.x >= this.canvas.nativeElement.width) {
      this.snake.x = 0;
    }
  }
  verticalSnakePosition(): void {
    if (this.snake.y < 0) {
      this.snake.y = this.canvas.nativeElement.height - this.grid;
    } else if (this.snake.y >= this.canvas.nativeElement.height) {
      this.snake.y = 0;
    }
  }
  removeCells(): void {
    if (this.snake.cells.length > this.snake.snakeBody) {
      this.snake.cells.pop();
    }
  }
  generateObstacles(): Array<Obstacle> {
    const obstaclesList: Array<Obstacle> = [];
    for (let index = 0; index < 3; index++) {
      const obstacle = new Obstacle();
      obstacle.x = this.randomCoord();
      obstacle.y = this.randomCoord();
      obstaclesList.push(obstacle);
    }
    return obstaclesList;
  }

  get randomCoordCalculation(): number {
    return this.getRandomGridCoordinate(0, 20) * this.grid; // * this.grid;
  }
  areCoordsTaken(obstacle: Obstacle) {
    return obstacle.x === this.food.x && obstacle.y === this.food.y;
  }
  randomFoodCoord(): number {
    let randomCoord = this.randomCoord();
    while (
      randomCoord % 2 !== 0 &&
      this.obstaclesList.some(this.areCoordsTaken)
    ) {
      randomCoord = this.randomCoordCalculation;
    }
    return randomCoord - 10;
  }
  randomCoord(): number {
    let randomCoord = 1;
    while (randomCoord % 2 !== 0) {
      randomCoord = this.randomCoordCalculation;
    }
    return randomCoord;
  }
  drawObstacles(): void {
    for (let index = 0; index < this.obstaclesList.length; index++) {
      this.context.fillStyle = 'purple';
      this.context.fillRect(
        this.obstaclesList[index].x,
        this.obstaclesList[index].y,
        this.grid,
        this.grid
      );
    }
  }
  drawFood(): void {
    this.context.fillStyle = 'lime';
    this.context.beginPath();
    this.context.arc(
      this.food.x,
      this.food.y,
      this.grid / 2,
      0,
      2 * Math.PI,
      false
    );
    this.context.stroke();
    this.context.fill();
  }
  drawPosion(): void {
    if (this.posion.x === null && this.posion.y === null) {
      this.posion.x = this.randomCoord();
      this.posion.y = this.randomCoord();
    }
    this.context.fillStyle = 'red';
    this.context.fillRect(this.posion.x, this.posion.y, this.grid, this.grid);
  }
  drawSnake(): void {
    this.context.fillStyle = 'black';
    this.snake.cells.map(
      (cell, index): void => {
        this.context.fillRect(cell.x, cell.y, this.grid, this.grid);
        this.checkIfSnakeAteApple(cell);
        this.checkIfSnakeCollidedWithPosion(cell, index);
        this.checkIfSnakeCollidedWithObjects(cell, index);
        this.checkIfSnakeCollidedWithItself(cell, index);
        this.checkIfSnakeIsDead();
      }
    );
  }
  startUp(): void {
    this.count = 0;
    this.grid = 20;
    this.intervalID = 0;
    this.counterTimer = 100;
    this.counterDownValue = 0;
    this.framesPerSecond = 30,
    this.start = 0,
    this.frameDuration = 1000 / this.framesPerSecond;
    this.timestamp = new Date().getTime();
    this.snake = new Snake();
    this.food = new Food();
    this.posion = new Posion();
    this.obstacle = new Obstacle();
    this.snake.dx = this.grid;
    this.context = (this.canvas.nativeElement as HTMLCanvasElement).getContext(
      '2d'
    );
    this.obstaclesList = this.generateObstacles();
    this.food.x = this.randomFoodCoord();
    this.food.y = this.randomFoodCoord();
    this.posion.x = null;
    this.posion.y = null;
    this.resizeGame('');
    this.rafID = requestAnimationFrame(this.loop.bind(this));
  }
  gameOver(failureReason: string): void {
    cancelAnimationFrame(this.rafID);
    this.rafID = null;

    this.context.fillStyle = 'black';
    this.context.textBaseline = 'middle';
    this.context.textAlign = 'center';
    this.context.font = 'normal bold 18px serif';

    this.context.fillText(
      'Game over',
      this.canvas.nativeElement.width / 2,
      this.canvas.nativeElement.height / 2
    );
    this.context.fillText(
      failureReason,
      this.canvas.nativeElement.width / 2,
      this.canvas.nativeElement.height / 2 + 20
    );
  }
  collisionOccourance(): void {
    this.snake.x = 0;
    this.snake.y = 0;
    this.snake.cells = [];
    this.snake.snakeBody = 4;
    this.snake.dx = this.grid;
    this.snake.dy = 0;
    this.food.x = this.randomFoodCoord();
    this.food.y = this.randomFoodCoord();
    this.posion.x = null;
    this.posion.y = null;
    this.obstaclesList = this.generateObstacles();
    this.start = this.timestamp + this.frameDuration;
  }

  checkIfSnakeAteApple(cell: any): void {
    if (cell.x === this.food.x - 10 && cell.y === this.food.y - 10) {
      this.snake.snakeBody++;
      this.snake.counter++;
      this.food.x = this.randomFoodCoord() - 20;
      this.food.y = this.randomFoodCoord() - 20;
    }
  }
  checkIfSnakeCollidedWithObjects(cell: any, index: number): void {
    for (let i = index; i < this.obstaclesList.length; i++) {
      if (
        cell.x === this.obstaclesList[i].x &&
        cell.y === this.obstaclesList[i].y
      ) {
        this.collisionOccourance();
        this.gameOver('Snake Collided With Obstacle!');
      }
    }
  }
  checkIfSnakeCollidedWithPosion(cell: any, index: number): void {
    for (let i = index + 1; i < this.snake.cells.length; i++) {
      if (cell.x === this.posion.x && cell.y === this.posion.y) {
        this.stopShowingPoison();
        this.snake.snakeBody--;
        this.snake.counter--;
        this.posion.x = null;
        this.posion.y = null;
        this.snake.cells.pop();
      }
    }
  }
  checkIfSnakeCollidedWithItself(cell: any, index: number): void {
    for (let i = index + 1; i < this.snake.cells.length; i++) {
      if (
        cell.x === this.snake.cells[i].x &&
        cell.y === this.snake.cells[i].y
      ) {
        this.collisionOccourance();
        this.gameOver('Snake Ate itself!');
      }
    }
  }
  checkIfSnakeIsDead(): void {
    if (this.snake.counter < 4) {
      this.collisionOccourance();
      this.gameOver('Snakes Body should be more than four cells!');
    }
  }
  @HostListener('document:keydown', ['$event'])
  onDocumenKeydown(event: KeyboardEvent) {
    if (event.keyCode === 37 && this.snake.dx === 0) {
      this.snake.dx = -this.grid;
      this.snake.dy = 0;
    } else if (event.keyCode === 38 && this.snake.dy === 0) {
      this.snake.dy = -this.grid;
      this.snake.dx = 0;
    } else if (event.keyCode === 39 && this.snake.dx === 0) {
      this.snake.dx = this.grid;
      this.snake.dy = 0;
    } else if (event.keyCode === 40 && this.snake.dy === 0) {
      this.snake.dy = this.grid;
      this.snake.dx = 0;
    } else if (event.keyCode === 32) {
      if (this.rafID !== null || undefined) {
        cancelAnimationFrame(this.rafID);
        this.rafID = null;
      } else {
        this.rafID = requestAnimationFrame(this.loop.bind(this));
        this.count = 0;
      }
    }
  }

  @HostListener('window:resize', ['$event'])
  @HostListener('window:orientationchange', ['$event'])
  resizeGame(event: any) {
    const imgData = this.context.getImageData(
      0,
      0,
      this.canvas.nativeElement.width,
      this.canvas.nativeElement.height
    );
    const width =
      this.canvas.nativeElement.clientWidth -
      (this.canvas.nativeElement.clientWidth % this.grid);
    const height =
      this.canvas.nativeElement.clientHeight -
      (this.canvas.nativeElement.clientHeight % this.grid);

    // If it's resolution does not match change it
    if (
      this.canvas.nativeElement.width !== width ||
      this.canvas.nativeElement.height !== height
    ) {
      this.canvas.nativeElement.width = width;
      this.canvas.nativeElement.height = height;
    }
    this.context.putImageData(imgData, 0, 0);
  }
}
