export function isThisMonth(dateStr: string): boolean {
  const d = new Date(dateStr)
  const now = new Date()
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
}
export function daysBetween(a: string, b: string): number {
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000)
}
export function daysUntil(dateStr: string): number {
  return daysBetween(new Date().toISOString().slice(0,10), dateStr)
}
export function monthKey(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
}
export function monthLabel(key: string): string {
  const [y, m] = key.split('-')
  const months = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек']
  return `${months[parseInt(m)-1]} ${y.slice(2)}`
}
