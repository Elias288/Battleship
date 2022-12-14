import { DOCUMENT, JsonPipe, Location } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { stringify } from '@firebase/util';
import { SocketioService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';
import { Match } from 'src/app/utils/match';
import { Player } from 'src/app/utils/player';

interface Ship {
    selected: boolean
    id: string
    sizeShip: number
    blocks: Array<string>
    orientation: string
    img: string
}

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
    @ViewChild('followMouse') followMouseDiv!: ElementRef<HTMLInputElement>;
    match: Match | undefined;
    gameBoardSize: Array<string> = this.fillMatrix(10)
    
    ships: Array<Ship> = new Array()
    selectedShip: Ship | undefined
    strike: any

    isTurn: Boolean = false
    canStart: Boolean = false

    constructor(
        public socketIoService: SocketioService,
        private activatedRoute: ActivatedRoute,
        public userService: UserService,
        @Inject(DOCUMENT) document: Document,
    ) {
        socketIoService.isConnected()
        socketIoService.connected.subscribe((isConnected: Boolean) => {
            if (!isConnected)
                socketIoService.joinBackend()

            if (isConnected) {
                activatedRoute.params.subscribe((params) => {
                    socketIoService.connectToMatch(params['roomId'])
                })
            }
        })
        socketIoService.matchData.subscribe((match: Match) => {
            this.match = match
            
            if (userService.playerData != undefined) {
                const playerData: Player = userService.playerData
                const matchPlayer: Player | undefined = match.players.find(p => p.uid === playerData.uid)

                this.isTurn = match.turn == playerData.uid
                if (matchPlayer) {
                    userService.playerData.canPutBoats = matchPlayer.canPutBoats
                }
            }

            this.gameBoardSize = this.fillMatrix(match.fieldSize)
            
            if (match.players.length < 2) {
                this.cleanBoard(true, true)
                window.localStorage.removeItem('ships')
            }

            setTimeout(() => this.printShips(), 1000)
        })
        socketIoService.attack.subscribe((data: any) => {
            const shipsBoxes = this.ships.map(s => s.blocks).flat()
            socketIoService.hitResponse(data.id, shipsBoxes.some(sb => sb === data.id), data.owner)
        })

        this.ships = JSON.parse(window.localStorage.getItem('ships')!) || []
        if (this.ships.length == 5) {
            this.canStart = true
        }
    }

    ngOnInit(): void {
        if (!this.userService.isLoggedIn) {
            this.socketIoService.joinBackend()
        }
    }

    @HostListener('document:mousemove', ['$event'])
    private onMouseMove(evt: any): void {
        const followMouse = this.followMouseDiv.nativeElement
        const { clientX, clientY } = evt

        if (this.selectedShip?.selected) {
            const { orientation } = this.selectedShip

            if (orientation == 'horizontal') {
                followMouse.style.transform = 'rotate(90deg)'
                followMouse.style.left = clientX + 5 + 'px'
                followMouse.style.top = clientY - 20 + 'px'
            } else {
                followMouse.style.transform = 'rotate(0deg)'
                followMouse.style.left = clientX - 20 + 'px'
                followMouse.style.top = clientY + 10 + 'px'
            }
        }

        if (this.strike?.selected) {
            followMouse.style.transform = 'rotate(0deg)'
            followMouse.style.left = clientX - 20 + 'px'
            followMouse.style.top = clientY + 10 + 'px'
        }

    }

    public selectShip(evt: any, size: number): void {
        const followMouse = this.followMouseDiv.nativeElement
        const { id, className, src } = evt.target

        if (this.selectedShip?.selected && this.selectedShip.id == id) {
            followMouse.style.display = 'none'
            this.selectedShip = undefined
            return
        }

        followMouse.style.display = 'initial'
        followMouse.src = src

        this.selectedShip = {
            id,
            selected: true,
            sizeShip: size,
            orientation: className,
            blocks: [],
            img: src
        }
    }

    public selectAttack(evt: any): void {
        const followMouse = this.followMouseDiv.nativeElement
        const { id, className, src } = evt.target

        followMouse.style.display = 'initial'
        followMouse.src = src

        this.strike = {
            id,
            selected: true,
            src
        }
    }

    public mouseOver(evt: any): void {
        if (this.selectedShip?.selected) {
            this.cleanBoard(false, false)
            const { sizeShip, orientation } = this.selectedShip

            const evtId: number = evt.target.id.split('-').pop()

            this.getBoxSize(evtId, sizeShip, orientation).forEach(block => {
                const button = document.getElementById('self_button-' + block) as HTMLInputElement | null
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

    public putShip(evt: any): void {
        if (this.selectedShip?.selected) {
            const selectedShip: Ship = this.selectedShip
            const selectedBoxId = evt.target.id.split('-').pop()
            const shipsBoxes = this.ships.map(s => s.blocks).flat()

            // GET ALL THE BOXES THROUGH THE FIRST SELECTED AND ITS SIZE
            const boxes = this.getBoxSize(selectedBoxId, selectedShip.sizeShip, selectedShip.orientation)
            if (boxes.length == 0) {
                return
            }
            // CLICK ALL SELECTED BOXEX
            if (boxes.some(b => shipsBoxes.find(b2 => b2 == b))) {
                evt.target.click()
                return
            }
            this.saveShip(boxes, selectedShip)

            this.followMouseDiv.nativeElement.style.display = 'none'

            this.printShips()
        }
    }

    private saveShip (boxes: Array<string>, selectedShip: Ship): void {
        selectedShip.blocks = boxes
        selectedShip.selected = false
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
            this.canStart = true
        } else {
            this.canStart = false
        }
        this.selectedShip = undefined
    }

    public attack(evt: any): void {
        if (this.strike?.selected) {
            const selectedId = evt.target.id.split('-').pop()
            const { id: strikeId } = this.strike

            // WHEN ATTACKING, YOU MUST SEND THE MATCH, TO THE OTHER CLIENT,
            // CHECK WHERE IT FELL AND PASS THE TURN
            this.socketIoService.hit(selectedId)
            this.socketIoService.changeTurn()

            this.strike = undefined
            this.followMouseDiv.nativeElement.style.display = 'none'
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

    private printShips(): void {
        this.cleanBoard(true, false)

        // PRINT SHIPS
        this.ships.forEach(ship => {
            const { blocks, img, sizeShip, orientation } = ship

            let boxSize = 0, boxSize2 = sizeShip * 30 - 30;
            blocks.forEach(block => {
                const button = document.getElementById('self_button-' + block) as HTMLInputElement | null
                const imagesize = document.getElementById('self_imgSize-' + block) as HTMLImageElement | null
                const image = document.getElementById('self_img-' + block) as HTMLImageElement | null

                if (button) {
                    button.style.display = "none"
                }
                if (image && imagesize) {
                    image.style.display = 'initial'
                    imagesize.style.zIndex = '10'
                    image.setAttribute('src', img)

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
            })
        })

        // PRINT ATTACKS
        this.match?.attacks.forEach(attack => {
            if (this.userService.playerData) {
                
                if (attack.owner == this.userService.playerData.uid) {
                    const image = document.getElementById('enemy_img-' + attack.id) as HTMLImageElement | null
                    const button = document.getElementById('enemy_button-' + attack.id) as HTMLInputElement | null

                    if (button) {
                        button.style.display = "none"
                    }
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

                if (attack.owner != this.userService.playerData.uid){
                    const image = document.getElementById('self_img-' + attack.id) as HTMLImageElement | null
                    const button = document.getElementById('self_button-' + attack.id) as HTMLInputElement | null

                    if (button) {
                        button.style.display = "none"
                    }
                    if (image) {
                        image.style.display = "initial"
                        image.style.height = ""
                        image.style.width = ""
                        image.style.transform = "rotate(0deg)"
                        image.style.top = "0"

                        if (attack.status){
                            image.src = "assets/img/explotion.png"
                        } else {
                            image.src = "assets/img/water.png"
                        }
                    }
                }
            }
        })
    }

    public cleanBoard(image: Boolean, ships: Boolean): void {
        this.gameBoardSize.forEach(block => {
            const enemyButton = document.getElementById('enemy_button-' + block) as HTMLInputElement | null
            const selfButton = document.getElementById('self_button-' + block) as HTMLInputElement | null
            if (image) {
                const selfImageSize = document.getElementById('self_imgSize-' + block) as HTMLImageElement | null
                const selfImage = document.getElementById('self_img-' + block) as HTMLImageElement | null
                const enemyImage = document.getElementById('enemy_img-' + block) as HTMLImageElement | null

                if (selfImage && selfImageSize && enemyImage) {
                    selfImage.setAttribute('src', '')
                    selfImage.style.display = ''
                    selfImage.style.top = ''
                    selfImage.style.height = ''
                    selfImageSize.style.zIndex = ''
                    selfImageSize.style.translate = ''

                    enemyImage.setAttribute('src', '')
                    selfImage.style.display = ''
                }
                if (enemyButton && selfButton) {
                    enemyButton.style.display = ''
                    selfButton.style.display = ''
                }
            }
            if (ships) {
                this.canStart = false
                window.localStorage.removeItem('ships')
                this.ships = []
            }
            if (selfButton && enemyButton) {
                selfButton.style.background = ""
                enemyButton.style.background = ""
            }

        })
    }

    public start(): void {
        this.socketIoService.startGame()
        this.canStart = false

        if (this.match)
            this.match.canPutBoats = false
    }

    public disconnect(): void {
        window.location.href = "/home";
    }
}
