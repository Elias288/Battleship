export interface Player {
    uid: string
    socketId: string
    id: string
    
    name: string
    email: string

    score: Number
    
    cantShips: number
    points: number
    canStart: boolean
    canPutBoats: boolean
}
