const { Engine, Render, Runner, Bodies, Composite, Body, Events } = Matter;

const startGame = (difficulty) => {
  document.querySelector(".start").classList.add("hidden");

  const engine = Engine.create();
  engine.world.gravity.y = 0;
  const { world } = engine;

  const cellsHorizontal = 8 * difficulty;
  const cellsVertical = 6 * difficulty;
  const width = window.innerWidth;
  const height = window.innerHeight;

  const unitLengthX = width / cellsHorizontal;
  const unitLengthY = height / cellsVertical;

  const render = Render.create({
    element: document.body,
    engine: engine,
    options: {
      wireframes: false,
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
    Bodies.rectangle(width / 2, 0, width, 2, {
      label: "border",
      isStatic: true,
      render: { fillStyle: "red" },
    }),
    Bodies.rectangle(width / 2, height, width, 2, {
      label: "border",
      isStatic: true,
      render: { fillStyle: "red" },
    }),
    Bodies.rectangle(0, height / 2, 2, height, {
      label: "border",
      isStatic: true,
      render: { fillStyle: "red" },
    }),
    Bodies.rectangle(width, height / 2, 2, height, {
      label: "border",
      isStatic: true,
      render: { fillStyle: "red" },
    }),
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
  const grid = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const verticals = Array(cellsVertical)
    .fill(null)
    .map(() => Array(cellsHorizontal - 1).fill(false));

  const horizontals = Array(cellsVertical - 1)
    .fill(null)
    .map(() => Array(cellsHorizontal).fill(false));

  const startRow = Math.floor(Math.random() * cellsVertical);
  const startColumn = Math.floor(Math.random() * cellsHorizontal);

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
        nextRow >= cellsVertical ||
        nextColumn < 0 ||
        nextColumn >= cellsHorizontal
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
  };

  stepThroughCell(startRow, startColumn);

  // adding wall to canvas
  // bodies follow the pattern: (X, Y, WIDTH, HEIGHT)
  horizontals.forEach((row, rowIndex) => {
    row.forEach((open, columnIndex) => {
      if (open) return;
      else {
        const wall = Bodies.rectangle(
          columnIndex * unitLengthX + unitLengthX / 2,
          rowIndex * unitLengthY + unitLengthY,
          unitLengthX,
          2,
          { label: "wall", isStatic: true, render: { fillStyle: "Darkred" } }
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
          columnIndex * unitLengthX + unitLengthX,
          rowIndex * unitLengthY + unitLengthY / 2,
          2,
          unitLengthY,
          { label: "wall", isStatic: true, render: { fillStyle: "Darkred" } }
        );
        Composite.add(world, wall);
      }
    });
  });

  // Goal
  const goal = Bodies.rectangle(
    width - unitLengthX / 2,
    height - unitLengthY / 2,
    unitLengthX * 0.6,
    unitLengthY * 0.6,
    {
      label: "goal",
      isStatic: true,
      render: { fillStyle: "LawnGreen" },
    }
  );
  Composite.add(world, goal);

  // Player
  const ballRadius = Math.min(unitLengthX, unitLengthY) / 4;
  const ball = Bodies.circle(unitLengthX / 2, unitLengthY / 2, ballRadius, {
    label: "ball",
    render: { fillStyle: "Gold" },
  });
  Composite.add(world, ball);

  // Controls
  document.addEventListener("keydown", (event) => {
    const { x, y } = ball.velocity;

    // ball velocity based on difficulty
    const maxVelocity = difficulty <= 3 ? 8 : 5;

    if (event.code === "KeyW" || event.code === "ArrowUp") {
      Body.setVelocity(ball, { x, y: Math.min(y - 5, maxVelocity) });
    }

    if (event.code === "KeyD" || event.code === "ArrowRight") {
      Body.setVelocity(ball, { x: Math.min(x + 5, maxVelocity), y });
    }

    if (event.code === "KeyS" || event.code === "ArrowDown") {
      Body.setVelocity(ball, { x, y: Math.min(y + 5, maxVelocity) });
    }

    if (event.code === "KeyA" || event.code === "ArrowLeft") {
      Body.setVelocity(ball, { x: Math.min(x - 5, maxVelocity), y });
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
        document.querySelector(".winner").classList.remove("hidden");
        world.gravity.y = 0.5;
        world.bodies.forEach((body) => {
          if (body.label === "wall") {
            Body.setStatic(body, false);
          }
        });
      }
    });
  });
};
