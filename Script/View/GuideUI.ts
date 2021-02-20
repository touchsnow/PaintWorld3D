import { _decorator, Component, Node, Vec2, absMax, LabelComponent, ParticleSystemComponent, Vec3, math, find, tween, UIOpacityComponent } from 'cc';
import UIUtility from '../../Framework3D/Src/Base/UIUtility';
import { PaintWorldModel } from '../Data/PaintWorldModel';
import { LevelManager } from '../Game/Manager/LevelManager';
import { ModelManager } from '../Game/Manager/ModelManager';
import StorgeManager from '../Game/Manager/StorgeManager';
import { RookieGuide } from '../Game/RookieGuide';
import { GameScene } from '../Game/Sence/GameScene';
import { IAnim } from '../Utils/Anim/IAnim';
const { ccclass, property } = _decorator;

@ccclass('GuideUI')
export class GuideUI extends Component {

    @property(Node)
    progress1: Node = null

    @property(Node)
    progress2: Node = null

    @property(Node)
    progress3: Node = null

    @property(Node)
    progress4: Node = null

    @property(LabelComponent)
    guideLabel: LabelComponent = null

    @property(Node)
    moveGuide1: Node = null

    @property(Node)
    moveGuide2: Node = null

    @property(Node)
    finishEffect: Node = null

    @property(Node)
    startButton: Node = null

    @property(Node)
    skipButton: Node = null

    protected v2_1 = new Vec2()
    protected v2_2 = new Vec2()
    private touchDis: number = 0


    public singelMoveCallBack = null
    public doubleMoveCallBack = null
    public magnifyCallBack = null
    private touchFlag: boolean = false

    start() {

        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.startButton.on(Node.EventType.TOUCH_END, this.onStartButton, this)
        this.skipButton.on(Node.EventType.TOUCH_END, this.onSkipButton, this)
        this.scheduleOnce(() => {
            this.touchFlag = true
        }, 2)

    }

    onTouchMove(e) {
        if (!this.touchFlag) return
        if (e.getTouches().length === 1) {
            e.getDelta(this.v2_1)
            if (Math.abs(this.v2_1.x) > 3 || Math.abs(this.v2_1.y) > 3) {
                console.info(this.singelMoveCallBack)
                if (this.singelMoveCallBack) {
                    this.singelMoveCallBack()
                    this.singelMoveCallBack = null
                }
            }
        }
        if (e.getTouches().length === 2) {
            let touch1 = e.getTouches()[0]
            let touch2 = e.getTouches()[1]
            let pos1 = touch1.getLocation()
            let pos2 = touch2.getLocation()
            let newTouchDis = Vec2.distance(pos1, pos2)

            if (this.touchDis !== 0) {
                if (this.magnifyCallBack) {
                    this.magnifyCallBack()
                    this.magnifyCallBack = null
                }
            }
            this.touchDis = newTouchDis
            let v2_1 = new Vec2()
            let v2_2 = new Vec2()
            touch1.getDelta(v2_1)
            touch2.getDelta(v2_2)
            if (v2_1.x > 3 && v2_2.x > 3) {
                if (this.doubleMoveCallBack) {
                    this.doubleMoveCallBack()
                    this.doubleMoveCallBack = null
                }
            }
            if (v2_1.x < -3 && v2_2.x < -3) {
                if (this.doubleMoveCallBack) {
                    this.doubleMoveCallBack()
                    this.doubleMoveCallBack = null
                }
            }
            if (v2_1.y > 3 && v2_2.y > 3) {
                if (this.doubleMoveCallBack) {
                    this.doubleMoveCallBack()
                    this.doubleMoveCallBack = null
                }
            }
            if (v2_1.y < -3 && v2_2.y < -3) {
                if (this.doubleMoveCallBack) {
                    this.doubleMoveCallBack()
                    this.doubleMoveCallBack = null
                }
            }
        }
    }

    onStartButton() {
        StorgeManager.getInstance().setFinished()
        StorgeManager.getInstance().setFinishTime(20, LevelManager.getInstance().levelName)
        let evnPoint = find("ModelPoint/XinShouMenEvn")
        for (let i = 0; i < evnPoint.children.length; i++) {
            evnPoint.children[i].active = true
        }
        let modelRoot = find("ModelPoint/XinShouMen/RootNode")
        evnPoint.getChildByName("AnimPoint").getComponent(IAnim).playAnim(modelRoot, evnPoint)
        this.startButton.active = false
        this.skipButton.active = false
        find("Canvas").emit("RecoverView")
        let mainCamera = find("Canvas").getComponent(GameScene).mainCamera.node
        tween(mainCamera)
            .delay(1)
            .to(1.2, { position: cc.v3(0, 0, 0) })
            .call(() => {
                UIUtility.getInstance().loadScene("MainScene")
            })
            .start()
        let fadeNode = find("Canvas/SwitchTransition")
        fadeNode.getComponent(UIOpacityComponent).opacity = 0
        fadeNode.active = true
        tween(fadeNode.getComponent(UIOpacityComponent))
            .delay(1)
            .to(1, { opacity: 255 })
            .start()
    }

    onSkipButton() {
        this.touchFlag = false
        this.singelMoveCallBack = null
        this.doubleMoveCallBack = null
        this.magnifyCallBack = null
        //this.skipFlag = true
        //find("GameManagers/RookieGuide").getComponent(RookieGuide).destroy()
        find("GameManagers/RookieGuide")._destroyImmediate()

        this.startButton.active = false
        this.skipButton.active = false
        this.progress1.active = false
        this.progress2.active = false
        this.progress3.active = false
        this.progress4.active = false
        this.moveGuide1.active = false
        this.moveGuide2.active = false
        this.guideLabel.node.active = false
        let modelManager = find("GameManagers/ModelManager").getComponent(ModelManager)
        modelManager.boardRoot.active = false
        for (let i = 0; i < modelManager.modelRoot.children.length; i++) {
            let paintWorldModel = modelManager.modelRoot.children[i].getComponent(PaintWorldModel)
            if (paintWorldModel) {
                console.info("执行了Paint")
                paintWorldModel.paint()
            }
        }
        find("Canvas").emit("RecoverView")

        this.scheduleOnce(() => {
            StorgeManager.getInstance().setFinished()
            StorgeManager.getInstance().setFinishTime(20, LevelManager.getInstance().levelName)
            let evnPoint = find("ModelPoint/XinShouMenEvn")
            for (let i = 0; i < evnPoint.children.length; i++) {
                evnPoint.children[i].active = true
            }
            let modelRoot = find("ModelPoint/XinShouMen/RootNode")
            evnPoint.getChildByName("AnimPoint").getComponent(IAnim).playAnim(modelRoot, evnPoint)

            find("Canvas").emit("RecoverView")
            let mainCamera = find("Canvas").getComponent(GameScene).mainCamera.node
            tween(mainCamera)
                .delay(1)
                .to(1.2, { position: cc.v3(0, 0, 0) })
                .call(() => {
                    UIUtility.getInstance().loadScene("MainScene")
                })
                .start()
            let fadeNode = find("Canvas/SwitchTransition")
            fadeNode.getComponent(UIOpacityComponent).opacity = 0
            fadeNode.active = true
            tween(fadeNode.getComponent(UIOpacityComponent))
                .delay(1)
                .to(1, { opacity: 255 })
                .start()
        }, 1)

    }
}
