export function formatMinutesUserFriendly(minutes: number): string {
    let hours = parseInt(String(minutes / 60))
    let mins = minutes % 60

    return (hours ? (hours + 'годин(и/у)') : '')
        + (hours && mins ? ' ' : '')
        + (mins ? (mins + ' хвилин(и/у)') : '')
}
