import { _decorator, Node, Vec2, PhysicsSystem, PhysicsRayResult, loader, instantiate, director, Color, Vec3, Quat, find, Rect, tween } from 'cc';
import { LevelManager } from '../Manager/LevelManager';
import { GameUI } from '../../View/GameUI';
import { BasePuzzleGameScene } from '../../../FrameworkModelPuzzle/Scene/BasePuzzleGameScene';
import ASCAd from '../../../Framework3D/Src/AD/ASCAd';
import { IAnim } from '../../Utils/Anim/IAnim';
import { Constants } from '../../Data/Constants';
const { ccclass, property } = _decorator;

@ccclass('GameScene')
export class GameScene extends BasePuzzleGameScene {

    @property(Node)
    modelPoint: Node = null

    @property(GameUI)
    gameUI: GameUI = null

    private evnPoint: Node = null;
    private originalEuler: Vec3 = new Vec3()
    private originalRotateAxisPos: Vec3 = new Vec3()
    private originalCameraPos: Vec3 = new Vec3()
    private canAutoRotate: boolean = false
    private staticTime: number = 0
    private paintCallBack = null

    private gameManager = null

    private touchFlag = false

    start() {
        this.scheduleOnce(() => {
            this.touchFlag = true
        }, 1)
        //注册事件
        this.node.on("RecoverView", this.recoverView, this)
        this.node.on("FinishLevel", this.finishLevel, this)
        this.node.on("RegisterPaintCallBack", this.registerPaintCallBack, this)
        super.start()
        //初始化环境
        let levelConfig = LevelManager.getInstance().levelConfig
        director.getScene().globals.skybox.envmap = loader.getRes(levelConfig.skyBox)
        let groundAlbedo = new Color(levelConfig.groundAlbedo.x, levelConfig.groundAlbedo.y, levelConfig.groundAlbedo.z)
        director.getScene().globals.ambient.groundAlbedo = groundAlbedo
        let skyColor = new Color(levelConfig.skyColor.x, levelConfig.skyColor.y, levelConfig.skyColor.z)
        director.getScene().globals.ambient.skyColor = skyColor
        let evn = instantiate(loader.getRes(levelConfig.environment)) as Node
        evn.setParent(this.modelPoint)
        this.evnPoint = evn
        //实例关卡模型
        let modelNode = instantiate(loader.getRes(levelConfig.model)) as Node
        modelNode.setParent(this.modelPoint)
        //调整位置
        let camerasPos = this.rotateAxis.getWorldPosition()
        this.rotateAxis.setWorldPosition(camerasPos.x, modelNode.getWorldPosition().y, camerasPos.z)
        cc.tween(this.mainCamera.node)
            .to(1, { worldPosition: cc.v3(camerasPos.x, modelNode.getWorldPosition().y, -60) }, { easing: "circOut" })
            .call(() => {
                this.originalCameraPos = this.mainCamera.node.getWorldPosition()
            })
            .start()
        cc.tween(this.effectCamera.node)
            .to(1, { worldPosition: cc.v3(camerasPos.x, modelNode.getWorldPosition().y, -60) }, { easing: "circOut" })
            .start()
        //记录原始视野位置
        this.originalEuler = this.rotateAxis.eulerAngles.clone()
        this.originalRotateAxisPos = this.rotateAxis.getWorldPosition()
        //显示banner
        ASCAd.getInstance().hideBanner()
        ASCAd.getInstance().showBanner()
        //展示原生Icon
        ASCAd.getInstance().hideNativeIcon()
        if (ASCAd.getInstance().getNativeIconFlag()) {
            ASCAd.getInstance().showNativeIcon(128, 128, (cc.winSize.width - 128) / 2 - 5 * cc.winSize.width / 720, (cc.winSize.height - 128) / 2 - 200 * cc.winSize.height / 1280)
        }
        Constants.paintMode = Constants.PaintMode.Normal
        this.gameManager = find("GameManagers").getComponent("GameManager")
    }

    update(dt: number) {
        if (this.canAutoRotate) {
            this.staticTime += dt
            if (this.staticTime >= 3 && this.rotateAxis) {
                Quat.fromEuler(this.qt_1, 0, -this.rotateSpeed * 0.05, 0)
                this.rotateAxis.rotate(this.qt_1, Node.NodeSpace.WORLD)
            }
        }
    }

    onTouchMove(e) {
        if (!this.touchFlag) return
        if (Constants.paintMode === Constants.PaintMode.Move) return
        super.onTouchMove(e)
        this.staticTime = 0
    }

    onTouchEnd(e) {
        if (Constants.paintMode === Constants.PaintMode.Move) return
        super.onTouchEnd(e)
        if (this.touchState === this.TouchStates.NONE) {
            var pos: Vec2 = new Vec2()
            e.getLocation(pos)
            var UIpos: Vec2 = new Vec2()
            e.getUILocation(UIpos)
            if (Constants.paintMode === Constants.PaintMode.Normal) {
                this.normalPaint(pos.x, pos.y)
            }
            if (Constants.paintMode === Constants.PaintMode.Boom) {

                this.boomPaint(pos.x, pos.y, UIpos.x, UIpos.y)
            }
        }
        this.touchState = this.TouchStates.NONE
    }

    normalPaint(posX: number, posY: number) {
        this.mainCamera.screenPointToRay(posX, posY, this.ray)
        //一级判断：碰到刚体
        if (PhysicsSystem.instance.raycast(this.ray)) {
            const r = PhysicsSystem.instance.raycastResults;
            let NearestNode: PhysicsRayResult = null
            for (let i = 0; i < r.length; i++) {
                if (NearestNode === null) {
                    NearestNode = r[i]
                }
                else {
                    if (NearestNode.distance > r[i].distance) {
                        NearestNode = r[i]
                    }
                }
            }
            let paintNode = NearestNode.collider.node.parent
            this.gameManager.normalPaint(paintNode, NearestNode.hitPoint)
            if (this.paintCallBack) {
                this.paintCallBack()
                this.paintCallBack = null
            }
        }
        //二级判断：位置判断
        else {
            if (LevelManager.getInstance().gameMode === Constants.GameMode.Normal) {
                this.gameManager.paintByPos(posX, posY)
            }
        }
    }

    movePaint(posX: number, posY: number) {
        this.mainCamera.screenPointToRay(posX, posY, this.ray)
        //一级判断：碰到刚体
        if (PhysicsSystem.instance.raycast(this.ray)) {
            const r = PhysicsSystem.instance.raycastResults;
            let NearestNode: PhysicsRayResult = null
            for (let i = 0; i < r.length; i++) {
                if (NearestNode === null) {
                    NearestNode = r[i]
                }
                else {
                    if (NearestNode.distance > r[i].distance) {
                        NearestNode = r[i]
                    }
                }
            }
            let paintNode = NearestNode.collider.node.parent
            this.gameManager.movePaintByNode(paintNode)
        }
        //二级判断：位置判断
        else {
            this.gameManager.movePaintByPos(posX, posY)
        }
    }

    boomPaint(posX: number, posY: number, UIposX: number, UIposY: number,) {
        this.mainCamera.screenPointToRay(posX, posY, this.ray)
        //一级判断：碰到刚体
        if (PhysicsSystem.instance.raycast(this.ray)) {
            const r = PhysicsSystem.instance.raycastResults;
            let NearestNode: PhysicsRayResult = null
            for (let i = 0; i < r.length; i++) {
                if (NearestNode === null) {
                    NearestNode = r[i]
                }
                else {
                    if (NearestNode.distance > r[i].distance) {
                        NearestNode = r[i]
                    }
                }
            }
            this.gameManager.boomPaint(NearestNode.hitPoint, posX, posY, UIposX, UIposY)
        } else {
            let nodePoint = this.gameManager.modelManager.getAllTouchNodeByPos(posX, posY)
            console.info("使用Pos")
            if (nodePoint) {
                this.gameManager.boomPaint(nodePoint.getWorldPosition(), posX, posY, UIposX, UIposY)
            }
        }
    }

    recoverView() {
        cc.tween(this.rotateAxis)
            .to(1, { eulerAngles: this.originalEuler })
            .start()
        cc.tween(this.mainCamera.node)
            .to(1, { worldPosition: this.originalCameraPos })
            .start()
        cc.tween(this.rotateAxis)
            .to(1, { worldPosition: this.originalRotateAxisPos })
            .start()
        cc.tween(this.effectCamera.node)
            .to(1, { worldPosition: this.originalCameraPos })
            .start()
    }


    getCameraDis(): number {
        return Vec3.distance(this.mainCamera.node.getWorldPosition(), this.rotateAxis.getWorldPosition())
    }

    finishLevel(time: number, firstFinish: boolean = true) {
        if (firstFinish) {
            cc.tween(this.rotateAxis)
                .to(time, { eulerAngles: this.originalEuler })
                .start()
            cc.tween(this.mainCamera.node)
                .to(time, { worldPosition: this.originalCameraPos })
                .start()
            cc.tween(this.rotateAxis)
                .to(time, { worldPosition: this.originalRotateAxisPos })
                .start()
            cc.tween(this.effectCamera.node)
                .to(time, { worldPosition: this.originalCameraPos })
                .call(() => {
                    this.canAutoRotate = true
                    let levelConfig = LevelManager.getInstance().levelConfig
                    director.getScene().globals.skybox.envmap = loader.getRes(levelConfig.finishSkyBox);
                    //调整天空盒相机Fov
                    if (levelConfig.finishSkyBox.indexOf("MianYang") !== -1) {
                        this.skyBoxCamera.fov = 45
                        this.skyBoxCamera.rect = new Rect(0, 0, 1, 1)
                    }
                    this.evnPoint.children.forEach(element => {
                        element.active = true
                    });
                    let modelNode = find("ModelPoint").getChildByPath(LevelManager.getInstance().levelName + "/RootNode")
                    let evnPoint = find("ModelPoint").getChildByPath(LevelManager.getInstance().levelName + "Evn")
                    let animPoint = evnPoint.getChildByName("AnimPoint")
                    if (animPoint) {
                        animPoint.getComponent(IAnim).playAnim(modelNode, evnPoint)
                    }

                })
                .start()
        }
        else {
            this.canAutoRotate = true
            let levelConfig = LevelManager.getInstance().levelConfig
            director.getScene().globals.skybox.envmap = loader.getRes(levelConfig.finishSkyBox);
            if (levelConfig.finishSkyBox.indexOf("MianYang") !== -1) {
                this.skyBoxCamera.fov = 45
                this.skyBoxCamera.rect = new Rect(0, 0, 1, 1)
            }
            this.evnPoint.children.forEach(element => {
                element.active = true
            });
            let modelNode = find("ModelPoint").getChildByPath(LevelManager.getInstance().levelName + "/RootNode")
            let evnPoint = find("ModelPoint").getChildByPath(LevelManager.getInstance().levelName + "Evn")
            let animPoint = evnPoint.getChildByName("AnimPoint")
            if (animPoint) {
                animPoint.getComponent(IAnim).playAnim(modelNode, evnPoint)
            }
        }
    }

    registerPaintCallBack(callBack) {
        this.paintCallBack = callBack
    }

    cameraShake() {
        let pos = this.rotateAxis.getPosition()
        tween(this.rotateAxis)
            .to(0.05, { position: cc.v3(pos.x + 0.01, pos.y, pos.z) })
            .to(0.05, { position: cc.v3(pos.x - 0.01, pos.y, pos.z) })
            .to(0.05, { position: cc.v3(pos.x, pos.y + 0.01, pos.z) })
            .to(0.05, { position: cc.v3(pos.x, pos.y - 0.01, pos.z) })
            .to(0.02, { position: cc.v3(pos.x + 0.005, pos.y, pos.z) })
            .to(0.02, { position: cc.v3(pos.x - 0.005, pos.y, pos.z) })
            .to(0.02, { position: cc.v3(pos.x, pos.y + 0.005, pos.z) })
            .to(0.02, { position: cc.v3(pos.x, pos.y - 0.005, pos.z) })
            .to(0.03, { position: cc.v3(pos.x, pos.y, pos.z) })
            .start()
    }
}
