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
import {FormBuilder, FormGroup } from '@angular/forms';

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
  numberOfObstacles: number;
  myForm: FormGroup;

  @ViewChild('snakeGameCanvas')
  canvas: ElementRef<HTMLCanvasElement>;
  public context: CanvasRenderingContext2D;

  constructor(fb: FormBuilder) {
    this.numberOfObstacles = 3;
    this.myForm = fb.group({
      'txtNumberOfObstacles': [this.numberOfObstacles]
    });
  }

  ngOnInit() {
    this.startUp();
  }
  startUp() {
    this.count = 0;
    this.grid = 20;
    this.intervalID = 0;
    this.framesPerSecond = 30,
    this.counterTimer = 100;
    this.counterDownValue = 0;
    this.start = 0,
    this.timestamp = new Date().getTime();
    this.frameDuration = 1000 / this.framesPerSecond;
    this.snake = new Snake();
    this.food = new Food();
    this.posion = new Posion();
    this.obstacle = new Obstacle();
    this.snake.dx = this.grid;
    this.context = (this.canvas.nativeElement as HTMLCanvasElement).getContext(
      '2d'
    );
    this.obstaclesList = this.generateObstacles();
    const x = this.randomCoordCalculation(1, this.canvas.nativeElement.width);
    const y = this.randomCoordCalculation(1, this.canvas.nativeElement.height);
    this.food.x = this.alignFoodCoordinates(x);
    this.food.y = this.alignFoodCoordinates(y);
    this.posion.x = null;
    this.posion.y = null;
    this.snake.score = 0;
    this.resizeGame('');
    this.rafID = requestAnimationFrame(this.loop.bind(this));
  }
  loop(): any {
    requestAnimationFrame(this.loop.bind(this));
    if (this.rafID === null || undefined) {
      return;
    }
    if (++this.count < 5) {
      return;
    }
    if (this.obstaclesList.length !== this.numberOfObstacles) {
      this.obstaclesList = this.generateObstacles();
    }
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
    this.snake.cells.unshift({ x: this.snake.x, y: this.snake.y });
    this.removeCells();
    this.drawScore();
    this.drawFood();
    this.drawObstacles();
    this.drawSnake();
    this.runInterval();
    this.start = this.timestamp + this.frameDuration;
  }

  runInterval(): void {
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
    for (let index = 0; index < this.numberOfObstacles; index++) {
      const obstacle = new Obstacle();
      const x = this.randomCoordCalculation(0, this.canvas.nativeElement.width);
      const y = this.randomCoordCalculation(
        0,
        this.canvas.nativeElement.height
      );
      obstacle.x = x;
      obstacle.y = y;
      obstaclesList.push(obstacle);
    }
    return obstaclesList;
  }
  randomCoordCalculation(min, max): number {
    // tslint:disable-next-line:radix
    let randomCoord = parseInt(Math.random() * (max - min) + min);
    while (randomCoord % this.grid > 0) {
      // tslint:disable-next-line:radix
      randomCoord = parseInt(Math.random() * (max - min) + min);
    }
    return randomCoord;
  }
  drawObstacles(): void {
    console.log('this.food ==== ', this.food);
    console.log('this.canvas.nativeElement.width ==== ', this.canvas.nativeElement.height);
    console.log('this.canvas.nativeElement.height ==== ', this.canvas.nativeElement.height);
    for (let index = 0; index < this.numberOfObstacles; index++) {
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
      const x = this.randomCoordCalculation(0, this.canvas.nativeElement.width);
      const y = this.randomCoordCalculation(
        0,
        this.canvas.nativeElement.height
      );
      this.posion.x = this.alignCoordinates(x);
      this.posion.y = this.alignCoordinates(y);
    }
    this.context.fillStyle = 'red';
    this.context.fillRect(this.posion.x, this.posion.y, this.grid, this.grid);
  }
  scoreSnake(): void {
    if (this.numberOfObstacles > 0 && this.numberOfObstacles <= 3) {
      this.snake.score += 1;
    } else if (this.numberOfObstacles > 3 && this.numberOfObstacles <= 6) {
      this.snake.score += 3;
    } else if (this.numberOfObstacles > 6 && this.numberOfObstacles <= 9) {
      this.snake.score += 6;
    } else if (this.numberOfObstacles > 9 && this.numberOfObstacles <= 12) {
      this.snake.score += 9;
    } else if (this.numberOfObstacles > 12 && this.numberOfObstacles <= 15) {
      this.snake.score += 12;
    }
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
  alignFoodCoordinates(createdCoordinate: number): number {
    let randomCoord = createdCoordinate;
    while (
      randomCoord % this.grid > 0 &&
      this.obstaclesList.some(this.areCoordsTaken)
    ) {
      randomCoord = this.randomCoordCalculation(0, randomCoord);
    }
    return randomCoord - 10;
  }
  alignCoordinates(createdCoordinate: number): number {
    let randomCoord = createdCoordinate;
    while (randomCoord % this.grid > 0) {
      randomCoord = this.randomCoordCalculation(0, randomCoord);
    }
    return randomCoord;
  }
  areCoordsTaken(obstacle: Obstacle) {
    return obstacle.x === this.food.x && obstacle.y === this.food.y;
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
  drawScore(): void {
    this.context.fillStyle = 'black';
    this.context.textAlign = 'center';
    this.context.font = 'normal bold 20px serif';
    this.context.fillText(
      `${this.snake.score}`,
      this.canvas.nativeElement.width - 20,
      this.canvas.nativeElement.height - 20
    );
  }
  collisionOccourance(): void {
    const x = this.randomCoordCalculation(1, this.canvas.nativeElement.width);
    const y = this.randomCoordCalculation(1, this.canvas.nativeElement.height);
    this.snake.x = 0;
    this.snake.y = 0;
    this.snake.cells = [];
    this.snake.snakeBody = 4;
    this.snake.dx = this.grid;
    this.snake.dy = 0;
    this.food.x = this.alignFoodCoordinates(x);
    this.food.y = this.alignFoodCoordinates(y);
    this.posion.x = null;
    this.posion.y = null;
    this.obstaclesList = this.generateObstacles();
    this.start = this.timestamp + this.frameDuration;
  }

  checkIfSnakeAteApple(cell: any): void {
    if (cell.x === this.food.x - 10 && cell.y === this.food.y - 10) {
      this.snake.snakeBody++;
      this.snake.counter++;
      const x = this.randomCoordCalculation(1, this.canvas.nativeElement.width);
      const y = this.randomCoordCalculation(
        1,
        this.canvas.nativeElement.height
      );
      this.food.x = this.alignFoodCoordinates(x);
      this.food.y = this.alignFoodCoordinates(y);
      this.scoreSnake();
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
        this.snake.score--;
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
      this.canvas.nativeElement.clientWidth,
      this.canvas.nativeElement.clientHeight
    );
    const width =
      this.canvas.nativeElement.clientWidth -
      (this.canvas.nativeElement.clientWidth % this.grid);
    const height =
      this.canvas.nativeElement.clientHeight -
      (this.canvas.nativeElement.clientHeight % this.grid);

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
