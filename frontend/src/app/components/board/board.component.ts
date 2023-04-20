import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { stringify } from '@firebase/util';
import { UserService } from 'src/app/services/user.service';
import { Match } from 'src/app/utils/match';
import { Ship } from 'src/app/utils/ship';

@Component({
    selector: 'app-board',
    templateUrl: './board.component.html',
    styleUrls: ['./board.component.scss']
})
export class BoardComponent implements OnInit {
    @Input() matchData!: Match
    @Input() self!: boolean
    @Input() strike: any
    @Input() selectedShip: Ship | undefined
    @Input() ships: Array<Ship> = new Array()
    @Input() canStart!: Boolean

    @Output() cleanSelectedShip: EventEmitter<void> = new EventEmitter<void>()
    @Output() cleanFollowMouse: EventEmitter<void> = new EventEmitter<void>()
    @Output() isCanStart: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() sendHit: EventEmitter<string> = new EventEmitter<string>()

    gameBoardSize!: Array<string>
    enemy:boolean = true

    constructor(
        public userService: UserService,
    ) {
    }

    ngOnInit(): void {
        if (this.matchData){
            this.gameBoardSize = this.fillMatrix(this.matchData.fieldSize)
        }
    }

    private fillMatrix(amount: number): Array<string> {
        let arr: Array<string> = []

        for (let index = 0; index < amount; index++) {
            for (let index2 = 0; index2 < amount; index2++) {
                arr.push(`${index}${index2}`)
            }
        }
        return arr
    }

    public mouseOver(evt: any): void {
        if (this.selectedShip) {
            const { sizeShip, orientation } = this.selectedShip

            const evtId: number = evt.target.id.split('-').pop()

            this.getBoxSize(evtId, sizeShip, orientation).forEach(block => {
                const button = document.getElementById('self_button-' + block) as HTMLInputElement
                if (button) {
                    button.style.background = "#000"
                }
            })
        }
    }

    public cleanPosition(): void {
        this.gameBoardSize.forEach(block => {
            const selfButton = document.getElementById('self_button-' + block) as HTMLInputElement
            if (selfButton){
                selfButton.style.background = ""
            }
        })
    }

    public putShip(evt: any): void {
        if (this.selectedShip) {
            const button = evt.target
            const selectedShip: Ship = this.selectedShip
            const selectedBoxId = button.id.split('-').pop()

            // GET ALL THE BOXES THROUGH THE FIRST SELECTED AND ITS SIZE
            const boxes = this.getBoxSize(selectedBoxId, selectedShip.sizeShip, selectedShip.orientation)
            if (boxes.length == 0) {
                return
            }

            this.saveShip(boxes, selectedShip)

            if (this.matchData) {
                this.printShips()
            }
        }
    }

    private getBoxSize(boxId: number, sizeShip: number, orientation: string): Array<string> {
        const blocks: Array<string> = []
        if (orientation === 'horizontal') {
            this.gameBoardSize.forEach(box => {
                const condition = +box >= boxId && +box < (+boxId + +sizeShip) && (+boxId + +sizeShip) <= this.gameBoardSize.length
                // if the block is between the size of the ship and does not exceed the playing board
                if (condition) {
                    blocks.push(box)
                }
            })
            
            // 
            if (blocks.some((block, index) => index > 0 ? +block % 10 == 0 : false)) {
                return []
            }
        } else {
            const range = [boxId.toString()]
            for (let index = 1; index < sizeShip; index++) {
                const val = +index * 10 + +boxId
                range.push(val.toString())
            }
            if (!range.some(b => +b > 99)) {
                range.forEach(b => {
                    blocks.push(b)
                })
            }
        }
        const colision = this.ships.some(ship => ship.blocks.some(block => blocks.includes(block)))
        // if the vessel to be positioned does not collide with any other vessel placed
        if (colision) {
            return []
        }
        return blocks
    }

    private saveShip (boxes: Array<string>, selectedShip: Ship): void {
        selectedShip.blocks = boxes
        const selShipId = String(selectedShip.id.split('-').pop())[0]

        const isSelShip = this.ships.findIndex(s => {
            const id = String(s.id.split('-').pop())[0]
            return id == selShipId
        })
        if (isSelShip !== -1) {
            this.ships.splice(isSelShip, 1)[0]
        }

        this.ships.push(selectedShip)
        window.localStorage.setItem('ships', stringify(this.ships))
        
        if (this.ships.length == 5) {
            this.isCanStart.emit(true)
        } else {
            this.isCanStart.emit(false)
        }
        this.cleanSelectedShip.emit()
    }

    public printShips () {
        this.cleanBoardImages()
        this.cleanFollowMouse.emit()
        // this.followMouseDiv.nativeElement.style.display = 'none'

        this.ships.forEach(ship => {
            const { blocks, img, sizeShip, orientation } = ship

            let boxSize = 0, boxSize2 = sizeShip * 30 - 30;
            blocks.forEach(block => {
                const button = document.getElementById('self_button-' + block) as HTMLInputElement
                const image = document.getElementById('self_img-' + block) as HTMLImageElement | null
                const imagesize = document.getElementById('self_imgSize-' + block) as HTMLImageElement

                if (button) {
                    button.style.display = "none"
                    button.style.background = ''
                }

                if (image) {
                    image.style.display = 'initial'
                    image.setAttribute('src', img)

                    if (imagesize) {
                        imagesize.style.zIndex = '10'

                        if (orientation === 'vertical') {
                            image.style.top = `-${boxSize}px`
                        }
                        if (orientation === 'horizontal') {
                            imagesize.style.transform = "rotate(90deg)"
                            image.style.top = `-${boxSize2}px`
                        }

                        image.style.height = `${sizeShip * 30}px`
                        boxSize += 30
                        boxSize2 -= 30
                    }
                }
            })
        })
    }

    public cleanBoardImages () {
        this.gameBoardSize.forEach(block => {
            const selfImageSize = document.getElementById('self_imgSize-' + block) as HTMLImageElement
            const enemyButton = document.getElementById('enemy_button-' + block) as HTMLInputElement
            const selfButton = document.getElementById('self_button-' + block) as HTMLInputElement
            const selfImage = document.getElementById('self_img-' + block) as HTMLImageElement
            const enemyImage = document.getElementById('enemy_img-' + block) as HTMLImageElement

            if (selfImage) {
                selfImage.setAttribute('src', '')
                selfImage.style.height = ''
                selfImage.style.display = ''
                selfImage.style.top = ''
            }

            if (selfImageSize) {
                selfImageSize.style.zIndex = ''
                selfImageSize.style.transform = ''
            }

            if (enemyImage) {
                enemyImage.setAttribute('src', '')
            }
            if (selfButton) {
                selfButton.style.display = ''
            }

            if (enemyButton) {
                enemyButton.style.display = ''
            }
        })
    }

    public attack(evt: any): void {
        if (this.strike) {
            const selectedId = evt.target.id.split('-').pop()
            const { id: strikeId } = this.strike

            // WHEN ATTACKING, YOU MUST SEND THE MATCH, TO THE OTHER CLIENT,
            // CHECK WHERE IT FELL AND PASS THE TURN
            this.sendHit.emit(selectedId.toString())
            this.strike = undefined
        }
    }

    public printAttacks (matchData: Match) {
        matchData.attacks.forEach(attack => {
            if (this.userService.playerData) {

                if (attack.owner == this.userService.playerData.uid) {
                    const image = document.getElementById('enemy_img-' + attack.id) as HTMLImageElement
                    const button = document.getElementById('enemy_button-' + attack.id) as HTMLInputElement

                    if (button)
                        button.style.display = "none"

                    if (image) {
                        image.style.display = "initial"
                        image.style.height = ""
                        image.style.width = ""

                        if (attack.status) {
                            image.src = "assets/img/explotion.png"
                        } else {
                            image.src = "assets/img/water.png"
                        }
                    }

                }

                if (attack.owner != this.userService.playerData.uid) {
                    const image = document.getElementById('self_img-' + attack.id) as HTMLImageElement
                    const button = document.getElementById('self_button-' + attack.id) as HTMLInputElement

                    if (button)
                        button.style.display = "none"

                    if (image) {
                        image.style.display = "initial"
                        image.style.height = ""
                        image.style.width = ""
                        image.style.transform = "rotate(0deg)"
                        image.style.top = "0"

                        if (attack.status) {
                            image.src = "assets/img/explotion.png"
                        } else {
                            image.src = "assets/img/water.png"
                        }
                    }
                }
            }
        })
    }
}
