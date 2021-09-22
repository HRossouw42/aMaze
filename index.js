const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter;

const engine = Engine.create();
engine.world.gravity.y = 0;
const { world } = engine;

const cells = 3;
const width = 600;
const height = 600;

const unitLength = width / cells;

const render = Render.create({
  element: document.body,
  engine: engine,
  options: {
    wireframes: true,
    height,
    width,
  },
});

Render.run(render);
const runner = Runner.create();
Runner.run(runner, engine);

// Walls
// bodies follow the pattern: (X, Y, WIDTH, HEIGHT)
const walls = [
  Bodies.rectangle(width / 2, 0, width, 2, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 2, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 2, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 2, height, { isStatic: true }),
];
Composite.add(world, walls);

// Maze generation ---

// Fisher-Yates array shuffle
// https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle#The_modern_algorithm
const shuffle = (arr) => {
  let currentIndex = arr.length,
    randomIndex;

  while (currentIndex != 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    [arr[currentIndex], arr[randomIndex]] = [
      arr[randomIndex],
      arr[currentIndex],
    ];
  }

  return arr;
};

// grid keeps track of visited status
// verticals & horizontals keep track of their respected wall openeness
// false = a wall exists
const grid = Array(cells)
  .fill(null)
  .map(() => Array(cells).fill(false));

const verticals = Array(cells)
  .fill(null)
  .map(() => Array(cells - 1).fill(false));

const horizontals = Array(cells - 1)
  .fill(null)
  .map(() => Array(cells).fill(false));

const startRow = Math.floor(Math.random() * cells);
const startColumn = Math.floor(Math.random() * cells);

const stepThroughCell = (row, column) => {
  // If visted cell at [row, column], then return
  if (grid[row][column]) {
    return;
  }

  // Mark cell as visited
  grid[row][column] = true;

  // Assemble list of neighbours, randomly
  const neighbours = shuffle([
    [row - 1, column, "up"],
    [row, column + 1, "right"],
    [row + 1, column, "down"],
    [row, column - 1, "left"],
  ]);

  // for each neighbour...
  for (let neightbour of neighbours) {
    const [nextRow, nextColumn, direction] = neightbour;
    // see if its out of bounds
    if (
      nextRow < 0 ||
      nextRow >= cells ||
      nextColumn < 0 ||
      nextColumn >= cells
    ) {
      continue;
    }

    // if visited, continue to next neightbour
    if (grid[nextRow][nextColumn]) {
      continue;
    }

    // remove wall from horizontals/verticals
    if (direction === "left") {
      verticals[row][column - 1] = true;
    } else if (direction === "right") {
      verticals[row][column] = true;
    } else if (direction === "up") {
      horizontals[row - 1][column] = true;
    } else if (direction === "down") {
      horizontals[row][column] = true;
    }

    stepThroughCell(nextRow, nextColumn);
  }
  // TODO: visit that cell
};

stepThroughCell(startRow, startColumn);

// adding wall to canvas
// bodies follow the pattern: (X, Y, WIDTH, HEIGHT)
horizontals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;
    else {
      const wall = Bodies.rectangle(
        columnIndex * unitLength + unitLength / 2,
        rowIndex * unitLength + unitLength,
        unitLength,
        1,
        { isStatic: true }
      );
      Composite.add(world, wall);
    }
  });
});

verticals.forEach((row, rowIndex) => {
  row.forEach((open, columnIndex) => {
    if (open) return;
    else {
      const wall = Bodies.rectangle(
        columnIndex * unitLength + unitLength,
        rowIndex * unitLength + unitLength / 2,
        1,
        unitLength,
        { isStatic: true }
      );
      Composite.add(world, wall);
    }
  });
});

// Goal
const goal = Bodies.rectangle(
  width - unitLength / 2,
  height - unitLength / 2,
  unitLength * 0.6,
  unitLength * 0.6,
  {
    label: "goal",
    isStatic: true,
  }
);
Composite.add(world, goal);

// Player
const ball = Bodies.circle(unitLength / 2, unitLength / 2, unitLength / 4, {
  label: "ball",
});
Composite.add(world, ball);

// Controls
document.addEventListener("keydown", (event) => {
  const { x, y } = ball.velocity;

  if (event.code === "KeyW" || event.code === "ArrowUp") {
    Body.setVelocity(ball, { x, y: y - 5 });
  }

  if (event.code === "KeyD" || event.code === "ArrowRight") {
    Body.setVelocity(ball, { x: x + 5, y });
  }

  if (event.code === "KeyS" || event.code === "ArrowDown") {
    Body.setVelocity(ball, { x, y: y + 5 });
  }

  if (event.code === "KeyA" || event.code === "ArrowLeft") {
    Body.setVelocity(ball, { x: x - 5, y });
  }
});

// Win Condition
Events.on(engine, "collisionStart", (event) => {
  event.pairs.forEach((collision) => {
    const labels = ["ball", "goal"];
    if (
      labels.includes(collision.bodyA.label) &&
      labels.includes(collision.bodyB.label)
    ) {
      console.log("WINRAR");
    }
  });
});
