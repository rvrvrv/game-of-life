const CtrlBtn = props => (
  <button onClick={props.onCtrl} data-ctrl={props.ctrl}>
    {props.icon}
  </button>
);

const ButtonGroup = props => (
  <div style={{ textAlign: 'center', marginBottom: 10 }}>
    <CtrlBtn
      running={props.running}
      ctrl={'PlayPause'}
      icon={
        props.running ? (
          <i className="fa fa-pause" data-ctrl="PlayPause" />
        ) : (
          <i className="fa fa-play" data-ctrl="PlayPause" />
        )
      }
      onCtrl={props.onCtrl}
    />
    <CtrlBtn icon={<i className="fa fa-retweet" />} onCtrl={props.onCtrl} />
    <CtrlBtn
      icon={<i className="fa fa-expand" data-ctrl="Grow" />}
      onCtrl={props.onCtrl}
      ctrl={'Grow'}
    />
    <CtrlBtn
      icon={<i className="fa fa-compress" data-ctrl="Shrink" />}
      onCtrl={props.onCtrl}
      ctrl={'Shrink'}
    />
  </div>
);

class Cell extends React.Component {
  constructor() {
    super();
  }
  render() {
    const aliveColor = this.props.alive ? '#990' : '#000';
    return (
      <div
        style={{
          backgroundColor: aliveColor,
          border: '.1vh solid #333',
          width: this.props.cellSize,
          minHeight: this.props.cellSize
        }}
      />
    );
  }
}

const GridRow = props => (
  <div
    style={{
      display: 'flex',
      justifyContent: 'center'
    }}
  >
    {props.cells.map(status => (
      <Cell
        alive={status}
        cellSize={`${((700 - props.cells.length) /
          (11 * props.cells.length)).toFixed(2)}vh`}
      />
    ))}
  </div>
);

const Grid = props => (
  <div>{props.cells.map(row => <GridRow cells={row} />)}</div>
);

class GridContainer extends React.Component {
  constructor() {
    super();
    this.timer;
    this.state = { running: false, cells: [], gen: 0, size: 35 };
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
  handleClick(e) {
    const ctrl = e.target.dataset.ctrl;
    // Play/Pause buttons
    if (ctrl === 'PlayPause') {
      return this.setState(prevState => ({ running: !prevState.running }));
    }
    // Grow/Shrink buttons
    if (ctrl === 'Grow' || ctrl === 'Shrink') {
      if (ctrl === 'Grow' && this.state.size < 86) {
        this.setState(prevState => ({
          size: prevState.size + 10,
          running: false
        }));
        return this.restartGame();
      }
      if (ctrl === 'Shrink' && this.state.size > 14) {
        this.setState(prevState => ({
          size: prevState.size - 10,
          running: false
        }));
        return this.restartGame();
      }
    } else return this.restartGame(); // Restart button
  }

  // Restart game with a new grid
  restartGame() {
    // Restore initial state
    this.setState({ running: false, cells: [], gen: 0 }, () => {
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
      _c[btmRow][rightSide]
    ];
    // Return total number of living neighbors for one cell
    return cellNeighbors.filter(alive => alive).length;
  }

  // Generate a random grid
  randomGrid() {
    const newGrid = [];
    let newRow = [];
    for (let i = 0; i < this.state.size; i++) {
      for (let j = 0; j < this.state.size; j++) {
        newRow.push(Math.random() < 0.15);
      }
      newGrid.push(newRow);
      newRow = [];
    }
    this.setState({ cells: newGrid });
  }

  render() {
    return (
      <div>
        <ButtonGroup
          onCtrl={this.handleClick.bind(this)}
          running={this.state.running}
        />
        <Grid cells={this.state.cells} size={this.state.size} />
        <h3
          style={{
            color: '#990',
            textAlign: 'center',
            fontFamily: 'Tahoma'
          }}
        >
          Generation {this.state.gen}
        </h3>
      </div>
    );
  }
}

const App = () => <GridContainer />;
ReactDOM.render(<App />, document.getElementById('root'));
