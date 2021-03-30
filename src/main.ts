import { delay } from './utils'

declare var floors: number
const buildingHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--building-height'))
const floorHeight = buildingHeight / floors

const waitTime = 1000

const elevator = document.getElementById('elevator') as HTMLDivElement
const queue: number[] = []
let working = false

document.querySelectorAll('button[data-floor]').forEach((element) => {
  const button = element as HTMLButtonElement
  button.addEventListener('click', async (event) => {
    if (event.target instanceof Element) {
      const button = event.target as HTMLButtonElement
      const floor = parseInt(button.dataset.floor!)
      const currentFloor = parseInt(elevator.dataset.floor ?? '0')

      if (currentFloor != floor && !queue.includes(floor)) {
        queue.push(floor)
        button.classList.remove('button-outline')

        work()
      }
    }
  })
})

const work = async () => {
  if (working) return
  working = true

  do {
    const floor = queue[0]
    const currentFloor = parseInt(elevator.dataset.floor ?? '0')

    elevator.dataset.floor = `${floor}`
    await elevator.animate([{ transform: `translateY(${-floorHeight * currentFloor}px)` }, { transform: `translateY(${-floorHeight * floor}px)` }], {
      duration: 500 * Math.abs(floor - currentFloor),
      // easing: 'ease-in-out',
    }).finished
    elevator.style.transform = `translateY(${-floorHeight * floor}px)`

    queue.shift()
    document.querySelectorAll(`button[data-floor="${floor}"]`).forEach((button) => button.classList.add('button-outline'))

    await delay(waitTime)
  } while (queue.length > 0)

  working = false
}
