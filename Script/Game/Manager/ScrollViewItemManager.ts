import { _decorator, Component, Node, Vec3, instantiate, loader, find, tween, WidgetComponent } from 'cc';
import { ScrollItem } from '../../View/ScrollItem';
import { PaintWorldModel } from '../../Data/PaintWorldModel';
import { LevelManager } from './LevelManager';
const { ccclass, property } = _decorator;

@ccclass('ScrollViewItemManager')
export class ScrollViewItemManager extends Component {

    @property(Node)
    content: Node = null

    @property(Node)
    scrollView: Node = null

    @property(Node)
    shellter: Node = null

    private sellectItem: ScrollItem = null

    private myManager: Node = null

    private scrollOriPos: Vec3 = new Vec3()

    start() {
        this.myManager = find("GameManagers")
        this.scrollView.getComponent(WidgetComponent).enabled = false
        this.scheduleOnce(() => {
            //初始化ScrollView列表
            this.initScrollView()
            //全部初始化完毕后开始恢复存档
            this.myManager.emit("RestoreArchive")
            //设置广告牌状态
            let numPoint = find("ModelPoint/BoardPoint")
            numPoint.active = LevelManager.getInstance().levelConfig.boardState
            //选中第一个模型
            if (this.content.children[0]) {
                let firstItem = this.content.children[0].getComponent(ScrollItem)
                this.sellectOneItem(firstItem)
            }
            this.scrollOriPos = this.scrollView.getPosition()
        }, 0)
    }

    /**初始化ScrollView列表 */
    initScrollView() {
        let modelRoot = find("ModelPoint/" + LevelManager.getInstance().levelName + "/RootNode")
        for (let i = 0; i < modelRoot.children.length; i++) {
            let modelInfo = modelRoot.children[i].getComponent(PaintWorldModel).modelAttr
            this.putInModel(modelInfo.garyValue.x, i, modelInfo.albedoScale)
        }
    }

    /**放进一个模型信息到Scroll的Item */
    putInModel(gary: number, index: number, albedoScale: Vec3) {
        if (Number(gary) > 0.99) {
            this.initTexItem(gary, index, albedoScale)
        }
        else {
            if (this.content.children.length === 0) {
                this.initItem(gary, index, albedoScale)
            }
            else {
                let item = this.findItem(gary)
                if (item) {
                    item.addItem(index)
                }
                else {
                    this.initItem(gary, index, albedoScale)
                }
            }
            let boardNum = this.findItem(gary).boardNum
            this.myManager.emit("InistantBorad", index, boardNum, gary)
        }

    }

    /**初始化一个Scorll的Item */
    initItem(gary: number, index: number, albedoScale: Vec3) {
        let item = instantiate(loader.getRes("Other/ScrollItem")) as Node
        let boardNum = this.content.children.length + 1
        item.getComponent(ScrollItem).init(gary, index, boardNum, albedoScale, this)
        item.setParent(this.content)
    }

    /**初始化一个Scorll的TexItem */
    initTexItem(gary: number, index: number, albedoScale: Vec3) {
        let item = instantiate(loader.getRes("Other/ScrollItem")) as Node
        let boardNum = this.content.children.length + 1
        item.getComponent(ScrollItem).init(gary, index, boardNum, albedoScale, this)
        item.setParent(this.content)
        this.myManager.emit("InistantBorad", index, boardNum, gary)
    }

    /**找到一个Scroll的Item */
    findItem(gary: number): ScrollItem {
        for (let i = 0; i < this.content.children.length; i++) {
            if (this.content.children[i].getComponent(ScrollItem).garyNum === gary) {
                return this.content.children[i].getComponent(ScrollItem)
            }
        }
        return null
    }

    /**选中一个Item */
    sellectOneItem(item: ScrollItem) {
        if (this.sellectItem === item) return
        this.myManager.emit("SwitchModel", item.modelIndexList)
        if (this.sellectItem) this.sellectItem.playCancelSellectAnim()
        this.sellectItem = item
        this.sellectItem.playSellectAnim()
    }

    /**涂色一个 */
    paint() {
        if (this.sellectItem) {
            this.sellectItem.paint()
        }
    }

    restoreArchivePaint(gary: number) {
        let item = this.findItem(gary)
        item.paint()
    }

    /**根据上一个模型的index选中下一个模型 */
    selectNextModel() {
        if (this.sellectItem !== null) {
            if (this.content.children.length === 1) {
                return
            }
            let index = this.content.children.indexOf(this.sellectItem.node)
            if (index === this.content.children.length - 1) {
                index -= 1
            }
            else {
                index += 1
            }
            this.sellectOneItem(this.content.children[index].getComponent(ScrollItem))
        }
    }

    getOneSellectModelIndex() {
        if (this.sellectItem) {
            return this.sellectItem.modelIndexList
        }
    }

    cancleSellect() {
        if (this.sellectItem) {
            this.sellectItem.playCancelSellectAnim()
            this.sellectItem = null
        }
    }

    enabledEventBlock() {
        this.shellter.active = true
    }

    disabledEventBolck() {
        this.shellter.active = false
    }

    hideItems() {
        let targetPos1 = this.scrollOriPos.clone()
        targetPos1.y += 20
        let targetPos2 = this.scrollOriPos.clone()
        targetPos2.y -= 400
        tween(this.scrollView)
            .to(0.1, { position: targetPos1 })
            .to(0.3, { position: targetPos2 })
            .start()
    }

    showItems() {
        let targetPos = this.scrollOriPos.clone()
        targetPos.y += 20
        tween(this.scrollView)
            .to(0.3, { position: targetPos })
            .to(0.1, { position: this.scrollOriPos })
            .start()
    }
}
