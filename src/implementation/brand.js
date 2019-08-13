function getBrand() {
    return process.env.BRAND
}

function getBrandedVariable() {
    return getBrand() + 'Frame'
}

export {
    getBrandedVariable,
}
