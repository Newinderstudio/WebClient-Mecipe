import { openDB, IDBPDatabase } from "idb";

// DB 버전과 store 관리
const dbVersions = new Map<string, number>();

export async function getCacheDB(dbName: string, storeName: string): Promise<IDBPDatabase> {
    // 메모리에 저장된 버전 또는 기본값
    let currentVersion = dbVersions.get(dbName) || 1;
    
    try {
        const db = await openDB(dbName, currentVersion, {
            upgrade(db) {
                // object store가 없으면 생성
                if (!db.objectStoreNames.contains(storeName)) {
                    db.createObjectStore(storeName);
                }
            },
        });
        
        // 실제 DB 버전을 메모리에 저장
        dbVersions.set(dbName, db.version);
        
        // object store가 있는지 확인
        if (!db.objectStoreNames.contains(storeName)) {
            // store가 없으면 버전 업그레이드 필요
            db.close();
            currentVersion = db.version + 1;
            dbVersions.set(dbName, currentVersion);
            
            return openDB(dbName, currentVersion, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName);
                    }
                },
            });
        }
        
        return db;
    } catch (error) {
        // VersionError: 요청 버전이 실제 버전보다 낮음
        if (error instanceof Error && error.name === 'VersionError') {
            // 버전 정보 없이 DB 열어서 실제 버전 확인
            const db = await openDB(dbName);
            const actualVersion = db.version;
            dbVersions.set(dbName, actualVersion);
            
            // object store가 있는지 확인
            if (db.objectStoreNames.contains(storeName)) {
                // 이미 있으면 그대로 반환
                return db;
            }
            
            // 없으면 버전 업그레이드
            db.close();
            const newVersion = actualVersion + 1;
            dbVersions.set(dbName, newVersion);
            
            return openDB(dbName, newVersion, {
                upgrade(db) {
                    if (!db.objectStoreNames.contains(storeName)) {
                        db.createObjectStore(storeName);
                    }
                },
            });
        }
        
        console.error('[getCacheDB] Error:', error);
        throw error;
    }
}

export async function getCache(dbName: string, storeName: string, key: string) {
    try {
        const db = await getCacheDB(dbName, storeName);
        return await db.get(storeName, key);
    } catch (error) {
        console.error('[getCache] Error:', error);
        return null; // 에러 시 null 반환 (캐시 미스로 처리)
    }
}

export async function setCache<T>(dbName: string, storeName: string, key: string, value: T) {
    try {
        const db = await getCacheDB(dbName, storeName);
        return await db.put(storeName, value, key);
    } catch (error) {
        console.error('[setCache] Error:', error);
        // 캐시 저장 실패는 무시 (앱은 계속 작동)
    }
}

export async function clearCache(dbName: string, storeName: string) {
    try {
        const db = await getCacheDB(dbName, storeName);
        await db.clear(storeName);
        console.log(`✅ [clearCache] Cleared: ${dbName}/${storeName}`);
    } catch (error) {
        console.error('[clearCache] Error:', error);
    }
}

export async function deleteDB(dbName: string) {
    try {
        const { deleteDB } = await import('idb');
        await deleteDB(dbName);
        console.log(`✅ [deleteDB] Deleted: ${dbName}`);
    } catch (error) {
        console.error('[deleteDB] Error:', error);
    }
}