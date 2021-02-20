import { _decorator, Component, Node, loader, Prefab, instantiate, profiler, tween, Vec2, Vec3 } from 'cc';
import { ExbihitionItem } from '../../View/ExbihitionItem';
import { ConfigManager } from './ConfigManager';
const { ccclass, property } = _decorator;

@ccclass('SPLeftButtonManager')
export class SPLeftButtonManager extends Component {

    @property(Node)
    modelPoint: Node = null

    @property(Node)
    exhibitionButton: Node = null

    @property(Node)
    exhibitionViewContent: Node = null

    @property(Node)
    exhibitionScrollView: Node = null

    @property(Node)
    loadingShelter: Node = null

    @property(Node)
    rotatePoint: Node = null

    private scrollViewHidePos: Vec3 = new Vec3()

    private scrollViewOriPos: Vec3 = new Vec3()

    /**正在展示的模型 */
    private exhibitionSellect: ExbihitionItem = null

    start() {
        let item = loader.getRes("Other/ExhibitionItem")
        let config = ConfigManager.getInstance().mianConfig.json
        let levelArray = []
        let themeList = config["ThemeList"]
        for (let i = 0; i < themeList.length; i++) {
            for (let j = 0; j < config[themeList[i]].levelList.length; j++) {
                levelArray.push(config[themeList[i]].levelList[j])
            }
        }
        for (let i = 0; i < levelArray.length; i++) {
            let name = levelArray[i]
            let newItem = instantiate(item) as Node
            newItem.name = name
            newItem.getComponent(ExbihitionItem).manager = this
            newItem.setParent(this.exhibitionViewContent)
        }
        this.scheduleOnce(() => {
            let showingModel = this.exhibitionViewContent.children[0].getComponent(ExbihitionItem)
            showingModel.sellect()
        }, 0)
        this.exhibitionButton.on(Node.EventType.TOUCH_END, this.onExhibitionButton, this)
        this.scrollViewOriPos = this.exhibitionScrollView.getWorldPosition()
        this.scrollViewHidePos = this.scrollViewOriPos.clone()
        this.scrollViewHidePos.x += 250

        // this.hideButton.on(Node.EventType.TOUCH_END,this.hideScorllView,this)
        // this.showButton.on(Node.EventType.TOUCH_END,this.showScrollView,this)
    }

    exhibitionOnSellect(item: ExbihitionItem) {
        if (this.exhibitionSellect && this.exhibitionSellect != item) {
            this.exhibitionSellect.cancleSellect()
        }
        this.exhibitionSellect = item
        this.rotatePoint.setWorldPosition(this.exhibitionSellect.model.getWorldPosition())
        this.hideScorllView()
    }

    onExhibitionButton() {
        if (this.exhibitionScrollView.active) {
            this.exhibitionButton.setRotationFromEuler(0,0,0)
            this.hideScorllView()
        }
        else {
            this.exhibitionButton.setRotationFromEuler(0,0,180)
            this.showScrollView()
        }
    }

    hideScorllView() {
        tween(this.exhibitionScrollView)
            .to(0.5, { worldPosition: this.scrollViewHidePos }, { easing: "circInOut" })
            .call(() => {
                this.exhibitionScrollView.active = false
            })
            .start()
    }

    showScrollView() {
        tween(this.exhibitionScrollView)
            .call(() => {
                this.exhibitionScrollView.active = true
            })
            .to(0.5, { worldPosition: this.scrollViewOriPos }, { easing: "circInOut" })
            .start()
    }
}
