import { GIT_REPO_SAMPLE_CODE, LIBNAME } from '../constants';
import { CloneRepo } from '../util/Git';
import RunCommandAsStream from '.';

export default async function InitSampleCode(
    location: string,
    ...args: string[]
) {
    const cwd = process.cwd();
    try {
        await CloneRepo(
            GIT_REPO_SAMPLE_CODE,
            location,
            ...args
        );
        process.chdir(location);
        await RunCommandAsStream(`npx ${LIBNAME} install`);
    } catch (err) {
        // Ignore Error
    }
    process.chdir(cwd);
    return { show: false };
}
