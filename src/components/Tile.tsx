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

    const flaggedIncorrectly = !hasMine && isFlagged

    return (
        <button 
            onClick={handleOnLeftClick}
            onContextMenu={handleOnRightClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '1rem',
                backgroundColor: wasRevealed ? (flaggedIncorrectly ? 'red' : '#c0c0c0'): '#c0c0c0',
                ...(!wasRevealed ? (
                    {
                        borderColor: 'white',
                        borderWidth: 4,
                    }
                ) : {
                    border: 0,
                })
            }}
        >
            { isFlagged && '🚩' }
            { wasRevealed && hasMine  && '💣' }
            { wasRevealed && !hasMine && !isFlagged && (!!minesAround && minesAround) }
        </button>
    )
}
