import { describe, expect, it, vi } from "vitest";
import { uploadEditorImage } from "../../services/image/imageUploadFlow";
import type { ImageHostConfig } from "../../services/image/ImageUploader";
import type { ImageCompressionDependencies } from "../../services/image/autoCompressImage";

const MB = 1024 * 1024;

function createImageFile(
  sizeInBytes: number,
  type = "image/jpeg",
  name = "demo.jpg",
): File {
  return new File([new Uint8Array(sizeInBytes)], name, { type });
}

function createBlobOfSize(sizeInBytes: number, type = "image/jpeg"): Blob {
  return new Blob([new Uint8Array(sizeInBytes)], { type });
}

describe("uploadEditorImage integration", () => {
  it("小图不压缩，直接上传原图", async () => {
    const file = createImageFile(300 * 1024, "image/jpeg", "small.jpg");
    const uploadedFiles: File[] = [];
    const config: ImageHostConfig = { type: "official" };

    const result = await uploadEditorImage(file, {
      getImageHostConfig: () => config,
      createManager: () => ({
        upload: async (uploadFile: File) => {
          uploadedFiles.push(uploadFile);
          return "https://example.com/small.jpg";
        },
      }),
    });

    expect(result.compressed).toBe(false);
    expect(result.uploadedFile).toBe(file);
    expect(uploadedFiles).toHaveLength(1);
    expect(uploadedFiles[0]).toBe(file);
    expect(result.url).toBe("https://example.com/small.jpg");
  });

  it("超限图片先压缩，再上传压缩结果", async () => {
    const file = createImageFile(Math.round(3.2 * MB), "image/jpeg", "big.jpg");
    const uploadedFiles: File[] = [];
    const config: ImageHostConfig = { type: "official" };

    const compressionDependencies: ImageCompressionDependencies = {
      loadImage: vi.fn().mockResolvedValue({
        image: {} as CanvasImageSource,
        width: 4200,
        height: 2800,
      }),
      renderToBlob: vi.fn().mockImplementation(({ width, quality }) => {
        const scale = width / 4200;
        const size = Math.round(
          3.6 * MB * scale * scale * (0.5 + 0.5 * quality),
        );
        return Promise.resolve(createBlobOfSize(size));
      }),
    };

    const result = await uploadEditorImage(file, {
      compressionOptions: { maxSizeBytes: 2 * MB },
      compressionDependencies,
      getImageHostConfig: () => config,
      createManager: () => ({
        upload: async (uploadFile: File) => {
          uploadedFiles.push(uploadFile);
          return "https://example.com/big.jpg";
        },
      }),
    });

    expect(result.compressed).toBe(true);
    expect(result.uploadedFile).not.toBe(file);
    expect(result.finalSize).toBeLessThanOrEqual(2 * MB);
    expect(uploadedFiles).toHaveLength(1);
    expect(uploadedFiles[0].size).toBeLessThanOrEqual(2 * MB);
    expect(result.url).toBe("https://example.com/big.jpg");
  });

  it("LocalUploader 能够正确读取文件为 base64 data url，无需外部网络", async () => {
    const { LocalUploader } = await import(
      "../../services/image/uploaders/LocalUploader"
    );
    const uploader = new LocalUploader();
    const file = new File(["test-image-binary-data"], "test.png", {
      type: "image/png",
    });
    const url = await uploader.upload(file);
    expect(url.startsWith("data:image/png;base64,")).toBe(true);
    expect(await uploader.validate()).toBe(true);
  });
});
