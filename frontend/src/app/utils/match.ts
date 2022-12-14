import { Player } from "./player"

export interface Match {
    id: string
    fieldSize: number
    players: Array<Player> 
    canStart: Boolean
    canPutShips: Boolean
    canPutBoats: Boolean
    turn: string | undefined
    attacks: Array<any>
}
