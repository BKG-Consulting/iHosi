export interface EncryptedData {
    encrypted: string;
    iv: string;
    tag: string;
}
export declare function encryptPHI(plaintext: string | null | undefined): string | null;
export declare function decryptPHI(encryptedData: string | null | undefined): string | null;
export declare const PHIEncryption: {
    encryptPatientData: (data: any) => any;
    decryptPatientData: (data: any) => any;
    encryptMedicalRecord: (data: any) => any;
    decryptMedicalRecord: (data: any) => any;
    encryptDiagnosis: (data: any) => any;
    decryptDiagnosis: (data: any) => any;
};
export declare function rotateEncryptionKey(): Promise<void>;
export declare function createDataHash(data: string): string;
export declare function verifyDataIntegrity(data: string, hash: string): boolean;
