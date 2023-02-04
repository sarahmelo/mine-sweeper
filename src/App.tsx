import { useEffect, useState } from "react";
import { Board } from "./components/Board";
export type GameState = 'paused' | 'playing' | 'game-over' | 'finished';

export type MinesProbability = {
    base: number,
    outcomes: number,
}

type LevelConfig = {
    totalColumns: number,
    totalRows: number,
    minesProbability: MinesProbability,
}

type Level = { 
    description: string,
    config: LevelConfig
}

type Levels = Record<'easy' | 'medium', Level>

const levels: Levels = {
    easy: {
        description: 'Bem facil, geito para bebes',
        config: {
            totalColumns: 10,
            totalRows: 10,
            minesProbability: {
                base: 10,
                outcomes: 9,
            } 
        }
    },
    medium: {
        description: 'mais ou menos',
        config: {
            totalColumns: 15,
            totalRows: 15,
            minesProbability: {
                base: 10,
                outcomes: 8,
            } 
        }
    },
}

export function App() {
    const [gameState, setGameState] = useState<GameState>('playing')
    const [gameLevel, setGameLevel] = useState<keyof Levels>()

    useEffect(
        () => {
            setGameState('playing')
        },
        [gameLevel]
    )

    const handleOnGameOver = () => {
        setGameState('game-over')
    }

    const handleLevelChange = (level: keyof Levels)  => {
        setGameLevel(level)
    }
    
    return (
        <>
        {
            Object.keys(levels).map((level) => (
                <button onClick={() => handleLevelChange(level as keyof Levels)}>
                    {level}
                </button>
            ))
        }
        {
            gameLevel ? (
                <Board
                    gameState={gameState}
                    onGameOver={handleOnGameOver}
                    { ...levels[gameLevel].config }
                />
            ) : ''
        }
        </>
    )
}