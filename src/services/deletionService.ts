import RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getDBConnection, clearAllDatabaseData } from '../database/schema';

/**
 * Service orchestrating a complete eradication of user data.
 * Adheres to local-only app philosophy ensuring no straggling files remain.
 */
export const executeCompleteDataWipe = async (): Promise<void> => {
    try {
        // 1. Wipe all local PDF files stored in our Document Directory
        const documentDir = RNFS.DocumentDirectoryPath;
        const files = await RNFS.readDir(documentDir);

        for (const file of files) {
            // Delete all files that are PDFs or look like our copies 
            // We just delete all generated files safely.
            if (file.isFile()) {
                await RNFS.unlink(file.path).catch(e => {
                    console.warn(`Failed to delete file: ${file.path}`, e);
                });
            }
        }

        // 2. Eradicate SQL Database metadata and session history
        const db = await getDBConnection();
        await clearAllDatabaseData(db);

        // 3. Clear all AsyncStorage flags (HasLaunched, UserName)
        await AsyncStorage.clear();

    } catch (error) {
        console.error('Fatal error during data wipe sequence:', error);
        throw new Error('Failed to complete system wipe safely.');
    }
};
