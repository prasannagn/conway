let $ = (select, parent) => {
    return (parent || document).querySelector(select);
};

class Model {
    constructor(seed) {
        this.board = seed;
        this.size = seed.size;
    }

    next() {
        const self = this;
        this.previous = Model.cloneArray(this.board);

        this.board.forEach((row, rowIndex)=> {
            row.forEach((value, columnIndex)=> {
                var alive = !!value;
                let aliveNeighbors = Model.aliveNeighbors(self.previous, rowIndex, columnIndex);
                if (alive) {
                    if (aliveNeighbors < 2 || aliveNeighbors > 3) {
                        row[columnIndex] = 0;
                    }
                } else if (aliveNeighbors == 3) {
                    row[columnIndex] = 1;
                }
            });
        });
    }

    getBoard() {
        return this.board;
    }

    static aliveNeighbors(array, row, column) {
        let previousRow = array[row - 1] || [];
        let nextRow = array[row + 1] || [];
        let neighbors = [
            previousRow[column - 1], previousRow[column], previousRow[column + 1],
            array[row][column - 1], array[row][column + 1],
            nextRow[column - 1], nextRow[column], nextRow[column + 1]
        ];

        return neighbors.reduce((acc, active)=> {
            return acc + +!!active;
        }, 0);
    }

    toString() {
        return this.board.map((row)=> {
            return row.join();
        }).join("\n");
    }

    static cloneArray(array) {
        return array.slice().map(function (row) {
            return row.slice();
        });
    }
}


class View {

    constructor(grid, size) {
        this.grid = grid;
        this.size = size;
        this.checkBoxes = [];
        this.started = false;
    }

    render() {
        let fragment = document.createDocumentFragment();
        this.grid.innerHTML = '';
        for (let i = 0; i < this.size; i++) {
            let row = document.createElement('tr');
            this.checkBoxes[i] = [];
            for (let j = 0; j < this.size; j++) {
                let col = document.createElement('td');
                let checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                col.appendChild(checkbox);
                row.appendChild(col);
                this.checkBoxes[i][j] = checkbox;
            }
            fragment.appendChild(row);
        }
        this.grid.appendChild(fragment);

        this.bind();
    }

    board() {
        return this.checkBoxes.map((row)=> {
            return row.map((checkbox)=> {
                return +checkbox.checked;
            });
        });
    }

    paint(board) {
        let self = this;
        board.forEach((row, rowIndex)=> {
            row.forEach((value, columnIndex)=> {
                self.checkBoxes[rowIndex][columnIndex].checked = !!value;
            });
        });
    }

    bind() {
        let self = this;
        $(".next").addEventListener("click", (event)=> {
            self.next();
        });

        $('#autoplay').addEventListener('change', function () {
            if (this.checked) {
                self.autoplay = this.checked;
                self.next();
            }
            else {
                self.autoplay = this.checked;
                clearTimeout(self.timer);
            }
        });

    }

    next() {
        let self = this;
        if (!this.started) {
            this.model = new Model(this.board());
            this.started = true;
        }

        this.model.next();
        this.paint(this.model.getBoard());

        if (this.autoplay) {
            this.timer = setTimeout(function () {
                self.next();
            }, 1000);
        }
    }
}

let view = new View($('.grid'), 12);
view.render();