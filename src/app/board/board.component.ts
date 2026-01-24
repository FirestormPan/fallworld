import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [],
  templateUrl: './board.component.html',
  styleUrl: './board.component.css'
})
export class BoardComponent {

  // monitor the size the board and player get dynamically (due to css) so that it can be used in movement calculations
  @ViewChild('board') boardRef!: ElementRef<HTMLDivElement>;
  @ViewChild('player') playerRef!: ElementRef<HTMLDivElement>;

  // Dimensions will be updated after view init
  boardWidth = 0;
  playerWidth = 0;

  playerX = 100; // horizontal position in px
  step = 0; // will be updated after view init
 
  pressedKeys: Set<string> = new Set(); // Track pressed keys to declare direction in movement

  //====== Keyboard Input Handling ======
  @HostListener('window:keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    this.pressedKeys.add(event.key);
  }
  @HostListener('window:keyup', ['$event'])
  onKeyUp(event: KeyboardEvent) {
    this.pressedKeys.delete(event.key);
  }

  updateBoardSize() {
    this.boardWidth = this.boardRef.nativeElement.offsetWidth;
    this.playerWidth = this.playerRef.nativeElement.offsetWidth;
    this.step = this.boardWidth * 0.01;
    console.log(`Board width: ${this.boardWidth}, Player width: ${this.playerWidth}`);  
  }

  ngAfterViewInit() {
    this.updateBoardSize();
    window.addEventListener('resize', () => this.updateBoardSize());
    this.startGameLoop();
  }



  startGameLoop() {
    setInterval(() => {
      if (this.pressedKeys.has('ArrowLeft')) {
        this.playerX = Math.max(0, this.playerX - this.step);
      }
      if (this.pressedKeys.has('ArrowRight')) {
        this.playerX = Math.min(this.boardWidth - this.playerWidth, this.playerX + this.step);
      }
    }, 20); // roughly 60fps
  }

}
