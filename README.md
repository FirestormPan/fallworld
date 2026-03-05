# Fallworld

## Conceptual Description (Non-Technical)
This project is a browser-based arcade-style game created to explore modern web application design while creating an engaging interactive website. The player controls a character at the bottom of the screen and must catch or avoid falling objects that enter from the top of the board. As their score increases, the game progressively increases both the speed and number of falling objects. The game includes multiple types of falling objects, where some increase the player’s score, others reduce lives, and special items can temporarily modify the difficulty of the game. 

Beyond gameplay, the project focuses on building a responsive and dynamic website. The game automatically adjusts to different screen sizes, handles pause and resume behavior when the browser tab changes visibility, and ensures smooth real-time updates during gameplay.

The project has 2 main goals. First, it demonstrates the ability to design and implement an interactive application with clear game logic and user interaction. Second, it serves as a practical exploration of modern frontend development patterns, emphasizing maintainable architecture, reactive state management, and separation of responsibilities between game logic and user interface components.

## Technical Description
Angular client-side application with a focus on reactive state management and clear separation between high-level logic,  game state, and rendering.

Global game state is centralized in a dedicated service that manages values such as score, lives game termination, etc. Angular Signals are used as the primary reactive primitive for this state. Components consume these signals directly, allowing the UI and gameplay systems to automatically react to changes without manual subscription handling. Derived values are implemented with computed signals to keep dependent logic declarative and consistent. For example, difficulty is computed from score and  a difficulty multiplier, enabling control of the state.

The board component acts as the runtime environment. It maintains dynamically changing gameplay data including the collection of active falling items, player inputs, and geometrical calculations. Two interval-driven loops power the simulation: one responsible for updating object positions and processing collisions with the player object, and another dedicated to spawning new falling objects. These loops are dynamically started, stopped, or restarted in response to reactive state changes such as pause, difficulty adjustments, or game termination.

Falling items are defined through a configuration map where each item type specifies its properties (e.g. size, speed). This structure allows new item types to be introduced by adding definitions rather than modifying core game logic. When collisions occur, the item’s configured callback executes the appropriate effect (e.g. modifying score).

The project also integrates browser lifecycle awareness and responsive layout handling. Visibility events pause gameplay when the tab stops being visible, while resize handling ensures that gameplay geometry adapts correctly to different screen sizes.

From an implementation perspective, the project explores several key frontend engineering concepts: reactive programming with Angular Signals, modular configuration-driven gameplay systems, interval-based simulation loops and structured state management through services.


This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.3.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
