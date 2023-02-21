import React, { useEffect, useState } from "react"
import { GameState } from "../App";
import { useBoard } from "../hooks/useBoard";
import { useFlags } from "../hooks/useFlags";
import { useManagerPlayerVictory } from "../hooks/useManagerPlayerWon";
import { useMines } from "../hooks/useMines";
import { Tile } from "./Tile";

type BoardProps = {
    totalRows: number,
    totalColumns: number,
    gameState: GameState,
    minesCount: number,
    onGameOver: () => void,
    onPlayerWon: () => void,
    onPlayerFirstAction: () => void,
}

export function Board({
    gameState,
    totalColumns,
    totalRows,
    minesCount,
    onGameOver,
    onPlayerWon,
    onPlayerFirstAction: onPlayerFirstMove,
}: BoardProps) {
    const [board, setBoard] = useBoard({ rows: totalColumns, cols: totalColumns })
    const [minesPosition, setMinesPosition, { detonateAllMines, handleSetMines }] = useMines({ board, minesCount });
    const [flagsAvailable, setFlagsAvailable] = useFlags({ minesCount });
    const canPlayerMakeAMove = (): boolean => gameState !== 'game-over'

    useManagerPlayerVictory({
        board,
        noMoreFlagsAvailable: !flagsAvailable,
        hasMines: !!minesPosition.length,
        callback: onPlayerWon
    })

    useEffect(() => {
        if(gameState === 'game-over') {
            detonateAllMines(revealTile)
            revealIncorrectFlags()
        }
    },[gameState])

    const onSetMines = (coordinatesToIgnore: Coordinate2D) => {
        const boardWithMines = handleSetMines(coordinatesToIgnore)
        setBoard(boardWithMines)
    }

    const getNeighbors = ({
        positionX,
        positionY,
    }: Coordinate2D): Tile[] => {
        let neighbors: Tile[] = [];

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

    const countInNeighbors = (
        key: 'hasMine' | 'isFlagged', 
        neighbors: Tile[]
    ) => {
        return neighbors.reduce((acc, tile) => tile[key] ? ++acc :  acc, 0)
    }

    const floodFill = ({
        positionX,
        positionY,
    }: Coordinate2D): void => {
        let currentTile = board[positionX][positionY]

        if (currentTile.isFlagged) return
       
        revealTile({ positionX,positionY });

        if (
            currentTile.wasRevealed || 
            currentTile.hasMine
        ) return
        
        const neighbors = getNeighbors({ positionX, positionY });
        const minesAround = countInNeighbors('hasMine', neighbors);
        
        neighbors.forEach((neighbor) => {
            if (!neighbor.wasRevealed && !minesAround) {
                floodFill(neighbor.coordinates)
            }
        })
    }

    const revealIncorrectFlags = (boardCopy: Board = [...board]): void => {
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

    const handlePlayerFirstMove = (coordinates: Coordinate2D): void => {
        onSetMines(coordinates)
        onPlayerFirstMove();
    }

    const withMoveCheck = (
        coordinates: Coordinate2D,
        callback: (coordinates: Coordinate2D) => void
    ): void => {
        if (canPlayerMakeAMove()) {
            if (gameState === 'waiting') handlePlayerFirstMove(coordinates)

            callback(coordinates)
        }
    }

    const revealUnflaggedNeighbors = (tile: Tile) => {
        if (tile.wasRevealed) {
            const neighbors = getNeighbors(tile.coordinates)
            const flagsInNeighbors = countInNeighbors('isFlagged', neighbors)

            if (flagsInNeighbors === tile.minesAround) {
                neighbors.forEach((neighbor) => {
                    if (!neighbor.isFlagged) {
                        return floodFill(neighbor.coordinates)
                    }
                })
            }
        }
    }

    const handleTileLeftClick = ({
        positionX,
        positionY,
    }: Coordinate2D): void => {
        if (board[positionX][positionY].isFlagged) return

        if (board[positionX][positionY].wasRevealed) {
            revealUnflaggedNeighbors(board[positionX][positionY])
            return
        }

        floodFill({ positionX, positionY})
    }

    const handleTileRightClick = ({
        positionX,
        positionY,
    }: Coordinate2D): void => {
        if (!board[positionX][positionY].wasRevealed) {
            toggleFlagOnTile({ positionX, positionY })   
        }
    }

    const toggleFlagOnTile = (
        { positionX, positionY }: Coordinate2D,
        boardCopy: Board = [...board],
    ): void => {        
        boardCopy[positionX][positionY] = { 
            ...boardCopy[positionX][positionY],
            isFlagged: !boardCopy[positionX][positionY].isFlagged,
        };
        
        setFlagsAvailable(current => boardCopy[positionX][positionY].isFlagged ? current++ : --current)
        setBoard([...boardCopy]);
    }

    const handleMineRevealed = () => {
        if (gameState !== 'game-over') onGameOver()
    }

    const revealTile = (
        {
            positionX,
            positionY
        }: Coordinate2D,
        boardCopy: Board = [...board],
    ): void => {
        const minesAround = countInNeighbors('hasMine',getNeighbors({ positionX,positionY })); 

        boardCopy[positionX][positionY] = { 
            ...boardCopy[positionX][positionY],
            wasRevealed: true,
            minesAround,
        }
        setBoard([...boardCopy]);

        if (boardCopy[positionX][positionY].hasMine) handleMineRevealed()
    }

    return (
        <div>
            {flagsAvailable}
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
                                onLeftClick={(coordinates) => withMoveCheck(coordinates,handleTileLeftClick)}
                                onRightClick={(coordinates) => withMoveCheck(coordinates,handleTileRightClick)}
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