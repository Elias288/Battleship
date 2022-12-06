import { Player } from "./player"

export interface Match {
    id: string
    fieldSize: number
    player1: Player | undefined
    player2: Player | undefined
    canStart: Boolean
    canPutShips: Boolean
    canPutBoats: Boolean
}
