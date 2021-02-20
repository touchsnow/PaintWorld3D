import { _decorator, Component, Node, Vec3, CameraComponent, find } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FullScreenParticleMotion')
export class FullScreenParticleMotion extends Component {
    //动作完成的回调
    callback: any = null
    //开始位置
    startPos: Vec3 = new Vec3()
    //结束位置
    endPos: Vec3 = new Vec3()
    //运动节点
    moveNode: Node = null
    //开始的随机方向X
    dirtX: number = 0
    //开始的随机方向Y
    ditrY: number = 0
    //开始的移动速度
    startMoveScale: number = 0
    //目标位置的移动速度
    targetMoveScale: number = 0
    //目标位置的方向
    targetDirt: Vec3 = new Vec3()
    //要移动到的点
    movePos: Vec3 = new Vec3()

    scale: Vec3 = new Vec3()

    camera: CameraComponent = null

    moveTime: number = 0

    canvas: Node = null

    updateFlag: boolean = true

    start() {
        this.node.setWorldPosition(this.startPos)
        let random = Math.random() * 2 - 1
        if (random >= 0) {
            this.dirtX = 0
            this.ditrY = 1
        }
        else {
            this.dirtX = 0
            this.ditrY = -1
        }
        this.startMoveScale = 20
        this.camera = find("ModelPoint/RotatePoint/Camera").getComponent(CameraComponent)
        this.scale = this.node.getWorldScale()
        this.canvas = find("Canvas")
    }

    update(dt) {
        if (!this.updateFlag) return
        this.moveTime += dt * 30
        this.node.setWorldScale(this.scale.x - this.moveTime, this.scale.y - this.moveTime, this.scale.z - this.moveTime)
        this.startMoveScale -= dt * 20
        this.targetMoveScale += dt * 40
        let endUIPos = this.camera.convertToUINode(this.endPos, this.node.parent)
        this.targetDirt = endUIPos.clone().subtract(this.node.getPosition())
        this.movePos = this.node.position.add(new Vec3(this.dirtX, this.ditrY, 0).normalize().multiplyScalar(this.startMoveScale).add(this.targetDirt.normalize().multiplyScalar(this.targetMoveScale)))
        this.node.setPosition(this.movePos)
        if (Vec3.distance(endUIPos, this.node.position) <= 20 || this.moveTime >= 4 * 30) {
            this.updateFlag = false
            if (this.callback) {
                this.callback()
            }
            this.node.getChildByName("Bomb_Glow").active = true
            this.scheduleOnce(() => {
                this.node.destroy()
            },1)
        }
    }

    init(node: Node, startPos: Vec3, endPos: Vec3, callback) {
        this.moveNode = node
        this.startPos = startPos
        this.endPos = endPos
        this.callback = callback
    }

}
