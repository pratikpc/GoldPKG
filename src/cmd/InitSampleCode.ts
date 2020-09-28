import {
    GIT_REPO_SAMPLE_CODE,
    LIBNAME
} from '../constants';
import { CloneRepo } from '../util/Git';
import Show from '../util/show';

export default async function InitSampleCode(
    location: string,
    ...args: string[]
) {
    await CloneRepo(
        GIT_REPO_SAMPLE_CODE,
        location,
        ...args
    );
    Show(
        'message',
        `Install packages at ${location} using npx ${LIBNAME} install`
    );
    return { show: false };
}
