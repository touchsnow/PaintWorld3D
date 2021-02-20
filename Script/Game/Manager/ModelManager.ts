import { _decorator, Component, Node, instantiate, loader, Vec3, find, ModelComponent } from 'cc';
import { PaintWorldModel } from '../../Data/PaintWorldModel';
import { LevelManager } from './LevelManager';
const { ccclass, property } = _decorator;

@ccclass('ModelManager')
export class ModelManager extends Component {

    /**模型的根节点 */
    public modelRoot: Node
    /**广告牌根节点 */
    public boardRoot: Node = null
    /**选择中的模型Index */
    public sellectIndexList: number[] = []
    /**游戏管理器 */
    private myManager: Node = null

    start() {
        this.myManager = find("GameManagers")
        this.modelRoot = find("ModelPoint").getChildByPath(LevelManager.getInstance().levelName + "/RootNode")
        this.boardRoot = find("ModelPoint").getChildByName("BoardPoint")
    }

    /**切换被涂模型 */
    switchModel(indexList: []) {
        if (this.sellectIndexList.length !== 0) {
            this.sellectIndexList.forEach(element => {
                this.modelRoot.children[element].emit('CancelSellect')
            })
        }
        indexList.forEach(element => {
            this.modelRoot.children[element].emit('Sellect')
        })
        this.sellectIndexList = indexList
    }

    /**生成广告牌 */
    inistantBorad(index: number, boardNum: number, gary: number) {
        let board = instantiate(loader.getRes("Other/Num")) as Node
        let pointTarget = this.modelRoot.children[index]
        board.setParent(this.boardRoot)
        board.setWorldPosition(pointTarget.getWorldPosition())
        board.setWorldRotation(pointTarget.getWorldRotation())
        let node = new Node()
        node.setParent(board)
        node.setPosition(cc.v3(0, 0, -0.0005))
        node.setRotationFromEuler(0, 180, 0)
        board.setWorldPosition(node.getWorldPosition())
        board.setWorldRotation(node.getWorldRotation())
        node.destroy()
        for (var i = 0; i < boardNum.toString().length; i++) {
            let index = i
            let color = gary > 0.6 ? "black/" : "white/"
            let numInstantiate = instantiate(loader.getRes("Num/" + color + boardNum.toString()[index])) as Node
            numInstantiate.setParent(board.children[index])
            numInstantiate.position = Vec3.ZERO
        }
        board.setScale(pointTarget.getScale().multiplyScalar(0.0025))
    }

    /**设置对应的模型号码牌状态 */
    setBoardState(model: PaintWorldModel, state: boolean) {

        let index = this.modelRoot.children.indexOf(model.node)
        this.boardRoot.children[index].active = state
    }

    setPromoty() {
        for (let i = 0; i < this.sellectIndexList.length; i++) {
            let result = this.modelRoot.children[this.sellectIndexList[i]].getComponent(PaintWorldModel).promoty()
            if (result) {
                let promotyNode = this.modelRoot.children[this.sellectIndexList[i]].children[0]
                return promotyNode.getComponent(ModelComponent).model.worldBounds.center
            }
        }
    }

    getTouchNodeByPos(posX: number, posY: number): Node {
        let minDis = 99999
        let node = null
        for (let i = 0; i < this.sellectIndexList.length; i++) {
            let indexNode = this.modelRoot.children[this.sellectIndexList[i]]
            if (indexNode) {
                let result = indexNode.getComponent(PaintWorldModel).getTouchByPos(posX, posY)
                if (result < minDis) {
                    minDis = result
                    node = this.modelRoot.children[this.sellectIndexList[i]]
                }
            }
        }
        if (minDis !== 99999) {
            return node
        }
        else {
            return null
        }
    }

    getAllTouchNodeByPos(posX: number, posY: number): Node {
        let minDis = 99999
        let node = null
        for (let i = 0; i < this.modelRoot.children.length; i++) {

            let result = this.modelRoot.children[i].getComponent(PaintWorldModel).getTouchByPos(posX, posY)
            if (result < minDis) {
                minDis = result
                node = this.modelRoot.children[i]
            }
        }
        if (minDis !== 99999) {
            return node
        }
        else {
            return null
        }
    }

    getRangeNode(hitPoint) {
        let node = []
        for (let i = 0; i < this.modelRoot.children.length; i++) {
            let result = this.modelRoot.children[i].getComponent(PaintWorldModel).getNodeByRange(hitPoint)
            if (result) {
                node.push(this.modelRoot.children[i])
            }
        }
        var len = node.length;
        for (var i = 0; i < len - 1; i++) {
            for (var j = 0; j < len - 1 - i; j++) {
                let dis1 = Vec3.distance(hitPoint, node[j].getWorldPosition())
                let dis2 = Vec3.distance(hitPoint, node[j + 1].getWorldPosition())
                if (dis1 > dis2) {
                    var temp = node[j + 1];
                    node[j + 1] = node[j];
                    node[j] = temp;
                }
            }
        }
        return node
    }

    setMoveMode() {
        for (let i = 0; i < this.modelRoot.children.length; i++) {
            let model = this.modelRoot.children[i].getComponent(PaintWorldModel)
            model.cancelSellect()
            model.setMoveMode()
        }
    }

    setNormalMode() {
        for (let i = 0; i < this.modelRoot.children.length; i++) {
            this.modelRoot.children[i].getComponent(PaintWorldModel).cancelSellect()
        }
    }

    setBoomMode() {
        for (let i = 0; i < this.modelRoot.children.length; i++) {
            this.modelRoot.children[i].getComponent(PaintWorldModel).setBoomMode()
        }
    }
}
