import { type } from "@testing-library/user-event/dist/type";
import React, { Children, useEffect, useState } from "react"
import { Tile, TileProps } from "./Tile";

type TileState = Pick<TileProps, 'wasRevealed' | 'hasMine' | 'minesAround' | 'positionX' | 'positionY'>;
type GameBoard = TileState[][];
type GameState = 'paused' | 'playing' | 'game-over' | 'finished';
type BoardProps = {
    currentGameState: GameState,
    onGameStart: () => void,
    onGameOver: () => void,
}

export function Board() {
    const [board, setBoard] = useState<GameBoard>([]);
    const [minesPosition, setMinesPosition] = useState<TileState[]>([])
    const totalRows = 10; 
    const totalColumns = 10;

    // inicializa o board
    useEffect(
        () => {
            // passa para o função createNewBoard o totalRows, totalColumns e o estado inicial do piso, para que o board seja definido.
            const newBoard = createNewBoard(totalRows, totalColumns, getInitialTileState);

            // redefini o board inicial para o novo board inicializado
            setBoard(newBoard);
        },
        []
    )

    // estado de inicialização do piso
    // recebendo sua posição e suas proprieades sendo refinidas
    const getInitialTileState = (
        positionX: number,
        positionY: number,
    ): TileState => ({
        wasRevealed: false,
        hasMine: Math.random() * 10 > 9,
        minesAround: 0,
        positionX,
        positionY,
    })

    // para criar o board, precisamos do total de linhas e colunas
    const createNewBoard = (
        totalRows: number, 
        totalColumns: number,
        createStateFn: (positionX: number, positionY: number) => TileState,
    ): GameBoard => {
        // criamos um array com 10 de largura (não existe index), depois preenchemos a largura com uma string vazia
        // ['','','','','','','','','','']
        // após percorrer, criamos um novo array que irá substituir cada string vazia, e em cada posição desse novo array, passamos o piso com sua posição. 
        const mines: TileState[] = []
    
        const board = Array(totalRows).fill('').map((_, rowIndex) =>
            Array(totalColumns).fill('').map((_, columIndex) => {
                const tile = createStateFn(rowIndex, columIndex)

                if (tile.hasMine) {
                    mines.push(tile)
                }

                return tile
            })
        )

        
        // retorne o board definido
        setMinesPosition([...mines])
        return board
    }

    console.log('=====>', minesPosition)


    // vamos coletar os vizinhos
    const getNeighbors = (positionX: number, positionY: number) => {
        let neighbors: TileState[] = [];
        
        // fazemos um loop na qual, criamos um offsetX que inicia como -1, e na terceira vez irá parar de somar offSet
        // visto que usamos o floot fill de 8 direções, termos para cada ponta a ponta, 3 pisos, por isso começamos com -1
        // primeira: -1, segunda: offset++ = 0, primera: offset++ = 1 | isso nos da 3 pisos, um loop de 3 voltas completas
        // Flood fill => https://en.wikipedia.org/wiki/Flood_fill
        for (let offsetX = - 1; offsetX <= 1; offsetX++) {
            let currentX = positionX + offsetX;

            // agora ciramos um mesmo loop, mas agora para o posição y, offsetY
            // a ideia é a volta do loop, andar 1 casa na vertical e outra na horizontal
            for (let offsetY = -1; offsetY <= 1; offsetY++) {
                let currentY = positionY + offsetY;

                if ( 
                    currentX > -1 && 
                    currentY > -1 && 
                    currentX < totalRows && 
                    currentY < totalColumns
                ) {
                    neighbors.push(board[currentX][currentY]);
                }
            }
        }
        
        return neighbors
    }

    const countMinesInNeighbors = (neighbors: TileState[]) => {
        return neighbors.reduce((acc, tile) => {
            if(tile.hasMine) {
                acc++
            }
            
            return acc;
        },0)
    }

    const getCurrentTile = (
        positionX: number,
        positionY: number,
    )  => {

        console.log('chamou')
        return board[positionX][positionY]
    }

    const floodFill = (
        positionX: number,
        positionY: number,
    ) => {
        let currentTile = getCurrentTile(positionX, positionY);
       
        if (currentTile.wasRevealed || currentTile.hasMine) return
        
        const neighbors = getNeighbors(positionX, positionY);
        const minesAround = countMinesInNeighbors(neighbors);
        
        revealTile(positionX, positionY, minesAround)

        neighbors.forEach((neighbor) => {
            if (!neighbor.wasRevealed && !minesAround) {
                floodFill(neighbor.positionX,neighbor.positionY)
            }
        })
    }

    const revealMines = () => {
        minesPosition.forEach(({ positionX, positionY}) => {
            revealTile(positionX, positionY)
        })
    }

    const handleTileClick = (
        positionX: number,
        positionY: number,
    ): void => {
        const currentTile = getCurrentTile(positionX, positionY)

        if (currentTile.hasMine) {
            return revealMines()
        }
        
        floodFill(positionX,positionY)
    }

    const revealTile = (
        positionX: number,
        positionY: number,
        minesAround: number = 0,
        boardCopy: GameBoard = [...board],
    ) => {
        const newTileState = { 
            ...boardCopy[positionX][positionY],
            wasRevealed: true,
            minesAround,
        };

        boardCopy[positionX][positionY] = newTileState;
        setBoard([...boardCopy]);
    }

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(10, 30px)',
            gridTemplateRows: 'repeat(10, 30px)',
            gap: '1px',
        }}>
            {
                board.map((row, rowIndex) => (
                    row.map(({wasRevealed, hasMine, minesAround}, colIndex) => (
                        <Tile 
                            key={`${rowIndex}-${colIndex}`} 
                            positionX={rowIndex}
                            positionY={colIndex}
                            onClick={handleTileClick}
                            wasRevealed={wasRevealed}
                            hasMine={hasMine}
                            minesAround={minesAround}
                        >
                            {wasRevealed}
                        </Tile>
                    ))
                ))
            }
        </div>
    )
}