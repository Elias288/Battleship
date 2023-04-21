export interface Player {
    _id: string
    socketId?: string
    username: string
    email: string
    casual: boolean

    score: Number
    
    cantShips?: number
    points?: number
    canStart?: boolean
    canPutBoats?: boolean
}
