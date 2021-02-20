import { _decorator, Component, Node, loader, TextureCube, director, instantiate, Color, Enum } from 'cc';
import { Constants } from '../../Data/Constants';
import { LevelConfig } from '../../Data/LevelConfig';
import StorgeManager from './StorgeManager';
const { ccclass, property } = _decorator;

@ccclass('LevelManager')
export class LevelManager {
    /**单例模式 */
    private static levelManager: LevelManager
    public static getInstance(): LevelManager {
        if (this.levelManager == null) {
            this.levelManager = new LevelManager()
        }
        return LevelManager.levelManager
    }
    private constructor() {
        this.levelConfig = new LevelConfig()
    }

    private jsonPath: string = "LevelConfig"

    /**关卡配置信息 */
    public levelConfig: LevelConfig = null

    public levelName: string = null

    public gameMode  = Constants.GameMode.Normal

    /**设置关卡信息 */
    public set(levelName: string = null, callBack = null) {
        if (levelName) {
            this.levelName = levelName
            this.levelConfig.setConfig(this.jsonPath, levelName, callBack)
        }
    }
}
