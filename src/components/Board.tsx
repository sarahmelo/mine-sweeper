import { type } from "@testing-library/user-event/dist/type";
import React, { useCallback, useEffect, useState } from "react"
import { GameState } from "../App";
import { Tile, TileProps } from "./Tile";

type TileState = Omit<TileProps, 'onLeftClick' | 'onRightClick'>;
type GameBoard = TileState[][];
type BoardProps = {
    totalRows: number,
    totalColumns: number,
    gameState: GameState,
    minesCount: number,
    onGameOver: () => void,
    onPlayerWon: () => void,
    onPlayerStartPlaying: () => void,
}

export function Board({
    gameState,
    totalColumns,
    totalRows,
    minesCount,
    onGameOver,
    onPlayerWon,
    onPlayerStartPlaying,
}: BoardProps) {
    const [board, setBoard] = useState<GameBoard>([]);
    const [minesPosition, setMinesPosition] = useState<Coordinate2D[]>([]);
    const [flagsRemaining, setFlagRemaining] = useState<number>(minesCount);

    useEffect(() => {
        setFlagRemaining(minesCount)
    }, [minesCount])

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
        const newBoard = createNewBoard(totalRows, totalColumns, createInitialTileState);
        setBoard(newBoard);
    }, [totalColumns, totalRows])

    useEffect(() => {
        if(gameState === 'game-over') {
            detonateMines()
            revealIncorrectFlags()
        }
    },[gameState])

    const createInitialTileState = (coordinates: Coordinate2D): TileState => ({
        wasRevealed: false,
        hasMine: false,
        minesAround: 0,
        isFlagged: false,
        coordinates,
    })

    const randomIntFromInterval = (min: number, max: number) => {
        return Math.floor(Math.random() * (max - min) + min)
    }

    const plantMines = (coordinatesToIgnore: Coordinate2D) => {
        const boardCopy = [...board];
        const mines: Coordinate2D[] = [];
        let options = board.flat().filter(({ coordinates }) => 
            coordinates.positionX !== coordinatesToIgnore.positionX &&
            coordinates.positionY !== coordinatesToIgnore.positionY
        )

        for (let i = 0; i < minesCount; i++) {
            const randomIndex = randomIntFromInterval(0, options.length);
            let [pickedOption] = options.splice(randomIndex, 1);

            boardCopy[pickedOption.coordinates.positionX][pickedOption.coordinates.positionY] = {
                ...pickedOption,
                hasMine: true,
            }

            mines.push({ positionX: pickedOption.coordinates.positionX, positionY: pickedOption.coordinates.positionY })
        }

        setMinesPosition(mines)
        setBoard(boardCopy)
    }

    const createNewBoard = (
        totalRows: number, 
        totalColumns: number,
        createStateFn: (coordinates: Coordinate2D) => TileState,
    ): GameBoard => {
        const board = Array(totalRows).fill('').map((_, positionX) => 
            Array(totalColumns).fill('').map((_, positionY) => createInitialTileState({ positionX, positionY}))
        )

        return board
    }

    const getNeighbors = ({
        positionX,
        positionY,
    }: Coordinate2D): TileState[] => {
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

    const getTyleByPosition = ({
        positionX,
        positionY,
    }: Coordinate2D)  => {
        return ({...board[positionX][positionY]})
    }

    const floodFill = ({
        positionX,
        positionY,
    }: Coordinate2D) => {
        let currentTile = getTyleByPosition({ positionX, positionY });

        if (currentTile.isFlagged) return
       
        revealTile({ positionX,positionY });

        if (
            currentTile.wasRevealed || 
            currentTile.hasMine
        ) return
        
        const neighbors = getNeighbors({ positionX, positionY });
        const minesAround = countMinesInNeighbors(neighbors);
        
        neighbors.forEach((neighbor) => {
            if (!neighbor.wasRevealed && !minesAround) {
                floodFill({
                    positionX: neighbor.coordinates.positionX,
                    positionY: neighbor.coordinates.positionY
                })
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
            let currentTile = getTyleByPosition({ positionX, positionY })

            if(!currentTile.isFlagged) {
                revealTile({ positionX,positionY })
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

    const handleTileLeftClick = ({
        positionX,
        positionY,
    }: Coordinate2D): void => {
        if (gameState === 'waiting') {
            plantMines({ positionX, positionY })
        }

        if (!playerCanMakeAnAction()) return

        const currentTile = getTyleByPosition({ positionX, positionY })

        if (currentTile.isFlagged) return

        if (currentTile.wasRevealed) {
            const neighbors = getNeighbors({ positionX, positionY })

            const flags = neighbors.reduce((acc, curr) => {
                if (curr.isFlagged) ++acc

                return acc
            }, 0)

            if (flags === currentTile.minesAround) {
                neighbors.forEach((neighbor) => {
                    if (!neighbor.minesAround) {
                        floodFill({
                            positionX: neighbor.coordinates.positionX,
                            positionY: neighbor.coordinates.positionY,
                        })
                        return
                    }

                    if (!neighbor.isFlagged) {
                        revealTile({
                            positionX: neighbor.coordinates.positionX,
                            positionY: neighbor.coordinates.positionY
                        })
                        return
                    }
                })
            }
            return
        }

        if (!currentTile.hasMine) {
            floodFill({ positionX,positionY });
            return;
        }

        onGameOver();
        detonateMines();
        return;
    }

    const handleTileRightClick = ({
        positionX,
        positionY,
    }: Coordinate2D) => {
        const currentTile = getTyleByPosition({ positionX, positionY });

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

        boardCopy[tile.coordinates.positionX][tile.coordinates.positionY] = newTileState;
        setBoard([...boardCopy]);
    }

    const revealTile = (
        {
            positionX,
            positionY
        }: Coordinate2D,
        boardCopy: GameBoard = [...board],
    ): void => {
        const minesAround = countMinesInNeighbors(getNeighbors({ positionX,positionY })); 

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
                                coordinates,
                            }) => (
                            <Tile 
                                key={`${coordinates.positionX}-${coordinates.positionY}`}
                                coordinates={coordinates}
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