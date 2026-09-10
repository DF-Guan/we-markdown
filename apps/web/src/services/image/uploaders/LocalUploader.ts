import type { ImageUploader } from "../ImageUploader";

/**
 * 本地直传上传器（默认）
 * 直接将用户本地选择或粘贴的图片转为 Base64 Data URL，
 * 100% 本地优先，无任何第三方服务器中转，零网络依赖。
 * 粘贴到微信公众号后台时，微信会自动将 Base64 图片无损转存至微信官方图床。
 */
export class LocalUploader implements ImageUploader {
  name = "本地直传";

  async upload(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("读取本地图片失败"));
        }
      };
      reader.onerror = () => reject(new Error("读取本地图片失败"));
      reader.readAsDataURL(file);
    });
  }

  async validate(): Promise<boolean> {
    return true;
  }
}
