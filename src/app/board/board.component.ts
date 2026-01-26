import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { GameStateServiceService } from '../shared/services/game-state-service.service';
import { AsyncPipe } from '@angular/common';


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
  imports: [AsyncPipe],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {

  constructor(private gameService: GameStateServiceService) {}

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

  gameEnded$ = this.gameService.gameEnded$;

  boardisPaused: boolean = false;

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
 
  get playerRectangle() {
    return {
      x: this.playerX,
      y: this.boardHeight - this.playerRef.nativeElement.offsetHeight,
      width: this.playerWidth,
      height: this.playerRef.nativeElement.offsetHeight
    };
  }

  isCollidingWithPlayer(item: FallingItem): boolean {
    const player = this.playerRectangle;

    return (
      item.x < player.x + player.width &&
      item.x + item.width > player.x &&
      item.y < player.y + player.height &&
      item.y + item.height > player.y
    );
  }

  ngOnInit() {
    this.gameService.resetTrigger$.subscribe(
      ()=> this.resetBoard()
    )

    this.gameService.gameisPaused$.subscribe((isPaused)=>{
      if(isPaused){
        this.pauseBoard();
      }else{
        this.resumeBoard();
      }
    })
  }


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
    if (this.gameIntervalId) return;

    this.gameIntervalId = window.setInterval(() => {
      if(this.boardisPaused) return;
      this.updatePlayerPosition();
      this.updateItems();

      this.checkColisions();

    }, 20); // roughly 50fps
  }


  pauseBoard() {
    if (this.gameService.getGameEnded()) return;

    this.boardisPaused = true;
  }

  resumeBoard(){
    // Do not resume if the game has ended
    if (this.gameService.getGameEnded()) return;
    
    this.boardisPaused = false;
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
    if (this.spawnIntervalId) return;

    this.spawnIntervalId = window.setInterval(() => {
      if(this.boardisPaused) return;
      this.spawnItem();
    }, this.spawnRate);
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


  checkColisions(){
    this.fallingItems =this.fallingItems.filter( item=>{
      if(!this.isCollidingWithPlayer(item)){
        return true
      }
      if(item.type === 'good'){
        this.gameService.scoreIncremenet();
        if(this.gameService.getScore() % 3 === 0){
          this.increaseDifficulty()
        }
      }else if(item.type === 'bad'){
        this.endGame()
      }
      return false
    });
  }

  increaseDifficulty() {
  if (this.spawnIntervalId) {
    clearInterval(this.spawnIntervalId);
    this.spawnIntervalId = undefined;
  }

  this.spawnRate *= 0.9;
  this.startSpawner();
}


  endGame() {
    clearInterval(this.gameIntervalId);
    clearInterval(this.spawnIntervalId);
    
    this.gameService.endGame();
  }

  resetBoard(){
    //reset all values
    this.fallingItems =[];
    this.playerX = 100;
    this.spawnRate = 3000;
    this.pressedKeys.clear();
    
    // Clear interval IDs so new ones can be created
    this.gameIntervalId = undefined;
    this.spawnIntervalId = undefined;
    
    //restart the loops
    this.startGameLoop();
    this.startSpawner();
  }
}