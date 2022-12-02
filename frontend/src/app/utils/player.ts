export interface Player {
    uid: string
    socketId: string
    id: string
    
    name: string
    email: string

    score: number
    points: number

    field: Array<number>
    cantShips: number
}
