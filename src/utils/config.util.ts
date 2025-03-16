/* For functions to configure things like yt-dlp */
import { platform, arch } from 'os';

const executableName = "yt-dlp"

export const getYtdlpExecutableName = (): string => {
    const isWin32 = platform() === 'win32';
    const isMac = platform() === 'darwin';
    const isLinux = platform() === 'linux'

    let fileName = executableName;

    if (isWin32) {
        if (arch() === "x32") {
            fileName += "_x86.exe"
        } else {
            fileName += ".exe"
        }
    } else if (isMac) {
        fileName += "_macos"
    } else if (isLinux) {
        if (arch() === "arm64") {
            fileName += "_linux_aarch64"
        }
        else if (arch() === "arm") {
            fileName += "_linux_armv7l"
        } else {
            fileName += "_linux"
        }
    }

    return fileName;
}