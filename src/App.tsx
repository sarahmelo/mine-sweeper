import { useEffect, useState } from "react";
import { Board } from "./components/Board";
export type GameState = 'restarting' | 'waiting' | 'playing' | 'player-won' | 'game-over'

type LevelConfig = {
    totalColumns: number,
    totalRows: number,
    minesCount: number,
}

type Level = { 
    label: string,
    config: LevelConfig
}

type Levels = Record<'beginner' | 'intermediate' | 'expert', Level>

const levels: Levels = {
    beginner: {
        label: 'Beginner',
        config: {
            totalColumns: 8,
            totalRows: 8,
            minesCount: 10,
        }
    },
    intermediate: {
        label: 'Intermediate',
        config: {
            totalColumns: 16,
            totalRows: 16,
            minesCount: 20,
        }
    },
    expert: {
        label: 'Expert',
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
            if (gameState === 'restarting') {
                setGameState('waiting')
            }
        },[gameState]
    )

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
            (Object.keys(levels) as Array<keyof Levels>).map((level) => (
                <button 
                    disabled={gameState === 'playing'}
                    key={level}
                    onClick={() => handleLevelChange(level as keyof Levels)}
                >
                    {levels[level].label}
                </button>
            ))
        }
        {
            gameLevel &&
            gameState !== 'restarting' && (
                <Board
                    gameState={gameState}
                    onGameOver={handleOnGameOver}
                    onPlayerWon={handlePlayerWon}
                    onPlayerFirstAction={handlePlayerFirstMove}
                    { ...levels[gameLevel].config }
                />
            )
        }
        <div>
            <button onClick={() => setGameState('restarting')}>
                Restart
            </button>
        </div>
        </>
    )
}