const _ = require('lodash');
const keypress = require('keypress');
const lines = require('../getInput')(22, 2016).trim().split('\n').slice(2);
const aStar = require('../aStar');


const parse = line => {
  const parts = line.split(/ +/);
  const [x, y] = parts[0].match(/\d+/g);
  return {
    x: +x,
    y: +y,
    used: +parts[2].replace('T', ''),
    free: +parts[3].replace('T', ''),
    size: +parts[1].replace('T', ''),
  };
};
const correctNodes = lines.map(parse);
const maxX = _.maxBy(correctNodes, 'x').x;
const maxY = _.maxBy(correctNodes, 'y').y;
const minSize = _(correctNodes).map('size').min();

const simpleNodes = correctNodes.map(node => ({
  x: node.x,
  y: node.y,
  empty: node.used === 0,
  large: node.used > minSize,
  hasGoal: node.x === maxX && node.y ===0,
}));

const grid = toSimple(_.zip(..._.chunk(simpleNodes, maxY + 1)));

function toSimple(grid) {
  return _.map(grid, row => _.map(row, item => {
    if (item.hasGoal) return 'G';
    if (item.large) return '#';
    if (item.empty) return '_';
    return '.';
  }));
}

const write = process.stdout.write.bind(process.stdout);

function part1(nodes) {
  const wouldFit = (nodeA, nodeB) =>
    (nodeA.free >= nodeB.used && nodeB.used !== 0);
  let counter = 0;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes.length; j++) {
      if (j === i) continue;
      if (wouldFit(nodes[i], nodes[j])) counter++;
    }
  }
  console.log(counter);
}

part1(correctNodes);

const startNode = _.find(simpleNodes, 'empty');
let state = _.cloneDeep(grid);
let position = [startNode.x, startNode.y];
let stepCounter = 0;

const startState = [[startNode.x, startNode.y], [maxX, 0]];
const result = aStar({
  getNeighbours,
  isEnd,
  hashData: hash,
  startNode: startState,
});

function paintGrid(grid, steps, up = true) {
  if (up) write(`\u001b[${grid.length + 1}A`);
  write(_.map(grid, row => row.join(' ')).join('\n') + '\r');
  write('\n Steps: ' + steps + ' --- Press escape to reset\r');
  write(`\n Best path takes ${result.cost} steps.\r`);
}


paintGrid(grid, stepCounter, false);
const handleKey = name => {
  const [x, y] = position;
  if (name === 'up') {
    if (y === 0) return;
    if (state[y-1][x] === '#') return;
    state[y][x] = state[y-1][x];
    state[y-1][x] = '_';
    position = [x, y-1];
  } else if (name === 'right') {
    if (x === maxX) return;
    if (state[y][x + 1] === '#') return;
    state[y][x] = state[y][x+1];
    state[y][x+1] = '_';
    position = [x+1, y];
  } else if (name === 'down') {
    if (y === maxY) return;
    if (state[y+1][x] === '#') return;
    state[y][x] = state[y+1][x];
    state[y+1][x] = '_';
    position = [x, y+1];
  } else if (name === 'left') {
    if (x === 0) return;
    if (state[y][x-1] === '#') return;
    state[y][x] = state[y][x-1];
    state[y][x-1] = '_';
    position = [x-1, y];
  } else if (name === 'escape') {
    state = _.cloneDeep(grid);
    stepCounter = -1;
    position = [startNode.x, startNode.y];
  } else {
    return;
  }
  stepCounter++;
  paintGrid(state, stepCounter);
  if (state[0][0] === 'G') {
    console.log(`\n\nYou won after ${stepCounter} steps!`);
  }
};

function getNeighbours([[x, y], [xg, yg]]) {
  const neighbours = [];
  if (x < maxX && grid[y][x+1] !== '#') {
    if (y === yg && x+1 === xg) neighbours.push([[x+1, y], [xg-1, yg]]);
    else neighbours.push([[x+1, y], [xg, yg]]);
  }
  if (x > 0 && grid[y][x-1] !== '#') {
    if (y === yg && x-1 === xg) neighbours.push([[x-1, y], [xg+1, yg]]);
    else neighbours.push([[x-1, y], [xg, yg]]);
  }
  if (y < maxY && grid[y+1][x] !== '#') {
    if (y === yg+1 && x === xg) neighbours.push([[x, y+1], [xg, yg-1]]);
    else neighbours.push([[x, y+1], [xg, yg]]);
  }
  if (y > 0 && grid[y-1][x] !== '#') {
    if (y === yg-1 && x === xg) neighbours.push([[x, y-1], [xg, yg+1]]);
    else neighbours.push([[x, y-1], [xg, yg]]);
  }

  return neighbours;
}

function hash([[x1, y1], [x2, y2]]) {
  return `${x1},${y1}-${x2},${y2}`;
}

function isEnd([pos, [x, y]]) {
  return x === 0 && y === 0;
}

keypress(process.stdin);

process.stdin.on('keypress', (ch, key) => {
  handleKey(key.name);
  if (key && key.ctrl && key.name === 'c') {
    process.stdin.pause();
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();
