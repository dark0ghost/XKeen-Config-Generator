/**
 * Service for handling clipboard operations
 */
export class ClipboardService {
    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} Success status
     */
    async copy(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            return this.#fallbackCopy(text);
        }
    }

    /**
     * Fallback copy method using execCommand
     * @private
     * @param {string} text - Text to copy
     * @returns {boolean} Success status
     */
    #fallbackCopy(text) {
        try {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const success = document.execCommand('copy');
            document.body.removeChild(textarea);
            return success;
        } catch (err) {
            console.error('Fallback copy failed:', err);
            return false;
        }
    }

    /**
     * Read text from clipboard
     * @returns {Promise<string>} Clipboard text
     */
    async paste() {
        try {
            return await navigator.clipboard.readText();
        } catch (err) {
            console.error('Clipboard read failed:', err);
            throw new Error('Unable to read from clipboard');
        }
    }
}
