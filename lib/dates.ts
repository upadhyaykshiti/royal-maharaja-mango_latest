/**
 * Returns the next 8 Friday/Saturday delivery dates
 */



export function getNextDeliveryDates(): string[] {
  // const dates: string[] = []
  // const now = new Date()
  // let current = new Date(now)
  // current.setHours(0, 0, 0, 0)

  // const formatter = new Intl.DateTimeFormat('en-CA', {
  //   weekday: 'long',
  //   year: 'numeric',
  //   month: 'long',
  //   day: 'numeric',
  // })

  // let count = 0
  // while (count < 8) {
  //   const day = current.getDay() // 0=Sun, 5=Fri, 6=Sat
  //   if (day === 5 || day === 6) {
  //     // Only show future dates (from tomorrow if today is Fri/Sat)
  //     if (current > now) {
  //       dates.push(formatter.format(current))
  //       count++
  //     }
  //   }
  //   current = new Date(current)
  //   current.setDate(current.getDate() + 1)
  // }

  // return dates

  const dates: string[] = []
  const today = new Date()

  // Start from upcoming Saturday
  let currentSaturday = new Date(today)

  currentSaturday.setDate(
    today.getDate() + ((6 - today.getDay() + 7) % 7)
  )

  // If today is already past Sunday night, move ahead
  if (today.getDay() === 0 && today.getHours() > 23) {
    currentSaturday.setDate(currentSaturday.getDate() + 7)
  }

  // Generate only next 8 valid weekend options
  for (let i = 0; i < 8; i++) {
    const saturday = new Date(currentSaturday)
    saturday.setDate(currentSaturday.getDate() + i * 7)

    const sunday = new Date(saturday)
    sunday.setDate(saturday.getDate() + 1)

    // Stop after June 2026
    if (saturday.getMonth() > 5 || saturday.getFullYear() > 2026) {
      break
    }

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-CA', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    }

    dates.push(
      `${formatDate(saturday)} / ${formatDate(sunday)}`
    )
  }

  return dates
}
