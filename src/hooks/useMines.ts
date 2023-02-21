import React, { useMemo, useState } from "react" 
import { Board } from "../components/Board"
import { randomIntFromInterval } from "../utils/randomInInterval"

type useMinesProps = {
    board: Board,
    minesCount: number,
}

export function useMines({ board, minesCount }: useMinesProps) {
    const [positions, setPositions] = useState<Coordinate2D[]>([])

    const handlers = useMemo(() => ({
        detonateAllMines: (
            callback: (coordinates: Coordinate2D) => void
        ): void => {
            positions?.forEach(({ positionX, positionY }) => {
                if(!board[positionX][positionY].isFlagged) callback({ positionX,positionY })
            })
        },

        handleSetMines: (coordinatesToIgnore: Coordinate2D) => {
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
    
            setPositions(mines)
            return boardCopy
        }
    }),[board, minesCount, positions])


    return [positions, setPositions, handlers] as const
}
