import type { UploadSession } from './types';

declare global {
    var uploadSessions: Map<string, UploadSession> | undefined;
    var sessionCleanupInterval: NodeJS.Timeout | undefined;
}