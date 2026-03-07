/**
 * Service for handling file operations
 */
export class FileService {
    /**
     * Save content as downloadable file
     * @param {string} content - File content
     * @param {string} filename - File name
     * @param {string} mimeType - MIME type
     */
    download(content, filename, mimeType = 'application/json') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    /**
     * Save JSON object as file
     * @param {Object} data - Data to save
     * @param {string} filename - File name
     */
    downloadJson(data, filename) {
        const content = JSON.stringify(data, null, 4);
        this.download(content, filename, 'application/json');
    }

    /**
     * Read file as text
     * @param {File} file - File to read
     * @returns {Promise<string>} File content
     */
    readAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    /**
     * Read file as JSON
     * @param {File} file - File to read
     * @returns {Promise<Object>} Parsed JSON
     */
    async readAsJson(file) {
        const text = await this.readAsText(file);
        return JSON.parse(text);
    }
}
