import { useEffect, useState } from "react";
import { Board } from "../components/Board";

type UseBordProps = {
    rows: number,
    cols: number,
}

export function useBoard({ rows, cols }: UseBordProps) {
    const [board, setBoard] = useState<Board>([]);

    useEffect(() => {
        const newBoard = createBoard({ rows, cols }, createTileState);
        setBoard(newBoard);
    }, [rows, cols])

    const createTileState = (coordinates: Coordinate2D): Tile => ({
        wasRevealed: false,
        hasMine: false,
        minesAround: 0,
        isFlagged: false,
        coordinates,
    })

    const createBoard = (
        { rows, cols }: { rows: number, cols: number },
        createStateFn: (coordinates: Coordinate2D) => Tile,
    ): Board => (
        Array(rows).fill('').map((_, positionX) => 
            Array(cols).fill('').map((_, positionY) => createStateFn({ positionX, positionY}))
        )
    ) 

    return [board, setBoard] as const
}