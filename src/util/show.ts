import { green, red } from 'colors/safe';
import { LIBNAME } from '../constants';

function ShowError(...args: string[]) {
    const text = args.join(' ');
    return console.error(red(text));
}
function ShowMessage(...args: string[]) {
    const text = args.join(' ');
    return console.log(green(text));
}
export default function Show(
    type: 'error' | 'message',
    ...args: string[]
) {
    if (type === 'error')
        return ShowError(LIBNAME, 'ERROR', ...args);
    if (type === 'message')
        return ShowMessage(LIBNAME, 'MESSAGE', ...args);
    console.log(...args);
}
