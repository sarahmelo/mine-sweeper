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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                backgroundColor: wasRevealed ? 'pink' : 'gray',
            }}
        >
           { wasRevealed && (hasMine ? 'M' : (!!minesAround ? minesAround: '')) }
        </div>
    )
}