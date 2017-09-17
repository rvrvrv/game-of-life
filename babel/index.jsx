class CtrlBtn extends React.Component {
  constructor() {
    super();
    this.state = { isHovered: false };
  }

  render() {
    const btnStyle = {
      backgroundColor: '#000',
      color: '#990',
      border: '1px solid #990',
      borderRadius: 3,
      fontSize: 24,
      height: 50,
      width: 50
    };
    return (
      <button
        style={btnStyle}
        onClick={this.props.onClick}
        data-ctrl={this.props.ctrl}
      >
        {this.props.icon}
      </button>
    );
  }
}
const ButtonGroup = props => (
  <div style={{ textAlign: 'center', marginBottom: 10 }}>
    <CtrlBtn
      onClick={props.onClick}
      running={props.running}
      ctrl={'PlayPause'}
      icon={
        props.running ? (
          <i className="fa fa-pause" />
        ) : (
          <i className="fa fa-play" />
        )
      }
    />
    <CtrlBtn onClick={props.onClick} icon={<i className="fa fa-retweet" />} />
  </div>
);

class Cell extends React.Component {
  render() {
    const aliveColor = this.props.alive ? '#990' : '#000';
    return (
      <div
        style={{
          backgroundColor: aliveColor,
          border: '1px double #333',
          width: '1.3vh',
          minHeight: '1.3vh'
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
    {props.cells.map(status => <Cell alive={status} />)}
  </div>
);

const Grid = props => (
  <div>{props.cells.map(row => <GridRow cells={row} />)}</div>
);

class GridContainer extends React.Component {
  constructor() {
    super();
    this.state = { running: 'false', cells: [], gen: 0, size: 50 };
  }

  // Upon load, create a random grid and begin life
  componentDidMount() {
    this.restartGame();
    setInterval(() => {
      if (this.state.running) this.iterateLife();
    }, 100);
    // setTimeout(() => this.setState({ running: false }), 20000);
  }

  // Handle clicks from ButtonGroup
  handleClick(e) {
    // Play/Pause button
    if (e.target.dataset.ctrl === 'PlayPause') {
      this.setState(prevState => ({ running: !prevState.running }));
    } else {
      // Restart button
      this.restartGame();
    }
  }

  // Restart game with a new grid
  restartGame() {
    // Restore initial state
    this.setState({ running: 'false', cells: [], gen: 0 }, () => {
      // Create a random grid
      this.randomGrid();
      // Restart running state
      this.setState({ running: 'true' });
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
        newRow.push(Math.random() < 0.2);
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
          onClick={this.handleClick.bind(this)}
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
