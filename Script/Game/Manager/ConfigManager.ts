import { _decorator, Component, Node } from 'cc';
import PlatformManager from '../../../Framework3D/Src/Base/PlatformManager';
const { ccclass, property } = _decorator;

@ccclass('ConfigManager')
export class ConfigManager {
    /**单例模式 */
    private static configManager: ConfigManager
    public static getInstance(): ConfigManager {
        if (this.configManager == null) {
            this.configManager = new ConfigManager()
        }
        return ConfigManager.configManager
    }

    private mainConfigPath: string = "MainConfig"

    private levelConfigpath: string = "LevelConfig"

    public mianConfig: any = null

    public levelConfig: any = null

    public adThemeUnlock: boolean = true

    init() {
        cc.loader.loadRes(this.mainConfigPath, (err, jsonAsset) => {
            this.mianConfig = jsonAsset
        })
        cc.loader.loadRes(this.levelConfigpath, (err, jsonAsset) => {
            this.levelConfig = jsonAsset
        })
        if (PlatformManager.getInstance().isOppo()) {
            //获取资源配置
            var url = 'https://xiaoyudi-1259481479.cos.ap-guangzhou.myqcloud.com/BenFei/PaintWorld3D/Config/Config.json';
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    var data = xhr.responseText;
                    if (!data) {
                        console.log("加载配置失败");
                        return;
                    }
                    var json = JSON.parse(data);
                    this.adThemeUnlock = json["ThemeAdUnlock"]
                }
            }.bind(this)
            xhr.onerror = function (e) {
                console.log("加载配置错误", "err:" + JSON.stringify(e));
            }
            xhr.open("GET", url, true);
            xhr.setRequestHeader("content-type", "application/json");
            xhr.send();
        }

    }
}
