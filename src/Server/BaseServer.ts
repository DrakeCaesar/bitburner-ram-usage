import { Script } from "../Script/Script";
import { isValidFilePath } from "../Terminal/DirectoryHelpers";
import { isScriptFilename } from "../Script/isScriptFilename";

interface IConstructorParams {
    adminRights?: boolean;
    hostname: string;
    ip?: string;
    isConnectedTo?: boolean;
    maxRam?: number;
    organizationName?: string;
}

interface writeResult {
    success: boolean;
    overwritten: boolean;
}

/** Abstract Base Class for any Server object */
export class BaseServer {
    // How many CPU cores this server has. Maximum of 8.
    // Currently, this only affects hacking missions
    cpuCores = 1;

    // Flag indicating whether the FTP port is open
    ftpPortOpen = false;

    // Flag indicating whether player has admin/root access to this server
    hasAdminRights = false;

    // Hostname. Must be unique
    hostname = "";

    // Flag indicating whether HTTP Port is open
    httpPortOpen = false;

    // IP Address. Must be unique
    ip = "";

    // Flag indicating whether player is currently connected to this server
    isConnectedTo = false;

    // RAM (GB) available on this server
    maxRam = 0;

    // Message files AND Literature files on this Server
    messages: string[] = [];

    // Name of company/faction/etc. that this server belongs to.
    // Optional, not applicable to all Servers
    organizationName = "";

    // Programs on this servers. Contains only the names of the programs
    programs: string[] = [];

    // RAM (GB) used. i.e. unavailable RAM
    ramUsed = 0;

    // Script files on this Server
    scripts: Script[] = [];

    // Contains the hostnames of all servers that are immediately
    // reachable from this one
    serversOnNetwork: string[] = [];

    // Flag indicating whether SMTP Port is open
    smtpPortOpen = false;

    // Flag indicating whether SQL Port is open
    sqlPortOpen = false;

    // Flag indicating whether the SSH Port is open
    sshPortOpen = false;

    // Flag indicating whether this is a purchased server
    purchasedByPlayer = false;

    // Variables that exist only on some types of servers can just be optional.
    backdoorInstalled?: boolean;

    constructor(params: IConstructorParams = { hostname: "", ip: "" }) {
        this.ip = params.ip ? params.ip : "";

        this.hostname = params.hostname;
        this.organizationName =
            params.organizationName != null ? params.organizationName : "";
        this.isConnectedTo =
            params.isConnectedTo != null ? params.isConnectedTo : false;

        //Access information
        this.hasAdminRights =
            params.adminRights != null ? params.adminRights : false;
    }

    /**
     * Given the name of the script, returns the corresponding
     * Script object on the server (if it exists)
     */
    getScript(scriptName: string): Script | null {
        for (let i = 0; i < this.scripts.length; i++) {
            if (this.scripts[i].filename === scriptName) {
                return this.scripts[i];
            }
        }

        return null;
    }

    /**
     * Remove a file from the server
     * @param fn {string} Name of file to be deleted
     * @returns {IReturnStatus} Return status object indicating whether or not file was deleted
     */
    removeFile(fn: string): boolean {
        for (let i = 0; i < this.scripts.length; ++i) {
            if (this.scripts[i].filename === fn) {
                this.scripts.splice(i, 1);
                return true;
            }
        }

        return false;
    }

    /**
     * Write to a script file
     * Overwrites existing files. Creates new files if the script does not exist.
     */
    writeToScriptFile(fn: string, code: string): writeResult {
        const ret = { success: false, overwritten: false };
        if (!isValidFilePath(fn) || !isScriptFilename(fn)) {
            return ret;
        }

        // Check if the script already exists, and overwrite it if it does
        for (let i = 0; i < this.scripts.length; ++i) {
            if (fn === this.scripts[i].filename) {
                const script = this.scripts[i];
                script.code = code;
                script.updateRamUsage(this.scripts);
                script.markUpdated();
                ret.overwritten = true;
                ret.success = true;
                return ret;
            }
        }

        // Otherwise, create a new script
        const newScript = new Script(fn, code, this.hostname, this.scripts);
        this.scripts.push(newScript);
        ret.success = true;
        return ret;
    }
}
