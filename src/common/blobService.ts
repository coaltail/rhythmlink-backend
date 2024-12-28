import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import logger from "@utils/logger";
import dotenv from "dotenv";
dotenv.config();
const BLOB_SAS_URL = process.env.AZURE_BLOB_SAS_URL
const AZURE_CONTAINER_NAME = process.env.AZURE_CONTAINER_NAME
class BlobService {
    private static instance: BlobService | null = null;
    private blobServiceClient: BlobServiceClient;

    private constructor() {
        if (!BLOB_SAS_URL) {
            throw new Error("Azure Blob SAS URL is not defined in the environment variables.");
        }
        logger.info(`Sas url is: ${BLOB_SAS_URL}`)
        this.blobServiceClient = new BlobServiceClient(BLOB_SAS_URL);
    }

    /**
     * Get the singleton instance of BlobService.
     * @param sasUrl The SAS URL for Blob Storage.
     */
    public static getInstance(): BlobService {
        if (!BlobService.instance) {
            BlobService.instance = new BlobService();
            logger.info("BlobService initialized as singleton.");
        }
        return BlobService.instance;
    }

    /**
     * Get a container client by name.
     */
    getContainerClient(): ContainerClient {
        return this.blobServiceClient.getContainerClient(AZURE_CONTAINER_NAME);
    }

    /**
     * Upload a file to a specified container.
     * @param blobName Name of the blob (file).
     * @param content Content of the file.
     */
    async uploadBlob(blobName: string, content: string | Buffer): Promise<void> {
        const containerClient = this.getContainerClient();
        const exists = await containerClient.exists();
        if (!exists) {
            await containerClient.create();
            logger.info(`Container ${AZURE_CONTAINER_NAME} created.`);
        }

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        logger.info(`Block blob client: ${blockBlobClient}`)
        await blockBlobClient.upload(content, content.length);
        logger.info(`Blob ${blobName} uploaded to container ${AZURE_CONTAINER_NAME}.`);
    }

    /**
     * Download a blob from a container.
     * @param blobName Name of the blob (file).
     */
    async downloadBlob(blobName: string): Promise<string> {
        const containerClient = this.getContainerClient();
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);
        const downloadResponse = await blockBlobClient.download();

        // Read the downloaded content
        const downloaded = (await this.streamToBuffer(downloadResponse.readableStreamBody)).toString();
        logger.info(`Blob ${blobName} downloaded.`);
        return downloaded;
    }

    private async streamToBuffer(readableStream: NodeJS.ReadableStream | null): Promise<Buffer> {
        if (!readableStream) {
            throw new Error("Readable stream is null or undefined.");
        }

        const chunks: Buffer[] = [];
        for await (const chunk of readableStream) {
            chunks.push(Buffer.from(chunk));
        }
        return Buffer.concat(chunks);
    }
}

export default BlobService;
