import { _decorator, Component, Node, Vec3, find, AnimationClip, AnimationComponent } from 'cc';
import { ScrollViewItemManager } from './ScrollViewItemManager';
import { ModelManager } from './ModelManager';
import { EffectManager } from './EffectManager';
import { LevelManager } from './LevelManager';
import { GameUI } from '../../View/GameUI';
import { PaintWorldModel } from '../../Data/PaintWorldModel';
import StorgeManager from './StorgeManager';
import { Constants } from '../../Data/Constants';
import { ScrollItem } from '../../View/ScrollItem';
const { ccclass, property } = _decorator;

@ccclass('GameManager')
export class GameManager extends Component {

    @property({
        type: ScrollViewItemManager,
        displayName: '触摸列表管理器',
        tooltip: '负责管理颜色触摸列表操作'
    })
    private scrollViewItemManager: ScrollViewItemManager = null

    @property({
        type: ModelManager,
        displayName: '模型管理器',
        tooltip: '负责管理模型操作'
    })
    private modelManager: ModelManager = null

    @property({
        type: EffectManager,
        displayName: '特效管理器',
        tooltip: '负责管理特效操作'
    })
    public effectManager: EffectManager = null

    @property({
        type: GameUI,
        displayName: '游戏界面的UI',
        tooltip: '负责UI操作'
    })
    private gameUI: GameUI = null

    private totalCount = 0

    private paintedCount = 0

    private currentGameTime: number = 0

    private gameScene = null

    start() {
        StorgeManager.getInstance().updateLevelData()
        this.currentGameTime = StorgeManager.getInstance().getCurrentGameTime()
        this.node.on("Paint", this.normalPaint, this)
        this.node.on("SwitchModel", this.switchModel, this)
        this.node.on("InistantBorad", this.inistantBorad, this)
        this.node.on("Promoty", this.promoty, this)
        this.node.on("StopPromoty", this.stopPromoty, this)
        this.node.on("RestoreArchive", this.restoreArchive, this)
        this.node.on("PaintByPos", this.paintByPos, this)
        this.totalCount = find("ModelPoint").getChildByPath(LevelManager.getInstance().levelName + "/RootNode").children.length
        this.gameScene = find("Canvas").getComponent("GameScene")
    }

    update(dt: number) {
        this.currentGameTime += dt
    }

    /**涂色一块模型 */
    normalPaint(paintNode: Node, hitPoint: Vec3) {
        if (Constants.paintMode === Constants.PaintMode.Normal) {
            this.effectManager.playPaintParticle(hitPoint, this.gameScene.getCameraDis())
        }
        this.paintSetting(paintNode)
    }

    /**切换模型 */
    switchModel(indexList: []) {
        this.modelManager.switchModel(indexList)
    }

    /**生成广告牌 */
    inistantBorad(index: number, boardNum: number, gary: number) {
        this.modelManager.inistantBorad(index, boardNum, gary)
    }

    /**涂色提示 */
    promoty() {
        //让第一个未涂色模型进行提示并返回模型的坐标
        let pos = this.modelManager.setPromoty()
        this.effectManager.playPromotyParticle(pos, this.gameScene.getCameraDis())
    }

    stopPromoty() {
        this.effectManager.stopPromotyEffect()
    }

    finishLevel() {

        if (LevelManager.getInstance().gameMode === Constants.GameMode.Normal) {
            this.gameUI.showFinishProgress()
            if (this.modelManager.modelRoot.parent.getComponent(AnimationComponent)) {
                this.modelManager.modelRoot.parent.getComponent(AnimationComponent).play()
            }
            let lastFinishTime = StorgeManager.getInstance().getFinishTime()
            let currentGameTime = StorgeManager.getInstance().getCurrentGameTime()
            if (lastFinishTime > currentGameTime) {
                StorgeManager.getInstance().setFinishTime(currentGameTime)
                this.gameUI.showNewRecordTime()
            }
        }
    }

    /**一键通关 */
    YiJianTongGunag() {
        for (let i = 0; i < this.totalCount; i++) {
            let model = this.modelManager.modelRoot.children[i].getComponent(PaintWorldModel)
            model.cancelSellect()
            model.recoverMat()
            StorgeManager.getInstance().savePaintedModel(model.storgeName)
        }
        this.finishLevel()
        find("Canvas/ScrollView").active = false
        find("ModelPoint/BoardPoint").active = false
        this.effectManager.stopPromotyEffect()
    }

    //恢复模型存档
    restoreArchive() {
        let modelLenght = this.modelManager.modelRoot.children.length
        let paintedArray = StorgeManager.getInstance().getPainedArray()
        for (let i = 0; i < modelLenght; i++) {
            //恢复模型
            let model = this.modelManager.modelRoot.children[i].getComponent(PaintWorldModel)
            let storgeName = model.storgeName
            if (paintedArray.indexOf(storgeName) !== -1) {
                this.paintedCount += 1
                model.paint()
                this.modelManager.setBoardState(model, false)
                this.scrollViewItemManager.restoreArchivePaint(model.modelAttr.garyValue.x)
                this.gameUI.setProgress(this.paintedCount / this.totalCount)
            }
            else {
                model.initMat()
            }
        }
        if (this.totalCount === this.paintedCount) {
            this.gameUI.setFinishStateUI()
            find("Canvas").emit("FinishLevel", 0.5, false)
            if (this.modelManager.modelRoot.parent.getComponent(AnimationComponent)) {
                this.modelManager.modelRoot.parent.getComponent(AnimationComponent).play()
            }
        }
    }

    paintByPos(posX, posY) {
        let nodePoint = this.modelManager.getTouchNodeByPos(posX, posY)
        if (nodePoint) {
            this.normalPaint(nodePoint, nodePoint.getWorldPosition())
        }
    }

    fullScreenPaint() {
        let sellectIndex = this.modelManager.sellectIndexList
        let delayTime = 0
        let lastmdoel = null
        for (let i = 0; i < sellectIndex.length; i++) {
            let paintModel = this.modelManager.modelRoot.children[sellectIndex[i]].getComponent(PaintWorldModel)
            if (!paintModel.isPainted) {
                lastmdoel = paintModel
            }
        }
        for (let i = 0; i < sellectIndex.length; i++) {
            let paintModel = this.modelManager.modelRoot.children[sellectIndex[i]].getComponent(PaintWorldModel)
            if (!paintModel.isPainted) {
                this.scheduleOnce(() => {
                    let pos = paintModel.getWorldPos()
                    var callBack = function () {
                        this.paintSetting(paintModel.node)
                        if (lastmdoel === paintModel) {
                            this.effectManager.playFullScreenParticle()
                            this.gameUI.showAnimLabel(cc.v3(360, 640, 0))
                            this.scrollViewItemManager.disabledEventBolck()
                            Constants.paintMode = Constants.PaintMode.Normal
                        }
                    }.bind(this)
                    let startPos = this.gameUI.fullScreenPaintButton.getWorldPosition()
                    let color = paintModel.modelAttr.albedoScale
                    this.effectManager.playFullScreenTrialParticle(startPos, pos, color, callBack)
                    this.gameUI.nodeShake(this.gameUI.fullScreenPaintButton)
                }, delayTime)
                delayTime += 0.15
            }
        }
    }

    movePaintByNode(node: Node) {
        this.paintSetting(node)
    }

    movePaintByPos(posX, posY) {

        let nodePoint = this.modelManager.getAllTouchNodeByPos(posX, posY)
        if (nodePoint) {
            this.paintSetting(nodePoint)
        }
    }

    boomPaint(hitPoint, posX, posY, uiPosX, uiPosY) {
        let nodePointList = []
        nodePointList = this.modelManager.getRangeNode(hitPoint)
        for (let i = 0; i < nodePointList.length; i++) {
            this.paintSetting(nodePointList[i])
            if (i >= 9) {
                break
            }
        }
        this.effectManager.playBoomParticle(uiPosX, uiPosY)
        this.gameScene.cameraShake()
        this.gameUI.releaseBoomEnegry()
        let pos = cc.v3(uiPosX, uiPosY, 0)
        this.gameUI.showAnimLabel(pos)
    }

    paintSetting(node: Node) {
        node.getComponent(PaintWorldModel).paint()
        this.modelManager.setBoardState(node.getComponent(PaintWorldModel), false)
        this.scrollViewItemManager.restoreArchivePaint(node.getComponent(PaintWorldModel).modelAttr.garyValue.x)
        this.paintedCount += 1
        this.gameUI.setProgress(this.paintedCount / this.totalCount)
        StorgeManager.getInstance().setFinishedRate(this.paintedCount / this.totalCount)
        StorgeManager.getInstance().setCurrentGameTime(this.currentGameTime)
        if (Constants.paintMode === Constants.PaintMode.Normal) {
            this.gameUI.addBoomEnegry()
        }
        if (Constants.paintMode === Constants.PaintMode.Move) {
            this.gameUI.addMovePaintCount()
        }
        if (this.paintedCount === this.totalCount) {
            this.finishLevel()
        }
    }

    setPaintMode(mode) {
        switch (mode) {
            case Constants.PaintMode.Move:
                Constants.paintMode = Constants.PaintMode.Move
                this.modelManager.setMoveMode()
                this.scrollViewItemManager.cancleSellect()
                this.scrollViewItemManager.enabledEventBlock()
                break
            case Constants.PaintMode.Normal:
                Constants.paintMode = Constants.PaintMode.Normal
                this.modelManager.setNormalMode()
                this.scrollViewItemManager.disabledEventBolck()
                this.gameUI.hideSkillTip()
                this.scheduleOnce(() => {
                    let contentList = this.scrollViewItemManager.content.children
                    if (contentList.length > 0) {
                        this.scrollViewItemManager.sellectOneItem(contentList[0].getComponent(ScrollItem))
                    }
                })
                break
            case Constants.PaintMode.Boom:
                Constants.paintMode = Constants.PaintMode.Boom
                this.modelManager.setBoomMode()
                this.scrollViewItemManager.enabledEventBlock()
                this.scheduleOnce(() => {
                    this.scrollViewItemManager.cancleSellect()
                })
                break
            case Constants.PaintMode.FullScreen:
                if (Constants.paintMode !== Constants.PaintMode.Normal) {
                    this.gameUI.hideSkillTip()
                    this.scheduleOnce(() => {
                        this.modelManager.setNormalMode()
                        let contentList = this.scrollViewItemManager.content.children
                        if (contentList.length > 0) {
                            this.scrollViewItemManager.sellectOneItem(contentList[0].getComponent(ScrollItem))
                        }
                        Constants.paintMode = Constants.PaintMode.FullScreen
                        this.scrollViewItemManager.enabledEventBlock()
                        this.fullScreenPaint()
                    }, 0)
                } else {
                    Constants.paintMode = Constants.PaintMode.FullScreen
                    this.scrollViewItemManager.enabledEventBlock()
                    this.fullScreenPaint()
                }
                break
            default:
                break
        }
    }
}
