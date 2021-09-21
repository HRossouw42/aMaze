const { Engine, Render, Runner, Bodies, Composite, MouseConstraint, Mouse } =
  Matter;

const engine = Engine.create();
const { world } = engine;

const width = 800;
const height = 600;

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

// Click & Drag
Composite.add(
  world,
  MouseConstraint.create(engine, {
    mouse: Mouse.create(render.canvas),
  })
);

// bodies follow the pattern:
// (X, Y, WIDTH, HEIGTH)
// Walls
const walls = [
  Bodies.rectangle(400, 0, 800, 40, { isStatic: true }),
  Bodies.rectangle(400, 600, 800, 40, { isStatic: true }),
  Bodies.rectangle(0, 300, 40, 600, { isStatic: true }),
  Bodies.rectangle(800, 300, 40, 600, { isStatic: true }),
];

Composite.add(world, walls);

// Random shapes
for (let i = 0; i < 10; i++) {
  if (Math.random() > 0.5) {
    Composite.add(
      world,
      Bodies.rectangle(Math.random() * width, Math.random() * height, 50, 50)
    );
  } else {
    Composite.add(
      world,
      Bodies.circle(Math.random() * width, Math.random() * height, 35, {
        render: { fillStyle: "pink" },
      })
    );
  }
}
