import { _decorator, Component, Node, find } from 'cc';
import BaseStorge from '../../../Framework3D/Src/Base/BaseStorge';
import { Constants } from '../../Data/Constants';
import { LevelStorgeInfo } from '../../Data/LevelStorgeInfo';
import { LevelManager } from './LevelManager';
const { ccclass } = _decorator;

@ccclass('StorgeManager')
export default class StorgeManager extends BaseStorge {
    /**单例模式 */
    private static storgeManager: StorgeManager
    public static getInstance(): StorgeManager {
        if (this.storgeManager == null) {

            this.storgeManager = new StorgeManager().init()
        }
        return StorgeManager.storgeManager
    }

    private gameVer: number = 0

    public init(): any {
        //@ts-ignore
        let storgeItem = this.get(this.__proto__.constructor.name);
        if (storgeItem) {
            //@ts-ignore
            Object.assign(this, storgeItem);
            if (this.gameVer !== Constants.GameVer) {
                //@ts-ignore
                this.remove(this.__proto__.constructor.name)
                this.initData()
                //@ts-ignore
                this.set(this.__proto__.constructor.name, this);
            }
        } else {
            //@ts-ignore
            this.set(this.__proto__.constructor.name, this);
        }
        return this;
    }

    //存储模型名字，可以从这里获取到paintArrary对应的Index
    public arrayIndex: Array<string> = []
    //存储已经玩过的类
    public storgeInfoArray: Array<LevelStorgeInfo> = []
    //已经完成的名字数组
    public finishArray: Array<string> = []
    //金币数
    public cion: number = 0
    //钻石数
    public diamon: number = 0
    //已经接收的主题
    public hadReceiveTheme: Array<string> = []
    //已经接收的关卡
    public hadReceiveLevel: Array<string> = []
    //已经播放过完成关卡动画
    public hadPlayFinishAnim: Array<string> = []
    //main场景ScrollView下的节点状态
    public listState: Array<boolean> = []
    //main场景content的位置
    public contentPos: number = 0
    //mian场景引导点击关卡
    public guideLevel: boolean = false
    //已经解锁的主题
    public unlockTheme: Array<string> = ["QiMiaoQiDian"]
    //已经完成的主题
    public finishTheme: Array<string> = []
    //移动涂色次数
    public movePaintCount: number = 0
    //全屏涂色次数
    public fullScreenPaintCount: number = 0
    //提示涂色次数
    public promotyCount: number = 0

    initData() {
        this.gameVer = Constants.GameVer
        //存储模型名字，可以从这里获取到paintArrary对应的Index
        this.arrayIndex = []
        //存储已经玩过的类
        this.storgeInfoArray = []
        //已经完成的名字数组
        this.finishArray = []
        //金币数
        this.cion = 0
        //钻石数
        this.diamon = 0
        //已经接收的主题
        this.hadReceiveTheme = []
        //已经接收的关卡
        this.hadReceiveLevel = []
        //已经播放过完成关卡动画
        this.hadPlayFinishAnim = []
        //main场景ScrollView下的节点状态
        this.listState = []
        //main场景content的位置
        this.contentPos = 0
        //mian场景引导点击关卡
        this.guideLevel = false
        //已经解锁的主题
        this.unlockTheme = ["QiMiaoQiDian"]
        //已经完成的主题
        this.finishTheme = []
        //移动涂色次数
        this.movePaintCount = 2
        //全屏涂色次数
        this.fullScreenPaintCount = 2
        //提示涂色次数
        this.promotyCount = 2
    }

    /**初始化一个模型数据 */
    updateLevelData(name: string = LevelManager.getInstance().levelName) {
        if (this.arrayIndex.indexOf(name) === -1) {
            let levelInfo = new LevelStorgeInfo()
            this.arrayIndex.push(name)
            this.storgeInfoArray.push(levelInfo)
        }
        this.update()
    }

    /**获取已经涂色的模型数组 */
    getPainedArray(name: string = LevelManager.getInstance().levelName) {
        if (this.arrayIndex.indexOf(name) !== -1) {
            return this.storgeInfoArray[this.arrayIndex.indexOf(name)].paintedArray
        }
        else {
            return []
        }
    }

    /**保存已经涂色的模型 */
    savePaintedModel(modelName: string, name: string = LevelManager.getInstance().levelName) {
        this.storgeInfoArray[this.arrayIndex.indexOf(name)].paintedArray.push(modelName)
        this.update()
    }

    /**设置完成的关卡 */
    setFinished() {
        if (this.finishArray.indexOf(LevelManager.getInstance().levelName) === -1) {
            this.finishArray.push(LevelManager.getInstance().levelName)
        }
        this.update()
    }

    /**获取关卡是否完成的标志 */
    getFinishedFlag(name: string) {
        if (this.finishArray.indexOf(name) === -1) {
            return false
        }
        else {
            return true
        }
    }

    /**重置关卡主题 */
    resetPaintArray(name: string = LevelManager.getInstance().levelName) {
        if (this.arrayIndex.indexOf(name) !== -1) {
            this.storgeInfoArray[this.arrayIndex.indexOf(name)].paintedArray = []
            this.storgeInfoArray[this.arrayIndex.indexOf(name)].currentGameTime = 0
            this.update()
        }
    }

    /**获取是否已经玩过的标志 */
    getHadPalyFlag(name: string = LevelManager.getInstance().levelName) {
        if (this.arrayIndex.indexOf(name) !== -1) {
            return true
        }
        else {
            return false
        }
    }

    /**设置完成度 */
    setFinishedRate(rate: number, name: string = LevelManager.getInstance().levelName) {
        this.storgeInfoArray[this.arrayIndex.indexOf(name)].finishRate = rate
        this.update()
    }

    /**获取完成率 */
    getFinishRate(name: string = LevelManager.getInstance().levelName) {
        if (this.arrayIndex.indexOf(name) !== -1) {
            return this.storgeInfoArray[this.arrayIndex.indexOf(name)].finishRate
        }
        return 0
    }

    /**增加金币 */
    addCoin(num: number) {
        this.cion += num
        this.update()
    }

    /**增加钻石 */
    addDiamond(num: number) {
        this.diamon += num
        this.update()
    }

    /**设置已经领取成就的主题 */
    setRecievedTheme(name: string) {
        this.hadReceiveTheme.push(name)
        this.update()
    }

    /**设置已经播放通关UI动画 */
    setPalyFinishAnim(name: string) {
        this.hadPlayFinishAnim.push(name)
        this.update()
    }

    /**获取是否播放过通关UI动画 */
    getPalyFinishAnim(name: string) {
        if (this.hadPlayFinishAnim.indexOf(name) !== -1) {
            return true
        }
        else {
            return false
        }
    }

    /**设置最短通关时间 */
    setFinishTime(time: number, name: string = LevelManager.getInstance().levelName) {
        if (this.arrayIndex.indexOf(name) !== -1) {
            this.storgeInfoArray[this.arrayIndex.indexOf(name)].finishTime = time
        }
        this.update()
    }

    /**获取最短通关时间 */
    getFinishTime(name: string = LevelManager.getInstance().levelName) {
        if (this.arrayIndex.indexOf(name) !== -1) {
            return this.storgeInfoArray[this.arrayIndex.indexOf(name)].finishTime
        }
        return 99999
    }

    /**设置当前游戏时间 */
    setCurrentGameTime(time: number, name: string = LevelManager.getInstance().levelName) {
        if (this.arrayIndex.indexOf(name) !== -1) {
            this.storgeInfoArray[this.arrayIndex.indexOf(name)].currentGameTime = time
        }
        this.update()
    }

    /**获取当前游戏时间 */
    getCurrentGameTime(name: string = LevelManager.getInstance().levelName) {
        if (this.arrayIndex.indexOf(name) !== -1) {
            return this.storgeInfoArray[this.arrayIndex.indexOf(name)].currentGameTime
        }
        return 0
    }

    /**设置已经完成的主题 */
    setFinishedTheme(name: string) {
        if (this.finishTheme.indexOf(name) === -1) {
            this.finishTheme.push(name)
        }
        this.update()
    }

    /**获取已经完成的主题 */
    getFinishTheme(name: string) {
        if (this.finishTheme.indexOf(name) !== -1) {
            return true
        }
        else {
            return false
        }
    }

    /**设置已经解锁的主题 */
    setUnlockTheme(name: string) {
        if (this.unlockTheme.indexOf(name) === -1) {
            this.unlockTheme.push(name)
        }
        this.update()
    }

    /**获取已经解锁的主题 */
    getUnlockTheme(name: string) {
        if (this.unlockTheme.indexOf(name) !== -1) {
            return true
        }
        else {
            return false
        }
    }
}
