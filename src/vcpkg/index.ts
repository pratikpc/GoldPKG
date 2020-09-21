import RunVCPKG from './run';
import Install from './install';
import Show from '../util/show';
import Remove from './remove';
import { UpdateVCPKgSubmodule } from '../util/Git';
import { DEFAULT_EMPTY_STDOUT } from '../constants';

export default async function ExecVCPKg(
    options_: string[]
): Promise<typeof DEFAULT_EMPTY_STDOUT> {
    // By Default, Show Help
    const options =
        options_.length === 0 ? ['help'] : options_;

    const mainCommand = options[0];
    // Now we Specialise for Install
    if (mainCommand === 'install') {
        // Remove the MainCommand from the List
        const commands = options.slice(1);
        return await Install(commands);
    }
    // Now we Specialise for Remove
    if (mainCommand === 'remove') {
        // Remove the MainCommand from the List
        const packages = options.slice(1);
        return await Remove(packages);
    }
    if (mainCommand === 'update') {
        Show('message', 'Updating vcpkg');
        // Update vcpkg submodule first
        await UpdateVCPKgSubmodule();
        // Next as we have not Returned,
        // It would end up calling the Run command
    }
    return await RunVCPKG(options, true);
}
