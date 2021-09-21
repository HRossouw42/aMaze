const { Engine, Render, Runner, Bodies, Composite } = Matter;

const engine = Engine.create();
const { world } = engine;

const cells = 3;
const width = 600;
const height = 600;

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

// bodies follow the pattern: (X, Y, WIDTH, HEIGHT)
// Walls
const walls = [
  Bodies.rectangle(width / 2, 0, width, 40, { isStatic: true }),
  Bodies.rectangle(width / 2, height, width, 40, { isStatic: true }),
  Bodies.rectangle(0, height / 2, 40, height, { isStatic: true }),
  Bodies.rectangle(width, height / 2, 40, height, { isStatic: true }),
];
Composite.add(world, walls);

// Maze generation ---
// const shuffle = (arr) => {
//   let counter = arr.length;

//   while (counter > 0) {
//     const index = Math.floor(Math.random() * counter);

//     counter--;

//     const temp = arr[counter];
//     arr[counter] = arr[index];
//     arr[index] = temp;
//   }

//   return arr;
// };

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
  }
  // TODO: visit that cell
};

stepThroughCell(startRow, startColumn);
