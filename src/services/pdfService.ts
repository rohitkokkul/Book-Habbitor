import DocumentPicker, { DocumentPickerResponse } from 'react-native-document-picker';
import RNFS from 'react-native-fs';
import { PDFDocument } from 'pdf-lib';

export interface UploadResult {
    success: boolean;
    filePath?: string;
    fileName?: string;
    totalPages?: number;
    error?: string;
}

export const pickAndStorePdf = async (): Promise<UploadResult> => {
    try {
        // 1. Prompt user to select a single PDF document
        const [file]: DocumentPickerResponse[] = await DocumentPicker.pick({
            type: [DocumentPicker.types.pdf],
            allowMultiSelection: false,
        });

        if (!file || !file.uri || !file.name) {
            return { success: false, error: 'File selection was incomplete or canceled.' };
        }

        // Handle large/arbitrary file checks if needed, e.g., sizes > 100MB
        // file.size contains bytes. If needed to block huge files, we can.
        // For now, let's gracefully attempt copy since standard is "handle gracefully"

        // 2. Prepare destination path within our app's secure private directory
        // Ensure we give it a unique name to avoid overwriting (optional, but good practice). Or just use file.name
        const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const destinationPath = `${RNFS.DocumentDirectoryPath}/${Date.now()}_${safeFileName}`;

        // 3. DocumentPicker URIs (especially on Android) are often 'content://' URIs.
        // RNFS copyFile helps resolve content URIs to standard file streams in standard storage locations.
        await RNFS.copyFile(file.uri, destinationPath);

        // After copy, verifying if file exists / is valid size is good practice.
        const stat = await RNFS.stat(destinationPath);
        if (stat.size === 0) {
            // Removing potentially corrupt empty file
            await RNFS.unlink(destinationPath).catch(() => { });
            return { success: false, error: 'The selected PDF appears to be empty or corrupt.' };
        }

        // Extract Total Pages safely
        let totalPages = 0;
        try {
            // Read as base64. Note: extremely large PDFs (>50MB) might stress memory here.
            // In a very scalable production app, you might use a native module purely for page count or stream.
            const base64Data = await RNFS.readFile(destinationPath, 'base64');
            const pdfDoc = await PDFDocument.load(base64Data, { ignoreEncryption: true });
            totalPages = pdfDoc.getPageCount();
        } catch (pdfError) {
            console.warn('Could not extract PDF page count natively, defaulting to 0', pdfError);
        }

        return {
            success: true,
            filePath: destinationPath,
            fileName: file.name,
            totalPages
        };

    } catch (err: unknown) {
        if (DocumentPicker.isCancel(err)) {
            // User cancelled picker, not an error
            return { success: false, error: 'User cancelled document picker' };
        }

        // Format graceful error
        const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred.';
        return { success: false, error: `Failed to store PDF: ${errorMessage}` };
    }
};
