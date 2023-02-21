import { useEffect, useState } from "react";
import { Board } from "./components/Board";
export type GameState = 'waiting' | 'playing' | 'player-won' | 'game-over'

type LevelConfig = {
    totalColumns: number,
    totalRows: number,
    minesCount: number,
}

type Level = { 
    description: string,
    config: LevelConfig
}

type Levels = Record<'beginner' | 'intermediate' | 'expert', Level>

const levels: Levels = {
    beginner: {
        description: 'Bem facil, geito para bebes',
        config: {
            totalColumns: 8,
            totalRows: 8,
            minesCount: 10,
        }
    },
    intermediate: {
        description: 'mais ou menos',
        config: {
            totalColumns: 16,
            totalRows: 16,
            minesCount: 20,
        }
    },
    expert: {
        description: 'hardcore',
        config: {
            totalColumns: 32,
            totalRows: 32,
            minesCount: 99,
        }
    },
}

export function App() {
    const [gameState, setGameState] = useState<GameState>('playing')
    const [gameLevel, setGameLevel] = useState<keyof Levels>('beginner')

    useEffect(
        () => {
            setGameState('waiting')
        },
        [gameLevel]
    )

    const handlePlayerFirstMove = () => {
        setGameState('playing')
    }

    const handleOnGameOver = () => {
        setGameState('game-over')
    }

    const handlePlayerWon = () => {
        setGameState('player-won')
    }

    const handleLevelChange = (level: keyof Levels)  => {
        setGameLevel(level)
    }
    
    return (
        <>
        {
            Object.keys(levels).map((level) => (
                <button 
                    disabled={gameState === 'playing'}
                    key={level}
                    onClick={() => handleLevelChange(level as keyof Levels)}
                >
                    {level}
                </button>
            ))
        }
        <div>{gameState}</div>
        {
            gameLevel ? (
                <Board
                    gameState={gameState}
                    onGameOver={handleOnGameOver}
                    onPlayerWon={handlePlayerWon}
                    onPlayerFirstAction={handlePlayerFirstMove}
                    { ...levels[gameLevel].config }
                />
            ) : ''
        }
        </>
    )
}