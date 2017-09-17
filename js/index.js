"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CtrlBtn = function (_React$Component) {
  _inherits(CtrlBtn, _React$Component);

  function CtrlBtn() {
    _classCallCheck(this, CtrlBtn);

    var _this = _possibleConstructorReturn(this, _React$Component.call(this));

    _this.state = { isHovered: false };
    return _this;
  }

  CtrlBtn.prototype.render = function render() {
    var btnStyle = {
      backgroundColor: "#000",
      color: "#990",
      border: "1px solid #990",
      borderRadius: 3,
      fontSize: 24,
      height: 50,
      width: 50
    };
    return React.createElement(
      "button",
      {
        style: btnStyle,
        onClick: this.props.onClick,
        "data-ctrl": this.props.ctrl
      },
      this.props.icon
    );
  };

  return CtrlBtn;
}(React.Component);

var ButtonGroup = function ButtonGroup(props) {
  return React.createElement(
    "div",
    { style: { textAlign: "center", marginBottom: 10 } },
    React.createElement(CtrlBtn, {
      onClick: props.onClick,
      running: props.running,
      ctrl: "PlayPause",
      icon: props.running ? React.createElement("i", { className: "fa fa-pause" }) : React.createElement("i", { className: "fa fa-play" })
    }),
    React.createElement(CtrlBtn, { onClick: props.onClick, icon: React.createElement("i", { className: "fa fa-retweet" }) })
  );
};

var Cell = function (_React$Component2) {
  _inherits(Cell, _React$Component2);

  function Cell() {
    _classCallCheck(this, Cell);

    return _possibleConstructorReturn(this, _React$Component2.call(this));
  }

  Cell.prototype.render = function render() {
    var aliveColor = this.props.alive ? "#990" : "#000";
    return React.createElement("div", {
      style: {
        backgroundColor: aliveColor,
        border: "1px double #333",
        width: "1.3vh",
        minHeight: "1.3vh"
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
      return React.createElement(Cell, { alive: status });
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

var GridContainer = function (_React$Component3) {
  _inherits(GridContainer, _React$Component3);

  function GridContainer() {
    _classCallCheck(this, GridContainer);

    var _this3 = _possibleConstructorReturn(this, _React$Component3.call(this));

    _this3.state = { running: "false", cells: [], gen: 0, size: 50 };
    return _this3;
  }

  // Upon load, create a random grid and begin life

  GridContainer.prototype.componentDidMount = function componentDidMount() {
    var _this4 = this;

    this.restartGame();
    setInterval(function () {
      if (_this4.state.running) _this4.iterateLife();
    }, 100);
    // setTimeout(() => this.setState({ running: false }), 20000);
  };

  // Handle clicks from ButtonGroup

  GridContainer.prototype.handleClick = function handleClick(e) {
    // Play/Pause button
    if (e.target.dataset.ctrl === "PlayPause") this.setState(function (prevState) {
      return { running: !prevState.running };
    });else
      // Restart button
      this.restartGame();
  };

  // Restart game with a new grid

  GridContainer.prototype.restartGame = function restartGame() {
    var _this5 = this;

    // Restore initial state
    this.setState({ running: "false", cells: [], gen: 0 }, function () {
      // Create a random grid
      _this5.randomGrid();
      // Restart running state
      _this5.setState({ running: "true" });
    });
  };

  // Iterate life, based on Conway's rules

  GridContainer.prototype.iterateLife = function iterateLife() {
    var _this6 = this;

    // Ensure the grid should be running
    if (!this.state.running) return;
    // Create a deep clone of the current cells, which will be replaced by the next grid
    var nextGrid = JSON.parse(JSON.stringify(this.state.cells));
    // Iterate through each row of cells
    this.state.cells.forEach(function (row, rowIdx) {
      // Implement Conway's rules
      row.forEach(function (cell, cellIdx) {
        var neighbors = _this6.tallyNeighbors(rowIdx, cellIdx);
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
        newRow.push(Math.random() < 0.2);
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
        onClick: this.handleClick.bind(this),
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
