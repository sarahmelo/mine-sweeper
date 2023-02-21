import React, { useState } from "react"

export type TileProps = Tile & {
    onLeftClick: ({positionX, positionY}: Coordinate2D) => void
    onRightClick: ({positionX, positionY}: Coordinate2D) => void
}

export function Tile({
    coordinates,
    wasRevealed,
    hasMine,
    minesAround,
    isFlagged,
    onLeftClick,
    onRightClick,
}: TileProps) {
    const handleOnLeftClick = () => {
        onLeftClick({ ...coordinates })
    }

    const handleOnRightClick = (event: React.MouseEvent) => {
        event.preventDefault();
        onRightClick({ ...coordinates });
    }

    const flaggedcorrectly = !hasMine && isFlagged

    return (
        <div 
            onClick={handleOnLeftClick}
            onContextMenu={handleOnRightClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                backgroundColor: wasRevealed ? (flaggedcorrectly ? 'red' : 'dodgerblue'): 'black',
            }}
        >
            {
                wasRevealed && !flaggedcorrectly ? (
                    hasMine ?
                    'M' : 
                    (!!minesAround && minesAround) 
                ) : (
                    isFlagged && 'F'
                )
            }
        </div>
    )
}
