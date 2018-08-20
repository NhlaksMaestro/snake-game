export class Snake {
  constructor() {
    this.x = 0;
    this.y = 0;
    this.dx = 0;
    this.dy =  0;
    this.cells = [];
    this.snakeBody = 4;
    this.counter = 4;
    this.score = 0;
  }
  public x: number;
  public y: number;
  public dx: number;
  public dy: number;
  public cells: Array<any>;
  public snakeBody: number;
  public counter: number;
  public score: number;
}
