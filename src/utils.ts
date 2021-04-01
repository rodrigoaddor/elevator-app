export const delay = (time: number) => new Promise((res) => setTimeout(res, time))

export const random = (min: number, max: number, except?: number | number[]) => {
  except = except ? (Array.isArray(except) ? except : [except]) : []
  let num = Math.floor(Math.random() * (max - min + 1)) + min

  if (except.includes(num)) {
    const range = max - min
    num += num > range / 2 ? -1 : 1
  }

  return num
}
