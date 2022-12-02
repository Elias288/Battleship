import { Player } from "./player"

export interface Match {
    id: string
    fieldSize: number
    player1: Player
    player2: Player
    canStart: Boolean
    canPutShips: Boolean
}
