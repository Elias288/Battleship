import { DOCUMENT, JsonPipe } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { stringify } from '@firebase/util';
import { SocketioService } from 'src/app/services/socketio.service';
import { UserService } from 'src/app/services/user.service';
import { Match } from 'src/app/utils/match';

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
  match: Match | undefined;
  canPutBoats: Boolean = true
  canStart: Boolean = false
  gameBoardSize: Array<string> = this.fillMatrix(10)
  selectedShip: Ship | undefined
  ships: Array<Ship> = new Array()
  @ViewChild('followMouse') followMouseDiv!: ElementRef<HTMLInputElement>;
  
  constructor(
    public socketIoService: SocketioService,
    private activatedRoute: ActivatedRoute,
    public userService: UserService,
    @Inject(DOCUMENT) document: Document,
  ) {
    this.ships = JSON.parse(window.localStorage.getItem('ships')!) || []
    socketIoService.isConnected()
    socketIoService.connected.subscribe((res) => {
      if (!res)
        socketIoService.joinBackend()

      activatedRoute.params.subscribe((params) => {
        socketIoService.connectToMatch(params['roomId'])
      })
    })
    socketIoService.matchData.subscribe(match => {
      this.match = match
      this.gameBoardSize = this.fillMatrix(match.fieldSize)
      this.canPutBoats = match.canPutBoats
      setTimeout(() => this.printShips(), 1000)
    })
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
    if (this.selectedShip?.selected){
      const { orientation } = this.selectedShip
      const { clientX, clientY } = evt

      if (orientation == 'horizontal') {
        this.followMouseDiv.nativeElement.style.left = clientX + 5 + 'px'
        this.followMouseDiv.nativeElement.style.top = clientY - 20 + 'px'
      } else {
        this.followMouseDiv.nativeElement.style.left = clientX -20 + 'px'
        this.followMouseDiv.nativeElement.style.top = clientY +10 + 'px'
      }
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

    className == 'horizontal' 
      ? followMouse.style.transform = 'rotate(90deg)' 
      : followMouse.style.transform = 'rotate(0deg)'
    followMouse.style.display = 'initial'
    followMouse.src =src

    this.selectedShip = {
      id,
      selected: true,
      sizeShip: size,
      orientation: className,
      blocks: [],
      img: src
    }

    this.canPutBoats = true
  }

  public mouseOver(evt: any): void {
    if (this.selectedShip?.selected){
      this.cleanBoard(false, false)
      const { sizeShip, orientation } = this.selectedShip
      
      const evtId: number = evt.target.id.split('-').pop()

      this.getBoxSize(evtId, sizeShip, orientation).forEach(b => {
        const doc = document.getElementById('label-' + b)
        if (doc != null)
          doc.style.background = "#000"
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
      if (!blocks.some((b, index) => index > 0 ? parseInt(b) % 10 == 0 : false)){
        return blocks
      }
      return []
    }

    const range = [boxId.toString()]
    for(let index = 1; index < sizeShip; index ++){
      const val = +index*10 + +boxId
      range.push(val.toString())
    }
    if (!range.some(b => +b > 99)){
      range.forEach(b => {
        blocks.push(b)
      })
    }
    return blocks
  }

  public putShip(evt: any): void {
    if (this.selectedShip?.selected){
      const selectedId = evt.target.id.split('-').pop()
      const { sizeShip, orientation } = this.selectedShip
      
      const boxes = this.getBoxSize(selectedId, sizeShip, orientation)
      const selectedBoxes = this.ships.map(s => s.blocks).flat()
      if (boxes.length == 0) {
        return
      }

      if (boxes.some(b => selectedBoxes.find(b2 => b2 == b))) {
        evt.target.click()
        return
      }

      const selShip:Ship = this.selectedShip
      selShip.blocks = boxes
      selShip.selected = false
      const selShipId = String(selShip.id.split('-').pop())[0]
      
      const isSelShip = this.ships.findIndex(s => {
        const id = String(s.id.split('-').pop())[0]
        return id == selShipId
      })

      if (isSelShip !== -1) {
         this.ships.splice(isSelShip, 1)[0]
      }

      this.ships.push(selShip)
      window.localStorage.setItem('ships', stringify(this.ships))

      if (this.ships.length == 5) {
        this.canStart = true
      } else {
        this.canStart = false
      }
      this.selectedShip = undefined
      this.followMouseDiv.nativeElement.style.display = 'none'
      this.canPutBoats = false

      this.printShips()
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
    this.ships.forEach(ship => {
      const { blocks, img, sizeShip, orientation } = ship

      let boxSize = 0, boxSize2 = sizeShip*30-30;
      blocks.forEach(b => {
        const check = document.getElementById('checkbox-' + b) as HTMLInputElement | null
        check?.click()
        const imagesize = document.getElementById('imgSize-' + b) as HTMLImageElement | null
        const image = document.getElementById('img-' + b) as HTMLImageElement | null
        
        if (image && imagesize) {
          image.style.display = 'initial'
          imagesize.style.zIndex = '10'
          image.setAttribute('src', img)
          
          if (orientation === 'vertical') {
            image.style.top = `-${boxSize}px`
          }
          if (orientation === 'horizontal'){
            imagesize.style.transform = "rotate(90deg)"
            image.style.top = `-${boxSize2}px`
          }
          image.style.height = `${sizeShip*30}px`
          boxSize += 30
          boxSize2 -= 30
        }
      })
    })
  }

  public cleanBoard(checkbox: Boolean, ships: Boolean): void {
    this.gameBoardSize.forEach(box => {
      if (checkbox) {
        const check  = document.getElementById('checkbox-' + box) as HTMLInputElement | null
        const imagesize = document.getElementById('imgSize-' + box) as HTMLImageElement | null
        const image = document.getElementById('img-' + box) as HTMLImageElement | null
        if (check?.checked) {
            check.checked = false
          }
      
        if (image && imagesize){
          image.setAttribute('src', '')
          image.style.display = ''
          image.style.top = ''
          image.style.height = ''
          imagesize.style.zIndex = ''
          imagesize.style.translate = ''
        }
      }
      if (ships) {
        this.canStart = false
        window.localStorage.removeItem('ships')
        this.ships = []
      }
      const label  = document.getElementById('label-' + box) as HTMLInputElement | null
      
      if (label){
        label.style.background = ""
      }

    })
  }
}
