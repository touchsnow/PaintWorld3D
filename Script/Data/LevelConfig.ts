import { _decorator, Component, Node, loader, JsonAsset, Vec3 } from 'cc';
import { ConfigManager } from '../Game/Manager/ConfigManager';
const { ccclass, property } = _decorator;

@ccclass('LevelConfig')
export class LevelConfig {

    private environmentPath: string = "Environment/"
    private matPath: string = "Mat/"
    private modelPath: string = "Model/"
    private skyBoxPath: string = "SkyBox/"

    /**环境路径 */
    public environment: string = null
    /**涂色材质路径 */
    public paintedMat: string = null
    /**模型路径 */
    public model: string = null
    /**天空盒路径 */
    public skyBox: string = null

    public finishSkyBox:string = null

    public groundAlbedo: Vec3 = new Vec3()

    public skyColor: Vec3 = new Vec3()

    public levelShowInfo:string = null

    public boardState:boolean = false

    public setConfig(jsonPath: string, levelName: string, callback) {
        //cc.loader.loadRes(jsonPath, (err, jsonAsset) => {
            let config = ConfigManager.getInstance().levelConfig
            let levelConfig = config.json[levelName]
            this.environment = this.environmentPath + levelConfig.eviroment
            this.paintedMat = this.matPath + levelConfig.paintedMat
            this.model = this.modelPath + levelConfig.model
            this.skyBox = this.skyBoxPath + levelConfig.PaintingSkyBox + "/textureCube"
            this.finishSkyBox = this.skyBoxPath + levelConfig.PaintedSkyBox + "/textureCube"
            this.groundAlbedo.x = levelConfig.groundAlbedo[0]
            this.groundAlbedo.y = levelConfig.groundAlbedo[1]
            this.groundAlbedo.z = levelConfig.groundAlbedo[2]
            this.skyColor.x = levelConfig.skyColor[0]
            this.skyColor.y = levelConfig.skyColor[1]
            this.skyColor.z = levelConfig.skyColor[2]
            this.levelShowInfo = levelConfig.Info
            this.boardState = levelConfig.boardState
            if (callback) callback()
        //})
    }
}
