import React, { useState } from "react"

export type TileProps = {
    positionX: number;
    positionY: number;
    wasRevealed: boolean,
    hasMine: boolean,
    minesAround: number,
    isFlagged: boolean,
    onLeftClick: (postionX: number, positionY: number) => void
    onRightClick: (postionX: number, positionY: number) => void
}

export function Tile({
    positionX,
    positionY,
    wasRevealed,
    hasMine,
    minesAround,
    isFlagged,
    onLeftClick,
    onRightClick,
}: TileProps) {
    const handleOnLeftClick = () => {
        onLeftClick(positionX, positionY)
    }

    const handleOnRightClick = (event: React.MouseEvent) => {
        event.preventDefault();
        onRightClick(positionX, positionY);
    }

    return (
        <div 
            onClick={handleOnLeftClick}
            onContextMenu={handleOnRightClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                backgroundColor: wasRevealed ? 'pink' : 'gray',
            }}
        >
            {
                wasRevealed ? (
                    hasMine ? 'M' : (!!minesAround ? minesAround : '')
                ) : (
                    isFlagged && 'F'
                )
            }
        </div>
    )
}