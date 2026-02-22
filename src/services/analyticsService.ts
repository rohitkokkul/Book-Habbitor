import { SQLiteDatabase } from 'react-native-sqlite-storage';
import { getDBConnection } from '../database/schema';

export interface ReadingAnalytics {
    currentStreak: number;
    longestStreak: number;
    todayMinutes: number;
    weeklyMinutes: number;
    monthlyMinutes: number;
    lifetimeHours: number;
    totalBooks: number;
    past7DaysMinutes: number[];
}

export interface ReadingSession {
    id: string;
    bookId: string;
    durationSeconds: number;
    timestamp: number;
}

/**
 * Strips the time component from a date to easily compare "days" regardless of local time exactly at midnight.
 */
const getStartOfDayTime = (date: Date): number => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
};

export const getAnalytics = async (): Promise<ReadingAnalytics> => {
    const db: SQLiteDatabase = await getDBConnection();

    // 1. Fetch total books
    let totalBooks = 0;
    try {
        const booksResult = await db.executeSql('SELECT COUNT(*) as count FROM books');
        if (booksResult[0].rows.length > 0) {
            totalBooks = booksResult[0].rows.item(0).count;
        }
    } catch (error) {
        console.warn('Failed calculating total books', error);
    }

    // 2. Fetch all reading sessions order by timestamp DESC
    let sessions: ReadingSession[] = [];
    try {
        const sessionsResult = await db.executeSql('SELECT * FROM reading_sessions ORDER BY timestamp DESC');
        const rows = sessionsResult[0].rows;
        for (let i = 0; i < rows.length; i++) {
            sessions.push(rows.item(i));
        }
    } catch (error) {
        console.warn('Failed retrieving sessions', error);
    }

    const now = new Date();
    const todayStart = getStartOfDayTime(now);

    // Define weekly boundaries (assuming rolling 7 days, or current week. Let's use last 7 days for a rolling habit tracker)
    const sevenDaysAgo = todayStart - (6 * 24 * 60 * 60 * 1000);
    // Define monthly boundaries (rolling 30 days)
    const thirtyDaysAgo = todayStart - (29 * 24 * 60 * 60 * 1000);

    let todaySeconds = 0;
    let weeklySeconds = 0;
    let monthlySeconds = 0;
    let lifetimeSeconds = 0;

    // Array to hold the chart data. Index 0 = 6 days ago, ..., Index 6 = today
    // Let's create an array initialized to [0, 0, ... 0]
    const past7DaysSeconds = [0, 0, 0, 0, 0, 0, 0];

    // Process Aggregates
    sessions.forEach(session => {
        lifetimeSeconds += session.durationSeconds;

        const sessionStartOfDay = getStartOfDayTime(new Date(session.timestamp));

        if (sessionStartOfDay === todayStart) {
            todaySeconds += session.durationSeconds;
        }
        if (sessionStartOfDay >= sevenDaysAgo) {
            weeklySeconds += session.durationSeconds;

            // Calculate which bucket this session belongs to (0 represents 6 days ago, 6 represents today)
            const daysDifference = Math.floor((todayStart - sessionStartOfDay) / (24 * 60 * 60 * 1000));
            if (daysDifference >= 0 && daysDifference <= 6) {
                // Invert the index so today is at the end
                const bucketIndex = 6 - daysDifference;
                past7DaysSeconds[bucketIndex] += session.durationSeconds;
            }
        }
        if (sessionStartOfDay >= thirtyDaysAgo) {
            monthlySeconds += session.durationSeconds;
        }
    });

    // 3. Process Streaks
    // Extract unique active reading days, sorted descending
    const uniqueReadingDays = new Set<number>();
    sessions.forEach(s => {
        uniqueReadingDays.add(getStartOfDayTime(new Date(s.timestamp)));
    });

    const sortedDaysDesc = Array.from(uniqueReadingDays).sort((a, b) => b - a);

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (sortedDaysDesc.length > 0) {
        // Check if streak is active today or yesterday
        const mostRecentDay = sortedDaysDesc[0];
        const yesterdayStart = todayStart - ONE_DAY_MS;

        if (mostRecentDay === todayStart || mostRecentDay === yesterdayStart) {
            currentStreak = 1;
            let expectedNextDay = mostRecentDay - ONE_DAY_MS;

            for (let i = 1; i < sortedDaysDesc.length; i++) {
                if (sortedDaysDesc[i] === expectedNextDay) {
                    currentStreak++;
                    expectedNextDay -= ONE_DAY_MS;
                } else {
                    break;
                }
            }
        }

        // Calculate maximum historical streak
        tempStreak = 1;
        longestStreak = 1;
        let expectedNextHistDay = sortedDaysDesc[0] - ONE_DAY_MS;

        for (let i = 1; i < sortedDaysDesc.length; i++) {
            if (sortedDaysDesc[i] === expectedNextHistDay) {
                tempStreak++;
                expectedNextHistDay -= ONE_DAY_MS;
            } else {
                if (tempStreak > longestStreak) longestStreak = tempStreak;
                tempStreak = 1;
                expectedNextHistDay = sortedDaysDesc[i] - ONE_DAY_MS;
            }
        }
        if (tempStreak > longestStreak) longestStreak = tempStreak;
    }

    // If current exceeds longest, sync them (though logic above handles this mostly, just a failsafe)
    longestStreak = Math.max(longestStreak, currentStreak);

    return {
        currentStreak,
        longestStreak,
        todayMinutes: Math.floor(todaySeconds / 60),
        weeklyMinutes: Math.floor(weeklySeconds / 60),
        monthlyMinutes: Math.floor(monthlySeconds / 60),
        lifetimeHours: Math.floor(lifetimeSeconds / 3600), // Converted explicitly to hours
        totalBooks,
        past7DaysMinutes: past7DaysSeconds.map(sec => Math.floor(sec / 60)),
    };
};
