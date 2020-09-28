import FindCMakeFiles from '../util/FindCMakeFiles';
import CMakeParser from './CMakeParser';

export default class CMakeParsers {
    private files: CMakeParser[] = [];

    public async OpenFiles() {
        this.files = (await FindCMakeFiles()).map(
            (cmakeFile) => new CMakeParser(cmakeFile)
        );
    }

    public get length() {
        return this.files.length;
    }

    public async LoadFiles() {
        await Promise.all(
            this.files.map((file) => file.LoadFile())
        );
    }

    public IgnoreUnchangedOnly() {
        // Retain Changed files only
        this.files = this.files.filter(
            (cmakeFile) => cmakeFile.Changes
        );
    }

    public async Save() {
        await Promise.all(
            this.files.map((cmakeFile) => cmakeFile.Save())
        );
    }

    public InsertFindAndTarget(
        find: string[],
        target: string[],
        removeFinds: string[] = [],
        removeTargets: string[] = []
    ) {
        // Modify and Add Dependencies to the CMake Files
        for (const cmakeFile of this.files) {
            cmakeFile.InsertFindAndTarget(
                find,
                target,
                removeFinds,
                removeTargets
            );
        }
    }

    public get FileNames() {
        return this.files.map(
            (cmakeFile) => cmakeFile.FilePath
        );
    }
}

export async function AddToolchainPathToTopLevelCMakeLists(
    topLevelPath: string
) {
    // Update the Local CMake File
    // Add ToolChain Path
    const defaultTopLevelCMakeToolChain = new CMakeParser();
    await defaultTopLevelCMakeToolChain.LoadFile(
        topLevelPath
    );
    // Save the path to our VCPKG CMake ToolChain File
    defaultTopLevelCMakeToolChain.setCMakeToolChainLine();
    await defaultTopLevelCMakeToolChain.Save();
}
