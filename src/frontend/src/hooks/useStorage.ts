import { HttpAgent } from "@icp-sdk/core/agent";
import { useCallback } from "react";
import { loadConfig } from "../config";
import { StorageClient } from "../utils/StorageClient";

export function useStorage() {
  const getStorageClient = useCallback(async () => {
    const config = await loadConfig();
    const agent = new HttpAgent({
      host: config.backend_host,
    });
    if (config.backend_host?.includes("localhost")) {
      await agent.fetchRootKey().catch(console.warn);
    }
    return new StorageClient(
      config.bucket_name,
      config.storage_gateway_url,
      config.backend_canister_id,
      config.project_id,
      agent,
    );
  }, []);

  const upload = useCallback(
    async (file: File, onProgress?: (pct: number) => void): Promise<string> => {
      const storageClient = await getStorageClient();
      const bytes = new Uint8Array(await file.arrayBuffer());
      const { hash } = await storageClient.putFile(bytes, onProgress);
      return hash;
    },
    [getStorageClient],
  );

  const getUrl = useCallback(
    async (hash: string): Promise<string> => {
      const storageClient = await getStorageClient();
      return storageClient.getDirectURL(hash);
    },
    [getStorageClient],
  );

  return { upload, getUrl };
}
