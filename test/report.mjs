export function report(testName, expected, got) {
    if (got !== expected) {
        const errorMessage = `Test failed on ${testName}. "${got}" is not "${expected}"`
        // console.assert(errorMessage)
        throw new Error(errorMessage);
    } else {
        console.log(`Tests passed for ${testName}`);
    }
}
