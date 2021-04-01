import { delay, random } from './utils'
import './fontawesome'

/* Sounds */

// @ts-expect-error ParcelJS custom Import
import bellUrl from './resources/bell.mp3'
// @ts-expect-error ParcelJS custom Import
import warnUrl from './resources/warn.mp3'

const bell = new Audio(bellUrl)
const warn = new Audio(warnUrl)

/* Constants */
declare var floors: number
const buildingHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--building-height'))
const floorHeight = buildingHeight / floors

const waitTime = 2e3
const returnTime = 5e3
const maxQueue = 3

const elevator = document.getElementById('elevator') as HTMLDivElement
const queue: number[] = []
let working = false
let returnTimeout: number | undefined
let occupantInterval: number | undefined

/* Buttons event handler */
document.querySelectorAll('button[data-floor]').forEach((element) => {
  const button = element as HTMLButtonElement
  button.addEventListener('click', async (event) => {
    event.preventDefault()
    if (event.currentTarget instanceof Element) {
      const button = event.currentTarget as HTMLButtonElement

      const floor = parseInt(button.dataset.floor!)
      const currentFloor = parseInt(elevator.dataset.floor ?? '0')

      if (currentFloor != floor && !queue.includes(floor)) {
        if (queue.length + 1 <= maxQueue) {
          queue.push(floor)
          document.querySelectorAll(`button[data-floor="${floor}"]`).forEach(toggleButtonClasses)
          work()
        } else {
          if (['true', null].includes(localStorage.getItem('muted'))) {
            warn.currentTime = 0
            warn.play()
          }
          alert(`Too many requests! (Maximum: ${maxQueue})`)
        }
      }
    }
  })
})

/* Elevator animation */
const work = async () => {
  if (working) return
  working = true

  if (!isNaN(returnTimeout!)) {
    clearTimeout(returnTimeout)
  }

  do {
    const floor = queue[0]
    const currentFloor = parseInt(elevator.dataset.floor ?? '0')

    elevator.dataset.floor = `${floor}`
    await elevator.animate([{ transform: `translateY(${-floorHeight * currentFloor}px)` }, { transform: `translateY(${-floorHeight * floor}px)` }], {
      duration: 500 * Math.abs(floor - currentFloor),
    }).finished
    elevator.style.transform = `translateY(${-floorHeight * floor}px)`

    if (['true', null].includes(localStorage.getItem('muted'))) {
      bell.currentTime = 0
      bell.play()
    }

    queue.shift()
    document.querySelectorAll(`button[data-floor="${floor}"]`).forEach(toggleButtonClasses)

    setTimeout(async () => {
      const user = carrying()
      if (user == floor) {
        await elevator.children.item(0)?.animate([{ transform: 'translateX(119px)', opacity: '0' }], { duration: 500 }).finished

        elevator.children.item(0)?.classList.add('hide')
        elevator.children.item(0)!.children.item(1)!.innerHTML = ''
      }

      const newUser = floorUser(floor)
      if (newUser != undefined) {
        const floorDom = document.querySelector(`.floor:nth-child(${floor + 1})`)!
        await floorDom.children.item(1)?.animate([{ transform: `translatex(-119px)` }], { duration: 500 }).finished
        floorDom.children.item(1)?.classList.add('hide')

        elevator.children.item(0)?.classList.remove('hide')
        elevator.children.item(0)!.children.item(1)!.innerHTML = `${newUser == 0 ? 'T' : newUser}`
      }
    }, 200)

    await delay(waitTime)
  } while (queue.length > 0)

  if (elevator.dataset.floor != '0') {
    returnTimeout = setTimeout(() => {
      returnTimeout = undefined

      document.querySelectorAll('button[data-floor="0"]').forEach(toggleButtonClasses)
      queue.push(0)
      work()
    }, returnTime)
  }

  working = false
}

const randomOccupants = (ms: number) => {
  if (occupantInterval != undefined) {
    clearInterval(occupantInterval)
  }

  occupantInterval = setInterval(() => {
    const curFloor = random(0, floors - 1)
    let targetFloor = random(0, floors - 1, curFloor)

    const floor = document.querySelector(`.floor:nth-child(${curFloor + 1})`)
    if (floor && floorUser(curFloor) == undefined) {
      floor.children.item(1)!.classList.remove('hide')
      floor.querySelector(`.target-floor`)!.innerHTML = `${targetFloor == 0 ? 'T' : targetFloor}`

      setTimeout(async () => {
        if (+elevator.dataset.floor! == curFloor && carrying() == undefined) {
          await floor.children.item(1)?.animate([{ transform: `translatex(-119px)` }], { duration: 500 }).finished
          floor.children.item(1)?.classList.add('hide')

          elevator.children.item(0)?.classList.remove('hide')
          elevator.children.item(0)!.children.item(1)!.innerHTML = `${targetFloor == 0 ? 'T' : targetFloor}`
        }
      }, 500)
    }
  }, ms)
}

document.querySelector('#occupantTime')?.addEventListener('click', (event) => {
  event.preventDefault()
  const time = parseFloat(prompt('Enter the time in seconds between occupants arrivals (0 to disable)')!)
  if (!isNaN(time)) {
    if (time > 0) {
      randomOccupants(time * 1000)
    } else {
      clearInterval(occupantInterval)
    }
  } else {
    alert('Invalid time!')
  }
})

const carrying = (): number | undefined => {
  const user = document.querySelector('#elevator > div:not(.hide) > :last-child')
  return user ? +(user.innerHTML == 'T' ? 0 : user.innerHTML) : undefined
}

const floorUser = (floor: number): number | undefined => {
  const user = document.querySelector(`.floor:nth-child(${floor + 1}) > div:not(.hide) > :last-child`)
  return user ? +(user.innerHTML == 'T' ? 0 : user.innerHTML) : undefined
}

window.carrying = carrying
window.floorUser = floorUser

const toggleButtonClasses = (button: Element) => {
  if (!button.classList.contains('icon-button')) {
    button.classList.toggle('button-outline')
  } else {
    Array.from(button.children).forEach((child) => child.classList.toggle('fa-inverse'))
  }
}

/* Mute sounds button */
const muteButton = document.querySelector('#mute') as HTMLAnchorElement | undefined

muteButton?.addEventListener('click', (event) => {
  event.preventDefault()
  const curMuted = localStorage.getItem('muted')
  localStorage.setItem('muted', (!(curMuted == 'true')).toString())

  const icon = (event.currentTarget as HTMLAnchorElement).children.item(0)
  icon?.classList.toggle('fa-volume-up')
  icon?.classList.toggle('fa-volume-mute')
})

muteButton?.children.item(0)?.classList.add(localStorage.getItem('muted') == 'false' ? 'fa-volume-mute' : 'fa-volume-up')
