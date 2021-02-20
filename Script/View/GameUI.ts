import { _decorator, Component, Node, find, SpriteComponent, LabelComponent, UIOpacityComponent, AudioClip, Tween, Vec2, Touch, tween, v3, Vec3 } from 'cc';
import ASCAd from '../../Framework3D/Src/AD/ASCAd';
import AudioManager from '../../Framework3D/Src/Base/AudioManager';
import DialogManager from '../../Framework3D/Src/Base/DialogManager';
import UIUtility from '../../Framework3D/Src/Base/UIUtility';
import { Constants } from '../Data/Constants';
import { EffectManager } from '../Game/Manager/EffectManager';
import { LevelManager } from '../Game/Manager/LevelManager';
import StorgeManager from '../Game/Manager/StorgeManager';
import { NodeBreathe } from '../Utils/NodeBreathe';
import { NodeRotate } from '../Utils/NodeRotate';
const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {

    @property(Node)
    paintingUI: Node = null

    @property(Node)
    paintedUI: Node = null

    @property(Node)
    movePaintButton: Node = null

    @property(Node)
    fullScreenPaintButton: Node = null

    @property(Node)
    boomPaintButton: Node = null

    @property(Node)
    promotyButton: Node = null

    @property(Node)
    movePariticle: Node = null

    @property(SpriteComponent)
    boomFill: SpriteComponent = null

    @property(SpriteComponent)
    moveFill: SpriteComponent = null

    @property(Node)
    boomFire: Node = null

    @property(Node)
    skillTip: Node = null

    @property(Node)
    animLabel: Node = null

    private backToMainButton: Node = null

    private paintingReplayButton: Node = null

    private recoverViewButton: Node = null

    private backToMainPaintedButton: Node = null

    private replayButton: Node = null

    private recoverViewPaintedButton: Node = null

    private numberButton: Node = null

    private progressBar: SpriteComponent = null

    private myManager: Node = null

    private InofLabel: LabelComponent = null

    private switichTransiton: UIOpacityComponent = null

    private continueButton: Node = null

    private newFinishTimeUI: Node = null

    private finishTimeLabel: Node = null

    private tweenList: Array<Tween> = []

    private boomEnergy: number = 5

    private currentEngrgy: number = 0

    private movePaintCount: number = 10

    private currentMovePaintCount: number = 0

    private movePaintHadPaintOne:boolean = false

    start() {
        this.myManager = find("GameManagers")
        //按钮
        this.backToMainButton = this.paintingUI.getChildByName("BackToMainButton")
        this.recoverViewButton = this.paintingUI.getChildByName("RecoverViewButton")
        this.paintingReplayButton = this.paintingUI.getChildByName("ReplayButton")
        this.backToMainPaintedButton = this.paintedUI.getChildByName("BackToMainButton")
        this.replayButton = this.paintedUI.getChildByName("ReplayButton")
        this.recoverViewPaintedButton = this.paintedUI.getChildByName("RecoverViewButton")
        this.continueButton = this.paintedUI.getChildByPath("InfoBG/ContinueButton")
        this.numberButton = this.paintingUI.getChildByName("NumberButton")
        //按钮事件
        this.backToMainButton.on(Node.EventType.TOUCH_END, this.onBackToMainButton, this)
        this.recoverViewButton.on(Node.EventType.TOUCH_END, this.onRecoverViewButton, this)
        this.promotyButton.on(Node.EventType.TOUCH_END, this.onPromotyButton, this)
        this.paintingReplayButton.on(Node.EventType.TOUCH_END, this.onReplayButton, this)
        this.backToMainPaintedButton.on(Node.EventType.TOUCH_END, this.onBackToMainButton, this)
        this.replayButton.on(Node.EventType.TOUCH_END, this.onReplayButton, this)
        this.recoverViewPaintedButton.on(Node.EventType.TOUCH_END, this.onRecoverViewButton, this)
        this.continueButton.on(Node.EventType.TOUCH_END, this.onContinueButton, this)
        this.numberButton.on(Node.EventType.TOUCH_END, this.onNumberButton, this)
        this.movePaintButton.on(Node.EventType.TOUCH_END, this.onMovePaintButton, this)
        this.boomPaintButton.on(Node.EventType.TOUCH_END, this.onBoomPaintButton, this)
        this.fullScreenPaintButton.on(Node.EventType.TOUCH_END, this.onFullScreenPaintButton, this)


        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)

        //初始化技能按钮
        let gameStroge = StorgeManager.getInstance()
        let movePaintCount = gameStroge.movePaintCount
        let fullScreenPaintCount = gameStroge.fullScreenPaintCount
        let promotyCount = gameStroge.promotyCount
        if (movePaintCount > 0) {
            this.movePaintButton.getChildByName("Label").getComponent(LabelComponent).string = movePaintCount.toString()
            this.movePaintButton.getChildByName("Ad").active = false
        } else {
            this.movePaintButton.getChildByName("Label").active = false
        }
        if (fullScreenPaintCount > 0) {
            this.fullScreenPaintButton.getChildByName("Label").getComponent(LabelComponent).string = fullScreenPaintCount.toString()
            this.fullScreenPaintButton.getChildByName("Ad").active = false
        } else {
            this.fullScreenPaintButton.getChildByName("Label").active = false
        }
        if (promotyCount > 0) {
            this.promotyButton.getChildByName("Label").getComponent(LabelComponent).string = promotyCount.toString()
            this.promotyButton.getChildByName("Ad").active = false
        } else {
            this.promotyButton.getChildByName("Label").active = false
        }
        //进度条
        this.progressBar = this.paintingUI.getChildByPath("ProgressBar/Bar").getComponent(SpriteComponent)
        //信息
        this.InofLabel = this.paintedUI.getChildByPath("InfoBG/Info").getComponent(LabelComponent)
        let info = LevelManager.getInstance().levelConfig.levelShowInfo
        this.InofLabel.string = info
        //时间纪录
        this.newFinishTimeUI = this.paintedUI.getChildByName("NewRecord")
        this.finishTimeLabel = this.paintedUI.getChildByName("FinishTime")
        //切换过渡
        this.switichTransiton = this.node.getChildByName("SwitchTransition").getComponent(UIOpacityComponent)
        this.fadeOut()
    }

    onTouchStart(e: Touch) {
        if (Constants.paintMode !== Constants.PaintMode.Move) return
        var pos: Vec2 = new Vec2()
        e.getLocation(pos)
        this.movePariticle.setWorldPosition(pos.x, pos.y, 0)
        this.movePariticle.active = true
    }

    onTouchMove(e: Touch) {
        if (Constants.paintMode !== Constants.PaintMode.Move) return
        var pos: Vec2 = new Vec2()
        var UIpos: Vec2 = new Vec2()
        var delta: Vec2 = new Vec2()
        e.getUILocation(UIpos)
        e.getLocation(pos)
        e.getDelta(delta)
        if (this.currentMovePaintCount !== -1) {
            this.movePariticle.setWorldPosition(UIpos.x, UIpos.y, 0)
            this.node.getComponent("GameScene").movePaint(pos.x, pos.y)
        }
    }

    onTouchEnd(e) {
        this.movePariticle.active = false
        if (Constants.paintMode !== Constants.PaintMode.Move) return
        if(this.movePaintHadPaintOne){
            this.releasemovePaintStep()
        }
    }

    onBackToMainButton() {
        var callback = function () {
            UIUtility.getInstance().loadScene("MainScene")
        }.bind(this)

        let data = {
            tipLabel: "游戏进度已保存，是否要返回主题界面？",
            callback: callback
        }
        DialogManager.getInstance().showDlg("TipDialog", data)
    }

    onRecoverViewButton() {
        find("Canvas").emit("RecoverView")
    }

    onPromotyButton() {
        if (Constants.paintMode !== Constants.PaintMode.Normal) {
            this.disabelCurrentMode()
            this.myManager.getComponent("GameManager").setPaintMode(Constants.PaintMode.Normal)
        }
        let gameData = StorgeManager.getInstance()
        if (gameData.promotyCount >= 1) {
            gameData.promotyCount -= 1
            gameData.update()
            this.myManager.emit("Promoty")
            this.promotyButton.getChildByName("Label").getComponent(LabelComponent).string = gameData.promotyCount.toString()
            if (gameData.promotyCount === 0) {
                this.promotyButton.getChildByName("Label").active = false
                this.promotyButton.getChildByName("Ad").active = true
            }
        } else {
            var callback = function (isEnd) {
                if (isEnd) {
                    this.myManager.emit("Promoty")
                }
                else {
                    UIUtility.getInstance().showTopTips("视频未播放完成！")
                }
                AudioManager.getInstance().resumeMusic()
            }.bind(this)
            if (ASCAd.getInstance().getVideoFlag()) {
                ASCAd.getInstance().showVideo(callback)
                AudioManager.getInstance().pauseMusic()
            }
            else {
                UIUtility.getInstance().showTopTips("视频未加载完成！")
            }
        }
    }

    onReplayButton() {
        var callback = function () {
            StorgeManager.getInstance().resetPaintArray()
            StorgeManager.getInstance().setFinishedRate(0, LevelManager.getInstance().levelName)
            UIUtility.getInstance().loadScene("GameScene")
        }.bind(this)

        let data = {
            tipLabel: "重玩会丢失当前进度，确定要重头开始吗？",
            callback: callback
        }
        DialogManager.getInstance().showDlg("TipDialog", data)
    }

    onContinueButton() {
        if (StorgeManager.getInstance().getFinishedFlag(LevelManager.getInstance().levelName)) {
            UIUtility.getInstance().loadScene("MainScene")
        }
        else {
            ASCAd.getInstance().getIntersFlag() && ASCAd.getInstance().showInters();
            this.paintedUI.active = false
            DialogManager.getInstance().showDlg("SettlePageDialog")
        }
    }

    setProgress(rate: number) {
        if (this.progressBar) {
            this.progressBar.fillRange = rate
        }
    }

    fadeOut(callBack = null) {
        this.switichTransiton.node.active = true
        this.switichTransiton.opacity = 255
        let t = cc.tween(this.switichTransiton)
            .to(3, { opacity: 0 }, { easing: "circOut" })
            .call(() => {
                this.switichTransiton.node.active = false
                this.switichTransiton.opacity = 255
                if (callBack) callBack()
            })
            .start()
        this.tweenList.push(t)
    }

    showFinishProgress() {
        this.switichTransiton.opacity = 0
        this.switichTransiton.node.active = true
        let t = cc.tween(this.switichTransiton)
            .to(1, { opacity: 255 }, { easing: "circOut" })
            .call(() => {
                find("Canvas").emit("FinishLevel", 0.5)
            })
            .to(0.5, { opacity: 255 }, { easing: "circOut" })
            .call(() => {
                this.paintingUI.active = false
                this.paintedUI.active = true
                let finishTime = StorgeManager.getInstance().getFinishTime()
                let min = Math.floor(finishTime / 60)
                let second = Math.floor(finishTime - min * 60)
                this.finishTimeLabel.getComponent(LabelComponent).string = "最佳时间:" + min.toString() + "分" + second.toString() + "秒"
                var calback = function () {
                    find("GameManagers/EffectManager").getComponent(EffectManager).playFinishEffect()
                }
                this.fadeOut(calback)
            })
            .start()
        this.tweenList.push(t)
    }

    setFinishStateUI() {
        this.paintedUI.active = true
        this.paintingUI.active = false
        let finishTime = StorgeManager.getInstance().getFinishTime()
        let min = Math.floor(finishTime / 60)
        let second = Math.floor(finishTime - min * 60)
        this.finishTimeLabel.getComponent(LabelComponent).string = "最佳时间:" + min.toString() + "分" + second.toString() + "秒"
    }

    showNewRecordTime() {
        this.scheduleOnce(() => {
            let recordTime = Math.floor(StorgeManager.getInstance().getFinishTime())
            let min = Math.floor(recordTime / 60)
            let second = Math.floor(recordTime - min * 60)
            this.newFinishTimeUI.getChildByName("RecordTime").getComponent(LabelComponent).string = min.toString() + "分" + second.toString() + "秒"
            let t = cc.tween(this.newFinishTimeUI.getComponent(UIOpacityComponent))
                .to(1, { opacity: 255 }, { easing: "circOut" })
                .delay(2)
                .to(1, { opacity: 0 }, { easing: "circIn" })
                .start()
            this.tweenList.push(t)
        }, 2)
    }

    nodeShake(node: Node) {
        let scale = node.getWorldScale()
        tween(node)
            .to(0.05, { worldScale: scale.clone().multiplyScalar(1.2) }, { easing: "circInOut" })
            .to(0.05, { worldScale: scale.clone().multiplyScalar(1) }, { easing: "circInOut" })
            .start()
    }

    onNumberButton() {
        let numPoint = find("ModelPoint/BoardPoint")
        numPoint.active = !numPoint.active
    }

    onMovePaintButton() {
        if (Constants.paintMode === Constants.PaintMode.FullScreen) return
        let gameData = StorgeManager.getInstance()
        if (gameData.movePaintCount >= 1) {
            gameData.movePaintCount -= 1
            gameData.update()
            this.movePaintButton.getChildByName("Label").getComponent(LabelComponent).string = gameData.movePaintCount.toString()
            this.startMovePaint()
            if (gameData.movePaintCount === 0) {
                this.movePaintButton.getChildByName("Label").active = false
                this.movePaintButton.getChildByName("Ad").active = true
            }
        } else {
            var callback = function (isEnd) {
                if (isEnd) {
                    this.startMovePaint()
                }
                else {
                    UIUtility.getInstance().showTopTips("视频未播放完成！")
                }
                AudioManager.getInstance().resumeMusic()
            }.bind(this)
            if (ASCAd.getInstance().getVideoFlag()) {
                ASCAd.getInstance().showVideo(callback)
                AudioManager.getInstance().pauseMusic()
            }
            else {
                UIUtility.getInstance().showTopTips("视频未加载完成！")
            }
        }
    }

    onBoomPaintButton() {
        if (Constants.paintMode === Constants.PaintMode.FullScreen) return
        if (this.boomFire.active) {
            this.disabelCurrentMode()
            this.showSkillTip("爆炸填涂：点击一个区域进行爆炸填涂")
            this.myManager.getComponent("GameManager").setPaintMode(Constants.PaintMode.Boom)
        } else {
            UIUtility.getInstance().showTopTips("能量不足")
        }
    }

    onFullScreenPaintButton() {
        if (Constants.paintMode === Constants.PaintMode.FullScreen) return
        let gameData = StorgeManager.getInstance()
        if (gameData.fullScreenPaintCount >= 1) {
            gameData.fullScreenPaintCount -= 1
            gameData.update()
            this.fullScreenPaintButton.getChildByName("Label").getComponent(LabelComponent).string = gameData.fullScreenPaintCount.toString()
            this.disabelCurrentMode()
            this.myManager.getComponent("GameManager").setPaintMode(Constants.PaintMode.FullScreen)
            if (gameData.fullScreenPaintCount === 0) {
                this.fullScreenPaintButton.getChildByName("Label").active = false
                this.fullScreenPaintButton.getChildByName("Ad").active = true
            }
        } else {
            var callback = function (isEnd) {
                if (isEnd) {
                    this.disabelCurrentMode()
                    this.myManager.getComponent("GameManager").setPaintMode(Constants.PaintMode.FullScreen)
                }
                else {
                    UIUtility.getInstance().showTopTips("视频未播放完成！")
                }
                AudioManager.getInstance().resumeMusic()
            }.bind(this)
            if (ASCAd.getInstance().getVideoFlag()) {
                ASCAd.getInstance().showVideo(callback)
                AudioManager.getInstance().pauseMusic()
            }
            else {
                UIUtility.getInstance().showTopTips("视频未加载完成！")
            }
        }
    }

    addBoomEnegry() {
        this.currentEngrgy += 1
        if (this.currentEngrgy >= this.boomEnergy) {
            this.currentEngrgy = this.boomEnergy
            this.boomFire.active = true
            this.boomPaintButton.getChildByName("BoomRealy").active = true
            this.boomPaintButton.getComponent(NodeBreathe).enabled = true
            this.boomPaintButton.getComponent(NodeRotate).enabled = true
            this.boomPaintButton.getComponent(NodeBreathe).tweenStart()
            this.boomPaintButton.getComponent(NodeRotate).tweenStart()
        }
        this.boomFill.fillRange = this.currentEngrgy / this.boomEnergy * 0.95
    }

    releaseBoomEnegry() {
        this.boomPaintButton.getChildByName("fire").active = false
        this.boomPaintButton.getComponent(NodeBreathe).tweenStop()
        this.boomPaintButton.getComponent(NodeRotate).tweenStop()
        this.boomFire.active = false
        this.boomPaintButton.getChildByName("BoomRealy").active = false
        this.boomFill.fillRange = 0
        this.currentEngrgy = 0
        this.myManager.getComponent("GameManager").setPaintMode(Constants.PaintMode.Normal)
    }

    startMovePaint() {
        this.moveFill.fillRange = 0.95
        this.currentMovePaintCount = 0
        let nodeRotate = this.movePaintButton.getComponent(NodeRotate)
        nodeRotate.enabled = true
        nodeRotate.tweenStart()
        this.showSkillTip("滑动填涂：滑动进行快速填涂")
        this.movePaintHadPaintOne = false
        this.disabelCurrentMode()
        this.myManager.getComponent("GameManager").setPaintMode(Constants.PaintMode.Move)
    }

    addMovePaintCount() {
        this.currentMovePaintCount += 1
        this.movePaintHadPaintOne = true
        this.moveFill.fillRange = (this.movePaintCount - this.currentMovePaintCount) / this.movePaintCount * 0.95
        if (this.currentMovePaintCount >= this.movePaintCount) {
            this.releasemovePaintStep()
        }
    }

    releasemovePaintStep() {
        let effectManager = this.myManager.getComponent("GameManager").effectManager
        this.movePariticle.active = false
        effectManager.playFullScreenParticle()
        this.disabelCurrentMode()
        this.showAnimLabel(cc.v3(360, 640, 0))
        this.currentMovePaintCount = -1
        let nodeRotate = this.movePaintButton.getComponent(NodeRotate)
        nodeRotate.tweenStop()
        this.myManager.getComponent("GameManager").setPaintMode(Constants.PaintMode.Normal)
    }

    showSkillTip(string: string) {
        this.skillTip.setScale(0, 0, 0)
        this.skillTip.getChildByName("Label").getComponent(LabelComponent).string = string
        this.skillTip.active = true
        tween(this.skillTip)
            .to(0.3, { scale: cc.v3(1.2, 1.2, 1.2) })
            .to(0.05, { scale: cc.v3(1, 1, 1) })
            .start()
        this.myManager.getComponent("GameManager").scrollViewItemManager.hideItems()
    }

    hideSkillTip() {
        tween(this.skillTip)
            .to(0.05, { scale: cc.v3(1.2, 1.2, 1.2) })
            .to(0.3, { scale: cc.v3(0, 0, 0) })
            .call(() => {
                this.skillTip.active = false
            })
            .start()
        this.myManager.getComponent("GameManager").scrollViewItemManager.showItems()
    }

    disabelCurrentMode() {
        let mode = Constants.paintMode
        switch (mode) {
            case Constants.PaintMode.Move:
                let nodeRotate = this.movePaintButton.getComponent(NodeRotate)
                nodeRotate.tweenStop()
                this.moveFill.fillRange = 0
                break;
            case Constants.PaintMode.FullScreen:
                break;
            case Constants.PaintMode.Normal:
                break;
            case Constants.PaintMode.Boom:
                break;

            default:
                break;
        }
    }

    showAnimLabel(pos: Vec3) {
        this.animLabel.setScale(0, 0, 0)
        this.animLabel.setWorldPosition(pos)
        this.animLabel.active = true
        tween(this.animLabel)
            .to(0.3, { scale: v3(1.3, 1.3, 1.3) })
            .to(0.05, { scale: v3(1, 1, 1) })
            .to(0.05, { scale: v3(1.1, 1.1, 1.1) })
            .to(0.05, { scale: v3(1, 1, 1) })
            .delay(0.5)
            .to(0.05, { scale: v3(1.1, 1.1, 1.1) })
            .to(0.3, { scale: v3(0, 0, 0) })
            .start()
    }

    onDestroy() {
        this.tweenList.forEach(element => {
            element.stop()
        })
    }
}
