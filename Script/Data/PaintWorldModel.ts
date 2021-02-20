import { _decorator, Component, Node, Vec3, ModelComponent, ColliderComponent, loader, Color, find, MeshColliderComponent, BaseNode, Vec2, BatchingUtility, BoxColliderComponent } from 'cc';
import { ModelAttribute } from './ModelAttribute';
import { ModelManager } from '../Game/Manager/ModelManager';
import { LevelManager } from '../Game/Manager/LevelManager';
import StorgeManager from '../Game/Manager/StorgeManager';
import { ColorMatOperate } from './ColorMatOperate';
import { TexMatOperate } from './TexMatOperate';
import { BaseMatOperate } from './BaseMatOperate';
import { GameScene } from '../Game/Sence/GameScene';
const { ccclass, property } = _decorator;

@ccclass('PaintWorldModel')
export class PaintWorldModel extends Component {

    /**管理器 */
    private myManager: ModelManager = null
    /**模型基本属性 */
    public modelAttr: ModelAttribute = new ModelAttribute()
    /**模型是否被填色 */
    public isPainted: boolean = false
    /**选择材质移动方向X */
    private paintMatMoveX: number = 0
    /**选择材质移动方向Y */
    private paintMatMoveY: number = 0
    /**初始色相 */
    private Hue: number = 0
    //是否在提示状态
    private isPromoty: boolean = false
    //存储在存档的名字
    public storgeName: string = null

    onLoad() {
        this.node.on('CancelSellect', this.cancelSellect, this)
        this.node.on('Sellect', this.sellect, this)
        this.node.on('Paint', this.paint, this)
    }

    start() {
        this.storgeName = this.node.name + this.node.children[0].name
        let managerNode = find("GameManagers/ModelManager")
        if (managerNode) {
            this.myManager = managerNode.getComponent(ModelManager)
        }
        let firstModel = this.node.children[0]
        this.modelAttr.albedoScale = firstModel.getComponent(ModelComponent).material.getProperty("albedoScale", 0) as Vec3
        let gary = ((this.modelAttr.albedoScale.x + this.modelAttr.albedoScale.y + this.modelAttr.albedoScale.z) / 3).toFixed(6)
        this.modelAttr.garyValue = cc.v3(gary, gary, gary)
        this.modelAttr.boardScale = this.node.getScale()
        //随机材质的移动和色相
        this.paintMatMoveX = Math.ceil((Math.random() * 2) - 1) > 0 ? 1 : -1
        this.paintMatMoveY = Math.ceil((Math.random() * 2) - 1) > 0 ? 1 : -1
        this.Hue = (Math.random() * 360)
        this.node.children.forEach(element => {
            if (Number(gary) > 0.99) {
                element.addComponent(TexMatOperate)
            }
            else {
                element.addComponent(ColorMatOperate)

            }
            if (element.getComponent(ColliderComponent)) {
                element.getComponent(ColliderComponent).enabled = false
            }
            if(element.getComponent(BoxColliderComponent)){
                element.removeComponent(BoxColliderComponent)
            }
        })
    }

    initMat() {
        this.node.children.forEach(element => {
            element.getComponent(BaseMatOperate).initMat(this.modelAttr.garyValue)
        })
    }

    recoverMat() {
        let matName = ""
        if (this.node.name.indexOf("Special") !== -1) {
            matName = "Mat/" + this.node.name.slice(this.node.name.indexOf(":") + 1)
        }
        else {
            matName = LevelManager.getInstance().levelConfig.paintedMat
        }
        this.node.children.forEach(element => {
            element.getComponent(BaseMatOperate).recoverMat(matName)
        })
    }

    paintingMat() {
        this.node.children.forEach(element => {
            element.getComponent(BaseMatOperate).paintingMat(this.paintMatMoveX, this.paintMatMoveY, this.Hue)
        })
    }

    setBoomMode() {
        if (!this.isPainted) {
            this.node.children.forEach(element => {
                element.getComponent(BaseMatOperate).paintingMat(this.paintMatMoveX, this.paintMatMoveY, this.Hue)
            })
        }
        for (let i = 0; i < this.node.children.length; i++) {
            let node = this.node.children[i]
            let size = Vec3.distance(node.getComponent(ModelComponent).mesh.maxPosition, node.getComponent(ModelComponent).mesh.minPosition) * Math.abs(node.getScale().x) * Math.abs(node.parent.getScale().x)
            if (size >= 0.06) {
                let collider = node.getComponent(ColliderComponent)
                if (collider) {
                    collider.enabled = true
                }
                else {
                    node.addComponent(MeshColliderComponent).mesh = node.getComponent(ModelComponent).mesh
                }
            }
        }
    }

    cancelSellect() {
        if (!this.isPainted) {
            // this.myManager.setBoardState(this, true)
            // this.node.children.forEach(element => {
            //     let colliderComt = element.getComponent(ColliderComponent)
            //     if (colliderComt) {
            //         colliderComt.enabled = false
            //     }
            // })
            this.initMat()
            if (this.isPromoty) this.stopPromoty()
        }
        this.node.children.forEach(element => {
            let colliderComt = element.getComponent(ColliderComponent)
            if (colliderComt) {
                colliderComt.enabled = false
            }
        })
    }

    sellect() {
        if (!this.isPainted) {
            this.myManager.setBoardState(this, false)
            this.node.children.forEach(element => {
                let colliderComt = element.getComponent(ColliderComponent)
                if (colliderComt) {
                    colliderComt.enabled = true
                }
                else {
                    element.addComponent(MeshColliderComponent).mesh = element.getComponent(ModelComponent).mesh
                }
            })
            this.paintingMat()
        }
    }

    paint() {
        if (!this.isPainted) {
            this.isPainted = true
            StorgeManager.getInstance().savePaintedModel(this.storgeName)
            this.node.children.forEach(element => {
                if (element.getComponent(ColliderComponent)) {
                    element.getComponent(ColliderComponent).enabled = false
                }
            })
            this.recoverMat()
            console.info("进来执行了Paint")
            if (this.isPromoty) this.stopPromoty()
            return true
        }
    }

    promoty() {
        if (this.isPainted) return false
        this.isPromoty = true
        let modelComt = this.node.children[0].getComponent(ModelComponent)
        let size = Vec3.distance(modelComt.mesh.maxPosition, modelComt.mesh.minPosition)
        modelComt.getComponent(BaseMatOperate).promoty(size)
        this.node.children[0].layer = 524288
        return true
    }

    stopPromoty() {
        this.node.children[0].layer = 1821900799
        find("GameManagers").emit("StopPromoty")
    }

    getTouchByPos(posX: number, posY: number) {
        if (this.isPainted) {
            return 99999
        }
        let minDis = 99999
        for (let i = 0; i < this.node.children.length; i++) {
            let node = this.node.children[i]
            let nodePoint = node.getComponent(ModelComponent).model.worldBounds.center
            let cameraComt = find("Canvas").getComponent(GameScene).mainCamera
            let nodeScreenPoint = cameraComt.worldToScreen(nodePoint)
            let size = Vec3.distance(node.getComponent(ModelComponent).mesh.maxPosition, node.getComponent(ModelComponent).mesh.minPosition) * Math.abs(node.getScale().x) * Math.abs(node.parent.getScale().x)
            if (size < 0.06) {
                let dis = Vec2.distance(new Vec2(posX, posY), new Vec2(nodeScreenPoint.x, nodeScreenPoint.y))
                let touchRange = size * 708 + (-333 * size + 30)
                if (dis < touchRange) {
                    if (dis < minDis) {
                        minDis = dis
                    }
                }
            }
        }
        return minDis
    }

    getAllToucherByPos(posX: number, posY: number): Node {
        if (this.isPainted) {
            return null
        }
        for (let i = 0; i < this.node.children.length; i++) {
            let node = this.node.children[i]
            let nodePoint = node.getComponent(ModelComponent).model.worldBounds.center
            let cameraComt = find("Canvas").getComponent("GameScene").mainCamera
            let nodeScreenPoint = cameraComt.worldToScreen(nodePoint)
            let size = Vec3.distance(node.getComponent(ModelComponent).mesh.maxPosition, node.getComponent(ModelComponent).mesh.minPosition) * Math.abs(node.getScale().x) * Math.abs(node.parent.getScale().x)
            if (size < 0.06) {
                let dis = Vec2.distance(new Vec2(posX, posY), new Vec2(nodeScreenPoint.x, nodeScreenPoint.y))
                let touchRange = size * 708 + (-333 * size + 30)
                if (dis < touchRange) {
                    return node
                }
            }
        }
        return null
    }

    getNodeByRange(hitPoint) {
        if (this.isPainted) {
            return false
        }
        for (let i = 0; i < this.node.children.length; i++) {
            let node = this.node.children[i]
            let nodePoint = node.getComponent(ModelComponent).model.worldBounds.center
            //let cameraComt = find("Canvas").getComponent("GameScene").mainCamera
            //let nodeScreenPoint = cameraComt.worldToScreen(nodePoint)
            let dis = Vec3.distance(nodePoint, hitPoint)
            let touchRange = 15
            if (dis < touchRange) {
                return true
            }
        }
        return false
    }

    setMoveMode() {
        if (this.isPainted) return
        for (let i = 0; i < this.node.children.length; i++) {
            let node = this.node.children[i]
            let size = Vec3.distance(node.getComponent(ModelComponent).mesh.maxPosition, node.getComponent(ModelComponent).mesh.minPosition) * Math.abs(node.getScale().x) * Math.abs(node.parent.getScale().x)
            if (size >= 0.06) {
                let collider = node.getComponent(ColliderComponent)
                if (collider) {
                    collider.enabled = true
                }
                else {
                    node.addComponent(MeshColliderComponent).mesh = node.getComponent(ModelComponent).mesh
                }
            }
        }
        this.node.children.forEach(element => {
            element.getComponent(BaseMatOperate).paintingMat(this.paintMatMoveX, this.paintMatMoveY, this.Hue)
        })
    }

    getWorldPos() {
        let nodePoint = this.node.children[0].getComponent(ModelComponent).model.worldBounds.center
        return nodePoint
    }
}
