import { _decorator, Component, Vec3, SpriteComponent, LabelComponent, Color, Node } from 'cc';
import { ScrollViewItemManager } from '../Game/Manager/ScrollViewItemManager';
const { ccclass, property } = _decorator;

@ccclass('ScrollItem')
export class ScrollItem extends Component {

    @property(LabelComponent)
    numLabel: LabelComponent = null
    @property(SpriteComponent)
    circle: SpriteComponent = null
    @property(Node)
    texColor: Node = null

    /**ScrollItem的管理器 */
    private myManager: ScrollViewItemManager = null
    /**此Item的灰度值 */
    public garyNum: number = 0
    /**此Item的颜色 */
    private albedoColor: Vec3 = new Vec3()
    /**此Item所保存的模型位置 */
    public modelIndexList = []
    /**此item已经匹配过的数量 */
    private paintedNum: number = 0
    /**广告牌的数量 */
    public boardNum: number = 0

    private texColorFalg:boolean = false

    start() {
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this)
    }

    /**初始化 */
    init(gary: number, index: number, boardNum: number, albedoScale: Vec3, manager: ScrollViewItemManager) {
        this.myManager = manager
        this.garyNum = gary
        this.albedoColor = albedoScale
        this.paintedNum = 0
        this.boardNum = boardNum
        this.modelIndexList.push(index)
        let color = new Color(this.albedoColor.x * 255, this.albedoColor.y * 255, this.albedoColor.z * 255, 255)
        this.node.getComponent(SpriteComponent).color = color
        if (this.garyNum > 0.6) {
            this.circle.color = Color.BLACK
            this.numLabel.color = Color.BLACK
        }
        else {
            this.circle.color = Color.WHITE
            this.numLabel.color = Color.WHITE
        }

        if (Number(this.garyNum) > 0.99) {
            this.texColor.active = true
            this.texColorFalg = true
        }
        this.numLabel.string = boardNum.toString()
        // this.numLabel.enabled =false
        // this.circle.enabled = false
        // this.texColor.active = false
        // this.node.getComponent(SpriteComponent).enabled = false

    }

    update() {
        if (this.node.getWorldPosition().x < -100 || this.node.worldPosition.x > 820) {
            if (this.numLabel.enabled) {
                this.numLabel.enabled = false
                this.circle.enabled = false
                this.texColor.active = false
                this.node.getComponent(SpriteComponent).enabled = false
            }
        }
        else
        {
            if (!this.numLabel.enabled) {
                this.numLabel.enabled = true
                this.circle.enabled = true
                if(this.texColorFalg){
                    this.texColor.active = true
                }
                this.node.getComponent(SpriteComponent).enabled = true
            }
        }
    }

    /**增加模型数量 */
    addItem(index: number) {
        this.modelIndexList.push(index)
    }

    /**触摸切换模型 */
    onTouchEnd() {
        this.myManager.sellectOneItem(this)
    }

    /**涂色一个 */
    paint() {
        this.paintedNum += 1
        this.circle.fillRange = this.paintedNum / this.modelIndexList.length
        if (this.circle.fillRange >= 1) {
            this.myManager.selectNextModel()
            this.node._destroyImmediate()
        }
    }

    /**播放取消选中动画 */
    playCancelSellectAnim() {
        cc.tween(this.node)
            .to(0.1, { scale: cc.v3(1, 1, 1) })
            .start()
    }

    /**播放选中动画 */
    playSellectAnim() {
        cc.tween(this.node)
            .to(0.1, { scale: cc.v3(0.9, 0.9, 0.9) })
            .to(0.1, { scale: cc.v3(1.1, 1.1, 1.1) })
            .start()
    }
}
