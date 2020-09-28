import { existsSync } from 'fs';
import { lstat, readFile, writeFile } from 'fs/promises';
import path, { join } from 'path';

export default class BaseParser {
    public FilePath = '';
    public DefaultFile = '';

    public async LoadFile(FilePath?: string) {
        if (FilePath === '') return;
        this.FilePath = FilePath ?? this.FilePath;
        this.FilePath = path.resolve(this.FilePath);
        if (!this.Exists) {
            this.FilePath = '';
            return;
        }
        // First Check if Path is Folder
        let stats = await lstat(this.FilePath);
        if (stats.isDirectory()) {
            // If Folder, assume CMakeLists.txt is default file in Directory
            this.FilePath = join(
                this.FilePath,
                this.DefaultFile
            );
        }
        if (!this.Exists) {
            this.FilePath = '';
            return;
        }
        stats = await lstat(this.FilePath);
        if (!stats.isFile()) this.FilePath = '';
    }

    constructor(DefaultFile: string, FilePath?: string) {
        this.DefaultFile = DefaultFile;
        this.FilePath = FilePath ?? '';
    }

    public get BaseName() {
        return path.basename(this.FilePath);
    }

    public get DirName() {
        return path.resolve(
            path.dirname(path.resolve(this.FilePath))
        );
    }

    public get ReadJson() {
        return this.Read.then((text) => {
            try {
                const json = JSON.parse(text);
                return json;
            } catch (err) {
                return {};
            }
        });
    }

    public get Read() {
        return readFile(this.FilePath).then((buffer) =>
            buffer.toString()
        );
    }

    public get Exists() {
        return (
            this.FilePath !== '' &&
            existsSync(this.FilePath)
        );
    }

    async WriteFile(data: string | Uint8Array) {
        if (this.Exists)
            await writeFile(this.FilePath, data);

    async WriteFile(
        data: string | Uint8Array,
        checkExists = true
    ) {
        if (checkExists && !this.Exists) return;
        await writeFile(this.FilePath, data);
    }

    public async WriteJson(
        file: unknown,
        checkExists = true
    ) {
        await this.WriteFile(
            JSON.stringify(file, null, '\t'),
            checkExists
        );
    }
}
