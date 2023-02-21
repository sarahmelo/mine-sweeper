import { useEffect, useState } from "react";

type UseFlagsProps = {
    minesCount: number,
}

export function useFlags({ minesCount }: UseFlagsProps) {
    const [flagsAvailable, setFlagsAvailable] = useState<number>(minesCount);

    useEffect(() => {
        setFlagsAvailable(minesCount)
    }, [minesCount])

    return [flagsAvailable, setFlagsAvailable] as const
}