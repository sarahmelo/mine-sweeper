import { useEffect, useState } from "react";
import { Board } from "./components/Board";
export type GameState = 'waiting' | 'playing' | 'player-won' | 'game-over'

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
                base:  10,
                outcomes: 8,
            } 
        }
    },
    medium: {
        description: 'mais ou menos',
        config: {
            totalColumns: 15,
            totalRows: 15,
            minesProbability: {
                base: 7,
                outcomes: 5,
            } 
        }
    },
}

export function App() {
    const [gameState, setGameState] = useState<GameState>('playing')
    const [gameLevel, setGameLevel] = useState<keyof Levels>('easy')

    useEffect(
        () => {
            setGameState('waiting')
        },
        [gameLevel]
    )

    const handleOnPlayerStartPlaying = () => {
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
                    onPlayerStartPlaying={handleOnPlayerStartPlaying}
                    { ...levels[gameLevel].config }
                />
            ) : ''
        }
        </>
    )
}