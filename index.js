function SendMessage(message, color) {
    let col
    switch (color) {
        case 'green':
            col = 33
            break
        case 'yellow':
            col = 93
            break
        default:
            col = 31
            break
    }
    console.log(`\x1b[${col}m ${message} \x1b[0m`)
}
