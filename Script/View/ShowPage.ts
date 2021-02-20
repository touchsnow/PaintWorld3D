import { _decorator, Component, Node, textureUtil, LabelComponent, find, Vec3, Vec2, Quat, Enum, CCInteger, WidgetComponent } from 'cc';
import { MainSceneBasePage } from '../../FrameworkModelPuzzle/MainSceneBasePage';
const { ccclass, property } = _decorator;

@ccclass('ShowPage')
export class ShowPage extends MainSceneBasePage {
    protected v2_1 = new Vec2()
    protected v2_2 = new Vec2()
    protected qt_1 = new Quat()
    @property({
        type: Node,
        displayName: '模型根节点',
        tooltip: '旋转模型的节点'

    })
    rotateAxis: Node = null

    @property({
        type: CCInteger,
        displayName: '滑动速度',
        tooltip: '滑动时模型的旋转速度'

    })
    rotateSpeed = 10;

    @property(Node)
    backButton: Node = null

    @property(Node)
    topNode: Node = null

    @property(Node)
    buttomNode: Node = null

    @property(Node)
    buttonNode: Node = null

    /**上一个显示的页面 */
    lastPage: MainSceneBasePage = null
    /**顶部节点原始位置 */
    topNodeOriPos: Vec3 = new Vec3()
    /**底部节点原始位置 */
    buttomNodeOriPos: Vec3 = new Vec3()
    /**按钮节点位置 */
    buttonNodeOriPos: Vec3 = new Vec3()

    start() {
        this.backButton.on(Node.EventType.TOUCH_END, this.setDisAble, this)
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this)
        this.scheduleOnce(() => {
            this.topNodeOriPos = this.topNode.getPosition()
            this.buttomNodeOriPos = this.buttomNode.getPosition()
            this.buttonNodeOriPos = this.buttonNode.getPosition()
            // this.topNode.getComponent(WidgetComponent).destroy()
            // this.buttomNode.getComponent(WidgetComponent).destroy()
            // this.buttonNode.getComponent(WidgetComponent).destroy()
            this.setDisAble()
        }, 0)
    }

    setDisAble(...args: any) {
        this.node.active = false
        let hero = this.selfButton.getChildByName("Hero")
        this.selfButton.getChildByName("Label").getComponent(LabelComponent).color = cc.color(0, 0, 0)
        cc.tween(hero)
            .to(0.5, { scale: cc.v3(0, 0, 0) }, { easing: "circOut" })
            .start()
        // cc.tween(this.topNode)
        //     .to(0.5, { position: this.topNodeOriPos }, { easing: "circOut" })
        //     .start()
        // cc.tween(this.buttomNode)
        //     .to(0.5, { position: this.buttomNodeOriPos }, { easing: "circOut" })
        //     .start()
        // cc.tween(this.buttonNode)
        //     .to(0.5, { position: this.buttonNodeOriPos }, { easing: "circOut" })
        //     .start()
        // if (this.lastPage) {
        //     find("Canvas").getComponent("MainScene").switchPage(this.lastPage)
        // }
    }

    setEnAble(...args: any) {
        this.node.active = true
        this.lastPage = args[0]
        let hero = this.selfButton.getChildByName("Hero")
        this.selfButton.getChildByName("Label").getComponent(LabelComponent).color = cc.color(255, 255, 255)
        cc.tween(hero)
            .to(0.5, { scale: cc.v3(1, 1, 1) }, { easing: "circOut" })
            .start()
    }

    onTouchMove(e) {
        if (e.getTouches().length === 1) {
            e.getStartLocation(this.v2_1)
            e.getDelta(this.v2_2)
            Quat.fromEuler(this.qt_1, -this.v2_2.y * this.rotateSpeed * 0.1, 0, 0)
            this.rotateAxis.rotate(this.qt_1, Node.NodeSpace.LOCAL)
            Quat.fromEuler(this.qt_1, 0, -this.v2_2.x * this.rotateSpeed * 0.1, 0)
            this.rotateAxis.rotate(this.qt_1, Node.NodeSpace.WORLD)
            if (this.rotateAxis.eulerAngles.x >= 90) {
                this.rotateAxis.setWorldRotationFromEuler(90, this.rotateAxis.eulerAngles.y, this.rotateAxis.eulerAngles.z)
            }
            if (this.rotateAxis.eulerAngles.x <= 0) {
                this.rotateAxis.setWorldRotationFromEuler(0, this.rotateAxis.eulerAngles.y, this.rotateAxis.eulerAngles.z)
            }
        }
    }
}
