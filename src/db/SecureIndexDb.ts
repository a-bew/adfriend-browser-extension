export interface EncryptedData {
    encrypted: string;   // The encrypted data
    iv: string;          // Initialization Vector
    authTag: string;     // Authentication tag for encryption
    salt: string;        // Salt used in key derivation
}

class SecureIndexedDBStorage {
    private dbName: string = 'SecureStorage';
    private dbVersion: number = 1;

    // Create a secure IndexedDB connection
    private async openIndexedDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onupgradeneeded = (_event) => {
                const db = request.result;
                if (!db.objectStoreNames.contains('data')) {
                    // 'data' can store various items, not just seeds
                    db.createObjectStore('data', { keyPath: 'id' });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(new Error('Failed to open IndexedDB'));
        });
    }

    // Additional encryption layer
        // Additional encryption layer
        async additionalEncryption(data: any): Promise<string> {
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));

            // XOR each byte with 0x55
            const xorBuffer = new Uint8Array(dataBuffer.length);
            for (let i = 0; i < dataBuffer.length; i++) {
                xorBuffer[i] = dataBuffer[i] ^ 0x55;
            }

            // Convert the XORed buffer to a Base64 string
            return btoa(String.fromCharCode.apply(null, Array.from(xorBuffer)));
        }

        // Decrypt stored data with additional security
    async decryptStoredData(encryptedData: string): Promise<any> {
            try {
                // Decode the Base64 string
                const decoded = atob(encryptedData);
                const decodedBuffer = new Uint8Array(decoded.length);
                for (let i = 0; i < decoded.length; i++) {
                    decodedBuffer[i] = decoded.charCodeAt(i);
                }

                // XOR each byte with 0x55 to reverse the encryption
                const xorBuffer = new Uint8Array(decodedBuffer.length);
                for (let i = 0; i < decodedBuffer.length; i++) {
                    xorBuffer[i] = decodedBuffer[i] ^ 0x55;
                }

                // Convert the XORed buffer back to a string
                const decoder = new TextDecoder();
                return JSON.parse(decoder.decode(xorBuffer));
            } catch (error) {
                console.error('Decryption failed', error);
                throw new Error('Failed to decrypt stored data');
            }
        }
    // Store encrypted data in IndexedDB
    async storeData(id: string, encryptedData: EncryptedData): Promise<void> {
        const db = await this.openIndexedDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['data'], 'readwrite');
            const store = transaction.objectStore('data');

            const request = store.put({
                id: id,
                data: encryptedData,
                timestamp: Date.now()
            });

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to store data'));
        });
    }

    // Retrieve encrypted data from IndexedDB
    async retrieveData(id: string): Promise<EncryptedData> {
        const db = await this.openIndexedDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['data'], 'readonly');
            const store = transaction.objectStore('data');
            const request = store.get(id);

            request.onsuccess = () => {
                if (request.result) {
                    try {
                        resolve(request.result.data);
                    } catch (error) {
                        reject(new Error('Failed to decrypt stored data'));
                    }
                } else {
                    reject(new Error('No data found for the given ID'));
                }
            };

            request.onerror = () => reject(new Error('Failed to retrieve data'));
        });
    }

    // Clear stored data
    async clearData(id: string): Promise<void> {
        const db = await this.openIndexedDB();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['data'], 'readwrite');
            const store = transaction.objectStore('data');
            const request = store.delete(id);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(new Error('Failed to clear data'));
        });
    }
}

export const secureIndexedDBStorage = new SecureIndexedDBStorage();