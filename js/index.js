"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CtrlBtn = function CtrlBtn(props) {
  return React.createElement(
    "button",
    { onClick: props.onCtrl, "data-ctrl": props.ctrl },
    props.icon
  );
};

var ButtonGroup = function ButtonGroup(props) {
  return React.createElement(
    "div",
    { style: { textAlign: "center", marginBottom: 10 } },
    React.createElement(CtrlBtn, {
      running: props.running,
      ctrl: "PlayPause",
      icon: props.running ? React.createElement("i", { className: "fa fa-pause", "data-ctrl": "PlayPause" }) : React.createElement("i", { className: "fa fa-play", "data-ctrl": "PlayPause" }),
      onCtrl: props.onCtrl
    }),
    React.createElement(CtrlBtn, { icon: React.createElement("i", { className: "fa fa-retweet" }), onCtrl: props.onCtrl }),
    React.createElement(CtrlBtn, {
      icon: React.createElement("i", { className: "fa fa-expand", "data-ctrl": "Grow" }),
      onCtrl: props.onCtrl,
      ctrl: "Grow"
    }),
    React.createElement(CtrlBtn, {
      icon: React.createElement("i", { className: "fa fa-compress", "data-ctrl": "Shrink" }),
      onCtrl: props.onCtrl,
      ctrl: "Shrink"
    })
  );
};

var Cell = function (_React$Component) {
  _inherits(Cell, _React$Component);

  function Cell() {
    _classCallCheck(this, Cell);

    return _possibleConstructorReturn(this, _React$Component.call(this));
  }

  Cell.prototype.render = function render() {
    var aliveColor = this.props.alive ? "#990" : "#000";
    return React.createElement("div", {
      style: {
        backgroundColor: aliveColor,
        border: ".1vh solid #333",
        width: this.props.cellSize,
        minHeight: this.props.cellSize
      }
    });
  };

  return Cell;
}(React.Component);

var GridRow = function GridRow(props) {
  return React.createElement(
    "div",
    {
      style: {
        display: "flex",
        justifyContent: "center"
      }
    },
    props.cells.map(function (status) {
      return React.createElement(Cell, {
        alive: status,
        cellSize: ((700 - props.cells.length) / (11 * props.cells.length)).toFixed(2) + "vh"
      });
    })
  );
};

var Grid = function Grid(props) {
  return React.createElement(
    "div",
    null,
    props.cells.map(function (row) {
      return React.createElement(GridRow, { cells: row });
    })
  );
};

var GridContainer = function (_React$Component2) {
  _inherits(GridContainer, _React$Component2);

  function GridContainer() {
    _classCallCheck(this, GridContainer);

    var _this2 = _possibleConstructorReturn(this, _React$Component2.call(this));

    _this2.timer;
    _this2.state = { running: false, cells: [], gen: 0, size: 35 };
    return _this2;
  }

  // Upon load, create a random grid and begin life

  GridContainer.prototype.componentDidMount = function componentDidMount() {
    var _this3 = this;

    this.restartGame();
    this.timer = setInterval(function () {
      if (_this3.state.running) _this3.iterateLife();
    }, 100);
  };

  // Clear timer upon unmount

  GridContainer.prototype.componentWillUnmount = function componentWillUnmount() {
    clearInterval(this.timer);
  };

  // Handle clicks from ButtonGroup

  GridContainer.prototype.handleClick = function handleClick(e) {
    var ctrl = e.target.dataset.ctrl;
    //Play/Pause buttons
    if (ctrl === "PlayPause") return this.setState(function (prevState) {
      return { running: !prevState.running };
    });
    //Grow/Shrink buttons
    if (ctrl === "Grow" || ctrl === "Shrink") {
      if (ctrl === "Grow" && this.state.size < 86) {
        this.setState(function (prevState) {
          return {
            size: prevState.size + 10,
            running: false
          };
        });
        return this.restartGame();
      }
      if (ctrl === "Shrink" && this.state.size > 14) {
        this.setState(function (prevState) {
          return {
            size: prevState.size - 10,
            running: false
          };
        });
        return this.restartGame();
      }
    } else
      //Restart button
      this.restartGame();
  };

  // Restart game with a new grid

  GridContainer.prototype.restartGame = function restartGame() {
    var _this4 = this;

    // Restore initial state
    this.setState({ running: false, cells: [], gen: 0 }, function () {
      // Create a random grid
      _this4.randomGrid();
      // Restart running state
      _this4.setState({ running: true });
    });
  };

  // Iterate life, based on Conway's rules

  GridContainer.prototype.iterateLife = function iterateLife() {
    var _this5 = this;

    // Ensure the grid should be running
    if (!this.state.running) return;
    // Create a deep clone of the current cells, which will be replaced by the next grid
    var nextGrid = JSON.parse(JSON.stringify(this.state.cells));
    // Iterate through each row of cells
    this.state.cells.forEach(function (row, rowIdx) {
      // Implement Conway's rules
      row.forEach(function (cell, cellIdx) {
        var neighbors = _this5.tallyNeighbors(rowIdx, cellIdx);
        // Live cells with < 2 or > 3 neighbors should die
        if (cell) nextGrid[rowIdx][cellIdx] = !!(neighbors === 2 || neighbors === 3);
        // Dead cells with 3 neighbors should become alive
        if (!cell) nextGrid[rowIdx][cellIdx] = !!(neighbors === 3);
      });
    });
    // Update state with next generation of cells
    this.setState(function (prevState) {
      return { cells: nextGrid, gen: prevState.gen + 1 };
    });
  };

  // Count how many living neighbors a specific cell has

  GridContainer.prototype.tallyNeighbors = function tallyNeighbors(rowIdx, cellIdx) {
    // Get largest row/column index
    var maxIdx = this.state.size - 1;
    // Indices of each neighbor (with built-in wraparound checks)
    var topRow = rowIdx === 0 ? maxIdx : rowIdx - 1; // Wraparound top edge
    var btmRow = rowIdx === maxIdx ? 0 : rowIdx + 1; // Wraparound bottom edge
    var leftSide = cellIdx === 0 ? maxIdx : cellIdx - 1; // Wraparound left edge
    var rightSide = cellIdx === maxIdx ? 0 : cellIdx + 1; // Wraparound right edge
    var _c = this.state.cells; // Temp var for typing brevity
    // Store values of all neighbors
    var cellNeighbors = [_c[topRow][leftSide], _c[topRow][cellIdx], _c[topRow][rightSide], _c[rowIdx][leftSide], _c[rowIdx][rightSide], _c[btmRow][leftSide], _c[btmRow][cellIdx], _c[btmRow][rightSide]];
    // Return total number of living neighbors for one cell
    return cellNeighbors.filter(function (alive) {
      return alive;
    }).length;
  };

  // Generate a random grid

  GridContainer.prototype.randomGrid = function randomGrid() {
    var newGrid = [];
    var newRow = [];
    for (var i = 0; i < this.state.size; i++) {
      for (var j = 0; j < this.state.size; j++) {
        newRow.push(Math.random() < 0.15);
      }
      newGrid.push(newRow);
      newRow = [];
    }
    this.setState({ cells: newGrid });
  };

  GridContainer.prototype.render = function render() {
    return React.createElement(
      "div",
      null,
      React.createElement(ButtonGroup, {
        onCtrl: this.handleClick.bind(this),
        running: this.state.running
      }),
      React.createElement(Grid, { cells: this.state.cells, size: this.state.size }),
      React.createElement(
        "h3",
        {
          style: {
            color: "#990",
            textAlign: "center",
            fontFamily: "Tahoma"
          }
        },
        "Generation ",
        this.state.gen
      )
    );
  };

  return GridContainer;
}(React.Component);

var App = function App() {
  return React.createElement(GridContainer, null);
};
ReactDOM.render(React.createElement(App, null), document.getElementById("root"));
