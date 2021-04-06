export function formatAMPM(date) {
  let hours = date.getHours();
  let minutes = date.getMinutes();
  let ampm = hours >= 12 ? 'pm' : 'am';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0' + minutes : minutes;
  return hours + ':' + minutes + '' + ampm;
}

export function getAMPMTimeRange(date1, date2) {
  return `${formatAMPM(date1)} - ${formatAMPM(date2)}`;
}

export function getDayMonthDateStr(date) {
  return `${date.toLocaleString('en-US', { weekday: 'long' })}, ${date.toLocaleString('default', { month: 'long' })} ${date.getDate()}`;
}

export function getTopOfDay(date) {
  const dateMod = new Date(date);
  dateMod.setHours(0, 0, 0, 0);
  return dateMod;
}

export function compareDatesWithoutTime(d1, d2) {
  if (d1 === d2) {
    return true;
  }

  return getTopOfDay(d1).getTime() === getTopOfDay(d2).getTime();
}

export function findNearestWeekday(oldDate) {
  const weekendDays = [0, 6];
  const date = new Date(oldDate);

  if (weekendDays.includes(date.getDay())) {
    // Round to next Monday
    date.setDate(date.getDate() + ((date.getDay() + 1) % 7));
  }

  return date;
}
