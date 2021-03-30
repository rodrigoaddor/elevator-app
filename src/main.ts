import { delay } from './utils'
import './fontawesome'

declare var floors: number
const buildingHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--building-height'))
const floorHeight = buildingHeight / floors

const waitTime = 1e3
const returnTime = 5e3

const elevator = document.getElementById('elevator') as HTMLDivElement
const queue: number[] = []
let working = false

let returnTimeout: number | undefined

document.querySelectorAll('button[data-floor]').forEach((element) => {
  const button = element as HTMLButtonElement
  button.addEventListener('click', async (event) => {
    event.preventDefault()
    if (event.currentTarget instanceof Element) {
      const button = event.currentTarget as HTMLButtonElement

      const floor = parseInt(button.dataset.floor!)
      const currentFloor = parseInt(elevator.dataset.floor ?? '0')

      if (currentFloor != floor && !queue.includes(floor)) {
        queue.push(floor)
        document.querySelectorAll(`button[data-floor="${floor}"]`).forEach(toggleButtonClasses)
        work()
      }
    }
  })
})

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

    queue.shift()
    document.querySelectorAll(`button[data-floor="${floor}"]`).forEach(toggleButtonClasses)

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

const toggleButtonClasses = (button: Element) => {
  if (!button.classList.contains('icon-button')) {
    button.classList.toggle('button-outline')
  } else {
    Array.from(button.children).forEach((child) => child.classList.toggle('fa-inverse'))
  }
}
