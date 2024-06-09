/**
 *
 * @param {string} inputDate date in format of yyyy-mm-dd
 * @returns date in the format of mm/dd/yy without "0" padding
 */
export function formatDate(inputDate) {
  try {
    const [yearRaw, monthRaw, dayRaw] = inputDate.split('-')
    const year = yearRaw.slice(-2)
    const month = Number(monthRaw)
    const day = Number(dayRaw)

    return `${month}/${day}/${year}`
  } catch (error) {
    console.log(error)
    return inputDate
  }
}
