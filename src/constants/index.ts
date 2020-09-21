import { resolve } from 'path';

export const LIBNAME = 'goldpkg';

export const VCPKG_DIR = resolve(
    String(process.env.VCPKG_DIR || '.vcpkg')
);

export const DEFAULT_EMPTY_STDOUT = {
    stdout: '',
    stderr: '',
    show: false
};

export const GIT_REPO_SAMPLE_CODE =
    'https://github.com/pratikpc/GoldPKG-Template';
