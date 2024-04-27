import { a as __generator } from './tslib.es6-DpMc_yT1.js';

/**
 * Fast and 'costless' range function for javascript based on generators.
 *
 * @param {number} start
 * @param {number} end
 * @param {number} step
 */
function range(start, end, step) {
    var i;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!step)
                    step = 1;
                if (end === undefined && start) {
                    end = start;
                    start = 0;
                }
                i = start;
                _a.label = 1;
            case 1:
                if (!(i < end)) return [3 /*break*/, 4];
                return [4 /*yield*/, i];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3:
                i += step;
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
/**
 * Returns an iterator over the items of all the arrays, starting from
 * the zero index to the maximum index of the first argument. The
 * effective length of the iterator is the sum of the length of the args.
 *
 * Can be used to join arrays in a way no supported by concat, pusg, etc.
 *
 * @param  {...any} args
 */
function flat() {
    var _i, count, length, j, i;
    var args = [];
    for (_i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                count = args.length;
                length = args[0].length;
                i = 0;
                _a.label = 1;
            case 1:
                if (!(i < length)) return [3 /*break*/, 6];
                j = 0;
                _a.label = 2;
            case 2:
                if (!(j < count)) return [3 /*break*/, 5];
                return [4 /*yield*/, args[j][i]];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                j++;
                return [3 /*break*/, 2];
            case 5:
                i++;
                return [3 /*break*/, 1];
            case 6: return [2 /*return*/];
        }
    });
}

export { flat, range };
