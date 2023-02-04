import React, { useState } from "react"

export type TileProps = {
    positionX: number;
    positionY: number;
    children: React.ReactNode,
    wasRevealed: boolean,
    hasMine: boolean,
    minesAround: number,
    onClick: (postionX: number, positionY: number) => void
}

export function Tile({
    positionX,
    positionY,
    children,
    wasRevealed,
    hasMine,
    minesAround,
    onClick,
}: TileProps) {
    const handleOnClick = () => {
        onClick(positionX, positionY)
    }

    return (
        <div 
            onClick={handleOnClick}
            style={{
                backgroundColor: wasRevealed ? 'pink' : 'gray',
                height: '30px',
                color: 'white',
            }}
        >
           { wasRevealed && (hasMine ? 'M' : (!!minesAround ? minesAround: '')) }
        </div>
    )
}