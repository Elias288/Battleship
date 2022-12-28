import { DOCUMENT, JsonPipe, Location } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { stringify } from '@firebase/util';
import { BoardComponent } from 'src/app/components/board/board.component';
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
    @ViewChild('followMouse') followMouseDiv!: ElementRef<HTMLInputElement>
    @ViewChild(BoardComponent) BoardChild!:BoardComponent

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
                if (this.BoardChild) {
                    this.BoardChild.cleanBoardImages()
                }

                window.localStorage.removeItem('ships')
            }

            if (matchData.winner) {
                const winner = matchData.players.find(p => p.id === matchData.winner)
                window.alert(`The winner is ${winner?.name}, score: ${winner?.score}`)

                this.router.navigate(['home'])
            }

            if (this.BoardChild) {
                this.BoardChild.printShips()
                // this.followMouseDiv.nativeElement.style.display = 'none'
                this.BoardChild.printAttacks(matchData)
            }
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

    public isCanStart(data: boolean) {
        this.canStart = data
    }

    public cleanSelectedShip () {
        this.selectedShip = undefined
    }

    public cleanShips () {
        this.canStart = false
        window.localStorage.removeItem('ships')
        this.ships = []
    }

    public cleanFollowMouse() {
        this.followMouseDiv.nativeElement.style.display = 'none'
    }

    public cleanAll() {
        if (this.BoardChild) {
            this.BoardChild.cleanBoardImages()
        }
            
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
