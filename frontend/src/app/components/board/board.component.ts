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
    @Input() self: boolean = false
    @Input() strike: any
    @Input() selectedShip: Ship | undefined
    @Input() ships: Array<Ship> = new Array()
    @Input() canStart!: Boolean

    @Output() _printShips: EventEmitter<void> = new EventEmitter<void>()
    @Output() cleanSelectedShip: EventEmitter<void> = new EventEmitter<void>()
    @Output() isCanStart: EventEmitter<boolean> = new EventEmitter<boolean>()
    @Output() sendHit: EventEmitter<string> = new EventEmitter<string>()

    gameBoardSize!: Array<string>
    enemy:boolean = true

    constructor(
        public userService: UserService,
    ) {
    }

    ngOnInit(): void {
        if (this.matchData)
            this.gameBoardSize = this.fillMatrix(this.matchData.fieldSize)
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

    private getBoxSize(boxId: number, sizeShip: number, orientation: string): Array<string> {
        const blocks: Array<string> = []

        if (orientation === 'horizontal') {
            this.gameBoardSize.forEach(box => {
                const size = +box >= boxId && +box < (+boxId + +sizeShip) && (+boxId + +sizeShip) <= this.gameBoardSize.length
                if (size) {
                    blocks.push(box)
                }
            })
            if (!blocks.some((b, index) => index > 0 ? parseInt(b) % 10 == 0 : false)) {
                return blocks
            }
            return []
        }

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
        return blocks
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
                this._printShips.emit()
            }
        }
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
}
