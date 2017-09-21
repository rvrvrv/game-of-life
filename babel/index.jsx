const CtrlBtn = props =>
  (<button
    onClick={props.onCtrl}
    onMouseEnter={props.onHover}
    onMouseLeave={props.onLeave}
    data-ctrl={props.ctrl}
  >
    {props.icon}
  </button>);

class ButtonGroup extends React.Component {
  constructor() {
    super();
    this.state = { hovered: false, ctrlText: null };
  }

  componentWillReceiveProps(nextProps) {
  // Ensure Play/Pause tooltip text updates
    if (
      !this.props.running &&
    nextProps.running &&
    this.state.ctrlText === 'Play'
    ) {
      this.setState({ ctrlText: 'Pause' });
    } else if (
      this.props.running &&
    !nextProps.running &&
    this.state.ctrlText === 'Pause'
    ) {
      this.setState({ ctrlText: 'Play' });
    }
  }

// Display tooltip text when hovering over buttons
handleHover = (e) => {
  let ctrlText = e.target.dataset.ctrl;
  switch (ctrlText) {
    case 'Clear':
    case 'Grow':
    case 'Shrink':
      ctrlText += ' Grid';
      break;
    case 'Restart':
      ctrlText += ' Game';
      break;
    default:
      ctrlText = this.props.running ? 'Pause' : 'Play';
  }
  this.setState({ hovered: true, ctrlText });
};

// Clear tooltip text
exitHover = () => {
  this.setState({ hovered: false });
};

render() {
  const spinner = this.props.running
    ? <i className="fa fa-spin fa-minus" />
    : <i className="fa fa-hourglass-2" />;
  return (
    <div>
      <CtrlBtn
        ctrl="Clear"
        icon={<i className="fa fa-exclamation-triangle" data-ctrl="Clear" />}
        onCtrl={this.props.onCtrl}
        onHover={this.handleHover}
        onLeave={this.exitHover}
      />
      <CtrlBtn
        ctrl="Restart"
        icon={<i className="fa fa-retweet" data-ctrl="Restart" />}
        onCtrl={this.props.onCtrl}
        onHover={this.handleHover}
        onLeave={this.exitHover}
      />
      <CtrlBtn
        ctrl="PlayPause"
        icon={
          this.props.running
            ? <i className="fa fa-pause" data-ctrl="PlayPause" />
            : <i className="fa fa-play" data-ctrl="PlayPause" />
        }
        onCtrl={this.props.onCtrl}
        onHover={this.handleHover}
        onLeave={this.exitHover}
      />
      <CtrlBtn
        ctrl={'Grow'}
        icon={<i className="fa fa-expand" data-ctrl="Grow" />}
        onCtrl={this.props.onCtrl}
        onHover={this.handleHover}
        onLeave={this.exitHover}
      />
      <CtrlBtn
        ctrl={'Shrink'}
        icon={<i className="fa fa-compress" data-ctrl="Shrink" />}
        onCtrl={this.props.onCtrl}
        onHover={this.handleHover}
        onLeave={this.exitHover}
      />
      <h3 style={{ margin: 5 }}>
        {this.state.hovered ? this.state.ctrlText : spinner}
      </h3>
    </div>
  );
}
}

const Cell = props =>
  (<div
    style={{
      backgroundColor: props.alive ? '#990' : '#000',
      border: '1px solid #110',
      width: props.cellSize,
      minHeight: props.cellSize,
    }}
  />);

const GridRow = props =>
  (<div
    style={{
      display: 'flex',
      justifyContent: 'center',
    }}
  >
    {props.cells.map(status =>
      (<Cell
        alive={status}
        cellSize={`${((700 - props.cells.length) /
        (11 * props.cells.length)).toFixed(2)}vh`}
      />),
    )}
  </div>);

const Grid = props =>
  <div>{props.cells.map(row => <GridRow cells={row} />)}</div>;

class GridContainer extends React.Component {
  constructor() {
    super();
    this.timer = null;
    this.state = {
      running: false,
      cleared: false,
      cells: [],
      gen: 0,
      size: 25,
    };
  }

  // Upon load, create a random grid and begin life
  componentDidMount() {
    this.restartGame();
    this.timer = setInterval(() => {
      if (this.state.running) this.iterateLife();
    }, 100);
  }

  // Clear timer upon unmount
  componentWillUnmount() {
    clearInterval(this.timer);
  }

// Handle clicks from ButtonGroup
handleClick = (e) => {
  const ctrl = e.target.dataset.ctrl;
  // Play/Pause buttons
  if (ctrl === 'PlayPause') {
    return this.state.cleared
      ? this.restartGame()
      : this.setState(prevState => ({ running: !prevState.running }));
  }
  // Clear button
  if (ctrl === 'Clear') {
    // Stop iterating life
    return this.setState({ running: false, gen: 0 }, () => {
      // Clear the grid
      this.randomGrid(true);
    });
  }
  // Grow/Shrink buttons
  if (ctrl === 'Grow' || ctrl === 'Shrink') {
    if (ctrl === 'Grow' && this.state.size < 86) {
      this.setState(prevState => ({
        size: prevState.size + 10,
        running: false,
      }));
      return this.restartGame();
    }
    if (ctrl === 'Shrink' && this.state.size > 14) {
      this.setState(prevState => ({
        size: prevState.size - 10,
        running: false,
      }));
      return this.restartGame();
    }
  } else return this.restartGame(); // Restart button
};

// Restart game with a new grid
restartGame() {
  // Restore initial state
  this.setState({ running: false, cells: [], gen: 0, cleared: false }, () => {
    // Create a random grid
    this.randomGrid();
    // Restart running state
    this.setState({ running: true });
  });
}

// Iterate life, based on Conway's rules
iterateLife() {
  // Ensure the grid should be running
  if (!this.state.running) return;
  // Create a deep clone of the current cells, which will be replaced by the next grid
  const nextGrid = JSON.parse(JSON.stringify(this.state.cells));
  // Iterate through each row of cells
  this.state.cells.forEach((row, rowIdx) => {
    // Implement Conway's rules
    row.forEach((cell, cellIdx) => {
      const neighbors = this.tallyNeighbors(rowIdx, cellIdx);
      // Live cells with < 2 or > 3 neighbors should die
      if (cell) {
        nextGrid[rowIdx][cellIdx] = !!(neighbors === 2 || neighbors === 3);
      }
      // Dead cells with 3 neighbors should become alive
      if (!cell) nextGrid[rowIdx][cellIdx] = !!(neighbors === 3);
    });
  });
  // Update state with next generation of cells
  this.setState(prevState => ({ cells: nextGrid, gen: prevState.gen + 1 }));
}

// Count how many living neighbors a specific cell has
tallyNeighbors(rowIdx, cellIdx) {
  // Get largest row/column index
  const maxIdx = this.state.size - 1;
  // Indices of each neighbor (with built-in wraparound checks)
  const topRow = rowIdx === 0 ? maxIdx : rowIdx - 1; // Wraparound top edge
  const btmRow = rowIdx === maxIdx ? 0 : rowIdx + 1; // Wraparound bottom edge
  const leftSide = cellIdx === 0 ? maxIdx : cellIdx - 1; // Wraparound left edge
  const rightSide = cellIdx === maxIdx ? 0 : cellIdx + 1; // Wraparound right edge
  const _c = this.state.cells; // Temp var for typing brevity
  // Store values of all neighbors
  const cellNeighbors = [
    _c[topRow][leftSide],
    _c[topRow][cellIdx],
    _c[topRow][rightSide],
    _c[rowIdx][leftSide],
    _c[rowIdx][rightSide],
    _c[btmRow][leftSide],
    _c[btmRow][cellIdx],
    _c[btmRow][rightSide],
  ];
  // Return total number of living neighbors for one cell
  return cellNeighbors.filter(alive => alive).length;
}

// Generate a random grid
randomGrid(clear) {
  const newGrid = [];
  let newRow = [];
  for (let i = 0; i < this.state.size; i++) {
    for (let j = 0; j < this.state.size; j++) {
      const newValue = clear ? false : Math.random() < 0.15;
      newRow.push(newValue);
    }
    newGrid.push(newRow);
    newRow = [];
  }
  this.setState({ cells: newGrid, cleared: clear });
}

render() {
  return (
    <div>
      <ButtonGroup onCtrl={this.handleClick} running={this.state.running} />
      <Grid cells={this.state.cells} size={this.state.size} />
      <h2>Generation {this.state.gen}</h2>
    </div>
  );
}
}

const App = () => <GridContainer />;
ReactDOM.render(<App />, document.getElementById('root'));
