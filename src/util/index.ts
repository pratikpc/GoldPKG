import path from 'path';
import lodash from 'lodash';

export function AreSame<T>(left: T[], right: T[]) {
    const diff = lodash.xor(left, right);
    return lodash.isEmpty(diff);
}

export function NonNull<T>(...elems: T[]) {
    for (const elem of elems) if (elem != null) return elem;
    return elems[elems.length - 1];
}

export function ReturnParamTwice<T>(...elems: T[]) {
    return [...elems, ...elems];
}

export function trimChar(
    origString: string,
    charToTrim: string
) {
    const regEx = new RegExp(
        `^[${charToTrim}]+|[${charToTrim}]+$`,
        'g'
    );
    return origString.replace(regEx, '');
}

export function ToPosixPath(filePath: string) {
    return filePath.split(path.sep).join(path.posix.sep);
}

export function CMakeTOVCPkgPath(cmake: string) {
    return path.resolve(
        path.join(path.dirname(cmake), 'vcpkg.json')
    );
}
