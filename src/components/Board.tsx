import { type } from "@testing-library/user-event/dist/type";
import React, { Children, useEffect, useState } from "react"
import { GameState, MinesProbability } from "../App";
import { Tile, TileProps } from "./Tile";

type TileState = Pick<TileProps, 'wasRevealed' | 'hasMine' | 'minesAround' | 'positionX' | 'positionY'>;
type GameBoard = TileState[][];
type BoardProps = {
    totalRows: number,
    totalColumns: number,
    gameState: GameState,
    onGameOver: () => void,
    minesProbability: MinesProbability
}

export function Board({
    gameState,
    totalColumns,
    totalRows,
    onGameOver,
    minesProbability,
}: BoardProps) {
    const [board, setBoard] = useState<GameBoard>([]);
    const [minesPosition, setMinesPosition] = useState<TileState[]>([])

    useEffect(
        () => {
            const newBoard = createNewBoard(totalRows, totalColumns, getInitialTileState);
            setBoard(newBoard);
        },
        [totalColumns, totalRows]
    )

    const getInitialTileState = (
        positionX: number,
        positionY: number,
    ): TileState => ({
        wasRevealed: false,
        hasMine: Math.random() * minesProbability.base > minesProbability.outcomes,
        minesAround: 0,
        positionX,
        positionY,
    })

    const createNewBoard = (
        totalRows: number, 
        totalColumns: number,
        createStateFn: (positionX: number, positionY: number) => TileState,
    ): GameBoard => {
        const mines: TileState[] = []
        const board = Array(totalRows).fill('').map((_, rowIndex) =>
            Array(totalColumns).fill('').map((_, columIndex) => {
                const tile = createStateFn(rowIndex, columIndex)

                if (tile.hasMine) {
                    mines.push(tile)
                }

                return tile
            })
        )

        setMinesPosition([...mines])
        return board
    }

    const getNeighbors = (positionX: number, positionY: number) => {
        let neighbors: TileState[] = [];

        for (let offsetX = - 1; offsetX <= 1; offsetX++) {
            let currentX = positionX + offsetX;

            for (let offsetY = -1; offsetY <= 1; offsetY++) {
                let currentY = positionY + offsetY;

                if ( 
                    currentX > -1 && 
                    currentY > -1 && 
                    currentX < totalRows && 
                    currentY < totalColumns
                ) {
                    neighbors.push(board[currentX][currentY]);
                }
            }
        }
        
        return neighbors
    }

    const countMinesInNeighbors = (neighbors: TileState[]) => {
        return neighbors.reduce((acc, tile) => {
            if(tile.hasMine) {
                acc++
            }
            
            return acc;
        },0)
    }

    const getCurrentTile = (
        positionX: number,
        positionY: number,
    )  => {
        return board[positionX][positionY]
    }

    const floodFill = (
        positionX: number,
        positionY: number,
    ) => {
        let currentTile = getCurrentTile(positionX, positionY);
       
        if (currentTile.wasRevealed || currentTile.hasMine) return
        
        const neighbors = getNeighbors(positionX, positionY);
        const minesAround = countMinesInNeighbors(neighbors);
        
        revealTile(positionX, positionY, minesAround)

        neighbors.forEach((neighbor) => {
            if (!neighbor.wasRevealed && !minesAround) {
                floodFill(neighbor.positionX,neighbor.positionY)
            }
        })
    }

    const revealMines = () => {
        minesPosition.forEach(({ positionX, positionY}) => {
            revealTile(positionX, positionY)
        })
    }

    const handleTileClick = (
        positionX: number,
        positionY: number,
    ): void => {
        if (gameState === 'game-over') {
            return;
        }

        const currentTile = getCurrentTile(positionX, positionY)

        if (!currentTile.hasMine) {
            floodFill(positionX,positionY);
            return;
        }

        onGameOver();
        revealMines();
        return;
    }

    const revealTile = (
        positionX: number,
        positionY: number,
        minesAround: number = 0,
        boardCopy: GameBoard = [...board],
    ) => {
        const newTileState = { 
            ...boardCopy[positionX][positionY],
            wasRevealed: true,
            minesAround,
        };

        boardCopy[positionX][positionY] = newTileState;
        setBoard([...boardCopy]);
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${totalColumns}, 30px)`,
            gridTemplateRows: `repeat(${totalRows}, 30px)`,
            gap: '1px',
        }}>
            {
                board.map((row, rowIndex) => (
                    row.map(({wasRevealed, hasMine, minesAround}, colIndex) => (
                        <Tile 
                            key={`${rowIndex}-${colIndex}`} 
                            positionX={rowIndex}
                            positionY={colIndex}
                            onClick={handleTileClick}
                            wasRevealed={wasRevealed}
                            hasMine={hasMine}
                            minesAround={minesAround}
                        >
                            {wasRevealed}
                        </Tile>
                    ))
                ))
            }
        </div>
    )
}