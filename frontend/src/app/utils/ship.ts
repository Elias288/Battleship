export interface Ship {
    selected: boolean
    id: string
    sizeShip: number
    blocks: Array<string>
    orientation: string
    img: string
    destroyed: boolean
}