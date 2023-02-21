type Coordinate2D = {
    positionX: number,
    positionY: number,
}

type Dimensios = {
    rows: number,
    cols: number,
}

type UseBordProps = Dimensios

type Tile = {
    coordinates: Coordinate2D;
    wasRevealed: boolean,
    hasMine: boolean,
    minesAround: number,
    isFlagged: boolean,
}

type Board = Tile[][];