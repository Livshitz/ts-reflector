import path from "path";
import { helper } from "./helper";
import { Reflector } from "./Reflector";
import fs from 'fs';
import fg from "fast-glob";

enum PathTypes {
    unknown,
    file,
    folder,
}

export default class CLIApp {
    constructor() { }

    public run() {
        console.log(' --- Reflector CLI:');
        const input = helper.args.i ?? helper.args.input;
        console.log('args', input);

        const files = [];
        if (input.indexOf('*') > -1 || this.checkPathType(input) == PathTypes.folder) {
            console.log('Found files, listing in folder: ', input);
            // const listedFiles = this.listFilesInFolder(input);
            const listedFiles = fg.sync([input]);
            console.log('files: ', listedFiles);
            files.push(...listedFiles);
        } else {
            files.push(input);
        }

        for (let file of files) {
            console.log('treating file: ', file);
            this.treatFile(file);
        }

        console.log('DONE!');

        process.exit(0);
    }

    private listFilesInFolder(folderPath) {
        const files = fs.readdirSync(folderPath);

        // Filter out directories and list only files
        const filesOnly = files.filter((file) => {
            const filePath = path.join(folderPath, file);
            return fs.statSync(filePath).isFile();
        });

        // console.log(`Files in ${folderPath}:`);
        const ret = [];
        filesOnly.forEach((file) => {
            ret.push(path.join(folderPath, file));
        });
        return ret;
    }

    private treatFile(path) {
        const reflector = new Reflector(path);

        const ret = reflector.generate();

        // Generate the JSON representation
        const json = JSON.stringify(ret, null, 2);

        const moduleName = Object.keys(ret)[0];
        console.log(json);

        const outputDir = helper.args.o ?? helper.args.output;
        if (outputDir) {
            const outputFile = `${outputDir}/${moduleName}.json`;
            console.log('Writing output to file in directory: ', outputFile);
            this.ensureDirAndWrite(outputFile, json);
        }
    }

    private ensureDirAndWrite(filePath, data) {
        const dir = path.dirname(filePath);

        try {
            fs.accessSync(dir);
        } catch (error) {
            fs.mkdirSync(dir, { recursive: true });
        }

        fs.writeFileSync(filePath, data);
    }


    private checkPathType(path) {
        const stats = fs.statSync(path);
        if (stats.isDirectory()) {
            return PathTypes.folder;
        } else if (stats.isFile()) {
            console.log(`${path} is a file.`);
            return PathTypes.file;
        } else {
            return PathTypes.unknown
        }
    }
}

class Program {
    public static async main() {
        let error: Error = null;

        try {
            console.log('----------------');
            let app = new CLIApp();
            app.run();
            console.log('DONE');
        } catch (err) {
            error = err;
        } finally {
            let errorCode = 0;
            if (error) {
                console.error('----- \n [!] Failed: ', error);
                errorCode = 1;
            }

            if (require.main === module) process.kill(process.pid, 'SIGINT') // clean exit;
        }
    }
}

Program.main(); // Comment if you don't want to use this file as node script and self execute
