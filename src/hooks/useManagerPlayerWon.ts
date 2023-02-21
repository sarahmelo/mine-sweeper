import { useEffect } from "react"

export type UseManagerPlayerWon = {
    board: Board,
    noMoreFlagsAvailable: boolean,
    hasMines: boolean,
    callback: () => void
}

export function useManagerPlayerVictory({
    board,
    noMoreFlagsAvailable,
    hasMines,
    callback,
}: UseManagerPlayerWon) {
    useEffect(() => {
        if (!noMoreFlagsAvailable && hasMines) {
            const playerWon = board.every((row) => 
                row.every((tile) => 
                    tile.hasMine ? tile.isFlagged : tile.wasRevealed
                )
            )

            if (playerWon) callback()
        }

    }, [board, noMoreFlagsAvailable, hasMines, callback])
}