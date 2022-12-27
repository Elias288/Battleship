import { DOCUMENT, JsonPipe, Location } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { stringify } from '@firebase/util';
import { SocketioService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';
import { Match } from 'src/app/utils/match';
import { Player } from 'src/app/utils/player';
import { Ship } from 'src/app/utils/ship';

@Component({
    selector: 'app-game',
    templateUrl: './game.component.html',
    styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
    @ViewChild('followMouse') followMouseDiv!: ElementRef<HTMLInputElement>;
    match!: Match;
    tempMatch: any
    gameBoardSize: Array<string> = this.fillMatrix(10)
    showMatchLog: Boolean = false

    ships: Array<Ship> = new Array()
    selectedShip: Ship | undefined
    strike: any

    isTurn: Boolean = false
    canStart: Boolean = false

    constructor(
        public socketIoService: SocketioService,
        private activatedRoute: ActivatedRoute,
        public userService: UserService,
        private router: Router,
        @Inject(DOCUMENT) document: Document,
    ) {
        socketIoService.isConnected()
        socketIoService.connected.subscribe((isConnected: Boolean) => {
            if (!isConnected){
                socketIoService.joinBackend()
                this.cleanShips()
            }
            if (isConnected) {
                activatedRoute.params.subscribe((params) => {
                    socketIoService.connectToMatch(params['roomId'])
                })
            }
        })
        socketIoService.matchData.subscribe((matchData: Match) => {
            this.match = matchData

            /* MATCH LOG */
            const tempPlayers = matchData.players.map(p => {
                return {
                    cantShips: p.cantShips,
                    name: p.name,
                    uid: p.uid,
                    canPutShips: p.canPutBoats,
                    canStart: p.canStart,
                    points: p.points,
                }
            })
            this.tempMatch = {
                turn: matchData.turn,
                winner: matchData.winner,
                tempPlayers,
                attacks: matchData.attacks
            }
            /* MATCH LOG */

            if (userService.playerData) {
                const playerData: Player = userService.playerData
                const matchPlayer: Player | undefined = matchData.players.find(p => p.uid === playerData.uid)

                this.isTurn = matchData.turn == playerData.uid
                if (matchPlayer) {
                    userService.playerData.canPutBoats = matchPlayer.canPutBoats
                }
            }

            this.gameBoardSize = this.fillMatrix(matchData.fieldSize)

            if (matchData.players.length < 2) {
                this.cleanShips()
                this.cleanBoardImages()
                window.localStorage.removeItem('ships')
            }

            if (matchData.winner) {
                const winner = matchData.players.find(p => p.id === matchData.winner)
                window.alert(`The winner is ${winner?.name}, score: ${winner?.score}`)

                this.router.navigate(['home'])
            }

            this.printShips()
            this.printAttacks(matchData)
        })
        socketIoService.attack.subscribe((data: any) => {
            const { id, owner } = data
            const shipsBoxes = this.ships.map(s => s.blocks).flat()

            const status = shipsBoxes.some(sb => sb === id)

            socketIoService.hitStatus({
                id,
                status,
                ownerId: owner
            })
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

        if (this.selectedShip) {
            const { orientation } = this.selectedShip

            if (orientation == 'horizontal') {
                followMouse.style.transform = 'rotate(90deg)'
            } else {
                followMouse.style.transform = 'rotate(0deg)'
            }
            followMouse.style.top = clientY - 60 + 'px'
            followMouse.style.left = clientX - 60 + 'px'
            
        }

        if (this.strike) {
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
            this.cleanSelectedShip()
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
            img: src,
            destroyed: false
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

    private fillMatrix(amount: number): Array<string> {
        let arr: Array<string> = []

        for (let index = 0; index < amount; index++) {
            for (let index2 = 0; index2 < amount; index2++) {
                arr.push(`${index}${index2}`)
            }
        }
        return arr
    }

    public printShips () {
        this.cleanBoardImages()

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

    public isCanStart(data: boolean) {
        this.canStart = data
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

    public cleanSelectedShip () {
        this.selectedShip = undefined
    }

    public cleanShips () {
        this.canStart = false
        window.localStorage.removeItem('ships')
        this.ships = []
    }

    public cleanAll() {
        this.cleanBoardImages()
        this.cleanShips()
    }

    public start (): void {
        this.socketIoService.startGame()
        this.canStart = false

        if (this.match)
            this.match.canPutBoats = false
    }

    public sendHit (selectedId: string) {
        this.followMouseDiv.nativeElement.style.display = 'none'
        this.socketIoService.hit(selectedId)
    }

    public disconnect (): void {
        window.location.href = "/home";
    }
}
