import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';


type FallingItem ={
  x: number;
  y: number;
  width: number;
  height: number;
  fallSpeed: number;
  type: 'good' | 'bad';
}


@Component({
  selector: 'app-board',
  standalone: true,
  imports: [],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {
  private gameIntervalId?: number;
  private spawnIntervalId?: number;

  // monitor the size the board and player get dynamically (due to css) so that it can be used in movement calculations
  @ViewChild('board') boardRef!: ElementRef<HTMLDivElement>;
  @ViewChild('player') playerRef!: ElementRef<HTMLDivElement>;

  // Dimensions will be updated after view init
  boardWidth = 0;
  boardHeight = 0
  playerWidth = 0;

  playerX = 100; // horizontal position in px
  step = 0; // will be updated after view init

  spawnRate = 3000; //will later be changed to variable difficulty

  fallingItems: FallingItem[] = [];

  pressedKeys: Set<string> = new Set(); // Track pressed keys to declare direction in movement

  //====== Keyboard Input Handling ======
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
    event.preventDefault();
    this.pressedKeys.add(event.key);
  }

  }
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
  }

  updateBoardSize() {
    this.boardWidth = this.boardRef.nativeElement.offsetWidth;
    this.boardHeight = this.boardRef.nativeElement.offsetHeight;
    this.playerWidth = this.playerRef.nativeElement.offsetWidth;
    this.step = this.boardWidth * 0.01;
    console.log(`Board width: ${this.boardWidth}, Player width: ${this.playerWidth}`);  
  }

  //function to attach and detach resize event listener
  private resizeHandler = () => this.updateBoardSize();
 

  ngAfterViewInit() {
    this.updateBoardSize();
    window.addEventListener('resize', this.resizeHandler);
    this.startGameLoop();
    this.startSpawner();
  }

  ngOnDestroy() {
    window.removeEventListener('resize', this.resizeHandler);
    clearInterval(this.gameIntervalId);
    clearInterval(this.spawnIntervalId);
  }


  startGameLoop() {
    this.gameIntervalId = window.setInterval(() => {
      this.updatePlayerPosition();
      this.updateItems();


      //check colliisions

      //removeOffscreen ites

    }, 20); // roughly 50fps
  }

  updatePlayerPosition() {
     if (this.pressedKeys.has('ArrowLeft')) {
        this.playerX = Math.max(0, this.playerX - this.step);
      }
      if (this.pressedKeys.has('ArrowRight')) {
        this.playerX = Math.min(this.boardWidth - this.playerWidth, this.playerX + this.step);
      }
  }

  updateItems() {
    for (let item of this.fallingItems) {
      item.y += item.fallSpeed;
    }
    this.fallingItems = this.fallingItems.filter(item => item.y < this.boardHeight);
  }

  startSpawner(){
    this.spawnIntervalId = window.setInterval(() => {
      this.spawnItem();
    }, this.spawnRate); // spawn every second
  }

  spawnItem() {
    const itemType: 'good' | 'bad' = Math.random() < 0.7 ? 'good' : 'bad';
    const itemWidth = 30; // example width
    const itemHeight = 30; // example height
    const fallSpeed = 2; // example fall speed
    const xPosition = Math.random() * (this.boardWidth - itemWidth);
    const newItem: FallingItem = {
      x: xPosition,
      y: 0,
      fallSpeed: fallSpeed,
      width: itemWidth,
      height: itemHeight,
      type: itemType
    };
    this.fallingItems.push(newItem);
  }

  increaseDifficulty() {
    clearInterval(this.spawnIntervalId);
    this.spawnRate *= 0.9;
    this.startSpawner();
  }

}