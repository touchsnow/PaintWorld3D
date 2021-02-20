import { _decorator, Node, Prefab, CCString, SpriteComponent, loader, LabelComponent, instantiate, LayoutComponent, ScrollViewComponent, Vec2, Vec3, tween } from 'cc';
import { MainSceneBasePage } from '../../FrameworkModelPuzzle/MainSceneBasePage';
import { ConfigManager } from '../Game/Manager/ConfigManager';
import StorgeManager from '../Game/Manager/StorgeManager';
import { LevelTap } from './LevelTap';
import { TapTouch } from './TapTouch';
const { ccclass, property } = _decorator;

@ccclass('ListPage')
export class ListPage extends MainSceneBasePage {

    @property({
        type: [Node],
        displayName: '主题列表',
    })
    themeList: Node[] = []

    @property({
        type: [Node],
        displayName: '关卡列表',
    })
    levelList: Node[] = []

    @property({
        type: Prefab,
        displayName: "关卡预制体"
    })
    levelPrefba: Prefab = null

    @property({
        type: CCString,
        displayName: "配置表"
    })
    mainConfig = ''

    @property({
        type: LayoutComponent,
        displayName: "列表Layout"
    })
    contentLayout: LayoutComponent = null

    @property({
        type: ScrollViewComponent,
        displayName: "ScrollView"
    })
    scrollView: ScrollViewComponent = null

    @property({
        type: Node,
        displayName: '引导手指',
    })
    guideFinger: Node = null;

    /**content的初始位置 */
    private originalContentPos: Vec3 = new Vec3()

    /**主题进度   key:主题名字  value:[完成的数量，总数量]*/
    private themeProgress: Map<string, Array<number>> = new Map<string, Array<number>>()

    start() {

        //以下部分需要重构一下

        //监听事件
        this.node.on("ScrollTo", this.scrollToPos, this)
        this.originalContentPos = this.contentLayout.node.getWorldPosition()
        let mainConfig = ConfigManager.getInstance().mianConfig

        let config = mainConfig.json["ThemeList"]
        for (let i = 0; i < config.length; i++) {
            //加载主题
            let theme = config[i]
            let themeConfig = mainConfig.json[theme]
            //获取主题下已经完成的关卡数量
            let finishedCount = 0
            for (let i = 0; i < themeConfig.levelList.length; i++) {
                let result = StorgeManager.getInstance().getFinishedFlag(themeConfig.levelList[i])
                if (result) finishedCount += 1
            }
            if (finishedCount === themeConfig.levelList.length) {
                StorgeManager.getInstance().setFinishedTheme(theme)
            }
            this.themeProgress.set(theme, [finishedCount, themeConfig.levelList.length])
            //设置主题显示
            this.themeList[i].getComponent(SpriteComponent).spriteFrame = loader.getRes("ThemeBg/" + themeConfig.bg + "/spriteFrame")
            this.themeList[i].getChildByName("Label").getComponent(LabelComponent).string = themeConfig.theme
            this.themeList[i].getChildByName("Label-001").getComponent(LabelComponent).string = themeConfig.label
            //主题完成了
            if (StorgeManager.getInstance().getFinishTheme(theme)) {
                this.themeList[i].getChildByName("Progress").active = false
            }
            else {
                //如果主题没有解锁解锁
                if (!StorgeManager.getInstance().getUnlockTheme(theme)) {
                    //判断上一个主题是否已经完成
                    if (StorgeManager.getInstance().getFinishTheme(config[i - 1])) {
                        StorgeManager.getInstance().setUnlockTheme(theme)
                        let progressStr = this.themeProgress.get(theme)[0].toString() + "/" + this.themeProgress.get(theme)[1].toString()
                        let labelNode = this.themeList[i].getChildByPath("Progress/Label")
                        labelNode.active = true
                        labelNode.getComponent(LabelComponent).string = progressStr
                    }
                    else {
                        let lockNode = this.themeList[i].getChildByPath("Progress/Lock")
                        lockNode.active = true
                    }
                }
                //已经解锁
                else {
                    let progressStr = this.themeProgress.get(theme)[0].toString() + "/" + this.themeProgress.get(theme)[1].toString()
                    let labelNode = this.themeList[i].getChildByPath("Progress/Label")
                    labelNode.active = true
                    labelNode.getComponent(LabelComponent).string = progressStr
                }
            }
            //游戏关卡列表
            let levelNameList = themeConfig.levelList
            for (let j = 0; j < levelNameList.length; j++) {
                let levelTap = instantiate(this.levelPrefba) as Node
                levelTap.name = levelNameList[j]
                levelTap.setParent(this.levelList[i])
                levelTap.getComponent(LevelTap).theme = theme
                let touchTap = this.themeList[i].getComponent(TapTouch)
                levelTap.getComponent(LevelTap).touchTap = touchTap
                touchTap.theme = theme
                if (i - 1 >= 0) {
                    levelTap.getComponent(LevelTap).lastTheme = config[i - 1]
                    touchTap.lastTheme = config[i - 1]
                }
            }
        }
        this.setEnAble()
        //恢复ScrollView的状态
        let pos = this.contentLayout.node.getWorldPosition()
        pos.y = StorgeManager.getInstance().contentPos
        if (pos.y !== 0) {
            this.contentLayout.node.setWorldPosition(pos)
        }
        let listState = StorgeManager.getInstance().listState
        if (listState.length > 0) {
            for (let i = 0; i < this.levelList.length; i++) {
                this.levelList[i].active = listState[i]
            }
        }
        else {
            for (let i = 0; i < this.levelList.length; i++) {
                if (i === 0) {
                    this.levelList[i].active = true

                }
                else {
                    this.levelList[i].active = false

                }
            }
        }
    }

    setDisAble() {
        this.node.active = false
        let hero = this.selfButton.getChildByName("Hero")
        this.selfButton.getChildByName("Label").getComponent(LabelComponent).color = cc.color(0, 0, 0)
        cc.tween(hero)
            .to(0.5, { scale: cc.v3(0, 0, 0) }, { easing: "circOut" })
            .start()
    }

    setEnAble() {
        this.contentLayout.spacingY = 100
        this.node.active = true
        let hero = this.selfButton.getChildByName("Hero")
        this.selfButton.getChildByName("Label").getComponent(LabelComponent).color = cc.color(255, 255, 255)
        cc.tween(this.contentLayout)
            .to(1, { spacingY: 10 }, { easing: "circOut" })
            .start()
        cc.tween(hero)
            .to(0.5, { scale: cc.v3(1, 1, 1) }, { easing: "circOut" })
            .start()
    }

    scrollToPos(posY: number, callback = null) {
        this.scheduleOnce(() => {
            let currentPos = this.contentLayout.node.getWorldPosition()

            let pos = this.originalContentPos.clone()
            pos.y = currentPos.y - posY + this.originalContentPos.y
            tween(this.contentLayout.node)
                .to(0.6, { worldPosition: pos }, { easing: "circOut" })
                .call(() => {
                    this.saveScrollViewState()
                    if (callback) callback()
                }).start()
        }, 0)
    }

    /**存储ScrollView状态 */
    saveScrollViewState() {
        StorgeManager.getInstance().contentPos = this.contentLayout.node.getWorldPosition().y
        let listState = []
        for (let i = 0; i < this.levelList.length; i++) {
            listState.push(this.levelList[i].active)
        }
        StorgeManager.getInstance().listState = listState
        StorgeManager.getInstance().update()
    }

    getLevelTap(levelName:string):LevelTap{
        
        let levelTap = null
        for(let i = 0;i<this.levelList.length;i++)
        {
            this.levelList[i].children.forEach(element => {
                if(element.name === levelName){
                    levelTap = element.getComponent(LevelTap)
                }
            })
        }
        return levelTap
       
    }



}
