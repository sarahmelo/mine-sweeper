import { type } from "@testing-library/user-event/dist/type";
import React, { Children, useEffect, useState } from "react"
import { GameState, MinesProbability } from "../App";
import { Tile, TileProps } from "./Tile";

type TileState = Omit<TileProps, 'onLeftClick' | 'onRightClick'>;
type GameBoard = TileState[][];
type BoardProps = {
    totalRows: number,
    totalColumns: number,
    gameState: GameState,
    onGameOver: () => void,
    onPlayerWon: () => void,
    onPlayerStartPlaying: () => void,
    minesProbability: MinesProbability
}

export function Board({
    gameState,
    totalColumns,
    totalRows,
    onGameOver,
    onPlayerWon,
    onPlayerStartPlaying,
    minesProbability,
}: BoardProps) {
    const [board, setBoard] = useState<GameBoard>([]);
    const [minesPosition, setMinesPosition] = useState<Pick<TileState, 'positionX' | 'positionY'>[]>([]);
    const [flagsRemaining, setFlagRemaining] = useState<number>(0);

    useEffect(() => {
        setFlagRemaining(minesPosition?.length ?? 0)
    }, [minesPosition])

    useEffect(() => {
        if (!flagsRemaining && minesPosition.length) {
            const playerWon = board.every((row) => 
                row.every((tile) => 
                    tile.hasMine ? tile.isFlagged : tile.wasRevealed
                )
            )

            if (playerWon) onPlayerWon()
        }

    }, [board,flagsRemaining, minesPosition])

    useEffect(() => {
        const newBoard = createNewBoard(totalRows, totalColumns, getInitialTileState);
        setBoard(newBoard);
    }, [totalColumns, totalRows])

    useEffect(() => {
        if(gameState === 'game-over') {
            detonateMines()
            revealIncorrectFlags()
        }
    },[gameState])

    const getInitialTileState = (
        positionX: number,
        positionY: number,
    ): TileState => ({
        wasRevealed: false,
        hasMine: Math.random() * minesProbability.base > minesProbability.outcomes,
        minesAround: 0,
        positionX,
        positionY,
        isFlagged: false,
    })

    const createNewBoard = (
        totalRows: number, 
        totalColumns: number,
        createStateFn: (positionX: number, positionY: number) => TileState,
    ): GameBoard => {
        const mines: Pick<TileState, 'positionX' | 'positionY'>[] = []

        const board = Array(totalRows).fill('').map((_, rowIndex) =>
            Array(totalColumns).fill('').map((_, columIndex) => {
                const tile = createStateFn(rowIndex, columIndex)

                if (tile.hasMine) {
                    mines.push({
                        positionX: tile.positionX,
                        positionY: tile.positionY,
                    })
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

                const isCurrentTile = currentX === positionX && currentY === positionY

                const isInsideBoundaries = 
                    currentX > -1 && 
                    currentY > -1 && 
                    currentX < totalRows && 
                    currentY < totalColumns
                if (isInsideBoundaries && !isCurrentTile) {
                    neighbors.push(board[currentX][currentY]);
                }
            }
        }
        
        return neighbors
    }

    const countMinesInNeighbors = (neighbors: TileState[]) => {
        return neighbors.reduce((acc, tile) => tile.hasMine ? ++acc :  acc, 0)
    }

    const getTyleByPosition = (
        positionX: number,
        positionY: number,
    )  => {
        return ({...board[positionX][positionY]})
    }

    const floodFill = (
        positionX: number,
        positionY: number,
    ) => {
        let currentTile = getTyleByPosition(positionX, positionY);

        if (currentTile.isFlagged) return
       
        revealTile(positionX,positionY);

        if (
            currentTile.wasRevealed || 
            currentTile.hasMine
        ) return
        
        const neighbors = getNeighbors(positionX, positionY);
        const minesAround = countMinesInNeighbors(neighbors);
        
        neighbors.forEach((neighbor) => {
            if (!neighbor.wasRevealed && !minesAround) {
                floodFill(neighbor.positionX,neighbor.positionY)
            }
        })
    }

    const revealIncorrectFlags = () => {
        const boardCopy = [ ...board]

        for(let row = 0; row < totalRows; row++) {
            for(let col = 0; col < totalColumns; col++) {
                const currentTile = boardCopy[row][col]
                const isIncorrectlyFlagged = currentTile.isFlagged && !currentTile.hasMine

                if (isIncorrectlyFlagged) {
                    currentTile.wasRevealed = true
                }
            }
        }

        setBoard([...boardCopy])
    }

    const detonateMines = () => {
        minesPosition.forEach(({ positionX, positionY}) => {
            let currentTile = getTyleByPosition(positionX, positionY)

            if(!currentTile.isFlagged) {
                revealTile(positionX,positionY)
            }
        })
    }

    const playerCanMakeAnAction = () => {
        switch(gameState) {
            case 'waiting':
                onPlayerStartPlaying();
                return true 
            case 'game-over':
                return false
            default:
                return true
        }
    }

    const handleTileLeftClick = (
        positionX: number,
        positionY: number,
    ): void => {
        if (!playerCanMakeAnAction()) return

        const currentTile = getTyleByPosition(positionX, positionY)

        if (currentTile.isFlagged) return

        if (currentTile.wasRevealed) {
            const neighbors = getNeighbors(positionX, positionY)

            const flags = neighbors.reduce((acc, curr) => {
                if (curr.isFlagged) ++acc

                return acc
            }, 0)

            if (flags === currentTile.minesAround) {
                neighbors.forEach((neighbor) => {
                    if (!neighbor.minesAround) {
                        floodFill(neighbor.positionX, neighbor.positionY)
                        return
                    }

                    if (!neighbor.isFlagged) {
                        revealTile(neighbor.positionX, neighbor.positionY)
                        return
                    }
                })
            }
            return
        }

        if (!currentTile.hasMine) {
            floodFill(positionX,positionY);
            return;
        }

        onGameOver();
        detonateMines();
        return;
    }

    const handleTileRightClick = (
        positionX: number,
        positionY: number,
    ) => {
        const currentTile = getTyleByPosition(positionX, positionY);

        if (gameState === 'game-over') return

        toggleFlagOnTile(currentTile)
    }

    const toggleFlagOnTile = (
        tile: TileState,
        boardCopy: GameBoard = [...board],
    ) => {
        if (tile.isFlagged) {
            setFlagRemaining(current => current + 1)
        } else {
            setFlagRemaining(current => current - 1)
        }

        const newTileState: TileState = { 
            ...tile,
            isFlagged: !tile.isFlagged,
        };

        boardCopy[tile.positionX][tile.positionY] = newTileState;
        setBoard([...boardCopy]);
    }

    const revealTile = (
        positionX: number,
        positionY: number,
        boardCopy: GameBoard = [...board],
    ): void => {
        const minesAround = countMinesInNeighbors(getNeighbors(positionX,positionY)); 

        const newTileState = { 
            ...boardCopy[positionX][positionY],
            wasRevealed: true,
            minesAround,
        };

        boardCopy[positionX][positionY] = newTileState;
        setBoard([...boardCopy]);

        if (newTileState.hasMine && gameState !== 'game-over') onGameOver()
    }

    return (
        <div>
            {flagsRemaining}
            <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${totalColumns}, 40px)`,
                gridTemplateRows: `repeat(${totalRows}, 40px)`,
                gap: '2px',
            }}>
                {
                    board.map((row, rowIndex) => (
                        row.map(
                            ({
                                wasRevealed, 
                                hasMine, 
                                minesAround, 
                                isFlagged,
                                positionX,
                                positionY,
                            }) => (
                            <Tile 
                                key={`${positionX}-${positionY}`}
                                positionX={positionX}
                                positionY={positionY}
                                onLeftClick={handleTileLeftClick}
                                onRightClick={handleTileRightClick}
                                wasRevealed={wasRevealed}
                                hasMine={hasMine}
                                isFlagged={isFlagged}
                                minesAround={minesAround}
                            />
                        ))
                    ))
                }
            </div>
        </div>
    )
}